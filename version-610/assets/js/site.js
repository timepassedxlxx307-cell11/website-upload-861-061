(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var navLinks = document.querySelector("[data-nav-links]");
        var navSearch = document.querySelector(".nav-search");

        if (menuButton && navLinks && navSearch) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("is-open");
                navSearch.classList.toggle("is-open");
                menuButton.textContent = navLinks.classList.contains("is-open") ? "×" : "☰";
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var cardSearch = document.querySelector("[data-card-search]");
        var cardList = document.querySelector("[data-card-list]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var emptyState = document.querySelector("[data-empty-state]");

        if (cardList) {
            var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
            var activeType = "";

            function applyFilters() {
                var keyword = cardSearch ? cardSearch.value.trim().toLowerCase() : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    var type = card.getAttribute("data-type") || "";
                    var matchedText = !keyword || text.indexOf(keyword) !== -1;
                    var matchedType = !activeType || type === activeType;
                    var shouldShow = matchedText && matchedType;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            }

            if (cardSearch) {
                cardSearch.addEventListener("input", applyFilters);
            }

            filterButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeType = button.getAttribute("data-filter") || "";
                    filterButtons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    applyFilters();
                });
            });
        }
    });
})();
