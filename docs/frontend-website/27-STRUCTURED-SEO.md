# 27 — Search Metadata and Structured Data Validation

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** SEO Lead
**Primary category:** Frontend / Website
**Purpose:** Expose only verifiable metadata and crawlable pages.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/06-CONTENT-SEO.md, docs/frontend-website/24-HTML-SEMANTICS.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **expose only verifiable metadata and crawlable pages**. It is a documented design contract, not deployed code.
Browser behaviour: The website is static, with no build step and no secret-bearing runtime code.

### In scope
- Single canonical URL at approved domain.
- Product description with Windows-only scope.
- No invented AggregateRating or Review schema.
- Sitemap absolute URLs only when domain verified.
- Robots rules do not block legal pages.
- Social cards use approved images and text.
- Accessible page titles differentiated by intent.
- No roadmap features represented as downloads.

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

### 27-01 — Single canonical URL at approved domain

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Single canonical URL at approved domain** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-02 — Product description with Windows-only scope

**Boundary / owner:** SEO Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Product description with Windows-only scope**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Product description with Windows-only scope** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Product description with Windows-only scope**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-03 — No invented AggregateRating or Review schema

**Boundary / owner:** SEO Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **No invented AggregateRating or Review schema**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **No invented AggregateRating or Review schema** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **No invented AggregateRating or Review schema**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-04 — Sitemap absolute URLs only when domain verified

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Sitemap absolute URLs only when domain verified** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-05 — Robots rules do not block legal pages

**Boundary / owner:** SEO Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Robots rules do not block legal pages**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Robots rules do not block legal pages** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Robots rules do not block legal pages**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-06 — Social cards use approved images and text

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Social cards use approved images and text** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-07 — Accessible page titles differentiated by intent

**Boundary / owner:** Design systems + accessibility QA.
**Controlled setup:** Open actual served content at 320, 768 and 1440 CSS px with keyboard-only navigation, 200% zoom and reduced-motion enabled.
**Positive path:** Render **Accessible page titles differentiated by intent** in default, keyboard-focused, loading/error and RTL (where relevant) states; capture computed styles and UI semantics.
**Negative / abuse path:** Use a long Persian label, narrow browser, font fallback or disabled animation; assert no clipped content, focus loss or unannounced state.
**Measurable assertion:** Normal text contrast ≥4.5:1, large text ≥3:1, no keyboard trap and no 320px horizontal overflow; exceptions require documented WCAG criterion.
**Failure recovery:** Provide stable text-based state, static reduced-motion variant and visible error retry; decoration must not gate task completion.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 27-08 — No roadmap features represented as downloads

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **No roadmap features represented as downloads** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `27-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 27-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 27-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 27-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of search metadata and structured data validation | SEO Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Single canonical URL at approved domain unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Product description with Windows-only scope unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: No invented AggregateRating or Review schema unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Sitemap absolute URLs only when domain verified unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Robots rules do not block legal pages unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Social cards use approved images and text unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Expose only verifiable metadata and crawlable pages** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / SEO Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
