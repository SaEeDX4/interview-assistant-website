#!/usr/bin/env python3
"""Step 36 live markers: the Home menu item, the 44px brand and
   the footer brand link, on the real Pages origin."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify36"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


html = fetch(BASE + "index.html")
feat = fetch(BASE + "features.html")
css = fetch(BASE + "styles.css")

checks = [
    ("Home is the menu's first item (index)", '<a href="index.html" class="nav-mobile-only" aria-current="page">Home</a>' in html),
    ("Home present without aria-current (features)", '<a href="index.html" class="nav-mobile-only">Home</a>' in feat),
    ("footer brand is a link (index)", '<a class="brand" href="index.html"' in html),
    ("no <p class=brand> left (features)", '<p class="brand">' not in feat),
    ("48px brand rule live", ".site-header .brand { padding-top: 8px; padding-bottom: 8px; }" in css),
    ("stagger child 8 live", "nth-child(8) { transition-delay: .28s; }" in css),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
