
document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("miniPlayer");

    // ✅ Ensure the first frame loads and doesn't show black
    video.addEventListener("loadeddata", function () {
        video.currentTime = 0.1; // Slightly move to the first frame
    });

    // ✅ Play video on hover
    video.addEventListener("mouseenter", function () {
        video.play();
    });

    // ✅ Pause and reset when mouse leaves
    video.addEventListener("mouseleave", function () {
        video.pause();
        video.currentTime = 0.1; // Reset to first frame
    });
});
