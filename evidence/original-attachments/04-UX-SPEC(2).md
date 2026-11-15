# 04 — UX Specification: Commercial Website

- **Status:** Draft v0.1 — local staging, 2026-11-14
- **Site model:** one long page (single-page site). Every section is
  reachable from the sticky nav; the page is the whole funnel.

---

## 1. Information architecture

```
Header (sticky)
  Logo / wordmark ── Features · How it works · Pricing · Download · FAQ ── [Download for Windows]
Hero (#top)
  Eyebrow · H1 · Subhead · CTAs (Download / Try the demo) · Trust line (authorized use)
  └─ Live demo panel (simulated)
Ethics strip (one line, visible without scrolling far)
Features (#features) — 6 cards
How it works (#how) — Profile → Prepare → Live → Report (4 steps)
Languages strip — 10 languages, RTL note, Persian sample
Pricing (#pricing) — Trial vs Pro
Download (#download) — Windows 10/11 x64
Android (#android) — coming soon + notify-me
FAQ (#faq) — 7 questions (native accordions)
Ethics & privacy (#ethics) — the full note
Footer — product / resources / legal (placeholders) / support
```

No separate pages at launch. A second page (Privacy Policy / Terms) is
added only when the legal documents exist — until then, the ethics section
carries the message and the footer links are clearly marked as coming soon
(never linked to a dead page).

## 2. Page flows

### Flow A — "I want to understand it" (primary)

1. Land → hero headline answers "what is it?" in one line.
2. Read the subhead (4-step flow in one sentence).
3. Try the demo (or watch the bullets appear from a sample question).
4. Scroll features → how-it-works → pricing.
5. Download, or read the FAQ/ethics if unsure.

