# 42 — Windows Installer, Signing and Update Acceptance

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Release Engineer
**Primary category:** Desktop / Windows
**Purpose:** Make installation a verified deliverable not a placeholder CTA.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/desktop-windows/41-WINDOWS-CURRENT-CAPABILITIES.md, docs/devops-deployment/58-GITHUB-PAGES-OPERATIONS.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **make installation a verified deliverable not a placeholder cta**. It is a documented design contract, not deployed code.
Release integrity: Only verified Windows builds may be linked from production pages.

### In scope
- Velopack per-user stable setup executable.
- Portable ZIP and SHA256 alongside release.
- Authenticode trust chain validation.
- SmartScreen risk acknowledged before signoff.
- Channel stable versus beta version mapping.
- No update during active or paused interview.
- N to N-plus-one upgrade and uninstall evidence.
- Tampered package refuses auto-update.

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
- Validate signature publisher, SHA-256, N→N+1 and manual hardware results.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 42-01 — Velopack per-user stable setup executable

**Boundary / owner:** Release Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Velopack per-user stable setup executable**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Velopack per-user stable setup executable** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Velopack per-user stable setup executable**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-02 — Portable ZIP and SHA256 alongside release

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **Portable ZIP and SHA256 alongside release** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-03 — Authenticode trust chain validation

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **Authenticode trust chain validation** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-04 — SmartScreen risk acknowledged before signoff

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **SmartScreen risk acknowledged before signoff** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-05 — Channel stable versus beta version mapping

**Boundary / owner:** Release Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Channel stable versus beta version mapping**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Channel stable versus beta version mapping** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Channel stable versus beta version mapping**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-06 — No update during active or paused interview

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **No update during active or paused interview** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-07 — N to N-plus-one upgrade and uninstall evidence

**Boundary / owner:** Release Engineer + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **N to N-plus-one upgrade and uninstall evidence**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **N to N-plus-one upgrade and uninstall evidence** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **N to N-plus-one upgrade and uninstall evidence**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 42-08 — Tampered package refuses auto-update

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Tampered package refuses auto-update** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `42-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 42-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 42-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 42-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of windows installer, signing and update acceptance | Release Engineer | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Velopack per-user stable setup executable unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Portable ZIP and SHA256 alongside release unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Authenticode trust chain validation unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: SmartScreen risk acknowledged before signoff unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Channel stable versus beta version mapping unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: No update during active or paused interview unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Make installation a verified deliverable not a placeholder CTA** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Release Engineer:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Installer verification protocol

1. Select one release commit and freeze the expected asset manifest.
2. Produce `InterviewAssistant.Desktop-stable-Setup.exe` and portable ZIP from that commit; do not assume test version numbers are public versions.
3. Sign the setup with a trusted publisher certificate and verify Authenticode chain, timestamp and revocation on a clean Windows machine.
4. Record SHA-256 digest for each actual artifact; host the digest alongside each asset.
5. Download from the same public URL used in marketing; verify digest locally and installer metadata against recorded commit.
6. Install without admin rights; test profile data survival for N→N+1 and uninstall.
7. During active/paused listening assert update action is disabled; after exit verify update publisher matches.
8. Reject unsigned and tampered update packages; test portable ZIP has no auto-update claim.
9. Store evidence screenshot, digest, certificate details (not private key), test log and owner signoff.

**Current state:** source documents say Azure Artifact Signing and SmartScreen remain unverified; no functioning signed public installer is established in this task.
