# Interview Assistant — Motion Standard (Step 14)

**Status:** in force from Step 14 (2026-11-14). Every `transition`,
`animation` and JS timing value in `website/styles.css` and
`website/app.js` must follow this standard. `tests/test-step14.js`
enforces it automatically.

**Basis:** Apple HIG (motion should be quick, purposeful, interruptible),
Material Motion (standard 250ms, short 150ms), WCAG 2.2 (2.2.2 Pause/Stop/
Hide, 2.3.3 Animation from Interactions, reduced-motion support).

## 1. Durations — three speeds, nothing else

| Speed | Duration | Use |
|-------|----------|-----|
| Micro | 150ms | hovers and state changes (buttons, chips) |
| Standard | 250ms | reveals, cards, chevrons, answer points |
| Slow | 300ms | panels that change layout (accordion rows, sticky bar) |

Named ambient animations keep their own durations (they are loops, not
interactions): shimmer 1.2s, meter 1.1s, pulse 0.9s, float 5s.

**Scoped exception (owner-approved 2026-11-22):** `--motion-4: 400ms`
exists for exactly one interaction — the Interviewer Spotlight flight
in the demo (enter 400ms, exit 300ms on the Standard/Slow token).
A person crossing the stage is the one motion allowed to take longer
than a panel; no other rule may use this token. This follows the
Step 24 scoped-exception precedent: named, single-purpose, pinned by
`tests/test-spotlight.js`.

## 2. Easings — two curves

- **Entrances** (rise, reveal): `cubic-bezier(.2,.7,.3,1)` — fast start,
  gentle landing. One spelling, no spaces.
- **Everything else** (hovers, state changes): `ease`.

## 3. Keyframes — six, each with one job

