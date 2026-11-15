"""Step 14 fix script: apply the MOTION.md standard to styles.css.
Aborts if any old string does not occur exactly the expected number of times.
DO NOT RUN until Steps 10-13 are pushed — this edits the same file.
"""
import sys
from pathlib import Path

CSS = str(Path(__file__).resolve().parent.parent / "website" / "styles.css")

FIXES = [
    # Buttons .18s -> 150ms (micro)
    ("transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;",
     "transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;", 1),
    # Chips .2s -> 150ms (micro)
    ("transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;",
     "transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;", 1),
    # rise: one duration (.25s) in both places
    ("animation: rise .3s cubic-bezier(.2, .7, .3, 1) both;",
     "animation: rise .25s cubic-bezier(.2,.7,.3,1) both;", 1),
    # One spelling of the rise curve (reveal)
    ("transform .25s cubic-bezier(.2, .7, .3, 1)",
     "transform .25s cubic-bezier(.2,.7,.3,1)", 1),
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
    print(f"STEP14 FIX DONE: {len(FIXES)} rules, {applied} replacements")

if __name__ == "__main__":
    main()
