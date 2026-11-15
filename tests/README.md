# tests/

Automated checks for this repository. Everything here is UTF-8 text and
runnable from a fresh clone (from the repo root).

## What is here

| Files | What they are |
|---|---|
| `test-step6.js` … `test-step18.js` | The test suites — one per build step. Each enforces the matching standard in `standards/` (spacing, typography, accessibility, color, SEO, motion, breakpoints, imagery, dead code, self-hosted font). 195 checks total, all green. |
| `fix-step9.py` … `fix-step19.py` | The fix scripts that applied each step's changes. Historical record — already applied, count-asserted (they abort if the old text is not found exactly the expected number of times). Do not re-run them on the live files. |
| `review19.py` | The full final review: runs every suite, audits every internal link + anchor, checks content consistency (prices, minutes, languages), renders every page at several widths, and queries PageSpeed. Results go to `step19-report.json`. |
| `step19-report.json` | The latest full-review results. |
| `README.md` | This file. |

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
