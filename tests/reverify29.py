#!/usr/bin/env python3
"""Step 29 live re-verification, part 1 (markers only).
Fetches the PLAIN subresource URLs and checks for the Step 29 markers
(the header sheds the level meter below 385px, so it stays one row for
every status word). Part 2 (interactive: hero height constant through
a full play at 360px, all eight words one row at 320/360/375/382,
meter still visible at 390px, no overflow) runs in a real browser
after this passes.
Usage: python3 tests/reverify29.py --no-wait  (push is 15+ min old)
Exit 0 when every marker is present."""
import re
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website"
CHECKS = [
    ("styles.css", "384px shed block present", "@media (max-width: 384px)", True),
    ("styles.css", "meter shed rule", ".app-meter { display: none; }", True),
    ("styles.css", "header gap tightened", "gap: 8px;", True),
    ("styles.css", "controls gap tightened", "gap: 4px;", True),
    ("styles.css", "pill padding tightened", "padding-left: 8px; padding-right: 8px;", True),
    ("index.html", "index page still serves", "hero-stats", True),
]

cache = {}


def fetch(path):
    if path not in cache:
        req = urllib.request.Request(BASE + "/" + path, headers={"User-Agent": "Muse-reverify29"})
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
