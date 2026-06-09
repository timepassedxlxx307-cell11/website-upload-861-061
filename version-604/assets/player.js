(function () {
    function initMoviePlayer(videoId, buttonId, overlayId, stream) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var attached = false;

        function attach() {
            if (!video || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = stream;
            }
        }

        function start() {
            if (!video) {
                return;
            }
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", start);
        }
    }

    window.initMoviePlayer = initMoviePlayer;
})();
