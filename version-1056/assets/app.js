(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
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

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function filterCards(input, cards) {
        var q = normalize(input.value);
        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' '));
            card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
        });
    }

    function initFilters() {
        Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (input) {
            var scope = input.closest('main') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card-list] article'));
            input.addEventListener('input', function () {
                filterCards(input, cards);
            });
        });

        var pageInput = document.querySelector('[data-search-page-input]');
        var results = document.querySelector('[data-search-results]');
        if (pageInput && results) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            pageInput.value = q;
            var cards = Array.prototype.slice.call(results.querySelectorAll('article'));
            filterCards(pageInput, cards);
            pageInput.addEventListener('input', function () {
                filterCards(pageInput, cards);
            });
        }
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('[data-play-button]');
            var message = box.querySelector('[data-player-message]');
            if (!video) {
                return;
            }
            var src = video.getAttribute('data-video');
            var attached = false;
            var requested = false;
            var hls = null;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add('is-visible');
            }

            function attach() {
                if (attached || !src) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (requested) {
                            video.play().catch(function () {});
                        }
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('播放失败，请稍后再试');
                        }
                    });
                } else {
                    video.src = src;
                }
            }

            function play() {
                requested = true;
                attach();
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    box.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                box.classList.remove('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
            attach();
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
