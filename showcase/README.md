# ARA multi-suite design catalogue

This directory contains complete browser-only product scaffolds for review and marketing preparation. Kinetic and Editorial are review-ready; a third design lane is explicitly reserved without pretending that another suite already exists.

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
- `assets/catalogue.css` / `assets/catalogue.js` — neutral launcher, reserved design lane and local founder comparison scorecard.
- `suite-registry.json` — registered suite routes, identity contracts, QA capabilities and reserved design slots.
- `docs/ara-kinetic-product-decision-pack-2026-09-04.pdf` — Kinetic technical build, UX limitations and next-step decision pack.
- `docs/ara-editorial-product-decision-pack-2026-09-04.pdf` — Editorial technical build, UX limitations and next-step decision pack.

## Functional display states

Every review-ready suite demonstrates the same approved information architecture:

1. Ask → Verify → Answer → Act pathway.
2. Progressive free-diagnostic intake and manifest consent.
3. Deterministic diagnostic state progression and complete scorecard release.
4. Evidence, volatility and unavailable-platform presentation.
5. Q70 synthetic organisation, five fixed role views, bounded invitation and 72-hour ownership-transfer preview.
6. Q71 purpose-bound connector manifest, degraded/reconciliation and immediate revocation states.
7. Adaptive recovery history, comparison, restore preview and deletion/Undo.
8. Q72 baseline-versus-current proof, approved-change ledger, outcome funnel, four attribution classes, evidence drawer and export preview.
9. Proof/Action tier comparison, safe checkout preview and entitlement states.

Each suite also includes a standalone 12-view product workspace covering overview, onboarding, diagnostic, Truth Sheet, scorecard, governed actions, outcome proof, connectors, team authority, recovery, billing and append-only synthetic audit. The browser stores only resettable non-sensitive synthetic display state under a validated suite-specific key. Local JSON proof/audit downloads contain fixed fixtures and explicit non-production boundaries; nothing is uploaded.

The launcher includes the five-task founder decision run from both decision packs and a local-only 1–5 scorecard for comprehension, confidence, action findability, evidence clarity and mobile comfort. Scores can be reset or exported as local JSON; they never select, merge or deploy a design automatically. Adding a future registered launcher card automatically adds it to this comparison surface.

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

Canonical QA gate (owns its temporary localhost server and closes it automatically):

```bash
make check
```

Requires `uv` and either installed Google Chrome or a Playwright Chromium installation. The gate pins Playwright 1.62.0 in an isolated uv environment; it does not alter the agent environment. Reports, screenshots and logs default to `/tmp/ara-multisuite-qa` or `ARA_QA_OUTPUT`.

The gate runs landing, product and extension lanes. Extension tests exercise a temporary namespace fixture with actions, exports, reset isolation, invalid metadata and the reserved-slot layout. That test fixture is not a third design. No persistent local server is required.

To run a single lane against an already running preview, use `uv run --with playwright==1.62.0 python3 showcase/tests/qa_product.py` (or `qa_showcase.py` / `qa_extension.py`) and set `ARA_SHOWCASE_URL` when needed.

The first lane exercises every registered landing journey, the launcher catalogue, the reserved-slot contract and founder scorecard persistence/export/reset. The second exercises every registered complete 12-view product workspace, deterministic state transitions, suite-specific local persistence/downloads, cross-suite storage isolation, role boundaries, responsive layouts, keyboard behavior and reduced motion.
