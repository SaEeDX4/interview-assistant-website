# 08 — Roadmap v2: Commercial Windows Launch and Future Platform Research

> **Status:** proposed plan, no real-world calendar delivery promises. Windows is the only existing desktop product.
> **Owner:** Saeed as decision owner; Program Manager maintains gating evidence. Source repository remains strictly read-only in this package.

## Purpose, scope and non-goals

- **Purpose:** coordinate documentation, website, verified Windows release, and research for three future platforms without inventing availability.
- **Scope:** five gated phases; technical work is proposed unless separately evidenced.
- **Non-goals:** no Android/iOS/macOS feature commitments, no unvalidated paid checkout, no stealth functions, no hiring scores.
- **Dependencies:** `01-PRD.md`, `05-PRICING-BILLING.md`, `07-SECURITY-PRIVACY-ETHICS.md`, current repository release readiness.
- **Global acceptance:** all P0 blockers resolved; privacy/security P1 unresolved items have explicit release-blocking status.

## Current evidence before phases

- Source `docs/release/RELEASE_READINESS.md` reports Railway production health and 78 backend tests / 215 client-core tests as of its dated snapshot; older `STATUS_REPORT_V2.md` gives 44/201. These numbers are snapshots, not current re-runs.
- Public paid live readiness is blocked on a signed installer, Paddle live merchant approval, legal documents, real sandbox E2E and relevant external validation.
- There is no independent evidence in this task of a functioning public website, signed download, or mobile application.

## Stage definitions

| Stage | Interpretation | Evidence required |
|---|---|---|
| IDEA | Proposed, no product claim | Scope and decision owner |
| DESIGNED | Documented with risks and tests | Owner-reviewed spec and API/permission contract |
| BUILT | Implementation exists | Source commit and code review |
| VERIFIED | Tests relevant to real target pass | Device/account/environment evidence |
| RELEASED | Public gated release | Signed artifact, legal, support and rollback |

## Phase 1 — Documentation v2

**Relative sequencing:** Weeks 1–2 (relative planning unit only). **Accountable owner:** Product Lead.

**Milestones and deliverables:** Source audit, master document list, correction ledger and approved scope.

**Exit criteria:** The first eight original documents are fully revised, 50+ specialist documents are unique, more than 10,000 physical Markdown lines verified, and owner resolves launch-truth conflicts.

**Primary risks:** Missing source HTML; stale `.NET 8` docs; source status conflict.

**Pause/kill criteria:** Pause if version/branch cannot be mapped to a source commit or if document owners reject provenance.

**Required evidence checklist:**
- [ ] Responsible reviewer has opened the source commit and reconciled relevant architecture facts.
- [ ] API/permission failure scenarios are tested in a real environment where the feature depends on external systems.
- [ ] Product claims and legal copy map to approved reference evidence.
- [ ] Accessibility and security checks pass at production settings, not solely in mocks.
- [ ] Owner signs a go/no-go record and confirms rollback actions.

**Gate matrix:**
| Decision | Continue only if | If blocked |
|---|---|---|
| Scope | Documentation v2 acceptance is documented | Keep as proposal; no external promotion |
| Runtime | Relevant external service/device test PASS | Keep existing platform only |
| Copy | Every statement source-linked | Remove unverified statement |
| Support | Incident and refund paths confirmed | Stop paid promotion |

## Phase 2 — Website and Windows Commercial Launch

**Relative sequencing:** Weeks 3–5 (indicative, no promised date). **Accountable owner:** Frontend Lead and Release Lead.

**Milestones and deliverables:** Static HTML/CSS/JS implementation plan, legal pages, real screenshots, domain, signed installer, Paddle sandbox and live go/no-go.

**Exit criteria:** Production domain resolves; WCAG AA audited; accurate download SHA and signature; sandbox purchase, portal and webhook E2E; public checkout only after merchant and counsel approval.

**Primary risks:** Unsigned setup; unapproved price; inaccessible CTA; processor/consent gaps.

**Pause/kill criteria:** Kill purchase CTA if any payment reconciliation fails; keep informational site only if privacy/legal allows.

**Required evidence checklist:**
- [ ] Responsible reviewer has opened the source commit and reconciled relevant architecture facts.
- [ ] API/permission failure scenarios are tested in a real environment where the feature depends on external systems.
- [ ] Product claims and legal copy map to approved reference evidence.
- [ ] Accessibility and security checks pass at production settings, not solely in mocks.
- [ ] Owner signs a go/no-go record and confirms rollback actions.

**Gate matrix:**
| Decision | Continue only if | If blocked |
|---|---|---|
| Scope | Website and Windows Commercial Launch acceptance is documented | Keep as proposal; no external promotion |
| Runtime | Relevant external service/device test PASS | Keep existing platform only |
| Copy | Every statement source-linked | Remove unverified statement |
| Support | Incident and refund paths confirmed | Stop paid promotion |

## Phase 3 — Android Companion and Audio Feasibility

**Relative sequencing:** After Phase 2 evidence, no calendar promise. **Accountable owner:** Android Lead.

**Milestones and deliverables:** Android research artifacts and 10+ devices/apps planned; companion-only scope is default.

**Exit criteria:** MediaProjection and target-app-policy test matrix documented; denied capture paths yield safe manual fallback; Play compliance reviewed.

**Primary risks:** VOICE_COMMUNICATION audio typically not capturable through AudioPlaybackCapture; foreground-policy changes.

**Pause/kill criteria:** Kill Android live-assist promise unless real meeting-audio capture is stable, permitted and approved.

