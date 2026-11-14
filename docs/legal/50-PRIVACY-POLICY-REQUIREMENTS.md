# 50 — Public Privacy Notice Requirements

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Legal Counsel
**Primary category:** Legal
**Purpose:** Produce a traceable policy specification not fake legal language.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/privacy/46-DATA-INVENTORY.md, docs/privacy/48-DPIA-RISK-REGISTER.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **produce a traceable policy specification not fake legal language**. It is a documented design contract, not deployed code.
Counsel review: This document is a drafting requirements artifact, not legal advice or an approved policy.

### In scope
- Controller identity and support address UNKNOWN.
- Purposes and legal bases for each data class.
- Recipient categories OpenAI Paddle Supabase host.
- International transfer arrangements verified with vendors.
- Report deletion and storage qualifiers.
- Contact path for access correction deletion.
- Cookies and analytics truth.
- Policy versioning and user notice.

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
- No public terms link until named counsel and business owner sign the final text.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 50-01 — Controller identity and support address UNKNOWN

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **Controller identity and support address UNKNOWN** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-01`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-02 — Purposes and legal bases for each data class

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Purposes and legal bases for each data class** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-02`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-03 — Recipient categories OpenAI Paddle Supabase host

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Recipient categories OpenAI Paddle Supabase host** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-03`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-04 — International transfer arrangements verified with vendors

**Boundary / owner:** Legal Counsel + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **International transfer arrangements verified with vendors**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **International transfer arrangements verified with vendors** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **International transfer arrangements verified with vendors**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-04`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-05 — Report deletion and storage qualifiers

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Report deletion and storage qualifiers** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-05`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-06 — Contact path for access correction deletion

**Boundary / owner:** Legal Counsel + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Contact path for access correction deletion**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Contact path for access correction deletion** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Contact path for access correction deletion**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-06`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-07 — Cookies and analytics truth

**Boundary / owner:** Legal Counsel + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Cookies and analytics truth**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Cookies and analytics truth** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Cookies and analytics truth**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-07`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 50-08 — Policy versioning and user notice

**Boundary / owner:** Legal Counsel + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Policy versioning and user notice**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Policy versioning and user notice** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Policy versioning and user notice**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `50-08`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 50-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 50-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 50-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of public privacy notice requirements | Legal Counsel | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Controller identity and support address UNKNOWN unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Purposes and legal bases for each data class unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Recipient categories OpenAI Paddle Supabase host unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: International transfer arrangements verified with vendors unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Report deletion and storage qualifiers unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Contact path for access correction deletion unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Produce a traceable policy specification not fake legal language** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Legal Counsel:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
