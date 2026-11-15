# 03 — Design System: Interview Assistant

- **Status:** Draft v0.1 — local staging, 2026-11-14
- **Theme:** Dark premium. Calm, confident, honest — the opposite of a
  "cheat tool" aesthetic. No neon hacker styling, no fake urgency, no dark
  patterns.
- **Implementation:** `website/styles.css` (single file, CSS custom properties).
  This document is the spec; the CSS is the implementation. If they disagree,
  fix the CSS.

---

## 1. Brand

- **Name:** Interview Assistant (working name — brand decision open, see PRD §12).
- **Wordmark:** typographic only in the draft — "Interview Assistant" in the
  display weight, with a small "IA" monogram in a rounded square. No invented
  logo: a placeholder logo shipped as final would be a lie about the brand.
- **Voice (visual):** quiet confidence. Generous whitespace, one accent at a
  time, short lines, honest labels. The product helps you speak well — the
  site should read well.
- **What the brand is not:** loud, gamified, "hustle" styling, countdown
  timers, fake scarcity, stock-photo handshakes.

## 2. Colour

Dark premium palette. All colours are CSS custom properties in `styles.css`.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0c10` | Page background |
| `--bg-soft` | `#0e1218` | Alternating section background |
| `--surface` | `#12161e` | Cards, demo panel |
| `--surface-2` | `#171d28` | Raised / hover surfaces, inputs |
| `--border` | `#232b38` | Card borders, dividers |
| `--border-strong` | `#32405a` | Focus rings (with accent), emphasis borders |
| `--text` | `#f2f4f8` | Primary text |
| `--muted` | `#9aa3b2` | Secondary text |
| `--muted-2` | `#6b7484` | Tertiary text, captions |
| `--accent` | `#7c6cff` | Primary accent (violet) — CTAs, links, active states |
| `--accent-soft` | `rgba(124,108,255,.14)` | Accent backgrounds (pills, highlights) |
| `--accent-2` | `#2dd4bf` | Secondary accent (teal) — "live" / listening states |
| `--coach` | `#f5b94e` | Coach Mode accent (warm amber) — keywords/structure |
| `--good` | `#34d399` | Success, "verified" states |
| `--warn` | `#fbbf24` | Warnings, "hypothetical / bridge" labels |
| `--danger` | `#f87171` | Errors, destructive actions (rare on the site) |
| `--focus` | `#a99fff` | Keyboard focus ring |

### Rules

- **One accent per view.** Violet is the default accent; teal appears only
  for live/listening states; amber appears only in Coach Mode. Never use all
  three at once in a single component.
- **Contrast:** body text on background ≥ 7:1; muted text on background ≥
  4.5:1. Accent text on dark background ≥ 4.5:1 (use `--focus` `#a99fff` for
  small accent text, not the raw `--accent`).
- **No pure black, no pure white.** `#0a0c10` / `#f2f4f8` keep the page from
  feeling harsh.
- **Status colours match the app's semantics:** Verified = green, Hypothetical
  / Bridge = amber. Do not invent new meanings for these colours on the site.
- **Light theme:** not shipped at launch. The app has a light theme; the
  website is dark-only for launch (a light theme is a Phase 4 item). Do not
  ship a half-finished light theme.

## 3. Typography

- **Font stack:** `Inter, "Segoe UI", system-ui, -apple-system, "Helvetica Neue",
  Arial, sans-serif` — system stack only, no webfont download (see
  `02-ARCHITECTURE.md`). If a brand font is chosen later, self-host WOFF2.
- **Monospace (code, shortcuts, file names):** `ui-monospace, "Cascadia Code",
  "JetBrains Mono", Consolas, monospace`.
- **Scale (desktop):**

  | Token | Size / line-height | Use |
  |---|---|---|
  | Display | 56 px / 1.05, weight 700, letter-spacing −0.02em | Hero headline (clamps to 40 px on mobile) |
  | H2 | 34 px / 1.15, weight 700 | Section headings |
  | H3 | 21 px / 1.3, weight 650 | Card / feature headings |
  | Body | 17 px / 1.65 | Body copy |
  | Small | 14 px / 1.55 | Captions, meta, footer |
  | Tiny | 12.5 px / 1.5, uppercase, letter-spacing .08em | Eyebrows / section labels |

