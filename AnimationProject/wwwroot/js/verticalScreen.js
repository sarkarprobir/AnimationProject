
(() => {
    // Ensure the script is only initialized once
    if (window.hasInitializedVerticalScreen) return;
    window.hasInitializedVerticalScreen = true;

    // Global Variables for the video playlist.
    window.videoSources = [];
    window.currentVideoIndex = 0;

    // Wait for the DOM to be fully loaded.
    document.addEventListener("DOMContentLoaded", () => {
        const videoPlayer = document.getElementById("videoPlayer");

        // Sequential playback: load next video when the current one ends.
        videoPlayer.addEventListener("ended", () => {
            if (window.videoSources.length) {
                window.currentVideoIndex = (window.currentVideoIndex + 1) % window.videoSources.length;
                setVideoSource(window.videoSources[window.currentVideoIndex]);
            }
        });

        // Request full-screen on the first user click.
        const requestFullScreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(error => {
                    console.warn("Failed to enter full-screen mode: ", error);
                });
            }
            // Remove the event listener once full-screen is requested.
            document.body.removeEventListener("click", requestFullScreen);
        };
        document.body.addEventListener("click", requestFullScreen);

        // Start playlist load process.
        checkTimeAndUpdatePlaylist();

        // Initialize page refresh scheduling.
        initializeRefresh();
    });

    // Updates the video source and plays the video.
    function setVideoSource(sourceUrl) {
        const videoSourceElement = document.getElementById("videoSource");
        videoSourceElement.src = sourceUrl;
        const videoPlayer = document.getElementById("videoPlayer");
        videoPlayer.load();
        videoPlayer.play();
    }

    // Check if it's time to switch playlists, then load the updated playlist.
    function checkTimeAndUpdatePlaylist() {
        const now = new Date();
        const [startTime, endTime] = convertToTimeFormat(now.getHours(), now.getMinutes());
        const sqlFormattedDateTime = now.toISOString().replace('T', ' ').slice(0, 23);
        loadPlaylist(sqlFormattedDateTime, startTime, endTime);
    }

    // Loads the playlist via AJAX based on current time parameters.
    function loadPlaylist(sqlFormattedDateTime, startTime, endTime) {
        console.log(`Loading playlist for the time slot: ${startTime} - ${endTime}`);

        const getUrlParameter = url => {
            const segments = url.split('/').filter(segment => segment !== '');
            return segments.pop();
        };

        const currentUrl = window.location.href;
        const id = getUrlParameter(currentUrl);
        if (!id) return;

        const dataVideoPlayList = {
            PlayDate: sqlFormattedDateTime,
            PlayStartTime: startTime,
            PlayEndTime: endTime,
            CompanyUniqueId: id,
            ScreenType: 'Vertical',
            ScreenNo: 1
        };

        $.ajax({
            url: baseURL + "Canvas/LoadPlaylist",
            type: "POST",
            dataType: "json",
            data: dataVideoPlayList,
            success: playVideopath => {
                // Expecting the API to return an array of video URLs.
                window.videoSources = Array.isArray(playVideopath) ? playVideopath : [playVideopath];
                window.currentVideoIndex = 0; // Reset index
                if (window.videoSources.length) {
                    setVideoSource(window.videoSources[window.currentVideoIndex]);
                }
            },
            error: data => console.log("Error loading playlist:", data)
        });
    }

    // Converts hours and minutes to a string format.
    function convertToTimeFormat(hours, minutes) {
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const hourStartTime = `${formattedHours}:00:00`;
        const hourEndTime = `${formattedHours}:${formattedMinutes}:00`;
        return [hourStartTime, hourEndTime];
    }

   
    async function getRefreshInterval() {
        try {
            const getUrlParameter = url => {
                const segments = url.split('/').filter(segment => segment !== '');
                return segments.pop();
            };

            const currentUrl = window.location.href;
            const id = getUrlParameter(currentUrl);
            if (!id) return;
            const dataRefreshInterval = {
                CompanyUniqueId: id,
                ScreenNo: 1
            };
            // Await the AJAX call properly.
            const response = await $.ajax({
                url: baseURL + "Canvas/GetScreenRefreshInterval",
                type: "POST",
                dataType: "json",
                data: dataRefreshInterval
            });
            return response.refreshMinutes;
            //$.ajax({
            //    url: baseURL + "Canvas/GetScreenRefreshInterval",
            //    type: "POST",
            //    dataType: "json",
            //    data: dataRefreshInterval,
            //    success: function (refreshInterval) {
            //        return refreshInterval.refreshMinutes;
            //    },
            //    error: function (data) {
            //        return 200;
            //    }
            //});
        } catch (error) {
            return 200;
        }
    }

    // Schedules a refresh for the page at the next interval based on refreshIntervalMinutes.
    async function scheduleRefresh(refreshIntervalMinutes) {
        const now = new Date();
        let nextTime;

        if (refreshIntervalMinutes === 60) {
            nextTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
        } else if (refreshIntervalMinutes === 30) {
            nextTime = now.getMinutes() < 30
                ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 30)
                : new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
        } else {
            const minutes = now.getMinutes();
            const nextIntervalMark = Math.ceil(minutes / refreshIntervalMinutes) * refreshIntervalMinutes;
            nextTime = nextIntervalMark >= 60
                ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, nextIntervalMark - 60, 0)
                : new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nextIntervalMark, 0);
        }

        const timeToNextRefresh = nextTime - now;
        console.log(`Current time: ${now}`);
        console.log(`Scheduled refresh at: ${nextTime}`);
        console.log(`Refreshing in ${timeToNextRefresh} milliseconds`);

        const adjustedTimeToRefresh = timeToNextRefresh > 0 ? timeToNextRefresh : timeToNextRefresh + refreshIntervalMinutes * 60 * 1000;

        console.log(`Refreshing in ${adjustedTimeToRefresh} milliseconds`);

        setTimeout(() => {
            window.location.replace(window.location.href);
        }, adjustedTimeToRefresh);
    }

    // Initializes the refresh process.
    async function initializeRefresh() {
        const refreshIntervalMinutes = await getRefreshInterval();
        console.log('Fetched refresh interval (in minutes):', refreshIntervalMinutes);
        scheduleRefresh(refreshIntervalMinutes);
    }
})();
