"""Step 10 fix script: apply the TYPOGRAPHY.md standard to styles.css.
Aborts if any old string does not occur exactly the expected number of times.
"""
import sys
from pathlib import Path

PATH = str(Path(__file__).resolve().parent.parent / "website" / "styles.css")

FIXES = [
    # P0 — terms doc body 17.5px -> 17px (same as body); honest strip 100ch -> 68ch
    (".doc { font-size: 17.5px; }", ".doc { font-size: 17px; }", 1),
    ("max-width: 100ch", "max-width: 68ch", 1),
    # P0 — page-hero h1 clamp max 46 -> 44 (never bigger than the hero h1)
    ("font-size: clamp(32px, 4.4vw, 46px)", "font-size: clamp(32px, 4.4vw, 44px)", 1),
    # P0 — unloaded weights: 650 -> 600 (15x property + 4x shorthand), 750 -> 700
    ("font-weight: 650", "font-weight: 600", 15),
    ("font: 650 ", "font: 600 ", 4),
    ("font-weight: 750", "font-weight: 700", 1),
    # P1 — off-scale sizes -> nearest scale value
    ("font-size: 11.5px", "font-size: 12px", 4),
    ("font-size: 12.5px", "font-size: 12px", 2),
    ("font-size: 13.5px", "font-size: 14px", 12),
    ("font-size: 14.5px", "font-size: 15px", 8),
    ("font-size: 15.5px", "font-size: 15px", 3),
    ("font-size: 26px", "font-size: 24px", 1),
    # P1 — line-height 1.55 -> 1.6 (body-small)
    ("line-height: 1.55", "line-height: 1.6", 2),
    # P1 — tracking: unify uppercase labels at +0.08em, drop negligible values
    ("letter-spacing: .06em", "letter-spacing: .08em", 5),
    ("letter-spacing: .1em", "letter-spacing: .08em", 2),
    ("letter-spacing: .12em", "letter-spacing: .08em", 1),
    ("letter-spacing: .01em", "letter-spacing: 0", 1),
    ("letter-spacing: .02em", "letter-spacing: 0", 1),
]

def main():
    css = open(PATH).read()
    applied = 0
    for old, new, count in FIXES:
        found = css.count(old)
        if found != count:
            print(f"ABORT: expected {count}x but found {found}x: {old[:80]!r}")
            sys.exit(1)
        css = css.replace(old, new)
        applied += count
    open(PATH, "w").write(css)
    print(f"STEP10 FIX DONE: {len(FIXES)} rules, {applied} replacements")

if __name__ == "__main__":
    main()