**Required evidence checklist:**
- [ ] Responsible reviewer has opened the source commit and reconciled relevant architecture facts.
- [ ] API/permission failure scenarios are tested in a real environment where the feature depends on external systems.
- [ ] Product claims and legal copy map to approved reference evidence.
- [ ] Accessibility and security checks pass at production settings, not solely in mocks.
- [ ] Owner signs a go/no-go record and confirms rollback actions.

**Gate matrix:**
| Decision | Continue only if | If blocked |
|---|---|---|
| Scope | Android Companion and Audio Feasibility acceptance is documented | Keep as proposal; no external promotion |
| Runtime | Relevant external service/device test PASS | Keep existing platform only |
| Copy | Every statement source-linked | Remove unverified statement |
| Support | Incident and refund paths confirmed | Stop paid promotion |

## Phase 4 — iOS and Native Mac Feasibility

**Relative sequencing:** After Phase 3 research review, no calendar promise. **Accountable owner:** iOS Lead and Mac Lead.

**Milestones and deliverables:** Separate SwiftUI companion prototype and Swift-native Mac shell concept; OS-level audio tests; consent and store review.

**Exit criteria:** iOS research is independently signed off and Mac ScreenCaptureKit flow tested on device with permissions; companion-only fallback decided.

**Primary risks:** iOS other-app capture availability unknown; Mac permissions/notarization and distribution risk.

**Pause/kill criteria:** Pause full live feature whenever OS permissions or store acceptance cannot be evidenced.

**Required evidence checklist:**
- [ ] Responsible reviewer has opened the source commit and reconciled relevant architecture facts.
- [ ] API/permission failure scenarios are tested in a real environment where the feature depends on external systems.
- [ ] Product claims and legal copy map to approved reference evidence.
- [ ] Accessibility and security checks pass at production settings, not solely in mocks.
- [ ] Owner signs a go/no-go record and confirms rollback actions.

**Gate matrix:**
| Decision | Continue only if | If blocked |
|---|---|---|
| Scope | iOS and Native Mac Feasibility acceptance is documented | Keep as proposal; no external promotion |
| Runtime | Relevant external service/device test PASS | Keep existing platform only |
| Copy | Every statement source-linked | Remove unverified statement |
| Support | Incident and refund paths confirmed | Stop paid promotion |

## Phase 5 — Growth, Support and Product Quality

**Relative sequencing:** After signed Windows public launch, no calendar promise. **Accountable owner:** Growth and Support Leads.

**Milestones and deliverables:** Privacy-preserving metrics, support triage, signed incident runbooks, lawful acquisition channels.

**Exit criteria:** Pre-registered experiments; support SLA approved; incident drill passed; retention metrics derived without interview content.

**Primary risks:** Cost overrun, deceptive conversion, unsafe third-party collection.

**Pause/kill criteria:** Stop experiments on privacy regression, unverified claims or spend-cap breach.

**Required evidence checklist:**
- [ ] Responsible reviewer has opened the source commit and reconciled relevant architecture facts.
- [ ] API/permission failure scenarios are tested in a real environment where the feature depends on external systems.
- [ ] Product claims and legal copy map to approved reference evidence.
- [ ] Accessibility and security checks pass at production settings, not solely in mocks.
- [ ] Owner signs a go/no-go record and confirms rollback actions.

**Gate matrix:**
| Decision | Continue only if | If blocked |
|---|---|---|
| Scope | Growth, Support and Product Quality acceptance is documented | Keep as proposal; no external promotion |
| Runtime | Relevant external service/device test PASS | Keep existing platform only |
| Copy | Every statement source-linked | Remove unverified statement |
| Support | Incident and refund paths confirmed | Stop paid promotion |

## Milestone dependency graph

```text
Source audit → approved docs → website implementation → site visual/keyboard audits
                                  ↘ signed Windows build + hash → download gate
External merchant approval → Paddle live E2E ↗       ↘ paid public release
Consent/privacy/legal sign-off ───────────────────────↗
Paid Windows launch → Android research → independent iOS and native macOS research
```

## Ownership and weekly review cadence

- Product owner holds final approval; specialist leads own test artifacts and issue triage.
- Weekly: review P0, P1, UNKNOWN and unapproved claims; do not convert a deadline into implied completion.
- Evidence includes branch+commit, test device/provider environment, result screenshot, redacted logs and release artifact digest.
- Critical path blocker must have explicit workaround or the dependent CTA stays disabled.

## Cross-platform fallback scope

| Platform | Currently exists? | Audio feasibility | Minimum honest roadmap |
|---|---|---|---|
| Windows WPF | Yes, source code | WASAPI playback loopback; field validation required | Signed public commercial Windows release |
| Android | No | UNKNOWN for meeting audio; capture restrictions apply | Prepare/practise companion |
| iOS | No | UNKNOWN for other-app/live audio and background behavior | Prepare/practise companion |
| Native macOS | No | ScreenCaptureKit candidate; permissions/hardware tests pending | Native preparation app, manual question fallback |

## Open questions and decisions

- **UNKNOWN / Owner:** final public brand and domain.
- **UNKNOWN / Finance:** live Paddle price and refund policy approval.
- **UNKNOWN / Release:** signed stable Windows artifact and trusted update feed URL.
- **UNKNOWN / Legal:** complete privacy, terms, billing and support pages.
- **UNKNOWN / Platform leads:** device matrix, store review and audio experiment results.

## Acceptance of this roadmap

- Phase definitions have measurable pass/fail outcomes and pause criteria.
- No date is promised to a visitor and no future product is represented as shipping.
- Each phase links to a maintainer and a verifiable evidence artifact.
