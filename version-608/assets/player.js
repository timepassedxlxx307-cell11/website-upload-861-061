(function () {
    function initPlayer() {
        var shell = document.querySelector('[data-player]');
        var video = shell ? shell.querySelector('video') : null;
        var button = shell ? shell.querySelector('[data-play-button]') : null;
        var config = window.__CURRENT_VIDEO__ || {};
        var source = config.src;
        var hlsInstance = null;

        if (!shell || !video || !button || !source) {
            return;
        }

        function attachSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', source);
                }
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                }
                return Promise.resolve();
            }

            if (!video.getAttribute('src')) {
                video.setAttribute('src', source);
            }
            return Promise.resolve();
        }

        function playVideo() {
            shell.classList.add('is-playing');
            attachSource().then(function () {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }
})();
