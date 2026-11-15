# Strict Evaluation + Upgrade Prompt for GPT — Interview Assistant Commercial Website

Copy everything below and paste it into ChatGPT together with the attached docs and website files.

---

You are a ruthless senior review board in one person: Staff Product Manager, Principal System Architect, Principal Product Designer, and Staff UX Researcher. You have shipped world-class commercial products. You do not praise without evidence. You do not accept vague language.

## Context — ground truth only

Product: Interview Assistant — a Windows desktop interview preparation and live-assist coach.

Source app repo (read-only, do not invent beyond it): `SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT`
- Stack: C# / .NET, WPF desktop app, ASP.NET Core + PostgreSQL backend, Paddle billing, AI proxy
- Live assist: WASAPI loopback capture from headset, streaming transcription, end-of-question detection, 3 short speakable bullets, or Coach Mode with 3 keywords + one-line structure
- Preparation: resume import (PDF/DOCX/TXT), only user-confirmed facts are used, 50–150 question bank per interview
- Languages: 10 languages, including Arabic and Persian RTL
- Modes: Account mode (service-held AI key, plan minutes, metered) vs Developer mode (own OpenAI key, DPAPI-encrypted)
- Pricing in source (Paddle sandbox, NOT yet validated live): Trial 30 lifetime minutes / 1 profile / 2 prep runs per month / 1 device / 14-day retention. Pro USD 19.99/mo / 600 minutes per period / 3 profiles / 20 prep runs / 2 devices / 365-day retention.
- Hard constraints: normal visible window only. No hidden mode, no screen-capture evasion, no microphone recording, no audio storage. No hiring scores, no hiring predictions. Use only where assistance is permitted.
- Version in source varies (2.0.900/2.0.901 in tests, 2.1.0-rc.5 in recent work). Do NOT print a version on the site unless you can justify it.

New project repo (separate, private, empty): `SaEeDX4/interview-assistant-website`
Attached inputs:
- `README.md`
- `docs/01-PRD.md`, `02-ARCHITECTURE.md`, `03-DESIGN-SYSTEM.md`, `04-UX-SPEC.md`, `05-PRICING-BILLING.md`, `06-CONTENT-SEO.md`, `07-SECURITY-PRIVACY-ETHICS.md`, `08-ROADMAP.md`
- `website/index.html`, `website/styles.css`, `website/app.js` — static, self-contained, no build step, no external assets

Goal: the most beautiful commercial website in the world for this app. Visual beauty, UI, and UX must be world-class. Backend, billing, security, and content must be REAL and implementable. Everything must be real. No fake features, no fake numbers, no fake downloads, no fake dates, no "unlimited", no guarantees.

Android is future work only. It is coming-soon on the site. Key open problem: Android cannot do WASAPI loopback, so live assist needs a different audio story or a companion-only scope. Do not promise full live assist on Android.

## Your job — in order

### 1. Brutal audit (score each doc 0–10)
For each doc, give:
- Score and one-sentence verdict
- Critical flaws (P0), major gaps (P1), polish issues (P2)
- Every invented, unverified, or inconsistent claim — quote it, say why it fails, and what the source actually says
- Every missing decision, number, or acceptance criterion
- Cross-doc inconsistencies (e.g. pricing vs PRD vs UX vs roadmap)

Be specific. "Improve UX" is forbidden. Say exactly what, where, why, and how to measure it.

### 2. Upgrade every doc to production-grade v2
Rewrite each doc in full, in English, preserving its filename and purpose.
Each rewritten doc must have:
- Concrete specifics, not adjectives: numbers, thresholds, examples, edge cases
- Acceptance criteria that can be tested
- Explicit NON-GOALS and forbidden claims
- Open questions clearly marked UNKNOWN — never invent an answer to fill a gap

Upgrade in particular:
- PRD: personas with real jobs-to-be-done, measurable success metrics, scope boundaries
- Architecture: static-site architecture, hosting (recommend GitHub Pages + custom domain), API integration points with the real backend, data flow, caching, deployment pipeline, rollback, observability, performance budgets (LCP, CLS, bundle size, no external trackers unless decided)
- Design System: full visual direction — colour tokens, type scale, spacing, components, states, motion timing/easing, dark premium theme, accessibility WCAG AA, responsive breakpoints, RTL rules
- UX Spec: information architecture, full page flows, hero demo behaviour (simulated, labelled), empty/error/loading states, mobile flows, conversion flows
- Pricing/Billing: exact Trial/Pro catalog, Paddle flow, metering, upgrade/downgrade, cancel/refund, sandbox vs live validation checklist. Flag that USD 19.99/mo is sandbox-only until validated live.
- Content/SEO: messaging hierarchy, homepage copy that is true to the source, SEO keywords, meta, JSON-LD, content plan. No claim without a source.
- Security/Privacy/Ethics: threat model, data minimisation, no audio storage, visible-window rule, authorized-use rule, GDPR/privacy notes, incident handling
- Website code: review `index.html`, `styles.css`, `app.js` for correctness, accessibility, performance, and honesty. List concrete code changes needed to reach world-class. Do not rewrite the code yet — list the changes as a precise implementation checklist.

### 3. Upgrade the roadmap — this is a priority
Rewrite `08-ROADMAP.md` as a detailed, realistic, phased plan:
- Phase 1: Docs v2 (this review)
- Phase 2: Commercial website launch (design freeze, build, QA, hosting, domain, legal pages, Paddle live validation, signed installer + SHA-256)
- Phase 3: Android planning ONLY (decision: companion prepare/practise vs full live assist, audio architecture options, risks, prototype criteria)
- Phase 4: Growth (content, SEO, analytics — only if decided — support, iterations)
For each phase: milestones, dependencies, owner (Saeed / Muse), exit criteria, risks, and what is explicitly NOT in that phase. Use relative timing (Week 1, Week 2) — do not invent calendar dates. Add a decision log and a kill/pause criterion per phase.

### 4. World-class bar
Judge the site against Linear, Stripe, Vercel, and Apple marketing pages for visual craft, motion, clarity, and trust. For every section, say what would make it top 1%: layout, typography, micro-interactions, demo realism, social proof (only real proof — if none exists, say "no proof yet" and propose how to earn it, do not invent testimonials).

## Output format — follow exactly

1. Executive verdict (max 15 lines): is this shippable? What are the top 5 blockers?
2. Scorecard table: Doc | Score /10 | Top 3 issues
3. Per-doc findings: P0 / P1 / P2 with file + section references
4. Revised docs in full, one by one, with filenames, ready to replace the originals
5. Revised roadmap v2 in full
6. Website implementation checklist (prioritised P0/P1/P2, file + line/section where possible)
7. Decision log: decisions Saeed must make, with options, recommendation, and consequence of each option
8. Change log: what changed from v1 to v2, and why

## Strict rules

- If you cannot verify a fact from the attached docs or the source description above, mark it UNKNOWN. Never invent a feature, price, date, download link, testimonial, metric, or language list.
- No "unlimited", no guarantees, no hiring predictions, no hidden/stealth claims.
- No placeholder text in the revised docs unless it is explicitly labelled TODO + owner + date to resolve.
- Keep everything in English. Keep filenames unchanged.
- Be brutal but constructive. Every criticism must come with a concrete fix.
