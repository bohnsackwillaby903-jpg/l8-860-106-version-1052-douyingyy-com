(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function initHero() {
        var root = document.querySelector('[data-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var previous = root.querySelector('[data-carousel-prev]');
        var next = root.querySelector('[data-carousel-next]');
        if (slides.length <= 1) {
            return;
        }
        var index = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        }));
        function show(nextIndex) {
            slides[index].classList.remove('is-active');
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('is-active');
        }
        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFilters() {
        var blocks = document.querySelectorAll('[data-filter-page]');
        blocks.forEach(function (block) {
            var input = block.querySelector('[data-card-search]');
            var buttons = Array.prototype.slice.call(block.querySelectorAll('[data-type-filter]'));
            var grid = document.querySelector(block.getAttribute('data-target')) || document.querySelector('.movie-grid');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var currentType = 'all';
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var type = card.getAttribute('data-type') || '';
                    var typeMatch = currentType === 'all' || type === currentType;
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    card.hidden = !(typeMatch && keywordMatch);
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentType = button.getAttribute('data-type-filter') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll('.player-shell');
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-start');
            var streamUrl = box.getAttribute('data-stream');
            var loaded = false;
            var hls = null;
            if (!video || !streamUrl) {
                return;
            }
            function loadStream() {
                if (loaded) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                loaded = true;
            }
            function start() {
                loadStream();
                box.classList.add('is-playing');
                var playRequest = video.play();
                if (playRequest && typeof playRequest.catch === 'function') {
                    playRequest.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-play">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line">',
            '<span>' + escapeHtml(movie.year) + '</span>',
            '<span>' + escapeHtml(movie.region) + '</span>',
            '<span>' + escapeHtml(movie.type) + '</span>',
            '</div>',
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var holder = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        var form = document.querySelector('[data-search-form]');
        var movies = window.SITE_MOVIES || [];
        if (!holder || !input || !form || !movies.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function render(keyword) {
            var query = keyword.trim().toLowerCase();
            var results = movies.filter(function (movie) {
                var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                return !query || haystack.indexOf(query) !== -1;
            }).slice(0, 120);
            if (!results.length) {
                holder.innerHTML = '<div class="empty-state">没有找到匹配内容，可以尝试更换片名、年份、地区或类型关键词。</div>';
                return;
            }
            holder.innerHTML = results.map(movieCard).join('');
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
            window.history.replaceState(null, '', url);
            render(query);
        });
        input.addEventListener('input', function () {
            render(input.value);
        });
        render(initial);
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
        initSearchPage();
    });
})();
