"""Step 19 fix — header overflow at 861-1039px viewports.
Finding (review19.py, 2026-11-14): the home page at 1024px rendered 1040px
wide — 16px of horizontal overflow. Pixel analysis showed the ONLY
overflowing element is the sticky header row (y 9-54): brand + 8 nav links +
CTA button are all flex-shrink:0 / nowrap, so the row is a fixed ~1016px
wide and the page scrollWidth is a constant 1040px for every viewport
861-1039 (measured: 139px overflow at 900px, 39px at 1000px, 16px at
1024px, 0 at 1040px). Below 861px the hamburger shows, so the broken
window is exactly 861-1039px — the CTA button slides off-screen there.
Fix (both halves needed):
  1. .site-nav a padding 12px 8px -> 12px 4px (default): saves 8 links x 8px
     = 64px, row 1016 -> ~952px. Values stay on the SPACING.md scale (4, 12)
     and targets stay >=44px (narrowest link "Demo" ~53px wide, ~49px tall).
  2. Move the mobile-nav block from max-width 860px to max-width 1024px:
     the hamburger now covers <=1024px; desktop nav only appears >1024px,
     where the tightened row fits (952px row vs 977px available at 1025px,
     25px slack). 1024 is already in the BREAKPOINTS.md closed set; 860
     stays used by the other three blocks (two-col, roadmap, demo), so
     test-step15's "each breakpoint is used" still passes. No JS change
     (app.js has no width logic).
Run: python3 tests/fix-step19.py (count-asserted).
"""
import re

CSS = "website/styles.css"
s = open(CSS, encoding="utf-8").read()

# 1. Tighter nav-link padding (default).
old1 = ".site-nav a {\n  color: var(--muted); text-decoration: none; font-size: 15px;\n  padding: 12px 8px; border-radius: 8px; white-space: nowrap; flex-shrink: 0;\n}"
new1 = ".site-nav a {\n  color: var(--muted); text-decoration: none; font-size: 15px;\n  padding: 12px 4px; border-radius: 8px; white-space: nowrap; flex-shrink: 0;\n}"
assert s.count(old1) == 1, f"nav-link rule count: {s.count(old1)}"
s = s.replace(old1, new1)
print("1. .site-nav a padding 12px 8px -> 12px 4px")

# 2. Mobile-nav block 860px -> 1024px (only the nav block, not the other 860 blocks).
old2 = """@media (max-width: 860px) {
  .site-nav {
    display: none; position: absolute; top: 64px; left: 0; right: 0; z-index: 60;
    max-height: calc(100vh - 64px); overflow-y: auto;
    flex-direction: column; background: var(--bg-soft);
    border-bottom: 1px solid var(--border); padding: 12px 16px 16px; margin: 0;
  }
  .site-nav.is-open { display: flex; }
  .nav-toggle { display: block; }
  .site-header .btn-small { display: none; }
}"""
new2 = old2.replace("@media (max-width: 860px)", "@media (max-width: 1024px)", 1)
assert s.count(old2) == 1, f"nav media block count: {s.count(old2)}"
s = s.replace(old2, new2)
print("2. mobile-nav block max-width 860px -> 1024px")

open(CSS, "w", encoding="utf-8").write(s)
print("fix-step19 applied")
