# Interview Assistant — Breakpoints Standard (Step 15)

**Status:** in force from Step 15 (2026-11-14). Every media query in
`website/styles.css` and `website/app.js` must follow this standard.
`tests/test-step15.js` enforces it automatically.

**Basis:** the site's own measured behaviour (Steps 6–7 verified every
width from 320 to 1280px). Desktop-first CSS with mobile overrides;
one direction only.

## 1. The breakpoint set — closed, seven widths

| Width | Name | Purpose | Blocks |
|-------|------|---------|--------|
| 400px | Very narrow phones | the app header sheds the level meter + tightens, so the longest status word keeps it one row with real headroom (Steps 29 + 30 fix-up) | 1 |
| 480px | Small phones | sticky bar goes compact (secondary button hidden, primary stretches) | 1 |
| 640px | Phones | the mobile breakpoint: stacked cards, single-column grids, wrapped controls | 17 |
| 860px | Tablet portrait | two-column grids go single-column, roadmap stacks, story layout + mobile player | 5 |
| 900px | Sticky text | sticky bar's text hides (the bar's content would crowd below this) | 1 |
| 933px | Participant-unit threshold | the demo stage's band composition (Step 92: the folded strip's top row — participant unit and self tile as one shared box, the window hung below) holds until the desktop composition takes over — a computed threshold (Step 81 follow-up, 2026-11-22) | 1 |
| 1024px | Tablet landscape | mobile nav dropdown (hamburger), app-window 3D tilt off, wide layouts tighten, terms contents rail collapses to the sticky bar (Step 93) | 5 |

No other width may appear in a media query. 480px, 900px and 933px are
single-block, component-specific breakpoints — they stay, because folding
them into a neighbour would change verified behaviour without a visual
check to confirm the fit. (For 933px the neighbours were measured, not
assumed: folding down to 900px would leave the window overlapping the
participant frame by up to ~16px at 901–933px, and folding up to 1024px
would replace the verified desktop composition at 934–1024px.)

## 2. Rules

- **B1 — closed set:** every `max-width` is one of 400 / 480 / 640 /
  860 / 900 / 933 / 1024.
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
- **Step 81 follow-up (2026-11-22)** adds the set's seventh width,
  933px — admitted on the Step 29 rule: a *computed* threshold, not a
  device guess. The under-the-webcam staging centred the demo stage's
  app window on the bezel lens's axis at every ≥641px width and
  bottom-anchored the participant unit in the ≤860px band, but above
  860px the desktop top-left unit (172px frame, right edge 188)
  returned while the centred window was still too wide to clear it:
  measured window∩frame intersection 36.5px at 861px, 17px at 900px,
  shrinking 1:1 with the viewport until the call-main reaches 808px —
  last overlap at 933px, first fully-clear width 934px (window left
  edge 188.0 = the frame's right edge; from 950px the main caps at
  824px and the standing clearance is 8px). The Step 75 participant
  block (frame, label, wave, glyph fallback) therefore keeps the
  band's bottom-left anchor through 933px and the desktop composition
  resumes at 934px untouched; no other band rule follows it (in the
  extended range the unit's right edge, 100, already clears the
  window's left edge, ≥151.5, horizontally, so the base primed hug
  and the 860px head switches stand). Verified: window∩unit = 0 at
  861 / 900 / 933 / 934 / 935 / 950 / 1000px in the primed and
  complete states, and the 403 / 712 / 768 / 1440px geometry is
  unchanged. Enforced by `tests/test-step15.js` (set updated).
- **Step 93** adds no width. It adds a fifth component block at the
  admitted 1024px width: the Terms page's contents rail (the base,
  desktop-first layout) collapses at ≤1024px into the sticky contents
  bar (current-section label + Contents disclosure), per rule B3 the
  block sits with the `.doc` rules it overrides. The §1 table count
  for 1024px is corrected 4 → 5. The two suites that pin the count
  (test-step26, test-step59) are re-pinned with annotation; the set
  itself is unchanged and `tests/test-step15.js` passes untouched.
- **Step 95** adds no width. It adds one component block at the
  admitted 640px width, inside the Download page's `.dlx-*` section
  (the artifact spec stacks, the meanwhile band goes single-column),
  per rule B3 the block sits with the Step 95 rules it overrides.
  The §1 table count for 640px is corrected 15 → 16; the set itself
  is unchanged and `tests/test-step15.js` passes untouched.
- **Step 96** adds no width. It adds one component block at the
  admitted 640px width, inside the Pricing page's `.prx-*` section
  (the two plan cards and the cap stat blocks stack), per rule B3
  the block sits with the Step 96 rules it overrides. The §1 table
  count for 640px is corrected 16 → 17; the set itself is unchanged
  and `tests/test-step15.js` passes untouched.
