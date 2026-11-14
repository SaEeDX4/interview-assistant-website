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
| 860px | Nav / tablet portrait | mobile nav dropdown, two-column grids go single-column, roadmap stacks | 4 |
| 900px | Sticky text | sticky bar's text hides (the bar's content would crowd below this) | 1 |
| 1024px | Tablet landscape | app-window 3D tilt off, wide layouts tighten | 4 |

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
