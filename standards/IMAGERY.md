# Interview Assistant — Imagery Standard (Step 16)

**Status:** in force from Step 16 (2026-11-14). Every image and visual on
the site must follow this standard. `tests/test-step16.js` enforces it
automatically.

**Basis:** the site's honesty rule (Saeed: everything must be real) —
no fake screenshots, no stock photos, no invented product imagery.

## 1. What imagery the site has — and what it does not

| Asset | Spec | Role |
|-------|------|------|
| `og-image.png` | 1200×630 PNG, 84KB | social sharing card (the only raster image) |
| `favicon.svg` | 64×64 SVG, accent bg + dark "IA" | browser tab / bookmark icon |
| CSS mockups | pure HTML/CSS | the app window, pipeline, data-flow, installer, timeline — every in-page visual is a built mockup, not a picture of the app |
| Nothing else | — | no `<img>` tags, no photo backgrounds, no stock |

## 2. Rules

- **I1 — og-image:** exactly 1200×630 (the Open Graph standard size),
  PNG, under 200KB, referenced by absolute URL in every page's
  `og:image` + `twitter:image`.
- **I2 — favicon:** SVG, 64×64 viewBox, accent background with dark
  "IA" — the same mark as the site header. Referenced from every page.
- **I3 — no photos, no fake screenshots:** the product has no published
  installer and no public screenshots yet, so the site shows none. The
  CSS mockups are labelled as what they are (a window mockup, a pipeline
  diagram) — they never claim to be a screenshot.
- **I4 — no image backgrounds:** `background-image` in the CSS is
  gradients only (the skeleton shimmer). No `url(...jpg/png...)`.
- **I5 — when real screenshots exist:** after the signed installer
  ships, real app screenshots replace the CSS mockups page by page.
  That is a future step, not this one — do not invent screenshots now.

## 3. Audit log

- **Step 16** inventoried every image on the site. Findings:
  - **No violations.** og-image is exactly 1200×630 / 84KB; favicon is
    the correct mark; there are zero `<img>` tags and zero photo
    backgrounds. No changes were needed — the standard documents what
    the audit found and the test locks it in.
  - The only raster image on the whole site is the social card. Every
    other visual is a CSS mockup, which is the honest choice while the
    app has no published screenshots.
- **Method:** file inventory (dimensions, size, format) + HTML/CSS
  census for `<img>` and `url(` references.
