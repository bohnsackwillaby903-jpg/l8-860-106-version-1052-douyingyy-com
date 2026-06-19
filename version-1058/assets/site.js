(function () {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let active = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
  }

  function startHeroTimer() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHeroTimer();
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startHeroTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startHeroTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHeroTimer();
      });
    });
  }

  function applyInitialQuery(scope) {
    const input = scope.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    const query = new URLSearchParams(window.location.search).get('q') || '';
    if (query) {
      input.value = query;
    }
  }

  function setupFilters(scope) {
    const input = scope.querySelector('[data-filter-input]');
    const typeFilter = scope.querySelector('[data-type-filter]');
    const yearFilter = scope.querySelector('[data-year-filter]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('[data-empty-state]');

    function update() {
      const query = input ? input.value.trim().toLowerCase() : '';
      const type = typeFilter ? typeFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = card.getAttribute('data-search') || '';
        const cardType = card.getAttribute('data-type') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const matched = (!query || text.indexOf(query) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', update);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', update);
    }

    applyInitialQuery(scope);
    update();
  }

  Array.from(document.querySelectorAll('[data-filter-scope]')).forEach(setupFilters);
})();

function initMoviePlayer(source) {
  const video = document.getElementById('movieVideo');
  const cover = document.querySelector('[data-player-cover]');
  const errorBox = document.querySelector('[data-player-error]');
  let attached = false;
  let hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add('is-visible');
    }
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError('视频加载失败，请稍后再试');
        }
      });
      return;
    }

    video.src = source;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    const play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(function () {
        showError('请点击视频区域继续播放');
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
