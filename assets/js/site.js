/* ============================================================
   Ahmed Elsayed — Portfolio
   Ref: PORTFOLIO_STRATEGY.md §8.6 (motion) · §8.7 (RTL) · §9.4 (plates)
   No localStorage. No external asset hosts.
   ============================================================ */
(function () {
  'use strict';

  /* ---- §9.4 editorial plate fallback ------------------------
     If an asset is missing, replace the <img> with a designed
     plate frame (number / label / filename) instead of a broken
     image or a dev-style dashed box.                          */
  function toPlate(img) {
    var spec = (img.dataset.plate || '?|ASSET|—').split('|');
    var box = img.parentNode;
    if (!box || box.querySelector('.plate')) return;
    var el = document.createElement('div');
    el.className = 'plate';
    el.innerHTML =
      '<span class="no">' + spec[0] + '</span>' +
      '<span class="lb">' + spec[1] + '</span>' +
      '<span class="fn">assets/images/' + spec[2] + '</span>';
    img.remove();
    box.appendChild(el);
  }

  var imgs = document.querySelectorAll('img[data-plate]');
  Array.prototype.forEach.call(imgs, function (img) {
    img.addEventListener('error', function () { toPlate(img); }, { once: true });
    // already failed before JS ran
    if (img.complete && img.naturalWidth === 0) toPlate(img);
  });

  /* ---- nav background on scroll ---- */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- §8.6 reveal on scroll, stagger 80ms ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rvs = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(rvs, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('in'); }, i * 80);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(rvs, function (el) { io.observe(el); });
  }

  /* ---- §8.7 language toggle (in-memory, no storage) ---- */
  var lang = 'ar';
  var langBtn = document.getElementById('langBtn');
  var rail = document.getElementById('rail');

  langBtn.addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar';
    var h = document.documentElement;
    h.lang = lang;
    h.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-ar]').forEach(function (el) {
      el.innerHTML = lang === 'ar' ? el.dataset.ar : el.dataset.en;
    });
    langBtn.textContent = lang === 'ar' ? 'EN' : 'ع';
    // §8.7 packaging wall scrolls RTL in Arabic
    if (rail) rail.scrollLeft = 0;
    var tAr = document.body.dataset.titleAr || 'أحمد السيد — مصمم علامات تجارية للأغذية والتجزئة';
    var tEn = document.body.dataset.titleEn || 'Ahmed Elsayed — FMCG & Retail Brand Designer';
    document.title = lang === 'ar' ? tAr : tEn;
  });

  /* ---- rail: drag to scroll (desktop) ---- */
  if (rail) {
    var down = false, startX = 0, startL = 0;
    rail.addEventListener('pointerdown', function (e) {
      down = true; startX = e.clientX; startL = rail.scrollLeft;
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      rail.scrollLeft = startL - (e.clientX - startX);
    });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      rail.addEventListener(t, function () { down = false; });
    });
  }
  /* ---- hero load-in stagger (on page load, not scroll) ---- */
  var loadIns = document.querySelectorAll('.load-in');
  if (reduce) {
    Array.prototype.forEach.call(loadIns, function (el) { el.classList.add('in'); });
  } else {
    Array.prototype.forEach.call(loadIns, function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, 120 + i * 110);
    });
  }

  /* ---- number count-up (triggers once, when stat block reveals) ---- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var statBlocks = document.querySelectorAll('.stats, .case-stats');
  if ('IntersectionObserver' in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('b[data-count]').forEach(animateCount);
        statIO.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(statBlocks, function (el) { statIO.observe(el); });
  }

  /* ---- active nav indicator (homepage sections) ---- */
  var navA = document.querySelectorAll('.nav-links a[href^="#"]');
  if (navA.length) {
    var navTargets = [];
    navA.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (t) navTargets.push({ a: a, el: t });
    });
    function updateActiveNav() {
      var pos = window.scrollY + 140;
      var current = null;
      navTargets.forEach(function (o) {
        if (o.el.offsetTop <= pos) current = o;
      });
      navTargets.forEach(function (o) { o.a.classList.toggle('active', o === current); });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  /* ---- case-hero background parallax ---- */
  var heroBg = document.querySelector('.case-hero-bg img');
  if (heroBg && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = 'translateY(' + (y * 0.12) + 'px)';
      }
    }, { passive: true });
  }

})();
