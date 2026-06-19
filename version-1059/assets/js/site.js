(function () {
  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      body.classList.toggle('is-nav-open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (heroSlides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  function filterCards(root, query) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var normalized = String(query || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-search-text') || '').toLowerCase();
      var matched = !normalized || text.indexOf(normalized) !== -1;
      card.classList.toggle('is-filtered', !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = root.querySelector('[data-empty-state]');
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var mode = form.getAttribute('data-mode') || 'local';
    if (input && initialQuery && mode === 'local') {
      input.value = initialQuery;
      filterCards(document, initialQuery);
    }
    if (input && mode === 'local') {
      input.addEventListener('input', function () {
        filterCards(document, input.value);
      });
    }
    form.addEventListener('submit', function (event) {
      if (mode === 'redirect') {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var target = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
        window.location.href = target;
      } else {
        event.preventDefault();
        filterCards(document, input ? input.value : '');
      }
    });
  });
})();
