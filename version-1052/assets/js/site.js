(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function(input) {
    var targetSelector = input.getAttribute('data-filter-input');
    var scope = document.querySelector(targetSelector);
    if (!scope) {
      return;
    }
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-filter-empty="' + targetSelector + '"]');
    input.addEventListener('input', function() {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function(item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-year') || '',
          item.getAttribute('data-tags') || '',
          item.textContent || ''
        ].join(' ').toLowerCase();
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        item.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    });
  });

  window.initMoviePlayer = function(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    if (!video || !source) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function() {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