| Name | Duration | Job |
|------|----------|-----|
| `rise` | 250ms | answer points appear (demo + hero mock — same duration) |
| `land` | 250ms | the question lands (Step 25: fade + 6px rise + 0.92 scale) |
| `dot-land` | 150ms | a bullet's 7px dot lands first (Step 25: 0.6 → 1 scale) |
| `meter` | 1.1s | level meter in the status pill (gated by `.is-live`) |
| `pulse` | 0.9s | status dot + thinking dots (the app's 0.9s sine pulse) |
| `hw-enter` | 300ms | hero entrance (Step 72 pilot, How It Works): one pass on load, from the reveal floor (.85 opacity, 6px) to rest, staggered in 40ms steps |

The faithful hero (Step 21) reuses `rise` (points) and `meter` (level
meter, gated by `.is-live` — it runs only while audio is coming in, then
settles to 8% width) and `pulse` (the pill dot while listening/thinking,
and the ● ● ● thinking indicator). The Step 20 `eq` waveform keyframes
are retired with the waveform itself: the real app has no waveform.

## 4. Reduced motion — everything stops, content stays

- CSS: a global `@media (prefers-reduced-motion: reduce)` block kills
  **all** animations and transitions (`!important`) and sets
  `scroll-behavior: auto`.
- A second reduced-motion block resets the things the global kill cannot:
  `.reveal` to full opacity. (The `.app-window` tilt reset is gone with
  the tilt itself — the window is flat by design since Step 21.) Under
  reduced motion the scroll story also drops its pinning and scroll
  linking: the sticky window hides and each beat shows its static
  snapshot instead.
- JS: `matchMedia("(prefers-reduced-motion: reduce)")` gates the
  demo/hero/story animation paths (3 checks). Content staging (points appearing
  one at a time) still runs — it is content, not motion — but with the CSS
  animation killed, points appear instantly.

## 5. JS timing — documented, not standardised

- Reveal stagger: 40ms between groups.
- Demo cadence: 450ms per point, 4200ms hold before cycling.
- Hero player (Step 21, faithful): Start 300ms, Hearing audio 600ms,
  Transcribing 600ms, transcript 160ms/word, question detected +300ms,
  thinking 500ms, points 450ms apart, Replay 400ms after the last point.
  Plays once when the hero is first seen, then only on Replay — no
  infinite loop. The Step 20 timings (type 45ms/char, silence beat 700ms,
  Coach flip 400ms) are retired with the typing effect and the Coach bar.
- Scroll story (Step 21): a beat activates as it crosses the middle 10%
  of the viewport (IO centre band, `-40% 0px -40% 0px` — the middle 20%: a
  fast 150px scroll jump cannot skip a beat, since skipping needs a jump
  larger than step height + band height). Prepare stages
  tick 150ms apart; the first question reuses the hero cadence
  (transcript 160ms/word, thinking 500ms, points 450ms apart). Timed
  beats play once; revisiting a beat renders its final state at once.
- These are content rhythms, not motion; they stay as-is.

### Step 72 — motion tokens and primitives

The system above, named. Tokens live in `:root` (styles.css) and are
the same values the rules have always spelled literally; a rule may
use either form, never a third value.

| Token | Value | Use |
|-------|-------|-----|
| `--motion-1` | 150ms | micro responses (hover/focus colour, small state changes) |
| `--motion-2` | 250ms | standard responses and the scroll reveal |
| `--motion-3` | 300ms | entrances (the largest surface that may move) |
| `--motion-ease` | `cubic-bezier(.2,.7,.3,1)` | entrances and reveals; everything else uses `ease` |

Three primitives, and only three:

1. **Entrance** — once, on load, above the fold only. From the reveal
   floor (opacity .85, translateY 6px — never from invisible, never
   from below 6px: the Step 1 lesson is that the hero is never
   dimmed) to rest over `--motion-3` on `--motion-ease`, staggered in
   40ms steps (a delay is not a duration). Nothing moves unprompted
   after the entrance completes.
2. **Reveal** — sections entering the viewport, via the Step 1
   module (`.reveal` / `.is-visible`): opacity .85 → 1 and
   translateY 6px → 0 over `--motion-2`. JS adds the pre-state, so
   scripts-off and reduced-motion both show everything at rest.
3. **Respond** — user-initiated feedback only: colour, border and
   opacity changes over `--motion-1` with `ease`. No movement of
   layout, ever; a press may scale (Step 30 precedent).

What never animates: keyboard-initiated actions (stepping, accordion
keys), anything a user triggers many times a day, layout properties
(width, height, top, margins — transform and opacity only), and
nothing loops except the two named ambient loops (`meter`, `pulse`),
which depict the product's own live states. No bounce, no spin, no
marquee, no parallax. Reduced motion stills everything (§4) and no
primitive may gate content: with motion off or scripts off, every
element rests fully visible.

Pilot (Step 72): the primitives are applied on the How It Works page
only — `hw-enter` on its hero, the reveal extended to its trace
card, prediction card and boundary cards, respond on its verdict
links and its phone disclosure control. The verdict rows themselves
stay out of the reveal: the static-top discipline (Steps 68/71 —
no JS names the hero or verdict blocks) outranks a 6px fade, and
their respond primitive is CSS-only. Other pages adopt on the
owner's order, class by class, through the same Step 1 list.

## 6. Audit log

- **Step 14** inventoried every transition, animation and keyframe.
  Findings:
  - **P1 — two durations for one effect:** `rise` was .25s in the demo
    and .3s in the hero mock. Unified to .25s.
  - **P1 — off-standard durations:** buttons at .18s and chips at .2s.
    Both are micro interactions → 150ms.
  - **P1 — two spellings of one curve:** `cubic-bezier(.2,.7,.3,1)` vs
    `cubic-bezier(.2, .7, .3, 1)`. One spelling now.
  - **Already good (verified, now locked in by tests):** reduced motion
    is fully covered (global kill + tilt reset + JS gates); the four
    keyframes each have one job; ambient loops are the only long
    durations.
- **Step 20 — living hero:** the hero mockup plays one staged moment
  (question types itself → waveform listens → 700ms silence beat →
  3 points rise one at a time → Coach bar flips in), once when first
  seen, then only on Replay. Replaces the Step 1 animator, which looped
  the points forever. Waveform gated by `.is-live`; Coach bar hidden
  while playing (`.hero-playing`); reduced motion renders the full
  final state statically with no Replay button. Pause after all three
  points finishes the moment instead of restarting (no stranded final
  state without a Replay button).
- **Step 21 — faithful hero + scroll story:** the hero mockup plays one
  staged moment the way the real app behaves (transcript grows → question
  appears whole → ● ● ● thinking → 3 points stream in → Answer ready),
  once when first seen, then only on Replay. The waveform, the typed
  question, the silence beat and the Coach bar are gone — all four were
  inventions; the app has a 48×4 level meter (`meter` 1.1s), a live
  transcript, a thinking pulse (`pulse` 0.9s) and a Coach view that swaps
  the answer area. The scroll story pins the same window through seven
  beats (Prepare → Start → Q1 → interruption → Coach → Q2 → Stop/report),
  each activating at the viewport centre; timed beats play once. The
  window is flat now (radius 14, no tilt, no violet glow). Reduced motion
  renders the hero's final state statically with no Replay button, and
  the story falls back to static snapshots per beat. Pause after all
  three points finishes the moment instead of restarting (no stranded
  final state without a Replay button).
- **Method:** full transition/animation inventory + reduced-motion
  coverage check + fresh live re-verification after the fix.
- **Step 22 — mobile story player:** the player reuses the story's timed
  beats (Prepare stages 150ms, transcript 160ms/word, points 450ms apart)
  and the 250ms `rise`; a swipe changes the beat at once (no slide
  animation — the window's state swaps, the bullets rise as usual). The
  window has `touch-action: pan-y`, so vertical swipes scroll the page and
  only a horizontal swipe past 40px changes the beat (direction-locked, no
  scroll-jacking). Segment state changes use the 150ms transition. Reduced
  motion: every beat renders its final state at once, no timers — the
  player works fully by tap, swipe and keyboard.
- **Step 23 — fixed stage:** the reveals are transform/opacity only by
  construction (S8): bullets rise with `translateY + opacity`
  (`is-new`, 250ms), thinking is a pulsing opacity state, beat switches
  are visibility toggles — the stage never animates a layout property
  (no height/top/margin transitions, and the 250ms `rise` is unchanged).
  (Step 24 adds the one exception: the mobile player's 300ms height
  glide, tap-driven only — see below.)
  The demo's skeleton shimmer is retired with the skeletons (the
  bullets are pre-rendered now, so there is nothing to sweep): the
  keyframes are four (rise/meter/pulse/floaty), not five, and the
  ambient loops are meter 1.1s / pulse 0.9s / floaty 5s. Reduced motion
- **Step 24** retired `floaty` with the float chips (the hero stats strip
  has no animation): the keyframes are three (rise/meter/pulse), and the
  ambient loops are meter 1.1s / pulse 0.9s. It also adds the one
  height transition in the whole site: on the mobile story player only,
  `html.story-player .story-window { transition: height .3s
  cubic-bezier(.2,.7,.3,1); }` — the 300ms "Slow" duration on the
  standard entrance curve. The JS freezes the window at the old height,
  swaps the beat, measures the new height, and animates to it, then
  clears the inline height; a tap within 500ms makes the change
  CLS-exempt, and a glide is not a jump. The desktop scroll story has
  no height transition (its stage stays fixed).
- **Step 25** makes the question/answer arrival more beautiful without
  touching fidelity: E1 — the question lands with Material's fade-through
  (`land`: opacity 0→1, translateY 6px, scale 0.92→1, 250ms, the one
  entrance curve) instead of popping in whole; the question still appears
  whole, same text, same instant. E2 — the thinking dots crossfade out
  over 150ms (`.app-thinking` opacity transition) as the first bullet
  lands, instead of vanishing instantly (the Lottie typing-to-message
  handoff). E3 — each bullet's 7px dot lands first (`dot-land`: scale
  0.6→1 in 150ms) while its words rise 250ms. All three are
  transform/opacity only, so no height ever moves; the 450ms bullet
  stagger, the 250ms rise, the 0.9s dot pulse and the transcript's
  word-by-word growth are unchanged. E5 (a highlight sweep on the
  question) was held back — the only fidelity departure. Reduced motion
  is unchanged: every beat renders its final state at once, no timers,
  and the layer stacks make that free — the finals are already in the
  DOM. Enforced by `tests/test-step25.js` (27 checks) and
  `tests/test-step14.js` (land 250ms, dot-land 150ms).
  is unchanged: every beat renders its final state at once, no timers,
  and the layer stacks make that free — the finals are already in the
  DOM. Enforced by `tests/test-step23.js` and the sim (35 checks,
  desktop / mobile / reduced).
