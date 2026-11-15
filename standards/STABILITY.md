# STABILITY.md — the fixed stage

> **The rule:** an animated app window is a *stage*, not a content-sized
> card. Every state it can show is pre-rendered as a layer in one grid
> cell, hidden with `visibility` (never `display`), and revealed with
> opacity/transform only. The stage is always as tall as its tallest
> state, so nothing below it — arrows, counter, Replay, pills, the next
> card — ever moves.

## Why

Saeed's report (Step 23, 2026-11-15, phone only): in the story player
every beat has a different height, so the arrows and the counter jump up
and down on every tap; in the hero, the box grows as the answer streams
in and pushes everything below it down. Measured live before the fix
(real browser, 390px):

| What moves | Before | After |
|---|---|---|
| Story window height, beats 0–6 | 338–694px (range 356px; 489px at 320px) | tallest beat, constant |
| Story nav row (‹ › + counter) | rides the window: 356px range at 390px | never moves |
| Hero window, play start → Answer ready | 601.8 → 682.5px (+80.7px, all in the answer card) | final height from the first frame |
| Hero pills below the window | +139.8px down by Answer ready (window + Replay appearing) | never move |
| Hero header while Listening | 94 → 54px (the pill word flips the wrap) and back | one row, always |
| Demo window, sample clicked → 3 points ready | +170.0px (the card below rides it) | fixed the same way (see below) |

The root cause in every case is the same: **the stage's height was a
function of whichever content was currently visible**, instead of a
function of the tallest content it will ever show. That is Cumulative
Layout Shift by construction — and a tap-driven swap is still a visible
jump even when the metric excludes it (web.dev excludes shifts within
500ms of an input; the user still sees the arrows jump).

## The standard

- **S1 — grid-stack the stage.** All states go in one grid cell:
  `.stage { display: grid; }` and every layer `grid-area: 1 / 1`. The
  cell is as tall as its tallest layer, at every width, zoom and font —
  the browser computes the max, no number is written down.
- **S2 — hidden means `visibility: hidden`, never `display: none`.**
  `display: none` collapses a layer out of the cell and defeats S1;
  `opacity: 0` alone leaves it focusable and screen-reader-visible.
  `visibility: hidden` keeps the space, removes it from focus order and
  from the accessibility tree. The class is `.is-hidden`.
- **S3 — pre-render, then reveal.** Streaming content (bullets, the
  transcript, the Prepare stages) is built once, hidden, and revealed
  with opacity/transform only (`is-new` rise, `is-pending` fade). Nothing
  is appended, and no text is swapped in, during a play — the stage is
  at its final height before the first frame of the animation.
