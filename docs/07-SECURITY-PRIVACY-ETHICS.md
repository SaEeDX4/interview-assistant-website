# 07 — Security Privacy and Ethics

> **Commercial v2 candidate.** This is the fully incorporated v1 specification, reconciled against connected GitHub source evidence. It is **not** signed off for a paid public launch. No protected repository files have been modified.
> **Owner:** Security Lead. **Scope:** Windows commercial product and static marketing website; Android, iOS and dedicated macOS are research-only.
> **Evidence precedence:** current code and later `docs/release/RELEASE_READINESS.md` for runtime status; `docs/v2/*` for architecture; older prototype documents are historical, not proof of current release.



- **Status:** Proposed commercial v2 — owner approval pending
- **Source:** `docs/v2/SECURITY_V2.md`, `docs/v2/PRIVACY_IMPLEMENTATION.md`,
  `docs/v2/ARCHITECTURE_V2.md`, `docs/v2/OPERATIONS.md`, `README.md`
  (source repo). This document describes **implemented behaviour only**.
  A public privacy policy must not promise more than this — and this
  document is not a legal privacy policy. Counsel must draft the legal
  pages before launch (see §6).
- **Rule for the website:** every privacy claim on the site must match this
  document. If it is not here, do not claim it.

---

## 1. The ethics position (in one paragraph)

Interview Assistant is an interview **preparation and practice coach** with
a live assist mode for interviews **where assistance is permitted**. It
helps a candidate prepare from their own experience and speak in their own
words. It is a normal, visible window. It does not hide itself, evade
screen capture or detection, record the candidate's microphone, or store
audio. Users must use it only where they are allowed to — and the product
makes them acknowledge that in onboarding before they can use it live.

This position is a product constraint, not marketing copy. It limits what
the website may say, what features may be built, and what keywords may be
targeted (see `06-CONTENT-SEO.md` §4).

## 2. What the app actually does with data

### 2.1 Audio — the most important fact

| Question | Answer (grounded) |
|---|---|
| Does it record your microphone? | **No.** The candidate microphone is OFF — that is the only mode implemented. |
| What audio does it hear? | The **interviewer's** audio, from the candidate's headset, via WASAPI loopback capture. No browser extension, no tab sharing. |
| Is audio stored? | **No. Never written to disk.** Audio lives in a bounded in-memory queue only, streamed to OpenAI Realtime for transcription, then gone. |
| Is audio logged? | No. No document contents, prompts, transcripts, or tokens in logs. |
| What happens when a live session ends? | The session lease ends and the relay closes immediately — audio is never carried outside billed time. |

**Website wording (use this, do not soften or strengthen it):**
"It listens to the interviewer's audio from your headset so it can
transcribe questions live. It does not record your microphone, and it
never stores audio."

### 2.2 Resumes, job descriptions, profiles, facts

| Data | Where it lives | Protection |
|---|---|---|
| Resumes, JDs, profiles, facts, stories, prepared packs | Desktop `%LOCALAPPDATA%` workspace (by default) | DPAPI (current Windows user) |
| Same, when cloud sync is used | `user_documents` (jsonb, PostgreSQL) | Per-user isolation on every query; TLS in transit; DB encryption at rest is a hosting setting |
| Interview transcripts & reports | Desktop by default; reports may be synced | Reports expire after the plan's retention (Trial 14 days, Pro 365 days) and are purged hourly |
| Account identity | Supabase Auth (email / OAuth identity); the app's `users` table holds id, email, status | Supabase JWT validation (issuer, audience, signature, lifetime) |
| Payment data | **Paddle only.** The app/backend store Paddle customer/subscription ids and status | No card data in the app or backend, ever |
| Usage | Append-only `usage_ledger` (live seconds, answer counts) | No content — seconds and counts only |

### 2.3 What the app does NOT do

- Does not hide itself or evade screen capture / detection.
- Does not record the candidate's microphone.
- Does not store audio.
- Does not fetch company research automatically from URLs (pasted
  text/documents only, labelled as user-provided sources).
- Does not produce hiring scores or success probabilities.
- Does not translate report questions by machine (not implemented).
- Does not let a modified client grant itself paid features — every
  entitlement decision is server-side; the desktop only displays
  `GET /api/v1/me`.

## 3. Third-party processors (name them — do not hide them)

