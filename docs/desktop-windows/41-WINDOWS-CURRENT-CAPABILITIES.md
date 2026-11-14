# 41 — Windows Product Evidence and Constraints

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Windows Lead
**Primary category:** Desktop / Windows
**Purpose:** Keep the public product tied to the implemented Windows path.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/architecture/13-TRUST-BOUNDARIES.md, docs/01-PRD.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **keep the public product tied to the implemented windows path**. It is a documented design contract, not deployed code.
Release integrity: Only verified Windows builds may be linked from production pages.

### In scope
- WPF visible topmost window only.
- WASAPI speaker loopback and no microphone.
- Question endpoint after speech boundary.
- Answer and Coach hotkey behaviour.
- Fact provenance and truthful Bridge handling.
- DPAPI workspace and user-scoped credentials.
- Offline local prepared answers.
- Report contains suggestions not spoken performance.

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
- Validate signature publisher, SHA-256, N→N+1 and manual hardware results.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 41-01 — WPF visible topmost window only

**Boundary / owner:** Windows Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **WPF visible topmost window only**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **WPF visible topmost window only** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **WPF visible topmost window only**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-02 — WASAPI speaker loopback and no microphone

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **WASAPI speaker loopback and no microphone** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-03 — Question endpoint after speech boundary

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Question endpoint after speech boundary** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-04 — Answer and Coach hotkey behaviour

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Answer and Coach hotkey behaviour** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-05 — Fact provenance and truthful Bridge handling

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Fact provenance and truthful Bridge handling** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-06 — DPAPI workspace and user-scoped credentials

**Boundary / owner:** Windows Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **DPAPI workspace and user-scoped credentials**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **DPAPI workspace and user-scoped credentials** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **DPAPI workspace and user-scoped credentials**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-07 — Offline local prepared answers

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Offline local prepared answers** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 41-08 — Report contains suggestions not spoken performance

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Report contains suggestions not spoken performance** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `41-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 41-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 41-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 41-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of windows product evidence and constraints | Windows Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: WPF visible topmost window only unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: WASAPI speaker loopback and no microphone unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Question endpoint after speech boundary unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Answer and Coach hotkey behaviour unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Fact provenance and truthful Bridge handling unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: DPAPI workspace and user-scoped credentials unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Keep the public product tied to the implemented Windows path** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Windows Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
