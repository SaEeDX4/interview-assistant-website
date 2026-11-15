# 08 — Roadmap

- **Status:** Draft v0.1 — local staging, 2026-11-14
- **Horizon:** Phase 1 (now) → Phase 4 (growth). Dates are **not** promised
  anywhere on the public site — this roadmap is internal, and the public
  site promises notification only, never a date.
- **Rule:** a phase is done when its acceptance criteria pass, not when a
  calendar date arrives.

---

## Phase 0 — Where the product already is (source repo, grounded)

The Windows app + backend are substantially built and tested (source
`STATUS_REPORT_V2.md`):

- Generic multi-user product: profiles, resume/JD ingestion, fact review,
  15-stage preparation → 50–150 question bank, DPAPI workspace, export/delete.
- Live: Answer + Coach modes, bounded memory, adaptive Concise/Rapid,
  10-language detection + RTL, honest post-interview reports.
- Backend: ASP.NET Core (.NET 10) + PostgreSQL, Supabase JWT auth,
  server-side entitlements, heartbeat-metered leases, safety caps, OpenAI
  key server-side only, realtime relay, Paddle billing, admin API.
- Desktop: Supabase PKCE sign-in, cloud client, Velopack installer +
  delta updates (never during a session).
- Tests: 201/201 core, 44/44 backend, 28/28 in-app self-test, real-EXE
  smoke (startup 1.3 s), installer N→N+1 update test passed.

**Still blocked on external accounts / validation** (source
`STATUS_REPORT_V2.md` + `COMMERCIALIZATION.md`): live Supabase sign-in,
Paddle sandbox purchase/webhooks/portal, live OpenAI Realtime through the
server, Azure Artifact Signing / SmartScreen, staging/production deploy
smoke, visual review on real Windows displays, native-speaker review of
UI strings. Nothing in Phase 1–2 removes that block — Phase 2 runs in
parallel with it, and the launch gates in §2 below enforce it.

## Phase 1 — Documentation (this project, now)

**Goal:** the commercial story is written down, grounded, and reviewable —
before a single public page goes live.

| # | Deliverable | Done when |
|---|---|---|
| 1.1 | `docs/01-PRD.md` — requirements, personas, scope, metrics | Reviewed by Saeed |
| 1.2 | `docs/02-ARCHITECTURE.md` — website architecture + integration points | Hosting decision recorded (or explicitly deferred) |
| 1.3 | `docs/03-DESIGN-SYSTEM.md` — dark premium system | Implemented in `website/styles.css` |
| 1.4 | `docs/04-UX-SPEC.md` — IA, flows, demo behaviour | Implemented in `website/index.html` + `app.js` |
| 1.5 | `docs/05-PRICING-BILLING.md` — plans, Paddle, refunds | Price confirmed (or explicitly marked sandbox) |
| 1.6 | `docs/06-CONTENT-SEO.md` — messaging, claim-to-source, SEO | Every site sentence traces to a source |
| 1.7 | `docs/07-SECURITY-PRIVACY-ETHICS.md` — privacy + ethics | Legal pages scoped with counsel |
| 1.8 | `docs/08-ROADMAP.md` — this file | Saeed agrees the phases |
| 1.9 | `website/` draft — static site, simulated demo, no external assets | Verified locally (see §5) |
| 1.10 | New repo created (private, empty) | `SaEeDX4/interview-assistant-website` — created 2026-11-14 (per memory). Push only after Saeed confirms the push. |

**Exit criteria:** Saeed has read the PRD + pricing + ethics docs, answered
the open questions in PRD §12 (at minimum: brand, domain/hosting, price,
version, support contact), and confirmed the repo name / push.

## Phase 2 — Commercial website launch

**Goal:** the one-page site is live, fast, honest, and measurable — with
no purchase path live until billing is validated.

### 2.1 Pre-launch (website)

- [ ] Domain + hosting decided; DNS + HTTPS set (see `02-ARCHITECTURE.md` §5).
- [ ] `robots.txt` + `sitemap.xml` with the real domain.
- [ ] Real product screenshots (from the visual review on real Windows
      displays — not mockups).
- [ ] Real logo / favicon / Open Graph image.
- [ ] Support email + URL filled in (same as backend config).
- [ ] Notify-me form wired to a real endpoint, or removed.
- [ ] Analytics decision made (privacy-friendly or none).
- [ ] Lighthouse ≥ 90 performance, ≥ 95 accessibility; 0 external requests;
      keyboard-only demo completion; 360 px check.

### 2.2 Pre-launch (product — parallel, owned by the app/backend work)

- [ ] Paddle sandbox checklist complete (see `05-PRICING-BILLING.md` §5).
- [ ] Live Supabase sign-in tested end-to-end from the desktop app.
- [ ] Live OpenAI Realtime session through the server relay tested.
- [ ] Staging deploy + smoke against the real host.
- [ ] Signed installer (Azure Artifact Signing) + SmartScreen behaviour checked.
- [ ] Legal pages drafted (Terms, Privacy Policy, refund policy) and linked
      from the footer and the app.
- [ ] Price confirmed (USD 19.99 or a new price — catalog + docs + site
      updated together).
- [ ] Full 10-language list confirmed; version number reconciled.

### 2.3 Launch