| Processor | For | What they receive |
|---|---|---|
| OpenAI | Transcription + answer generation | Audio (transcription only, not stored) and question/fact context for answers. API data is not used for training by default per OpenAI's API terms — **verify current terms before publishing**. |
| Paddle | Payments, tax, invoices, refunds | Payment details (on Paddle-hosted pages only), subscription state. Merchant of Record. |
| Supabase | Authentication | Email / OAuth identity for sign-in. |
| Hosting / DB provider | Backend + PostgreSQL | Encrypted-at-rest data per the hosting setting; see §2.2. |

The website must name these processors in the privacy approach. A privacy
page that says "we use third parties" without naming them is not honest
enough for this product.

## 4. User rights (implemented)

| Right | How | Status |
|---|---|---|
| Export | `GET /api/v1/me/export` (JSON: account, subscription, devices, sessions, usage, all documents); desktop per-profile ZIP export | Implemented + tested |
| Delete everything | `DELETE /api/v1/me` — deletes documents, devices, sessions, usage, prep jobs, subscription row, clears email; account id tombstoned. Requires cancelling an active subscription first. Desktop cascade delete per profile. | Implemented + tested |
| Delete single items | `DELETE /profiles \| targets \| reports/{id}` (cascades) | Implemented + tested |

**Not yet implemented — do not claim:**

- Deletion of the Supabase Auth identity itself (needs the Supabase
  service-role admin call — external credential, not yet implemented).
- Automatic backup-expiry statements (depends on the hosting provider).

## 5. Security controls (summary — for the privacy/security page)

These are implemented in the source repo (`SECURITY_V2.md`). The website
should summarise them in plain language, not reproduce the threat model.

- **Server is the source of truth:** entitlements, metering, and access
  are decided server-side; a modified client cannot grant itself features.
- **Sign-in:** Supabase PKCE (S256) via the system browser; loopback
  receiver bound to `127.0.0.1` only, random port, one-shot, state-checked.
  Tokens stored with DPAPI; short access-token lifetime; device revocation
  invalidates leases.
- **Live sessions:** server-issued session leases, heartbeat-metered
  (every 30 s), relay re-checks the lease every 2 s and closes when time
  runs out. The desktop never receives a provider credential — the server
  mints a short-lived ephemeral secret per connection.
- **Billing webhooks:** Paddle signature (HMAC-SHA256 over `ts:rawBody`),
  constant-time compare, 5-minute replay window, idempotent event store,
  ordered application.
- **Uploads:** 10 MB cap, extension allow-list (pdf/docx/txt/md),
  magic-byte check, filename sanitisation, no path use of client filenames.
- **Prompt injection:** documents are wrapped as quoted untrusted data;
  instruction-like lines are flagged/stripped; the output fact validator
  is still enforced. Only confirmed facts reach answers.
- **Secrets:** no provider key on the desktop; log redaction (`sk-`,
  `ek_`, bearer tokens, emails); secret-scan in CI.
- **Updates:** Velopack feed over HTTPS; signed installers when Azure
  Artifact Signing is configured; no updates during a session; a minimum
  client version is enforced remotely (older clients get 426 + guidance).
- **Admin:** allow-list by user id, every call audited, admin views show
  counts — never document content.

**Not yet validated — do not claim as done:** owner-approved live Supabase sign-in end-to-end evidence,
Paddle sandbox purchase/webhooks/portal, server-issued OpenAI Realtime
session used by the desktop, Azure Artifact Signing / SmartScreen, and
public paid-launch end-to-end validation (a deployed Railway backend is reported in newer release-readiness evidence). These are external-account
validations (see `08-ROADMAP.md`).

## 6. Legal pages (required before public launch)

The draft website has **no legal pages** — and that is deliberate. The
following must be drafted (counsel) and linked from the footer and from
the app before Paddle live approval and before any paid promotion:

1. **Privacy Policy** — based on this document and
   `PRIVACY_IMPLEMENTATION.md`. Must not promise more than the code does.
2. **Terms of Use** — including the authorized-use requirement.
3. **Billing Terms / Refund Policy** — consistent with Paddle as Merchant
   of Record (see `05-PRICING-BILLING.md` §4).
4. **Cookie / tracker notice** — only if analytics is added; the draft sets
   no cookies and needs no banner.

Until they exist, the footer links are placeholders marked "coming soon"
and the ethics section on the page carries the message. **Never link a
legal label to a dead page or to a generic template.**

## 7. GDPR / privacy notes (for counsel — not legal advice)

