# Interview Assistant — Dead-Code & Consistency Standard (Step 17)

**Status:** in force from Step 17 (2026-11-14). Every class in
`website/styles.css` and every page must follow this standard.
`tests/test-step17.js` enforces it automatically (it re-runs the census
below on every run).

**Basis:** a class that nothing uses is a lie in the codebase — someone
will style it thinking it is live, or wonder why a rule has no effect.

## 1. Rules

- **D1 — every CSS class is used:** each class selector in `styles.css`
  appears in the HTML, or is added/referenced by `app.js`, or is on the
  whitelist below.
- **D2 — every HTML class is defined:** each class in the HTML has a
  rule in `styles.css`, or is on the whitelist below.
- **D3 — whitelist (documented, not dead):**
  - JS state classes added at runtime: `cta-visible`, `is-coach-active`,
    `is-new`, `is-open`, `is-scrolled`, `is-visible`, `js`, `js-acc`,
    `open`.
  - JS-generated content classes: `reveal`, `skel`, `coach`,
    `coach-keys`, `calc-note`, `pricing`.
  - Semantic hooks with no styles of their own: `brand-name` (the brand
    text, styled by `.brand`), `hero-copy` (the hero text wrapper,
    styled by `.hero`).
- **D4 — one nav, one footer:** the `<nav>` and `<footer>` markup is
  byte-identical on all 11 pages (except each page's own
  `aria-current="page"`).
- **D5 — funnel on every content page:** the next-step band is on all 10
  content pages. The sticky bar is on all of them except download.html
  (it IS the download page) and 404.html (an error page) — both by
  design, and `app.js` guards the missing element.

## 2. Audit log

- **Step 17** ran a full census: 215 classes defined in CSS, 196 used
  in HTML. Findings:
  - **P1 — 8 dead CSS rules removed:** `.hotkeys`, `.hotkeys-label`,
    `.languages` (+2 sub-rules), `.price-card` (+1 sub-rule),
    `.price-note`, `.price-featured` (×2), `.h3-small`,
    `.mini-row .mini-sub`. None appears in any HTML file or in
    `app.js`. The pricing page's live cards use `.price` /
    `.price-amount` / `.card`, not the removed rules.
  - **P1 — 2 dead HTML classes removed:** `section-tight`
    (features.html, never defined) and `pill-live` (demo.html AND
    index.html — the audit first found only demo.html; the test caught
    the second use in index.html's hero pill, so both were removed.
    Never defined — the pill already renders correctly via `.pill` +
    `.dot`).
  - **Already good (verified, now locked in by tests):** nav and footer
    byte-identical on all 11 pages; next-step band on all 10 content
    pages; sticky bar absent only where designed; every other class is
    used, JS-referenced, or whitelisted.
- **Method:** automated census (CSS selectors × HTML classes × JS
  references) + nav/footer byte comparison + fresh live re-verification
  after the fix.