**Success:** the visitor can explain the product back in one sentence
("It prepares me from my resume and shows me three short points live,
where I'm allowed to use it").

### Flow B — "Is it allowed / is it safe?" (trust)

1. Land → ethics strip under the hero.
2. FAQ: "Is it allowed?", "What is recorded?", "Does it record my voice?"
3. Ethics & privacy section (full note).
4. Download — or leave, having been told the truth. A visitor who leaves
   because the product is not for them is a success, not a failure.

### Flow C — "How much does it cost?"

1. Nav → Pricing.
2. Trial vs Pro table (minutes first — minutes are the unit that matters).
3. Footnote: Paddle, USD, cancel anytime, keep access to period end.
4. Download to start the Trial (30 lifetime minutes).

### Flow D — "I'm on Android"

1. Land → scroll (or nav) → Android section.
2. Read: coming soon, no date promised.
3. Leave an email for notification (draft: local demo only — see §6).
4. Confirmation message: "You're on the list. We'll email you when
   Android is ready — and only then."

## 3. Section specifications

### 3.1 Header (sticky)

- Height 64 px; background `color-mix` / semi-transparent `--bg` with blur
  (`backdrop-filter`) once scrolled; border-bottom `--border`.
- Left: wordmark (IA monogram + "Interview Assistant").
- Centre/right: nav links (Features, How it works, Pricing, Download, FAQ).
- Right: primary button "Download for Windows" (small).
- Mobile (< 860 px): nav collapses behind a menu button (`aria-expanded`,
  `aria-controls`); the menu is a simple vertical list, not a full-screen
  takeover.
- The header never overlaps content on anchor jump: sections have
  `scroll-margin-top: 88px`.

### 3.2 Hero

- **Eyebrow:** "WINDOWS · INTERVIEW PREPARATION + LIVE ASSIST" (tiny,
  uppercase, letter-spaced, muted).
- **H1:** "Walk in prepared. Answer in your own words." — then a second
  line in muted/accent: the product name is in the eyebrow and the demo;
  the H1 sells the outcome, not the feature list.
  - *Copy note:* the H1 must not promise a hiring outcome. "Walk in
    prepared" is about the candidate's preparation, not a result.
- **Subhead (one paragraph, ≤ 3 lines):** "Interview Assistant builds a
  50–150 question bank from your resume and the job description, then shows
  you three short, speakable points live — built only from facts you
  confirmed. In 10 languages, including Persian and Arabic."
- **CTAs:** primary "Download for Windows" → `#download`; secondary
  "Try the live demo ↓" → focuses the demo input.
- **Trust line (small, under the CTAs):** "Free Trial — 30 live minutes.
  Use only where you are allowed to."
- **Right / below (desktop two-column):** the demo panel (see §4).
- **Ethics strip** directly under the hero (full-width, subtle border,
  one line + link to `#ethics`): "A visible window. It never hides, never
  records your microphone, and never stores audio."

### 3.3 Live demo panel (simulated) — the centrepiece

Wireframe (text description; the built panel is in `website/index.html`):

```
┌─ Demo panel ─────────────────────────────────────────────┐
│ ● ● ●   ● LIVE DEMO — SIMULATED        [Answer | Coach] │
├──────────────────────────────────────────────────────────┤
│ INTERVIEWER                                              │
│ "Tell me about yourself."                                │
├──────────────────────────────────────────────────────────┤
│ ①  Five years building web products, most recently …     │
│ ②  I lead with the outcome, then the trade-off …         │
│ ③  What draws me here is the team’s focus on …           │
├──────────────────────────────────────────────────────────┤
│ [ Type a question…                         ] [Show answer]│
│ Samples: Tell me about yourself · Why hire you? · …      │
│ Simulated demo — no audio, no microphone, no recording.  │
└──────────────────────────────────────────────────────────┘
```

**Behaviour (exact):**

1. On load, the panel shows the default sample question with its 3 bullets
   already visible (so the page never looks empty), and a caption that it
   is simulated.
2. The visitor picks a sample chip or types a question and presses Enter /
   "Show answer".
3. The old bullets clear. A short "Listening…" state appears for ~600 ms
   (a thinking indicator, not a fake transcription — label it "Preparing
   your points…").
4. Bullets appear one at a time, 180 ms apart, fade + 6 px rise. Once
   shown, a bullet never changes or rewrites.
5. If the typed question matches no sample (the common case), the panel
   shows a **generic, honest fallback**: three coaching bullets that are
   clearly framed as a *structure* for answering ("Start with the outcome…",
   "Give one concrete example from your own experience…", "Close by
   connecting it to this role…") plus a caption: "This is a sample
   structure. In the real app, points are built from your confirmed facts
   and your prepared question bank."
   - *Why a fallback, not a fake "AI answer":* the website has no AI and
     no user profile. Inventing a specific answer to an arbitrary question
     would be dishonest. The fallback teaches the *shape* of an answer.
6. **Coach Mode toggle:** switches the same question to Coach output —
   3 uppercase keywords joined by `·`, then one structure line with `→`.
   The toggle is a segmented control with `aria-pressed`; the panel label
   changes to "COACH MODE".
7. **RTL sample:** one sample question is in Persian (with `lang="fa"
   dir="rtl"`), and its bullets are shown right-aligned, demonstrating RTL.
   The Persian bullets are short, real Persian — not machine-gibberish.
8. Keyboard: the input is a real `<input>`; chips are real `<button>`s;
   everything works without a mouse. The answer region is
   `aria-live="polite"`.
9. Reduced motion: bullets appear instantly, no stagger.

**Sample questions (grounded in the app's core question bank):**

| # | Question | Why this one |
|---|---|---|
| 1 | Tell me about yourself. | Core bank: intro |
| 2 | Why should we hire you? | Core bank: why hire |
| 3 | What is your biggest weakness? | Core bank: weakness (with honest gap handling) |
| 4 | Tell me about a time you led a difficult project. | Behavioural bank: one story per topic |
| 5 | Where do you see yourself in five years? | Core bank: 5 years |
| 6 | (Persian) درباره خودتان بگویید. | RTL demonstration |

### 3.4 Features (6 cards)

1. **Prepare from your resume** — "Import your resume and the job
   description. Review every extracted fact — only facts you confirm are
   ever used. A 50–150 question bank is built for that interview."
2. **Three points, live** — "When a question ends, three short, speakable
   bullets appear one at a time. Short enough to say, not to read out."
3. **Coach Mode** — "Prefer a nudge over a script? Coach Mode shows three
   keywords and a one-line structure, so the words stay yours."
4. **Ten languages, including RTL** — "Answers follow the interviewer's
   language. Arabic and Persian render right-to-left, properly."
5. **Adapts when you're interrupted** — "A fast follow-up shortens the
   next answer automatically (Concise, then Rapid). You can reset it with
   one hotkey."
6. **An honest report** — "Afterwards, see the questions asked and the
   suggestions shown. No scores, no hiring predictions — just what
   happened, so you can prepare better next time."

Each card: icon, H3, 2 lines of body, no "Learn more" link (there is
nowhere to learn more yet — the link would be dead).

### 3.5 How it works (4 steps)

Horizontal steps on desktop (numbered 01–04, connected by a line), stacked
on mobile. Each step: number, title, one line, one small visual cue
(Profile = document icon; Prepare = list icon; Live = waveform/pulse icon;
Report = chart icon — all inline SVG).

1. **Profile** — "Import your resume. Confirm the facts."
2. **Prepare** — "Add the role and job description. Get your question bank."
3. **Live** — "Start listening. Three points appear as questions end."
4. **Report** — "Stop, review, and prepare better next time."

Under the steps, a small hotkey row (honest, useful, grounded in the app):
`Ctrl+Alt+L` start/pause · `Ctrl+Alt+C` Answer/Coach · `Ctrl+Alt+R` reset ·
`Ctrl+Alt+Space` show/hide. Labelled "In the app".

### 3.6 Languages strip

One line: "English · العربية · فارسی · … — 10 languages. Answers follow
the interviewer." **Do not list all 10 until the list is confirmed**
(see PRD §12 Q4). The strip shows the confirmed direction (RTL for Arabic
and Persian) and the Persian demo sample as proof, and otherwise says
"10 languages" without inventing the list.

### 3.7 Pricing

Two cards (see `03-DESIGN-SYSTEM.md` §5.4 and `05-PRICING-BILLING.md`).
Below the cards, a comparison strip in plain language:

- "Minutes are live interview minutes — the time you spend in a live
  session. Preparation, practise, and reports don't use minutes."
  (Verify: preparation runs are a separate quota — 2/month Trial,
  20/month Pro — and are listed separately; the sentence above is about
  live minutes only.)
- "Need more? Pro is the only paid plan at launch. There is no per-minute
  top-up at launch." (If a top-up is added later, update this line — do
  not leave a stale claim.)

### 3.8 Download

- H2: "Get Interview Assistant for Windows".
- Subhead: "Windows 10/11, 64-bit. Per-user install — no admin needed.
  Updates are delta-based and never install during an interview."
- Two buttons: primary "Download the installer" (placeholder), secondary
  "Portable ZIP" (placeholder). Under each, the file size and SHA-256
  *once real* — in the draft, the line reads: "Download links go live
  with the first signed release."
- System requirements list (grounded): Windows 10/11 x64; a headset
  (the app listens to headset audio via WASAPI loopback); an internet
  connection for live transcription and AI answers (prepared answers
  work offline with a cached entitlement — see `ARCHITECTURE_V2.md`).
- A note: "Unsigned test builds trigger SmartScreen — the signed release
  will not." (Only if true at launch; check the signing status before
  publishing this line.)

### 3.9 Android (coming soon)

- H2: "Android is coming."
- Copy: "Preparation and practise on the go — the same question bank,
  the same honest report. We're building it now. Leave your email and
  we'll tell you when it's ready — and only then."
- Notify form: email input + "Notify me" button.
- **Draft behaviour:** the form does not send anything anywhere. On submit
  it shows: "Thanks — this is a demo form. The real waitlist opens at
  launch." This is honest for a draft and prevents silent data loss.
- **Launch behaviour:** wire the form to the real endpoint (see
  `02-ARCHITECTURE.md` §3) and change the confirmation to "You're on the
  list." Remove the demo wording at that point.

### 3.10 FAQ (7 questions)

1. **Is it allowed to use Interview Assistant in an interview?**
   "Only where you are allowed to. It is a preparation and practice coach
   with a live assist mode for interviews where assistance is permitted.
   Always check the interview's rules — and the employer's — first. The app
   is a visible window; it never hides."
2. **What does it record?**
   "It does not record your microphone, and it does not store audio. It
   listens to the interviewer's audio from your headset to transcribe
   questions live. Transcripts and reports stay on your PC by default."
3. **Does it work in my language?**
   "It supports 10 languages, including Persian and Arabic with proper
   right-to-left display. Answers follow the interviewer's language."
4. **What does it cost?**
   "The Trial gives you 30 lifetime live minutes, 1 profile, and 2
   preparation runs a month. Pro is USD 19.99 a month for 600 live minutes
   per billing period, 3 profiles, and 20 preparation runs. Billed by
   Paddle — no card details ever touch the app."
5. **What happens if the interviewer interrupts me?**
   "The next answer gets shorter automatically (Concise, then Rapid), so
   you can keep up. You can reset it with Ctrl+Alt+R."
6. **What is Coach Mode?**
   "Instead of full bullets, Coach Mode shows three keywords and a
   one-line structure, so you speak in your own words. Toggle it live
   with Ctrl+Alt+C."
7. **What do I get after the interview?**
   "An honest report: the questions asked and the suggestions shown, plus
   what to prepare next time. No scores, no hiring predictions."

### 3.11 Ethics & privacy

A dedicated section (not just a footer link) with three short blocks:

- **Use only where allowed.** (Authorized-use acknowledgement, as in the
  app's onboarding.)
- **Your audio is not stored.** (No mic recording, no audio on disk, no
  audio in logs; transcription only.)
- **Your facts are yours.** (Only confirmed facts are used; local
  DPAPI-encrypted workspace by default; export and delete are available;
  payment data lives with Paddle only.)

Each block: one bold lead + two lines. Link: "Read the full privacy
approach →" — placeholder until the legal Privacy Policy exists.

### 3.12 Footer

Columns: **Product** (Features, How it works, Pricing, Download, Android),
**Resources** (Documentation — link to this repo's `docs/` on GitHub once
public; FAQ), **Legal** (Privacy Policy, Terms, Billing Terms — placeholders
marked "coming soon" until counsel drafts them), **Support** (email / URL —
TBD). Bottom line: "© 2026 Interview Assistant. Use only where you are
allowed to." + "Made for candidates, in 10 languages."

## 4. Interaction details

- **Anchor navigation:** smooth scroll (`scroll-behavior: smooth`) unless
  reduced motion is preferred; `scroll-margin-top` on sections.
- **Demo:** see §3.3 — the only JS-heavy interaction on the page.
- **FAQ:** native `<details>` — no JS.
- **Mobile menu:** one button, toggles `aria-expanded`, closes on link
  click and on Escape.
- **Notify form:** see §3.9.
- **No modals, no popups, no cookie banner in the draft** (no cookies are
  set; if analytics is added later, add the banner the law requires).

## 5. Responsive behaviour

| Width | Hero | Features | Steps | Pricing | Demo |
|---|---|---|---|---|---|
| < 640 px | Stacked, H1 40 px | 1 col | Stacked | Stacked | Full width, bullets fit without scroll |
| 640–1024 px | Stacked, demo below copy | 2 col | 2 × 2 | 2 col (or stacked) | Full width |
| > 1024 px | 2 col (copy / demo) | 3 col | 4 col | 2 col | Right column, sticky? No — not sticky; it scrolls normally |

- Test widths: 360, 768, 1280, 1440 px.
- No horizontal scroll at any width; the demo panel never overflows.

## 6. Error / empty states (website)

- **Demo with empty input:** pressing "Show answer" with an empty field
  does nothing except focus the input and show a polite hint ("Type a
  question, or pick a sample below.").
- **Demo with a very long question:** the question line clamps to 3 lines
  with an ellipsis; the answer is still the generic structure fallback.
- **Download buttons (draft):** clicking shows an inline note under the
  buttons ("Downloads open with the first signed release — the website
  draft has no installer yet."), rather than a dead link or a 404.
- **Notify form (draft):** see §3.9 — honest demo message, no silent failure.

## 7. Acceptance checks (UX)

- [ ] A first-time visitor can complete Flow A in under 2 minutes and
      explain the product back in one sentence.
- [ ] The demo works keyboard-only; bullets appear one at a time; Coach
      toggle works; the simulated label is visible.
- [ ] All nav anchors land on the right section (with header offset).
- [ ] The page is fully usable at 360 px with no horizontal scroll.
- [ ] FAQ, ethics, and pricing are reachable within 3 scrolls / 2 clicks.
- [ ] Reduced-motion mode: no animation, everything still works.