- **Lawful basis / roles:** the product processes resumes and interview
  data on the user's device by default; cloud sync, auth, and billing
  involve processors (above). Counsel should confirm controller/processor
  roles, the lawful basis for each processing activity, and the data
  processing terms for OpenAI / Paddle / Supabase before launch.
- **Data minimisation:** the design already minimises — local-first
  storage, content-free usage ledger, content-free logs, no audio storage.
  Keep it that way; every new data collection needs a reason in this doc.
- **Retention:** report retention is plan-based (14 / 365 days) with hourly
  purge; usage ledger and tombstones need a retention statement from
  counsel (the source does not state one — do not invent it).
- **International transfers:** OpenAI / Paddle / Supabase processing
  locations and transfer mechanisms must be stated in the Privacy Policy
  once confirmed — do not guess them here.
- **Children / minors:** the product is for job candidates; no
  child-specific claims are made. Counsel should confirm whether any
  age-related term is needed.
- **Breach / incident response:** the source `OPERATIONS.md` covers
  observability and admin disablement; a user-notification procedure is a
  legal/ops decision, not yet documented — flag for counsel + ops.

## 8. Authorized-use enforcement (product + website)

- **In the app:** onboarding includes an authorized-use acknowledgement
  before live use; the app is a visible window; hotkeys show/hide the
  window (it is never hidden from the OS).
- **On the website:** the authorized-use line appears in the hero trust
  line, the ethics strip, and the ethics section. It is not buried.
- **In support:** if a user asks how to hide the app or use it where it
  is not allowed, the answer is no — and the reason is the authorized-use
  rule, not a technical limitation.
- **In SEO / ads:** no stealth keywords, no "undetectable" claims, no
  targeting of "cheat the interview" queries (see `06-CONTENT-SEO.md`).

## 9. Incident / abuse handling (summary)

- Abuse response in the product: admin can disable an account (ends active
  leases); per-account and global caps limit cost abuse; rate limits apply
  to answers.
- If a vulnerability is reported: the website must have a way to contact
  the team (support email — TBD, see PRD §12 Q7). A security contact is a
  launch requirement, even if it is the same support address at first.
- Do not publish a bug-bounty promise until one exists.


## Commercial v2 reconciliation and additional acceptance

### V2 privacy, ethics and security correction gates
- **Audio:** Windows uses playback WASAPI loopback, not microphone; bounded in-memory queue, no raw audio stored. Provider transcribes audio, so 'no audio on disk' does not mean 'no data leaves the device'.
- **Account deletion:** later release docs describe provider identity deletion via Supabase service-role API with a retry queue; verify configured service role and actual deletion outcomes before making absolute public claims.
- **Retention:** Trial reports 14 days and Pro reports 365 days; backup expiry and usage ledger retention remain UNKNOWN pending host and counsel documentation.
- **Document limits:** older prose references a 10 MB file cap; `src/InterviewAssistant.Backend/appsettings.json` configures `MaxDocumentBytes=2097152` (2 MiB) for backend limits. Clarify local-import versus cloud-upload code paths before a public size promise.
- **Webhooks:** require signed and idempotent Paddle events plus applied authorization; don't confuse locally signed fixtures with actual merchant callbacks.
- **Do not promise GDPR compliance as a badge:** controller identity, transfer mechanisms, subprocessors, rights workflow and retention schedule need counsel and vendor evidence.
- **Authorized-use:** normal visible window, no screen-capture evasion, no candidate microphone capture, no evaluation/hiring score.
- **Store/platform roadmap:** platform-specific audio permission gates and store review are independently owned, not inferred from Windows audio design.
- **Related specs:** `privacy/46-DATA-INVENTORY.md`, `privacy/47-RETENTION-ERASURE.md`, `security/43-THREAT-MODEL.md`, `legal/50-PRIVACY-POLICY-REQUIREMENTS.md`.

## Document completion contract

- **Purpose and scope:** As stated in this document; no undocumented platform or financial promises.
- **Acceptance:** Source claims reconciled, P0/P1 audit blockers closed with evidence, legal decisions signed, and user flows tested under the actual release commit.
- **Dependencies:** Source GitHub repository, active release-readiness evidence, owner product decisions, finance/legal sign-off, and the linked specialist v2 specifications.
- **Open questions:** See `../audit/07-OWNER-DECISION-LOG.md`; UNKNOWN remains UNKNOWN until evidenced.
