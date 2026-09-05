# ARA full-product multi-suite contract

## Purpose

Maintain complete, independently coherent ARA product workspaces that founders can compare before selecting a visual direction. Kinetic and Editorial are the two current review-ready suites; the contract deliberately permits another original suite.

The suites share product truth, synthetic fixtures, state semantics and completion criteria. They do not share presentation grammar.

## Hard boundary

- Static/browser-only, synthetic and review-only.
- No real customer data, credentials, authentication, billing, provider access, messages, bookings, publication, restoration, deletion or external side effects.
- Browser storage may persist only non-sensitive synthetic display state and must be resettable from the interface.
- Every consequential receipt must state the external effect that did not occur.
- No paid APIs, providers, infrastructure or media.
- Existing landing suites remain available. These workspace routes complement rather than replace them.

## Routes and assets

- `kinetic-product.html` — Kinetic Signal System workspace.
- `editorial-product.html` — Editorial Evidence System workspace.
- `assets/product-base.css` — accessibility and shared behavioral primitives only.
- `assets/kinetic-product.css` — Kinetic presentation system.
- `assets/editorial-product.css` — Editorial presentation system.
- `assets/product.js` — shared synthetic state semantics.
- `suite-registry.json` — canonical review-ready suite profiles, QA identity rules and explicitly reserved design slots.
- `tests/suite_profiles.py` — strict registry validation and generated QA matrix.

## Shared fixture

- Organisation: Coastal Form & Flow Pty Ltd — explicitly fictional.
- Locations: Hope Island and Coomera.
- Primary service: retaining-wall construction.
- Discovery corridor: five approved Northern Gold Coast–Logan South localities.
- Surfaces: ChatGPT, Google AI, Google Maps, Gemini, Claude, Copilot, Perplexity and Grok.
- Diagnostic: two independent synthetic runs.
- Measures: visibility 62% → 74%; accuracy 87% → 92%; enquiry path 54% → 68%.
- Plans: ARA Proof A$149 and ARA Action A$399 per active location/month, ex GST — internal test hypotheses only.
- Outcomes: Direct, Assisted, Correlated and Unknown, with confidence, provenance and value treatment.

## Equivalent product views

Each workspace must expose all of these as real navigable views with one visible at a time:

1. `overview` — readiness, current metrics, next best action and recent activity.
2. `onboarding` — identity, organisation, authority, location, Truth Sheet, manifest and baseline checklist.
3. `diagnostic` — approved manifest, two-run lifecycle and deterministic release progression.
4. `truth` — canonical facts, source authority, freshness, conflict and proposal/approval preview.
5. `scorecard` — surface evidence, priorities, methodology and scorecard status.
6. `actions` — prepare → human review → accepted-for-demo-queue lifecycle; never sent or booked.
7. `outcomes` — baseline → change → exposure → outcome ledger and attribution evidence.
8. `connectors` — purpose-bound consent and active/degraded/revoked states.
9. `team` — owner/admin/operator/reviewer/billing roles, invitations and 72-hour ownership transfer.
10. `recovery` — checkpoints, comparison, restore-as-new-head and 24-hour pending-deletion/Undo previews.
11. `billing` — Proof/Action plan comparison and active/grace/restricted/review/former-paid entitlement states.
12. `audit` — append-only synthetic interaction history and local synthetic export.

## Required structural hooks

Every registered product workspace must contain:

- `<body data-suite="<registered-slug>" data-suite-label="<display-label>" data-product-contract="v1" data-product-workspace>`.
- `.product-shell`, one `h1`, and `<main id="product-main">`.
- `[data-product-nav]` with exactly 12 `[data-view-target]` controls.
- Exactly 12 `[data-view]` sections whose values match the navigation targets.
- `[data-page-title]`, `[data-page-summary]`, `[data-role-label]`, `[data-current-view]`.
- `[data-reset-demo]`, `[data-toast]`, and one labelled `<dialog id="product-dialog">`.
- Visible synthetic/demo boundary in the shell and within consequential dialogs.
- Links back to the suite landing and neutral launcher. Direct sibling-suite links are optional; the launcher is the authoritative catalogue.

## Shared state semantics

`assets/product.js` owns one state object per suite in localStorage under `ara-showcase-product:<registered-slug>:v1`. Suite slugs are validated, never silently mapped to an existing design, and remain display state only—not identity or authentication.

Default state:

