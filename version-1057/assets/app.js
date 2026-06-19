(function () {
    var hlsLoader = null;

    function getRootPrefix() {
        return '';
    }

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        if (hlsLoader) {
            hlsLoader.addEventListener('load', callback, { once: true });
            return;
        }
        hlsLoader = document.createElement('script');
        hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        hlsLoader.async = true;
        hlsLoader.addEventListener('load', callback, { once: true });
        document.head.appendChild(hlsLoader);
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeaderSearch() {
        document.querySelectorAll('[data-header-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = 'search.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-area]').forEach(function (area) {
            var input = area.querySelector('[data-filter-input]');
            var cards = Array.prototype.slice.call(area.querySelectorAll('[data-movie-card]'));
            var chips = Array.prototype.slice.call(area.querySelectorAll('[data-filter-value]'));
            var empty = area.querySelector('[data-empty]');
            var activeValue = 'all';

            function apply() {
                var term = normalize(input ? input.value : '');
                var shown = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-text'));
                    var genre = normalize(card.getAttribute('data-genre'));
                    var passTerm = !term || text.indexOf(term) !== -1;
                    var passChip = activeValue === 'all' || genre.indexOf(normalize(activeValue)) !== -1 || text.indexOf(normalize(activeValue)) !== -1;
                    var visible = passTerm && passChip;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.style.display = shown ? 'none' : 'block';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeValue = chip.getAttribute('data-filter-value') || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('[data-play-overlay]');
            var button = shell.querySelector('[data-play-button]');
            var source = shell.getAttribute('data-source');
            var initialized = false;
            var hls = null;

            if (!video || !source) {
                return;
            }

            function attachAndPlay() {
                shell.classList.add('is-playing');
                if (!initialized) {
                    initialized = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                        video.play().catch(function () {});
                    } else {
                        loadHls(function () {
                            if (window.Hls && window.Hls.isSupported()) {
                                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                                hls.loadSource(source);
                                hls.attachMedia(video);
                                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                                    video.play().catch(function () {});
                                });
                            } else {
                                video.src = source;
                                video.play().catch(function () {});
                            }
                        });
                    }
                } else {
                    video.play().catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', attachAndPlay);
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    attachAndPlay();
                });
            }
            video.addEventListener('click', function () {
                if (!initialized) {
                    attachAndPlay();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHeaderSearch();
        initHero();
        initFilters();
        initPlayers();
    });
})();
