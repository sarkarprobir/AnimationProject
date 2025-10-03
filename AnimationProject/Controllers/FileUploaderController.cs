using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using System.Text.RegularExpressions;
using SixLabors.ImageSharp.Formats.Gif;
using AnimationProject.Models;
using Newtonsoft.Json;
using System.Text;
using AnimationProject.Helpers;
using Microsoft.Extensions.Options;



namespace AnimationProject.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FileUploaderController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly AppSettings _appSettings;
        private readonly IHttpClientFactory _httpFactory;
        public FileUploaderController(IWebHostEnvironment env, IOptions<AppSettings> appSettings, IHttpClientFactory httpFactory)
        {
            _env = env;
            _appSettings = appSettings.Value;
            _httpFactory = httpFactory;
        }

        [HttpPost("UploadElementImage")]
        [RequestSizeLimit(20_000_000)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadElementImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return Ok(new { ok = false, error = "No file" }); // CHANGED

            // Accept only common raster formats (include .gif if you want)
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                            { ".jpg", ".jpeg", ".png", ".webp", ".gif" }; // add/remove as you need

            var ext = (Path.GetExtension(file.FileName) ?? "").ToLowerInvariant();
            if (!allowed.Contains(ext))
                return Ok(new { ok = false, error = "Unsupported format. Use JPG/PNG/WEBP" });

            // Root/dir
            var root = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
            var dir = Path.Combine(root, "dynamicimage", "element");
            Directory.CreateDirectory(dir);

            // Use ORIGINAL file base name, sanitized
            var originalBase = Path.GetFileNameWithoutExtension(file.FileName);
            var safeBase = MakeSafeFileBase(originalBase);         // e.g., "transition_1"

            // Ensure we don't overwrite: get unique names
            var mainName = GetUniqueFileName(dir, safeBase, ext);     // "transition_1.png" or "transition_1_1.png"
            var thumbName = Path.GetFileNameWithoutExtension(mainName) + "_thumb" + ext;

            var mainPath = Path.Combine(dir, mainName);
            var thumbPath = Path.Combine(dir, thumbName);

            using var img = await Image.LoadAsync(file.OpenReadStream());

            const long ONE_MB = 1_024 * 1_024;
            await SaveImageWithByteCapAsync(img, mainPath, ext, ONE_MB);

            const long TEN_KB = 10 * 1024;
            await SaveImageWithByteCapAsync(img, thumbPath, ext, TEN_KB, preferSmallThumb: true);

            var mainUrl = $"/dynamicimage/element/{mainName}";
            var thumbUrl = $"/dynamicimage/element/{thumbName}";

            // ─────────────────────────────────────────────────────────────
            // NEW: call your API to record the element metadata
            // We send main file’s size/width/height + both names
            var mainInfo = Image.Identify(mainPath); // fast metadata read
            var mainW = mainInfo?.Width ?? img.Width;
            var mainH = mainInfo?.Height ?? img.Height;
            var mainBytes = (int)Math.Min(int.MaxValue, new FileInfo(mainPath).Length);

            var request = new RequestElementDetails
            {
                CategoryId = 5,             // per your example
                CompanyUniqueId = 4,        // per your example
                ElementName = safeBase,     // readable name
                ImageSize = mainBytes,      // bytes of MAIN image
                ImageName = mainName,       // file name (e.g., "transition_1.png")
                ImageNameThumb = thumbName, // thumb file name
                ImageW = mainW,             // MAIN width
                ImageH = mainH,             // MAIN height
                Status = 1,
                ImageTag = null
            };

            try
            {
                var apiBase = _appSettings.AnimationProjectAPI; // e.g., "https://api.yourhost/"
                if (!string.IsNullOrWhiteSpace(apiBase))
                {
                    var apiUrl = $"{apiBase.TrimEnd('/')}/DesignBoard/ElementInsertFromFrontend";
                    var client = _httpFactory.CreateClient();
                    var json = JsonConvert.SerializeObject(request);
                    var httpResp = await client.PostAsync(
                        apiUrl,
                        new StringContent(json, Encoding.UTF8, "application/json"));

                    var body = await httpResp.Content.ReadAsStringAsync();
                    // Optional: log/inspect `body` if needed
                }
                else
                {
                    // Optional: log missing config
                }
            }
            catch (Exception ex)
            {
                // Optional: log ex.Message / ex.StackTrace — do not fail the upload because of bookkeeping
            }
            // ─────────────────────────────────────────────────────────────

            return Ok(new { ok = true, mainUrl, thumbUrl }); // CHANGED
        }
        private static string MakeSafeFileBase(string input)
        {
            // keep letters/digits/_-; replace whitespace with underscore
            var name = (input ?? "").Trim();
            if (name.Length == 0) name = "image";

            name = Regex.Replace(name, @"\s+", "_");
            name = Regex.Replace(name, @"[^A-Za-z0-9_\-]+", ""); // strip anything else

            // Remove leading/trailing separators, clamp length
            name = name.Trim('_', '-');
            if (string.IsNullOrWhiteSpace(name)) name = "image";
            if (name.Length > 80) name = name.Substring(0, 80);
            return name;
        }

        private static string GetUniqueFileName(string dir, string baseName, string ext)
        {
            var candidate = baseName + ext;
            int i = 1;
            while (System.IO.File.Exists(Path.Combine(dir, candidate)))
            {
                candidate = $"{baseName}_{i}{ext}";
                i++;
                if (i > 10_000) // safety
                {
                    candidate = $"{baseName}_{Guid.NewGuid():N}{ext}";
                    break;
                }
            }
            return candidate;
        }

        /// <summary>
        /// Saves an image ensuring the file is ≤ maxBytes while keeping the original extension.
        /// Strategy:
        ///  - Try current size/encoder first.
        ///  - If too big:
        ///     * For JPEG/WEBP: binary search on quality, then progressively downscale.
        ///     * For PNG: palette quantization (if RGBA), CompressionLevel 9, then progressively downscale.
        /// </summary>
        private static async Task SaveImageWithByteCapAsync(
     Image image,
     string outPath,
     string ext,
     long maxBytes,
     bool preferSmallThumb = false)
        {
            // No-op clone works for Image and Image<TPixel>
            using var work = image.Clone(ctx => { });

            // Optional: for tiny thumbs, make GIF static (first frame) to hit 10 KB easier
            if (preferSmallThumb && ext.Equals(".gif", StringComparison.OrdinalIgnoreCase) && work.Frames.Count > 1)
            {
                for (int f = work.Frames.Count - 1; f >= 1; f--) work.Frames.RemoveFrame(f);
            }

            double scale = 1.0;
            int attempts = 0;

            while (true)
            {
                attempts++;

                using var ms = new MemoryStream();
                await EncodeAsync(work, ms, ext, qualityHint: null, preferSmallThumb);
                if (ms.Length <= maxBytes)
                {
                    ms.Position = 0;
                    using var fs = System.IO.File.Create(outPath);
                    await ms.CopyToAsync(fs);
                    return;
                }

                // Lossy formats: try quality search first
                if (IsLossy(ext))
                {
                    int lo = preferSmallThumb ? 10 : 30;
                    int hi = 90;
                    byte[]? bestBuf = null;

                    while (lo <= hi)
                    {
                        int mid = (lo + hi) / 2;
                        using var msQ = new MemoryStream();
                        await EncodeAsync(work, msQ, ext, qualityHint: mid, preferSmallThumb);
                        if (msQ.Length <= maxBytes)
                        {
                            bestBuf = msQ.ToArray();
                            hi = mid - 1;
                        }
                        else
                        {
                            lo = mid + 1;
                        }
                    }

                    if (bestBuf != null)
                    {
                        await System.IO.File.WriteAllBytesAsync(outPath, bestBuf);
                        return;
                    }
                }

                // Still too big → downscale
                scale *= preferSmallThumb ? 0.75 : 0.85;
                if (scale < 0.05) scale = 0.05;

                int newW = Math.Max(1, (int)Math.Round(image.Width * scale));
                int newH = Math.Max(1, (int)Math.Round(image.Height * scale));
                work.Mutate(ctx => ctx.Resize(newW, newH));

                if (attempts > 10 && preferSmallThumb)
                {
                    work.Mutate(ctx => ctx.Resize(Math.Max(1, image.Width / 20), Math.Max(1, image.Height / 20)));
                }
                else if (attempts > 10)
                {
                    work.Mutate(ctx => ctx.Resize(Math.Max(1, image.Width / 4), Math.Max(1, image.Height / 4)));
                }
            }
        }

        private static bool IsLossy(string ext)
            => ext.Equals(".jpg", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".jpeg", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".webp", StringComparison.OrdinalIgnoreCase);

        private static async Task EncodeAsync(Image img, Stream output, string ext, int? qualityHint, bool preferSmallThumb)
        {
            if (ext.Equals(".jpg", StringComparison.OrdinalIgnoreCase) || ext.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
            {
                var q = Clamp(qualityHint ?? (preferSmallThumb ? 45 : 80), 10, 95);
                await img.SaveAsync(output, new JpegEncoder { Quality = q });
                return;
            }

            if (ext.Equals(".webp", StringComparison.OrdinalIgnoreCase))
            {
                var q = Clamp(qualityHint ?? (preferSmallThumb ? 45 : 80), 10, 95);
                await img.SaveAsync(output, new WebpEncoder { Quality = q, FileFormat = WebpFileFormatType.Lossy });
                return;
            }

            if (ext.Equals(".gif", StringComparison.OrdinalIgnoreCase))
            {
                await img.SaveAsync(output, new GifEncoder());
                return;
            }

            // PNG default
            await img.SaveAsync(output, new PngEncoder { CompressionLevel = PngCompressionLevel.Level9 });
        }

        private static int Clamp(int v, int lo, int hi) => Math.Max(lo, Math.Min(hi, v));

    }
}
