# ARA dual-suite showcase

This directory contains a complete browser-only product scaffold for review and marketing preparation.

## Routes

- `index.html` — suite comparison and launcher.
- `kinetic.html` — high-energy Kinetic landing journey.
- `editorial.html` — calm Editorial landing journey.
- `kinetic-product.html` — complete Kinetic mission-control product workspace.
- `editorial-product.html` — complete Editorial evidence-journal product workspace.
- `assets/showcase.css` — landing components plus intentionally distinct design systems.
- `assets/showcase.js` — shared accessible landing interactions.
- `assets/product.js` — shared deterministic synthetic product state, local display persistence and safe JSON exports.
- `assets/product-base.css` — accessibility and behavioral primitives for the product workspaces.
- `assets/kinetic-product.css` — independent Kinetic product presentation.
- `assets/editorial-product.css` — independent Editorial product presentation.

## Functional display states

Both suites demonstrate the same approved information architecture:

1. Ask → Verify → Answer → Act pathway.
2. Progressive free-diagnostic intake and manifest consent.
3. Deterministic diagnostic state progression and complete scorecard release.
4. Evidence, volatility and unavailable-platform presentation.
5. Q70 synthetic organisation, five fixed role views, bounded invitation and 72-hour ownership-transfer preview.
6. Q71 purpose-bound connector manifest, degraded/reconciliation and immediate revocation states.
7. Adaptive recovery history, comparison, restore preview and deletion/Undo.
8. Q72 baseline-versus-current proof, approved-change ledger, outcome funnel, four attribution classes, evidence drawer and export preview.
9. Proof/Action tier comparison, safe checkout preview and entitlement states.

Each suite also includes a standalone 12-view product workspace covering overview, onboarding, diagnostic, Truth Sheet, scorecard, governed actions, outcome proof, connectors, team authority, recovery, billing and append-only synthetic audit. The browser stores only resettable non-sensitive synthetic display state under a suite-specific key. Local JSON proof/audit downloads contain fixed fixtures and explicit non-production boundaries; nothing is uploaded.

The Kinetic suite additionally uses an original ARA signal ticker, animated evidence packets, a scan field, journey progress, section sweeps and an explicit Play/Pause control. Animation pauses when its zone leaves the viewport and becomes a complete static composition under reduced motion. The Editorial suite intentionally does not inherit this kinetic treatment.

## Reference boundary

The Kinetic direction transfers only general interface grammar from third-party inspiration: strong mobile hierarchy, layered depth, compact pacing, visible continuation, ambient motion and proof/action cadence. It does not copy or ship any third-party name, logo, slogan, wording, artwork, image, video, icon, source code, proprietary motif, signature choreography, analytics configuration or product claim. Every visible element and state is original ARA content derived from the settled ARA requirements.

## Hard boundary

These routes are synthetic static frontends. The product workspaces persist only resettable, non-sensitive synthetic display state in the reviewer’s browser and can create local synthetic JSON downloads; they never treat that state as authentication or product authority. They do not authenticate users, provision memberships, transfer ownership, collect customer data, create Stripe sessions, charge cards, connect to or contact providers, send messages, create bookings, access customer records, publish facts, restore customer records or delete customer records. Production capability remains separately gated in Project ARA.

## Local preview

Serve the repository root so absolute paths on the existing ARA page and relative showcase assets both resolve:

```bash
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/showcase/`.

Run the two browser QA lanes while that server is available:

```bash
python3 showcase/tests/qa_showcase.py
python3 showcase/tests/qa_product.py
```

The first lane exercises both landing journeys and launcher entry points. The second exercises both complete 12-view product workspaces, deterministic state transitions, suite-specific local persistence/downloads, role boundaries, responsive layouts, keyboard behavior and reduced motion.
