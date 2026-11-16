#!/usr/bin/env python3
"""Step 37a live markers — the minutes meter, the after-block, and the
honesty-note fix, checked against the live GitHub Pages output."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "reverify37a"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

index = fetch("index.html")
demo = fetch("demo.html")
appjs = fetch("app.js")
css = fetch("styles.css")

checks = [
    ("minutes meter live (index)",
     '<span id="mock-minutes-num">30</span>' in index),
    ("after-block live (index)",
     'id="hero-after"' in index and 'id="suggest-1"' in index and 'id="suggest-2"' in index),
    ("truthful demo note live (demo)",
     "it may be answered live over the network" in demo),
    ("truthful demo note live (index)",
     "it may be answered live over the network" in index),
    ("no 'no network' claim live (demo)",
     "no network" not in demo),
    ("suggestion engine live (app.js)",
     "function playSample(newKey)" in appjs and "SUGGEST_POOL" in appjs),
    ("meter CSS live (styles.css)",
     ".app-minutes {" in css and ".suggest-btn {" in css),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
