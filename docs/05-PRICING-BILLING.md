# 05 — Pricing Billing and Entitlements

> **Commercial v2 candidate.** This is the fully incorporated v1 specification, reconciled against connected GitHub source evidence. It is **not** signed off for a paid public launch. No protected repository files have been modified.
> **Owner:** Billing Lead. **Scope:** Windows commercial product and static marketing website; Android, iOS and dedicated macOS are research-only.
> **Evidence precedence:** current code and later `docs/release/RELEASE_READINESS.md` for runtime status; `docs/v2/*` for architecture; older prototype documents are historical, not proof of current release.



- **Status:** Proposed commercial v2 — owner approval pending
- **Source:** `docs/v2/ENTITLEMENTS.md`, `docs/v2/BILLING.md`,
  `docs/v2/COMMERCIALIZATION.md` (source repo). All numbers below come from
  those files. Where the source says a number is a sandbox price or an
  estimate, this document says so too.
- **Rule:** the website, the app, and the backend plan catalog must show the
  same numbers. If they disagree, the backend catalog is the source of truth
  for enforcement — and the website is wrong until it is fixed.

---

## 1. Plans (current, grounded)

| | **Trial** | **Pro** |
|---|---|---|
| Price | $0 | **USD 19.99 / month** |
| Live minutes | **30 lifetime** | **600 per billing period** |
| Candidate profiles | 1 | 3 |
| Preparation runs / month | 2 | 20 |
| Concurrent live sessions | 1 | 1 |
| Devices | 1 | 2 |
| Report retention | 14 days | 365 days |
| Coach Mode | Yes | Yes |

### What "live minutes" means

Live minutes are the minutes you spend in a **live listening session** —
the time the app is actively listening and transcribing in an interview.
They are metered by the server (heartbeat every 30 s; billed seconds per
heartbeat are capped at 2× the interval, so sleep/offline time is not
over-billed). A live session ends automatically when the allowance is
exhausted, at the per-account daily cap, or at the maximum session length.

Preparation runs, practise, and reading reports do **not** consume live
minutes — they have their own quota (preparation runs per month, above).

### Safety caps (operator-level, not a selling point — but honest to state)

- Per-account daily live minutes: **240**.
- Maximum single live session: **120 minutes**.
- Answer generation: max 600 output tokens per answer; per-minute and
  per-day answer rate limits apply.
- These caps exist to stop abuse and runaway cost. They are not shown as
  marketing features; they are documented here so support answers are
  consistent.

### ⚠️ Price status — read before launch

