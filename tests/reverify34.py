#!/usr/bin/env python3
"""Step 34 live markers: the 'live' label and the slim SVG header,
   on the real Pages origin. Plain subresource URLs only."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify34"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


html = fetch(BASE + "index.html")
css = fetch(BASE + "styles.css")
js = fetch(BASE + "app.js")

checks = [
    ("no ■ glyph live", "■" not in html),
    ("SVG stop icon live", 'rx="2" fill="currentColor"' in html),
    ("SVG close icon live", "M4.2 4.2 L11.8 11.8" in html),
    ("slim header live in CSS", "padding: 8px 16px; border-bottom: 1px solid var(--app-border)" in css),
    ("capsule Start live in CSS", "border-radius: 14px; padding: 8px 12px" in css),
    ("'live' meta live in JS", '"live", "typed-ai"' in js),
    ("demo sentence live in JS", "Live answer — generated for this question." in js),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
