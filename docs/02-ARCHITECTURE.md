# 02 — Static Website and Backend Boundaries

> **Commercial v2 candidate.** This is the fully incorporated v1 specification, reconciled against connected GitHub source evidence. It is **not** signed off for a paid public launch. No protected repository files have been modified.
> **Owner:** Principal Architect. **Scope:** Windows commercial product and static marketing website; Android, iOS and dedicated macOS are research-only.
> **Evidence precedence:** current code and later `docs/release/RELEASE_READINESS.md` for runtime status; `docs/v2/*` for architecture; older prototype documents are historical, not proof of current release.



- **Status:** Proposed commercial v2 — owner approval pending
- **Scope:** the public website only. The Windows app and backend are
  described here only at their integration points.

---

## 1. Overview

The commercial website is a **static site with no backend of its own**.

| Layer | Choice | Rationale |
|---|---|---|
| Website | Static HTML + CSS + vanilla JS, no framework, no build step | Fast, cheap, reliable, works offline, trivial to host, zero supply-chain risk. The site's job is to explain and convert — it does not need a framework. |
| Hosting | Static host (GitHub Pages recommended; Cloudflare Pages / Netlify as alternatives) | Free/cheap, TLS included, deploys from the repo. Decision needed from Saeed (see §7). |
| Domain | Custom domain (TBD) via DNS CNAME to the static host | Brand + SEO. Must be decided before launch; the draft uses relative links so the domain can change without code changes. |
| Analytics | None bundled in the draft; privacy-friendly analytics (e.g. Plausible / Cloudflare Web Analytics) as an optional, single-script addition | The product's privacy story is a selling point — the website must not undermine it with invasive tracking. Decision needed. |
| Forms | None functional in the draft (notify-me is a local demo) | The real notify-me endpoint is a launch decision: a tiny serverless form endpoint, or a waitlist service. No user data is collected by the draft. |
| Docs | Markdown in this repo (`docs/`) | Single source of truth; rendered on GitHub by default. |

**Deliberately not used:** a CMS, a JS framework, a database, server-side
rendering, external fonts, external images, CDNs, or any third-party script.
Each of those would add latency, privacy surface, and maintenance for no
benefit at this stage. If the site later grows a blog with many posts, revisit
— do not pre-build it.

## 2. Repository layout (proposed new repo)

```
interview-assistant-website/        # proposed name — awaiting Saeed's confirmation
├── README.md                       # this project's README (structure, mapping, rules)
├── docs/
│   ├── 01-PRD.md
│   ├── 02-ARCHITECTURE.md          # this file
│   ├── 03-DESIGN-SYSTEM.md
│   ├── 04-UX-SPEC.md
│   ├── 05-PRICING-BILLING.md
│   ├── 06-CONTENT-SEO.md
│   ├── 07-SECURITY-PRIVACY-ETHICS.md
│   └── 08-ROADMAP.md
├── website/
│   ├── index.html                  # the whole site (single page)
│   ├── styles.css
│   ├── app.js
│   ├── robots.txt                  # added at hosting time (domain-dependent)
│   └── sitemap.xml                 # added at hosting time (domain-dependent)
└── .github/workflows/              # added at hosting time, if GitHub Pages
    └── deploy.yml                  # static deploy; no secrets, no build
```

The website folder is deployable as-is: copy `website/` to any static host
and it works. No build, no environment variables, no secrets.

## 3. Integration points with the product

The website does **not** call the product backend at runtime in the attached draft. Production checkout and sign-in remain desktop/backend responsibilities, not a public website feature. Its
integration points are links and shared facts — by design. This keeps the
marketing surface separate from the billing/auth surface, which is a security
benefit.

| Integration | How it works | Status |
|---|---|---|
| Download (Windows) | Buttons link to the signed installer / portable ZIP. In the draft these are placeholders (`#download` + a launch note). At launch they must point at the real release artefacts — the signed `InterviewAssistant.Desktop-stable-Setup.exe` (Velopack, per-user, no admin) and the portable ZIP, plus their `.sha256` files. Source: `README.md` (Install), `INSTALLER_AND_UPDATES.md`. | Placeholder — replace at launch |
| Sign-in / account | Sign-in happens **in the desktop app** (system browser → Supabase PKCE → loopback `http://127.0.0.1:<port>/callback`). The website never handles credentials and never links to a web sign-in page. | By design — do not add web sign-in |
| Billing / checkout | Checkout is Paddle hosted checkout, opened from the desktop app (`POST /api/v1/billing/checkout` → hosted URL). The website's pricing section links to "Download to start" — it does **not** embed Paddle checkout. If a web checkout is ever wanted, it must go through the backend (`/api/v1/billing/checkout`), never a client-side price id. | By design — do not embed Paddle.js with price ids |
| Backend API | The backend is at `https://real-time-windows-interview-assistant-production.up.railway.app` (Railway, per source `DEPLOYMENT.md`). The website does not call it. Health endpoints (`/health`, `/health/ready`) are for ops, not for the site. | No runtime dependency |
| Support | Footer support link is a placeholder (`mailto:` / URL TBD). The backend config expects `Product__SupportEmail` / `Product__SupportUrl` — the same values must be used in the app and on the site. | Decision needed |
| Legal | Terms / Privacy / Billing Terms URLs are backend config values (`Product__PrivacyPolicyUrl`, `Product__TermsUrl`, `Product__BillingTermsUrl`). The website footer must link to the same documents the app links to. Until counsel drafts them, the footer links are placeholders, never faked. | Decision needed |
| Version | The download section shows a version only when a release is published and signed. Do not hard-code a version from the test docs (see PRD §12 Q5). | Placeholder |
| Android notify-me | Draft: local-only demo (no data leaves the browser). Launch: a real endpoint (serverless form or waitlist service) — the endpoint URL is a hosting-time addition, and the privacy note must name where the email goes. | TODO at launch |

