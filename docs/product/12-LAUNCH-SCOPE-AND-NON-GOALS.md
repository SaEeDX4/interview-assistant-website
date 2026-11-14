# 12 — Launch Scope and Explicit Non-Goals

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Product Lead
**Primary category:** Product
**Purpose:** Prevent scope drift and fabricated future promises.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/01-PRD.md, docs/08-ROADMAP.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **prevent scope drift and fabricated future promises**. It is a documented design contract, not deployed code.
User expectation: Do not imply that an interviewed candidate was independently tested or that success is guaranteed.

### In scope
- Windows 10 and 11 x64 purchase/readiness scope.
- Website demonstration is simulated and local-only.
- No in-browser real meeting capture.
- No Android shipping feature or store button.
- No iOS native app now.
- No macOS binary now.
- No hiring prediction or candidate scoring.
- No hidden mode or recording evasion.

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
- A five-participant moderated comprehension test is a proposed gate, not a completed study.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 12-01 — Windows 10 and 11 x64 purchase/readiness scope

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Windows 10 and 11 x64 purchase/readiness scope**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Windows 10 and 11 x64 purchase/readiness scope** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Windows 10 and 11 x64 purchase/readiness scope**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-02 — Website demonstration is simulated and local-only

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Website demonstration is simulated and local-only** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-03 — No in-browser real meeting capture

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No in-browser real meeting capture**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No in-browser real meeting capture** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No in-browser real meeting capture**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-04 — No Android shipping feature or store button

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No Android shipping feature or store button**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No Android shipping feature or store button** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No Android shipping feature or store button**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-05 — No iOS native app now

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No iOS native app now**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No iOS native app now** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No iOS native app now**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-06 — No macOS binary now

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No macOS binary now**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No macOS binary now** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No macOS binary now**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-07 — No hiring prediction or candidate scoring

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No hiring prediction or candidate scoring**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No hiring prediction or candidate scoring** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No hiring prediction or candidate scoring**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 12-08 — No hidden mode or recording evasion

**Boundary / owner:** Product Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No hidden mode or recording evasion**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No hidden mode or recording evasion** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No hidden mode or recording evasion**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `12-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 12-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 12-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 12-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of launch scope and explicit non-goals | Product Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Windows 10 and 11 x64 purchase/readiness scope unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Website demonstration is simulated and local-only unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: No in-browser real meeting capture unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: No Android shipping feature or store button unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: No iOS native app now unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: No macOS binary now unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Prevent scope drift and fabricated future promises** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Product Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
