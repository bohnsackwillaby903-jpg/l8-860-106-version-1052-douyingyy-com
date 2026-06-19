(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function connectVideo(video, source, onReady) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = source;
      video.addEventListener("loadedmetadata", onReady, { once: true });
      return;
    }

    video.src = source;
    onReady();
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var button = player.querySelector("[data-play-button]");
      var started = false;

      if (!video || !button) {
        return;
      }

      function startPlayback() {
        var source = video.getAttribute("data-src");

        if (!source) {
          return;
        }

        button.classList.add("is-hidden");

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;
        connectVideo(video, source, function () {
          video.play().catch(function () {});
        });
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
    });
  });
})();