### Data flow (website visitor)

```
Visitor
  → static host (HTML/CSS/JS, no server logic)
  → reads the page, tries the SIMULATED demo (local JS only, no network)
  → clicks Download → (at launch) signed installer from the release feed
  → installs the Windows app → app signs in via Supabase (browser)
  → app talks to the Railway backend (auth, entitlements, Paddle, OpenAI relay)
  → website is out of the loop from here on
```

There is no user data flowing from the website to the backend in the draft.
Keep it that way until a concrete, privacy-reviewed reason changes it.

## 4. Tech choices (website) — and why

| Decision | Choice | Why |
|---|---|---|
| Language | Plain HTML5, CSS3, ES2020 JS | No toolchain to break; any contributor can edit; works in 10 years. |
| CSS | One `styles.css`, custom properties, mobile-first | The design system (`03-DESIGN-SYSTEM.md`) is the spec; the CSS is its implementation. |
| JS | One `app.js`, no dependencies | Only three behaviours: the demo, the Coach toggle, mobile nav / FAQ accordion, and the notify form demo. All are < 200 lines. |
| Fonts | System stack only (`Inter, system-ui, …` with fallbacks; no webfont download) | Fast, offline-capable, no third-party request, no font-licence issue. If a brand font is chosen later, self-host it (WOFF2, `font-display: swap`). |
| Images | None in the draft (CSS + inline SVG only) | No broken-image risk, no asset pipeline, instant load. Product screenshots are a launch asset — see §6. |
| Icons | Inline SVG (a handful, hand-drawn) | No icon-font or icon-CDN dependency. |
| Structured data | JSON-LD `SoftwareApplication` in `index.html` | SEO; values must match the pricing doc (operating system: Windows 10/11; application category; offers). |
| Accessibility | Semantic landmarks, `aria-live` on demo answers, focus-visible styles, reduced-motion support | See `03-DESIGN-SYSTEM.md` §7 and `04-UX-SPEC.md`. |
| Performance budget | Total page < 150 KB; 0 external requests; Lighthouse performance ≥ 90, accessibility ≥ 95 | Enforced by the architecture itself; verify at launch. |

## 5. Hosting / deployment

### Recommended: GitHub Pages (simplest)

1. Create the repo (only after Saeed confirms the name).
2. Push `website/` contents (or the whole repo with Pages pointed at
   `website/` — simpler: make the repo root the site, with `docs/` alongside;
   GitHub Pages can serve from `/` or `/docs` — decide at setup; the draft
   assumes the site is served from the repo root's `website/` folder via a
   Pages workflow, or by copying `website/` to the publishing branch).
3. Add a custom domain in Pages settings + DNS CNAME.
4. Enforce HTTPS; add `robots.txt` / `sitemap.xml` with the real domain.

### Alternatives (if Saeed prefers)

- **Cloudflare Pages:** same static deploy, plus free analytics and better
  global caching. Good if analytics is wanted without a third-party script.
- **Netlify / Vercel:** same, with form handling built in (useful for the
  notify-me form — a real endpoint without a server).
- **Railway (same host as the backend):** possible, but couples the marketing
  site to the product backend's deploy — not recommended for the launch.

**Do not** host the website on the same origin as the API
(`…railway.app`). Keep the marketing origin and the API origin separate.

### Deployment pipeline

- Static only: no build, no secrets, no environment variables.
- Deploy on push to the default branch (Pages / Pages-equivalent).
- Preview deploys for pull requests if the host supports them (useful for
  copy review).
- Rollback = revert the commit / redeploy the previous commit. Nothing to
  migrate, no database.

### Pre-launch checklist (website)

- [ ] Domain decided and DNS set; HTTPS enforced.
- [ ] `robots.txt` and `sitemap.xml` written with the real domain.
- [ ] Download links replaced with real signed installer URLs + SHA-256.
- [ ] Legal links replaced with real Terms / Privacy / Billing Terms URLs.
- [ ] Support email / URL filled in (same as backend config).
- [ ] Notify-me form wired to a real endpoint, or removed (do not ship a
      form that silently discards emails).
