using AnimationProject.Helpers;
using AnimationProject.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AnimationProject.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        private readonly AppSettings _appSettings;
        public VideoController(IWebHostEnvironment env, IOptions<AppSettings> appSettings)
        {
            _env = env;
            _appSettings = appSettings.Value;
        }

        [HttpPost("save-video")]
        public async Task<IActionResult> SaveVideo([FromForm] IFormFile video, [FromForm] string folderId)
        {
            if (video == null || video.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var baseFolder = Path.Combine(_env.WebRootPath, "SlideVideo");
            if (!Directory.Exists(baseFolder))
            {
                Directory.CreateDirectory(baseFolder);
            }

            string targetFolder;
            if (!string.IsNullOrEmpty(folderId) && folderId != "new")
            {
                targetFolder = Path.Combine(baseFolder, folderId);
                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }
            }
            else
            {
                var uniqueFolderName = Guid.NewGuid().ToString();
                targetFolder = Path.Combine(baseFolder, uniqueFolderName);
                folderId = null;
                Directory.CreateDirectory(targetFolder);
            }

            // ✅ DELETE ALL EXISTING MP4 FILES BEFORE SAVING A NEW ONE
            try
            {
                var existingFiles = Directory.GetFiles(targetFolder, "*.mp4");
                foreach (var file in existingFiles)
                {
                    System.IO.File.Delete(file);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting old file: {ex.Message}");
            }

            // ✅ Use a fixed filename to overwrite the previous file
            var fileName = "animation.mp4";
            var filePath = Path.Combine(targetFolder, fileName);

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await video.CopyToAsync(stream);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error writing file: {ex.Message}");
            }

            // ✅ Force cache refresh in response
            var folderName = !string.IsNullOrEmpty(folderId) ? folderId : Path.GetFileName(targetFolder);
            var relativeFilePath = $"/SlideVideo/{folderName}/{fileName}?nocache={Guid.NewGuid()}";

            return Ok(new
            {
                message = "Video saved successfully",
                fileName = fileName,
                folder = folderName,
                filePath = relativeFilePath
            });
        }
        [HttpPost("save-Large-video")]
        [HttpPost]
        public async Task<IActionResult> SaveLargeVideo([FromForm] IFormFile video, [FromForm] string folderId)
        {
            if (video == null || video.Length == 0)
                return BadRequest("No file uploaded.");

            // Read config
            var physicalRoot = (_appSettings.PhysicalPath ?? "").Trim().TrimEnd('\\', '/'); // e.g. "Z:" or "\\ANIBOARD-WEB\ShareRoot"
            if (string.IsNullOrWhiteSpace(physicalRoot))
                return StatusCode(500, "AppSettings:PhysicalPath not configured.");

            // We want: Z:\SlideLargeVideo\<folderId or newGuid>\animation.mp4
            var baseFolder = Path.Combine(physicalRoot, "SlideLargeVideo");
            Directory.CreateDirectory(baseFolder);

            string targetFolder;
            string finalFolderId;

            if (!string.IsNullOrWhiteSpace(folderId) && !folderId.Equals("new", StringComparison.OrdinalIgnoreCase))
            {
                finalFolderId = folderId.Trim();
                targetFolder = Path.Combine(baseFolder, finalFolderId);
                Directory.CreateDirectory(targetFolder);
            }
            else
            {
                finalFolderId = Guid.NewGuid().ToString();
                targetFolder = Path.Combine(baseFolder, finalFolderId);
                Directory.CreateDirectory(targetFolder);
            }

            // Remove any previous .mp4
            try
            {
                foreach (var f in Directory.EnumerateFiles(targetFolder, "*.mp4"))
                    System.IO.File.Delete(f);
            }
            catch (Exception ex)
            {
                // not fatal
                Console.WriteLine("Delete old mp4 failed: " + ex.Message);
            }

            var fileName = "animation.mp4";
            var filePath = Path.Combine(targetFolder, fileName);

            try
            {
                // FileShare.Read lets the player start reading while you still have the file open elsewhere
                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.Read))
                {
                    await video.CopyToAsync(stream);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error writing file: {ex.Message}");
            }

            // Optional: wait until the file becomes readable/non-locked
            int attempts = 0;
            while (!IsFileReady(filePath) && attempts++ < 40) // ~20s
                await Task.Delay(500);

            // Build the browser URL that maps via your StaticFiles/IIS VDir
            var webPath = (_appSettings.WebPath ?? "/SlideLargeVideo").TrimEnd('/'); // e.g. "/SlideLargeVideo"
            var relativeUrl = $"{webPath}/{Uri.EscapeDataString(finalFolderId)}/{fileName}?nocache={Guid.NewGuid()}";

            return Ok(new
            {
                message = "Video saved successfully",
                fileName,
                folder = finalFolderId,
                filePath = relativeUrl       // send this to the <source src=...>
            });
        }



        public async Task<IActionResult> SaveLargeVideoOLD([FromForm] IFormFile video, [FromForm] string folderId)
        {
            if (video == null || video.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var baseFolder = Path.Combine(_env.WebRootPath, "SlideLargeVideo");
            if (!Directory.Exists(baseFolder))
            {
                Directory.CreateDirectory(baseFolder);
            }

            string targetFolder;
            if (!string.IsNullOrEmpty(folderId) && folderId != "new")
            {
                targetFolder = Path.Combine(baseFolder, folderId);
                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }
            }
            else
            {
                var uniqueFolderName = Guid.NewGuid().ToString();
                targetFolder = Path.Combine(baseFolder, uniqueFolderName);
                folderId = null;
                Directory.CreateDirectory(targetFolder);
            }

            // ✅ DELETE ALL EXISTING MP4 FILES BEFORE SAVING A NEW ONE
            try
            {
                var existingFiles = Directory.GetFiles(targetFolder, "*.mp4");
                foreach (var file in existingFiles)
                {
                    System.IO.File.Delete(file);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting old file: {ex.Message}");
            }

            // ✅ Use a fixed filename to overwrite the previous file
            var fileName = "animation.mp4";
            var filePath = Path.Combine(targetFolder, fileName);

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await video.CopyToAsync(stream);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error writing file: {ex.Message}");
            }

            // ✅ Force cache refresh in response
            var folderName = !string.IsNullOrEmpty(folderId) ? folderId : Path.GetFileName(targetFolder);
            var relativeFilePath = $"/SlideLargeVideo/{folderName}/{fileName}?nocache={Guid.NewGuid()}";



            // Wait until the file is accessible (with a maximum wait time if needed)
            int maxAttempts = 60;  // e.g., 60 attempts * 500ms = 30 seconds max
            int attempts = 0;
            while (!IsFileReady(filePath) && attempts < maxAttempts)
            {
                await Task.Delay(500);  // Wait 500ms
                attempts++;
            }

            //if (attempts >= maxAttempts)
            //{
            //    // Optionally handle the case when the file is still not ready.
            //    Console.WriteLine("Warning: File is not accessible after waiting.");
            //}

            return Ok(new
            {
                message = "Video saved successfully",
                fileName = fileName,
                folder = folderName,
                filePath = relativeFilePath
            });
        }
        // Helper method to check if a file is ready (not locked)
        private bool IsFileReady(string filePath)
        {
            try
            {
                // Attempt to open the file exclusively.
                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.None))
                {
                    return true;
                }
            }
            catch (IOException)
            {
                return false;
            }
        }

        [HttpPost("save-image")]
        public async Task<IActionResult> SaveImage([FromForm] IFormFile image, [FromForm] string folderId)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var baseFolder = Path.Combine(_env.WebRootPath, "SlideImage");
            if (!Directory.Exists(baseFolder))
            {
                Directory.CreateDirectory(baseFolder);
            }

            string targetFolder;
            if (!string.IsNullOrEmpty(folderId) && folderId != "new")
            {
                targetFolder = Path.Combine(baseFolder, folderId);
                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }
            }
            else
            {
                var uniqueFolderName = Guid.NewGuid().ToString();
                targetFolder = Path.Combine(baseFolder, uniqueFolderName);
                folderId = null;
                Directory.CreateDirectory(targetFolder);
            }

            // ✅ DELETE ALL EXISTING MP4 FILES BEFORE SAVING A NEW ONE
            try
            {
                var existingFiles = Directory.GetFiles(targetFolder, "*.png");
                foreach (var file in existingFiles)
                {
                    System.IO.File.Delete(file);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting old file: {ex.Message}");
            }

            // ✅ Use a fixed filename to overwrite the previous file
            var fileName = "canvas.png";
            var filePath = Path.Combine(targetFolder, fileName);

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await image.CopyToAsync(stream);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error writing file: {ex.Message}");
            }

            // ✅ Force cache refresh in response
            var folderName = !string.IsNullOrEmpty(folderId) ? folderId : Path.GetFileName(targetFolder);
            var relativeFilePath = $"/SlideImage/{folderName}/{fileName}?nocache={Guid.NewGuid()}";

            return Ok(new
            {
                message = "image saved successfully",
                fileName = fileName,
                folder = folderName,
                filePath = relativeFilePath
            });
        }


        // ============================
        // 1) CHUNK UPLOAD ENDPOINT
        // ============================
        // POST /video/save-Large-video-chunk
        // form-data: chunk=<file>, fileId=<client guid>, index=<0..>, total=<N>, folderId=<new|existingId>
        [HttpPost("save-Large-video-chunk")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        public async Task<IActionResult> SaveLargeVideoChunk(
            [FromForm] IFormFile chunk,
            [FromForm] string fileId,
            [FromForm] int index,
            [FromForm] int total,
            [FromForm] string? folderId // not used here; passed again to finalize
        )
        {
            if (chunk == null || chunk.Length == 0) return BadRequest("No chunk uploaded.");
            if (string.IsNullOrWhiteSpace(fileId)) return BadRequest("fileId is required.");
            if (index < 0 || total <= 0 || index >= total) return BadRequest("Invalid index/total.");

            var physicalRoot = (_appSettings.PhysicalPath ?? "").Trim().TrimEnd('\\', '/');
            if (string.IsNullOrWhiteSpace(physicalRoot))
                return StatusCode(500, "AppSettings:PhysicalPath not configured.");

            // ...\SlideLargeVideo\_chunks\<fileId>\
            var baseFolder = Path.Combine(physicalRoot, "SlideLargeVideo");
            var chunksRoot = Path.Combine(baseFolder, "_chunks", Sanitize(fileId));
            Directory.CreateDirectory(chunksRoot);

            var partPath = Path.Combine(chunksRoot, $"part_{index:D7}");

            try
            {
                await using var fs = System.IO.File.Create(partPath);
                await chunk.CopyToAsync(fs); // stream straight to disk
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error writing chunk: {ex.Message}");
            }

            return Ok(new { ok = true, fileId, index, total });
        }

        // ============================
        // 2) FINALIZE/STITCH ENDPOINT
        // ============================
        // POST /video/finish-Large-video
        // JSON: { "fileId":"...", "folderId":"new" | "<existingId>" }
        public class FinishDto
        {
            public string FileId { get; set; } = "";
            public string? FolderId { get; set; }
        }

        [HttpPost("finish-Large-video")]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> FinishLargeVideo([FromBody] FinishDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.FileId))
                return BadRequest("fileId is required.");

            var physicalRoot = (_appSettings.PhysicalPath ?? "").Trim().TrimEnd('\\', '/');
            if (string.IsNullOrWhiteSpace(physicalRoot))
                return StatusCode(500, "AppSettings:PhysicalPath not configured.");

            var baseFolder = Path.Combine(physicalRoot, "SlideLargeVideo");
            Directory.CreateDirectory(baseFolder);

            var fileId = Sanitize(dto.FileId);
            var chunksRoot = Path.Combine(baseFolder, "_chunks", fileId);
            if (!Directory.Exists(chunksRoot))
                return BadRequest("Chunks not found for the given fileId.");

            // Intended publish folder (if locked on replace, we’ll fall back to a new GUID)
            var intendedFolderId =
                (!string.IsNullOrWhiteSpace(dto.FolderId) && !dto.FolderId.Equals("new", StringComparison.OrdinalIgnoreCase))
                ? Sanitize(dto.FolderId!)
                : Guid.NewGuid().ToString();

            var intendedFolder = Path.Combine(baseFolder, intendedFolderId);
            Directory.CreateDirectory(intendedFolder);

            var parts = Directory.GetFiles(chunksRoot, "part_*")
                                 .OrderBy(p => p, StringComparer.Ordinal)
                                 .ToArray();
            if (parts.Length == 0) return BadRequest("No chunks to stitch.");

            const string finalName = "animation.mp4";
            var finalPath = Path.Combine(intendedFolder, finalName);

            // 1) Stitch into a temp file first (avoid conflicts with readers of animation.mp4)
            var tempPath = Path.Combine(intendedFolder, $"animation_{Guid.NewGuid():N}.tmp");
            try
            {
                await using var outStream = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.Read);
                foreach (var part in parts)
                {
                    await using var inStream = System.IO.File.OpenRead(part);
                    await inStream.CopyToAsync(outStream);
                }
            }
            catch (Exception ex)
            {
                TryDeleteQuiet(tempPath);
                return StatusCode(500, $"Error stitching to temp file: {ex.Message}");
            }

            // 2) Try to atomically swap into place; if locked, publish in a brand-new folder
            bool replaced = false;
            string publishedFolderId = intendedFolderId;
            try
            {
                if (System.IO.File.Exists(finalPath))
                    System.IO.File.Replace(tempPath, finalPath, destinationBackupFileName: null);
                else
                    System.IO.File.Move(tempPath, finalPath);
                replaced = true;
            }
            catch
            {
                // fallback: publish to a new folder to avoid lock contention
                publishedFolderId = Guid.NewGuid().ToString();
                var fallbackFolder = Path.Combine(baseFolder, publishedFolderId);
                Directory.CreateDirectory(fallbackFolder);
                var fallbackPath = Path.Combine(fallbackFolder, finalName);

                try
                {
                    if (System.IO.File.Exists(tempPath))
                        System.IO.File.Move(tempPath, fallbackPath);
                    else
                    {
                        // extremely rare: if Replace consumed temp, re-stitch
                        await using var outStream = new FileStream(fallbackPath, FileMode.Create, FileAccess.Write, FileShare.Read);
                        foreach (var part in parts)
                        {
                            await using var inStream = System.IO.File.OpenRead(part);
                            await inStream.CopyToAsync(outStream);
                        }
                    }
                }
                catch (Exception ex)
                {
                    TryDeleteQuiet(tempPath);
                    return StatusCode(500, $"Error writing fallback file: {ex.Message}");
                }
            }

            // 3) Cleanup chunks (+ temp if still there)
            TryDeleteQuiet(tempPath);
            TryDeleteDirectoryQuiet(chunksRoot);

            // Optional: if replaced, prune any stray .mp4 in the intended folder
            if (replaced)
            {
                try
                {
                    foreach (var f in Directory.EnumerateFiles(intendedFolder, "*.mp4"))
                        if (!Path.GetFileName(f).Equals(finalName, StringComparison.OrdinalIgnoreCase))
                            System.IO.File.Delete(f);
                }
                catch { /* ignore */ }
            }

            // URL for client
            var webPath = (_appSettings.WebPath ?? "/SlideLargeVideo").TrimEnd('/');
            var relativeUrl = $"{webPath}/{Uri.EscapeDataString(publishedFolderId)}/{finalName}?nocache={Guid.NewGuid()}";

            return Ok(new
            {
                message = replaced
                    ? "Video saved successfully (replaced existing file)."
                    : "Video saved successfully (published in a new folder due to file lock).",
                fileName = finalName,
                folder = publishedFolderId,
                filePath = relativeUrl
            });
        }

        // ============================
        // Helpers
        // ============================
        private static string Sanitize(string input)
        {
            var safe = Regex.Replace(input ?? "", @"[^A-Za-z0-9_\-]", "");
            return string.IsNullOrWhiteSpace(safe) ? Guid.NewGuid().ToString() : safe;
        }

        private static void TryDeleteQuiet(string path)
        {
            try { if (!string.IsNullOrEmpty(path) && System.IO.File.Exists(path)) System.IO.File.Delete(path); } catch { }
        }
        private static void TryDeleteDirectoryQuiet(string path)
        {
            try { if (!string.IsNullOrEmpty(path) && Directory.Exists(path)) Directory.Delete(path, true); } catch { }
        }
    }
}
