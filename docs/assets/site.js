// Aussie Bridge Japan — shared behaviour for sub-pages
(function () {
  var header = document.querySelector('header.site');
  if (header) {
    addEventListener('scroll', function () {
      header.classList.toggle('scrolled', scrollY > 40);
    }, { passive: true });
  }

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // count-up stats (elements with data-count)
  var nums = document.querySelectorAll('.num[data-count]');
  var setFinal = function (el) {
    el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
  };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nums.length) {
    if ('IntersectionObserver' in window && !reduce) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          sio.unobserve(en.target);
          var el = en.target, target = +el.dataset.count;
          var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
          var t0 = performance.now(), dur = 1600;
          (function tick(t) {
            var p = Math.min((t - t0) / dur, 1);
            el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        });
      }, { threshold: 0.5 });
      nums.forEach(function (el) { sio.observe(el); });
    } else {
      nums.forEach(setFinal);
    }
  }
})();
