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
interactions): shimmer 1.2s, equalizer 1.1s, float 5s.

## 2. Easings — two curves

- **Entrances** (rise, reveal): `cubic-bezier(.2,.7,.3,1)` — fast start,
  gentle landing. One spelling, no spaces.
- **Everything else** (hovers, state changes): `ease`.

## 3. Keyframes — four, each with one job

| Name | Duration | Job |
|------|----------|-----|
| `rise` | 250ms | answer points appear (demo + hero mock — same duration) |
| `shimmer` | 1.2s | skeleton loading sweep |
| `eq` | 1.1s | waveform bars in the app mockup |
| `floaty` | 5s | floating chips on the hero |

## 4. Reduced motion — everything stops, content stays

- CSS: a global `@media (prefers-reduced-motion: reduce)` block kills
  **all** animations and transitions (`!important`) and sets
  `scroll-behavior: auto`.
- A second reduced-motion block resets the things the global kill cannot:
  `.reveal` to full opacity, `.app-window` tilt to `none` (the 3D
  `perspective(1400px) rotateY(-3deg)` mockup tilt).
- JS: `matchMedia("(prefers-reduced-motion: reduce)")` gates the
  demo/hero animation paths (3 checks). Content staging (points appearing
  one at a time) still runs — it is content, not motion — but with the CSS
  animation killed, points appear instantly.

## 5. JS timing — documented, not standardised

- Reveal stagger: 40ms between groups.
- Demo cadence: 450ms per point, 4200ms hold before cycling.
- These are content rhythms, not motion; they stay as-is.

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
- **Method:** full transition/animation inventory + reduced-motion
  coverage check + fresh live re-verification after the fix.
