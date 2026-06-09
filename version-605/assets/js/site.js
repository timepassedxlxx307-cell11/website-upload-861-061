(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function textOf(value) {
    return String(value || "").toLowerCase();
  }

  function fillOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-empty");
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest(".content-section") || document;
      var grid = section.querySelector(".movie-grid");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var input = panel.querySelector(".filter-input");
      var year = panel.querySelector(".filter-year");
      var type = panel.querySelector(".filter-type");
      var sort = panel.querySelector(".filter-sort");
      var status = panel.querySelector("[data-filter-status]");
      var years = Array.from(new Set(cards.map(function (card) { return card.dataset.year; }).filter(Boolean))).sort().reverse();
      var types = Array.from(new Set(cards.map(function (card) { return card.dataset.type; }).filter(Boolean))).sort();
      fillOptions(year, years);
      fillOptions(type, types);

      function apply() {
        var keyword = textOf(input && input.value);
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = textOf(card.dataset.title + " " + card.dataset.region + " " + card.dataset.type + " " + card.dataset.year);
          var ok = (!keyword || haystack.indexOf(keyword) !== -1) && (!yearValue || card.dataset.year === yearValue) && (!typeValue || card.dataset.type === typeValue);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (sort && sort.value !== "default") {
          cards.sort(function (a, b) {
            if (sort.value === "title") {
              return a.dataset.title.localeCompare(b.dataset.title, "zh-Hans-CN");
            }
            var ay = Number(a.dataset.year) || 0;
            var by = Number(b.dataset.year) || 0;
            return sort.value === "new" ? by - ay : ay - by;
          }).forEach(function (card) {
            grid.appendChild(card);
          });
        }
        if (status) {
          status.textContent = "当前显示 " + visible + " 部";
        }
      }

      [input, year, type, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function movieCard(movie) {
    var tags = [movie.year, movie.region, movie.categoryName].filter(Boolean).join(" · ");
    return "<a class=\"movie-card\" href=\"" + movie.href + "\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
      "<div class=\"poster-wrap\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"play-chip\">播放</span></div>" +
      "<div class=\"card-body\"><h2>" + escapeHtml(movie.title) + "</h2><p>" + escapeHtml(movie.oneLine || "") + "</p><div class=\"meta-line\">" + escapeHtml(tags) + "</div></div></a>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearch() {
    var resultBox = document.querySelector("[data-search-results]");
    if (!resultBox || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var title = document.querySelector("[data-search-title]");
    var categorySelect = document.querySelector("[data-search-category]");
    var yearSelect = document.querySelector("[data-search-year]");
    var largeInput = document.querySelector(".large-search input[name='q']");
    if (largeInput) {
      largeInput.value = query;
    }
    var years = Array.from(new Set(window.MOVIE_SEARCH_DATA.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse();
    fillOptions(yearSelect, years);

    function render() {
      var category = categorySelect ? categorySelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var words = textOf(query).split(/\s+/).filter(Boolean);
      var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = textOf([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.categoryName, (movie.tags || []).join(" "), movie.oneLine].join(" "));
        var matchWords = words.length === 0 || words.every(function (word) { return haystack.indexOf(word) !== -1; });
        return matchWords && (!category || movie.category === category) && (!year || movie.year === year);
      }).slice(0, 240);
      if (title) {
        title.textContent = query ? "关键词：“" + query + "”" : "展示片库推荐内容。";
      }
      resultBox.innerHTML = results.map(movieCard).join("");
      setupImages();
    }

    [categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupFilters();
    setupSearch();
  });
})();
