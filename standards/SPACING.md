# Interview Assistant — Spacing Standard (Step 9)

**Status:** in force from Step 9 (2026-11-14). Every margin, padding and gap in
`website/styles.css` must follow this standard. `tests/test-step9.js` enforces
it automatically: any spacing value that is neither on the scale nor on the
exemption list fails the build.

**Basis:** Apple Human Interface Guidelines (8pt grid), Google Material
(4dp baseline grid), Microsoft Fluent (4px base). All three agree on the
same rule: spacing comes from one small scale, never from arbitrary numbers.

## 1. The scale — the only allowed spacing values

```
4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64 · 72 · 96
```

Every `margin`, `padding` and `gap` value must be one of these. No 6px, 7px,
9px, 10px, 14px, 18px, 22px, 36px — pick the nearest scale value instead.
(A 2px change is invisible on its own; the point is that the whole site
rhythms the same way, so nothing ever looks "a little off" next to
something else.)

## 2. Rules by relationship

| # | Relationship | Value | Notes |
|---|--------------|-------|-------|
| R1 | Section padding | 72px desktop · 64px mobile | `.section` |
| R2 | Hero padding | 72px top · 48px bottom (56px top mobile) | `.hero` |
| R3 | Hero → first content section | 48px total | page-hero bottom 8px + next section top 40px |
| R4 | In-section h2 above it | 48px desktop · 40px mobile | Step 8 rule |
| R5 | In-section h3 above it | 28px | Step 8 rule |
| R6 | Heading → content below | 12px | h1/h2/h3 margin-bottom |
| R7 | Eyebrow (label) → heading | 12px | `.eyebrow` |
| R8 | Paragraph → paragraph | 16px | `p` margin-bottom |
| R9 | Card padding | 28px large · 24px medium/small | `.card` 28 · `.lang-card`, `.vs-col` 24 · 3-col cards 24 |
| R10 | Card internals | icon→title 16px · title→body 8px · body→action 16px+ | `.icon`, `.card h3` |
| R11 | Compact node internals | icon→title 12px · title→body 8px | `.flow-node`, `.req-item`, `.trouble-card` |
| R12 | List item gap | 8px tight · 12px roomy | check-lists, answers, bullets: 8 · `.vs-list`, `.acc`: 12 |
| R13 | Inline marker → text | 8px | number chips, check marks, bullets beside text |
| R14 | Button padding | 12px 24px primary · 8px 16px small | `.btn`, `.btn-small` |
| R15 | Buttons in a row | 12px gap | `.cta-row` |
| R16 | CTA row above/below | 24px above · 12px below | `.cta-row` margin |
| R17 | Large block → large block | 24px | `.interrupt`, `.demo-next`, `.finder`, `.vs-grid`, `.lang-show` |
| R18 | Grid gaps | cards 20px · small cards 16px · two-col 32px · hero 56px · footer 32px | |
| R19 | Header | 64px tall · inner gap 12px · brand gap 8px · nav link padding 8px | |
| R20 | Footer | padding 56px top · 32px bottom · columns 32px · link rows 12px vertical (Step 11: raised from 8px for the 44px touch target) · bottom bar margin-top 40px, padding-top 20px | |
| R21 | Table cells | 12px 16px · stacked card 8px 16px · label→value 4px | |
| R22 | Form controls | fieldset 16px · pill 8px 16px · result box 20px · input 12px 16px | |
| R23 | Accordion rows | button 20px · panel bottom 20px · rows gap 12px | |
| R24 | Demo internals | body 20px · label→question 8px · question→answers 16px · status 12px · foot 16px 20px 20px | |
| R25 | Section intro (centered) | 32px below | `.demo-section-head` |

## 3. Icons — sizes and their spacing

| Icon | Size | Glyph | Spacing to next element |
|------|------|-------|-------------------------|
| Brand mark | 32px | 13px | 8px (brand gap) |
| Card icon | 44px, radius 12px | 22px | 16px below (R10) |
| File icon | 36px, radius 9px | 14px | 12px beside (`.inst-file` gap) |
| Number / check marker | 22px circle | 12px | 8px beside (R13) |
| Mini marker | 20px circle | 11px | 8px beside (R13) |
| Flow icon | 44px, radius 12px | — | 12px below (R11) |
| Sticky-bar close | 51px square (shared --sticky-control-h token with the buttons), radius 12px | 18px | 12px gap to the primary button (Step 28 fix-up) |
| Nav toggle | ~44px touch target | 16px | 12px 16px padding |

