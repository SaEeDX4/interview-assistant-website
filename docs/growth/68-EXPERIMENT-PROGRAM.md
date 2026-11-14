# 68 — Ethical Conversion Experiment Design

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Growth Lead
**Primary category:** Growth
**Purpose:** Test comprehension improvements without deception.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/product/10-MEASUREMENT-PLAN.md, docs/ux/33-CONVERSION-FLOWS.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **test comprehension improvements without deception**. It is a documented design contract, not deployed code.
Ethical growth: No invented testimonials, urgency, hire rates or manipulative consent collection.

### In scope
- Headline what-it-does clarity variant.
- CTA label download versus preview.
- Demo first-run guidance wording.
- Pricing limit transparency placement.
- Trust strip proximity to hero.
- Roadmap opt-in wording and genuine consent.
- Mobile screen conversion no misleading CTA.
- Support FAQ placement for hesitant users.

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
- Pre-register hypothesis and success threshold; compare guardrails and rollback.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 68-01 — Headline what-it-does clarity variant

**Boundary / owner:** Growth Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Headline what-it-does clarity variant**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Headline what-it-does clarity variant** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Headline what-it-does clarity variant**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-02 — CTA label download versus preview

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **CTA label download versus preview** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-03 — Demo first-run guidance wording

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Demo first-run guidance wording** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-04 — Pricing limit transparency placement

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Pricing limit transparency placement** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-05 — Trust strip proximity to hero

**Boundary / owner:** Growth Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Trust strip proximity to hero**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Trust strip proximity to hero** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Trust strip proximity to hero**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-06 — Roadmap opt-in wording and genuine consent

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Roadmap opt-in wording and genuine consent** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-07 — Mobile screen conversion no misleading CTA

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Mobile screen conversion no misleading CTA** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 68-08 — Support FAQ placement for hesitant users

**Boundary / owner:** Growth Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Support FAQ placement for hesitant users**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Support FAQ placement for hesitant users** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Support FAQ placement for hesitant users**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `68-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 68-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 68-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 68-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of ethical conversion experiment design | Growth Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Headline what-it-does clarity variant unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: CTA label download versus preview unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Demo first-run guidance wording unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Pricing limit transparency placement unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Trust strip proximity to hero unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Roadmap opt-in wording and genuine consent unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Test comprehension improvements without deception** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Growth Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
