#!/usr/bin/env python3
"""Step 33 live markers: the offer-only trust line and its margin
   fix, on the real Pages origin. Plain subresource URLs only."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify33"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


html = fetch(BASE + "index.html")
css = fetch(BASE + "styles.css")

checks = [
    ("new trust line live", "30 live minutes free — and they never expire." in html),
    ("old hero line gone", "Free Trial — 30 live minutes. Use only where you are allowed to." not in html),
    ("ethics sentence still in footer", "© 2026 Interview Assistant. Use only where you are allowed to." in html),
    ("margin fix live in CSS", ".trust-line {" in css and "margin-bottom: 0" in css),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
