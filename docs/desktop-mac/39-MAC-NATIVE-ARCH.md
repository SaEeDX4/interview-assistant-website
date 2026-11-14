# 39 — Dedicated Native macOS App Architecture

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Mac Lead
**Primary category:** Desktop / Mac
**Purpose:** Specify a true native Mac product rather than a WPF port.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/architecture/13-TRUST-BOUNDARIES.md, docs/data-ai/61-FACT-TRUTH-BOUNDARY.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **specify a true native mac product rather than a wpf port**. It is a documented design contract, not deployed code.
Native implementation: macOS requires its own Swift-native shell, permission and distribution review; WPF does not run as the native app.

### In scope
- SwiftUI or AppKit native shell.
- Shared wire contracts without Windows UI dependencies.
- Keychain credential protection.
- Local encrypted resume workspace.
- Native updater and signing notarization.
- Menu bar and visible-window rules.
- Accessible keyboard and VoiceOver semantics.
- Offline question-bank fallback.

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
- App must pass notarization and VoiceOver tests before listing any download.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 39-01 — SwiftUI or AppKit native shell

**Boundary / owner:** Mac Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **SwiftUI or AppKit native shell**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **SwiftUI or AppKit native shell** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **SwiftUI or AppKit native shell**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-01`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-02 — Shared wire contracts without Windows UI dependencies

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Shared wire contracts without Windows UI dependencies** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-02`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-03 — Keychain credential protection

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Keychain credential protection** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-03`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-04 — Local encrypted resume workspace

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Local encrypted resume workspace** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-04`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-05 — Native updater and signing notarization

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Native updater and signing notarization** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-05`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-06 — Menu bar and visible-window rules

**Boundary / owner:** Mac Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Menu bar and visible-window rules**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Menu bar and visible-window rules** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Menu bar and visible-window rules**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-06`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-07 — Accessible keyboard and VoiceOver semantics

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Accessible keyboard and VoiceOver semantics** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-07`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 39-08 — Offline question-bank fallback

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Offline question-bank fallback** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `39-08`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 39-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 39-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 39-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of dedicated native macos app architecture | Mac Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: SwiftUI or AppKit native shell unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Shared wire contracts without Windows UI dependencies unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Keychain credential protection unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Local encrypted resume workspace unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Native updater and signing notarization unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Menu bar and visible-window rules unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Specify a true native Mac product rather than a WPF port** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Mac Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Native Mac modular architecture

```text
SwiftUI/AppKit visible native window
    -> Keychain sign-in token holder
    -> typed HTTPS/WSS client (shared contract semantics, new platform client)
    -> encrypted local profile and question-bank storage
    -> macOS ScreenCaptureKit audio adapter (proposed, permission gated)
    -> answer/Coach presentation and accessible keyboard navigation
```

- No attempt to distribute the WPF binaries as a native Mac application.
- Define `IAudioSource` interface with `StartAsync`, `StopAsync`, `OnAudioAvailable` and `OnPermissionChanged`; no mic route unless separately explicitly added through reviewed product scope (current hard constraint says no mic).
- Sign, notarize, staple, package and verify entitlements as a distinct Mac release process; signing for Windows has no effect here.
