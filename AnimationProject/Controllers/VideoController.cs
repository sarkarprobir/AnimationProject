﻿using AnimationProject.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace YourNamespace.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        

        public VideoController(IWebHostEnvironment env)
        {
            _env = env;
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
            if (!string.IsNullOrEmpty(folderId) && folderId !="new")
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
        public async Task<IActionResult> SaveLargeVideo([FromForm] IFormFile video, [FromForm] string folderId)
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
    }
}
