# 14 — Website and Desktop Integration Contracts

**Document status:** proposed v2 specification; not evidence that new features shipped.
**Accountable owner:** Principal Architect
**Primary category:** Architecture
**Purpose:** Define concrete touchpoints that can be tested end-to-end.
**Source snapshot:** `claude/clever-hopper-m8kdai` at `4976e16f5379d38e9b265d3db979d2f8d7d7aa21` (read-only GitHub verification).
**Dependencies:** docs/02-ARCHITECTURE.md, docs/architecture/13-TRUST-BOUNDARIES.md
**Source of truth:** https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT; live runtime conditions require fresh validation.

## 1. Scope and boundaries

The deliverable addresses: **define concrete touchpoints that can be tested end-to-end**. It is a documented design contract, not deployed code.
Trust boundary: Treat public browsers and the desktop client as untrusted; no authoritative limits are ever computed in website JavaScript.

### In scope
- Installer URL and SHA-256 metadata contract.
- Product release channel and latest validated build mapping.
- Backend health and readiness endpoints.
- Supabase sign-in initiation in Windows client only.
- Paddle checkout initiated by authenticated client.
- Public config fields and forbidden secrets.
- Support and legal URL canonicalization.
- Waitlist endpoint if and only if commissioned.

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
- An architecture review must inspect one client-bypass trace per privileged boundary.
- Unresolved facts are marked **UNKNOWN** and require an evidence link and named owner to close.
- Proposed thresholds are explicit targets; actual production metrics have not been measured unless stated otherwise.

## 3. Normative behaviour and verification cases

### 14-01 — Installer URL and SHA-256 metadata contract

**Boundary / owner:** Privacy engineering + legal counsel.
**Controlled setup:** Seed identifiable *synthetic* profile/report data, opt-in state, processor configuration and retention clock; no real candidate data in fixtures.
**Positive path:** Trace **Installer URL and SHA-256 metadata contract** across local workspace, backend/identity provider and documented processor; record each persisted and transmitted field.
**Negative / abuse path:** Cancel midway, deny consent, request deletion during provider outage, or test an expired retention item; verify truthful pending state.
**Measurable assertion:** Compare pre/post data inventory at every owned store; no unlisted payload fields and no claim of global deletion until processor and backup evidence exists.
**Failure recovery:** Surface a scoped pending/export/erase status with contact path; do not replace partial removal with an unconditional success banner.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-01`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-01-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-01-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-01-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-02 — Product release channel and latest validated build mapping

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **Product release channel and latest validated build mapping** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-02`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-02-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-02-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-02-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-03 — Backend health and readiness endpoints

**Boundary / owner:** Principal Architect + independent QA.
**Controlled setup:** Prepare a representative controlled scenario for **Backend health and readiness endpoints**, a deliberate counterexample, and the current relevant source decision ID.
**Positive path:** Implement or inspect **Backend health and readiness endpoints** at its actual owning surface; record observable before/after behaviour rather than a subjective design judgment.
**Negative / abuse path:** Exercise the closest boundary failure for **Backend health and readiness endpoints**: missing prerequisite, cancellation, denied permission or conflicting state; confirm the result is not fabricated.
**Measurable assertion:** Write the pass/fail assertion as a count, duration, named UI state, response code, data invariant or signed owner decision; no adjective-only acceptance.
**Failure recovery:** Use clear unavailable/retry messaging, preserve user-owned data and keep any dependent public claim withheld until tested.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-03`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-03-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-03-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-03-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-04 — Supabase sign-in initiation in Windows client only

**Boundary / owner:** Backend identity lead + security reviewer.
**Controlled setup:** Use two isolated accounts (A/B), short-lived test JWTs and a disposable device; log only correlation IDs and status.
**Positive path:** Exercise **Supabase sign-in initiation in Windows client only** using a valid authenticated request; verify server-owned subject, expected state and intended data scope.
**Negative / abuse path:** Replay the request with an expired/forged token, B account accessing A data, or a revoked device; assert 401/403/404 as appropriate and no cross-owner data.
**Measurable assertion:** Capture server response code, expiry/sequence and database row owner; zero cross-account reads or client-controlled quota increases.
**Failure recovery:** Allow a fresh system-browser sign-in, a safe retry or offline locally prepared content without granting new server quota.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-04`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-04-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-04-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-04-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-05 — Paddle checkout initiated by authenticated client

