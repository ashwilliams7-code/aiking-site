# ARA dual-suite showcase

This directory contains a complete browser-only product scaffold for review and marketing preparation.

## Routes

- `index.html` — suite comparison and launcher.
- `kinetic.html` — high-energy kinetic signal system.
- `editorial.html` — calm editorial evidence system.
- `assets/showcase.css` — shared components plus intentionally distinct design systems.
- `assets/showcase.js` — shared accessible synthetic interactions.

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

## Hard boundary

These routes are synthetic static frontends. They do not authenticate users, provision memberships, transfer ownership, collect or persist form data, create Stripe sessions, charge cards, connect to or contact providers, send messages, create bookings, access customer data, generate customer exports, restore records or delete records. Production capability remains separately gated in Project ARA.

## Local preview

Serve the repository root so absolute paths on the existing ARA page and relative showcase assets both resolve:

```bash
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/showcase/`.
