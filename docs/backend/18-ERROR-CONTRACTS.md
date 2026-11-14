# 18 — API Error Taxonomy and Recovery

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Backend Lead
**Primary category:** Backend
**Purpose:** Give clients stable error codes and recoverable next actions.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/architecture/14-INTEGRATION-CONTRACTS.md, docs/backend/16-AUTH-PKCE-SESSION.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **give clients stable error codes and recoverable next actions**. It is a documented design contract, not deployed code.
Server enforcement: Status, permission and quota decisions must be calculated server-side; retries may not duplicate financial or usage effects.

### In scope
- 401 invalid or expired identity.
- 402 exhausted allocation and billing state.
- 403 revoked device or forbidden operation.
- 409 conflict in document version or active lease.
- 429 per-user and global safety throttling.
- 503 provider outage or maintenance.
- Timeout after uncertain write operation.
- Correlation ID displayed without exposing content.

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
- Integration acceptance uses a real PostgreSQL test database plus signed provider fixtures.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 18-01 — 401 invalid or expired identity

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **401 invalid or expired identity** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-02 — 402 exhausted allocation and billing state

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **402 exhausted allocation and billing state** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-03 — 403 revoked device or forbidden operation

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **403 revoked device or forbidden operation** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-04 — 409 conflict in document version or active lease

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **409 conflict in document version or active lease** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-05 — 429 per-user and global safety throttling

**Boundary / owner:** Backend Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **429 per-user and global safety throttling**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **429 per-user and global safety throttling** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **429 per-user and global safety throttling**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-06 — 503 provider outage or maintenance

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **503 provider outage or maintenance** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-07 — Timeout after uncertain write operation

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Timeout after uncertain write operation** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 18-08 — Correlation ID displayed without exposing content

**Boundary / owner:** Backend Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Correlation ID displayed without exposing content**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Correlation ID displayed without exposing content** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Correlation ID displayed without exposing content**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `18-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 18-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 18-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 18-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of api error taxonomy and recovery | Backend Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: 401 invalid or expired identity unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: 402 exhausted allocation and billing state unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: 403 revoked device or forbidden operation unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: 409 conflict in document version or active lease unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: 429 per-user and global safety throttling unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: 503 provider outage or maintenance unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Give clients stable error codes and recoverable next actions** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Backend Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
