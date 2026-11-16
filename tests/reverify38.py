#!/usr/bin/env python3
"""Step 38 live markers — story header sheds, start-icon swap, and the
Timeline Trio, checked against the live GitHub Pages output."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "reverify38"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

index = fetch("index.html")
appjs = fetch("app.js")
css = fetch("styles.css")

checks = [
    ("timeline trio live (index)",
     '<ol class="grid grid-3 grid-timeline">' in index and 'class="tl-node"' in index),
    ("text link live (index)",
     '<a class="text-link" href="features.html">' in index),
    ("no text play glyph live (index)",
     '<span class="app-start-icon" aria-hidden="true">▶</span>' not in index),
    ("icon swap live (app.js)",
     'function setStart(label)' in appjs and "PAUSE_ICON" in appjs),
    ("story sheds live (styles.css)",
     "#story-live-header .app-icon-btn { display: none; }" in css),
    ("timeline CSS live (styles.css)",
     ".grid.grid-timeline {" in css and ".tl-fact {" in css),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
