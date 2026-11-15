#!/usr/bin/env python3
"""Step 28 live re-verification, part 1 (markers only).
Fetches the PLAIN subresource URLs and checks for the Step 28 markers
(the fix-up: the sticky dismiss shares one height token with the
buttons). Part 2 (interactive: Replay box centre == send centre 0.00px,
close 51x51 square, gap 12px, hero height constant, no overflow) runs
in a real browser after this passes.
Usage: python3 tests/reverify28.py --no-wait  (push is 15+ min old)
Exit 0 when every marker is present."""
import re
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website"
CHECKS = [
    ("styles.css", "Replay box right-aligned", "place-items: center end;", True),
    ("styles.css", "shared control-height token", "--sticky-control-h: 51px;", True),
    ("styles.css", "close reads the token (width)", "width: var(--sticky-control-h);", True),
    ("styles.css", "close reads the token (height)", "height: var(--sticky-control-h);", True),
    ("styles.css", "bar buttons read the token", "height: var(--sticky-control-h);", True),
    ("styles.css", "old stretch gone from the close", "align-self: stretch;", False),
    ("styles.css", "old aspect-ratio gone from the close", "aspect-ratio: 1;", False),
    ("index.html", "index page still serves", "hero-stats", True),
]

cache = {}


def fetch(path):
    if path not in cache:
        req = urllib.request.Request(BASE + "/" + path, headers={"User-Agent": "Muse-reverify28"})
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode("utf-8", "replace")
        if path.endswith(".css"):
            body = re.sub(r"/\*[\s\S]*?\*/", "", body)
        cache[path] = body
    return cache[path]


passed = failed = 0
for path, name, marker, present in CHECKS:
    body = fetch(path)
    found = marker in body
    ok = found if present else not found
    detail = (f"found in {path}" if found else f"MISSING from {path}") if present \
        else (f"absent from {path}" if not found else f"STILL PRESENT in {path}")
    print(("PASS " if ok else "FAIL ") + f"{name}: {detail}", flush=True)
    if ok:
        passed += 1
    else:
        failed += 1

print(f"\n{passed} passed, {failed} failed")
sys.exit(1 if failed else 0)
