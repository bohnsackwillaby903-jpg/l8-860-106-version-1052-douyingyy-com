(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('[data-player-video]');
    var cover = shell.querySelector('[data-player-cover]');
    var button = shell.querySelector('[data-player-button]');
    var stream = shell.getAttribute('data-stream');
    var hls = null;

    if (!video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hls = new globalThis.Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    function start() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
