(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = $('[data-menu-button]');
    var menu = $('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = $$('[data-hero-slide]');
    var dots = $$('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    $$('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-input]', scope) || $('[data-filter-input]');
      var type = $('[data-filter-type]', scope) || $('[data-filter-type]');
      var year = $('[data-filter-year]', scope) || $('[data-filter-year]');
      var cards = $$('[data-movie-card]', scope);
      var empty = $('[data-empty-message]', scope);
      function apply() {
        var keyword = normalizeText(input && input.value);
        var typeValue = normalizeText(type && type.value);
        var yearValue = normalizeText(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalizeText(card.getAttribute('data-search'));
          var cardType = normalizeText(card.getAttribute('data-type'));
          var cardYear = normalizeText(card.getAttribute('data-year'));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
      return;
    }
    var box = video.closest('.player-box');
    var overlay = box ? $('[data-player-overlay]', box) : null;
    var loaded = false;
    function attachSource() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }
    function start() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