- [ ] Push this project to `SaEeDX4/interview-assistant-website` (only
      after Saeed's explicit go-ahead to push).
- [ ] Deploy the site; verify the live URL (all anchors, demo, pricing,
      download placeholders vs real links — per the gate below).
- [ ] **Download links:** replace placeholders with real signed installer
      URLs + SHA-256 only after §2.2 signing is validated. Until then the
      download section stays in "coming with the first signed release" mode.
- [ ] **Purchase path:** no "Buy" button goes live until the Paddle
      sandbox checklist passes. The pricing section is a preview until then.
- [ ] Announce only where honest: the product is in commercial launch,
      the Trial is real, and the limits are as stated.

### 2.4 First 90 days after launch

- Measure per PRD §10 (demo completion, CTR, trial starts, bounce,
  Android sign-ups, scroll depth). Set baselines in week 1; set targets
  in week 4 — do not invent targets before data.
- Fix copy from real questions (support inbox → FAQ).
- Collect (with consent) the first real user feedback on the demo vs the
  real app — if the demo misleads, change the demo, not the app.
- Decide the blog: start it only when 3 real posts are ready (see
  `06-CONTENT-SEO.md` §5).

## Phase 3 — Android app planning (future work only — NOT built now)

**Goal:** a plan for Android that Saeed can approve, with no code written
and no date promised on the website.

> **Scope guard:** nothing in this phase is built in this project. The
> website's Android section is "coming soon + notify me" only. If anyone
> asks for an APK or a date, the answer is: "We're planning it — leave
> your email and we'll tell you when it's ready."

### 3.1 Questions to answer first (before any Android design)

1. **What is the Android app for?** Companion (prepare + practise + review
   reports) or full live assist? A phone cannot do WASAPI loopback capture
   of a headset the way Windows does — live assist on Android needs a
   different audio story (or no live mode at all). This is the single
   biggest product decision in Phase 3.
2. **What carries over?** The backend already exists (auth, entitlements,
   metering, Paddle, AI proxy) — Android should reuse it via the same
   `/api/v1` contracts, not rebuild it. The preparation pipeline and
   question bank are in the cross-platform Core — what can be reused vs
   rewritten (Kotlin? .NET MAUI? Flutter?) is a technical decision.
3. **What is the monetisation?** Same Trial/Pro plans via Paddle (web) or
   Google Play Billing? The two cannot be mixed silently — decide before
   designing the paywall.
4. **Privacy on mobile:** microphone, background audio, and notification
   permissions need a mobile-specific privacy review (the Windows
   "no mic recording" story does not automatically transfer).
5. **What is the MVP?** Recommended: Profile + Prepare + practise
   (question bank, Coach Mode, reports) first; live assist only if the
   audio story has a credible answer.

### 3.2 Phase 3 deliverables (when Saeed approves starting it)

- [ ] Android PRD (personas, jobs-to-be-done, scope, non-goals — mirroring
      `01-PRD.md`).
- [ ] Android architecture note (platform choice, API reuse, audio story,
      billing choice).
- [ ] Android UX spec (mobile-first flows, not a shrunk desktop UI).
- [ ] Android design-system extension (Material / platform conventions,
      dark premium carried over).
- [ ] Waitlist analysis: how many notify-me sign-ups, from where, and what
      they asked for.
- [ ] Go / no-go decision with Saeed before any code.

### 3.3 Explicit non-goals for Phase 3 planning

- No APK, no Play Store listing, no release date on the website.
- No promise that Android will have live assist.
- No new backend built for Android — reuse `/api/v1`.

## Phase 4 — Growth (after website launch + Android decision)

*Ideas only — none committed.*

- **i18n website:** Persian / Arabic (RTL) version of the site, once the
  product's 10-language list is confirmed and native-speaker review is
  done. (The demo's Persian sample is the seed for this.)
- **Light theme** for the website (the app already has one).
- **Blog:** only when 3 real posts are ready (see above).
- **Video:** a 30–60 s real screen recording (staged preparation + live
  session, with the authorized-use caption).
- **Referral / teams:** only if a team plan is defined — do not hint at
  one before then.
- **Pricing evolution:** only via the plan catalog + docs + site in one
  change; never a silent price change.

## 5. Verification log (this staging build)

| Check | Result |
|---|---|
| Source repo read (read-only) | README + 16 `docs/v2` files read via GitHub read tools; no writes to the source repo |
| New repo | `SaEeDX4/interview-assistant-website` — created private and empty on 2026-11-14 (per updated memory). **Nothing pushed from this staging build.** |
| Docs created | `docs/01–08` + project `README.md` (see final report for the file list) |
| Website created | `website/index.html`, `styles.css`, `app.js` — self-contained, no external assets |
| Local verification | Served locally and checked: see the final report for the verification steps and results |

## 6. Decisions log (open — needs Saeed)

| # | Decision | Status |
|---|---|---|
| D1 | Brand name ("Interview Assistant" vs a distinct brand) | Open |
| D2 | Domain + hosting provider | Open |
| D3 | Pro price confirmation (USD 19.99 sandbox) | Open |
| D4 | Full 10-language list | Open |
| D5 | Public version number for the download section | Open |
| D6 | Legal pages (Terms / Privacy / refunds) — who + when | Open |
| D7 | Support email / URL | Open |
| D8 | Analytics provider (or none) | Open |
| D9 | Android scope (companion vs full live assist) | Open — Phase 3 |
| D10 | Repo name / push | Repo created: `SaEeDX4/interview-assistant-website` (private, empty). Push awaiting Saeed's explicit go-ahead. |
