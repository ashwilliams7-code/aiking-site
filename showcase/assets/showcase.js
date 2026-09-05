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

  const motionToggle = document.querySelector('[data-motion-toggle]');
  const motionZones = Array.from(document.querySelectorAll('[data-motion-zone]'));
  const kineticSections = Array.from(document.querySelectorAll('.kinetic .section'));
  const journeyProgress = document.querySelector('[data-journey-progress]');
  const setMotionPaused = (paused) => {
    document.body.dataset.motionPaused = String(paused);
    if (!motionToggle) return;
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
  };
  if (motionToggle) {
    if (reducedMotion) {
      setMotionPaused(true);
      motionToggle.textContent = 'Motion reduced';
      motionToggle.disabled = true;
    } else {
      setMotionPaused(false);
      motionToggle.addEventListener('click', () => setMotionPaused(document.body.dataset.motionPaused !== 'true'));
    }
  }
  if (motionZones.length) {
    if ('IntersectionObserver' in window) {
      const motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.target.classList.toggle('is-motion-zone-active', entry.isIntersecting));
      }, { threshold: 0.02, rootMargin: '12% 0px 12% 0px' });
      motionZones.forEach((zone) => motionObserver.observe(zone));
    } else {
      motionZones.forEach((zone) => zone.classList.add('is-motion-zone-active'));
    }
  }
  if (kineticSections.length && 'IntersectionObserver' in window) {
    const sectionMotionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-visible-section', entry.isIntersecting));
    }, { threshold: 0.01, rootMargin: '8% 0px 8% 0px' });
    kineticSections.forEach((section) => sectionMotionObserver.observe(section));
  } else {
    kineticSections.forEach((section) => section.classList.add('is-visible-section'));
  }
  if (journeyProgress) {
    let progressFrame = 0;
    const updateJourneyProgress = () => {
      progressFrame = 0;
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(100, Math.max(0, (window.scrollY / available) * 100));
      journeyProgress.style.setProperty('--journey-progress', `${progress.toFixed(2)}%`);
    };
    const scheduleJourneyProgress = () => {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(updateJourneyProgress);
    };
    window.addEventListener('scroll', scheduleJourneyProgress, { passive: true });
    window.addEventListener('resize', scheduleJourneyProgress, { passive: true });
    updateJourneyProgress();
  }

  document.querySelectorAll('[data-pathway]').forEach((pathway) => {
    const controls = Array.from(pathway.querySelectorAll('[data-path-stage]'));
    const panels = Array.from(pathway.querySelectorAll('[data-path-panel]'));
    const setStage = (stage) => {
      controls.forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.pathStage === stage)));
      panels.forEach((panel) => {
        const active = panel.dataset.pathPanel === stage;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
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
  const diagnosticConsentInputs = Array.from(document.querySelectorAll('[data-diagnostic] input[type="checkbox"]'));
  let runToken = 0;
  let runActive = false;

  const hasDiagnosticConsent = () => diagnosticConsentInputs.length > 0 && diagnosticConsentInputs.every((input) => input.checked);
  const syncRunAvailability = () => {
    if (!runButton || runActive) return;
    const approved = hasDiagnosticConsent();
    runButton.disabled = !approved;
    runButton.textContent = approved ? 'Run synthetic diagnostic' : 'Confirm manifest and consent';
  };

  const resetRun = () => {
    runToken += 1;
    runActive = false;
    runStates.forEach((state) => state.classList.remove('is-active', 'is-complete'));
    if (runStates[0]) runStates[0].classList.add('is-active');
    if (runProgress) runProgress.style.setProperty('--progress', '0%');
    if (progressCopy) progressCopy.textContent = 'Ready to run with synthetic fixtures.';
    if (scorecard) {
      scorecard.hidden = true;
      scorecard.dataset.releaseState = 'pending';
      scorecard.classList.remove('is-fresh');
    }
    syncRunAvailability();
  };

  if (runButton) {
    runButton.addEventListener('click', async () => {
      if (!hasDiagnosticConsent()) {
        if (progressCopy) progressCopy.textContent = 'Confirm every displayed manifest and consent choice before running.';
        announce('Synthetic diagnostic paused until every displayed consent is confirmed.');
        syncRunAvailability();
        return;
      }
      const token = ++runToken;
      runActive = true;
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
      if (token !== runToken) return;
      runStates.forEach((state) => state.classList.add('is-complete'));
      if (runProgress) runProgress.style.setProperty('--progress', '100%');
      runButton.textContent = 'Diagnostic complete';
      runActive = false;
      if (scorecard) {
        scorecard.hidden = false;
        scorecard.dataset.releaseState = 'released';
        scorecard.classList.add('is-fresh');
        window.setTimeout(() => scorecard.classList.remove('is-fresh'), 1600);
      }
      announce('Synthetic scorecard released. No external action occurred.');
    });
  }
  diagnosticConsentInputs.forEach((input) => input.addEventListener('change', syncRunAvailability));
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
  const capabilityRows = () => Array.from(document.querySelectorAll('[data-capability]'));
  const roleCopy = document.querySelector('[data-role-copy]');
  let currentRole = 'owner';
  let currentBillingState = 'active';
  const roleMatrix = {
    owner: ['view', 'edit', 'approve', 'invite', 'connector', 'restore', 'delete', 'transfer', 'billing', 'action'],
    admin: ['view', 'edit', 'approve', 'invite', 'restore', 'action'],
    operator: ['view', 'edit', 'action'],
    reviewer: ['view'],
    billing: ['billing']
  };
  const roleDescriptions = {
    owner: 'Verified owner preview · full organisation authority, still bounded by consent and confirmation.',
    admin: 'Admin preview · workspace and scoped invitation management without ownership transfer or broad deletion.',
    operator: 'Operator preview · may prepare approved work inside assigned locations without membership or billing authority.',
    reviewer: 'Reviewer preview · read-only evidence, comments and audit access.',
    billing: 'Billing preview · subscription administration only, with no customer evidence or operational workspace access.'
  };
  const billingAllows = (capability) => {
    if (currentBillingState === 'restricted') return ['view', 'billing'].includes(capability);
    if (currentBillingState === 'review') return !['action', 'restore', 'delete', 'transfer'].includes(capability);
    if (currentBillingState === 'former') return ['view', 'billing', 'delete'].includes(capability);
    return true;
  };
  const canUseCapability = (capability) => (roleMatrix[currentRole] || []).includes(capability) && billingAllows(capability);
  const syncCapabilityControls = () => {
    capabilityRows().forEach((row) => {
      const enabled = canUseCapability(row.dataset.capability);
      row.classList.toggle('is-disabled', !enabled);
      row.setAttribute('aria-disabled', String(!enabled));
      if (row instanceof HTMLButtonElement) row.disabled = !enabled;
    });
  };
  const guardCapability = (capability) => {
    if (canUseCapability(capability)) return true;
    announce('This synthetic role or entitlement does not permit that action.');
    return false;
  };
  const setRole = (role) => {
    currentRole = role;
    roleButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.role === role)));
    syncCapabilityControls();
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
  document.querySelectorAll('[data-action-request]').forEach((button) => button.addEventListener('click', () => {
    if (guardCapability('action')) openDialog(actionDialog);
  }));
  const actionConfirm = document.querySelector('[data-action-confirm]');
  if (actionConfirm) actionConfirm.addEventListener('click', () => {
    if (!guardCapability('action')) {
      closeDialog(actionDialog);
      return;
    }
    closeDialog(actionDialog);
    if (actionReceipt) actionReceipt.hidden = false;
    document.querySelectorAll('[data-action-request]').forEach((button) => { button.textContent = 'Review queued request →'; });
    announce('Synthetic request queued for human review. Nothing was booked or sent.');
  });

  const inviteDialog = document.querySelector('#invite-dialog');
  const inviteReceipt = document.querySelector('[data-invite-receipt]');
  document.querySelectorAll('[data-invite-open]').forEach((button) => button.addEventListener('click', () => {
    if (guardCapability('invite')) openDialog(inviteDialog);
  }));
  document.querySelector('[data-invite-confirm]')?.addEventListener('click', () => {
    if (!guardCapability('invite')) {
      closeDialog(inviteDialog);
      return;
    }
    closeDialog(inviteDialog);
    if (inviteReceipt) inviteReceipt.hidden = false;
    document.querySelectorAll('[data-invite-open]').forEach((button) => { button.textContent = 'Review prepared invitation'; });
    announce('Synthetic invitation prepared. No identity was provisioned and no message was sent.');
  });

  const transferDialog = document.querySelector('#transfer-dialog');
  const transferReceipt = document.querySelector('[data-transfer-receipt]');
  const transferState = document.querySelector('[data-transfer-state]');
  const transferButtons = Array.from(document.querySelectorAll('[data-transfer-open]'));
  let transferPending = false;
  const setTransferPending = (pending) => {
    transferPending = pending;
    if (transferState) transferState.textContent = pending ? 'Pending transfer · 72h' : 'Stable';
    transferButtons.forEach((button) => {
      button.textContent = pending ? 'Review or cancel pending transfer' : 'Preview owner transfer';
    });
    if (!transferReceipt) return;
    transferReceipt.hidden = !pending;
    if (pending) {
      transferReceipt.innerHTML = '<span>pending_transfer · 72-hour hold · both parties required · synthetic only</span><button class="button ghost" type="button" data-transfer-cancel data-capability="transfer">Cancel synthetic transfer</button>';
      syncCapabilityControls();
      transferReceipt.querySelector('[data-transfer-cancel]')?.addEventListener('click', () => {
        if (!guardCapability('transfer')) return;
        setTransferPending(false);
        announce('Synthetic ownership transfer cancelled. No authority changed.');
      });
    }
  };
  transferButtons.forEach((button) => button.addEventListener('click', () => {
    if (!guardCapability('transfer')) return;
    if (transferPending) {
      transferReceipt?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      transferReceipt?.querySelector('[data-transfer-cancel]')?.focus();
      announce('Pending synthetic transfer is ready to review or cancel.');
      return;
    }
    openDialog(transferDialog);
  }));
  document.querySelector('[data-transfer-confirm]')?.addEventListener('click', () => {
    if (!guardCapability('transfer')) {
      closeDialog(transferDialog);
      return;
    }
    closeDialog(transferDialog);
    setTransferPending(true);
    announce('Synthetic 72-hour ownership-transfer hold started. No authority changed.');
  });

  const connectorDialog = document.querySelector('#connector-dialog');
  const connectorRevokeDialog = document.querySelector('#connector-revoke-dialog');
  const connectorStateButtons = Array.from(document.querySelectorAll('[data-connector-state]'));
  const connectorStatus = document.querySelector('[data-connector-status]');
  const connectorFreshness = document.querySelector('[data-connector-freshness]');
  const connectorCoverage = document.querySelector('[data-connector-coverage]');
  const connectorCopy = document.querySelector('[data-connector-copy]');
  const proofCoverage = document.querySelector('[data-proof-coverage]');
  const connectorStates = {
    active: {
      label: 'Active', freshness: 'Reconciled 8 min ago', ledger: '2 active · 1 proposed · 8/8 evidence surfaces current',
      copy: 'Provider and ARA state agree. Read-only collection is available.', proof: '7/8 current · GBP active', className: ''
    },
    degraded: {
      label: 'Reconciliation required', freshness: 'Provider scope drift detected', ledger: '1 active · 1 degraded · 1 proposed · 6/8 surfaces current',
      copy: 'Provider and ARA scopes disagree. Collection and affected actions are paused without widening access.', proof: '6/8 current · GBP degraded', className: 'volatile'
    },
    revoked: {
      label: 'Revoked', freshness: 'New collection blocked immediately', ledger: '1 active · 1 revoked · 1 proposed · 5/8 surfaces current',
      copy: 'ARA is internally blocked. Provider revocation retry is simulated; existing evidence was not silently deleted.', proof: '5/8 current · GBP revoked', className: 'unavailable'
    }
  };
  const setConnectorState = (state) => {
    const selected = connectorStates[state] || connectorStates.active;
    connectorStateButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.connectorState === state)));
    if (connectorStatus) {
      connectorStatus.textContent = selected.label;
      connectorStatus.classList.remove('volatile', 'unavailable');
      if (selected.className) connectorStatus.classList.add(selected.className);
    }
    if (connectorFreshness) connectorFreshness.textContent = selected.freshness;
    if (connectorCoverage) connectorCoverage.textContent = selected.ledger;
    if (connectorCopy) connectorCopy.textContent = selected.copy;
    if (proofCoverage) proofCoverage.textContent = selected.proof;
    document.body.dataset.connectorState = state;
  };
  connectorStateButtons.forEach((button) => button.addEventListener('click', () => setConnectorState(button.dataset.connectorState)));
  document.querySelectorAll('[data-connector-open]').forEach((button) => button.addEventListener('click', () => {
    if (guardCapability('connector')) openDialog(connectorDialog);
  }));
  document.querySelector('[data-connector-confirm]')?.addEventListener('click', () => {
    if (!guardCapability('connector')) {
      closeDialog(connectorDialog);
      return;
    }
    closeDialog(connectorDialog);
    setConnectorState('active');
    announce('Synthetic connector consent recorded. No OAuth connection or credential was created.');
  });
  document.querySelectorAll('[data-connector-revoke-open]').forEach((button) => button.addEventListener('click', () => {
    if (guardCapability('connector')) openDialog(connectorRevokeDialog);
  }));
  document.querySelector('[data-connector-revoke-confirm]')?.addEventListener('click', () => {
    if (!guardCapability('connector')) {
      closeDialog(connectorRevokeDialog);
      return;
    }
    closeDialog(connectorRevokeDialog);
    setConnectorState('revoked');
    announce('Synthetic connector revoked internally. No provider account was contacted.');
  });
  setConnectorState('active');

  const historyFilters = Array.from(document.querySelectorAll('[data-history-filter]'));
  const recoveryPoints = Array.from(document.querySelectorAll('[data-recovery-point]'));
  const setHistoryFilter = (filter) => {
    historyFilters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.historyFilter === filter)));
    recoveryPoints.forEach((point) => {
      const hidden = filter === 'milestones' && point.dataset.milestone !== 'true';
      point.hidden = hidden;
      if (hidden) {
        const checkbox = point.querySelector('[data-compare-check]');
        if (checkbox) checkbox.checked = false;
      }
    });
    updateCompare();
  };
  historyFilters.forEach((button) => button.addEventListener('click', () => setHistoryFilter(button.dataset.historyFilter)));

  const compareChecks = Array.from(document.querySelectorAll('[data-compare-check]'));
  const compareCount = document.querySelector('[data-compare-count]');
  const compareButton = document.querySelector('[data-compare-button]');
  const compareResult = document.createElement('section');
  compareResult.className = 'recovery-comparison';
  compareResult.dataset.compareResult = '';
  compareResult.hidden = true;
  compareResult.setAttribute('aria-live', 'polite');
  document.querySelector('.recovery-toolbar')?.insertAdjacentElement('afterend', compareResult);
  function updateCompare() {
    const visibleSelected = compareChecks.filter((check) => check.checked && !check.closest('[data-recovery-point]')?.hidden);
    const count = visibleSelected.length;
    if (compareCount) compareCount.textContent = String(count);
    if (compareButton) compareButton.disabled = count !== 2;
    if (count !== 2) compareResult.hidden = true;
  }
  compareChecks.forEach((check) => check.addEventListener('change', updateCompare));
  if (compareButton) compareButton.addEventListener('click', () => {
    const selected = compareChecks
      .filter((check) => check.checked && !check.closest('[data-recovery-point]')?.hidden)
      .map((check) => check.closest('[data-recovery-point]'))
      .filter(Boolean);
    if (selected.length !== 2) return;
    compareResult.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = 'Synthetic recovery comparison';
    compareResult.append(heading);
    const grid = document.createElement('div');
    selected.forEach((point) => {
      const card = document.createElement('article');
      const title = document.createElement('strong');
      const timestamp = document.createElement('span');
      const change = document.createElement('p');
      const state = document.createElement('small');
      title.textContent = point.querySelector('.point-title strong')?.textContent || 'Recovery point';
      timestamp.textContent = point.querySelector('.point-title span')?.textContent || '';
      change.textContent = point.querySelector('.point-change')?.textContent || 'No change summary available.';
      state.textContent = point.querySelector('[data-point-state]')?.textContent || 'Available';
      card.append(title, timestamp, change, state);
      grid.append(card);
    });
    compareResult.append(grid);
    compareResult.hidden = false;
    compareResult.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    announce('Synthetic comparison rendered for the two selected recovery points.');
  });
  if (historyFilters[0]) setHistoryFilter(historyFilters[0].dataset.historyFilter);

  const restoreDialog = document.querySelector('#restore-dialog');
  const restoreLabel = document.querySelector('[data-restore-label]');
  const restoreStatus = document.querySelector('[data-restore-status]');
  let restorePoint = '';
  document.querySelectorAll('[data-restore-open]').forEach((button) => button.addEventListener('click', () => {
    if (!guardCapability('restore')) return;
    restorePoint = button.dataset.restoreOpen || 'Selected recovery point';
    if (restoreLabel) restoreLabel.textContent = restorePoint;
    openDialog(restoreDialog);
  }));
  const restoreConfirm = document.querySelector('[data-restore-confirm]');
  if (restoreConfirm) restoreConfirm.addEventListener('click', () => {
    if (!guardCapability('restore')) {
      closeDialog(restoreDialog);
      return;
    }
    closeDialog(restoreDialog);
    if (restoreStatus) {
      restoreStatus.hidden = false;
      restoreStatus.innerHTML = `<strong>Restore preview applied synthetically.</strong><span>${restorePoint} was promoted as a new head. The previous head remains available.</span><button type="button" data-restore-undo data-capability="restore">Undo synthetic restore</button>`;
      const undo = restoreStatus.querySelector('[data-restore-undo]');
      syncCapabilityControls();
      undo?.addEventListener('click', () => {
        if (!guardCapability('restore')) return;
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
    if (!guardCapability('delete')) return;
    deletePoint = button.closest('[data-recovery-point]');
    if (deleteLabel) deleteLabel.textContent = button.dataset.deleteOpen || 'Selected recovery point';
    openDialog(deleteDialog);
  }));
  const deleteConfirm = document.querySelector('[data-delete-confirm]');
  if (deleteConfirm) deleteConfirm.addEventListener('click', () => {
    if (!guardCapability('delete')) {
      closeDialog(deleteDialog);
      return;
    }
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
    if (!guardCapability('delete')) return;
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
  planButtons.forEach((button) => button.addEventListener('click', () => {
    if (guardCapability('billing')) setPlan(button);
  }));
  if (planButtons[0]) setPlan(planButtons[0]);
  document.querySelectorAll('[data-checkout-preview]').forEach((button) => button.addEventListener('click', () => {
    if (!guardCapability('billing')) return;
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
    currentBillingState = state;
    billingButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.billingState === state)));
    syncCapabilityControls();
    if (!billingBanner) return;
    const [title, copy] = billingCopy[state] || billingCopy.active;
    billingBanner.dataset.state = state;
    billingBanner.querySelector('strong').textContent = title;
    billingBanner.querySelector('span').textContent = copy;
  };
  billingButtons.forEach((button) => button.addEventListener('click', () => {
    if (guardCapability('billing')) setBilling(button.dataset.billingState);
  }));
  setBilling('active');

  const outcomeFilters = Array.from(document.querySelectorAll('[data-outcome-filter]'));
  const outcomeRows = Array.from(document.querySelectorAll('[data-outcome-row]'));
  const setOutcomeFilter = (filter) => {
    outcomeFilters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.outcomeFilter === filter)));
    outcomeRows.forEach((row) => { row.hidden = filter !== 'all' && row.dataset.outcomeRow !== filter; });
  };
  outcomeFilters.forEach((button) => button.addEventListener('click', () => setOutcomeFilter(button.dataset.outcomeFilter)));
  setOutcomeFilter('all');

  const outcomeDialog = document.querySelector('#outcome-dialog');
  const outcomeTitle = document.querySelector('[data-outcome-title]');
  const outcomeExplanation = document.querySelector('[data-outcome-explanation]');
  const outcomeClass = document.querySelector('[data-outcome-class]');
  const outcomeConfidence = document.querySelector('[data-outcome-confidence]');
  const outcomeProvenance = document.querySelector('[data-outcome-provenance]');
  const outcomeTreatment = document.querySelector('[data-outcome-treatment]');
  const outcomeDetails = {
    direct: ['Direct outcome', 'Direct', 'High', 'ARA route + first-party event', 'Included in direct recorded value', 'A verified ARA-controlled route links the approved answer/action to this reconciled synthetic first-party outcome.'],
    assisted: ['Assisted outcome', 'Assisted', 'Medium', 'ARA exposure + first-party event + phone step', 'Reported separately from direct value', 'ARA is one verified step, but a phone conversation or another known channel also materially contributed.'],
    correlated: ['Correlated outcome', 'Correlated', 'Low', 'Temporal comparison only', 'Excluded from attributable value', 'The event followed an ARA change inside the sample window, but the available evidence does not establish contribution or causation.'],
    unknown: ['Unknown outcome', 'Unknown', 'Unresolved', 'Unmatched first-party event', 'Excluded from attributable value', 'The synthetic event lacks enough consented journey evidence for a stronger attribution class.']
  };
  document.querySelectorAll('[data-outcome-open]').forEach((button) => button.addEventListener('click', () => {
    const [title, label, confidence, provenance, treatment, explanation] = outcomeDetails[button.dataset.outcomeOpen] || outcomeDetails.unknown;
    if (outcomeTitle) outcomeTitle.textContent = title;
    if (outcomeClass) outcomeClass.textContent = label;
    if (outcomeConfidence) outcomeConfidence.textContent = confidence;
    if (outcomeProvenance) outcomeProvenance.textContent = provenance;
    if (outcomeTreatment) outcomeTreatment.textContent = treatment;
    if (outcomeExplanation) outcomeExplanation.textContent = explanation;
    openDialog(outcomeDialog);
  }));

  const proofExportDialog = document.querySelector('#proof-export-dialog');
  document.querySelectorAll('[data-proof-export]').forEach((button) => button.addEventListener('click', () => openDialog(proofExportDialog)));
  document.querySelector('[data-proof-export-confirm]')?.addEventListener('click', () => {
    closeDialog(proofExportDialog);
    announce('Synthetic proof-pack preview closed. No customer file was created.');
  });

  const sectionLinks = Array.from(document.querySelectorAll('[data-site-nav] a')).filter((link) => {
    try { return Boolean(link.hash && document.querySelector(link.hash)); } catch { return false; }
  });
  const sections = sectionLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if (sections.length) {
    let navFrame = 0;
    const syncNavigation = () => {
      navFrame = 0;
      const marker = window.scrollY + 180;
      let active = sections[0];
      sections.forEach((section) => {
        if (section.offsetTop <= marker) active = section;
      });
      sectionLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${active.id}`));
    };
    const scheduleNavigation = () => {
      if (navFrame) return;
      navFrame = window.requestAnimationFrame(syncNavigation);
    };
    window.addEventListener('scroll', scheduleNavigation, { passive: true });
    window.addEventListener('resize', scheduleNavigation, { passive: true });
    syncNavigation();
  }

  document.querySelectorAll('a').forEach((link) => {
    let target = null;
    try { target = link.hash ? document.querySelector(link.hash) : null; } catch { target = null; }
    if (!target) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', link.hash);
      if (link.classList.contains('skip-link')) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  document.querySelectorAll('[data-current-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
  root.classList.add('js-ready');
})();