- **Pro at USD 19.99/month is the Paddle *sandbox* price** in the source
  catalog (`ENTITLEMENTS.md`: "Pro, Paddle sandbox price `USD 19.99 / month`").
  It has **not yet been validated against a real Paddle sandbox account**,
  let alone a live Paddle account (source `BILLING.md`: "NOT YET VALIDATED
  against a real Paddle sandbox account").
- **Do not publish the price as final until Saeed confirms it** and the
  sandbox checkout test passes (see §5).
- Unit economics in the source (estimates — verify against current OpenAI
  and Paddle price lists before launch): a fully used Pro month is ~600 min
  of realtime transcription (~USD 3.60 at ~USD 0.006/min) + short answer
  generation + Paddle's fee (~5% + USD 0.50). An older estimate suggested a positive margin at
  USD 19.99, but the caps above are the backstop. Changing any number is a
  configuration change (`PlanCatalog`), not a code change — but the website
  must be updated in the same change.

## 2. How billing works (Paddle as Merchant of Record)

Paddle is the Merchant of Record. That means:

- Paddle collects the payment, calculates and remits VAT/sales tax, issues
  invoices, and handles refunds and chargebacks.
- **Card data never touches the desktop app or the backend.** Checkout and
  the customer portal are Paddle-hosted pages opened in the system browser.
- The website never handles payment details and never embeds a checkout
  form with price ids.

### Flow (desktop app — the website is not involved)

1. In the app, the user chooses a plan. The desktop calls
   `POST /api/v1/billing/checkout {planCode}` (authenticated).
2. The backend maps the plan to its Paddle price id **from server
   configuration, never from the client**, calls Paddle
   `POST /transactions` with `custom_data.user_id`, and returns the hosted
   checkout URL.
3. The user pays in the browser. Paddle sends webhooks to
   `POST /api/v1/webhooks/paddle`.
4. The backend verifies (HMAC-SHA256 signature, 5-minute replay window),
   records (idempotent event store — duplicates are acknowledged, not
   re-applied), and applies the event; entitlements change server-side only.
5. The desktop refreshes `GET /api/v1/me`. "Manage subscription" opens the
   Paddle customer portal via `POST /api/v1/billing/portal`.

### Billing states (server-computed, shown in plain language in the app)

`trial` · `trial_exhausted` · `active` · `canceling` (paid until period
end) · `past_due` (paid features kept for the grace period) · `paused` ·
`expired`. The app shows plain-language text for each and never decides
access itself — the server is the single source of truth.

## 3. Account mode vs developer mode

| | Account (default in release builds) | Developer mode |
|---|---|---|
| Sign-in | Browser sign-in (Google / Microsoft or email link, via Supabase PKCE) | None |
| AI provider key | **Not needed** — held by the service | Your own OpenAI key (DPAPI-encrypted on the PC) |
| Usage | Plan minutes, metered by the service | Billed to your OpenAI account |
| Who it is for | Every customer | Internal testing / regression baseline |

**Website rule:** developer mode is not a selling point and is not on the
pricing page. It is documented here and in the app's Settings → Advanced so
support can answer accurately. Customers never need an API key.

## 4. Upgrade, downgrade, cancel, refunds

| Action | What happens |
|---|---|
| Trial → Pro | Pay via Paddle hosted checkout; Pro entitlements apply when the webhook is processed; live minutes reset to the Pro allowance for the billing period. |
| Pro → Trial (downgrade) | Via the Paddle customer portal; the change applies per Paddle's subscription rules — confirm the exact effective date in the portal copy before launch. Do not invent a downgrade date on the site. |
| Cancel | In the Paddle portal. **Cancel at period end:** access is kept until the end of the paid period, then falls back to the default (Trial) plan. The site must say "you keep access until the end of the period" — not "cancelled immediately". |
| Past due | Paid plan is kept for a **7-day grace period**, then falls back to the default plan. |
| Paused / cancelled subscription | Default (Trial) plan after the period end (when cancellation was scheduled). |
| Full refund / chargeback (approved) | Paddle cancels or pauses the subscription and sends the corresponding event; an approved full refund or chargeback of the current payment **revokes paid access** (billing state `revoked`); a newer payment or an approved chargeback reversal restores it. Partial refunds and credits do **not** change access. |
| Refund requests | Handled by Paddle as Merchant of Record. The website must not promise a refund policy the merchant does not offer — the refund policy is a legal document (see PRD §12 Q6) and must be written before launch. **Do not put "30-day money-back guarantee" on the site unless Paddle / counsel confirms it.** |

### Copy the site may use (once the legal pages exist)

- "Cancel anytime. You keep Pro until the end of your billing period."
- "Billed by Paddle. Your card details never touch our app."
- "Prices in USD. Taxes are calculated by Paddle at checkout."

### Copy the site must NOT use

- "Money-back guarantee" (unconfirmed).
- "Unlimited minutes" (false — both plans are metered).
- "Lifetime access" (false — Trial minutes are lifetime, access is not).
- "Free forever" (the Trial is 30 lifetime minutes, not an unlimited free plan).

## 5. Launch gates (billing — all must pass before any "Buy" language goes live)

From source `BILLING.md` (sandbox validation checklist — **not yet done**):

- [ ] Create Paddle sandbox products/prices; set price ids in config.
- [ ] Create notification destination → `https://<staging>/api/v1/webhooks/paddle`,
      events `subscription.*`, `transaction.completed`.
- [ ] Test-card checkout → `subscription.created` → `/me` shows the paid plan.
- [ ] Portal: cancel → `scheduled_change` → access until period end.
- [ ] Simulate `past_due` via Paddle's webhook simulator.
- [ ] Saeed confirms the Pro price (USD 19.99) and any regional pricing.
- [ ] Refund policy written and linked (legal).
- [ ] Live Paddle account + seller verification complete (live, not sandbox).

Until these pass, the website's pricing section is a **preview**: it may show
the plans and the sandbox price clearly labelled as the planned price, but it
must not present a working purchase path. The download section is the only
call to action.

## 6. FAQ copy (billing — reuse verbatim on the site)

- **What does it cost?** "The Trial is free — 30 live minutes for life, 1
  profile, 2 preparation runs a month. Pro is USD 19.99 a month: 600 live
  minutes per billing period, 3 profiles, 20 preparation runs, and reports
  kept for a year."
- **What is a live minute?** "A minute you're live in an interview with the
  app listening. Preparing, practising, and reading reports don't use live
  minutes."
- **Who bills me?** "Paddle, the Merchant of Record. They handle payment,
  tax, invoices, and refunds. Your card details never touch the app."
- **Can I cancel?** "Yes, anytime, from the customer portal. You keep Pro
  until the end of your billing period."

## 7. Decisions needed from Saeed

1. Confirm Pro = USD 19.99/month (or change it — and update the plan
   catalog, this doc, and the site in one change).
2. Regional pricing: same USD price everywhere, or localised prices?
3. Refund policy wording (with counsel / Paddle).
4. Is there a plan between Trial and Pro, or above Pro (e.g. a team plan)?
   At launch: no. Do not hint at one on the site.
5. Downgrade effective-date wording (confirm against Paddle's behaviour).


## Commercial v2 reconciliation and additional acceptance

### V2 pricing truth and operational sign-off
- `src/InterviewAssistant.Backend/appsettings.json` documents authoritative feature ceilings: Trial 30 lifetime; Pro 600/period; one active lease; daily 240 minutes; one session 120 minutes; 30-second heartbeat.
- Trial: one profile, two monthly prep jobs, one device, 14-day report retention. Pro: three profiles, twenty monthly prep jobs, two devices, 365-day report retention.
- **USD 19.99 is a sandbox catalog reference** in repository `docs/v2/ENTITLEMENTS.md`; `docs/release/RELEASE_READINESS.md` reports the deployed catalog displays it, but this does not approve live merchant price or checkout.
- Paddle merchant-of-record services are integrated and their sandbox behavior is covered with mocks; real provider purchase, webhook, portal and refund evidence are required before paid launch.
- `docs/v2/DEPLOYMENT.md` requires Paddle's default payment link to point to backend `/pay` and separate client token configuration; browser marketing pages must not handle card data.
- **Developer own-key availability:** newer commercial-readiness material states own-key mode is Debug/DeveloperBuild-only; customer-visible price comparison must be checked against the actual release binary.
- **Commercial acceptance:** vendor transaction ID (redacted), sandbox receipt, webhook applied once, entitlement refresh, cancellation, chargeback reversal, and accurate tax/currency display.
- **Economics:** prior per-minute estimates are assumptions; update from actual current vendor invoices plus usage distribution and taxes before approval.
- **Related specs:** `backend/19-ENTITLEMENT-STATE.md`, `billing/52-PRICE-APPROVAL.md`, `billing/53-REFUNDS-CHARGEBACKS.md`.

## Document completion contract

- **Purpose and scope:** As stated in this document; no undocumented platform or financial promises.
- **Acceptance:** Source claims reconciled, P0/P1 audit blockers closed with evidence, legal decisions signed, and user flows tested under the actual release commit.
- **Dependencies:** Source GitHub repository, active release-readiness evidence, owner product decisions, finance/legal sign-off, and the linked specialist v2 specifications.
- **Open questions:** See `../audit/07-OWNER-DECISION-LOG.md`; UNKNOWN remains UNKNOWN until evidenced.
