# Interview Assistant — Touch Targets & Accessibility Standard (Step 11)

**Status:** in force from Step 11 (2026-11-14). Every interactive target and
every ARIA state in `website/*.html`, `website/styles.css` and
`website/app.js` must follow this standard. `tests/test-step11.js`
enforces it automatically.

**Basis:** Apple Human Interface Guidelines (44×44pt minimum touch target),
WCAG 2.2 AA (2.5.8 Target Size Minimum 24px, 2.4.7 Focus Visible, 4.1.2
Name/Role/Value, 4.1.3 Status Messages), ARIA Authoring Practices (accordion,
toggle button, radio group).

## 1. Touch targets — 44px, no exceptions except inline links

Every interactive target is at least **44×44 CSS px**. (WCAG 2.2 AA asks
only 24px; we hold Apple's 44px because the site is used on phones.)
The 44px is the **target** (hit region), not necessarily the visible box:
a control may draw smaller when its real tap target is 44×44 — Apple HIG
calls it a "hit region", Material 3 a "target size". Step 27: the hero
Replay button is 44×44, but its visible box is 36×30 (the chips' height,
the send button's width), right-aligned inside the button (Step 28: its
centre then matches the blue send button's centre one row below).

| # | Target | Height | How it meets 44px |
|---|--------|--------|-------------------|
| A1 | `.btn` (primary/secondary) | ~47px | padding 12px + 16px/1.3 + border |
| A2 | `.btn-small` | ~46px | padding 12px 16px + 15px/1.3 + border |
| A3 | `.nav-toggle` | ~52px | padding 12px 16px + 16px/1.65 + border |
| A4 | `.acc-btn` | ~66px | padding 20px + 17px/1.4 + border |
| A5 | `.chips-big .chip` | ~51px | padding 12px 16px + 15px/1.65 + border |
| A6 | `.demo-foot input` | ~51px | padding 12px 16px + 15px/1.65 + border |
| A7 | `.mode-btn` | 44px | `min-height: 44px` (padding stays compact) |
| A8 | `.chip` (sample chips) | 44px | `min-height: 44px` |
| A9 | `.radio-pill` (plan finder) | 44px | `min-height: 44px` |
| A10 | `.seg-btn` (answer length) | 44px | `min-height: 44px` (guard; computed 44.2px) |
| A11 | `.site-nav a` | ~49px | padding 12px 8px + 15px/1.65 |
| A12 | `.site-footer nav a` | ~49px | padding 12px 0 + 15px/1.65 |
| A13 | `.sticky-cta-close` | 51×51px | width/height from the shared --sticky-control-h token (51px), 44px floor (Step 28 fix-up: in-flow flex item, 12px gap from the primary button; stretch + aspect-ratio did not transfer on a flex item — the live check caught 44×50.75) |
| A14 | Range thumb (minutes calculator) | 24px | custom thumb, webkit + moz (the track is also clickable) |
| A15 | `.app-replay` (hero Replay icon) | 44×44px | button width/height 44px; visible box 36×30 (Step 27: same height as the chips, same width as the send button; 16px SVG glyph; focus ring on the visible box; Step 28: the box is right-aligned inside the button, so its centre matches the send button's centre) |
| A16 | `.app-chip-btn` (hero style chips, Step 30) | 44px tall | the button is the 44px target; the visible chip stays 30px (the A15 hit-region/visual split); the four style chips carry `aria-pressed` |
| A17 | `.app-manual-send-btn` (hero message box, Step 30) | 44×44px | visible box 36×36, right-aligned + centred, so its centre matches Replay's (Step 28) |
| A18 | `.app-manual-input` (hero message box, Step 30) | 36px tall × flexible width | **documented exception:** the real app's field is 36px tall and the mockup stays faithful; the field's width (≥200px) far exceeds 44px and the pair meets WCAG AA target size (24px). It is labelled (`<label for>`) and its focus is the global ring + an accent border |
| A19 | `.suggest-btn` (hero suggested questions, Step 37a) | >=44px tall x flexible width | real buttons labelled by the question itself (the NN/g suggested-questions pattern); the pair sits in a space reserved from first paint, so it is never a moving target |

**Rule:** prefer padding for standalone controls (A1–A6, A11–A13) and
`min-height: 44px` for grouped/compact controls (A7–A10) where bigger
padding would distort the component. Inline text links are exempt — a
paragraph link cannot be 44px tall without breaking the line.

## 2. Keyboard — everything reachable, focus always visible

- Every interactive element is a native `<button>`, `<a>` or `<input>` —
  never a `<div>` with a click handler.
- Global `:focus-visible` outline: **3px solid, 2px offset** (line 106 of
  styles.css) + a forced-colors fallback. **`outline: none` is forbidden
  anywhere — except one documented pattern:** the ring move, used by the
  app-window controls whose visible box is smaller than their 44×44 hit
  region (Step 27: the hero Replay, visible box 36×30; Step 30: the hero
  chip buttons, visible chip 30px tall, and the hero send button, visible
  box 36×36). The button's own outline is suppressed and the identical
  3px/2px ring is drawn on the visible box instead
  (`.app-replay:focus-visible .app-replay-box`,
  `.app-chip-btn:focus-visible .app-chip`,
  `.app-manual-send-btn:focus-visible .app-manual-send`), so focus is
  still always visible, on the thing the eye sees. (Enforced by
  test-step11.)
- Skip link is the first tab stop on every page.

## 3. Names — every control tells a screen reader what it is

- Every `<input>` has a `<label>` (visible or `.visually-hidden`).
- Icon-only buttons (`.nav-toggle`, `.sticky-cta-close`) have `aria-label`.
- Toggle buttons (`.mode-btn`, `.seg-btn`) have `aria-pressed`.
- Groups have `role="group"` + `aria-label` (answer mode, sample questions,
  answer length).
- The nav has `aria-label="Main"`; the brand link has `aria-label`.

## 4. States — the HTML tells the truth, JS keeps it true

- `aria-expanded` / `aria-pressed` / `aria-busy` / `aria-current` in the
  HTML reflect the **initial (no-JS) state**, and `app.js` updates them on
  every change (nav toggle, accordion, mode toggle, demo busy state).
  Example: the FAQ panels stay visible without JS (CSS collapses them
  only under `html.js-acc`, which JS adds on load), so the buttons say
  `aria-expanded="true"` in the HTML and JS sets them to `"false"` on
  load. Writing `"false"` in the HTML would lie to a no-JS screen
  reader — the first draft of this step made exactly that mistake on
  support.html and it was caught pre-push (see audit log).

## 5. Live regions — status is announced, decoration is hidden

- Results and status use `aria-live="polite"` (finder, calculator) or
  `role="status"` (demo status).
- The hero mock's status (`.app-status`) is a decorative duplicate of the
  interactive demo below it — `aria-hidden="true"`.

## 6. Landmarks and language

- One `<main>`, one `<nav aria-label>`, one `<header>`, one `<footer>` per
  page. `html lang="en"`; non-English samples carry `lang="fa"` / `lang="ar"`.
- `prefers-reduced-motion` is respected in CSS (2 media queries) and JS
  (3 `matchMedia` checks).
- No `<img>` tags on the site yet — no alt-text debt (revisit in Step 16).

## 7. Audit log

- **Step 11** inventoried every interactive element on all 10 pages
  (buttons, inputs, links) and measured each target from the CSS.
  Findings:
  - **P0 — touch targets below 44px:** `.btn-small` ~38px (used 2–3× per
    page), `.mode-btn` ~31px, `.chip` ~41px, `.radio-pill` ~43px,
    `.sticky-cta-close` 32px, `.site-nav a` ~41px, footer links ~41px,
    range thumb ~20px native. All fixed per the table above.
  - **P1 — ARIA audit almost broke the accordion (corrected pre-push):**
    the first draft of this step read the FAQ buttons' `aria-expanded`
    as wrong (`"true"` while "panels start closed") and changed
    support.html's 7 buttons to `"false"`. That was backwards: the panels
    start closed only *after JS runs* — without JS they stay visible
    (CSS collapses them only under `html.js-acc`), so `"true"` is the
    truthful HTML value, and index.html's 5 buttons already had it. The
    change was reverted before the push; the test now asserts `"true"` in
    the HTML on *both* FAQ pages and that JS sets `"false"` on load.
    Lesson: census every page before "fixing" a shared component —
    the first audit checked support.html only and missed index.html.
  - **P2 — decorative duplicate status:** index hero `.app-status` had no
    role and announced the same updates as the demo below it. Fixed with
    `aria-hidden="true"`.
  - **Already good (verified, now locked in by tests):** `:focus-visible`
    exists with no `outline: none` anywhere; every input is labelled;
    `aria-live` on results; `role="status"` on demo status; landmarks on
    all 10 pages; reduced-motion respected; nav-toggle updates
    `aria-expanded` correctly in JS.
- **Method:** CSS measurement of every target + ARIA census of all 10
  pages + fresh live re-verification after the fix.
- **Step 22 — mobile story player:** all seven segments are buttons with
  `min-height: 44px`; the ‹ › arrows are 44×44px buttons with `aria-label`s
  and `disabled` at the ends; the active segment carries `aria-current`;
  the caption has `aria-live="polite"` so the beat's title and text are
  announced on change; arrow keys work on the segment group. The player
  window keeps the story's `role="img"` label. Reduced motion: every beat
  renders instantly, so the player is fully usable by tap, swipe and
  keyboard without animation. The two shortened segment labels (Prep,
  Adapt) carry `aria-label`s with the full beat names (Prepare, Concise).
- **Step 23 — fixed stage:** `visibility: hidden` states are inert by
  design — a hidden layer is out of the focus order and out of the
  accessibility tree (unlike `opacity: 0`, which would leave five
  questions and five answers all exposed at once). The visible layer is
  the only one a screen reader meets. The caption is no longer a live
  region itself (its layers swap in and out of the tree); instead a
  separate visually-hidden `<p>` with `aria-live="polite"` carries the
  beat's title and text, so the announcement is one clean sentence per
  beat, in either mode. The Start button's label is hidden at ≤640px,
  but the button keeps its `aria-label` (the pill word carries the
  state); the hidden badge's information is still in the answer meta
  and the caption. Enforced by `tests/test-step23.js` and the sim.
