# 63 — Ten-Language Capability Matrix and Gates

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Localization Lead
**Primary category:** Data / AI
**Purpose:** Avoid equating registry support with native-speech production quality.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/ux/34-RTL-LOCALIZATION-UX.md, docs/data-ai/62-MODEL-EVALUATION.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **avoid equating registry support with native-speech production quality**. It is a documented design contract, not deployed code.
Truth constraints: Unknown candidate facts cannot become first-person accomplishments, even as polished examples.

### In scope
- English baseline and accent cases.
- Spanish and French live transcription cases.
- German Portuguese Italian naturalness.
- Persian Arabic complete RTL and bidi.
- Simplified Chinese segmentation and labels.
- Hindi UI date and number rendering.
- Real audio noisy meeting conditions.
- Per-language public claim gate signed after testing.

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
- Keep failure examples and evaluator labels in source-controlled fixtures.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 63-01 — English baseline and accent cases

**Boundary / owner:** Localization Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **English baseline and accent cases**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **English baseline and accent cases** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **English baseline and accent cases**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-02 — Spanish and French live transcription cases

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Spanish and French live transcription cases** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-03 — German Portuguese Italian naturalness

**Boundary / owner:** Localization Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **German Portuguese Italian naturalness**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **German Portuguese Italian naturalness** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **German Portuguese Italian naturalness**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-04 — Persian Arabic complete RTL and bidi

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Persian Arabic complete RTL and bidi** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-05 — Simplified Chinese segmentation and labels

**Boundary / owner:** Localization Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Simplified Chinese segmentation and labels**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Simplified Chinese segmentation and labels** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Simplified Chinese segmentation and labels**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-06 — Hindi UI date and number rendering

**Boundary / owner:** Localization Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Hindi UI date and number rendering**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Hindi UI date and number rendering** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Hindi UI date and number rendering**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-07 — Real audio noisy meeting conditions

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Real audio noisy meeting conditions** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 63-08 — Per-language public claim gate signed after testing

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Per-language public claim gate signed after testing** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `63-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 63-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 63-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 63-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of ten-language capability matrix and gates | Localization Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: English baseline and accent cases unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Spanish and French live transcription cases unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: German Portuguese Italian naturalness unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Persian Arabic complete RTL and bidi unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Simplified Chinese segmentation and labels unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Hindi UI date and number rendering unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Avoid equating registry support with native-speech production quality** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Localization Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Current source ten-language registry versus research gate

| Code | Source registry | Right-to-left? | Real live transcription and naturalness |
|---|---|---|---|
| en | English | No | NOT VERIFIED FOR PUBLIC PRODUCTION IN THIS TASK |
| es | Spanish | No | NOT VERIFIED |
| fr | French | No | NOT VERIFIED |
| de | German | No | NOT VERIFIED |
| pt | Portuguese | No | NOT VERIFIED |
| it | Italian | No | NOT VERIFIED |
| ar | Arabic | Yes | NOT VERIFIED; RTL and linguistic review required |
| fa | Persian | Yes | NOT VERIFIED; RTL and linguistic review required |
| zh | Simplified Chinese | No | NOT VERIFIED |
| hi | Hindi | No | NOT VERIFIED |

`docs/v2/MULTILINGUAL_VALIDATION.md` documents language registry and incomplete real-audio validation. Each language needs explicit sample sets: speech recognition accuracy, proper nouns, punctuation, detected versus selected language, factual Bridge/Coach naturalness, native speaker scorecards and no overflow at real UI scaling.
