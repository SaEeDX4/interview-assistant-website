# 24 — Semantic HTML and Content Structure

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Frontend Lead
**Primary category:** Frontend / Website
**Purpose:** Specify accessible page markup despite missing source HTML.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/04-UX-SPEC.md, docs/03-DESIGN-SYSTEM.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **specify accessible page markup despite missing source html**. It is a documented design contract, not deployed code.
Browser behaviour: The website is static, with no build step and no secret-bearing runtime code.

### In scope
- Main landmark and one primary heading.
- Skip link target and sticky-nav offset.
- Button and anchor intent for download and demo.
- Actual label and error text for question input.
- Live-region announcement without duplicate speech.
- FAQ details and summary keyboard behaviour.
- Footer legal links disabled until real policy.
- Document title canonical language and metadata.

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
- Acceptance includes a keyboard run, a 320 px viewport and a network-off run.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 24-01 — Main landmark and one primary heading

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Main landmark and one primary heading** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-02 — Skip link target and sticky-nav offset

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Skip link target and sticky-nav offset** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-03 — Button and anchor intent for download and demo

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Button and anchor intent for download and demo** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-04 — Actual label and error text for question input

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Actual label and error text for question input** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-05 — Live-region announcement without duplicate speech

**Boundary / owner:** Platform audio engineer + privacy reviewer.
**Controlled setup:** Record physical device, OS/API level, meeting client version, output device, audio usage classification, and explicit permission result.
**Positive path:** With test-owner consent and a clearly allowed audio source, exercise **Live-region announcement without duplicate speech** and record actual PCM availability, sample rate, source application and capture indicator; an empty stream is not a pass.
**Negative / abuse path:** Revoke consent, switch to a protected VOICE_COMMUNICATION stream, or deny screen/system-audio recording; verify no silent capture and no invented transcript.
**Measurable assertion:** Store an objective capture/no-capture matrix with app/version/permission states; if any required meeting app cannot be captured, label full live assist UNKNOWN for that route.
**Failure recovery:** Stop listening and offer prepare/practise or manual typed questions; never request microphone access as a covert substitute.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-06 — FAQ details and summary keyboard behaviour

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **FAQ details and summary keyboard behaviour** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-07 — Footer legal links disabled until real policy

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Footer legal links disabled until real policy** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 24-08 — Document title canonical language and metadata

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Document title canonical language and metadata** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `24-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 24-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 24-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 24-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of semantic html and content structure | Frontend Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Main landmark and one primary heading unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Skip link target and sticky-nav offset unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Button and anchor intent for download and demo unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Actual label and error text for question input unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Live-region announcement without duplicate speech unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: FAQ details and summary keyboard behaviour unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Specify accessible page markup despite missing source HTML** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Frontend Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