- **Step 30 — control feedback + the Replay turn:** the hero's new real
  controls follow the interaction research (M3 state layers, Fluent,
  Apple HIG): hover and pressed feedback is colour/opacity only, plus a
  press scale (.96 chips, .92 Replay/send) at 150ms on the standard
  curve; hovers are gated behind `(hover: hover) and (pointer: fine)`
  so they cannot stick after a tap. Replay's glyph takes one full turn
  (a 300ms transform transition, -360deg) when clicked — an activation
  cue in the SF Symbols discrete-effect family — never on hover, and
  the reduced-motion blanket rule still kills it. No new keyframes;
  the variant reveal reuses rise/dot-land and the 300ms height glide.
- **Step 32 — the menu morph and entrance:** the nav toggle's two
  bars morph into an × with a 300ms transform transition on the
  standard curve (Apple's two-line pattern — no middle line to
  fade, so the transformation reads as one motion). The menu panel
  fades/slides 250ms; its links rise with a 40ms stagger expressed
  as `transition-delay` under `.is-open` only (a delay is not a
  duration — the 150/250/300 duration rule is untouched — and
  keeping delays off the closed state makes the close a single
  unstaggered fade). The reduced-motion blanket rule kills all of
  it: the icon snaps, the panel appears at once.
- **Step 72 — tokens, primitives, one new keyframe:** the duration
  scale and the entrance easing are named as `:root` tokens
  (`--motion-1/2/3`, `--motion-ease`); the three primitives
  (entrance / reveal / respond) and the never-list are defined in
  §5. One keyframe added: `hw-enter` (300ms, the How It Works hero
  entrance — from the .85/6px reveal floor, 40ms stagger steps).
  The reveal primitive's target list gains the How It Works pilot
  classes in the Step 1 module; the verdict links and the phone
  disclosure control take 150ms colour transitions. No duration,
  easing or loop outside the existing standard; the reduced-motion
  blanket rule stills all of it, and no primitive gates content.
