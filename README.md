# Interview Assistant — Commercial Website

The public home of **Interview Assistant** — a Windows interview
preparation and practice coach with a live assist mode for interviews
where assistance is permitted.

**Live site:** https://saeedx4.github.io/interview-assistant-website/

The app listens to the interviewer's audio from a headset, then shows
three short, speakable answers one at a time — built only from facts the
candidate confirmed. It never hides, never records the microphone, and
never stores audio. Windows 10/11 x64 only for now; Android, iOS, and a
native Mac app are future research.

## Repository layout

| Path | What it is |
|---|---|
| `website/` | The live static site (11 pages, CSS, JS, self-hosted Inter). GitHub Pages deploys from here. |
| `standards/` | The engineering standards the site is built to — 13 documents: spacing, typography, accessibility, color, SEO, motion, breakpoints, imagery, dead code, navigation, radius, stability + `FINAL-REVIEW.md`, the Step 19 full final review. |
| `tests/` | Automated checks that enforce the standards, the applied fix scripts, and the full review (`review19.py` + `step19-report.json`). See `tests/README.md` for the suite map and numbering notes. |
| `docs/` | The V2 documentation package: 71 numbered specialist docs (01–08 at root, 09–71 in topic folders). |
| `audit/` | The V2 source audit: verdict, source proof, scorecard, findings, decision log. |
| `evidence/` | Audit traceability inputs: the original V1 attachments, preserved unmodified, plus platform references and PDF observations. |
| `website-review/` | The input-status note: what website source was (and was not) provided for the V2 review. |
| `00-MASTER-DOCUMENT-INDEX.md` | Index of all 71 V2 docs with owners and dependencies. |
| `MANIFEST.json`, `SHA256SUMS.txt`, `VERIFY_PACKAGE.py` | The V2 package manifest, checksums, and verifier (see below). |
| `.github/workflows/static.yml` | The GitHub Pages deploy (Static HTML, artifact `website/`). |
| `.gitignore` | Local-only artifacts (test screenshots, run logs) that are never committed. |

## The website

No build step, no npm, no external fonts, images, or scripts — the font
(Inter, variable) is self-hosted in `website/fonts/`. Preview locally:

```bash
cd website
python3 -m http.server 8000
# then open http://localhost:8000
```

Pricing on the site: Trial 30 lifetime live minutes; Pro USD 19.99/month
with 600 live minutes. **The Pro price is a Paddle sandbox reference —
confirm it before paid checkout opens.** There is no checkout on the site
yet, and the download page says plainly that the signed installer is not
published yet.

## Standards and tests

Every standard in `standards/` is enforced by a test in `tests/`
(32 suites, `test-step6.js` … `test-step40.js` — 470+ checks, all
passing as of Step 40; the count grows with each step). From the repo
root:

```bash
for f in tests/test-step*.js; do node "$f"; done
python3 tests/review19.py   # the Step 19 full review: suites + links + content + renders
```

`tests/step19-report.json` holds the Step 19 final review's results
(195/195 checks at that step, 0 broken links, all pages exactly
viewport-wide at 320–1280px, Lighthouse 98/100/100/100) — a historical
record, kept as evidence; the current battery above is the live one.

## The V2 documentation package

`docs/`, `audit/`, `00-MASTER-DOCUMENT-INDEX.md`, `MANIFEST.json`,
`SHA256SUMS.txt`, and `VERIFY_PACKAGE.py` are the Commercial V2 package:
71 numbered docs (16,531 lines), 45 audit findings, 40 website checklist
items, 16 owner decisions. The package also includes `evidence/` (the
original V1 attachments, preserved unmodified, for audit traceability)
and `website-review/` (the input-status note). Reading order:

1. `audit/01-EXECUTIVE-VERDICT.md` — launch verdict and top blockers.
2. `audit/02-SOURCE-PROOF.md` — what was actually inspected.
3. `00-MASTER-DOCUMENT-INDEX.md` — the full 71-doc index.
4. `audit/03-SCORECARD.md`, `audit/04-DETAILED-FINDINGS.md`,
   `audit/05-CROSS-DOCUMENT-CONFLICTS.md`.
5. `docs/01-PRD.md` … `docs/08-ROADMAP.md`, then
   `docs/<category>/09…71-….md`.
6. `audit/06-WEBSITE-CHECKLIST.md`, `audit/07-OWNER-DECISION-LOG.md`,
   `audit/08-CHANGE-LOG.md`.

Verify the package (from the repo root — it checks document counts, line
totals, dependency paths, and file hashes):

```bash
python3 VERIFY_PACKAGE.py
```

**Do not edit a checksummed file without updating its row in
`SHA256SUMS.txt`** (recompute the SHA-256 of the new content), or the
verifier fails. The package is an archive: the website was built from it,
but the website is the living product now.

## Status — what is still open

- **16 owner decisions (D01–D16)** — brand/domain, hosting, signed
  download, live Pro price, legal, support channel, analytics, language
  marketing, platform scope, developer mode, launch threshold, data
  rights, version — all deferred to the end. See
  `audit/07-OWNER-DECISION-LOG.md`.
- **Launch blockers:** live Paddle payment validation, signed Windows
  installer + published SHA-256, final legal/support pages, real
  device/audio/language E2E tests. The site is honest about all of these;
  it is not yet a shippable paid public product.

## Working rules

1. **The source app repo is read-only.** Never edit, create, or delete
   anything in
   [`SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT`](https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT)
   from this project.
2. **No GitHub writes without Saeed's explicit permission.** That includes
   this repo.
3. **No invented claims.** If the app does not do it, the website does not
   claim it: no hidden mode, no microphone recording, no audio storage, no
   hiring-outcome predictions, no scores, no fake testimonials, dates, or
   download links.
4. **Use only where allowed.** Every public surface carries the
   authorized-use message.
