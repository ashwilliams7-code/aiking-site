/* ═══════════════════════════════════════════════════════════════════
   AIKING — CINEMA BEHAVIOUR LAYER
   Progressive enhancement: the page is complete without this file.
   ── header state · mobile drawer · lazy cinematic video ·
   ── scroll reveals · motion pause · CTA analytics
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionPausedByUser = false;
  var videos = [];

  function motionOK() {
    return !reduceQuery.matches && !motionPausedByUser;
  }

  /* ── Header scroll state ─────────────────────────────────────── */
  var header = doc.querySelector('.c-header');
  var lastState = false;
  function headerTick() {
    var scrolled = window.scrollY > 24;
    if (scrolled !== lastState) {
      header.classList.toggle('is-scrolled', scrolled);
      lastState = scrolled;
    }
  }
  window.addEventListener('scroll', headerTick, { passive: true });
  headerTick();

  /* ── Mobile drawer ───────────────────────────────────────────── */
  var burger = doc.querySelector('.c-burger');
  var drawer = doc.getElementById('c-drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      drawer.hidden = open;
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        drawer.hidden = true;
      }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) {
        burger.setAttribute('aria-expanded', 'false');
        drawer.hidden = true;
        burger.focus();
      }
    });
  }

  /* ── Lazy cinematic video (IntersectionObserver-gated) ───────── */
  var saveData = (navigator.connection && navigator.connection.saveData) ||
    /Android 2|iPad.*Safari 8/.test(navigator.userAgent);

  function activateVideo(v) {
    var src = window.matchMedia('(max-width: 720px)').matches
      ? v.getAttribute('data-src-mobile') || v.getAttribute('data-src')
      : v.getAttribute('data-src');
    if (!src || v.dataset.loaded) return;
    v.dataset.loaded = '1';
    var s = doc.createElement('source');
    s.src = src;
    s.type = 'video/mp4';
    v.appendChild(s);
    v.load();
    var playAttempt = v.play();
    if (playAttempt && playAttempt.catch) {
      playAttempt.catch(function () { /* autoplay blocked — poster remains */ });
    }
    v.addEventListener('loadeddata', function () {
      v.classList.add('is-ready');
      var bd = v.closest('.act-backdrop');
      if (bd) bd.classList.add('video-live');
    }, { once: true });
  }

  function pauseAll() {
    videos.forEach(function (v) { if (!v.paused) v.pause(); });
  }
  function playVisible() {
    if (!motionOK()) return;
    videos.forEach(function (v) {
      if (v.dataset.visible === '1' && v.paused && v.dataset.loaded) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var videoIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        v.dataset.visible = entry.isIntersecting ? '1' : '0';
        if (entry.isIntersecting && motionOK() && !saveData) {
          activateVideo(v);
        }
        if (!entry.isIntersecting && !v.paused) v.pause();
        if (entry.isIntersecting && motionOK() && v.dataset.loaded && v.paused) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      });
    }, { threshold: 0.25 });
    videos = [].slice.call(doc.querySelectorAll('.act-video[data-src]'));
    videos.forEach(function (v) { videoIO.observe(v); });
  }

  /* ── Scroll reveals ──────────────────────────────────────────── */
  var reveals = [].slice.call(doc.querySelectorAll('.reveal'));
  function revealAll() {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
  if (motionOK() && 'IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -2% 0px' });
    reveals.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', Math.min((i % 4) * 0.12, 0.36) + 's');
      revealIO.observe(el);
    });
    /* Fail-open safety: printing, crawlers, or any IO edge case */
    window.addEventListener('beforeprint', revealAll);
    setTimeout(function () {
      if (!('onscroll' in window)) revealAll();
    }, 2500);
  } else {
    revealAll();
  }

  /* ── Motion toggle (user override) ───────────────────────────── */
  var toggle = doc.querySelector('.motion-toggle');
  var label = toggle ? toggle.querySelector('.motion-label') : null;
  function setMotionUI() {
    if (!toggle) return;
    var paused = motionPausedByUser || reduceQuery.matches;
    toggle.setAttribute('aria-pressed', String(motionPausedByUser));
    if (label) label.textContent = motionPausedByUser ? 'Resume motion' : 'Pause motion';
    root.classList.toggle('motion-off', paused);
    doc.querySelectorAll('.act-video').forEach(function (v) {
      if (paused) { if (!v.paused) v.pause(); }
    });
    if (!paused) playVisible();
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      motionPausedByUser = !motionPausedByUser;
      setMotionUI();
    });
  }
  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', setMotionUI);
  }

  /* ── Page visibility: never burn cycles in background tabs ──── */
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) pauseAll();
    else playVisible();
  });

  /* ── CTA analytics (privacy-friendly, no cookies) ────────────── */
  doc.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-cta]');
    if (!cta) return;
    var id = cta.getAttribute('data-cta');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cta_click', cta_id: id });
    if (typeof window.clarity === 'function') {
      window.clarity('event', 'cta_' + id);
    }
  }, { passive: true });
})();
