(function () {
  function mount(options) {
    var root = document.querySelector(options.root || '.watch-frame');
    if (!root) {
      return;
    }
    var video = root.querySelector(options.video || 'video');
    var button = root.querySelector('.play-layer');
    var stream = root.getAttribute('data-stream');
    var started = false;
    if (!video || !stream) {
      return;
    }

    function begin() {
      if (started) {
        return;
      }
      started = true;
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
    root.addEventListener('click', function (event) {
      if (event.target === root) {
        begin();
      }
    });
  }

  window.MoviePlayer = {
    mount: mount
  };
})();
