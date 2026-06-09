(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var shell = document.getElementById(options.shellId);
        var loaded = false;
        var hls = null;

        if (!video || !button || !shell || !options.source) {
            return;
        }

        function bindSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(options.source);
                hls.attachMedia(video);
                return;
            }

            video.src = options.source;
        }

        function startPlayback() {
            bindSource();
            shell.classList.add("is-playing");
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        function stopPlaybackState() {
            shell.classList.remove("is-playing");
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            startPlayback();
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });

        video.addEventListener("pause", stopPlaybackState);
        video.addEventListener("ended", stopPlaybackState);

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
