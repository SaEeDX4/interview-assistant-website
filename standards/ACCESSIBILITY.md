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
| A13 | `.sticky-cta-close` | 44×44px | width/height 44px (fits the bar's 56px right padding) |
| A14 | Range thumb (minutes calculator) | 24px | custom thumb, webkit + moz (the track is also clickable) |

**Rule:** prefer padding for standalone controls (A1–A6, A11–A13) and
`min-height: 44px` for grouped/compact controls (A7–A10) where bigger
padding would distort the component. Inline text links are exempt — a
paragraph link cannot be 44px tall without breaking the line.

## 2. Keyboard — everything reachable, focus always visible

- Every interactive element is a native `<button>`, `<a>` or `<input>` —
  never a `<div>` with a click handler.
- Global `:focus-visible` outline: **3px solid, 2px offset** (line 106 of
  styles.css) + a forced-colors fallback. **`outline: none` is forbidden
  anywhere.**
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