**Boundary / owner:** Billing engineer + finance approver.
**Controlled setup:** Create a disposable provider SANDBOX account, a configured plan ID and server-side authenticated identity; record merchant environment.
**Positive path:** Exercise **Paddle checkout initiated by authenticated client** through sandbox checkout or signed events and reconcile Paddle transaction ID to the subscription row, usage entitlement and user receipt.
**Negative / abuse path:** Send forged/replayed/out-of-order events, a wrong price ID or a canceled subscription; assert no unintended paid entitlement and no double processing.
**Measurable assertion:** Record exact event IDs, HTTP status and before/after ledger rows; zero duplicate entitlement grants, and 100% ledger-to-provider reconciliation for the test set.
**Failure recovery:** Display pending/declined or contact-support action without claiming payment succeeded; preserve locally owned interview materials.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-05`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-05-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-05-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-05-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-06 — Public config fields and forbidden secrets

**Boundary / owner:** SRE + release security lead.
**Controlled setup:** Use a disposable staging configuration and pinned source commit; record environment variables by *name*, not value.
**Positive path:** Exercise **Public config fields and forbidden secrets** against a build/deploy pinned to a SHA; preserve health-readiness evidence, artifact digest and rollback choice.
**Negative / abuse path:** Remove a required secret, inject a broken migration, tamper with package signature or force a health endpoint to 503; assert fail-closed promotion.
**Measurable assertion:** Promotion requires identical commit/artifact fingerprint between tested and shipped candidates; rollback restores previous health and data integrity.
**Failure recovery:** Block promotion, trigger documented rollback, notify on-call and leave previous verified Windows download available if it remains safe.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-06`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-06-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-06-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-06-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-07 — Support and legal URL canonicalization

