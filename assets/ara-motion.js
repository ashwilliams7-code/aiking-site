/* ARA kinetic experience — progressive enhancement only. */
(() => {
  'use strict';

  const root = document.querySelector('[data-ara-motion]');
  if (!root) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const motionAllowed = !reducedMotion && !saveData;
  root.classList.add('ara-motion-on');

  /* Reveal choreography: content stays readable without JavaScript or with reduced motion. */
  const revealTargets = Array.from(document.querySelectorAll([
    '[data-ara-reveal]',
    '.ara-section-intro',
    '.ara-question-steps',
    '.ara-proof-metrics',
    '.ara-service',
    '.ara-connection-list',
    '.ara-delivery-steps',
    '.ara-pilot',
    '.ara-trust-ledger',
    '.ara-faq-list',
    '.ara-final-shell'
  ].join(',')));

  revealTargets.forEach((element, index) => {
    element.classList.add('ara-motion-reveal');
    element.style.setProperty('--ara-reveal-delay', `${Math.min(index % 3, 2) * 70}ms`);
  });

  const revealAll = () => revealTargets.forEach((element) => element.classList.add('is-visible'));
  if (motionAllowed && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.04 });
    revealTargets.forEach((element) => revealObserver.observe(element));
    window.setTimeout(revealAll, 4500);
  } else {
    revealAll();
  }

  /* The pathway is a real control: autoplay only while visible, with pause and direct stage selection. */
  const pathway = document.querySelector('[data-ara-pathway]');
  if (pathway) {
    const buttons = Array.from(pathway.querySelectorAll('[data-ara-stage-button]'));
    const stages = Array.from(pathway.querySelectorAll('[data-ara-stage]'));
    const toggle = pathway.querySelector('[data-ara-pathway-toggle]');
    const toggleLabel = pathway.querySelector('[data-ara-toggle-label]');
    let activeIndex = 0;
    let userPaused = !motionAllowed;
    let visible = true;
    let timer = 0;

    const setStage = (index) => {
      if (!stages.length) return;
      activeIndex = ((index % stages.length) + stages.length) % stages.length;
      stages.forEach((stage, stageIndex) => stage.classList.toggle('is-active', stageIndex === activeIndex));
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.araStageButton) === activeIndex)));
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
      pathway.classList.remove('is-playing');
    };

    const start = () => {
      stop();
      if (userPaused || !visible || document.hidden || !motionAllowed || stages.length < 2) return;
      pathway.classList.add('is-playing');
      timer = window.setInterval(() => setStage(activeIndex + 1), 3600);
    };

    const updateToggle = () => {
      if (!toggle || !toggleLabel) return;
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggleLabel.textContent = motionAllowed ? (userPaused ? 'Play animation' : 'Pause animation') : 'Motion off';
      toggle.disabled = !motionAllowed;
      toggle.setAttribute('aria-label', motionAllowed ? `${userPaused ? 'Play' : 'Pause'} pathway motion` : 'Pathway motion disabled by device preference');
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        setStage(Number(button.dataset.araStageButton));
        start();
      });
    });

    if (toggle) {
      toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        updateToggle();
        start();
      });
    }

    if ('IntersectionObserver' in window) {
      const pathwayObserver = new IntersectionObserver((entries) => {
        visible = Boolean(entries[0] && entries[0].isIntersecting);
        start();
      }, { threshold: 0.18 });
      pathwayObserver.observe(pathway);
    }

    document.addEventListener('visibilitychange', start);
    setStage(0);
    updateToggle();
    start();
  }

  /* Specification counts animate once; they are not presented as customer outcomes. */
  const countElements = Array.from(document.querySelectorAll('[data-ara-count]'));
  const animateCount = (element) => {
    if (element.dataset.araCountDone === 'true') return;
    const finalValue = Number(element.dataset.araCount);
    if (!Number.isFinite(finalValue)) return;
    element.dataset.araCountDone = 'true';
    if (!motionAllowed) {
      element.textContent = String(finalValue);
      return;
    }
    const startedAt = performance.now();
    const duration = 850;
    const render = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(finalValue * eased));
      if (progress < 1) requestAnimationFrame(render);
    };
    element.textContent = '0';
    requestAnimationFrame(render);
  };

  if (motionAllowed && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    countElements.forEach((element) => countObserver.observe(element));
  } else {
    countElements.forEach(animateCount);
  }

  /* Mobile dock appears only after the hero CTA leaves view and hides near the final CTA. */
  const mobileDock = document.querySelector('[data-ara-mobile-dock]');
  const hero = document.querySelector('[data-ara-hero]');
  const proofField = document.querySelector('[data-ara-proof-field]');
  const finalSection = document.querySelector('.ara-final');
  if (mobileDock && hero) {
    let scheduled = false;
    const updateDock = () => {
      scheduled = false;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const proofRect = proofField ? proofField.getBoundingClientRect() : null;
      const finalTop = finalSection ? finalSection.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      const proofVisible = Boolean(proofRect && proofRect.top < window.innerHeight && proofRect.bottom > 0);
      const show = window.innerWidth <= 680 && heroBottom < 120 && !proofVisible && finalTop > window.innerHeight * 0.72;
      mobileDock.classList.toggle('is-visible', show);
    };
    const scheduleDock = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateDock);
    };
    window.addEventListener('scroll', scheduleDock, { passive: true });
    window.addEventListener('resize', scheduleDock, { passive: true });
    updateDock();
  }
})();
