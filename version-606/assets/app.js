(function () {
    var MovieSite = {};

    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initSearchForms() {
        selectAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = "search.html";
                }
            });
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll(".hero-slide", slider);
        var dots = selectAll(".hero-dot", slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function initSearchPage() {
        var input = document.getElementById("movie-search-input");
        var grid = document.getElementById("search-grid");
        var state = document.getElementById("search-state");
        if (!input || !grid) {
            return;
        }
        var cards = selectAll(".movie-card", grid);
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, "");
        }

        function apply() {
            var value = normalize(input.value);
            var hasQuery = value.length > 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-filter"));
                card.classList.toggle("is-hidden", hasQuery && haystack.indexOf(value) === -1);
            });
            if (state) {
                state.textContent = hasQuery ? "已根据关键词筛选影片。" : "输入关键词即可筛选影片。";
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    MovieSite.initPlayer = function (url) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("play-cover");
        if (!video || !url) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        attached = false;
                        video.src = url;
                    }
                });
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });
    };

    window.MovieSite = MovieSite;

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSearchForms();
        initHeroSlider();
        initSearchPage();
    });
})();
