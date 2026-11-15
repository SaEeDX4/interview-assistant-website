# 06 — Content & SEO

- **Status:** Draft v0.1 — local staging, 2026-11-14
- **Language:** English (launch). The product supports 10 languages; the
  website launches in English only.

---

## 1. Messaging

### Positioning statement (one sentence)

> Interview Assistant is a Windows interview preparation and practice coach
> that builds a question bank from your resume and the job description —
> and, where you are allowed to use it, shows you three short, speakable
> points live in the interview.

### Taglines (use one, consistently)

- Primary (hero H1): **"Walk in prepared. Answer in your own words."**
- Secondary: "Prepare from your resume. Speak from your experience."
- Never use: "Ace every interview", "Guaranteed to pass", "The interview
  cheat code", or anything implying a hiring outcome.

### Tone

Calm, honest, competent. Short sentences. Specific nouns ("three bullets",
"30 live minutes") instead of adjectives ("amazing", "powerful"). If a
sentence would still be true with the product name removed, it is too
generic — rewrite it.

### Words to use / words to avoid

| Use | Avoid (and why) |
|---|---|
| preparation, practice, coach | "cheat", "hack", "trick" (implies deception) |
| live assist (where allowed) | "undetectable", "hidden", "stealth" (does not exist) |
| speakable points / bullets | "script", "teleprompter" (the product is not a script reader) |
| confirmed facts | "AI knows you" (it only uses facts you confirmed) |
| report, debrief | "score", "grade", "pass/fail" (no scores exist) |
| live minutes | "unlimited" (metered) |

## 2. Homepage copy (approved — matches `website/index.html`)

### Hero

- Eyebrow: "WINDOWS · INTERVIEW PREPARATION + LIVE ASSIST"
- H1: "Walk in prepared. Answer in your own words."
- Subhead: "Interview Assistant builds a 50–150 question bank from your
  resume and the job description, then shows you three short, speakable
  points live — built only from facts you confirmed. In 10 languages,
  including Persian and Arabic."
- CTAs: "Download for Windows" / "Try the live demo"
- Trust line: "Free Trial — 30 live minutes. Use only where you are
  allowed to."

### Ethics strip

"A visible window. It never hides, never records your microphone, and
never stores audio."

### Features (see `04-UX-SPEC.md` §3.4 for full copy)

Prepare from your resume · Three points, live · Coach Mode · Ten
languages, including RTL · Adapts when you're interrupted · An honest report.

### How it works

Profile → Prepare → Live → Report (see `04-UX-SPEC.md` §3.5).

### Pricing

Trial $0 (30 lifetime live minutes) vs Pro $19.99/month (600 live minutes
per billing period). See `05-PRICING-BILLING.md` — the price is a sandbox
price pending confirmation.

### Download

"Get Interview Assistant for Windows — Windows 10/11, 64-bit. Per-user
install — no admin needed."

### Android

"Android is coming. Preparation and practise on the go — the same question
bank, the same honest report. Leave your email and we'll tell you when
it's ready — and only then."

### FAQ + ethics

See `04-UX-SPEC.md` §§3.10–3.11 for the approved wording. Do not
paraphrase the ethics answers into softer language on the live site.

## 3. Claim-to-source table

Every claim on the site must have a source line. If a claim has no row
here, it does not go on the site.

| Claim | Source (source repo) |
|---|---|
| 50–150 question bank per interview | `README.md` (How it works); `PREPARATION_PIPELINE.md` |
| 15-stage preparation pipeline | `PREPARATION_PIPELINE.md` |
| Resume import PDF/DOCX/TXT; only confirmed facts used | `README.md`; `STATUS_REPORT_V2.md` |
| 3 short, speakable bullets, one at a time | `README.md`; `UX_SPEC_V2.md` |
| Coach Mode: 3 keywords + one-line structure | `COACH_MODE.md`; `README.md` |
| WASAPI loopback, interviewer headset audio, no browser extension | `README.md`; `ARCHITECTURE_V2.md` |
| Streaming transcription; end-of-question detection; multi-part merged | `README.md`; `ARCHITECTURE_V2.md` |
| Verified / Hypothetical / Bridge classification | `README.md` |
| 10 languages; RTL Arabic/Persian | `README.md`; `UX_SPEC_V2.md`; `LIVE_MEMORY.md` |
| Adaptive Concise/Rapid on interruptions | `LIVE_MEMORY.md`; `README.md` |
| Story anti-repetition; bounded memory | `LIVE_MEMORY.md` |
| Honest report; no scores, no hiring predictions | `REPORTS.md`; `README.md` |
| Trial 30 lifetime min; Pro 600 min/period; $19.99/mo (sandbox) | `ENTITLEMENTS.md` |
| Profiles 1 vs 3; prep runs 2 vs 20/mo; devices 1 vs 2; retention 14 vs 365 days | `ENTITLEMENTS.md` |
| Paddle MoR; no card data in app/backend | `BILLING.md`; `PRIVACY_IMPLEMENTATION.md` |
| No mic recording; no audio storage; visible window only | `README.md`; `SECURITY_V2.md`; `PRIVACY_IMPLEMENTATION.md` |
| Sign-in via browser (Google/Microsoft/email link); DPAPI tokens | `ARCHITECTURE_V2.md`; `README.md` |
| Developer mode: own OpenAI key | `README.md`; `ARCHITECTURE_V2.md` |
| Per-user installer, no admin; delta updates, never during an interview | `README.md`; `STATUS_REPORT_V2.md` |
| 201/201 core tests; 44/44 backend tests; 28/28 self-test; 1.3 s startup | `STATUS_REPORT_V2.md` (internal evidence — label as tested, not guaranteed) |
| Backend on Railway; ASP.NET Core + PostgreSQL | `DEPLOYMENT.md`; `ARCHITECTURE_V2.md` |