Rule: an icon never touches the text next to it — at least 8px beside it,
12–16px below it.

## 4. Exemptions (not spacing — do not "fix" these)

- `margin-top: 1px` on number chips / markers — optical alignment of a
  small circle against text, not a spacing decision.
- `scroll-padding-top: 84px` — functional: header 64px + 20px clearance.
- `.app-wave { gap: 3px }` — waveform bars are a graphic texture.
- `margin-top: -10px` on `::-webkit-slider-thumb` — geometry, not spacing:
  it centres the 24px thumb on the 4px track: (24 − 4) / 2 = 10px.
- Skeleton / progress heights (`46px`, `26px`, `10px`) — element heights,
  not spacing.
- Border widths (1px, 2px) and border-radius values.
- `body.cta-visible { padding-bottom: 96px }` — functional clearance for
  the fixed bar (bar ≈ 70px + 26px).
- **App-window depiction geometry (Step 83)** — inside the app-window
  depiction family (`.app-card`, `.app-window-body`, `.demo-body`,
  `.feat-mini-card` selectors), the real app's own values are exempt
  from the scale: 14px window-body inset, 10px gap between the
  QUESTION and ANSWER cards, and card padding 18px/14px (answer card
  20px/16px). Source: MainWindow.xaml (LiveBody margin 14,4,14,8;
  QuestionCard margin 0,0,0,10) and Theme.xaml (S.CardPadding 18,14).
  The owner's order (2026-11-23) is that the website's window matches
  the app's window exactly, so inside the window the app's form wins
  over the site scale. Enforced as a selector-scoped exemption in
  test-step9; pinned by test-step83.

## 5. Audit log

- **Step 8** found the heading rhythm defect (h2s with 0–28px above them)
  and fixed it with R4/R5.
- **Step 9** inventoried every margin/padding/gap in `styles.css` (916
  lines) against this standard. Findings:
  - **P0 — visibly wrong:** R3 hero→content was 32px, not 48px
    (`.page-hero + .section` top padding 24px → 40px).
  - **P1 — off-scale values standardised (112 replacements, 79 rules):**
    6px→8px, 7px→8px, 9px→8px, 10px→8px/12px, 14px→12px/16px, 18px→16px/20px,
    22px→20px/24px, 5px→4px, 3px→4px, 2px→4px, 26px marker→22px,
    footer link rows 4px→8px, small-card padding 22px→24px,
    `.pipe-list li` padding 14px→16px, `.flow-node` padding 18px→20px,
    timeline gutter 44px→40px (dot offset follows, dot stays centred on the
    line), badge/pill tags 4px 12px. The enforcement test itself caught 7
    more values the hand inventory had missed (skip-link, pill, badge,
    timeline) — that is why the standard is enforced by a test,
    not by eyeballing.
  - No "too much spacing" defects found. Clean components: hero, cards,
    grids, header height, footer frame, next-band, demo stage frame.
- **Step 11** (accessibility) raised three spacing values above this
  standard's earlier ones, because the 44px touch target outranks them:
  `.btn-small` padding 8px→12px vertical, nav links 8px→12px vertical,
  footer link rows 8px→12px vertical (R20 updated). It also added one
  exemption: the slider-thumb centring offset `margin-top: -10px`.
- **Method:** full CSS inventory + visual review of all 10 pages at
  320/360/390/414/430/768/1024/1280 (Step 8 captures) + fresh live
  re-verification after the fix.
- **Step 22 — mobile story player:** segments use a 4px gap and 12px 4px
  padding; the player layout uses a 16px gap; the caption heading has an
  8px bottom margin. All on the scale; no new values, no exemptions.
- **Step 23 — fixed stage:** no new spacing values. One exemption: the
  `.visually-hidden` live-region utility uses the standard `margin: -1px`
  offset (part of the visually-hidden recipe, not a spacing choice) — the
  -1px keeps the 1px box from shifting layout.

## Step 33 audit — the hero copy column's last element

The hero's trust line is the last element of `.hero-copy`. The base
`p` margin (R8, 16px) stacked on the grid row gap (R18, 32px), so
the rendered gap from the line to the app window measured 48px on
mobile. Rule: **a column's last element carries no bottom margin —
the container's gap or padding alone sets the separation.**
`.trust-line { margin-bottom: 0 }`; the measured gap is now the
grid's 32px exactly. The line itself is offer-only copy (Step 33,
from the hero-microcopy study of nine brands): trial terms in one
register, one line at 390px; the ethics sentence stays in the
privacy strip and the footer, never under the CTAs.
