#!/usr/bin/env python3
"""Step 39 live markers — the full-review fix batch, checked against
the live GitHub Pages output."""
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website/"

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "reverify39"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

css = fetch("styles.css")
features = fetch("features.html")
support = fetch("support.html")
demo = fetch("demo.html")
index = fetch("index.html")

checks = [
    ("gap-only thread live (styles.css)",
     "left: 100%;" in css and ".tl-card:not(:last-child)::after" in css),
    ("card grids stretch live (styles.css)",
     ".grid { display: grid; gap: 20px; align-items: stretch; }" in css),
    ("terms divider rule live (styles.css)",
     ".doc .doc-summary + h2" in css),
    ("roadmap stacked thread live (styles.css)",
     ".roadmap-node:not(:last-child)::after" in css),
    ("skip link parked live (styles.css)",
     "top: -96px" in css),
    ("arabic tracking rule live (styles.css)",
     '[lang="fa"], [lang="ar"] { letter-spacing: 0; }' in css),
    ("native names wrapped (features)",
     '<span lang="fa">فارسی</span>' in features and '<span lang="ar">العربية</span>' in features),
    ("support cta-row live (support)",
     '<p class="cta-row"><a class="btn btn-primary" href="demo.html">Try the demo</a>' in support),
    ("short placeholder live (demo + index)",
     'placeholder="Type your own question…"' in demo and 'placeholder="Type your own question…"' in index),
]

failed = 0
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    failed += 0 if ok else 1
print(f"\n{len(checks) - failed}/{len(checks)} live markers present")
sys.exit(1 if failed else 0)
