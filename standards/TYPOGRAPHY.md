# Interview Assistant — Typography Standard (Step 10)

**Status:** in force from Step 10 (2026-11-14). Every `font-size`,
`line-height`, `letter-spacing` and `font-weight` in `website/styles.css`
must follow this standard. `tests/test-step10.js` enforces it automatically.

**Basis:** Apple Human Interface Guidelines (17pt body, -0.02em display
tracking), Google Material Type Scale (4px-aligned sizes, 1.5–1.6 body
leading), Microsoft Fluent (single type ramp, one weight per role).

## 1. The type scale — the only allowed font sizes

```
11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 22 · 24 · 28 · 30 · 32 · 40 · 44 · 48 · 56 · 64 · 72
```

(clamp() endpoints must also be on this scale.)

## 2. Rules by role

| # | Role | Size | Weight | Line-height | Tracking | Notes |
|---|------|------|--------|-------------|----------|-------|
| T1 | Display h1 (hero) | clamp(44px, 6vw, 72px) | 800 | 1.04 | -0.03em | the one display exception |
| T2 | Page h1 | clamp(32px, 4.4vw, 44px) | 800 | 1.04 | -0.02em | never bigger than the hero h1 |
| T3 | H2 | clamp(30px, 3.6vw, 40px) | 700 | 1.12 | -0.02em | |
| T4 | H2-small (steps, platform, interrupt) | 24px | 700 | 1.12 | -0.02em | |
| T5 | H3 | 22px | 600 | 1.3 | 0 | |
| T6 | H3-small (finder result) | 20px | 600 | 1.3 | 0 | |
| T7 | Questions / lead | 19px | 600 | 1.4 | 0 | demo/app questions, `.lede` is 19px/1.6 |
| T8 | Body | 17px | 400 | 1.65 | 0 | the base; Apple uses 17px too |
| T9 | Body-small (muted, secondary) | 15px | 400 | 1.6 | 0 | card text, lists, results |
| T10 | Small | 14px | 400 | 1.5 | 0 | footnotes, status, metadata |
| T11 | UI | 13px | 400–600 | 1.5 | 0 | chips, inputs, small controls |
| T12 | Labels (uppercase) | 12px | 700 | 1.5 | +0.08em | eyebrow, demo/app labels, lang tags |
| T13 | Micro tags | 11px | 700 | 1.4 | +0.06em | `.mini-q .tag` |
| T14 | Price | 44px | 700 | 1.12 | -0.02em | `.price-amount` |
| T15 | Markers (number chips) | 12px | 700 | 1 | 0 | 22px circles |
| T16 | Controls (buttons, toggles) | 13–17px | 600 | 1 | 0 | single-line, no wrapping |

## 3. Weights — only loaded weights

Inter is self-hosted as a variable font (`website/fonts/inter-latin.woff2`
+ `inter-latin-ext.woff2`, weights 100–900, `font-display: swap`; Step 18).
The stylesheet must use **only** weights 400–800. (Step 10 found `650` ×19
and `750` ×1 in the CSS — weights the old Google Fonts URL never listed, so
browsers round or synthesise them and the rendered weight is unreliable
across browsers. All mapped to 600 / 700, which is what browsers were
already rendering.)

**The app window is the exception:** the `.app-window` depictions (hero,
scroll story, demo bullets/coach) render in the Segoe UI stack
(`"Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif`) — the real
app's font (Step 21). Its sizes still follow the scale (question 15,
answer 19, coach keywords 22; the demo panel uses the real 17/22 at its
~720px width) and its weights stay in 400–800. Site text everywhere else
stays Inter.

## 4. Line-height — one value per role

```
1     controls (single-line buttons, toggles, close icons)
1.04  display h1
1.12  h1 / h2 (base heading rule)
1.3   h3
1.4   questions, mini-bullets
1.5   UI text (13–14px)
1.6   body-small (15px)
1.65  body (17px)
```

## 5. Letter-spacing — one value per role

```
-0.03em  display h1 only
-0.02em  h2 / price
 0       everything else by default
+0.04em  keyword emphasis (.coach-keys)
+0.06em  micro tags (11px)
+0.08em  uppercase labels (12px)
```

## 6. Line length — reading text

No reading-text block wider than **68ch** (`.lede` 56ch, `.section-intro`
68ch, `.next-band p` 60ch). Step 10 found `.honest-strip p` at **100ch** —
a full-width paragraph far too long to read comfortably — fixed to 68ch.

## 7. Hierarchy and case

- Exactly **one `<h1>` per page**; no skipped levels (h3 only under h2).
- Headings in **sentence case**; uppercase only via CSS `text-transform`
  on labels (eyebrow, tags, status), never in the content itself.
- Numbers, prices and minutes stay consistent site-wide (audited Step 7).

## 8. Audit log

- **Step 10** inventoried every font-size / line-height / letter-spacing /
  font-weight in `styles.css`. Findings:
  - **P0 — visibly wrong:** `.honest-strip p` line length 100ch → 68ch.
  - **P0 — unreliable weights:** `650` (19× incl. 4× `font:` shorthand)
    and `750` (h2) are not in the loaded font URL → mapped to 600 / 700.
  - **P1 — off-scale sizes standardised:** 11.5→12, 12.5→12, 13.5→14,
    14.5→15, 15.5→15, 17.5→17 (terms doc body), 26→24 (language arrow),
    page-hero h1 clamp max 46→44px (hierarchy: never bigger than the hero).
  - **P1 — line-height:** 1.55→1.6 (demo answers, language answers).
  - **P1 — tracking:** .06/.10/.12em → .08em (all uppercase labels);
    .01em/.02em → 0 (negligible values on the app title and brand mark).
- **Method:** full CSS inventory + heading census (1 h1 per page, all
  sentence case) + fresh live re-verification after the fix.
- **Step 18** self-hosted Inter: the Google Fonts stylesheet link (render-blocking,
  ~760ms per Lighthouse) is gone from all 11 pages; the variable font is served
  from `website/fonts/` (latin 71KB + latin-ext 130KB, `font-display: swap`, latin
  preloaded). Latin + latin-ext cover every Inter glyph the site uses; arrows,
  checkmarks and Arabic/Persian fall back to system fonts exactly as before.
- **Step 22 — mobile story player:** segment labels 11px/600, caption
  heading 20px, counter 13px, nav arrows 20px — all on the scale. No new
  sizes, weights, line-heights or letter-spacing; the caption paragraph
  reuses the body text.
