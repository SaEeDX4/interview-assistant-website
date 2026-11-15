"""Step 9 fix script: apply the SPACING.md standard to styles.css.

Every replacement is (old, new, expected_count). The script aborts if any
old string does not occur exactly the expected number of times — no silent
partial edits.

Order matters: blanket replacements run first; the single-line entries that
follow are written against the post-blanket text (e.g. a line whose gap the
blanket already fixed).
"""
import sys
from pathlib import Path

PATH = str(Path(__file__).resolve().parent.parent / "website" / "styles.css")

# (old, new, expected_count)
FIXES = [
    # P0 — hero -> first content section: 32px -> 48px total
    (".page-hero + .section { padding-top: 24px; }",
     ".page-hero + .section { padding-top: 40px; }", 1),

    # --- blanket standardisations (same value, same target everywhere) ---
    ("margin-bottom: 6px;", "margin-bottom: 8px;", 6),      # demo/app labels, card h3s, roadmap nodes
    ("margin-bottom: 10px;", "margin-bottom: 12px;", 5),    # step-num, section-head h2, lang-tag, status, teaser pill
    ("margin: 14px 0 0;", "margin: 16px 0 0;", 4),           # coach-mini, stage caption, seg-state, demo-note
    ("margin-bottom: 4px;", "margin-bottom: 8px;", 3),      # flow-node/flow-break/teaser-plan h3s
    ("gap: 9px;", "gap: 8px;", 5),                          # check-list, app-answer, lang .a, lang .a li, mini-bullets li
    ("gap: 6px;", "gap: 8px;", 3),                          # demo-dots, finder-result ul, trouble status
    ("padding: 12px 14px;", "padding: 12px 16px;", 5),      # nav-toggle, demo-answer li, demo-foot input, table cells, inst-file
    ("padding: 10px 12px;", "padding: 12px;", 3),           # app-answer li, coach-mini, mini-q
    ("padding: 20px 22px;", "padding: 20px;", 3),           # finder-result, calc-result, doc-summary
    ("padding: 18px 20px;", "padding: 20px;", 2),           # callout, acc-btn
    ("padding: 18px;", "padding: 20px;", 2),                # flow-node, flow-break
    ("padding: 22px;", "padding: 24px;", 2),                # req-item, trouble-card
    ("margin-bottom: 22px;", "margin-bottom: 24px;", 1),    # meter-row
    ("display: flex; gap: 10px; align-items: flex-start;",
     "display: flex; gap: 8px; align-items: flex-start;", 3),  # demo/app/vs list items

    # --- single-line, selector-qualified (post-blanket text) ---
    ("  text-transform: uppercase; color: var(--muted); margin-bottom: 14px;",
     "  text-transform: uppercase; color: var(--muted); margin-bottom: 12px;", 1),  # eyebrow
    (".brand { display: inline-flex; align-items: center; gap: 10px;",
     ".brand { display: inline-flex; align-items: center; gap: 8px;", 1),
    (".site-nav { display: flex; gap: 2px;",
     ".site-nav { display: flex; gap: 4px;", 1),
    ("  margin: 40px 0 0; padding: 14px 18px;",
     "  margin: 40px 0 0; padding: 16px;", 1),  # ethics-strip
    ("  font: 650 13px/1 inherit; font-family: inherit; padding: 8px 14px;",
     "  font: 650 13px/1 inherit; font-family: inherit; padding: 8px 16px;", 1),  # mode-btn
    (".demo-stage .mode-btn { padding: 10px 18px; font-size: 14px; }",
     ".demo-stage .mode-btn { padding: 12px 16px; font-size: 14px; }", 1),
    ("  font: 650 14px/1.3 inherit; font-family: inherit; padding: 11px 16px;",
     "  font: 650 14px/1.3 inherit; font-family: inherit; padding: 12px 16px;", 1),  # seg-btn
    (".app-question { font-size: 19px; font-weight: 650; line-height: 1.4; margin-bottom: 14px; }",
     ".app-question { font-size: 19px; font-weight: 650; line-height: 1.4; margin-bottom: 16px; }", 1),
    (".demo-answer { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }",
     ".demo-answer { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }", 1),
    (".demo-foot form { display: flex; gap: 10px; }",
     ".demo-foot form { display: flex; gap: 12px; }", 1),
    (".demo-sample-tag { color: var(--muted); font-size: 13px; margin: 6px 0 0; }",
     ".demo-sample-tag { color: var(--muted); font-size: 13px; margin: 8px 0 0; }", 1),
    ("  border-radius: 999px; padding: 7px 12px; font: inherit; font-size: 13.5px; cursor: pointer;",
     "  border-radius: 999px; padding: 8px 12px; font: inherit; font-size: 13.5px; cursor: pointer;", 1),  # chip
    (".chips-big .chip { font-size: 15px; padding: 10px 16px; }",
     ".chips-big .chip { font-size: 15px; padding: 12px 16px; }", 1),
    ("  display: inline-block; padding: 12px 22px; border-radius: 999px;",
     "  display: inline-block; padding: 12px 24px; border-radius: 999px;", 1),  # .btn
    (".btn-small { padding: 9px 16px; font-size: 15px; }",
     ".btn-small { padding: 8px 16px; font-size: 15px; }", 1),
    (".languages { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 22px 0;",
     ".languages { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 24px 0;", 1),
    (".price-note { color: var(--muted); margin-bottom: 18px; }",
     ".price-note { color: var(--muted); margin-bottom: 16px; }", 1),
    (".check-list { list-style: none; margin: 0 0 22px; padding: 0; display: grid; gap: 8px; color: var(--muted); }",
     ".check-list { list-style: none; margin: 0 0 24px; padding: 0; display: grid; gap: 8px; color: var(--muted); }", 1),
    (".site-footer nav a { display: block; color: var(--muted); text-decoration: none; padding: 4px 0; font-size: 15px; }",
     ".site-footer nav a { display: block; color: var(--muted); text-decoration: none; padding: 8px 0; font-size: 15px; }", 1),
    (".numbered { margin: 0 0 16px; padding-left: 22px; display: grid; gap: 10px; color: var(--muted); }",
     ".numbered { margin: 0 0 16px; padding-left: 24px; display: grid; gap: 8px; color: var(--muted); }", 1),
    (".demo-section-head { text-align: center; max-width: 640px; margin: 0 auto 36px; }",
     ".demo-section-head { text-align: center; max-width: 640px; margin: 0 auto 32px; }", 1),
    (".demo-next-title { font-size: 19px; margin-bottom: 14px; }",
     ".demo-next-title { font-size: 19px; margin-bottom: 16px; }", 1),
    ("  list-style: none; margin: 0 0 14px; padding: 0;",
     "  list-style: none; margin: 0 0 16px; padding: 0;", 1),  # journey
    (".app-wave { display: flex; align-items: flex-end; gap: 3px; height: 26px; margin-bottom: 14px; }",
     ".app-wave { display: flex; align-items: flex-end; gap: 3px; height: 26px; margin-bottom: 16px; }", 1),
    (".app-controls { margin-left: auto; display: inline-flex; gap: 14px; color: var(--muted-2); font-size: 13px; line-height: 1; }",
     ".app-controls { margin-left: auto; display: inline-flex; gap: 16px; color: var(--muted-2); font-size: 13px; line-height: 1; }", 1),
    ("  list-style: none; margin: 20px 0 0; padding: 0; position: relative; z-index: 2;\n  display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;",
     "  list-style: none; margin: 20px 0 0; padding: 0; position: relative; z-index: 2;\n  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;", 1),  # float-chips
    (".pipe-note { color: var(--muted-2); font-size: 13.5px; margin: 4px 0 0; }",
     ".pipe-note { color: var(--muted-2); font-size: 13.5px; margin: 0; }", 1),
    ("  flex: none; width: 26px; height: 26px; border-radius: 50%;",
     "  flex: none; width: 22px; height: 22px; border-radius: 50%;", 1),  # pipe-num
    ("  background: var(--surface); border: 1px solid var(--border);\n  border-radius: var(--radius); padding: 14px 16px; font-size: 15px; line-height: 1.5;",
     "  background: var(--surface); border: 1px solid var(--border);\n  border-radius: var(--radius); padding: 16px; font-size: 15px; line-height: 1.5;", 1),  # pipe-list li
    (".lang-card .q { font-size: 19px; font-weight: 650; line-height: 1.4; margin-bottom: 14px; }",
     ".lang-card .q { font-size: 19px; font-weight: 650; line-height: 1.4; margin-bottom: 12px; }", 1),
    (".tl-item { position: relative; padding: 0 0 36px; }",
     ".tl-item { position: relative; padding: 0 0 32px; }", 1),
    (".tl-item h2 { font-size: 22px; font-weight: 650; line-height: 1.3; margin-bottom: 8px; }",
     ".tl-item h2 { font-size: 22px; font-weight: 650; line-height: 1.3; margin-bottom: 12px; }", 1),
    (".tl-item h3 { margin-bottom: 8px; }",
     ".tl-item h3 { margin-bottom: 12px; }", 1),
    (".mini-q .tag { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent-2); margin-bottom: 2px; }",
     ".mini-q .tag { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent-2); margin-bottom: 4px; }", 1),
    (".mini-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14.5px; }",
     ".mini-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14.5px; }", 1),
    (".mini-bullets li { display: flex; gap: 8px; align-items: flex-start; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; }",
     ".mini-bullets li { display: flex; gap: 8px; align-items: flex-start; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; }", 1),
    (".meter-note { color: var(--muted); font-size: 14px; margin: 18px 0 0; }",
     ".meter-note { color: var(--muted); font-size: 14px; margin: 16px 0 0; }", 1),
    (".inst-sha { display: flex; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; font-size: 14px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 14px; }",
     ".inst-sha { display: flex; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; font-size: 14px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 16px; }", 1),
    (".flow-node .flow-ic { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 auto 10px;",
     ".flow-node .flow-ic { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 auto 12px;", 1),
    ("  .flow-arrow { transform: rotate(90deg); padding: 6px 0; align-self: center; }",
     "  .flow-arrow { transform: rotate(90deg); padding: 8px 0; align-self: center; }", 1),
    (".vs-col h3 { margin-bottom: 14px; }",
     ".vs-col h3 { margin-bottom: 16px; }", 1),
    (".acc-panel p { color: var(--muted); margin: 0; padding: 0 20px 18px; }",
     ".acc-panel p { color: var(--muted); margin: 0; padding: 0 20px 20px; }", 1),
    (".doc-summary h2 { border: 0 !important; padding: 0 !important; margin: 0 0 4px !important; font-size: 18px; }",
     ".doc-summary h2 { border: 0 !important; padding: 0 !important; margin: 0 0 8px !important; font-size: 18px; }", 1),
    (".doc-summary ul { margin: 0; padding-left: 20px; color: var(--muted); display: grid; gap: 4px; font-size: 15.5px; }",
     ".doc-summary ul { margin: 0; padding-left: 20px; color: var(--muted); display: grid; gap: 8px; font-size: 15.5px; }", 1),
    (".teaser-plan .price { margin: 4px 0 8px; }",
     ".teaser-plan .price { margin: 8px 0; }", 1),
    (".finder fieldset {\n  border: 1px solid var(--border); border-radius: var(--radius);\n  padding: 16px 18px 10px; margin: 0 0 14px;\n}",
     ".finder fieldset {\n  border: 1px solid var(--border); border-radius: var(--radius);\n  padding: 16px 16px 8px; margin: 0 0 16px;\n}", 1),
    (".finder legend { font-weight: 650; padding: 0 6px; }",
     ".finder legend { font-weight: 650; padding: 0 8px; }", 1),
    (".radio-pill {\n  display: inline-flex; align-items: center; gap: 8px;\n  border: 1px solid var(--border); border-radius: 999px;\n  padding: 9px 14px; margin: 0 8px 8px 0; cursor: pointer; font-size: 15px;\n}",
     ".radio-pill {\n  display: inline-flex; align-items: center; gap: 8px;\n  border: 1px solid var(--border); border-radius: 999px;\n  padding: 8px 16px; margin: 0 8px 8px 0; cursor: pointer; font-size: 15px;\n}", 1),
    ("  gap: 10px 14px; padding: 12px 56px 12px 20px;",
     "  gap: 8px 16px; padding: 12px 56px 12px 20px;", 1),  # sticky-cta
    ("  .sticky-cta { justify-content: flex-start; padding: 12px 52px 12px 16px; }",
     "  .sticky-cta { justify-content: flex-start; padding: 12px 56px 12px 16px; }", 1),
    ("    border-bottom: 1px solid var(--border); padding: 12px 24px 16px; margin: 0;",
     "    border-bottom: 1px solid var(--border); padding: 12px 16px 16px; margin: 0;", 1),  # mobile nav
    ("  border-bottom-width: 2px; border-radius: 6px; padding: 3px 7px; color: var(--text);",
     "  border-bottom-width: 2px; border-radius: 6px; padding: 4px 8px; color: var(--text);", 1),  # kbd
    ("  text-transform: uppercase; padding: 5px 10px; border-radius: 999px;",
     "  text-transform: uppercase; padding: 4px 10px; border-radius: 999px;", 1),  # badge
    ("table.compare tbody tr { margin-bottom: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 16px; }",
     "table.compare tbody tr { margin-bottom: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 16px; }", 1),
    ("table.compare td { padding: 10px 0; border-bottom: 1px solid var(--border); }",
     "table.compare td { padding: 12px 0; border-bottom: 1px solid var(--border); }", 1),
    ("table.compare td[data-label]::before { content: attr(data-label); display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 3px; }",
     "table.compare td[data-label]::before { content: attr(data-label); display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 4px; }", 1),
    (".app-window-body { padding: 20px 20px 22px; min-height: 268px; }",
     ".app-window-body { padding: 20px; min-height: 268px; }", 1),
]

def main():
    css = open(PATH).read()
    applied = 0
    for old, new, count in FIXES:
        found = css.count(old)
        if found != count:
            print(f"ABORT: expected {count}x but found {found}x: {old[:90]!r}")
            sys.exit(1)
        css = css.replace(old, new)
        applied += count
    open(PATH, "w").write(css)
    print(f"STEP9 FIX DONE: {len(FIXES)} rules, {applied} replacements")

if __name__ == "__main__":
    main()
