# Interview Assistant — Commercial Website (staging)

> **Status: LOCAL DRAFT ONLY — not published, not pushed to GitHub.**
> Proposed repository name (awaiting Saeed's confirmation): `interview-assistant-website`.
> Source product repository (read-only, never edited from this project):
> [`SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT`](https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT)

## What this project is

This is the commercial, public-facing home for **Interview Assistant** — a Windows
interview preparation and practice coach with a live assist mode for interviews
where assistance is permitted.

It contains two things, and only two things:

1. **`docs/` — heavy project documentation.** The product requirements, architecture,
   design system, UX spec, pricing/billing, content/SEO, security/privacy/ethics,
   and roadmap for the commercial website. Written in English for a global audience.
2. **`website/` — a premium static website draft.** A self-contained static site
   (`index.html` + `styles.css` + `app.js`, no build step, no external assets) that
   can be previewed locally by opening `website/index.html` or serving the folder
   with any static server.

## What this project is NOT

- It is **not** the Windows app. The app lives in the source repo above.
- It is **not** the backend. The backend (ASP.NET Core + PostgreSQL, live on
  Railway) lives in the source repo above.
- It is **not** the Android app. Android is Phase 3 future work (see
  `docs/08-ROADMAP.md`). Nothing Android is built here — only a coming-soon
  section on the website.
- It does **not** change the source repo in any way. Standing rule: without
  Saeed's explicit permission, no file in any GitHub repo is edited, created,
  or deleted. All work here is local until Saeed confirms the new repo name.

## How it maps to the source app

| Website section | Source-app truth it must match |
|---|---|
| Hero + live demo | 3 short, speakable bullets, appearing one at a time; Coach Mode = 3 keywords + a one-line structure. Simulated on the website — no real audio, no live transcription. |
| How it works | Profile → Prepare → Live → Report. Resume import (PDF/DOCX/TXT), fact confirmation, 50–150 question bank per interview, live listening, honest post-interview report. |
| Features | WASAPI loopback capture of the interviewer's headset audio; streaming transcription; end-of-question detection; Verified / Hypothetical / Bridge classification; 10 languages incl. Arabic and Persian RTL; adaptive Concise/Rapid answers; story anti-repetition. |
| Pricing | Trial: 30 lifetime live minutes. Pro: USD 19.99/month, 600 live minutes per billing period (Paddle sandbox price — confirm before launch). See `docs/05-PRICING-BILLING.md`. |
| Download | Windows 10/11 x64. Per-user installer, delta updates, never during an interview. Download URLs are placeholders until launch. |
| Ethics / privacy | Visible window only. No hidden mode, no mic recording, no audio storage. Use only where allowed. See `docs/07-SECURITY-PRIVACY-ETHICS.md`. |
| Android | Coming soon only. No dates, no APK, no download link promised. |

### Source of truth for every claim

Every product claim in `docs/` and `website/` is grounded in the source repo at
the time of writing — `README.md` and `docs/v2/` (`ARCHITECTURE_V2`,
`STATUS_REPORT_V2`, `BILLING`, `ENTITLEMENTS`, `COMMERCIALIZATION`, `UX_SPEC_V2`,
`SECURITY_V2`, `PRIVACY_IMPLEMENTATION`, `DEPLOYMENT`, `OPERATIONS`, `COACH_MODE`,
`PREPARATION_PIPELINE`, `REPORTS`, `LIVE_MEMORY`).

Where the source is silent or not yet validated (for example the live Paddle
sandbox, the full list of the 10 languages, the exact public version number,
or the final domain), the docs say so explicitly in an **Open questions /
decisions needed** section instead of inventing an answer. Do not fill those
gaps with guesses on the live site.

## Documentation map

| File | Contents |
|---|---|
| `docs/01-PRD.md` | Product requirements, personas, jobs-to-be-done, scope, non-goals, success metrics |
| `docs/02-ARCHITECTURE.md` | Website architecture, tech choices, integration points with app/backend, data flow, hosting/deployment |
| `docs/03-DESIGN-SYSTEM.md` | Brand, colours, typography, components, motion, accessibility, dark premium theme |
| `docs/04-UX-SPEC.md` | Information architecture, page flows, wireframe descriptions, interactions, responsive behaviour |
| `docs/05-PRICING-BILLING.md` | Plans, Paddle, plan minutes, account vs developer mode, upgrade/downgrade, refunds |
| `docs/06-CONTENT-SEO.md` | Messaging, homepage copy, SEO keywords, meta, structured data, blog/content plan |
| `docs/07-SECURITY-PRIVACY-ETHICS.md` | Privacy, no audio storage, visible window, use-only-where-allowed, GDPR/privacy notes |
| `docs/08-ROADMAP.md` | Phased roadmap: docs → website launch → Android planning → growth |

## Preview the website locally

```bash
# Option 1 — open the file directly
open website/index.html        # macOS
start website/index.html       # Windows

# Option 2 — serve it (recommended; avoids file:// quirks)
cd website
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no npm install, no external fonts, images, or scripts. Everything
is local, so the page also works offline.

## Pushing to GitHub (only after Saeed confirms)

1. Saeed confirms the repo name (proposed: `interview-assistant-website`).
2. Create the repo (do not create it before confirmation).
3. Push this folder as the repo root, on the default branch.
4. Verify the GitHub Pages / hosting setup per `docs/02-ARCHITECTURE.md`
   (hosting provider is still an open decision — see `docs/08-ROADMAP.md`).
5. Replace the download-button placeholders in `website/index.html` with the
   real signed installer URLs only after the release pipeline is validated.

## Standing rules (do not remove)

1. **Read-only on the source repo.** Never edit, create, or delete anything in
   `SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT` from this project.
2. **No GitHub writes without Saeed's explicit permission.** That includes
   creating the new repo and pushing to it.
3. **No invented features.** If the app does not do it, the website does not
   claim it. In particular: no hidden mode, no microphone recording, no audio
   storage, no hiring-outcome predictions, no scores.
4. **Use only where allowed.** Every public surface must carry the
   authorized-use message.
