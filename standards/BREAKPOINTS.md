# Interview Assistant — Breakpoints Standard (Step 15)

**Status:** in force from Step 15 (2026-11-14). Every media query in
`website/styles.css` and `website/app.js` must follow this standard.
`tests/test-step15.js` enforces it automatically.

**Basis:** the site's own measured behaviour (Steps 6–7 verified every
width from 320 to 1280px). Desktop-first CSS with mobile overrides;
one direction only.

## 1. The breakpoint set — closed, six widths

| Width | Name | Purpose | Blocks |
|-------|------|---------|--------|
| 440px | Very narrow phones | the app header sheds the level meter + tightens, so the longest status word keeps it one row with real headroom (Steps 29 + 30 fix-up; widened 400 -> 440 by the Step 37a fix-up) | 1 |
| 480px | Small phones | sticky bar goes compact (secondary button hidden, primary stretches) | 1 |
| 640px | Phones | the mobile breakpoint: stacked cards, single-column grids, wrapped controls | 15 |
| 860px | Tablet portrait | two-column grids go single-column, roadmap stacks, story layout + mobile player | 5 |
| 900px | Sticky text | sticky bar's text hides (the bar's content would crowd below this) | 1 |
| 1024px | Tablet landscape | mobile nav dropdown (hamburger), app-window 3D tilt off, wide layouts tighten | 4 |

No other width may appear in a media query. 480px and 900px are
single-rule, component-specific breakpoints — they stay, because folding
them into a neighbour would change verified behaviour without a visual
check to confirm the fit.

## 2. Rules

- **B1 — closed set:** every `max-width` is one of 440 / 480 / 640 /
  860 / 900 / 1024.
- **B2 — one direction:** `max-width` only. No `min-width` media
  queries anywhere.
- **B3 — blocks stay with their component:** media queries live next to
  the rule they override. Do not regroup them by breakpoint — that
  refactor has no visual benefit and high churn risk.
- **B4 — JS has no width breakpoints:** `app.js` uses `matchMedia`
  only for `prefers-reduced-motion`. Layout decisions live in CSS.
- **B5 — feature queries are separate:** `prefers-reduced-motion` (×2),
  `forced-colors` (×2) and `hover: hover` (×2 — the second pairs it with
  `pointer: fine`, Step 30, gating the app-window controls' hovers so
  they can never stick after a tap) are not breakpoints and are not
  counted in the set.

## 3. Audit log

- **Step 15** inventoried all 29 `@media` blocks. Findings:
  - **No violations.** The set was already closed (five widths) and
    each width has a clear purpose. JS has no width logic. No CSS
    changes were needed — the standard documents what the audit found
    and the test locks it in.
  - The 15 scattered 640px blocks stay scattered (rule B3): each sits
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
- **Step 23 — fixed stage:** one more 640px block (the table count is now
  15): the Start label and the adaptive badge are hidden at ≤640px, so
  the app header stays one row on every beat (the pill word changes
  length as the status changes — at 390px that flipped the header
  between 94px and 54px mid-play). The header is still two rows at
  320px, but the same two rows on every beat — constant per width, so
  nothing jumps. The grid-stack rules live outside any media block (the
  stage is fixed at every width). Enforced by `tests/test-step23.js`.
- **Step 29** adds the set's sixth width, 384px — the first new width
  since the set was closed, admitted because it is a *computed*
  threshold, not a device guess: live measurement (2026-11-15) showed
  the app header's longest status word ("Question detected", a 197.23px
  pill + 12px gap + 110.41px controls = 319.64px) fits the header
  content (viewport − 64px) only from a 383.64px viewport up, so every
  narrower phone — 360px, 375px — wrapped the header to two rows
  mid-play (+40px hero growth) whenever a long status word showed.
  Below 385px the header now sheds the 48px level meter (the real app
  sheds chrome as its window narrows — Step 21 research) and tightens
  its gaps and horizontal padding, which keeps the header one row for
  all eight status words at every width in the block (worst-case margin
  +18.36px at 320px, measured). This supersedes the Step 23 note above:
  at 320px the header is now one row on every beat (the window is a
  constant 746.59px there, was 786.59px). The block sits after the base
  header rules so its same-specificity overrides win by order (the
  Step 24 lesson). Enforced by `tests/test-step29.js`.
- **Step 30** adds no width breakpoint. It adds the set's second
  `hover: hover` feature query, paired with `pointer: fine`, gating
  the app-window controls' hover states (B5 updated: hover ×2). The
  pairing is the point: hover feedback must exist only where a pointer
  can actually hover, so a tap on a phone never leaves a stuck hover.
- **Step 30 fix-up** moves the shed threshold from 384px to 400px —
  the set's sixth width changes value, not count. Step 29's 383.64px
  threshold was computed from static pill measurements, which left
  the longest status word only ~4.36px of headroom at 390px; Step
  30's live verification (2026-11-16) caught the header wrapping to
  two rows at 390px during a real play ("Question detected" /
  "Preparing answer", header 54px -> 94px) — a margin that small is
  inside normal font-rendering variance, so it is not a safe margin.
  The shed block's rules are unchanged; at 400px the threshold now
  covers every width whose unshed margin would stay under ~35px,
  and widths above it (420px and up, margin ~34px and growing) keep
  the meter. New rule this adds: a header margin under ~15px at any
  width counts as a defect, even when a static measurement passes —
  margins are verified in live play, not only by setting words.
  Enforced by `tests/test-step29.js` (updated) and
  `tests/test-step15.js` (set updated).

- **Step 37a fix-up** moves the shed threshold from 400px to 440px —
  the set's sixth width changes value, not count. Step 37a added the
  minutes meter to the hero header; live verification (2026-11-16)
  measured the full header wrapping to two rows (46px -> 86px) across
  a 401-429px band: the compact treatment ended at 400px but the full
  header only fits from ~430px. The Step 30 fix-up's claim that
  "420px and up keep the meter" was true of the pre-meter header and
  is corrected here. At 440px the threshold covers the whole band
  with headroom, and widths above it keep the full header, meter
  included. Enforced by `tests/test-step29.js` and
  `tests/test-step15.js` (both updated).
