# Kinetic reference refit — 5 September 2026

## Requested result

Rework one complete ARA suite against the live King Kong AU reference, preserve Alex's banked decisions, leave Editorial intact, exercise the result and show it on the connected TV.

## Delivered scope

- Kinetic landing: full-width darkened construction photograph, centred two-line condensed headline, centred brand/header, joined grey/lime conversion pill, skewed product-entry preview, diagonal green section accents, long-form light editorial section, two large Proof/Action offer cards, scope section, the complete existing interactive landing journey, FAQ and searchable decision bank.
- Kinetic product: the same typography, photographic headings, charcoal/lime navigation, light evidence panels and rounded controls across all 12 existing workspace views. The mobile workspace uses a real open/close drawer rather than the former bottom command dock; the landing dock remains.
- Original ARA wording and branding. The reference's logo, copy, reviews, revenue claims, customer names, photos, video, analytics and source code are not shipped.
- The body type and exact CTA colour were inspected from the live reference. The locally hosted Anton display face is an openly licensed condensed substitute, not a claim to possess a proprietary reference font. The construction image is an illustrative Unsplash-licensed asset, not an ARA customer or endorsement.
- Both existing shared interaction engines and every Editorial page/style remain byte-identical to the reviewed upstream baseline. New behavior is Kinetic-scoped.

## Banked answers and implementation truth

`assets/kinetic-decisions.js` retains the settled acquisition contract as a Q1–Q20 group plus individually indexed Q21–Q72 records. The group reflects the canonical source's grouping; it does not invent a question-to-answer mapping that source did not contain. It also preserves E1 B, E2 A, E3 C and E4 C. E5 is explicitly unanswered.

The searchable bank is available on the landing and workspace. It distinguishes an interactive policy preview, a superseded rule and an unimplemented service decision. It does **not** mark a production control complete because it appears in the interface.

| Contract area | Runnable review surface | Production dependency still separate |
|---|---|---|
| Q1–Q28 / Q64–Q67 acquisition, identity, consent | Free three-step diagnostic, approved manifest, complete scorecard, onboarding | Protected first-party host, real OTP, official identity/control/authority evidence, secure sessions and storage |
| Q29–Q41 evidence and truth | Eight-surface panel, volatility/unavailable states, priorities, methodology, proposed/approved fact flow | Provenance-preserving real observations, private upload controls/scanning, source verification |
| Q42–Q53 / Q59–Q63 retention and recovery | Milestone/all history, comparison, restore-as-new-head preview, deletion/Undo, offboarding states | Encrypted Australian-region data/object storage, independent complete backups, real clocks, notices, holds and cross-cloud recovery/deletion drills |
| Q54–Q58 commercial and custody | A$149 Proof / A$399 Action per active location per month ex GST; allowances and separately approved connector quote | Provider provisioning, monitored recipients and approved public release of prices |
| Q68–Q69 billing | Explicit tier exploration, hosted-checkout explanation, active/grace/restricted/review/former states | Actual Stripe test integration, signed idempotent events and server-owned entitlement reconciliation |
| Q70 organisations | Five role previews, scoped invitation and 72-hour transfer previews | Real server-enforced membership, authority, authentication and atomic transfer |
| Q71 connectors | Manifest, consent/revoke/degraded/reconciliation previews | Authorised provider accounts, encrypted server credentials, signed callbacks and live reconciliation |
| Q72 proof | Direct/assisted/correlated/unknown evidence views and local synthetic exports | Consented first-party outcomes and substantiated causal/value evidence |
| E1–E4 | Recorded without losing their choices or sequencing | Full local Supabase/Postgres service and shared validated import/capture implementation remain pending |
| E5 | Explicitly open | No AI recommendation role chosen or implemented as approved |

All sample organisations, observations, measures, actions and billing states remain synthetic. No real customer data, provider access, messages, bookings, payments or destructive operations have been introduced by this refit.

## Functional correction discovered

The existing shared landing script treats any matching hash as a same-page link, even when the destination is another document. Kinetic now intercepts cross-document hash links before that handler. Plan intent is carried only as a temporary display preference and applied after the product engine boots. It never grants an entitlement or creates a checkout. Tests explicitly navigate from Explore Action to the workspace and inspect the resulting selected plan.

## Source isolation and recovery

- Isolated worktree: `/Users/Sky/projects/ara-kingkong-suite-20260905`.
- Local branch: `feat/ara-reference-20260905`.
- Baseline: `72be25b` from the current remote Kinetic review branch, including its existing fixes.
- Original checkout and Editorial are retained. No merge, production deploy, DNS change, provider provisioning or paid call is part of this work.
- Asset provenance is in `assets/reference/asset-provenance.json`.

## Verification commands

```sh
make check
uv run --with playwright==1.62.0 python3 showcase/tests/qa_reference.py
```

The existing gate exercises the full landing/product/extension contracts. Navigation QA was updated to operate the real mobile drawer rather than force-clicking an offscreen control; the full twelve-view, state-transition, persistence, export and role assertions are retained. The additional lane checks reference geometry, visible photographic/lime treatment, cross-document plan navigation, bank searches, E5 status, every workspace view, narrow/standard/TV viewports, reduced motion, fallback fonts and unchanged Editorial/shared-file hashes.

Verification results and TV-display proof are recorded separately after real execution. A screenshot proves rendering, not production readiness.
