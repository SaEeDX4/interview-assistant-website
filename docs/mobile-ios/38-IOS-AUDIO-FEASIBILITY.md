# 38 — iOS Audio Capture and Store Review Research

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** iOS Audio Engineer
**Primary category:** Mobile / iOS
**Purpose:** Define and test platform constraints before promising live help.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/mobile-ios/37-IOS-SHARED-ARCH.md, docs/security/43-THREAT-MODEL.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **define and test platform constraints before promising live help**. It is a documented design contract, not deployed code.
Platform permission: No promise of background or cross-app audio before successful device experiments and store review.

### In scope
- System audio source availability by OS version.
- ScreenCaptureKit or ReplayKit permissions experiment.
- Capture in same app versus other communication app.
- Foreground versus background execution restrictions.
- Consent and system indication obligations.
- Interruption handling and no-audio-storage proof.
- App Review prerelease consultation where appropriate.
- Preparation-only fallback if meeting playback unavailable.

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
- Log OS version, foreground state, permission result and audio capture availability.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 38-01 — System audio source availability by OS version

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **System audio source availability by OS version** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-01`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-02 — ScreenCaptureKit or ReplayKit permissions experiment

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **ScreenCaptureKit or ReplayKit permissions experiment** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-02`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-03 — Capture in same app versus other communication app

**Boundary / owner:** iOS Audio Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Capture in same app versus other communication app**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Capture in same app versus other communication app** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Capture in same app versus other communication app**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-03`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-04 — Foreground versus background execution restrictions

**Boundary / owner:** iOS Audio Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Foreground versus background execution restrictions**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Foreground versus background execution restrictions** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Foreground versus background execution restrictions**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-04`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-05 — Consent and system indication obligations

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Consent and system indication obligations** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-05`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-06 — Interruption handling and no-audio-storage proof

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Interruption handling and no-audio-storage proof** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-06`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-07 — App Review prerelease consultation where appropriate

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **App Review prerelease consultation where appropriate** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-07`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 38-08 — Preparation-only fallback if meeting playback unavailable

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Preparation-only fallback if meeting playback unavailable** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `38-08`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 38-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 38-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 38-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of ios audio capture and store review research | iOS Audio Engineer | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: System audio source availability by OS version unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: ScreenCaptureKit or ReplayKit permissions experiment unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Capture in same app versus other communication app unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Foreground versus background execution restrictions unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Consent and system indication obligations unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Interruption handling and no-audio-storage proof unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Define and test platform constraints before promising live help** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / iOS Audio Engineer:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. iOS audio feasibility matrix

Official framework starting point: https://developer.apple.com/documentation/ScreenCaptureKit. Apple's current documentation discusses ScreenCaptureKit across multiple platforms, but that **does not establish permission to intercept another call app's protected playback audio**.

| Experiment | Fixed variable | Observe | Stop condition |
|---|---|---|---|
| I1 | foreground own-app played sample, latest supported iOS | API availability and permitted sample buffers | no public claim if API unsupported in test build |
| I2 | foreground external conference call | availability of other-app playback by capture API | protected audio unavailable |
| I3 | background after app switch | session continuation and permission status | OS suspends capture or extension |
| I4 | bluetooth/AirPods route | received source and no microphone access | unintended mic frames |
| I5 | consent withdrawn | prompt/revocation UX | capture continues despite revoked permission |
| I6 | App Review guideline 2.5.14 | explicit consent and visible indication | compliance cannot be documented |

Fallback to manually entered questions and interview preparation. UNKNOWN must be resolved with real device, OS, conferencing-app version and vendor/policy documentation before any feature or pricing promise.
