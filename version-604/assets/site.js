(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        document.querySelectorAll(".top-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var q = input ? input.value.trim() : "";
                if (!q) {
                    event.preventDefault();
                    return;
                }
            });
        });

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        document.querySelectorAll(".filter-panel").forEach(function (panel) {
            var input = panel.querySelector(".js-filter-input");
            var year = panel.querySelector(".js-filter-year");
            var type = panel.querySelector(".js-filter-type");
            var grid = document.querySelector("[data-filter-grid]");
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-card")) : [];

            if (input && queryValue) {
                input.value = queryValue;
            }

            function applyFilter() {
                var q = normalize(input ? input.value : "");
                var y = normalize(year ? year.value : "");
                var t = normalize(type ? type.value : "");

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.genre,
                        card.textContent
                    ].join(" "));
                    var okQuery = !q || text.indexOf(q) !== -1;
                    var okYear = !y || normalize(card.dataset.year).indexOf(y) !== -1;
                    var okType = !t || normalize(card.dataset.type).indexOf(t) !== -1 || normalize(card.dataset.genre).indexOf(t) !== -1;
                    card.classList.toggle("is-filter-hidden", !(okQuery && okYear && okType));
                });
            }

            [input, year, type].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", applyFilter);
                    el.addEventListener("change", applyFilter);
                }
            });

            applyFilter();
        });
    });
})();
