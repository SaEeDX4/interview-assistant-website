#!/usr/bin/env python3
"""Step 30 live re-verification, part 1 (markers only).
Fetches the PLAIN subresource URLs and checks for the Step 30 markers
(the working hero: shared prepared bank, the AI endpoint wired to the
Cloudflare proxy, real chip buttons and message box, the gated hover
block and the Replay spin rule). Part 2 (interactive: a random sample
plays, the chips rework the answer, a typed fresh question gets a
real AI answer at the page's real origin, mobile heights constant,
Replay centre still 0.00px) runs in a real browser after this passes.
Usage: python3 tests/reverify30.py
Exit 0 when every marker is present."""
import re
import sys
import urllib.request

BASE = "https://saeedx4.github.io/interview-assistant-website"
CHECKS = [
    ("app.js", "AI endpoint wired to the deployed proxy",
     "interview-assistant-ai-website.saeed-sharifzadeh91.workers.dev", True),
    ("app.js", "prepared variant bank present", "var IA_VARIANTS = {", True),
    ("app.js", "no key material in client code", "sk-", False),
    ("app.js", "no direct OpenAI calls from the page", "api.openai.com", False),
    ("index.html", "chip buttons are real buttons", 'class="app-chip-btn"', True),
    ("index.html", "message box is a real form", 'id="hero-manual-form"', True),
    ("index.html", "answer layer stack present", 'id="mock-answer-stack"', True),
    ("styles.css", "chip button rule", ".app-chip-btn {", True),
    ("styles.css", "hover gated behind hover + fine pointer",
     "@media (hover: hover) and (pointer: fine)", True),
    ("styles.css", "Replay glyph spin rule", "rotate(-360deg)", True),
    ("styles.css", "header shed threshold widened to 400px (Step 30 fix-up)",
     "@media (max-width: 400px)", True),
    ("styles.css", "ghost layers are visibility-hidden", ".app-ghost { visibility: hidden; }", True),
    ("index.html", "question ghost layer present", 'id="mock-question-ghost"', True),
]

cache = {}


def fetch(path):
    if path not in cache:
        req = urllib.request.Request(BASE + "/" + path, headers={"User-Agent": "Muse-reverify30"})
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
