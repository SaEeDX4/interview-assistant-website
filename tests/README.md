# tests/

Automated checks for this repository. Everything here is UTF-8 text and
runnable from a fresh clone (from the repo root).

## What is here

| Files | What they are |
|---|---|
| `test-step6.js` … `test-step41.js`, `test-step46.js`, `test-step48.js`, `test-step50.js`, `test-step53.js`, `test-step54.js` | The test suites — one per build step. Each enforces the matching standard in `standards/` plus that step's own contracts. 579 checks across 39 suites, all green. |
| `sim-step22.js`, `sim-step23-demo.js`, `sim-step30-hero.js`, `sim-step41-download.js`, `sim-step48-growth.js`, `sim-step54-assistant.js` | DOM simulations of the story player, the demo, the hero, the download page, the growth announcements, and the support assistant — they drive the real `app.js` against a stub DOM and assert behaviour (modes: `--reduced`, `--ai`, `--fa`, `--ar`, `--fr`). |
| `reverify*.py` | Post-push checks: each asserts its step's markers against the live GitHub Pages output. |
| `fix-step9.py` … `fix-step19.py` | The fix scripts that applied each early step's changes. Historical record — already applied, count-asserted (they abort if the old text is not found exactly the expected number of times). Do not re-run them on the live files. |
| `review19.py` | The Step 19 full final review: runs every suite, audits every internal link + anchor, checks content consistency (prices, minutes, languages), renders every page at several widths, and queries PageSpeed. Results go to `step19-report.json`. |
| `step19-report.json` | The Step 19 review's results — a historical record, not the current battery's state. |
| `README.md` | This file. |

## Numbering

Suites are named for the build step that introduced them, so the
numbers track the project's step history. The gaps are deliberate,
not lost files:

- **Step 19** was a review step, not a standards step — its artefacts
  are `review19.py` and `step19-report.json` above.
- **Step 31** (language-matched hero sample) extended the Step 30
  suite and its simulator modes instead of adding a suite.
- **Step 37** suites were removed together with the Step 37a build
  they tested when that build was rolled back in full.
- **Steps 1–5** predate the suite convention.

## How to run

```bash
# from the repo root — every suite, one by one
for f in tests/test-step*.js; do node "$f"; done

# the full review (needs network: Microlink renders + PageSpeed)
python3 tests/review19.py
```

The suites read `website/` only (plus `test-step18.js`, which also reads
`standards/TYPOGRAPHY.md`). Nothing here writes to the site.

## What is NOT committed

Screenshots and run logs stay local (see `.gitignore`):

- `tests/*-captures/` — Microlink screenshot renders (binary PNGs).
- `tests/*.log` — per-run logs.
- `tests/mobile-verify/` — phone-verification screenshots.
- `tests/__pycache__/` — Python bytecode.