- **Measure:** body copy max ~68 characters per line. Long lines are a
  readability bug.
- **RTL:** the site launches in English (LTR). When a Persian/Arabic version
  is built, it must mirror layout (per the app's RTL behaviour) and use a
  font with proper Arabic-script shaping — do not just flip `dir` and ship it.

## 4. Spacing and layout

- **Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px (the app uses
  4/8/12/16/24 — the site extends it for page rhythm).
- **Container:** max-width 1120 px, side padding 24 px (16 px on mobile).
- **Section rhythm:** 96 px vertical padding desktop, 64 px mobile.
- **Grid:** 12-column mental model; features in 3 columns → 2 → 1;
  pricing in 2 columns → 1; how-it-works in 4 steps → 2 → 1.
- **Radii:** 8 px (small controls), 12 px (cards), 16 px (demo panel),
  999 px (pills). Matches the app's 8/12 radii, extended for the site.
- **Borders:** 1 px, `--border`. Cards get a border, not a shadow, on dark.
- **Shadows:** subtle only — `0 8px 30px rgba(0,0,0,.35)` for the demo panel
  and sticky nav. No coloured glow except the hero's soft radial accent
  wash (very low opacity, decorative, `aria-hidden`).

## 5. Components

### 5.1 Buttons

- **Primary:** violet fill (`--accent`), dark text? No — white text on violet
  at this darkness passes contrast for large/bold text; for small text use a
  slightly lighter violet fill. In the draft: background `#7c6cff`, text
  `#ffffff`, weight 650, radius 10 px, padding 12 px 20 px. Hover: lighten
  8%; active: darken; focus: 3 px `--focus` ring with 2 px offset.
- **Secondary:** transparent with 1 px `--border-strong` border, `--text`
  text. Hover: border brightens, background `--surface-2`.
- **Ghost / link:** text-only, accent colour, underline on hover.
- **Disabled:** 50% opacity, `not-allowed` cursor, `aria-disabled`.
- **Rule:** one primary button per section. Never two competing primaries.

### 5.2 Demo panel (hero)

The signature component. A window-like panel:

- Header bar: three dots (decorative, `aria-hidden`), a "LIVE DEMO —
  SIMULATED" pill (teal dot + label), and the Coach Mode toggle.
- Question area: the interviewer's question in semibold text, with a small
  "Interviewer" label.
- Answer area: 3 bullets, each appearing one at a time (staggered fade +
  6 px rise, 250 ms each), with a numbered marker. Never rewrite a bullet
  once shown — it fades in and stays.
- Coach Mode: same panel, different content — 3 uppercase keywords joined
  by `·`, then one structure line with `→`, in amber. Max 2 lines.
- Input: a text field ("Type a question, or pick a sample") + sample
  question chips. Enter or a chip runs the demo.
- Footer: a caption — "Simulated demo. The real app listens to the
  interviewer's audio and shows bullets like these live."
- `aria-live="polite"` on the answer region; bullets are list items.

### 5.3 Cards (features / steps / pricing)

- Background `--surface`, 1 px `--border`, radius 12–16 px, padding 24 px.
- Icon: 40 px rounded square, accent-soft background, inline SVG in accent
  colour. No emoji as icons.
- Title (H3), one or two lines of body copy, no more.
- Hover: border brightens, translateY(−2 px), 200 ms ease. No hover lift on
  touch devices (media `hover: hover` only).

### 5.4 Pricing cards

- Two cards: Trial and Pro. Pro is "featured": accent border, a small
  "Most popular" pill, slightly raised.
- Price: large number + "/month" (Trial: "$0"), then a "per billing period"
  line in muted text.
- Feature list: check-mark rows, one line each, with the plan limits in
  **bold numbers** (30 minutes, 600 minutes, 1 profile, 3 profiles…).
- CTA: Trial → "Download for Windows"; Pro → "Start with Pro" (goes to
  the download section in the draft — the real checkout lives in the app).
- A footnote under the table: "Prices in USD. Billed by Paddle, the Merchant
  of Record. Cancel anytime — you keep access until the end of the period."

### 5.5 FAQ accordion

- Native `<details>` / `<summary>` elements (no JS needed for the accordion
  itself). Summary is a button-like row with a chevron that rotates.
- Open state shows the answer in muted body text. One open at a time is
  *not* enforced — native behaviour is fine.

### 5.6 Pills / chips

- Status pill: dot + uppercase label, 12 px, letter-spacing .08em.
- Sample-question chips: pill buttons, `--surface-2` background, border,
  hover accent border. Keyboard-focusable, real `<button>`s.
- Mode pill (Answer / Coach): a segmented toggle — two options, one active,
  `role="group"` + `aria-pressed` on the buttons.

### 5.7 Forms

- Text input: `--surface-2` background, 1 px `--border-strong`, radius 10 px,
  14 px padding, `--text` colour, placeholder in `--muted-2`.
- Focus: `--focus` ring, border brightens.
- Labels are visible (not placeholder-only). Errors (if any) are text +
  `aria-describedby`, never colour alone.

## 6. Motion

- **Principles:** motion explains, never decorates. Every animation has a
  purpose (a bullet appearing, a panel opening, a toggle switching).
- **Durations:** 150–250 ms for UI feedback; 400 ms max for panel
  transitions. Easing: `cubic-bezier(.2,.7,.3,1)` (gentle ease-out).
- **Demo bullets:** fade + translateY(6 px → 0), staggered 180 ms apart.
- **Hero:** a single slow radial wash (opacity only, 12 s, alternate) — the
  only ambient animation on the page.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all
  animation and transitions; bullets appear instantly. This is mandatory,
  not optional.
- **No:** auto-playing carousels, parallax, scroll-jacking, spinners that
  never stop, or anything that moves while the user is trying to read.

## 7. Accessibility

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>` with
  `aria-labelledby`, `<footer>`. Skip link ("Skip to content") as the first
  focusable element.
- Heading order is strict: one H1, then H2s, then H3s. No skipped levels.
- All interactive elements are real buttons/links/inputs — no `div` with
  an `onclick`.
- Focus is always visible (3 px `--focus` ring). Never `outline: none`
  without a replacement.
- Colour is never the only signal: status always has text, Coach Mode has a
  label as well as a colour, errors have text.
- Touch targets ≥ 44 px.
- `alt` text: decorative images `alt=""`; informative images get real alt
  text. The draft has no raster images.
- Language: `<html lang="en">`. Any non-English phrase (e.g. a Persian
  sample question) gets `lang="fa" dir="rtl"` on its element.
- Targets: WCAG 2.2 AA; Lighthouse accessibility ≥ 95; 0 critical axe issues.

## 8. Responsive behaviour

| Breakpoint | Layout |
|---|---|
| < 640 px | Single column everywhere; hero headline 40 px; demo panel full-width; nav collapses to a menu button; pricing stacks; steps stack. |
| 640–1024 px | Two-column features; hero stacks (copy above, demo below); pricing two-column if it fits, else stacked. |
| > 1024 px | Full grid; hero is two columns (copy left, demo right) at ≥ 1080 px. |

- No horizontal scrolling at any width. Test at 360 px.
- The demo panel's bullets must fit without scrolling, like the app's
  overlay (auto-fit is an app rule; on the site, keep bullets short enough
  that they fit — if a bullet is too long, shorten the copy, don't shrink
  the text below 15 px).

## 9. Do not do

- No stock photos of "business people shaking hands".
- No fake testimonials, fake logos ("As seen in…"), fake review stars.
- No countdown timers, no "only 3 left", no exit-intent popups.
- No dark patterns in pricing (no pre-checked add-ons, no hidden fees —
  there are none; keep it that way).
- No stealth / hacker visual language. The product is a visible, honest
  coach — the site must look like one.
