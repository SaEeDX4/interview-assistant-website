# Interview Assistant — SEO Standard (Step 13)

**Status:** in force from Step 13 (2026-11-14). Every page, `sitemap.xml`,
`robots.txt` and `404.html` must follow this standard.
`tests/test-step13.js` enforces it automatically.

**Basis:** Google Search Essentials, sitemaps.org, Open Graph protocol,
schema.org. The site is a static GitHub Pages site — everything here is
files, no server config.

## 1. Rules

| # | Rule | Details |
|---|------|---------|
| S1 | Sitemap | `sitemap.xml` at the site root lists all 10 content pages with absolute URLs, `<lastmod>` of the last change, `monthly`, index 1.0 / others 0.8. Never lists `404.html`. |
| S2 | Robots | `robots.txt` allows all and points at the sitemap. |
| S3 | 404 page | `404.html` at the site root: `noindex`, same header/footer/skip-link as the rest of the site, no `aria-current`, links home/demo/support. No JSON-LD, no canonical. |
| S4 | Titles & descriptions | Every page: unique `<title>`; unique meta description, 50–160 chars. |
| S5 | Canonical & social | Every content page: `<link rel="canonical">` (absolute URL; index is the directory URL with trailing slash), `og:url` equal to the canonical, `og:title`, `og:description` (honest, ≤160 chars), `og:type` website, `og:image` (absolute URL), `twitter:card` summary_large_image + `twitter:image`. |
| S6 | Theme color | `<meta name="theme-color" content="#0a0c10">` on every page. |
| S7 | Structured data | JSON-LD `SoftwareApplication` on every content page (not 404) with `url`, Trial $0 and Pro $19.99 offers, and the sandbox-reference note on the Pro price. |
| S8 | Links resolve | Every internal `href` to a `.html` file exists; every `#anchor` id exists in its target page. |
| S9 | Honesty | Social descriptions must not overstate readiness — no "Windows now" while the installer is unpublished. |

## 2. Audit log

- **Step 13** audited all 10 pages + the repo for SEO files. Findings:
  - **P0 — missing files:** no `sitemap.xml`, no `robots.txt`, no
    `404.html` anywhere in the repo. All three created.
  - **P0 — missing head tags:** no `<link rel="canonical">`, no `og:url`,
    no `theme-color` on any page. Added to all 10 pages.
  - **P1 — JSON-LD had no `url`:** the `SoftwareApplication` block was
    identical on all 10 pages but lacked its own URL. Added.
  - **P1 — three descriptions over 160 chars:** features (171), platforms
    (164), index (162). Trimmed to ≤160 without losing meaning.
  - **P1 — dishonest social copy:** platforms `og:description` said
    "Windows now." while the installer is unpublished; the meta
    description honestly says "Windows first — installer pending."
    Aligned the og copy to the meta copy.
  - **Already good (verified, now locked in by tests):** unique titles
    and descriptions on all 10 pages; og:title/og:description/og:type/
    og:image + twitter:card/image everywhere; JSON-LD on all 10 pages;
    every internal link and anchor resolves.
- **Method:** full head audit of all 10 pages + link/anchor census +
  fresh live re-verification after the fix (including a live check that
  a bad URL serves the 404 page).
