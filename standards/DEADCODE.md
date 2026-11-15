# Interview Assistant — Dead-Code & Consistency Standard (Step 17)

**Status:** in force from Step 17 (2026-11-14). Every class in
`website/styles.css` and every page must follow this standard.
`tests/test-step17.js` enforces it automatically (it re-runs the census
below on every run).

**Basis:** a class that nothing uses is a lie in the codebase — someone
will style it thinking it is live, or wonder why a rule has no effect.

## 1. Rules

- **D1 — every CSS class is used:** each class selector in `styles.css`
  appears in the HTML, or is added/referenced by `app.js`, or is on the
  whitelist below.
- **D2 — every HTML class is defined:** each class in the HTML has a
  rule in `styles.css`, or is on the whitelist below.
- **D3 — whitelist (documented, not dead):**
  - JS state classes added at runtime: `cta-visible`, `is-coach-active`,
    `is-new`, `is-open`, `is-scrolled`, `is-visible`, `js`, `js-acc`,
    `open`.
  - JS-generated content classes: `reveal`, `coach`,
    `coach-keys`, `calc-note`, `pricing`.
  - Semantic hooks with no styles of their own: `brand-name` (the brand
    text, styled by `.brand`), `hero-copy` (the hero text wrapper,
    styled by `.hero`).
- **D4 — one nav, one footer:** the `<nav>` and `<footer>` markup is
  byte-identical on all 11 pages (except each page's own
  `aria-current="page"`).
- **D5 — funnel on every content page:** the next-step band is on all 10
  content pages. The sticky bar is on all of them except download.html
  (it IS the download page) and 404.html (an error page) — both by
  design, and `app.js` guards the missing element.

## 2. Audit log

- **Step 17** ran a full census: 215 classes defined in CSS, 196 used
  in HTML. Findings:
  - **P1 — 8 dead CSS rules removed:** `.hotkeys`, `.hotkeys-label`,
    `.languages` (+2 sub-rules), `.price-card` (+1 sub-rule),
    `.price-note`, `.price-featured` (×2), `.h3-small`,
    `.mini-row .mini-sub`. None appears in any HTML file or in
    `app.js`. The pricing page's live cards use `.price` /
    `.price-amount` / `.card`, not the removed rules.
  - **P1 — 2 dead HTML classes removed:** `section-tight`
    (features.html, never defined) and `pill-live` (demo.html AND
    index.html — the audit first found only demo.html; the test caught
    the second use in index.html's hero pill, so both were removed.
    Never defined — the pill already renders correctly via `.pill` +
    `.dot`).
  - **Already good (verified, now locked in by tests):** nav and footer
    byte-identical on all 11 pages; next-step band on all 10 content
    pages; sticky bar absent only where designed; every other class is
    used, JS-referenced, or whitelisted.
- **Method:** automated census (CSS selectors × HTML classes × JS
  references) + nav/footer byte comparison + fresh live re-verification
  after the fix.
- **Step 22 — mobile story player:** new classes `.story-segments`,
  `.story-seg`, `.story-caption`, `.story-nav`, `.story-prev`,
  `.story-next`, `.story-count` are all used in `index.html`; the
  `story-player` class on `<html>` is set by `app.js` (mode switch);
  `.is-done` is toggled by `app.js`. The player chrome is `display: none`
  by default and shown only under `html.story-player` at ≤860px — hidden
  by default is not dead. The snapshots stay in the HTML as the no-JS
  fallback. Census still green (test-step17 10/10).
- **Step 23 — fixed stage:** new classes `.is-hidden`, `.app-header-stack`,
  `.app-question-stack`, `.app-answer-stack`, `.app-answer-layer`,
  `.story-caption-stack`, `.story-caption-item`, `.app-start-label`,
  `.app-start-icon`, `.visually-hidden` are all defined in the Step 23
  block of `styles.css` and used in `index.html` or `app.js`
  (`.is-hidden` is toggled by `app.js` on the hero + story layers;
  `.app-answer-layer` is added to the coach node by `buildLayers()`).
  Removed as dead: the `[hidden]` rules for `.app-window-bar`,
  `.app-header`, `.app-thinking`, `.app-live-view`, `.app-home-view`,
  `.app-report-view`, `.app-context`, `.app-open-live`, `.hero-replay`,
  `.app-coach-view` and `.app-answer` (the last was already dead before
  Step 23 — nothing used it). Kept: `.app-badge[hidden]`,
  `.app-history[hidden]`, `.sticky-cta[hidden]`.
  Census still green (test-step17 10/10).
- **Step 23 — demo (same step):** new classes `.demo-question-stack`,
  `.demo-answer-stack` are defined in the Step 23 block and used in
  `index.html` + `demo.html` (the layers are built by `buildDemoLayers()`
  in `app.js`). Removed as dead: `.demo-answer li.skel` + the `@keyframes
  shimmer` (the skeletons are retired — the bullets are pre-rendered) and
  `.demo-next[hidden]` (the card uses `is-hidden` now). The `--skeleton`
  color token stays (COLOR.md lists it; test-step6/12 lock it). The
  `skel` whitelist entry is removed (nothing generates it any more).
  Census still green (test-step17 10/10).
- **Step 24 — hero (Replay + stats strip):** new classes `.hero-stats`,
  `.hero-stat` are defined in the Step 24 block and used in `index.html`
  (the `<dl>` with three value/label cells). Removed as dead:
  `.float-chips` + `.float-chips li` (and their `nth-child` delay rules)
  and the `@keyframes floaty` (the chips are replaced by the stats strip,
  which has no animation) and the reduced-motion `.float-chips li` rule.
  The `.hero-replay` class is unchanged (only its margin moved).
  Census still green (test-step17 10/10).
- **Step 25 — chips row + entrance:** new classes `.app-actions-scroll`,
  `.app-replay`, `.can-scroll-right`, `.can-scroll-left` are defined in
  the Step 25 block and used in `index.html` (the three chip rows) and
  `app.js` (the fade-edge listener toggles the mask classes; the hero
  IIFE toggles `is-hidden` on `#hero-replay`). New class
  `.app-question.is-landing` is toggled by the hero IIFE (`landQuestion`)
  and the story IIFE (`setQuestionLayer`); the `land` and `dot-land`
  keyframes are used by `.app-question.is-landing` and by
  `.app-answer li.is-new .app-dot` / `.demo-answer li.is-new .app-dot`.
  Removed as dead: `.hero-replay` (the standalone button below the
  window is gone — the Replay is now `.app-replay`, an icon-only button
  in the hero's action row). The `.app-actions` rule keeps its name but
  no longer wraps (the scroller handles overflow). Census still green
  (test-step17 10/10).
