"""Step 11 fix script: apply the ACCESSIBILITY.md standard.
Aborts if any old string does not occur exactly the expected number of times.
CSS fixes go in website/styles.css; HTML fixes in website/support.html and
website/index.html.
"""
import sys
from pathlib import Path

CSS = str(Path(__file__).resolve().parent.parent / "website" / "styles.css")
INDEX = str(Path(__file__).resolve().parent.parent / "website" / "index.html")

CSS_FIXES = [
    # A2 .btn-small ~38px -> ~46px: vertical padding 8 -> 12
    (".btn-small { padding: 8px 16px; font-size: 15px; }",
     ".btn-small { padding: 12px 16px; font-size: 15px; }", 1),
    # A11 .site-nav a ~41px -> ~49px: vertical padding 8 -> 12
    ("  padding: 8px 8px; border-radius: 8px; white-space: nowrap; flex-shrink: 0;",
     "  padding: 12px 8px; border-radius: 8px; white-space: nowrap; flex-shrink: 0;", 1),
    # A12 footer links ~41px -> ~49px: vertical padding 8 -> 12
    (".site-footer nav a { display: block; color: var(--muted); text-decoration: none; padding: 8px 0; font-size: 15px; }",
     ".site-footer nav a { display: block; color: var(--muted); text-decoration: none; padding: 12px 0; font-size: 15px; }", 1),
    # A7 .mode-btn ~31px -> 44px: min-height (padding stays compact)
    ("  font: 600 13px/1 inherit; font-family: inherit; padding: 8px 16px;",
     "  font: 600 13px/1 inherit; font-family: inherit; padding: 8px 16px; min-height: 44px;", 1),
    # A8 .chip ~41px -> 44px: min-height
    ("  border-radius: 999px; padding: 8px 12px; font: inherit; font-size: 14px; cursor: pointer;",
     "  border-radius: 999px; padding: 8px 12px; font: inherit; font-size: 14px; cursor: pointer; min-height: 44px;", 1),
    # A9 .radio-pill ~43px -> 44px: min-height
    ("  padding: 8px 16px; margin: 0 8px 8px 0; cursor: pointer; font-size: 15px;",
     "  padding: 8px 16px; margin: 0 8px 8px 0; cursor: pointer; font-size: 15px; min-height: 44px;", 1),
    # A10 .seg-btn ~44.2px -> guaranteed 44px: min-height guard
    ("  font: 600 14px/1.3 inherit; font-family: inherit; padding: 12px 16px;",
     "  font: 600 14px/1.3 inherit; font-family: inherit; padding: 12px 16px; min-height: 44px;", 1),
    # A13 .sticky-cta-close 32px -> 44x44px
    ("  border-radius: 8px; width: 32px; height: 32px; font-size: 18px; line-height: 1;",
     "  border-radius: 8px; width: 44px; height: 44px; font-size: 18px; line-height: 1;", 1),
    # A14 range thumb 24px: custom track + thumb (webkit + moz)
    ('.calc input[type="range"] { width: 100%; accent-color: var(--accent); margin-bottom: 12px; }',
     '.calc input[type="range"] { width: 100%; accent-color: var(--accent); margin-bottom: 12px; -webkit-appearance: none; appearance: none; background: transparent; }\n'
     '.calc input[type="range"]::-webkit-slider-runnable-track { height: 4px; border-radius: 999px; background: var(--border-strong); }\n'
     '.calc input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--accent); border: 2px solid #0a0c10; margin-top: -10px; cursor: pointer; }\n'
     '.calc input[type="range"]::-moz-range-track { height: 4px; border-radius: 999px; background: var(--border-strong); }\n'
     '.calc input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: var(--accent); border: 2px solid #0a0c10; cursor: pointer; }', 1),
]

def apply(path, fixes):
    text = open(path).read()
    applied = 0
    for old, new, count in fixes:
        found = text.count(old)
        if found != count:
            print(f"ABORT {path}: expected {count}x but found {found}x: {old[:80]!r}")
            sys.exit(1)
        text = text.replace(old, new)
        applied += count
    open(path, "w").write(text)
    return applied

total = apply(CSS, CSS_FIXES)
# P1 accordion: NO HTML change. The first draft changed support.html's 7
# buttons to aria-expanded="false", but that was backwards — without JS the
# panels stay visible, so "true" is the truthful HTML value (see
# ACCESSIBILITY.md section 4). The change was reverted pre-push; the test
# asserts "true" in the HTML on both FAQ pages instead.
# P2 hero mock status is a decorative duplicate of the interactive demo
total += apply(INDEX, [('<p class="app-status" id="mock-status"></p>',
                        '<p class="app-status" id="mock-status" aria-hidden="true"></p>', 1)])
print(f"STEP11 FIX DONE: {total} replacements")
