(() => {
  'use strict';

  const boot = () => {
    const body = document.body;
    if (!body || !body.hasAttribute('data-product-workspace')) return;

    const VIEWS = Object.freeze([
      'overview',
      'onboarding',
      'diagnostic',
      'truth',
      'scorecard',
      'actions',
      'outcomes',
      'connectors',
      'team',
      'recovery',
      'billing',
      'audit'
    ]);

    const VIEW_COPY = Object.freeze({
      overview: ['Overview', 'Readiness, current measures, the next best synthetic action and recent activity.'],
      onboarding: ['Onboarding', 'Review fictional identity, authority, location, Truth Sheet and manifest readiness.'],
      diagnostic: ['Diagnostic', 'Advance two deterministic synthetic runs from approval to a gated scorecard release.'],
      truth: ['Truth Sheet', 'Govern canonical facts, source authority, freshness, conflicts and approval previews.'],
      scorecard: ['Scorecard', 'Inspect synthetic surface evidence, priorities, methodology and release freshness.'],
      actions: ['Governed actions', 'Prepare, review and accept work for a demo queue without sending or booking anything.'],
      outcomes: ['Outcomes', 'Trace baseline, change, exposure and synthetic outcomes with bounded attribution.'],
      connectors: ['Connectors', 'Preview purpose-bound consent, reconciliation and fail-closed connector states.'],
      team: ['Team', 'Preview fixed roles, scoped invitations and a protected ownership-transfer hold.'],
      recovery: ['Recovery', 'Compare checkpoints and preview reversible restore or pending-deletion controls.'],
      billing: ['Plans and entitlements', 'Compare internal pricing hypotheses and server-authoritative entitlement states.'],
      audit: ['Audit', 'Review an append-only, payload-free synthetic interaction history and local export.']
    });

    const ROLE_CAPABILITIES = Object.freeze({
      owner: ['view', 'edit', 'approve', 'invite', 'connector', 'restore', 'delete', 'transfer', 'billing', 'action'],
      admin: ['view', 'edit', 'approve', 'invite', 'restore', 'action'],
      operator: ['view', 'edit', 'action'],
      reviewer: ['view'],
      billing: ['billing']
    });

    const ROLE_COPY = Object.freeze({
      owner: ['Owner', 'Full synthetic organisation preview. Browser roles do not authenticate or authorise anyone.'],
      admin: ['Admin', 'Workspace administration preview. Browser roles do not authenticate or authorise anyone.'],
      operator: ['Operator', 'Scoped operating preview. Browser roles do not authenticate or authorise anyone.'],
      reviewer: ['Reviewer', 'Read-only evidence preview. Browser roles do not authenticate or authorise anyone.'],
      billing: ['Billing', 'Subscription-only preview. Browser roles do not authenticate or authorise anyone.']
    });

    const DIAGNOSTIC_STATES = Object.freeze(['approved', 'queued', 'collecting', 'validating', 'released']);
    const DIAGNOSTIC_COPY = Object.freeze({
      approved: {
        label: 'Approved',
        progress: 0,
        copy: 'Synthetic manifest approved. No provider was contacted.'
      },
      queued: {
        label: 'Queued',
        progress: 20,
        copy: 'Synthetic runs queued locally. No provider was contacted.'
      },
      collecting: {
        label: 'Collecting',
        progress: 52,
        copy: 'Collecting two synthetic observation runs across eight fixture surfaces. No provider was contacted.'
      },
      validating: {
        label: 'Validating',
        progress: 78,
        copy: 'Validating synthetic provenance, volatility and unavailable coverage. No provider was contacted.'
      },
      released: {
        label: 'Released',
        progress: 100,
        copy: 'Synthetic scorecard released for local review. No provider was contacted.'
      }
    });

    const ACTION_STATES = Object.freeze(['not_prepared', 'prepared', 'queued_for_human_review', 'accepted_for_demo_queue']);
    const ACTION_COPY = Object.freeze({
      not_prepared: {
        label: 'Not prepared',
        step: 'Prepare',
        receipt: 'No synthetic action has been prepared. No message, booking, quote or customer commitment occurred.'
      },
      prepared: {
        label: 'Prepared',
        step: 'Human review',
        receipt: 'Synthetic action prepared locally. No message, booking, quote or customer commitment occurred.'
      },
      queued_for_human_review: {
        label: 'Queued for human review',
        step: 'Accept for demo queue',
        receipt: 'Synthetic action queued for human review only. No message, booking, quote or customer commitment occurred.'
      },
      accepted_for_demo_queue: {
        label: 'Accepted for demo queue',
        step: 'Demo queue accepted',
        receipt: 'Accepted for the synthetic demo queue only. No message, booking, quote or customer commitment occurred.'
      }
    });

    const CONNECTOR_COPY = Object.freeze({
      active: {
        label: 'Active',
        copy: 'Synthetic consent is active for the approved read-only purpose. No OAuth flow or provider account was contacted.',
        coverage: '8/8 synthetic evidence surfaces current',
        outcome: 'Outcome coverage: 8/8 synthetic surfaces available.'
      },
      degraded: {
        label: 'Degraded — fail closed',
        copy: 'Synthetic scope reconciliation is required; affected collection and actions are paused. No provider account was contacted.',
        coverage: '6/8 synthetic evidence surfaces current · affected access blocked',
        outcome: 'Outcome coverage: 6/8 synthetic surfaces; degraded evidence is excluded.'
      },
      revoked: {
        label: 'Revoked — fail closed',
        copy: 'New collection and affected actions are blocked in this synthetic preview. No provider account was contacted.',
        coverage: '5/8 historical synthetic evidence surfaces retained · new collection blocked',
        outcome: 'Outcome coverage: 5/8 historical synthetic surfaces; revoked coverage is excluded.'
      }
    });

    const BILLING_COPY = Object.freeze({
      active: ['Active entitlement', 'Synthetic ledger reconciled. Preview capabilities are available; no billing provider was contacted.'],
      grace: ['Past due · grace', 'Days 0–7 preview. Existing capability remains available; no recovery attempt or charge occurred.'],
      restricted: ['Past due · restricted', 'Days 8–14 preview. Read-only, export and billing remain; costly actions fail closed. No charge occurred.'],
      review: ['Billing review', 'Refund or dispute preview. Data remains protected and destructive actions stay blocked. No provider was contacted.'],
      former: ['Former paid · read-only', '120-day offboarding preview. Inspect, export, delete or reactivate locally; no subscription changed.']
    });

    const OUTCOME_DETAILS = Object.freeze({
      direct: {
        title: 'Direct outcome evidence',
        details: [
          'Class: Direct',
          'Confidence: High',
          'Provenance: ARA-controlled synthetic route plus reconciled first-party fixture event.',
          'Value treatment: Included only in direct recorded synthetic value.',
          'No customer event, message, booking, quote or financial transaction occurred.'
        ]
      },
      assisted: {
        title: 'Assisted outcome evidence',
        details: [
          'Class: Assisted',
          'Confidence: Medium',
          'Provenance: Synthetic ARA exposure plus first-party fixture event and a phone step.',
          'Value treatment: Reported separately from direct value.',
          'No customer event, message, booking, quote or financial transaction occurred.'
        ]
      },
      correlated: {
        title: 'Correlated outcome evidence',
        details: [
          'Class: Correlated',
          'Confidence: Low',
          'Provenance: Synthetic temporal comparison only; contribution and causation are not established.',
          'Value treatment: Excluded from attributable value.',
          'No customer event, message, booking, quote or financial transaction occurred.'
        ]
      },
      unknown: {
        title: 'Unknown outcome evidence',
        details: [
          'Class: Unknown',
          'Confidence: Unresolved',
          'Provenance: Unmatched synthetic first-party fixture event.',
          'Value treatment: Excluded from attributable value.',
          'No customer event, message, booking, quote or financial transaction occurred.'
        ]
      }
    });

    const EVENT_CATALOG = Object.freeze({
      onboarding_step: ['Onboarding step completed', 'Display readiness changed only; no identity was verified and no authority was granted.'],
      diagnostic_released: ['Synthetic scorecard released', 'No provider was contacted and no production observation was collected.'],
      diagnostic_reset: ['Synthetic diagnostic reset', 'Only local display progression changed; no provider was contacted.'],
      fact_proposed: ['Truth Sheet proposal prepared', 'No fact was published and no public surface changed.'],
      fact_approved: ['Truth Sheet proposal approved locally', 'No fact was published and no public surface changed.'],
      action_prepared: ['Governed action prepared', 'No message, booking, quote or customer commitment occurred.'],
      action_reviewed: ['Governed action queued for human review', 'No message, booking, quote or customer commitment occurred.'],
      action_accepted: ['Governed action accepted for demo queue', 'No message, booking, quote or customer commitment occurred.'],
      connector_active_preview: ['Active connector state previewed', 'No OAuth flow ran and no provider account was contacted.'],
      connector_degraded_preview: ['Degraded connector state previewed', 'Affected access failed closed; no provider account was contacted.'],
      connector_revoked_preview: ['Revoked connector state previewed', 'New collection failed closed; no provider account was contacted.'],
      connector_consent: ['Synthetic connector consent recorded', 'No OAuth flow ran, no credential was created and no provider account was contacted.'],
      connector_revoke: ['Synthetic connector revoked locally', 'No provider account was contacted and no production access changed.'],
      invitation_prepared: ['Scoped invitation prepared', 'No identity was provisioned and no message was sent.'],
      transfer_started: ['Ownership-transfer hold preview started', 'No authority or ownership changed.'],
      recovery_compared: ['Recovery points compared', 'Only synthetic checkpoints were compared; no customer data changed.'],
      recovery_restored: ['Restore-as-new-head preview applied', 'No customer data was restored, replaced or changed.'],
      recovery_restore_undo: ['Synthetic restore preview undone', 'No customer data changed.'],
      recovery_delete_pending: ['Recovery point marked pending deletion', 'Only synthetic display state changed; no customer data was deleted.'],
      recovery_delete_undo: ['Pending deletion preview undone', 'No customer data was deleted.'],
      checkout_preview: ['Server-authority checkout explanation reviewed', 'No Stripe object, checkout session or charge was created.'],
      proof_export: ['Synthetic proof JSON exported locally', 'No customer or production data was included or transmitted.'],
      audit_export: ['Synthetic audit JSON exported locally', 'No customer or production data was included or transmitted.']
    });

    const SEED_AUDIT = Object.freeze([
      Object.freeze({ id: 'seed-001', event: 'diagnostic_released', timestamp: '2026-08-28T09:00:00.000Z' }),
      Object.freeze({ id: 'seed-002', event: 'fact_approved', timestamp: '2026-08-29T02:30:00.000Z' }),
      Object.freeze({ id: 'seed-003', event: 'connector_consent', timestamp: '2026-08-30T06:15:00.000Z' }),
      Object.freeze({ id: 'seed-004', event: 'action_reviewed', timestamp: '2026-08-31T11:45:00.000Z' })
    ]);

    const DEFAULT_STATE = Object.freeze({
      activeView: 'overview',
      role: 'owner',
      onboardingCompleted: 4,
      diagnosticState: 'approved',
      factState: 'current',
      actionState: 'not_prepared',
      connectorState: 'active',
      recoveryFilter: 'milestones',
      pendingDeletion: false,
      selectedPlan: 'proof',
      billingState: 'active',
      outcomeFilter: 'all',
      audit: Object.freeze([])
    });

    const suite = (body.dataset.suite || '').trim();
    const suiteLabel = (body.dataset.suiteLabel || '').trim();
    const productContract = (body.dataset.productContract || '').trim();
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(suite) || !suiteLabel || productContract !== 'v1') {
      body.dataset.productBoot = 'invalid-suite';
      return;
    }
    const storageKey = `ara-showcase-product:${suite}:v1`;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nativeDisableTags = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'FIELDSET', 'OPTGROUP']);
    const originalTabIndexes = new WeakMap();
    const receiptTextNodes = new WeakMap();
    let storageAvailable = true;
    let toastTimer = 0;
    let diagnosticToken = 0;
    let diagnosticRunning = false;
    let pendingDialogAction = null;
    let deletionPointIndex = 0;
    let recoveryUndoMode = '';
    let motionPaused = false;
    let eventSequence = 0;

    const makeDefaultState = () => ({
      activeView: DEFAULT_STATE.activeView,
      role: DEFAULT_STATE.role,
      onboardingCompleted: DEFAULT_STATE.onboardingCompleted,
      diagnosticState: DEFAULT_STATE.diagnosticState,
      factState: DEFAULT_STATE.factState,
      actionState: DEFAULT_STATE.actionState,
      connectorState: DEFAULT_STATE.connectorState,
      recoveryFilter: DEFAULT_STATE.recoveryFilter,
      pendingDeletion: DEFAULT_STATE.pendingDeletion,
      selectedPlan: DEFAULT_STATE.selectedPlan,
      billingState: DEFAULT_STATE.billingState,
      outcomeFilter: DEFAULT_STATE.outcomeFilter,
      audit: []
    });

    const isPlainObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
    const enumValue = (value, values, fallback) => values.includes(value) ? value : fallback;
    const cleanTimestamp = (value) => {
      if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)) return null;
      return Number.isNaN(Date.parse(value)) ? null : value;
    };

    const normalizeAudit = (value) => {
      if (!Array.isArray(value)) return [];
      return value.slice(-96).flatMap((item, index) => {
        if (!isPlainObject(item) || !Object.prototype.hasOwnProperty.call(EVENT_CATALOG, item.event)) return [];
        const timestamp = cleanTimestamp(item.timestamp);
        if (!timestamp) return [];
        const safeId = typeof item.id === 'string' && /^[a-z0-9-]{1,64}$/i.test(item.id)
          ? item.id
          : `event-${index}-${Date.parse(timestamp)}`;
        return [{ id: safeId, event: item.event, timestamp }];
      });
    };

    const normalizeState = (value) => {
      const candidate = isPlainObject(value) ? value : {};
      return {
        activeView: enumValue(candidate.activeView, VIEWS, DEFAULT_STATE.activeView),
        role: enumValue(candidate.role, Object.keys(ROLE_CAPABILITIES), DEFAULT_STATE.role),
        onboardingCompleted: Number.isInteger(candidate.onboardingCompleted)
          ? Math.min(7, Math.max(0, candidate.onboardingCompleted))
          : DEFAULT_STATE.onboardingCompleted,
        diagnosticState: enumValue(candidate.diagnosticState, DIAGNOSTIC_STATES, DEFAULT_STATE.diagnosticState),
        factState: enumValue(candidate.factState, ['current', 'review_required'], DEFAULT_STATE.factState),
        actionState: enumValue(candidate.actionState, ACTION_STATES, DEFAULT_STATE.actionState),
        connectorState: enumValue(candidate.connectorState, Object.keys(CONNECTOR_COPY), DEFAULT_STATE.connectorState),
        recoveryFilter: enumValue(candidate.recoveryFilter, ['milestones', 'all'], DEFAULT_STATE.recoveryFilter),
        pendingDeletion: candidate.pendingDeletion === true,
        selectedPlan: enumValue(candidate.selectedPlan, ['proof', 'action'], DEFAULT_STATE.selectedPlan),
        billingState: enumValue(candidate.billingState, Object.keys(BILLING_COPY), DEFAULT_STATE.billingState),
        outcomeFilter: enumValue(candidate.outcomeFilter, ['all', 'direct', 'assisted', 'correlated', 'unknown'], DEFAULT_STATE.outcomeFilter),
        audit: normalizeAudit(candidate.audit)
      };
    };

    const loadState = () => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        return saved ? normalizeState(JSON.parse(saved)) : makeDefaultState();
      } catch (_error) {
        storageAvailable = false;
        return makeDefaultState();
      }
    };

    let state = loadState();

    const persistState = () => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
        storageAvailable = true;
      } catch (_error) {
        storageAvailable = false;
      }
      body.dataset.storageAvailable = String(storageAvailable);
      document.querySelectorAll('[data-storage-status]').forEach((element) => {
        element.textContent = storageAvailable
          ? 'Synthetic display state is stored locally and can be reset.'
          : 'Local storage is unavailable; synthetic display state will last only for this page view.';
      });
    };

    const queryAll = (selector, context = document) => Array.from(context.querySelectorAll(selector));
    const first = (selector, context = document) => context.querySelector(selector);

    const setText = (selector, text, context = document) => {
      queryAll(selector, context).forEach((element) => {
        element.textContent = text;
      });
    };

    const setContainerText = (element, text, preferredSelector = '') => {
      if (!element) return;
      const preferred = preferredSelector ? element.querySelector(preferredSelector) : null;
      if (preferred) {
        preferred.textContent = text;
        return;
      }
      const semanticCopy = element.querySelector('[data-receipt-copy], [data-status-copy], p, span');
      if (semanticCopy && !semanticCopy.matches('button')) {
        semanticCopy.textContent = text;
        return;
      }
      if (element.childElementCount === 0) {
        element.textContent = text;
        return;
      }
      let textNode = receiptTextNodes.get(element);
      if (!textNode || textNode.parentNode !== element) {
        textNode = document.createTextNode('');
        element.prepend(textNode);
        receiptTextNodes.set(element, textNode);
      }
      textNode.nodeValue = `${text} `;
    };

    const setReceipt = (selector, text, visible = true) => {
      queryAll(selector).forEach((element) => {
        setContainerText(element, text);
        element.hidden = !visible;
        element.setAttribute('aria-live', 'polite');
        element.setAttribute('aria-atomic', 'true');
      });
    };

    const setProgress = (selector, value, text) => {
      const safeValue = Math.min(100, Math.max(0, value));
      queryAll(selector).forEach((element) => {
        element.dataset.progress = String(safeValue);
        element.style.setProperty('--product-progress', `${safeValue}%`);
        element.setAttribute('aria-valuemin', '0');
        element.setAttribute('aria-valuemax', '100');
        element.setAttribute('aria-valuenow', String(safeValue));
        element.setAttribute('aria-valuetext', text);
        if (element instanceof HTMLProgressElement) {
          element.max = 100;
          element.value = safeValue;
          element.textContent = text;
          return;
        }
        const label = element.querySelector('[data-progress-label], [data-progress-value]');
        if (label) label.textContent = text;
        else if (element.childElementCount === 0) element.textContent = text;
      });
    };

    const announce = (message) => {
      const toast = first('[data-toast]');
      if (!toast) return;
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
      toast.classList.add('is-visible');
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), reducedMotionQuery.matches ? 1800 : 3600);
    };

    const selectedRoleCapabilities = () => ROLE_CAPABILITIES[state.role] || [];
    const can = (capability) => selectedRoleCapabilities().includes(capability);
    const requiredCapabilities = (element, fallback = '') => {
      const declared = element?.getAttribute('data-requires') || fallback;
      return declared.split(/[\s,]+/).filter(Boolean);
    };
    const meetsRequirements = (element, fallback = '') => requiredCapabilities(element, fallback).every((item) => can(item));

    const setDisabled = (element, disabled, reason = '') => {
      if (!element) return;
      element.classList.toggle('is-disabled', disabled);
      if (disabled) {
        element.setAttribute('aria-disabled', 'true');
        if (reason) element.dataset.disabledReason = reason;
        if (nativeDisableTags.has(element.tagName)) {
          element.disabled = true;
        } else {
          if (!originalTabIndexes.has(element)) originalTabIndexes.set(element, element.getAttribute('tabindex'));
          element.setAttribute('tabindex', '-1');
        }
      } else {
        element.removeAttribute('aria-disabled');
        delete element.dataset.disabledReason;
        if (nativeDisableTags.has(element.tagName)) {
          element.disabled = false;
        } else if (originalTabIndexes.has(element)) {
          const original = originalTabIndexes.get(element);
          if (original === null) element.removeAttribute('tabindex');
          else element.setAttribute('tabindex', original);
          originalTabIndexes.delete(element);
        }
      }
    };

    const appendAudit = (event) => {
      if (!Object.prototype.hasOwnProperty.call(EVENT_CATALOG, event)) return;
      eventSequence += 1;
      const now = new Date();
      const timestamp = now.toISOString();
      state.audit = state.audit.concat({
        id: `event-${now.getTime()}-${eventSequence}`,
        event,
        timestamp
      }).slice(-96);
      persistState();
      renderAudit();
    };

    const allAuditEvents = () => SEED_AUDIT.concat(state.audit);
    const latestEventAmong = (events) => {
      for (let index = state.audit.length - 1; index >= 0; index -= 1) {
        if (events.includes(state.audit[index].event)) return state.audit[index].event;
      }
      return '';
    };

    const closeMobileNavigation = () => {
      const nav = first('[data-product-nav]');
      if (nav) nav.classList.remove('is-open');
      queryAll('[data-product-nav-toggle], [data-nav-toggle]').forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
      body.dataset.productNavOpen = 'false';
    };

    const toggleMobileNavigation = (toggle) => {
      const nav = first('[data-product-nav]');
      if (!nav) return;
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      queryAll('[data-product-nav-toggle], [data-nav-toggle]').forEach((control) => control.setAttribute('aria-expanded', String(opening)));
      nav.classList.toggle('is-open', opening);
      body.dataset.productNavOpen = String(opening);
    };

    const validHashView = () => {
      let hash = '';
      try {
        hash = decodeURIComponent(window.location.hash.replace(/^#/, '')).toLowerCase();
      } catch (_error) {
        hash = '';
      }
      return VIEWS.includes(hash) && first(`[data-view="${hash}"]`) ? hash : '';
    };

    const updateHash = (view) => {
      const nextHash = `#${view}`;
      if (window.location.hash === nextHash) return;
      try {
        window.history.replaceState(null, '', nextHash);
      } catch (_error) {
        // Navigation remains functional when history mutation is unavailable.
      }
    };

    const activateView = (requestedView, options = {}) => {
      const view = VIEWS.includes(requestedView) && first(`[data-view="${requestedView}"]`) ? requestedView : 'overview';
      state.activeView = view;
      queryAll('[data-view]').forEach((section) => {
        const active = section.dataset.view === view;
        section.hidden = !active;
        section.classList.toggle('is-active', active);
        section.setAttribute('aria-hidden', String(!active));
        if (active) section.removeAttribute('inert');
        else section.setAttribute('inert', '');
      });
      queryAll('[data-view-target]').forEach((control) => {
        const active = control.dataset.viewTarget === view;
        control.classList.toggle('is-active', active);
        control.setAttribute('aria-pressed', String(active));
        control.setAttribute('aria-selected', String(active));
        if (active) control.setAttribute('aria-current', 'page');
        else control.removeAttribute('aria-current');
      });
      const [title, summary] = VIEW_COPY[view];
      setText('[data-page-title]', title);
      setText('[data-page-summary]', summary);
      setText('[data-current-view]:not(body)', title);
      body.dataset.currentView = view;
      document.title = `${title} — ARA ${suiteLabel} synthetic workspace`;
      if (options.updateHash !== false) updateHash(view);
      closeMobileNavigation();
      if (options.scrollTop === true) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      persistState();
    };

    const renderCapabilities = () => {
      queryAll('[data-requires]').forEach((element) => {
        const allowed = meetsRequirements(element);
        setDisabled(element, !allowed, allowed ? '' : 'Unavailable in this synthetic role preview');
      });
      queryAll('[data-capability]').forEach((element) => {
        const capabilities = (element.dataset.capability || '').split(/[\s,]+/).filter(Boolean);
        const allowed = capabilities.length === 0 || capabilities.every((item) => can(item));
        element.classList.toggle('is-disabled', !allowed);
        element.setAttribute('aria-disabled', String(!allowed));
      });
    };

    const renderRole = () => {
      queryAll('[data-role]').forEach((control) => {
        const active = control.dataset.role === state.role;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('is-active', active);
      });
      const [label, copy] = ROLE_COPY[state.role];
      setText('[data-role-label]', `${label} preview`);
      setText('[data-role-copy]', copy);
      body.dataset.productRole = state.role;
    };

    const renderOnboarding = () => {
      const steps = queryAll('[data-onboarding-step]');
      steps.forEach((step, index) => {
        const complete = index < state.onboardingCompleted;
        const current = index === state.onboardingCompleted && state.onboardingCompleted < steps.length;
        step.classList.toggle('is-complete', complete);
        step.classList.toggle('is-current', current);
        step.classList.toggle('is-pending', !complete && !current);
        step.dataset.state = complete ? 'complete' : current ? 'current' : 'pending';
        if (current) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
        const status = step.querySelector('[data-step-status]');
        if (status) status.textContent = complete ? 'Complete' : current ? 'Next' : 'Pending';
      });
      const total = steps.length || 7;
      const completed = Math.min(state.onboardingCompleted, total);
      setProgress('[data-onboarding-progress]', Math.round((completed / total) * 100), `${completed} of ${total} complete`);
      queryAll('[data-onboarding-next]').forEach((button) => {
        const finished = completed >= total;
        setDisabled(button, finished || !meetsRequirements(button, 'edit'), finished ? 'Onboarding preview complete' : 'Role cannot edit onboarding');
        button.textContent = finished ? 'Onboarding complete' : `Complete step ${completed + 1}`;
      });
    };

    const renderDiagnostic = () => {
      const current = DIAGNOSTIC_COPY[state.diagnosticState];
      setText('[data-diagnostic-state]:not(body)', current.label);
      setText('[data-diagnostic-copy]', current.copy);
      setProgress('[data-diagnostic-progress]', current.progress, `${current.progress}% · ${current.label}`);
      queryAll('[data-diagnostic-stage]').forEach((stage) => {
        const stageIndex = DIAGNOSTIC_STATES.indexOf(stage.dataset.diagnosticStage);
        const currentIndex = DIAGNOSTIC_STATES.indexOf(state.diagnosticState);
        stage.classList.toggle('is-current', stageIndex === currentIndex);
        stage.classList.toggle('is-complete', stageIndex < currentIndex || state.diagnosticState === 'released');
        if (stageIndex === currentIndex) stage.setAttribute('aria-current', 'step');
        else stage.removeAttribute('aria-current');
      });
      queryAll('[data-diagnostic-start]').forEach((button) => {
        const released = state.diagnosticState === 'released';
        const allowed = meetsRequirements(button, 'action');
        setDisabled(button, diagnosticRunning || released || !allowed, diagnosticRunning ? 'Synthetic diagnostic running' : released ? 'Scorecard already released' : 'Role cannot start diagnostics');
        button.textContent = diagnosticRunning ? 'Running synthetic diagnostic…' : released ? 'Synthetic scorecard released' : 'Start synthetic diagnostic';
        button.setAttribute('aria-busy', String(diagnosticRunning));
      });
      queryAll('[data-diagnostic-reset]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'action'), 'Role cannot reset diagnostics'));
      queryAll('[data-scorecard-fresh]').forEach((element) => {
        const fresh = state.diagnosticState === 'released';
        element.classList.toggle('is-fresh', fresh);
        element.dataset.fresh = String(fresh);
        if (element.childElementCount === 0) element.textContent = fresh ? 'Fresh · synthetic release' : 'Awaiting synthetic release';
      });
      body.dataset.diagnosticState = state.diagnosticState;
    };

    const factSampleRows = () => {
      const rows = queryAll('[data-fact-row]');
      const explicit = rows.filter((row) => /service[-_ ]?corridor/i.test([
        row.dataset.factRow,
        row.dataset.factId,
        row.dataset.factKey
      ].filter(Boolean).join(' ')));
      return explicit.length ? explicit : rows.slice(0, 1);
    };

    const renderTruth = () => {
      const reviewRequired = state.factState === 'review_required';
      setText('[data-fact-state]:not(body)', reviewRequired ? 'Review required' : 'Current');
      factSampleRows().forEach((row) => {
        row.dataset.state = state.factState;
        row.classList.toggle('is-review-required', reviewRequired);
        row.classList.toggle('is-current', !reviewRequired);
        const rowStatus = row.querySelector('[data-fact-row-state], [data-row-state]');
        if (rowStatus) rowStatus.textContent = reviewRequired ? 'Review required' : 'Current';
      });
      queryAll('[data-fact-propose]').forEach((button) => {
        setDisabled(button, reviewRequired || !meetsRequirements(button, 'edit'), reviewRequired ? 'Proposal already awaiting review' : 'Role cannot edit facts');
      });
      queryAll('[data-fact-approve]').forEach((button) => {
        setDisabled(button, !reviewRequired || !meetsRequirements(button, 'approve'), !reviewRequired ? 'No proposal awaiting approval' : 'Role cannot approve facts');
      });
      setReceipt(
        '[data-fact-receipt]',
        reviewRequired
          ? 'Synthetic service-corridor proposal awaits human approval. It was not published and no public surface changed.'
          : 'The synthetic service-corridor sample is current. No publication or public-surface change occurred.',
        true
      );
      setText('[data-fact-receipt-title]', reviewRequired ? 'Proposal awaiting review' : 'No pending proposal');
      body.dataset.factState = state.factState;
    };

    const actionStepIndex = (value) => {
      const normalized = String(value || '').toLowerCase().replace(/-/g, '_');
      if (['prepare', 'prepared', 'not_prepared'].includes(normalized)) return 0;
      if (['review', 'human_review', 'queued_for_human_review'].includes(normalized)) return 1;
      if (['approve', 'accept', 'accepted_for_demo_queue'].includes(normalized)) return 2;
      return -1;
    };

    const renderActions = () => {
      const currentIndex = ACTION_STATES.indexOf(state.actionState) - 1;
      const selected = ACTION_COPY[state.actionState];
      setText('[data-action-state]:not(body)', selected.label);
      queryAll('[data-action-step]').forEach((element) => {
        const index = actionStepIndex(element.dataset.actionStep);
        if (index < 0) {
          element.textContent = selected.step;
          return;
        }
        const complete = currentIndex >= index;
        const current = state.actionState === 'accepted_for_demo_queue' ? index === 2 : index === currentIndex + 1;
        element.classList.toggle('is-complete', complete);
        element.classList.toggle('is-current', current);
        element.dataset.state = complete ? 'complete' : current ? 'current' : 'pending';
        if (current) element.setAttribute('aria-current', 'step');
        else element.removeAttribute('aria-current');
      });
      const lifecycleButtons = [
        ['[data-action-prepare]', state.actionState === 'not_prepared', 'action'],
        ['[data-action-review]', state.actionState === 'prepared', 'action'],
        ['[data-action-approve]', state.actionState === 'queued_for_human_review', 'action']
      ];
      lifecycleButtons.forEach(([selector, correctStage, fallbackCapability]) => {
        queryAll(selector).forEach((button) => {
          setDisabled(button, !correctStage || !meetsRequirements(button, fallbackCapability), !correctStage ? 'Complete the preceding lifecycle stage first' : 'Role cannot perform this action');
        });
      });
      setReceipt('[data-action-receipt]', selected.receipt, true);
      setText('[data-action-receipt-title]', {
        not_prepared: 'No action prepared',
        prepared: 'Prepared locally',
        queued_for_human_review: 'Awaiting synthetic human review',
        accepted_for_demo_queue: 'Accepted for demo queue'
      }[state.actionState]);
      body.dataset.actionState = state.actionState;
    };

    const renderConnectors = () => {
      const selected = CONNECTOR_COPY[state.connectorState];
      queryAll('[data-connector-state]:not(body)').forEach((control) => {
        const active = control.dataset.connectorState === state.connectorState;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('is-active', active);
        setDisabled(control, !meetsRequirements(control, 'connector'), 'Role cannot manage connectors');
      });
      setText('[data-connector-status]', selected.label);
      setText('[data-connector-copy]', selected.copy);
      setText('[data-connector-coverage]', selected.coverage);
      setText('[data-outcome-coverage], [data-proof-coverage]', selected.outcome);
      queryAll('[data-connector-consent]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'connector'), 'Role cannot manage connector consent'));
      queryAll('[data-connector-revoke]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'connector'), 'Role cannot revoke connectors'));
      queryAll('[data-connector-dependent], [data-requires-connector]').forEach((element) => {
        setDisabled(element, state.connectorState !== 'active' || !meetsRequirements(element), state.connectorState === 'active' ? 'Role cannot perform this action' : 'Connector is fail-closed');
      });
      body.dataset.connectorState = state.connectorState;
    };

    const renderTeam = () => {
      queryAll('[data-invite-prepare]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'invite'), 'Role cannot prepare invitations'));
      queryAll('[data-transfer-start]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'transfer'), 'Role cannot transfer ownership'));
      const latest = latestEventAmong(['invitation_prepared', 'transfer_started']);
      if (latest === 'invitation_prepared') {
        setReceipt('[data-team-receipt]', 'Invitation prepared for Jordan Lee (fictional), scoped to Hope Island for seven days. No identity was provisioned and no message was sent.', true);
        setText('[data-team-receipt-title]', 'Scoped invitation prepared');
      } else if (latest === 'transfer_started') {
        setReceipt('[data-team-receipt]', 'Synthetic 72-hour dual-confirmation ownership-transfer hold started. No authority or ownership changed.', true);
        setText('[data-team-receipt-title]', 'Ownership transfer hold started');
      } else {
        setReceipt('[data-team-receipt]', 'No team operation is pending. Browser roles do not authenticate or authorise anyone.', true);
        setText('[data-team-receipt-title]', 'No pending team operation');
      }
    };

    const isMilestone = (point) => point.dataset.milestone === 'true'
      || point.dataset.recoveryPoint === 'milestone'
      || point.dataset.kind === 'milestone'
      || point.classList.contains('is-milestone');

    const recoveryCheckboxes = () => queryAll('[data-recovery-point] input[type="checkbox"], [data-recovery-select]');

    const renderRecovery = () => {
      const points = queryAll('[data-recovery-point]');
      queryAll('[data-recovery-filter]').forEach((control) => {
        const active = control.dataset.recoveryFilter === state.recoveryFilter;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('is-active', active);
      });
      points.forEach((point, index) => {
        point.hidden = state.recoveryFilter === 'milestones' && !isMilestone(point);
        const pending = state.pendingDeletion && index === Math.min(deletionPointIndex, Math.max(0, points.length - 1));
        point.classList.toggle('is-pending-deletion', pending);
        point.dataset.pendingDeletion = String(pending);
        const status = point.querySelector('[data-recovery-point-state], [data-point-state]');
        if (status && pending) status.textContent = 'Pending deletion · 24-hour Undo';
        else if (status && status.dataset.defaultState) status.textContent = status.dataset.defaultState;
      });
      const selected = recoveryCheckboxes().filter((checkbox) => checkbox.checked).length;
      setText('[data-recovery-selected-count], [data-recovery-compare-count], [data-compare-count]', String(selected));
      queryAll('[data-recovery-compare]').forEach((button) => setDisabled(button, selected !== 2, 'Select exactly two checkpoints'));
      queryAll('[data-recovery-restore]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'restore'), 'Role cannot restore checkpoints'));
      queryAll('[data-recovery-delete]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'delete'), 'Role cannot delete checkpoints'));

      if (state.pendingDeletion) recoveryUndoMode = 'delete';
      else {
        const latest = latestEventAmong(['recovery_restored', 'recovery_restore_undo', 'recovery_delete_pending', 'recovery_delete_undo']);
        recoveryUndoMode = latest === 'recovery_restored' ? 'restore' : '';
      }
      queryAll('[data-recovery-undo], [data-recovery-restore-undo]').forEach((button) => {
        button.hidden = !recoveryUndoMode;
        button.textContent = recoveryUndoMode === 'delete' ? 'Undo pending deletion' : 'Undo synthetic restore';
      });
      if (recoveryUndoMode === 'delete') {
        setReceipt('[data-recovery-receipt]', 'Synthetic checkpoint is pending deletion for 24 hours and can be undone. No customer data was deleted.', true);
        setText('[data-recovery-receipt-title]', 'Pending deletion · Undo available');
      } else if (recoveryUndoMode === 'restore') {
        setReceipt('[data-recovery-receipt]', 'Restore-as-new-head applied to synthetic display history with Undo available. No customer data was restored, replaced or changed.', true);
        setText('[data-recovery-receipt-title]', 'Restore preview applied · Undo available');
      } else {
        const latest = latestEventAmong(['recovery_compared', 'recovery_restore_undo', 'recovery_delete_undo']);
        const copy = latest === 'recovery_compared'
          ? 'Two synthetic recovery points were compared locally. No customer data changed.'
          : 'No recovery operation is pending. No customer data has been restored or deleted.';
        setReceipt('[data-recovery-receipt]', copy, true);
        setText('[data-recovery-receipt-title]', latest === 'recovery_compared' ? 'Comparison prepared locally' : 'No recovery operation pending');
      }
      body.dataset.pendingDeletion = String(state.pendingDeletion);
    };

    const planKey = (value) => String(value || '').toLowerCase().includes('action') ? 'action' : 'proof';
    const planName = (value) => value === 'action' ? 'ARA Action' : 'ARA Proof';

    const renderBilling = () => {
      queryAll('[data-plan]').forEach((control) => {
        const active = planKey(control.dataset.plan) === state.selectedPlan;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('is-selected', active);
        setDisabled(control, !meetsRequirements(control, 'billing'), 'Role cannot change plan previews');
      });
      setText('[data-plan-summary]', `${planName(state.selectedPlan)} selected for preview · no checkout created`);
      setText('[data-selected-plan]:not(body)', `${planName(state.selectedPlan)} · A$${state.selectedPlan === 'action' ? '399' : '149'}`);
      queryAll('[data-billing-state]:not(body)').forEach((control) => {
        const active = control.dataset.billingState === state.billingState;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('is-active', active);
        setDisabled(control, !meetsRequirements(control, 'billing'), 'Role cannot change entitlement previews');
      });
      queryAll('[data-billing-banner]').forEach((banner) => {
        const [title, copy] = BILLING_COPY[state.billingState];
        banner.dataset.state = state.billingState;
        const titleElement = banner.querySelector('[data-billing-title], strong');
        const copyElement = banner.querySelector('[data-billing-copy], span, p');
        if (titleElement) titleElement.textContent = title;
        if (copyElement && copyElement !== titleElement) copyElement.textContent = copy;
        if (!titleElement && !copyElement) banner.textContent = `${title}. ${copy}`;
      });
      queryAll('[data-checkout-preview]').forEach((button) => setDisabled(button, !meetsRequirements(button, 'billing'), 'Role cannot preview checkout authority'));
      body.dataset.billingState = state.billingState;
      body.dataset.selectedPlan = state.selectedPlan;
    };

    const renderOutcomes = () => {
      queryAll('[data-outcome-filter]:not(body)').forEach((control) => {
        const active = control.dataset.outcomeFilter === state.outcomeFilter;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('is-active', active);
      });
      queryAll('[data-outcome-row]').forEach((row) => {
        row.hidden = state.outcomeFilter !== 'all' && row.dataset.outcomeRow !== state.outcomeFilter;
      });
      body.dataset.outcomeFilter = state.outcomeFilter;
    };

    const createAuditItem = (record) => {
      const item = document.createElement('li');
      item.className = 'audit-event';
      item.dataset.auditEvent = record.event;
      const title = document.createElement('strong');
      const time = document.createElement('time');
      const boundary = document.createElement('span');
      const [label, effect] = EVENT_CATALOG[record.event];
      title.textContent = label;
      time.dateTime = record.timestamp;
      time.textContent = record.timestamp.replace('T', ' ').replace('.000Z', ' UTC');
      boundary.textContent = effect;
      item.append(title, time, boundary);
      return item;
    };

    function renderAudit() {
      const events = allAuditEvents().slice().reverse();
      queryAll('[data-audit-list]').forEach((list) => {
        const fragment = document.createDocumentFragment();
        events.forEach((record) => fragment.append(createAuditItem(record)));
        list.replaceChildren(fragment);
      });
      setText('[data-audit-count]', String(events.length));
      queryAll('[data-audit-count]').forEach((element) => element.setAttribute('aria-live', 'polite'));
    }

    const renderMotion = () => {
      const reduced = reducedMotionQuery.matches;
      body.dataset.motionReduced = String(reduced);
      if (reduced) motionPaused = true;
      body.dataset.motionPaused = String(motionPaused);
      queryAll('[data-motion-toggle]').forEach((button) => {
        button.setAttribute('aria-pressed', String(motionPaused));
        button.disabled = reduced;
        button.textContent = reduced ? 'Motion reduced' : motionPaused ? 'Resume motion' : 'Pause motion';
      });
    };

    const renderAll = () => {
      renderRole();
      renderCapabilities();
      renderOnboarding();
      renderDiagnostic();
      renderTruth();
      renderActions();
      renderConnectors();
      renderTeam();
      renderRecovery();
      renderBilling();
      renderOutcomes();
      renderAudit();
      renderMotion();
      activateView(state.activeView, { updateHash: false });
    };

    const configureDialog = ({ kicker, title, copy, details = [], confirmLabel = 'Confirm', onConfirm }) => {
      const dialog = first('#product-dialog');
      if (!dialog) return false;
      setText('[data-dialog-kicker]', kicker, dialog);
      setText('[data-dialog-title]', title, dialog);
      setText('[data-dialog-copy]', copy, dialog);
      const detailsElement = first('[data-dialog-details]', dialog);
      if (detailsElement) {
        const fragment = document.createDocumentFragment();
        details.forEach((detail) => {
          const item = document.createElement(detailsElement.matches('ul, ol') ? 'li' : 'p');
          item.textContent = detail;
          fragment.append(item);
        });
        detailsElement.replaceChildren(fragment);
        detailsElement.hidden = details.length === 0;
      }
      const confirm = first('[data-dialog-confirm]', dialog);
      if (confirm) {
        confirm.textContent = confirmLabel;
        confirm.disabled = false;
      }
      pendingDialogAction = typeof onConfirm === 'function' ? onConfirm : null;
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
      }
      return true;
    };

    const closeDialog = () => {
      const dialog = first('#product-dialog');
      if (!dialog) return;
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      pendingDialogAction = null;
    };

    const runDiagnostic = async () => {
      if (diagnosticRunning || state.diagnosticState === 'released') return;
      diagnosticRunning = true;
      const token = ++diagnosticToken;
      renderDiagnostic();
      const currentIndex = DIAGNOSTIC_STATES.indexOf(state.diagnosticState);
      for (let index = currentIndex + 1; index < DIAGNOSTIC_STATES.length; index += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, reducedMotionQuery.matches ? 40 : 320));
        if (token !== diagnosticToken) return;
        state.diagnosticState = DIAGNOSTIC_STATES[index];
        persistState();
        renderDiagnostic();
      }
      if (token !== diagnosticToken) return;
      diagnosticRunning = false;
      appendAudit('diagnostic_released');
      renderDiagnostic();
      announce('Synthetic scorecard released. No provider was contacted.');
    };

    const resetDiagnostic = () => {
      diagnosticToken += 1;
      diagnosticRunning = false;
      state.diagnosticState = 'approved';
      appendAudit('diagnostic_reset');
      renderDiagnostic();
      announce('Synthetic diagnostic reset locally. No provider was contacted.');
    };

    const setConnectorState = (connectorState, auditEvent = '') => {
      if (!Object.prototype.hasOwnProperty.call(CONNECTOR_COPY, connectorState)) return;
      state.connectorState = connectorState;
      persistState();
      renderConnectors();
      if (auditEvent) appendAudit(auditEvent);
      announce(`${CONNECTOR_COPY[connectorState].label}. ${EVENT_CATALOG[auditEvent]?.[1] || 'No provider account was contacted.'}`);
    };

    const recoveryPointContext = (control) => {
      const points = queryAll('[data-recovery-point]');
      const point = control.closest('[data-recovery-point]');
      const index = Math.max(0, points.indexOf(point));
      const label = control.dataset.label || point?.dataset.label || `Synthetic recovery point ${index + 1}`;
      return { index, label: String(label).slice(0, 100) };
    };

    const controlledDisplayState = () => ({
      activeView: state.activeView,
      role: state.role,
      onboardingCompleted: state.onboardingCompleted,
      diagnosticState: state.diagnosticState,
      factState: state.factState,
      actionState: state.actionState,
      connectorState: state.connectorState,
      recoveryFilter: state.recoveryFilter,
      pendingDeletion: state.pendingDeletion,
      selectedPlan: state.selectedPlan,
      billingState: state.billingState,
      outcomeFilter: state.outcomeFilter
    });

    const proofExportData = () => ({
      schema: 'ara-synthetic-proof-pack-v1',
      suite,
      boundary: {
        mode: 'synthetic review only',
        production: false,
        statement: 'This local file contains fictional fixtures only. No customer data, credentials, provider access, messages, bookings, publication, restoration, deletion, Stripe object or external side effect is included.'
      },
      organisation: {
        name: 'Coastal Form & Flow Pty Ltd',
        fictional: true,
        locations: ['Hope Island', 'Coomera'],
        primaryService: 'retaining-wall construction',
        discoveryCorridor: [
          'Hope Island',
          'Coomera',
          'Helensvale',
          'Upper Coomera',
          'Pimpama'
        ]
      },
      surfaces: ['ChatGPT', 'Google AI', 'Google Maps', 'Gemini', 'Claude', 'Copilot', 'Perplexity', 'Grok'],
      diagnostic: {
        independentSyntheticRuns: 2,
        measures: {
          visibility: { baselinePercent: 62, currentPercent: 74 },
          accuracy: { baselinePercent: 87, currentPercent: 92 },
          enquiryPath: { baselinePercent: 54, currentPercent: 68 }
        }
      },
      plans: [
        { id: 'proof', name: 'ARA Proof', amountAUD: 149, cadence: 'per active location/month', gst: 'excluded', status: 'internal test hypothesis only' },
        { id: 'action', name: 'ARA Action', amountAUD: 399, cadence: 'per active location/month', gst: 'excluded', status: 'internal test hypothesis only' }
      ],
      outcomes: [
        { class: 'Direct', confidence: 'High', valueTreatment: 'included in direct recorded synthetic value' },
        { class: 'Assisted', confidence: 'Medium', valueTreatment: 'reported separately from direct value' },
        { class: 'Correlated', confidence: 'Low', valueTreatment: 'excluded from attributable value' },
        { class: 'Unknown', confidence: 'Unresolved', valueTreatment: 'excluded from attributable value' }
      ],
      displayState: controlledDisplayState()
    });

    const auditExportData = () => ({
      schema: 'ara-synthetic-audit-v1',
      suite,
      boundary: {
        mode: 'synthetic review only',
        production: false,
        statement: 'Payload-free local audit. No customer data, personal data, credentials, form input, browser environment or external side effect is included.'
      },
      events: allAuditEvents().map((record) => ({
        id: record.id,
        event: record.event,
        label: EVENT_CATALOG[record.event][0],
        timestamp: record.timestamp,
        externalEffect: EVENT_CATALOG[record.event][1]
      }))
    });

    const downloadJson = (filename, data, successMessage) => {
      let url = '';
      try {
        const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
        url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.hidden = true;
        anchor.rel = 'noopener';
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        announce(successMessage);
      } catch (_error) {
        if (url) window.URL.revokeObjectURL(url);
        announce('The synthetic local download could not be created. No data was transmitted.');
      }
    };

    const resetDemo = () => {
      diagnosticToken += 1;
      diagnosticRunning = false;
      deletionPointIndex = 0;
      recoveryUndoMode = '';
      state = makeDefaultState();
      try {
        window.localStorage.removeItem(storageKey);
      } catch (_error) {
        storageAvailable = false;
      }
      persistState();
      renderAll();
      activateView('overview', { scrollTop: true });
      announce('Synthetic demo state reset. No customer, provider, billing or production state changed.');
    };

    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('button, a, input, [role="button"]') : null;
      if (!target) return;
      if (target.getAttribute('aria-disabled') === 'true' || target.disabled) {
        event.preventDefault();
        announce(`${target.dataset.disabledReason || 'This control is unavailable in the selected synthetic role preview'}. No external action occurred.`);
        return;
      }

      if (target.matches('[data-dialog-cancel]')) {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (target.matches('[data-dialog-confirm]')) {
        event.preventDefault();
        const action = pendingDialogAction;
        pendingDialogAction = null;
        const dialog = first('#product-dialog');
        if (dialog && typeof dialog.close === 'function' && dialog.open) dialog.close();
        else dialog?.removeAttribute('open');
        if (action) action();
        return;
      }
      if (target.matches('[data-product-nav-toggle], [data-nav-toggle]')) {
        event.preventDefault();
        toggleMobileNavigation(target);
        return;
      }
      if (target.matches('[data-view-target]')) {
        event.preventDefault();
        activateView(target.dataset.viewTarget, { scrollTop: true });
        return;
      }
      if (target.matches('[data-role]')) {
        const role = target.dataset.role;
        if (!Object.prototype.hasOwnProperty.call(ROLE_CAPABILITIES, role)) return;
        state.role = role;
        persistState();
        renderAll();
        announce(`${ROLE_COPY[role][0]} browser preview selected. This does not authenticate or authorise anyone.`);
        return;
      }
      if (target.matches('[data-onboarding-next]')) {
        const total = queryAll('[data-onboarding-step]').length || 7;
        if (state.onboardingCompleted >= total) return;
        state.onboardingCompleted += 1;
        appendAudit('onboarding_step');
        renderOnboarding();
        announce(`Synthetic onboarding: ${state.onboardingCompleted} of ${total} complete. No identity or authority changed.`);
        return;
      }
      if (target.matches('[data-diagnostic-start]')) {
        void runDiagnostic();
        return;
      }
      if (target.matches('[data-diagnostic-reset]')) {
        resetDiagnostic();
        return;
      }
      if (target.matches('[data-fact-propose]')) {
        configureDialog({
          kicker: 'Truth Sheet · synthetic proposal',
          title: 'Propose service-corridor change?',
          copy: 'Confirmation moves the fictional sample to review required. It does not publish anything.',
          details: [
            'Fixture: Coastal Form & Flow Pty Ltd — fictional.',
            'Scope: five approved Northern Gold Coast–Logan South localities.',
            'External effect: no public surface, provider or customer record will change.'
          ],
          confirmLabel: 'Prepare synthetic proposal',
          onConfirm: () => {
            state.factState = 'review_required';
            appendAudit('fact_proposed');
            renderTruth();
            announce('Synthetic fact proposal prepared for review. Nothing was published and no public surface changed.');
          }
        });
        return;
      }
      if (target.matches('[data-fact-approve]')) {
        configureDialog({
          kicker: 'Truth Sheet · human approval',
          title: 'Approve the synthetic proposal?',
          copy: 'Confirmation returns the local service-corridor sample to current without publishing it.',
          details: [
            'Approval is a browser-only role preview, not authentication or authorisation.',
            'External effect: no public surface, provider or customer record will change.'
          ],
          confirmLabel: 'Approve synthetic proposal',
          onConfirm: () => {
            state.factState = 'current';
            appendAudit('fact_approved');
            renderTruth();
            announce('Synthetic fact approved locally. Nothing was published and no public surface changed.');
          }
        });
        return;
      }
      if (target.matches('[data-action-prepare]')) {
        configureDialog({
          kicker: 'Governed action · prepare',
          title: 'Prepare this synthetic action?',
          copy: 'This creates a local preparation receipt only.',
          details: ['No message, booking, quote or customer commitment will occur.'],
          confirmLabel: 'Prepare action',
          onConfirm: () => {
            state.actionState = 'prepared';
            appendAudit('action_prepared');
            renderActions();
            announce(ACTION_COPY.prepared.receipt);
          }
        });
        return;
      }
      if (target.matches('[data-action-review]')) {
        configureDialog({
          kicker: 'Governed action · review',
          title: 'Queue for synthetic human review?',
          copy: 'This advances local display state to a human-review queue only.',
          details: ['No message, booking, quote or customer commitment will occur.'],
          confirmLabel: 'Queue for human review',
          onConfirm: () => {
            state.actionState = 'queued_for_human_review';
            appendAudit('action_reviewed');
            renderActions();
            announce(ACTION_COPY.queued_for_human_review.receipt);
          }
        });
        return;
      }
      if (target.matches('[data-action-approve]')) {
        configureDialog({
          kicker: 'Governed action · accept',
          title: 'Accept for the demo queue?',
          copy: 'This is the final synthetic lifecycle stage, not a send or booking instruction.',
          details: ['No message, booking, quote or customer commitment will occur.'],
          confirmLabel: 'Accept for demo queue',
          onConfirm: () => {
            state.actionState = 'accepted_for_demo_queue';
            appendAudit('action_accepted');
            renderActions();
            announce(ACTION_COPY.accepted_for_demo_queue.receipt);
          }
        });
        return;
      }
      if (target.matches('[data-connector-state]')) {
        const connectorState = target.dataset.connectorState;
        const eventName = {
          active: 'connector_active_preview',
          degraded: 'connector_degraded_preview',
          revoked: 'connector_revoked_preview'
        }[connectorState];
        setConnectorState(connectorState, eventName);
        return;
      }
      if (target.matches('[data-connector-consent]')) {
        configureDialog({
          kicker: 'Connector · purpose-bound consent',
          title: 'Record synthetic connector consent?',
          copy: 'This returns the local connector preview to active for its fixed read-only purpose.',
          details: [
            'No OAuth flow will run.',
            'No credential will be requested or stored.',
            'No provider account will be contacted.'
          ],
          confirmLabel: 'Record synthetic consent',
          onConfirm: () => setConnectorState('active', 'connector_consent')
        });
        return;
      }
      if (target.matches('[data-connector-revoke]')) {
        configureDialog({
          kicker: 'Connector · revoke',
          title: 'Revoke the synthetic connector?',
          copy: 'This immediately blocks new collection and affected actions in local display state.',
          details: [
            'Historical synthetic evidence remains visibly identified.',
            'No OAuth flow or provider account will be contacted.'
          ],
          confirmLabel: 'Revoke synthetic connector',
          onConfirm: () => setConnectorState('revoked', 'connector_revoke')
        });
        return;
      }
      if (target.matches('[data-invite-prepare]')) {
        configureDialog({
          kicker: 'Team · scoped invitation',
          title: 'Prepare a fictional invitation?',
          copy: 'Create a named, seven-day, location-scoped receipt for review.',
          details: [
            'Invitee: Jordan Lee — fictional.',
            'Scope: Hope Island only · expires after seven days.',
            'No identity will be provisioned and no message will be sent.'
          ],
          confirmLabel: 'Prepare invitation',
          onConfirm: () => {
            appendAudit('invitation_prepared');
            renderTeam();
            announce('Synthetic scoped invitation prepared. No identity was provisioned and no message was sent.');
          }
        });
        return;
      }
      if (target.matches('[data-transfer-start]')) {
        configureDialog({
          kicker: 'Team · ownership transfer',
          title: 'Start a synthetic 72-hour hold?',
          copy: 'The dual-confirmation hold is a local preview only.',
          details: [
            'Both fictional parties would need to confirm in production.',
            'No authority or ownership will change.'
          ],
          confirmLabel: 'Start synthetic hold',
          onConfirm: () => {
            appendAudit('transfer_started');
            renderTeam();
            announce('Synthetic 72-hour ownership-transfer hold started. No authority or ownership changed.');
          }
        });
        return;
      }
      if (target.matches('[data-recovery-filter]')) {
        const filter = target.dataset.recoveryFilter;
        if (!['milestones', 'all'].includes(filter)) return;
        state.recoveryFilter = filter;
        persistState();
        renderRecovery();
        return;
      }
      if (target.matches('[data-recovery-compare]')) {
        appendAudit('recovery_compared');
        renderRecovery();
        announce('Two synthetic recovery points compared locally. No customer data changed.');
        return;
      }
      if (target.matches('[data-recovery-restore]')) {
        const context = recoveryPointContext(target);
        configureDialog({
          kicker: 'Recovery · restore as new head',
          title: 'Apply a synthetic restore preview?',
          copy: `${context.label} will be shown as a new local head while the previous head remains available.`,
          details: [
            'Undo remains available in the recovery view.',
            'No customer data will be restored, replaced or changed.'
          ],
          confirmLabel: 'Apply restore preview',
          onConfirm: () => {
            recoveryUndoMode = 'restore';
            appendAudit('recovery_restored');
            renderRecovery();
            announce('Synthetic restore-as-new-head applied with Undo. No customer data changed.');
          }
        });
        return;
      }
      if (target.matches('[data-recovery-delete]')) {
        const context = recoveryPointContext(target);
        configureDialog({
          kicker: 'Recovery · pending deletion',
          title: 'Start a synthetic 24-hour deletion hold?',
          copy: `${context.label} will be marked pending deletion in local display state.`,
          details: [
            'Undo remains available for 24 hours in this preview.',
            'No customer data will be deleted.'
          ],
          confirmLabel: 'Mark pending deletion',
          onConfirm: () => {
            deletionPointIndex = context.index;
            state.pendingDeletion = true;
            recoveryUndoMode = 'delete';
            appendAudit('recovery_delete_pending');
            renderRecovery();
            announce('Synthetic 24-hour pending-deletion hold started with Undo. No customer data was deleted.');
          }
        });
        return;
      }
      if (target.matches('[data-recovery-undo], [data-recovery-restore-undo]')) {
        if (recoveryUndoMode === 'delete' || state.pendingDeletion) {
          state.pendingDeletion = false;
          recoveryUndoMode = '';
          appendAudit('recovery_delete_undo');
          renderRecovery();
          announce('Synthetic pending deletion undone. No customer data was deleted.');
        } else if (recoveryUndoMode === 'restore') {
          recoveryUndoMode = '';
          appendAudit('recovery_restore_undo');
          renderRecovery();
          announce('Synthetic restore preview undone. No customer data changed.');
        }
        return;
      }
      if (target.matches('[data-plan]')) {
        state.selectedPlan = planKey(target.dataset.plan);
        persistState();
        renderBilling();
        announce(`${planName(state.selectedPlan)} selected as an internal test hypothesis. No checkout or charge occurred.`);
        return;
      }
      if (target.matches('[data-billing-state]')) {
        const billingState = target.dataset.billingState;
        if (!Object.prototype.hasOwnProperty.call(BILLING_COPY, billingState)) return;
        state.billingState = billingState;
        persistState();
        renderBilling();
        announce(`${BILLING_COPY[billingState][0]} preview selected. No subscription or charge changed.`);
        return;
      }
      if (target.matches('[data-checkout-preview]')) {
        configureDialog({
          kicker: 'Billing · server authority',
          title: `${planName(state.selectedPlan)} checkout boundary`,
          copy: 'A production checkout would require authenticated server authority and a reconciled entitlement ledger.',
          details: [
            'Browser display state cannot grant entitlement.',
            'No Stripe object, checkout session, subscription or charge will be created.',
            'Prices shown are internal test hypotheses only, per active location/month and ex GST.'
          ],
          confirmLabel: 'Acknowledge boundary',
          onConfirm: () => {
            appendAudit('checkout_preview');
            announce('Server-authority boundary acknowledged. No Stripe object or charge was created.');
          }
        });
        return;
      }
      if (target.matches('[data-outcome-filter]')) {
        const filter = target.dataset.outcomeFilter;
        if (!['all', 'direct', 'assisted', 'correlated', 'unknown'].includes(filter)) return;
        state.outcomeFilter = filter;
        persistState();
        renderOutcomes();
        return;
      }
      if (target.matches('[data-outcome-open]')) {
        const row = target.closest('[data-outcome-row]');
        const outcome = enumValue(target.dataset.outcomeOpen || row?.dataset.outcomeRow, Object.keys(OUTCOME_DETAILS), 'unknown');
        const detail = OUTCOME_DETAILS[outcome];
        configureDialog({
          kicker: 'Outcome · provenance',
          title: detail.title,
          copy: 'This evidence explanation preserves confidence and value treatment without changing the fixture.',
          details: detail.details,
          confirmLabel: 'Close evidence',
          onConfirm: () => announce('Synthetic attribution evidence closed. No external action occurred.')
        });
        return;
      }
      if (target.matches('[data-proof-export]')) {
        appendAudit('proof_export');
        downloadJson(
          `ara-${suite}-synthetic-proof.json`,
          proofExportData(),
          'Synthetic proof JSON downloaded locally. No customer data was included or transmitted.'
        );
        return;
      }
      if (target.matches('[data-audit-export]')) {
        appendAudit('audit_export');
        downloadJson(
          `ara-${suite}-synthetic-audit.json`,
          auditExportData(),
          'Payload-free synthetic audit JSON downloaded locally. No customer data was included or transmitted.'
        );
        return;
      }
      if (target.matches('[data-reset-demo]')) {
        configureDialog({
          kicker: 'Demo controls · reset',
          title: 'Reset this suite’s synthetic display state?',
          copy: 'This clears only the current suite’s resettable browser display state and restores the deterministic defaults.',
          details: [
            `Storage key: ${storageKey}`,
            'No customer, provider, billing, authentication or production state will change.'
          ],
          confirmLabel: 'Reset synthetic state',
          onConfirm: resetDemo
        });
        return;
      }
      if (target.matches('[data-motion-toggle]')) {
        if (reducedMotionQuery.matches) return;
        motionPaused = !motionPaused;
        renderMotion();
      }
    });

    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
      if (!target.closest('[data-recovery-point]') && !target.matches('[data-recovery-select]')) return;
      renderRecovery();
    });

    const dialog = first('#product-dialog');
    if (dialog) {
      dialog.addEventListener('cancel', () => {
        pendingDialogAction = null;
      });
      dialog.addEventListener('close', () => {
        pendingDialogAction = null;
      });
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) closeDialog();
      });
    }

    window.addEventListener('hashchange', () => {
      const view = validHashView();
      if (view) activateView(view, { updateHash: false, scrollTop: true });
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey || typeof event.newValue !== 'string') return;
      try {
        state = normalizeState(JSON.parse(event.newValue));
        renderAll();
      } catch (_error) {
        // Ignore malformed cross-tab state and retain the last safe in-memory state.
      }
    });

    const onReducedMotionChange = () => renderMotion();
    if (typeof reducedMotionQuery.addEventListener === 'function') reducedMotionQuery.addEventListener('change', onReducedMotionChange);
    else if (typeof reducedMotionQuery.addListener === 'function') reducedMotionQuery.addListener(onReducedMotionChange);

    const initialHash = validHashView();
    if (initialHash) state.activeView = initialHash;
    renderAll();
    activateView(state.activeView, { updateHash: true });
    body.dataset.productBoot = 'ready';
    body.classList.add('product-js-ready');
    document.documentElement.classList.add('product-js-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
