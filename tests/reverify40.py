#!/usr/bin/env python3
"""Step 40 live markers — the code-review fix batch."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "reverify40"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

js = fetch("app.js")
css = fetch("styles.css")
demo = fetch("demo.html")

checks = [
    ("hero fetch guard live (app.js)",
     'if (typeof fetch !== "function") { prepareFallback();' in js),
    ("controller capture live x2 (app.js)",
     js.count("var ctl = ") >= 2 and "if (fetchCtl === ctl)" in js and "if (demoFetchCtl === ctl)" in js),
    ("single visually-hidden live (styles.css)",
     ".visually-hidden, .demo-title-visually-hidden {" in css),
    ("doc-summary h2 without !important live (styles.css)",
     ".doc-summary h2 { border: 0; padding: 0; margin: 0 0 8px; font-size: 18px; }" in css),
    ("demo modes class live, no inline style (demo.html)",
     'class="grid grid-3 demo-modes"' in demo and ' style="' not in demo),
    ("demo-modes rule live (styles.css)",
     ".demo-modes { margin-top: 24px; }" in css),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
