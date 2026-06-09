(function () {
    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString();
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '<a class="card-image" href="' + escapeHTML(movie.url) + '">',
            '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
            '<span class="play-hover">▶</span>',
            '<span class="duration">' + escapeHTML(movie.duration) + '</span>',
            '<span class="corner-meta">' + escapeHTML(movie.region) + '</span>',
            '</a>',
            '<div class="card-content">',
            '<div class="meta-row">',
            '<span class="pill">' + escapeHTML(movie.category) + '</span>',
            '<span class="rating">★ ' + escapeHTML(movie.rating) + '</span>',
            '</div>',
            '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
            '<p>' + escapeHTML(movie.oneLine) + '</p>',
            '<div class="card-foot">',
            '<span>' + formatNumber(movie.views) + '</span>',
            '<span>' + escapeHTML(movie.year) + '</span>',
            '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function searchMovies(keyword) {
        var movies = window.MOVIES || [];
        if (!keyword) {
            return movies.slice(0, 60);
        }
        var words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
        return movies.filter(function (movie) {
            var text = [
                movie.title,
                movie.oneLine,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return words.every(function (word) {
                return text.indexOf(word) !== -1;
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var subtitle = document.querySelector("[data-search-subtitle]");
        var keyword = readQuery();

        if (input) {
            input.value = keyword;
        }

        if (!results) {
            return;
        }

        if (!keyword) {
            return;
        }

        var matched = searchMovies(keyword);
        if (title) {
            title.textContent = "搜索结果";
        }
        if (subtitle) {
            subtitle.textContent = "关键词：“" + keyword + "”，找到 " + matched.length + " 部相关内容。";
        }
        results.innerHTML = matched.length ? matched.map(card).join("") : '<div class="empty-state is-visible">没有找到匹配的影片</div>';
    });
})();