- [ ] Analytics decision made; if added, one privacy-friendly script only.
- [ ] Lighthouse + axe checks pass; 0 external requests confirmed in the
      Network tab.
- [ ] Paddle sandbox checklist complete before any "Buy" language goes live
      (source `BILLING.md`).

## 6. Future assets (not in the draft — needed before launch)

| Asset | Notes |
|---|---|
| Product screenshots | Real Windows screenshots (Home dashboard, live overlay with 3 bullets, Coach Mode, Report) on real displays at 100–200% scaling. No mockups that fake the UI. Source `STATUS_REPORT_V2.md` notes visual review on real displays is still pending — screenshots must come from that review. |
| App icon / logo | A real brand mark. The draft uses a typographic wordmark only — do not ship a placeholder logo as if it were final. |
| Open Graph image | 1200×630, derived from the hero + real screenshot once available. |
| Demo video (optional) | 30–60 s screen recording of a real (staged) preparation + live session, with the authorized-use caption. Optional for launch; never a substitute for the interactive demo. |
| Favicon | SVG favicon (inline, data URI or a single file) — trivial, do at launch. |

## 7. Open decisions (website architecture)

1. **Hosting provider + domain** — GitHub Pages recommended; confirm.
2. **Analytics** — none vs privacy-friendly (Plausible / Cloudflare). No
   Google Analytics by default.
3. **Notify-me endpoint** — Netlify/Cloudflare Forms, a serverless endpoint,
   or a waitlist service. Must name the data destination in the privacy note.
4. **Blog** — static Markdown blog later, or no blog at launch (recommended:
   no blog at launch; add a `/blog` only when there are ≥ 3 real posts).
5. **i18n** — the product is 10-language; the website launches in English.
   A Persian/Arabic (RTL) version is a Phase 4 growth item, not a launch item.
   Do not promise it on the launch site.

## 8. What could go wrong

| Risk | Mitigation |
|---|---|
| Download link points at an unsigned / test build | Download links are placeholders until the release pipeline (signing, SmartScreen) is validated; gate in `08-ROADMAP.md`. |
| Website claims a feature the app lacks | Claim-to-source review (`06-CONTENT-SEO.md`); every sentence traces to source. |
| A third-party script leaks visitor data | No third-party scripts in the draft; any addition needs a privacy review. |
| SEO spam / keyword stuffing ("cheat", "undetectable") | Keyword list in `06-CONTENT-SEO.md` excludes stealth terms entirely. |
| Site and app show different prices / support contacts | Single source: `05-PRICING-BILLING.md` for prices; backend config values for support/legal links. |


## Commercial v2 reconciliation and additional acceptance

### V2 architecture decisions and measurable constraints
- **Hosting design proposal:** GitHub Pages + domain + TLS, deploy only static `website/`; website JavaScript must contain zero API, Supabase or Paddle credentials.
- **Actual repo service finding:** `docs/v2/DEPLOYMENT.md` documents a deployed Railway backend; `/health/ready` checks DB, JWKS and migrations. Treat reported status as source evidence, not an independent live availability check.
- **Public config:** `src/InterviewAssistant.Contracts/ApiContracts.cs` contains a `RuntimeConfig` public config contract and `ProductLinks`; never treat a publishable key as a server secret, but never expose service secrets.
- **Payment:** `docs/v2/DEPLOYMENT.md` describes `/pay` as a backend-side Paddle.js payment-link page. The marketing website does not embed checkout or decide plan entitlement.
- **Static budget proposal:** mobile p75 LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms; first ship no trackers, no external fonts, no preload of unapproved product imagery.
- **CSP decision:** GitHub Pages header control is restricted; document tested actual headers, or use a static host providing the required header policy. A `<meta>` CSP does not replace all header directives.
- **Rollback:** redeploy last reviewed source commit with verifiable preview, clear browser cache where necessary, and recheck downloads, legal links and sitemap.
- **Unknown:** final domain, static host configuration, cache headers, public installer feed and waitlist provider; owner must approve before linking.
- **Related specs:** `architecture/13-TRUST-BOUNDARIES.md`, `frontend-website/26-WEB-VITALS-BUDGET.md`, `devops-deployment/58-GITHUB-PAGES-OPERATIONS.md`.

## Document completion contract

- **Purpose and scope:** As stated in this document; no undocumented platform or financial promises.
- **Acceptance:** Source claims reconciled, P0/P1 audit blockers closed with evidence, legal decisions signed, and user flows tested under the actual release commit.
- **Dependencies:** Source GitHub repository, active release-readiness evidence, owner product decisions, finance/legal sign-off, and the linked specialist v2 specifications.
- **Open questions:** See `../audit/07-OWNER-DECISION-LOG.md`; UNKNOWN remains UNKNOWN until evidenced.
