# 66 — Support Triage and Known Failure Recovery

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Support Lead
**Primary category:** Support
**Purpose:** Provide customer-facing steps with correlation-only diagnostics.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/backend/18-ERROR-CONTRACTS.md, docs/devops-deployment/60-INCIDENT-PLAYBOOK.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **provide customer-facing steps with correlation-only diagnostics**. It is a documented design contract, not deployed code.
Sensitive escalation: Do not ask users for passwords, raw resumes or full transcripts to troubleshoot.

### In scope
- No audio from wrong playback device.
- API outage with offline prepared fallback.
- Trial exhausted but local answers retained.
- Unsigned installer and SmartScreen guidance.
- Login browser callback blocked.
- Paddle checkout does not open.
- Report deletion retention question.
- Account switched local profile appears missing.

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
- Support scripts require minimal evidence and a privacy-safe correlation token.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 66-01 — No audio from wrong playback device

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **No audio from wrong playback device** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-02 — API outage with offline prepared fallback

**Boundary / owner:** Support Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **API outage with offline prepared fallback**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **API outage with offline prepared fallback** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **API outage with offline prepared fallback**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-03 — Trial exhausted but local answers retained

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Trial exhausted but local answers retained** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-04 — Unsigned installer and SmartScreen guidance

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Unsigned installer and SmartScreen guidance** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-05 — Login browser callback blocked

**Boundary / owner:** Support Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Login browser callback blocked**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Login browser callback blocked** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Login browser callback blocked**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-06 — Paddle checkout does not open

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Paddle checkout does not open** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-07 — Report deletion retention question

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Report deletion retention question** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 66-08 — Account switched local profile appears missing

**Boundary / owner:** Support Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Account switched local profile appears missing**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Account switched local profile appears missing** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Account switched local profile appears missing**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `66-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 66-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 66-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 66-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of support triage and known failure recovery | Support Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: No audio from wrong playback device unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: API outage with offline prepared fallback unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Trial exhausted but local answers retained unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Unsigned installer and SmartScreen guidance unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Login browser callback blocked unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Paddle checkout does not open unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Provide customer-facing steps with correlation-only diagnostics** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Support Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