### Claims that must NOT appear

- Any language list beyond "10 languages, including Persian and Arabic"
  (full list unconfirmed).
- A specific public version number (unreconciled — see PRD §12 Q5).
- "Company research from URLs" (not fetched automatically).
- Machine translation of report questions (not implemented).
- Any download file size (until a real release exists).
- Any Android date, feature list, or download link.

## 4. SEO

### Title / meta (launch)

- **Title (≤ 60 chars):** "Interview Assistant — Prepare. Practise. Answer live."
- **Meta description (≤ 160 chars):** "Prepare for your interview from your
  resume and job description, then get three short, speakable points live —
  in 10 languages. Windows app. Free 30-minute trial."
- **Canonical:** the final domain (TBD) — set at hosting time.
- **Robots:** `index, follow` at launch (no staging index — the draft must
  not be indexed before launch; add `noindex` to any preview deploy).
- **Open Graph:** `og:title`, `og:description`, `og:type=website`,
  `og:image` (1200×630, once the asset exists — see `02-ARCHITECTURE.md` §6).
- **Twitter card:** `summary_large_image` with the same image.

### JSON-LD (in `index.html`)

`SoftwareApplication` with: name "Interview Assistant", operatingSystem
"Windows 10, Windows 11", applicationCategory "BusinessApplication",
offers (Trial $0, Pro $19.99/month — update if the price changes),
inLanguage "en". Do not add `aggregateRating` — there are no reviews to
aggregate, and inventing one would be false.

### Keywords (target — honest terms only)

Primary: interview preparation app, interview practice, interview coach,
live interview assistant, interview question bank.
Secondary: prepare for job interview from resume, interview answers in
Persian, RTL interview app, interview debrief report, coach mode interview.
**Excluded — never target:** cheat interview, undetectable interview help,
hidden interview assistant, pass interview guaranteed, interview hack.
These terms would attract the wrong audience and contradict the product's
ethics. Excluding them is a deliberate positioning choice, not an oversight.

### Technical SEO

- One H1; semantic headings; descriptive link text (no "click here").
- All images (when added) get alt text; decorative images `alt=""`.
- `sitemap.xml` + `robots.txt` with the real domain at hosting time.
- Page must work without JavaScript for the core message (the demo needs
  JS, but the H1, features, pricing, and FAQ must be readable with JS off
  — they are plain HTML in the draft).
- Performance: 0 external requests; total < 150 KB (see §5 of
  `02-ARCHITECTURE.md`).

## 5. Content plan (after launch — small, honest)

Do **not** launch with a blog. Launch with the one page, done well. Then,
only if there is time to write properly:

| # | Piece | Why |
|---|---|---|
| 1 | "How to prepare for an interview from your resume" | The core job-to-be-done; evergreen |
| 2 | "What good interview answers have in common" (structure, not scripts) | Teaches the Coach Mode mindset |
| 3 | "Interviewing in a second language" | Serves the multilingual persona honestly |
| 4 | "What we record — and what we don't" | Privacy, in plain language |
| 5 | "How the question bank is built" | Transparency about preparation |

Rules for all content: no keyword stuffing, no fake expertise claims, no
promises about outcomes, every product claim traces to the claim table
above. One good post a month beats ten thin posts.

## 6. Social / sharing

- No social accounts are required at launch. If accounts are created
  later, they must use the same messaging and the same ethics line.
- Share copy (for the visitor's own share, if a share button is ever
  added): "I'm preparing for interviews with Interview Assistant — a
  question bank built from my resume, and three short points live."
  No auto-posting, no referral spam.
