# 45 — Dependency, Signing and Supply-Chain Gate

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** AppSec Lead
**Primary category:** Security
**Purpose:** Enforce traceable binary provenance before distribution.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/desktop-windows/42-WINDOWS-RELEASE-INTEGRITY.md, docs/security/43-THREAT-MODEL.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **enforce traceable binary provenance before distribution**. It is a documented design contract, not deployed code.
Adversarial case: Assume malicious clients and imported text while keeping legitimate recovery paths.

### In scope
- Pinned dependency and SDK versions.
- NuGet license closure reviewed.
- No secrets in build outputs.
- SBOM manifest per release.
- Windows code signature and timestamp.
- SHA256 artifact digest on public domain.
- Release feed signed trust model.
- Rollback on mismatched source commit.

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
- Attach attack-reproduction steps, test identity and redacted result.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 45-01 — Pinned dependency and SDK versions

**Boundary / owner:** AppSec Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Pinned dependency and SDK versions**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Pinned dependency and SDK versions** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Pinned dependency and SDK versions**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-01`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-02 — NuGet license closure reviewed

**Boundary / owner:** AppSec Lead + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **NuGet license closure reviewed**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **NuGet license closure reviewed** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **NuGet license closure reviewed**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-02`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-03 — No secrets in build outputs

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **No secrets in build outputs** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-03`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-04 — SBOM manifest per release

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **SBOM manifest per release** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-04`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-05 — Windows code signature and timestamp

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Windows code signature and timestamp** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-05`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-06 — SHA256 artifact digest on public domain

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **SHA256 artifact digest on public domain** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-06`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-07 — Release feed signed trust model

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **Release feed signed trust model** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-07`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 45-08 — Rollback on mismatched source commit

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Rollback on mismatched source commit** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `45-08`.
**Launch gate:** NO-GO for paid or advertised dependent features.

| Case | Procedure | Expected evidence |
|---|---|---|
| 45-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 45-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 45-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of dependency, signing and supply-chain gate | AppSec Lead | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Pinned dependency and SDK versions unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: NuGet license closure reviewed unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: No secrets in build outputs unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: SBOM manifest per release unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Windows code signature and timestamp unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: SHA256 artifact digest on public domain unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Enforce traceable binary provenance before distribution** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / AppSec Lead:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.