```json
{
  "activeView": "overview",
  "role": "owner",
  "onboardingCompleted": 4,
  "diagnosticState": "approved",
  "factState": "current",
  "actionState": "not_prepared",
  "connectorState": "active",
  "recoveryFilter": "milestones",
  "pendingDeletion": false,
  "selectedPlan": "proof",
  "billingState": "active",
  "outcomeFilter": "all",
  "audit": []
}
```

Navigation:

- Clicking `[data-view-target]` updates the single visible `[data-view]`, selected/pressed/current states, page title/summary, document title, URL hash and persisted state.
- Initial hash wins when valid; otherwise persisted state; otherwise overview.
- Mobile navigation must close after selection.

Role capabilities:

- owner: view, edit, approve, invite, connector, restore, delete, transfer, billing, action.
- admin: view, edit, approve, invite, restore, action.
- operator: view, edit, action.
- reviewer: view.
- billing: billing.
- `[data-role]` changes the synthetic role preview only.
- Elements with `[data-requires]` are disabled when their capability is absent.
- The interface must state that browser roles do not authenticate or authorise anyone.

Onboarding:

- `[data-onboarding-step]` appears seven times.
- First four are complete by default.
- `[data-onboarding-next]` completes one remaining step per click, updates `[data-onboarding-progress]` and appends an audit event.
- At seven complete, the control reports complete and disables.

Diagnostic:

- `[data-diagnostic-start]` progresses deterministically through approved → queued → collecting → validating → released.
- Update `[data-diagnostic-state]`, `[data-diagnostic-progress]` and `[data-diagnostic-copy]`.
- Disable the start control while running; allow `[data-diagnostic-reset]`.
- Every run message must say it is synthetic and no provider was contacted.
- Release adds an audit event and makes `[data-scorecard-fresh]` visibly fresh.

Truth Sheet:

- At least five `[data-fact-row]` records covering current, review-required, conflict and blocked/unsupported states.
- `[data-fact-propose]` opens the shared dialog; confirmation moves the service-corridor sample to `review_required`, never publishing it.
- `[data-fact-approve]` requires approve capability and confirmation; it returns the sample to `current` and records that no public surface changed.
- Update `[data-fact-state]` and `[data-fact-receipt]`.

Governed action:

- `[data-action-prepare]` opens a confirmation and sets `prepared`.
- `[data-action-review]` opens a confirmation and sets `queued_for_human_review`.
- `[data-action-approve]` sets `accepted_for_demo_queue` only.
- Update `[data-action-state]`, `[data-action-step]` and `[data-action-receipt]`.
- Receipts explicitly say no message, booking, quote or customer commitment occurred.

Connectors:

- `[data-connector-state="active|degraded|revoked"]` updates persisted state, selected control, `[data-connector-status]`, `[data-connector-copy]`, `[data-connector-coverage]` and outcome coverage.
- Degraded and revoked fail closed.
- `[data-connector-consent]` and `[data-connector-revoke]` use the shared dialog; no OAuth or provider account is contacted.

Team:

- Exactly five `[data-role]` controls.
- `[data-invite-prepare]` creates a synthetic named, seven-day, location-scoped invitation receipt; no message sent.
- `[data-transfer-start]` creates a synthetic 72-hour dual-confirmation hold; no authority changed.
- Update `[data-team-receipt]`.

Recovery:

- At least four `[data-recovery-point]`, with two milestones and two routine checkpoints.
- `[data-recovery-filter]` toggles milestones/all.
- Exactly two selected checkboxes enable `[data-recovery-compare]`.
- `[data-recovery-restore]` confirms restore-as-new-head and shows Undo without changing customer data.
- `[data-recovery-delete]` confirms 24-hour pending deletion and exposes `[data-recovery-undo]`.
- Update `[data-recovery-receipt]`.

Billing:

- `[data-plan="proof|action"]` updates selection; no checkout.
- `[data-billing-state="active|grace|restricted|review|former"]` updates `[data-billing-banner]`.
- `[data-checkout-preview]` opens a server-authority explanation; no Stripe object or charge.

Outcomes and exports:

- Four `[data-outcome-row]` records: direct, assisted, correlated, unknown.
- `[data-outcome-filter]` filters without changing evidence.
- `[data-outcome-open]` opens provenance/confidence/value-treatment evidence.
- `[data-proof-export]` creates a real local JSON download containing synthetic fixtures and the explicit no-production boundary.
- `[data-audit-export]` creates a local JSON audit download.
- Downloads must never include browser environment, credentials, personal data or uncontrolled form input.

