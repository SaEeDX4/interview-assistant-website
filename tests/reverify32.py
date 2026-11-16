#!/usr/bin/env python3
"""Step 32 live markers: the morphing toggle, the overlay menu, the
   new nav order and the dissolved Legal column, on the real Pages
   origin. Plain subresource URLs only (the CDN rule)."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify32"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


html = fetch(BASE + "index.html")
css = fetch(BASE + "styles.css")
js = fetch(BASE + "app.js")

checks = [
    ("toggle is two bars in live HTML", "nav-toggle-bars" in html),
    ("old glyph gone from live HTML", "☰" not in html),
    ("menu foot + CTA live", "nav-menu-foot" in html and "nav-menu-cta" in html),
    ("Platforms mobile-only live", 'class="nav-mobile-only"' in html),
    ("no Legal column live", "<h3>Legal</h3>" not in html),
    ("Billing in the bottom bar live", "footer-bottom-right" in html),
    ("morph rule live in CSS", 'aria-expanded="true"] .nav-toggle-bars span:first-child' in css
     and "rotate(45deg)" in css),
    ("overlay panel live in CSS", "rgba(10, 12, 16, .92)" in css and "visibility .25s" in css),
    ("stagger live in CSS", ".is-open > a:nth-child(7)" in css),
    ("scroll lock live in CSS + JS", "body.menu-open" in css and "menu-open" in js),
    ("setOpen live in JS", "function setOpen(open)" in js),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
