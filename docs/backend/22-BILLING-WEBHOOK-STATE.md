# 22 — Billing Webhook State and Financial Integrity

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Billing Engineer
**Primary category:** Backend
**Purpose:** Protect entitlement state from replay, ordering and fraud.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/05-PRICING-BILLING.md, docs/backend/19-ENTITLEMENT-STATE.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **protect entitlement state from replay, ordering and fraud**. It is a documented design contract, not deployed code.
Server enforcement: Status, permission and quota decisions must be calculated server-side; retries may not duplicate financial or usage effects.

### In scope
- Signature HMAC over timestamp and raw body.
- Timestamp tolerance five minutes.
- Idempotent event storage and atomic apply.
- Older subscription event ignored.
- Unknown price returns actionable operator error.
- Approved full refund revokes paid entitlement.
- Reversal after chargeback restores only on valid evidence.
- Checkout identity derived from authenticated user.

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
- Integration acceptance uses a real PostgreSQL test database plus signed provider fixtures.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 22-01 — Signature HMAC over timestamp and raw body

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Signature HMAC over timestamp and raw body** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-02 — Timestamp tolerance five minutes

**Boundary / owner:** Billing Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Timestamp tolerance five minutes**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Timestamp tolerance five minutes** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Timestamp tolerance five minutes**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-03 — Idempotent event storage and atomic apply

**Boundary / owner:** Billing Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Idempotent event storage and atomic apply**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Idempotent event storage and atomic apply** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Idempotent event storage and atomic apply**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-04 — Older subscription event ignored

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Older subscription event ignored** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-05 — Unknown price returns actionable operator error

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Unknown price returns actionable operator error** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-06 — Approved full refund revokes paid entitlement

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Approved full refund revokes paid entitlement** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-07 — Reversal after chargeback restores only on valid evidence

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Reversal after chargeback restores only on valid evidence** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 22-08 — Checkout identity derived from authenticated user

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Checkout identity derived from authenticated user** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `22-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 22-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 22-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 22-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of billing webhook state and financial integrity | Billing Engineer | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Signature HMAC over timestamp and raw body unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Timestamp tolerance five minutes unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Idempotent event storage and atomic apply unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Older subscription event ignored unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Unknown price returns actionable operator error unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Approved full refund revokes paid entitlement unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Protect entitlement state from replay, ordering and fraud** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Billing Engineer:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Paddle event processing invariant

```text
Receive raw body + Paddle-Signature -> verify ts within 300 seconds
Verify HMAC-SHA256 over ts:rawBody in constant time
BEGIN TRANSACTION
  Insert unique event_id (duplicate = no reapplication)
  Validate subscription/customer reference and known price code
  Ignore older event_occurred_utc than last applied status
  Update subscription, any refund/adjustment, and derived entitlements
COMMIT
Return delivery acknowledgement only once durable
```

- Sandbox event fixtures do not prove actual Paddle delivery; collect the provider's delivery log and local redacted correlation ID.
- Do not store full card data; backend stores references and necessary raw event bodies as described by source billing documentation, so retention and access must be defined.
- Unknown Paddle price must **not** grant default Trial silently as a paid success state.
- A partial refund does not necessarily revoke a whole subscription; full refund/chargeback handling must match the current tested service rules.
- Live merchant cutover requires business approval, actual webhook signatures, sandbox-to-live environment isolation and an emergency disable mechanism.
