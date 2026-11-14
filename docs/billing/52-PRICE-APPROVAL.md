# 52 — Pricing Approval, Display and Change Control

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Finance Lead
**Primary category:** Billing
**Purpose:** Separate configured sandbox limits from commercially approved prices.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/05-PRICING-BILLING.md, docs/backend/19-ENTITLEMENT-STATE.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **separate configured sandbox limits from commercially approved prices**. It is a documented design contract, not deployed code.
Financial correctness: The source Pro price is sandbox-only pending merchant approval; do not collect payments on an unvalidated flow.

### In scope
- Trial free allocation and lifetime semantics.
- Pro USD 19.99 sandbox reference only.
- Paddle live catalog must match public copy.
- Regional tax and currency displayed by Paddle.
- No client-supplied Paddle price ID.
- Cost model with current vendor invoices.
- Approval record before public purchase CTA.
- Simulated checkout and live transition runbook.

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

### 52-01 — Trial free allocation and lifetime semantics

**Boundary / owner:** Finance Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Trial free allocation and lifetime semantics**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Trial free allocation and lifetime semantics** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Trial free allocation and lifetime semantics**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-01`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-02 — Pro USD 19.99 sandbox reference only

**Boundary / owner:** Finance Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Pro USD 19.99 sandbox reference only**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Pro USD 19.99 sandbox reference only** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Pro USD 19.99 sandbox reference only**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-02`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-03 — Paddle live catalog must match public copy

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Paddle live catalog must match public copy** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-03`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-04 — Regional tax and currency displayed by Paddle

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Regional tax and currency displayed by Paddle** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-04`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-05 — No client-supplied Paddle price ID

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **No client-supplied Paddle price ID** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-05`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-06 — Cost model with current vendor invoices

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Cost model with current vendor invoices** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-06`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-07 — Approval record before public purchase CTA

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Approval record before public purchase CTA** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-07`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 52-08 — Simulated checkout and live transition runbook

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Simulated checkout and live transition runbook** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `52-08`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 52-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 52-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 52-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of pricing approval, display and change control | Finance Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Trial free allocation and lifetime semantics unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Pro USD 19.99 sandbox reference only unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Paddle live catalog must match public copy unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Regional tax and currency displayed by Paddle unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: No client-supplied Paddle price ID unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Cost model with current vendor invoices unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Separate configured sandbox limits from commercially approved prices** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Finance Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Payment gate audit trail fields

| Field | Before live checkout | Evidence |
|---|---|---|
| Owner's currency and Pro live price approval | REQUIRED | signed product decision |
| Paddle business verification | REQUIRED | account dashboard review |
| Exact live price ID and plan mapping | REQUIRED | server config audit (redacted) |
| Sandbox purchase, portal, refund and webhooks | REQUIRED | provider sandbox receipts |
| Live-mode transaction only after signoff | REQUIRED | small controlled live test |
| Terms, Privacy, Billing/refund legal links | REQUIRED | URL response + counsel approval |
| OpenAI cost model and spend guard | REQUIRED | current pricing + cap drills |
| Support contact and incident ownership | REQUIRED | published real contact and on-call |

Never use the sandbox `USD 19.99` number to imply an approved price, even if it appears in a running backend plan catalog.
