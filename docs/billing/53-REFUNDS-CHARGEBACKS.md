# 53 — Refund, Chargeback and Account State Rules

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Billing Lead
**Primary category:** Billing
**Purpose:** Specify dispute handling that protects paid access and consumers.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/backend/22-BILLING-WEBHOOK-STATE.md, docs/billing/52-PRICE-APPROVAL.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **specify dispute handling that protects paid access and consumers**. It is a documented design contract, not deployed code.
Financial correctness: The source Pro price is sandbox-only pending merchant approval; do not collect payments on an unvalidated flow.

### In scope
- Cancel at end of paid billing period.
- Past-due grace not unlimited access.
- Approved full refund entitlement revocation.
- Partial refund policy no automatic entitlement flip.
- Chargeback revocation and reversal.
- Webhook ordering across competing events.
- Portal link inaccessible recovery.
- Support evidence without collecting card data.

### Out of scope
- Automatically shipping additional platforms; Windows remains the only existing client.
- Changing the protected source repository from this documentation project.
- Assuming that passing a simulated test proves a vendor's live service or native operating-system permission.
- Publishing a claim that lacks a current source, linked acceptance evidence, and owner approval.

## 2. Evidence and implementation status

## Verified baseline versus proposals
- **Verified from repository descriptions and selected code:** Windows 10/11 x64 WPF; .NET 10 `global.json`; ASP.NET Core and PostgreSQL; backend endpoints; Windows WASAPI playback capture; user-confirmed facts; Answer and Coach; Paddle sandbox wiring; Supabase auth/JWKS; Velopack.
- **Separate evidence:** the repository's `docs/release/RELEASE_READINESS.md` reports a deployed Railway backend with green smoke checks; its payment path remains sandbox-only, and its public paid launch is explicitly blocked.
- **Source conflict:** older `BUILD.md` and `SECURITY.md` reflect prototype behavior; latest release-readiness and deployment documents take precedence for current commercial behavior only when tested against code. Unresolved mismatch is UNKNOWN.
- **Future or not independently tested:** Android, iOS, native macOS, live AI performance for ten languages, public signed binary, live Paddle purchase, third-party store approvals, privacy legal sign-off.
- **No backend features are implemented by this documentation.** Every new control below is a requirement or an acceptance proposal unless source-linked evidence says already implemented.

### Domain-specific validation principle
- Reconcile vendor test transaction, event ledger, entitlement and user receipt.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 53-01 — Cancel at end of paid billing period

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Cancel at end of paid billing period** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-01`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-02 — Past-due grace not unlimited access

**Boundary / owner:** Billing Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Past-due grace not unlimited access**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Past-due grace not unlimited access** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Past-due grace not unlimited access**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-02`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-03 — Approved full refund entitlement revocation

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Approved full refund entitlement revocation** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-03`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-04 — Partial refund policy no automatic entitlement flip

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Partial refund policy no automatic entitlement flip** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-04`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-05 — Chargeback revocation and reversal

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Chargeback revocation and reversal** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-05`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-06 — Webhook ordering across competing events

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Webhook ordering across competing events** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-06`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-07 — Portal link inaccessible recovery

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Portal link inaccessible recovery** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-07`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 53-08 — Support evidence without collecting card data

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Support evidence without collecting card data** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `53-08`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 53-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 53-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 53-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of refund, chargeback and account state rules | Billing Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Cancel at end of paid billing period unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Past-due grace not unlimited access unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Approved full refund entitlement revocation unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Partial refund policy no automatic entitlement flip unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Chargeback revocation and reversal unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Webhook ordering across competing events unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Specify dispute handling that protects paid access and consumers** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Billing Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
