"""Step 12 fix script: apply the COLOR.md standard to styles.css.
Aborts if any old string does not occur exactly the expected number of times.
DO NOT RUN until Step 11 is pushed — this changes the same file.
"""
import sys
from pathlib import Path

CSS = str(Path(__file__).resolve().parent.parent / "website" / "styles.css")

FIXES = [
    # 10 new tokens, after --focus
    ("  --focus: #a99fff;\n",
     "  --focus: #a99fff;\n"
     "  --accent-light: #cfc8ff;\n"
     "  --accent-hover: #8d80ff;\n"
     "  --accent-2-light: #7df0dd;\n"
     "  --coach-light: #f8cd7d;\n"
     "  --warn-light: #fcd34d;\n"
     "  --danger: #f87171;\n"
     "  --danger-light: #fca5a5;\n"
     "  --danger-soft: rgba(248, 113, 113, .14);\n"
     "  --surface-mid: #11151d;\n"
     "  --skeleton: #2a3547;\n", 1),
    # One dark text color everywhere: var(--bg)
    ("color: #0a0c10", "color: var(--bg)", 7),
    ("border: 2px solid #0a0c10", "border: 2px solid var(--bg)", 2),
    ("color: #221a05", "color: var(--bg)", 1),
    # Link hover + badges share one light lavender
    ("a:hover { color: #c6bdff; }", "a:hover { color: var(--accent-light); }", 1),
    ("color: #cfc8ff;", "color: var(--accent-light);", 2),
    # Button hover violet
    ("background: #8d80ff;", "background: var(--accent-hover);", 1),
    # Skeleton
    ("background-color: #2a3547;", "background-color: var(--skeleton);", 1),
    # Gradient uses tokens
    ("background: linear-gradient(180deg, #171d28, #11151d 60%, #0e1218);",
     "background: linear-gradient(180deg, var(--surface-2), var(--surface-mid) 60%, var(--bg-soft));", 1),
    # Danger scale
    ("color: #fca5a5;", "color: var(--danger-light);", 1),
    ("background: rgba(248,113,113,.14); color: #f87171;",
     "background: var(--danger-soft); color: var(--danger);", 1),
    # Light badge variants
    ("color: #7df0dd;", "color: var(--accent-2-light);", 1),
    ("color: #f8cd7d;", "color: var(--coach-light);", 1),
    ("color: #fcd34d;", "color: var(--warn-light);", 1),
    # Meter gradient end: consolidate the two light teals into one
    ("background: linear-gradient(90deg, var(--accent-2), #5eead4);",
     "background: linear-gradient(90deg, var(--accent-2), var(--accent-2-light));", 1),
    # Pro meter gradient end was the focus color; mirror the trial meter
    ("background: linear-gradient(90deg, var(--accent), #a99fff);",
     "background: linear-gradient(90deg, var(--accent), var(--accent-light));", 1),
]

def main():
    css = open(CSS).read()
    applied = 0
    for old, new, count in FIXES:
        found = css.count(old)
        if found != count:
            print(f"ABORT: expected {count}x but found {found}x: {old[:80]!r}")
            sys.exit(1)
        css = css.replace(old, new)
        applied += count
    open(CSS, "w").write(css)
    print(f"STEP12 FIX DONE: {len(FIXES)} rules, {applied} replacements")

if __name__ == "__main__":
    main()
