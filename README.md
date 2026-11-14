# Interview Assistant — Commercial V2 Documentation and Source Audit

**This is an English-language production planning package**, not an implemented website or a paid live-release certification.

## Package summary

- **71 numbered specialist documents**, owned and dependency-mapped; **16,531 actual physical Markdown lines**, vs **13,105 estimated**; counts independently verified by `MANIFEST.json`.
- **Critical current platform:** Windows 10/11 x64. Android, iOS and a native macOS client are future research only, with separate audio-permission feasibility and companion-only fallbacks.
- **Source checked read-only:** `https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT` on branch `claude/clever-hopper-m8kdai` at commit `4976e16f5379d38e9b265d3db979d2f8d7d7aa21`. Root/docs/v2/docs/release materials and selected code entry points were inspected. Full code line-by-line review, public payment validation and real device testing are **not** complete.
- **Original inputs** saved unchanged under `evidence/original-attachments/` for audit traceability. The website HTML source was not attached; a PDF print view is not the HTML.
- **No GitHub write action occurred.** No PR, commit, push or fork; no original website code was rewritten.

## Reading order

1. `audit/01-EXECUTIVE-VERDICT.md` — launch verdict and top blockers.
2. `audit/02-SOURCE-PROOF.md` — actual repo files fetched, critical conflicts, review limits.
3. `00-MASTER-DOCUMENT-INDEX.md` — complete 71-doc numbering, owner, dependencies, estimate and measured lines.
4. `audit/03-SCORECARD.md`, `audit/04-DETAILED-FINDINGS.md`, `audit/05-CROSS-DOCUMENT-CONFLICTS.md` — precise v1/website assessment.
5. `docs/01-PRD.md` through `docs/08-ROADMAP.md` — revised original eight.
6. `docs/<category>/09...71-...md` — specialist implementation and testing contracts.
7. `audit/06-WEBSITE-CHECKLIST.md` — file/section-specific P0/P1/P2 plan, intentionally **no website code rewrite**.
8. `audit/07-OWNER-DECISION-LOG.md` and `audit/08-CHANGE-LOG.md` — owner decisions and v1-to-v2 delta.

## Readiness semantics

`SOURCE-VERIFIED` means source text or code was inspected, **not** that a paid public service was actually tested. `PROPOSED` identifies recommended future implementation and test design. `UNKNOWN` denotes missing proof. `BLOCKED` means do not publish dependent claims or CTAs.

**Critical unresolved dependencies:** source HTML for real DOM audit, signed and hosted Windows stable installer, Paddle live merchant approval/real checkout E2E, finalized legal/support pages, current release mode verification and native language/audio validation.

**Line-count math:** 8 existing docs × 260 estimated lines + 63 new docs × 175 estimated lines = **13,105 planned lines**. The built documents contain **16,531 actual lines**; the verification script recounted the final file contents rather than using target counts.

## Verification

Run `python3 VERIFY_PACKAGE.py` in this folder to verify numbered document count, physical line total, missing dependency paths and archive file hashes. This script does not connect to GitHub or write to the source repository.
