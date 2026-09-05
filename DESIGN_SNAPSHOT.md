# ARA Kinetic — King Kong-inspired design, V1

## Why this snapshot exists

Alex explicitly requested preserving **this landing page and complete interactive suite** after reviewing the shared design. This is a retained design baseline, not approval for production activation or a claim that all backend requirements are implemented.

**Design identifier:** `ara-kinetic-kingkong-v1`

**Git tag:** `design/ara-kinetic-kingkong-v1`

Keep this tagged state and its archive. Future edits belong in a later working revision or a new version; do not move or replace this V1 tag. The independent Editorial direction remains preserved.

## What is included

- `showcase/kinetic.html` — reference-inspired landing page.
- `showcase/kinetic-product.html` — complete 12-view Kinetic workspace.
- All supporting styles, scripts, locally hosted fonts, licensed imagery and recorded asset provenance.
- The sanitized Q1–Q72 and E1–E4 decision bank; E5 remains explicitly unanswered.
- Technical/implementation-boundary documentation and test suites.
- Desktop/mobile visual baselines under `showcase/docs/design-snapshots/kingkong-v1/`.
- The original Editorial pages and shared engines, retained for parity and recovery.

The temporary Cloudflare preview address is **not** the backup. The files and tagged Git state are sufficient to restore the design without that tunnel.

## Restore and open locally

Extract the ZIP, open a terminal in its top-level `ARA-Kinetic-KingKong-v1` directory, and run:

```sh
python3 -m http.server 8778 --bind 127.0.0.1
```

Then open:

- Landing: `http://127.0.0.1:8778/showcase/kinetic.html`
- Full suite: `http://127.0.0.1:8778/showcase/kinetic-product.html`

Use a different unused port if 8778 is already occupied. No package installation, customer account, database, model API or payment integration is needed to explore the static prototype. Some inherited styles request public font stylesheets, while this design's main fonts and photography are included locally; network failure is covered by fallback-font testing.

From Git, extract the exact tag into a separate directory or create a separate worktree rather than resetting an active development checkout.

## Evidence and boundaries

The reviewed build passed **35 existing regression cases** and **169 additional checks**. The public preview was separately checked for byte-identical pages/styles/scripts, responsive layout, navigation, explicit plan selection and zero page/console errors. See `showcase/docs/KINETIC_REFERENCE_QA_2026-09-05.json` and the included design-proof summary.

All displayed organisations, measurements, outcomes, approvals, billing and recovery operations are synthetic. This snapshot does not add production authentication, payments, live providers, customer data, real sending, or external business outcomes. Saving it does not merge a branch, deploy the production site, approve prices as a public offer, resolve E5, or establish successful TV delivery.
