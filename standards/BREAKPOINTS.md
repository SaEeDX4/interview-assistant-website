# Interview Assistant — Breakpoints Standard (Step 15)

**Status:** in force from Step 15 (2026-11-14). Every media query in
`website/styles.css` and `website/app.js` must follow this standard.
`tests/test-step15.js` enforces it automatically.

**Basis:** the site's own measured behaviour (Steps 6–7 verified every
width from 320 to 1280px). Desktop-first CSS with mobile overrides;
one direction only.

## 1. The breakpoint set — closed, five widths

| Width | Name | Purpose | Blocks |
|-------|------|---------|--------|
| 480px | Small phones | sticky bar goes compact (secondary button hidden, primary stretches) | 1 |
| 640px | Phones | the mobile breakpoint: stacked cards, single-column grids, wrapped controls | 14 |
| 860px | Tablet portrait | two-column grids go single-column, roadmap stacks, story layout + mobile player | 5 |
| 900px | Sticky text | sticky bar's text hides (the bar's content would crowd below this) | 1 |
| 1024px | Tablet landscape | mobile nav dropdown (hamburger), app-window 3D tilt off, wide layouts tighten | 4 |

No other width may appear in a media query. 480px and 900px are
single-rule, component-specific breakpoints — they stay, because folding
them into a neighbour would change verified behaviour without a visual
check to confirm the fit.

## 2. Rules

- **B1 — closed set:** every `max-width` is one of 480 / 640 / 860 /
  900 / 1024.
- **B2 — one direction:** `max-width` only. No `min-width` media
  queries anywhere.
- **B3 — blocks stay with their component:** media queries live next to
  the rule they override. Do not regroup them by breakpoint — that
  refactor has no visual benefit and high churn risk.
- **B4 — JS has no width breakpoints:** `app.js` uses `matchMedia`
  only for `prefers-reduced-motion`. Layout decisions live in CSS.
- **B5 — feature queries are separate:** `prefers-reduced-motion` (×2),
  `forced-colors` (×2) and `hover: hover` (×1) are not breakpoints and
  are not counted in the set.

## 3. Audit log

- **Step 15** inventoried all 29 `@media` blocks. Findings:
  - **No violations.** The set was already closed (five widths) and
    each width has a clear purpose. JS has no width logic. No CSS
    changes were needed — the standard documents what the audit found
    and the test locks it in.
  - The 14 scattered 640px blocks stay scattered (rule B3): each sits
    next to its component.
- **Method:** full media-query inventory + JS width-logic check.
- **Step 19** found a real breakpoint bug the earlier widths had missed:
  the sticky header row (brand + 8 nav links + CTA, all `flex-shrink: 0` /
  `nowrap`) is a fixed ~1016px wide, so the page scrollWidth is a constant
  1040px for every viewport 861–1039px (measured: 139px overflow at 900px,
  39px at 1000px, 16px at 1024px, 0 at 1040px) — the CTA button slid
  off-screen on tablet-landscape / small-laptop widths. Fix: the mobile-nav
  dropdown block moved from 860px to 1024px (the hamburger now covers
  ≤1024px), and the nav-link padding tightened 12px 8px → 12px 4px so the
  desktop nav fits at 1025px (952px row vs 977px available). 860px stays in
  the set (three blocks still use it); 1024px gains the nav. No JS change.
  Enforced by two new regression checks in `tests/test-step15.js` and by
  the 900px + 1025px captures in `tests/review19.py`.
- **Step 22** found a second fixed-width overflow, this time from a grid
  track, not a flex row: at ≤860px `.story-layout` used
  `grid-template-columns: 1fr` (= `minmax(auto, 1fr)`), whose auto minimum
  is the widest snapshot's min-content — beat 3's app header, 436px
  (status pill + Concise badge + controls, nowrap) — so the track grew to
  435px and the page scrollWidth was a constant 451px at 390px (61px
  overflow) and at 420px (31px, the Z Fold7 cover width), measured live.
  Fix: `minmax(0, 1fr)` + `.story-steps { min-width: 0; }`, and the app
  header wraps (`flex-wrap: wrap`) instead of clipping. The same step
  added the mobile story player (one more 860px block, next to the story
  rules, per B3). The table counts are corrected here: 860px is 5 blocks,
  1024px is 4 (both were stale). The player needs to know the mode in JS;
  per B4 it reads the breakpoint from the CSS, not a width literal: the
  snapshots are `display: none` on desktop and `display: block` at ≤860px,
  so a snapshot's computed display IS the breakpoint (`isNarrow()`),
  re-read on resize (fold/unfold, rotate). Enforced by
  `tests/test-step22.js` and the live scrollWidth check at 390/420/320px.