Audit:

- Every consequential confirmed action appends a timestamped payload-free event.
- `[data-audit-list]` renders newest first.
- Seed at least four events so the view is meaningful before interaction.
- `[data-audit-count]` updates live.

Dialog:

- One reusable native dialog with `[data-dialog-kicker]`, `[data-dialog-title]`, `[data-dialog-copy]`, `[data-dialog-details]`, `[data-dialog-cancel]`, `[data-dialog-confirm]`.
- It must close with Cancel, Escape and backdrop click.
- Consequential actions execute only from the confirm control.

## Kinetic charter

- Mission-control silhouette: fixed command rail, live status header, dense modular console.
- Black/charcoal/electric-lime palette; angular cuts; hard rules; monospace operational metadata.
- Strong numeric telemetry, scan/grid atmosphere and purposeful pulses.
- Signature mechanism: a vertical `ASK / VERIFY / ANSWER / ACT` signal spine that tracks the active product view.
- Mobile becomes a compact top command bar plus bottom dock; no overflowing tables or clipped CTAs.
- Motion can be paused and becomes static under `prefers-reduced-motion`.
- Do not borrow Editorial folios, serif headlines, paper sheets, chapter notes or quiet page-turn rhythm.

## Editorial charter

- Evidence-journal silhouette: masthead, horizontal contents, wide reading canvas and marginal annotations.
- Ivory/paper/ink/oxblood palette; serif display; fine rules; generous whitespace; composed tables.
- Signature mechanism: a persistent evidence folio marker showing chapter, source status and review note.
- Restrained transitions only; no ticker, scan field, signal packet, pulsing telemetry or kinetic progress rail.
- Mobile becomes a compact masthead and chapter selector with calm stacked sheets.
- Do not borrow Kinetic command rails, angular cuts, electric-lime emphasis or operational ticker grammar.

## Suite registration and the reserved third lane

The neutral launcher exposes Kinetic and Editorial as review-ready peers and `concept-c` as an honest reserved slot with no route. A reserved slot is not a design claim and is excluded from product QA until its complete routes and identity profile exist.

To register another review-ready suite:

1. Create `showcase/<slug>.html`, `showcase/<slug>-product.html` and one suite-owned product stylesheet. A suite-owned landing stylesheet is optional.
2. Use a unique lowercase slug matching `[a-z][a-z0-9-]{0,31}` plus a non-empty display label and `data-product-contract="v1"`.
3. Implement all 12 canonical product views, shared state semantics, roles, consequence boundaries and exports. Do not remove or redefine canonical view IDs.
4. Define a concept charter, one memorable signature mechanism and explicit anti-convergence rules against every existing suite.
5. Add required and forbidden landing/product selectors to `suite-registry.json`. Moving a slot from reserved to ready without complete routes, identity rules and capability declarations must fail registry validation.
6. Add a launcher card with matching `data-suite-card` and `data-suite-label`. The founder comparison lab discovers registered cards automatically.
7. Run every generated viewport, interaction, accessibility, export, fallback-font and cross-suite storage-isolation check before calling the suite review-ready.

Shared fixtures and behavior are welcome. Shared presentation components, typography, spacing, navigation, card anatomy, motion choreography or signature mechanisms are not when they collapse the concepts into reskins.

## Accessibility and QA floor

For every review-ready product workspace:

- 1440×900, 1280×720, 390×844 and 320×568.
- Keyboard navigation, visible focus, skip link and named controls.
- Native dialog Escape and focus behavior.
- Reduced-motion mode.
- Fallback-font layout.
- No horizontal overflow.
- Exactly one visible product view at a time.
- All 12 views reachable.
- Role restrictions demonstrable.
- Onboarding completion, diagnostic release, Truth Sheet proposal/approval, three-step action lifecycle, connector degradation/revocation, invitation, transfer, restore/delete Undo, billing states, four attribution classes and downloads exercised.
- No page errors, unexplained console errors or non-font request failures.
- Verify Kinetic signature systems are present and Editorial excludes them.

## Release boundary

Commit and push only to the existing `feat/ara-kinetic-mobile` PR branch. Do not merge, deploy, configure DNS, connect production services, create provider accounts, use credentials, admit customer data or incur paid usage.