**Boundary / owner:** Frontend lead + release QA.
**Controlled setup:** Serve static HTML/CSS/JS on a real local HTTP origin; record URL, browser version, devtools network trace and source checksum.
**Positive path:** Inspect **Support and legal URL canonicalization** from the actual DOM or network trace; follow each user action through a real verified destination or clearly labeled non-functional draft.
**Negative / abuse path:** Remove the stylesheet, disable JS, open offline, block endpoint or paste unknown typed questions; assert understandable fallback and no false success.
**Measurable assertion:** Record navigation/interaction result and payload; proposed performance gate LCP ≤2.5s p75, CLS ≤0.1 p75 and INP ≤200ms p75 when the topic is a Core Web Vital.
**Failure recovery:** Provide readable static explanation and disable transactional/download promises until the endpoint, signed artifact and legal links really exist.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-07`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-07-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-07-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-07-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

### 14-08 — Waitlist endpoint if and only if commissioned

**Boundary / owner:** AI safety evaluator + candidate experience QA.
**Controlled setup:** Use a synthetic resume with one confirmed fact, one unconfirmed fact, one invented 35% metric trap and a matching job description.
**Positive path:** Exercise **Waitlist endpoint if and only if commissioned** in Answer and Coach modes; mark whether each personal assertion traces to a confirmed fact and show an honest bridge for absent experience.
**Negative / abuse path:** Insert malicious instructions inside a resume/JD, omit all confirmed facts, simulate provider outage and repeat a question; assert no invented personal record.
**Measurable assertion:** Zero unsupported first-person claims in the controlled test corpus; output format exactly three bullets OR three Coach keywords plus one line, unless adaptive mode is explicitly entered.
**Failure recovery:** Offer a grounded generic structure or prepared local material, labeled accurately; never manufacture a success score or spoken-response evaluation.
**Proof to retain:** link the code or design source, exact build commit, test device/provider/browser, redacted logs/screenshots, and reviewer decision for `14-08`.
**Launch gate:** Keep dependent copy out of production until verified.

| Case | Procedure | Expected evidence |
|---|---|---|
| 14-08-P | Run the **positive path** above | Observable result, linked source SHA, owner sign-off |
| 14-08-N | Run the **negative path** above | Explicit failure and correct recovery, no invented data |
| 14-08-R | Repeat after cancel, reconnect or state reset | Same authoritative state and no duplicate side effect |

## 4. Cross-functional handoffs

| Action | Accountable | Reviewer | Required proof |
|---|---|---|---|
| Approve scope of website and desktop integration contracts | Principal Architect | Product owner | Signed change request and requirements ID |
| Review privacy and legal boundary | Privacy Lead | Counsel | Processing map and current vendor terms |
| Implement or verify the described behavior | Owning engineer | QA Lead | Version-pinned tests with screenshots/logs |
| Approve commercial publication | Saeed (owner) | Release Lead | Completed launch gate; rollback available |

## 5. Failure taxonomy

| Failure class | Detection method | User-safe response | Operational response |
|---|---|---|---|
| 01: Installer URL and SHA-256 metadata contract unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 02: Product release channel and latest validated build mapping unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 03: Backend health and readiness endpoints unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 04: Supabase sign-in initiation in Windows client only unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 05: Paddle checkout initiated by authenticated client unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |
| 06: Public config fields and forbidden secrets unavailable | Reproduce precondition refusal in test | State unavailable, never fake success | File defect with linked evidence; block dependent claim |

## 6. Measurement and acceptance

Primary performance or correctness target: **Define concrete touchpoints that can be tested end-to-end** must be demonstrable without inferred capabilities.
- **Coverage:** execute all numbered cases above in the relevant matrix; zero open P0 defects and no waived privacy/security P1 defects.
- **Repeatability:** run on a clean configuration and on a previously used profile; never substitute screenshots of another version.
- **Accessibility:** keyboard-only navigation, meaningful focus, and announced result are checked where there is a UI.
- **Runtime:** compare actual behaviour and published claims; if inconsistent, remove the claim before publication.
- **Release evidence:** include date, branch, commit, source URL, result, reviewer and explicit approval; an empty cell is not a pass.

## 7. Open questions with owners

- **UNKNOWN / Principal Architect:** Which current implementation commit establishes all controls in this specification? Resolve by linked code review and test results.
- **UNKNOWN / Legal Counsel:** Are platform-specific permissions and personal-data obligations satisfied in every marketed region? Resolve with written legal review.
- **UNKNOWN / Release Lead:** Is the dependency stack validated in a live, signed, publicly downloadable build? Resolve with reproducible release evidence.

## 8. Change control

- Any proposed implementation deviation requires an issue ID, consequence, compensating control and owner sign-off.
- Keep this file focused on its own contract; cross-reference linked documents for shared policy rather than copy-pasting large sections.
- This specification is ready for engineering review, not approval to publish unsupported features.


## 9. Exact current product endpoint references

The following paths are from current typed contracts and source documentation. Their presence in source does **not** prove a public account can use them today.

| Endpoint / call | Client | Data | Security control |
|---|---|---|---|
| `GET /api/v1/config` | Windows desktop | public auth, billing environment, product links | no provider secret; smoke scan |
| `GET /api/v1/me` | authorized desktop | plan and usage | JWT signature + owner isolation |
| `POST /api/v1/sessions` | authorized desktop | device, interview, idempotency key | server leases and limits |
| `POST /api/v1/sessions/{id}/heartbeat` | authorized desktop | increasing sequence | server metering, lease binding |
| `POST /api/v1/sessions/{id}/stop` | authorized desktop | session ID | close active relay |
| `.../{id}/realtime` | authorized desktop WebSocket | transient audio frames | lease and server-controlled upstream |
| `POST /api/v1/answers/stream` | authorized desktop | minimal messages, purpose | SSE with fact and rate limits |
| `POST /api/v1/billing/checkout` | authorized desktop | plan code only | server maps to Paddle price |
| `POST /api/v1/billing/portal` | authorized desktop | account identity | account-owned Paddle portal |
| `POST /api/v1/webhooks/paddle` | provider only | signed event | HMAC, replay and idempotency |
| `GET /health/ready` | operator | readiness result | no PII |

**Proposed compatibility gate:** create a contract test that serializes `ApiContracts.cs` requests and exercises each endpoint against a version-matched backend container and PostgreSQL. Reject an unrecognized plan code; return stable error codes with `correlationId`. Do not assume that the static website should call any authenticated endpoint.