- **S4 — reserve the small slots.** A line that grows (the italic live
  transcript) reserves its line: `.app-transcript { min-height: 1.5em; }`.
  A row that appears (● ● ● thinking, the "Open Live Assistant" button,
  the Context line) stays in flow and toggles visibility — its space is
  reserved from the start. (Step 25: the Replay button now sits in the
  action row as a 44px icon; it is `is-hidden` until the moment plays,
  so it reserves its 44px from the start and the row is 44px tall at
  every stage — the row never grows when it appears. The stats strip
  below the window moves up by the standalone button's height.)
- **S5 — the header is one row on every beat at ≤640px.** The pill word
  changes length as the status changes, and at ≤640px that flips the
  header between one and two rows mid-play (measured 94 → 54px while
  Listening). The real app sheds chrome below 580/640px, so the site
  does the same: the Start button shows its icon only (`.app-start-label`
  hidden at ≤640px; the pill word carries the state) and the adaptive
  badge is hidden (`.app-badge` hidden at ≤640px; the answer meta and
  the caption still say Concise). The header is 54px on every beat.
  (Step 24 correction: the Step 23 badge rule was a bare `.app-badge`
  inside the media query — same specificity as the base `.app-badge`
  rule, but earlier in the file, so the base rule's `display:
  inline-flex` won and the badge showed on the Adapt beat at 390px,
  wrapping the header to 2 rows (+40px — caught by the Step 23 live
  verification, which found the window 755.8 → 795.8px on beat 4 only).
  The rule is now `.app-header .app-badge` (0,2,0), which wins
  regardless of order. A media-query rule that must beat a base rule
  needs the higher specificity, not just the later position.)
- **S6 — controls below a stage never move — except on the mobile
  player, where they glide.** The caption is a stack of seven layers
  (one per beat, built from the steps) plus a visually-hidden live
  region, so the caption zone is as tall as its longest caption and the
  nav row below it is pixel-stationary. The Replay button is rendered
  hidden, not absent. (Step 24: on the mobile tap/swipe player the
  window glides to each beat's height, so the caption + nav glide with
  it — smoothly, over 300ms, never a jump. On the desktop scroll story
  the stage is fixed and the controls never move at all.)
- **S7 — no fixed pixel heights, no JS measurement.** A fixed height per
  breakpoint is brittle against font loading (Inter is `display: swap`),
  zoom and user font-size settings; JS-measured `min-height` has the
  same fragility plus a flash before measurement and a resize listener
  to maintain. The grid computes the max itself. (Research: Apple pins
  a fixed-height stage and crossfades layered states; web.dev prescribes
  "replace the old content with the new content within a fixed size
  container"; Material 3 sizes the carousel container to its largest
  item; Fluent skeletons must match the final dimensions exactly.)
- **S8 — motion stays transform/opacity-only — except one deliberate
  height glide, tap-driven only.** Bullets rise with `translateY +
  opacity`; beats crossfade. Never animate height, top or margin — those
  are layout animations (web.dev, MOTION.md). The single exception
  (Step 24): on the mobile story player, and only there, the window's
  height glides 300ms (the standard curve) to the new beat's height when
  the user taps, swipes, or arrows to another beat. A tap-driven change
  within 500ms of the input is CLS-exempt (web.dev), and a glide is
  continuous motion the eye can track — not the jump this standard was
  written to kill. The desktop scroll story never glides: a height
  change mid-scroll would count as layout shift and feel broken, so it
  keeps the fixed stage. Reduced motion never glides (instant render).

## Where it applies

| Stage | Mechanism |
|---|---|
| Hero window | 3 bullets built once at load, hidden; thinking + Replay toggle visibility; transcript reserves one line; Start is icon + label |
| Story window | Header stack (home bar + live header); body stack (Home / Live / Report views); question stack (5 layers) + answer stack (5 layers, Coach is layer 3); context + thinking toggle visibility; "Open Live Assistant" toggles visibility |
| Story caption | 7 layers built from the steps + visually-hidden live region (aria-live="polite") |
| Demo window | Same pattern (pre-rendered bullets); the tallest-sample reserve is measured separately — see below |

## The trade-off, honestly

A short beat shows empty window below its content: at 390px the Report
beat carries ~356px of empty window (its card ends at 338px, the stage
is 694px). That is the price Apple pays (a pinned stage is 100vh even
for one line) and Tesla pays (a short message still fills a viewport).
It reads as intentional because the window is a device frame — and it
is faithful: the real app is a fixed 720×560 window whose short views
have the same empty space. What it must never look like is a bug: the
content stays top-aligned, exactly as in the real app.

(Step 24: the mobile player no longer pays this price — the window
glides to each beat's natural height, so there is no void at all on a
phone. The desktop scroll story still pays it: its stage stays fixed
at the tallest beat, and the void there is the honest cost of a stage
that never moves while scrolling.)

## What this does not fix

- The transcript is capped at one line by measurement (19.5px at 390px
  and 1920px): it is one short sentence. If a future transcript grows
  to two lines, the reserve must grow with it.
- At 320px the header is two rows on every beat (the pill + icon-only
  controls still exceed 256px) — constant per width, so nothing jumps,
  but the header is taller there by design.

## Demo — measured and fixed

The demo page streams the same way (+170px measured). Its fix is the
same pattern, with one difference: the demo has 10 samples × 2 modes,
so it stacks 22 answer layers (10 samples × answer/coach + 2 fallback
for typed questions) and 11 question layers (10 samples + fallback).
Measured live (browser, demo.html):

| Sample | Final #demo height at 390px |
|---|---|
| A conflict with a coworker (tallest, 290 chars of bullets) | 1860.9px |
| Why should we hire you? | 1806.3px |
| What salary are you expecting? | 1799.3px |
| Tell me about yourself | 1744.7px |
| Biggest weakness? | 1706.9px |
| حدّثني عن نفسك (shortest, 130 chars) | 1559.9px |

Range across the 10 samples: 301.0px at 390px. Tallest sample at
other widths: 2312.5px at 320px, 936.6px at 1920px (the grid computes
the max at every width — no number is written down). The demo window
is now always the tallest sample's height, on both pages (the home
page's demo is the same component, wider: 343px vs 301px).

The +48px gap variant is exonerated: it was never the demo. The
re-run proved both click paths end at exactly the same place (demo
height 1358.8px, gap 24.0px in every final state); the 48.0px was the
story Prep window's delayed growth pushing the whole demo section down
— the growth Step 23 already fixed (the "Open Live Assistant" button
now reserves its space). The sample tag is exonerated too: it lives
inside #demo, is always visible, and its height never changes.

The skeletons are retired with the fix: they were 46px bars standing in
for multi-line 22px bullets, so they under-reserved by ~170px. The
shimmer keyframe goes with them (MOTION.md: four keyframes now, not
five). The sample tag and the next-step card switch from `hidden` to
`is-hidden` (their space is reserved; the card appears ~1.2s after load
and used to push the interrupt card down). The interruption simulator
stacks its 3 lengths (Normal / Concise / Rapid) the same way.

## Enforcement

- `tests/test-step23.js` — 19 checks: the mechanism, the header/body/
  question/answer/caption stacks, the hero pre-render, the transcript
  reserve, the ≤640px header rules, no `.hidden` toggles on the
  converted elements, appends only in the builders (init), the demo
  stacks + layers + tag/next-card reserves + int simulator, the
  standard doc, and the demo sim's existence.
- `tests/sim-step22.js` — the DOM-shim simulation now models the layer
  stack (35 checks across desktop / mobile / reduced): layers built
  once (5 question, 5 answer, 7 caption), bullets pre-rendered hidden
  (9 total), exactly one caption item visible per beat, stacks never
  rebuilt on a beat switch.
- `tests/sim-step23-demo.js` — the demo sim (17 checks across animated /
  reduced): 11 question + 22 answer + 3 int layers built once, the
  static tell content adopted as layer 0, bullets staged one at a time
  (1 of 3 mid-stream), sample switch + coach toggle + typed fallback +
  interrupt lengths all render to their final states, reduced motion
  renders everything at once.
- `tests/test-step24.js` — the hero fix (Replay centred, stats strip,
  float chips + floaty retired) and the story glide: the player-mode
  display:none rules (views + headers only — the question/answer stacks
  stay grid-stacked, the caption stack stays fixed), the 300ms height
  transition on the standard curve, the glide in `app.js` (measure →
  freeze → animate → clear, token-guarded, gated on player + motion),
  and the ≤640px badge rule outranking the base rule.
- `tests/sim-step22.js` — the story sim also models the glide (mobile
  mode): the window's height is the visible view's (home 425 / live
  690 / report 338 at 390px), a beat change sets the explicit height to
  the new view's and clears it after the transition, and the desktop
  mode never sets an inline height.

## Audit — Step 23 (2026-11-15)

- Research: Apple (pinned stage + layered crossfades), Google (web.dev
  fixed-size container + Material 3 large-item carousel), Tesla
  (viewport-sized stage + copy discipline), Microsoft (Fluent skeleton
  must match final dimensions), streaming-chat UIs (pre-measure, append
  never replace). Recommendation adopted: grid-stack, not fixed heights.
- Measurement: hero +80.7px, header dip 40px, Replay +47px, story nav
  range 356px (390px) / 489px (320px), demo +170px, transcript 1 line.
- Fix: header stack, body stack, question + answer stacks, caption
  stack + live region, hero pre-rendered bullets, transcript reserve,
  Start icon-only + badge shed at ≤640px, thinking/Replay/open-live/
  context on visibility. No `.hidden` toggles remain on any element
  whose height affects the stage (badge + history keep `hidden`: they
  do not change any row's height).
- Tests: step23 10/10; full suite 250+ (baseline 250, step23 adds 10);
  sim 35/35.
- **Demo (2026-11-15, after the follow-up measurement):** tallest
  sample 1860.9px at 390px / 2312.5px at 320px / 936.6px at 1920px;
  range 301px at 390px. Fix: 22 answer layers + 11 question layers,
  skeletons + shimmer retired, tag + next-step card on visibility, the
  interruption simulator stacks its 3 lengths. The +48px gap variant
  was a timing artefact of the story Prep growth (already fixed) — not
  the demo, not the sample tag. Tests: step23 now 19 checks (5 demo +
  the demo sim); full suite 269; sims 35 (story) + 17 (demo).

## Audit — Step 24 (2026-11-15)

- **Hero (Saeed's screenshot 1):** Replay sat alone, right-aligned
  below the window; the three pills wrapped 2+1 at 390px. Research:
  YouTube/Apple put replay on the frame, Material puts chips on one
  scrollable line, Tesla puts key numbers in a one-line stats row.
  Decision: Replay centred below the window; the facts become a
  Tesla-style stats strip (three equal columns, value over label,
  dividers). Overlay rejected (the faithful window has no free corner);
  scrollable chips rejected (hides "30-min free trial" behind a swipe).
  Float chips + the floaty keyframe retired.
- **Story void (Saeed's screenshot 2):** the fixed stage left up to
  356px of empty window on short beats. Research: web.dev's CLS guide
  exempts tap-driven changes within 500ms; a glide is not a jump.
  Decision: the mobile player glides the window's height 300ms to each
  beat's natural height (inactive views + headers display:none in
  player mode only; question/answer stacks stay grid-stacked so a
  timed play never grows the window mid-play; caption stack stays
  fixed). Desktop keeps the fixed stage. Vertical centring rejected
  (the real app is top-aligned).
- **Badge bug (Step 23 live verification):** the story player shifted
  +40px on the Adapt beat only (window 755.8 → 795.8px at 390px).
  Cause: the ≤640px `.app-badge { display: none; }` rule was overridden
  by the later base rule (`display: inline-flex`, same specificity).
  Fix: the media-query rule is now `.app-header .app-badge` (0,2,0).
  Regression tests in step23 + step24.
- Tests: step24 (hero + glide + badge); full suite 281+; sims 35
  (story, incl. the glide) + 17 (demo).

## Audit — Step 25 (2026-11-15)

- **Chips wrap (Saeed's screenshot, 03:03):** Regenerate alone on row 2
  at 390px. Research: Material documents the single-line ChipGroup +
  HorizontalScrollView (its own illustration shows chip 4 partly
  visible — the peek); Apple HIG says partial content at the edge is the
  scrollability signal; NN/g calls the peek the strong cue (dots weak,
  arrows easy to miss) and budgets 3–4 steps to the last item — here it
  is one swipe. Compaction measured impossible (509px of chips + Replay
  into 326px; the best realistic cut still left 104px over). Decision:
  the five chips live in a one-line scrollable strip with a 32px fade
  edge that appears only where more content lies (a ~10-line listener
  toggles the mask classes; the scrolling itself is pure CSS), and the
  pinned control at the row's right end (Replay in the hero, history in
  the story/demo) is a sibling of the scroller, never inside it. The
  row is 44px tall from the start (the Replay reserves its 44px via
  `is-hidden`); the chips are `flex: none`, so they never shrink or
  clip; the scroller's width changing (when the history appears) moves
  no chip — they are left-aligned in the strip, only the visible
  portion changes. A balanced 2-row grid was the fallback (never 4+1).
- **Entrance (Saeed: "very, very stunning"):** the question popped in
  whole and the thinking dots vanished instantly. Research: Material
  Fade/Fade-through (92% → 100% scale), Shared axis, Emphasized
  Decelerate; Fluent fades large elements and staggers large sets, and
  keeps motion constrained to the element in focus; web.dev: opacity /
  transform only. Decision: E1 — the question lands (fade + 6px rise +
  0.92 scale, 250ms, the one curve); E2 — the dots crossfade out 150ms
  as the first bullet lands; E3 — each bullet's dot lands first (0.6 →
  1 in 150ms). All transform/opacity only; the stagger, the rise, the
  0.9s pulse and the transcript are unchanged. E5 (a highlight sweep on
  the question) held back — the only fidelity departure.
- **Replay (Saeed):** the standalone button below the window is gone;
  only the ↻ icon sits at the right end of the hero's action row, and
  the stats strip sits directly under the window.
- **Step 27 (Saeed, phone):** Replay's visible box is 36×30 (chips' height,
  send button's width) inside its 44×44 button, so the action row reads as
  one clean 30px line; the row stays 44px tall, so no hero height moves.
  The sticky bar's dismiss is an in-flow flex item with a 12px gap and the
  bar's button radius is 12px (was an absolute × at 0px from a 999px pill).
  The ethics strip is rebuilt as a "three nevers" trust block (eyebrow +
  headline + icon chips + link as a tonal button).
- Tests: step25 (27 checks: chips + fade + Replay + entrance); full
  suite 319; sims 41 (story, incl. 2 entrance checks) + 17 (demo).
