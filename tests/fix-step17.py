"""Step 17 fix script: apply the DEADCODE.md standard.
Removes 8 dead CSS rules + 2 dead HTML classes (pill-live in 2 files).
Aborts if any old string does not occur exactly the expected number of times.
DO NOT RUN until Steps 10-16 are pushed — this edits the same files.
"""
import sys
from pathlib import Path

ROOT = str(Path(__file__).resolve().parent.parent / "website")

FIXES = [
    (f"{ROOT}/styles.css",
     ".hotkeys { color: var(--muted); font-size: 15px; }\n"
     ".hotkeys-label { color: var(--text); font-weight: 600; }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".languages { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 24px 0; background: var(--bg-soft); }\n"
     ".languages p { margin: 0; color: var(--muted); font-size: 17px; }\n"
     ".languages strong { color: var(--text); }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".price-card { display: flex; flex-direction: column; }\n"
     ".price-card .btn { margin-top: auto; }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".price-note { color: var(--muted); margin-bottom: 16px; }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".price-featured { border-color: var(--accent); position: relative; }\n"
     ".price-featured .pill-accent { align-self: flex-start; margin-bottom: 12px; }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".h3-small { font-size: 17px; margin-top: 28px; }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".price-featured { box-shadow: 0 0 0 1px var(--accent), 0 20px 48px rgba(124,108,255,.22); }\n", "", 1),
    (f"{ROOT}/styles.css",
     ".mini-row .mini-sub { color: var(--muted-2); font-size: 14px; }\n", "", 1),
    (f"{ROOT}/features.html",
     'class="section section-tight"', 'class="section"', 1),
    (f"{ROOT}/demo.html",
     'class="pill pill-live"', 'class="pill"', 1),
    (f"{ROOT}/index.html",
     'class="pill pill-live"', 'class="pill"', 1),
]

def main():
    for path, old, new, count in FIXES:
        text = open(path).read()
        found = text.count(old)
        if found != count:
            print(f"ABORT {path}: expected {count}x but found {found}x: {old[:80]!r}")
            sys.exit(1)
        open(path, "w").write(text.replace(old, new))
    print(f"STEP17 FIX DONE: {len(FIXES)} removals")

if __name__ == "__main__":
    main()
