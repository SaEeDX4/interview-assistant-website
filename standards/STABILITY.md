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
  A row that appears (● ● ● thinking, the Replay button, the "Open Live
  Assistant" button, the Context line) stays in flow and toggles
  visibility — its space is reserved from the start.
- **S5 — the header is one row on every beat at ≤640px.** The pill word
  changes length as the status changes, and at ≤640px that flips the
  header between one and two rows mid-play (measured 94 → 54px while
  Listening). The real app sheds chrome below 580/640px, so the site
  does the same: the Start button shows its icon only (`.app-start-label`
  hidden at ≤640px; the pill word carries the state) and the adaptive
  badge is hidden (`.app-badge` hidden at ≤640px; the answer meta and
  the caption still say Concise). The header is 54px on every beat.
- **S6 — controls below a stage never move.** The caption is a stack of
  seven layers (one per beat, built from the steps) plus a
  visually-hidden live region, so the caption zone is as tall as its
  longest caption and the nav row below it is pixel-stationary. The
  Replay button is rendered hidden, not absent.
- **S7 — no fixed pixel heights, no JS measurement.** A fixed height per
  breakpoint is brittle against font loading (Inter is `display: swap`),
  zoom and user font-size settings; JS-measured `min-height` has the
  same fragility plus a flash before measurement and a resize listener
  to maintain. The grid computes the max itself. (Research: Apple pins
  a fixed-height stage and crossfades layered states; web.dev prescribes
  "replace the old content with the new content within a fixed size
  container"; Material 3 sizes the carousel container to its largest
  item; Fluent skeletons must match the final dimensions exactly.)
- **S8 — motion stays transform/opacity-only.** Bullets rise with
  `translateY + opacity`; beats crossfade. Never animate height, top or
  margin — those are layout animations (web.dev, MOTION.md).

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
