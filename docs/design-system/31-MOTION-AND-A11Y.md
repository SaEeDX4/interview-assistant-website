# 31 — Motion, Focus and Accessibility Decisions

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Accessibility Lead
**Primary category:** Design / System
**Purpose:** Balance premium animation with readable reduced motion.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/design-system/29-VISUAL-TOKENS.md, docs/design-system/30-COMPONENT-STATE-ATLAS.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **balance premium animation with readable reduced motion**. It is a documented design contract, not deployed code.
Visual contract: Decorative polish cannot defeat contrast, perceivability or reliable interaction.

### In scope
- Sequential bullet reveal under 200 milliseconds per step.
- No motion that conceals results before CSS loads.
- Prefers reduced motion immediate updates.
- Focus-visible outlines across keyboard controls.
- Escape to close navigation while retaining context.
- Live region atomicity for small messages.
- No flashing or continuous distraction.
- Touch targets minimum 24 by 24 CSS pixels.

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
- Every release includes screen captures at 320, 768 and 1440 px and at 200% zoom.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 31-01 — Sequential bullet reveal under 200 milliseconds per step

**Boundary / owner:** Accessibility Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Sequential bullet reveal under 200 milliseconds per step**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Sequential bullet reveal under 200 milliseconds per step** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Sequential bullet reveal under 200 milliseconds per step**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-02 — No motion that conceals results before CSS loads

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **No motion that conceals results before CSS loads** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-03 — Prefers reduced motion immediate updates

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Prefers reduced motion immediate updates** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-04 — Focus-visible outlines across keyboard controls

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Focus-visible outlines across keyboard controls** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-05 — Escape to close navigation while retaining context

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Escape to close navigation while retaining context** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-06 — Live region atomicity for small messages

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Live region atomicity for small messages** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-07 — No flashing or continuous distraction

**Boundary / owner:** Accessibility Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No flashing or continuous distraction**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No flashing or continuous distraction** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No flashing or continuous distraction**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 31-08 — Touch targets minimum 24 by 24 CSS pixels

**Boundary / owner:** Accessibility Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Touch targets minimum 24 by 24 CSS pixels**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Touch targets minimum 24 by 24 CSS pixels** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Touch targets minimum 24 by 24 CSS pixels**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `31-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 31-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 31-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 31-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of motion, focus and accessibility decisions | Accessibility Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Sequential bullet reveal under 200 milliseconds per step unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: No motion that conceals results before CSS loads unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Prefers reduced motion immediate updates unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Focus-visible outlines across keyboard controls unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Escape to close navigation while retaining context unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Live region atomicity for small messages unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Balance premium animation with readable reduced motion** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Accessibility Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Motion and focus sequence acceptance

| Action | Keyboard | Screen reader | Reduced-motion outcome |
|---|---|---|---|
| Open menu | Enter/Space, focus stays on control | expanded=true announced | menu appears without entrance animation |
| Close menu | Escape returns to menu trigger | expanded=false announced | instant close |
| Answer mode | pressed=true | label and mode state | full three-step result without delayed hide |
| Coach mode | pressed=true | three keys + structure announced clearly | no stagger that delays text |
| Empty question | focus input and show error | error associated with input | instant text feedback |
| Missing download | do not present fake functional link | clear not-ready message | no placeholder success |

A CSS transition ending does not imply a DOM state is correct. The accessibility gate must test real focus order and at least one NVDA/Windows or VoiceOver/Mac browser combination for the public site.
