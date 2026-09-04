(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? Math.min(ms, 80) : ms));

  const toast = document.querySelector('[data-toast]');
  let toastTimer = 0;
  const announce = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  };

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }));
  }

  const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((item) => observer.observe(item));
    window.setTimeout(() => reveals.forEach((item) => item.classList.add('is-visible')), 4500);
  }

  document.querySelectorAll('[data-pathway]').forEach((pathway) => {
    const controls = Array.from(pathway.querySelectorAll('[data-path-stage]'));
    const panels = Array.from(pathway.querySelectorAll('[data-path-panel]'));
    const setStage = (stage) => {
      controls.forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.pathStage === stage)));
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.pathPanel === stage));
      pathway.dataset.activeStage = stage;
    };
    controls.forEach((control) => control.addEventListener('click', () => setStage(control.dataset.pathStage)));
    if (controls[0]) setStage(controls[0].dataset.pathStage);
  });

  document.querySelectorAll('[data-diagnostic]').forEach((diagnostic) => {
    const steps = Array.from(diagnostic.querySelectorAll('[data-diagnostic-step]'));
    const indicators = Array.from(diagnostic.querySelectorAll('[data-step-indicator]'));
    let current = 0;
    const renderStep = () => {
      steps.forEach((step, index) => {
        const active = index === current;
        step.hidden = !active;
        step.classList.toggle('is-active', active);
      });
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('is-active', index === current);
        indicator.classList.toggle('is-complete', index < current);
        if (index === current) indicator.setAttribute('aria-current', 'step');
        else indicator.removeAttribute('aria-current');
      });
    };
    diagnostic.querySelectorAll('[data-diagnostic-next]').forEach((button) => button.addEventListener('click', () => {
      current = Math.min(steps.length - 1, current + 1);
      renderStep();
      diagnostic.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }));
    diagnostic.querySelectorAll('[data-diagnostic-back]').forEach((button) => button.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      renderStep();
    }));
    renderStep();
  });

  const runButton = document.querySelector('[data-diagnostic-run]');
  const resetButton = document.querySelector('[data-diagnostic-reset]');
  const runStates = Array.from(document.querySelectorAll('[data-run-state]'));
  const runProgress = document.querySelector('[data-run-progress]');
  const progressCopy = document.querySelector('[data-progress-copy]');
  const scorecard = document.querySelector('[data-scorecard]');
  let runToken = 0;

  const resetRun = () => {
    runToken += 1;
    runStates.forEach((state) => state.classList.remove('is-active', 'is-complete'));
    if (runStates[0]) runStates[0].classList.add('is-active');
    if (runProgress) runProgress.style.setProperty('--progress', '0%');
    if (progressCopy) progressCopy.textContent = 'Ready to run with synthetic fixtures.';
    if (runButton) {
      runButton.disabled = false;
      runButton.textContent = 'Run synthetic diagnostic';
    }
  };

  if (runButton) {
    runButton.addEventListener('click', async () => {
      const token = ++runToken;
      runButton.disabled = true;
      runButton.textContent = 'Diagnostic running…';
      const messages = [
        'Request approved. No external systems contacted.',
        'Collecting two synthetic observation runs across eight surfaces.',
        'Validating provenance, volatility and unavailable coverage.',
        'Release gates passed. Preparing secure sample access.',
        'Complete synthetic scorecard released.'
      ];
      for (let index = 0; index < runStates.length; index += 1) {
        if (token !== runToken) return;
        runStates.forEach((state, stateIndex) => {
          state.classList.toggle('is-active', stateIndex === index);
          state.classList.toggle('is-complete', stateIndex < index);
        });
        if (runProgress) runProgress.style.setProperty('--progress', `${Math.round((index / Math.max(1, runStates.length - 1)) * 100)}%`);
        if (progressCopy) progressCopy.textContent = messages[index] || 'Synthetic state updated.';
        await delay(index === runStates.length - 1 ? 260 : 780);
      }
      runStates.forEach((state) => state.classList.add('is-complete'));
      if (runProgress) runProgress.style.setProperty('--progress', '100%');
      runButton.textContent = 'Diagnostic complete';
      if (scorecard) {
        scorecard.classList.add('is-fresh');
        window.setTimeout(() => scorecard.classList.remove('is-fresh'), 1600);
      }
      announce('Synthetic scorecard released. No external action occurred.');
    });
  }
  if (resetButton) resetButton.addEventListener('click', resetRun);
  resetRun();

  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = Array.from(tabs.querySelectorAll('[data-tab-button]'));
    const panels = Array.from(tabs.querySelectorAll('[data-tab-panel]'));
    const activate = (name) => {
      buttons.forEach((button) => {
        const active = button.dataset.tabButton === name;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.dataset.tabPanel !== name; });
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button.dataset.tabButton));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const target = buttons[(index + delta + buttons.length) % buttons.length];
        target.focus();
        activate(target.dataset.tabButton);
      });
    });
    if (buttons[0]) activate(buttons[0].dataset.tabButton);
  });

  const roleButtons = Array.from(document.querySelectorAll('[data-role]'));
  const capabilityRows = Array.from(document.querySelectorAll('[data-capability]'));
  const roleCopy = document.querySelector('[data-role-copy]');
  const roleMatrix = {
    owner: ['view', 'edit', 'approve', 'invite', 'restore', 'delete', 'action'],
    operator: ['view', 'edit', 'action'],
    reviewer: ['view']
  };
  const roleDescriptions = {
    owner: 'Verified owner preview · may approve consequential changes.',
    operator: 'Operator preview · may prepare work but cannot approve ownership actions.',
    reviewer: 'Reviewer preview · read-only evidence and audit access.'
  };
  const setRole = (role) => {
    const allowed = roleMatrix[role] || [];
    roleButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.role === role)));
    capabilityRows.forEach((row) => {
      const enabled = allowed.includes(row.dataset.capability);
      row.classList.toggle('is-disabled', !enabled);
      row.setAttribute('aria-disabled', String(!enabled));
      if (row instanceof HTMLButtonElement) row.disabled = !enabled;
    });
    if (roleCopy) roleCopy.textContent = roleDescriptions[role] || '';
  };
  roleButtons.forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));
  if (roleButtons[0]) setRole(roleButtons[0].dataset.role);

  const openDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };
  document.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  }));

  const actionDialog = document.querySelector('#action-dialog');
  const actionReceipt = document.querySelector('[data-action-receipt]');
  document.querySelectorAll('[data-action-request]').forEach((button) => button.addEventListener('click', () => openDialog(actionDialog)));
  const actionConfirm = document.querySelector('[data-action-confirm]');
  if (actionConfirm) actionConfirm.addEventListener('click', () => {
    closeDialog(actionDialog);
    if (actionReceipt) actionReceipt.hidden = false;
    document.querySelectorAll('[data-action-request]').forEach((button) => { button.textContent = 'Review queued request →'; });
    announce('Synthetic request queued for human review. Nothing was booked or sent.');
  });

  const historyFilters = Array.from(document.querySelectorAll('[data-history-filter]'));
  const recoveryPoints = Array.from(document.querySelectorAll('[data-recovery-point]'));
  const setHistoryFilter = (filter) => {
    historyFilters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.historyFilter === filter)));
    recoveryPoints.forEach((point) => {
      point.hidden = filter === 'milestones' && point.dataset.milestone !== 'true';
    });
  };
  historyFilters.forEach((button) => button.addEventListener('click', () => setHistoryFilter(button.dataset.historyFilter)));
  if (historyFilters[0]) setHistoryFilter(historyFilters[0].dataset.historyFilter);

  const compareChecks = Array.from(document.querySelectorAll('[data-compare-check]'));
  const compareCount = document.querySelector('[data-compare-count]');
  const compareButton = document.querySelector('[data-compare-button]');
  const updateCompare = () => {
    const count = compareChecks.filter((check) => check.checked && !check.closest('[data-recovery-point]')?.hidden).length;
    if (compareCount) compareCount.textContent = String(count);
    if (compareButton) compareButton.disabled = count !== 2;
  };
  compareChecks.forEach((check) => check.addEventListener('change', updateCompare));
  if (compareButton) compareButton.addEventListener('click', () => announce('Synthetic comparison prepared for the two selected recovery points.'));
  updateCompare();

  const restoreDialog = document.querySelector('#restore-dialog');
  const restoreLabel = document.querySelector('[data-restore-label]');
  const restoreStatus = document.querySelector('[data-restore-status]');
  let restorePoint = '';
  document.querySelectorAll('[data-restore-open]').forEach((button) => button.addEventListener('click', () => {
    restorePoint = button.dataset.restoreOpen || 'Selected recovery point';
    if (restoreLabel) restoreLabel.textContent = restorePoint;
    openDialog(restoreDialog);
  }));
  const restoreConfirm = document.querySelector('[data-restore-confirm]');
  if (restoreConfirm) restoreConfirm.addEventListener('click', () => {
    closeDialog(restoreDialog);
    if (restoreStatus) {
      restoreStatus.hidden = false;
      restoreStatus.innerHTML = `<strong>Restore preview applied synthetically.</strong><span>${restorePoint} was promoted as a new head. The previous head remains available.</span><button type="button" data-restore-undo>Undo synthetic restore</button>`;
      restoreStatus.querySelector('[data-restore-undo]')?.addEventListener('click', () => {
        restoreStatus.hidden = true;
        announce('Synthetic restore undone.');
      });
    }
    announce('Synthetic restore completed. No customer data changed.');
  });

  const deleteDialog = document.querySelector('#delete-dialog');
  const deleteLabel = document.querySelector('[data-delete-label]');
  let deletePoint = null;
  document.querySelectorAll('[data-delete-open]').forEach((button) => button.addEventListener('click', () => {
    deletePoint = button.closest('[data-recovery-point]');
    if (deleteLabel) deleteLabel.textContent = button.dataset.deleteOpen || 'Selected recovery point';
    openDialog(deleteDialog);
  }));
  const deleteConfirm = document.querySelector('[data-delete-confirm]');
  if (deleteConfirm) deleteConfirm.addEventListener('click', () => {
    closeDialog(deleteDialog);
    if (!deletePoint) return;
    deletePoint.classList.add('is-pending-deletion');
    const state = deletePoint.querySelector('[data-point-state]');
    if (state) state.textContent = 'Pending deletion · 24h undo';
    const undo = deletePoint.querySelector('[data-delete-undo]');
    if (undo) undo.hidden = false;
    announce('Recovery point moved to synthetic pending deletion.');
  });
  document.querySelectorAll('[data-delete-undo]').forEach((button) => button.addEventListener('click', () => {
    const point = button.closest('[data-recovery-point]');
    point?.classList.remove('is-pending-deletion');
    const state = point?.querySelector('[data-point-state]');
    if (state) state.textContent = point.dataset.defaultState || 'Available';
    button.hidden = true;
    announce('Synthetic deletion cancelled.');
  }));

  const planButtons = Array.from(document.querySelectorAll('[data-plan]'));
  const planSummary = document.querySelector('[data-plan-summary]');
  const checkoutDialog = document.querySelector('#checkout-dialog');
  const checkoutPlan = document.querySelector('[data-checkout-plan]');
  let selectedPlan = 'ARA Proof';
  const setPlan = (button) => {
    selectedPlan = button.dataset.plan || 'ARA Proof';
    planButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    if (planSummary) planSummary.textContent = `${selectedPlan} selected for preview · no checkout created`;
  };
  planButtons.forEach((button) => button.addEventListener('click', () => setPlan(button)));
  if (planButtons[0]) setPlan(planButtons[0]);
  document.querySelectorAll('[data-checkout-preview]').forEach((button) => button.addEventListener('click', () => {
    if (checkoutPlan) checkoutPlan.textContent = selectedPlan;
    openDialog(checkoutDialog);
  }));
  const checkoutConfirm = document.querySelector('[data-checkout-confirm]');
  if (checkoutConfirm) checkoutConfirm.addEventListener('click', () => {
    closeDialog(checkoutDialog);
    announce('Synthetic checkout preview closed. No Stripe session or charge was created.');
  });

  const billingButtons = Array.from(document.querySelectorAll('[data-billing-state]'));
  const billingBanner = document.querySelector('[data-billing-banner]');
  const billingCopy = {
    active: ['Active entitlement', 'Protected capabilities available from the reconciled ARA ledger.'],
    grace: ['Past due · grace', 'Days 0–7 preview. Existing capability remains available while payment recovery is attempted.'],
    restricted: ['Past due · restricted', 'Days 8–14 preview. Read-only, export and billing remain; new costly actions pause.'],
    review: ['Billing review', 'Refund or dispute preview. Data stays protected and destructive actions remain blocked.'],
    former: ['Former paid · read-only', '120-day offboarding preview. Inspect, export, delete or reactivate without data loss.']
  };
  const setBilling = (state) => {
    billingButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.billingState === state)));
    if (!billingBanner) return;
    const [title, copy] = billingCopy[state] || billingCopy.active;
    billingBanner.dataset.state = state;
    billingBanner.querySelector('strong').textContent = title;
    billingBanner.querySelector('span').textContent = copy;
  };
  billingButtons.forEach((button) => button.addEventListener('click', () => setBilling(button.dataset.billingState)));
  setBilling('active');

  const sectionLinks = Array.from(document.querySelectorAll('[data-site-nav] a[href^="#"]'));
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (sections.length) {
    let navFrame = 0;
    const syncNavigation = () => {
      navFrame = 0;
      const marker = window.scrollY + 180;
      let active = sections[0];
      sections.forEach((section) => {
        if (section.offsetTop <= marker) active = section;
      });
      sectionLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${active.id}`));
    };
    const scheduleNavigation = () => {
      if (navFrame) return;
      navFrame = window.requestAnimationFrame(syncNavigation);
    };
    window.addEventListener('scroll', scheduleNavigation, { passive: true });
    window.addEventListener('resize', scheduleNavigation, { passive: true });
    syncNavigation();
  }

  document.querySelectorAll('[data-current-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
  root.classList.add('js-ready');
})();
