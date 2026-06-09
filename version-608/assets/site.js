(function () {
    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

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

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase();
    }

    function createMovieCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="play-badge">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-card-meta">',
            '<span>' + escapeHtml(movie.year) + '</span>',
            '<span>' + escapeHtml(movie.region) + '</span>',
            '<span>' + escapeHtml(movie.score) + '</span>',
            '</div>',
            '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('') + '</div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var input = document.getElementById('searchInput');

        if (!results || !summary || !window.__MOVIE_SEARCH_DATA__) {
            return;
        }

        var query = getSearchQuery();

        if (input) {
            input.value = query;
        }

        var data = window.__MOVIE_SEARCH_DATA__;
        var matches = data;

        if (query) {
            var words = normalizeText(query).split(/\s+/).filter(Boolean);
            matches = data.filter(function (movie) {
                var haystack = normalizeText([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.oneLine,
                    movie.tags.join(' ')
                ].join(' '));
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            });
        } else {
            matches = data.slice(0, 36);
        }

        summary.textContent = query ? '找到 ' + matches.length + ' 部相关影片。' : '推荐展示 36 部影片，可输入关键词继续检索。';
        results.innerHTML = '';
        matches.slice(0, 120).forEach(function (movie) {
            results.appendChild(createMovieCard(movie));
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initSearchPage();
    });
})();
