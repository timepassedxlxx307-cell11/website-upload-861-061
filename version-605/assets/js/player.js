(function () {
  function onReady(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  window.initializePlayer = function (boxId, url) {
    onReady(function () {
      var box = document.getElementById(boxId);
      if (!box || !url) {
        return;
      }
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      if (!video || !cover) {
        return;
      }
      var prepared = false;
      var canStart = false;
      var hls = null;

      function showCover() {
        cover.classList.remove("is-hidden");
      }

      function hideCover() {
        cover.classList.add("is-hidden");
      }

      function playVideo() {
        hideCover();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(showCover);
        }
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          canStart = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            canStart = true;
            if (cover.classList.contains("is-hidden")) {
              playVideo();
            }
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              try {
                hls.recoverMediaError();
              } catch (err) {
                showCover();
              }
            }
          });
          box.hlsPlayer = hls;
          return;
        }
        video.src = url;
        canStart = true;
      }

      function start() {
        prepare();
        hideCover();
        if (canStart || video.src) {
          playVideo();
        }
      }

      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", hideCover);
      video.addEventListener("ended", showCover);
    });
  };
})();
