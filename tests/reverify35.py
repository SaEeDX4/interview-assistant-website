#!/usr/bin/env python3
"""Step 35 live markers: the rectangular radius family, on the
   real Pages origin. Plain subresource URLs only."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) reverify35"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


css = fetch(BASE + "styles.css")

checks = [
    (".btn rectangular live", "padding: 12px 24px; border-radius: 12px;" in css),
    ("app pill at 8px live", "border: 1px solid var(--app-border); border-radius: 8px;" in css),
    ("segmented container at 12px live", "border-radius: 12px; overflow: hidden; }" in css),
    ("only the 5 exempt 999px tracks remain", css.count("border-radius: 999px") == 5),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
