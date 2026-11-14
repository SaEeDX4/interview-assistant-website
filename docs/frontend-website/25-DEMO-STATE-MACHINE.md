# 25 — Simulated Demo State Machine and Test Cases

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Frontend Lead
**Primary category:** Frontend / Website
**Purpose:** Make the interactive demo truthful and deterministically testable.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/04-UX-SPEC.md, docs/03-DESIGN-SYSTEM.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **make the interactive demo truthful and deterministically testable**. It is a documented design contract, not deployed code.
Browser behaviour: The website is static, with no build step and no secret-bearing runtime code.

### In scope
- Idle state with one example question visible.
- Loading state with cancellable timer.
- Answer mode reveals exactly three steps sequentially.
- Coach mode displays three keywords plus a structure.
- Typed unknown question uses generic framework only.
- Persian RTL question rendering isolated from English chrome.
- Rapid repeated clicks cancel previous timers.
- Reduced-motion immediate results and no hidden content.

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

### 25-01 — Idle state with one example question visible

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Idle state with one example question visible** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-02 — Loading state with cancellable timer

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Loading state with cancellable timer** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-03 — Answer mode reveals exactly three steps sequentially

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Answer mode reveals exactly three steps sequentially** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-04 — Coach mode displays three keywords plus a structure

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Coach mode displays three keywords plus a structure** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-05 — Typed unknown question uses generic framework only

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Typed unknown question uses generic framework only** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-06 — Persian RTL question rendering isolated from English chrome

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Persian RTL question rendering isolated from English chrome** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-07 — Rapid repeated clicks cancel previous timers

**Boundary / owner:** Frontend Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Rapid repeated clicks cancel previous timers**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Rapid repeated clicks cancel previous timers** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Rapid repeated clicks cancel previous timers**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 25-08 — Reduced-motion immediate results and no hidden content

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Reduced-motion immediate results and no hidden content** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `25-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 25-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 25-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 25-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of simulated demo state machine and test cases | Frontend Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Idle state with one example question visible unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Loading state with cancellable timer unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Answer mode reveals exactly three steps sequentially unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Coach mode displays three keywords plus a structure unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Typed unknown question uses generic framework only unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Persian RTL question rendering isolated from English chrome unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Make the interactive demo truthful and deterministically testable** must be demonstrable without inferred capabilities.
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


## 9. Concrete attached demo code review

`app.js` lines 122–145 create every `<li>` immediately, then add `is-new` with a delayed class. All three items can be visible before the animation. Therefore "appears one at a time" is not yet demonstrated in the attached implementation.

**Proposed correction without code in this package:**

```text
onNewQuestion:
  cancelAllPendingTimers()
  setState(loading, ariaBusy=true)
  validate selected sample or use generic framework
  if reducedMotion: render accessible full result once
  else: insert bullet 1, then bullet 2, then bullet 3 at measured intervals
  announce final completed answer once, not three noisy announcements
onModeSwitch:
  cancelAllPendingTimers(); reset result; render correct count for new mode
onNewTypedInput:
  do not generate autobiographical achievements; render answer structure only
```

**Browser acceptance:** freeze timers at t=0, t=180ms, t=360ms; assert visible point counts equal 1/2/3 (or a justified selected design), no empty ghost items, stable focus and full result to assistive tech. Test typed Persian sample direction and repeated mode clicks.
