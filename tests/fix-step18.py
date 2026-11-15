"""Step 18 fix script: self-host Inter.
- styles.css: update header comment + insert @font-face (variable font,
  latin + latin-ext, font-display swap) before :root.
- All 11 HTML pages: replace the 3 Google Fonts lines with one preload
  link for the latin variable file.
- TYPOGRAPHY.md: section 3 rewritten for self-hosting + Step 18 audit entry.
Aborts if any old string does not occur exactly the expected number of times.
DO NOT RUN until the woff2 files exist in website/fonts/ (they are uploaded
to GitHub separately via the web UI — push_files cannot carry binaries).
"""
import sys
from pathlib import Path

ROOT = str(Path(__file__).resolve().parent.parent)
PAGES = ["index", "features", "how-it-works", "demo", "pricing", "download",
         "platforms", "privacy", "terms", "support", "404"]

FONT_FACE = """/* Self-hosted Inter (Step 18): variable font, weights 100-900, display swap.
   Latin + latin-ext cover every Inter glyph this site uses; arrows, checkmarks
   and Arabic/Persian fall back to system fonts exactly as from Google Fonts. */
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("fonts/inter-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("fonts/inter-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
"""

OLD_FONT_LINKS = """<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">"""
NEW_PRELOAD = """<link rel="preload" href="fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>"""

OLD_WEIGHTS_PARA = """The font URL loads `Inter:wght@400;500;600;700;800`. The stylesheet must
use **only** those weights. (Step 10 found `650` ×19 and `750` ×1 in the CSS
— weights the URL never lists, so browsers round or synthesise them and the
rendered weight is unreliable across browsers. All mapped to 600 / 700,
which is what browsers were already rendering.)"""
NEW_WEIGHTS_PARA = """Inter is self-hosted as a variable font (`website/fonts/inter-latin.woff2`
+ `inter-latin-ext.woff2`, weights 100–900, `font-display: swap`; Step 18).
The stylesheet must use **only** weights 400–800. (Step 10 found `650` ×19
and `750` ×1 in the CSS — weights the old Google Fonts URL never listed, so
browsers round or synthesise them and the rendered weight is unreliable
across browsers. All mapped to 600 / 700, which is what browsers were
already rendering.)"""

AUDIT_ANCHOR = "sentence case) + fresh live re-verification after the fix."
AUDIT_ENTRY = """
- **Step 18** self-hosted Inter: the Google Fonts stylesheet link (render-blocking,
  ~760ms per Lighthouse) is gone from all 11 pages; the variable font is served
  from `website/fonts/` (latin 71KB + latin-ext 130KB, `font-display: swap`, latin
  preloaded). Latin + latin-ext cover every Inter glyph the site uses; arrows,
  checkmarks and Arabic/Persian fall back to system fonts exactly as before."""


def replace(path, old, new, count):
    text = open(path, encoding="utf-8").read()
    n = text.count(old)
    assert n == count, f"{path}: expected {count}x, found {n}x: {old[:60]!r}"
    open(path, "w", encoding="utf-8").write(text.replace(old, new))
    print(f"{path}: replaced {count}x")


css_path = f"{ROOT}/website/styles.css"
replace(css_path,
        "Inter loaded from Google Fonts (system fallback).",
        "Inter self-hosted from fonts/ (system fallback).", 1)
replace(css_path,
        "value without updating the standard first. */\n\n:root {",
        "value without updating the standard first. */\n\n" + FONT_FACE + ":root {", 1)

for page in PAGES:
    replace(f"{ROOT}/website/{page}.html", OLD_FONT_LINKS, NEW_PRELOAD, 1)

typo_path = f"{ROOT}/standards/TYPOGRAPHY.md"
replace(typo_path, OLD_WEIGHTS_PARA, NEW_WEIGHTS_PARA, 1)
replace(typo_path, AUDIT_ANCHOR, AUDIT_ANCHOR + AUDIT_ENTRY, 1)

print("STEP18 FIX DONE")
