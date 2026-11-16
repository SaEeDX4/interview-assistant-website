# RADIUS — the shape standard

Owner's rule (Step 35, 2026-11-16): **buttons are rectangular
with a small rounding. No capsule / pill shapes — nothing whose
radius makes it a full circle or near-ellipse — on any button or
control, anywhere in the design system.** The reference shapes
are the app chips (8px) and the sticky-bar buttons (12px).

## The family

- **8px** — small controls (≤36px tall): the app chips, the app
  status pill, the app Start button, the Replay box, the send
  button, the adaptive badge, story segments, the site `.pill`,
  `.badge`, and the privacy strip's "never" chips.
- **12px** — large controls (≥44px tall): `.btn` everywhere
  (hero CTAs, funnel band, menu CTA), the sticky-bar buttons and
  its dismiss, `.chip`, `.radio-pill`, `.ethics-link`, and the
  segmented containers (`.mode-toggle`, `.seg`) whose inner
  segments stay square inside the clipped container.
- Panels and cards keep 12px (`--radius`); the app window's
  frame keeps 14px — that is the real app's window radius
  (fidelity), not a button shape.

## Exemptions (not buttons)

- Dots stay round (`border-radius: 50%`): the status dot, the
  answer bullet dots, the demo dots — a dot is a dot.
- Progress and meter tracks keep their rounded ends
  (`.meter-track`, `.meter-fill`, `.inst-progress`, the range
  slider tracks): a bar's fill is not a control's shape.

## History

Step 34 briefly moved the app Start button to the status pill's
14px (a capsule pairing). The owner rejected the capsule
direction the same day; Step 35 set both to 8px and swept every
999px control radius site-wide to this family. Enforced by
tests/test-step35.js.
