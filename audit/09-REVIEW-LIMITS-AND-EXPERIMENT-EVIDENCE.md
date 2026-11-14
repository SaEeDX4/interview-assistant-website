# 09 — Source Review Limits, Reproducible Snapshot and Evidence Rules

**Source:** `https://github.com/SaEeDX4/REAL-TIME-WINDOWS-INTERVIEW-ASSISTANT`
**Read-only branch:** `claude/clever-hopper-m8kdai`
**Observed source head:** `4976e16f5379d38e9b265d3db979d2f8d7d7aa21`.
**Inspection method:** connected GitHub read actions for root docs, every `docs/v2` and `docs/release` file, docs root/user documentation, selected ASP.NET and client source entry points and directory inventories. No changes or pull requests made.

## Review boundary

- Directory inventory does **not** equal complete review of every `.cs`, test fixture, workflow or historical branch. This package makes no claim of a complete line-by-line source-code audit.
- The uploaded `index(1).pdf` is a seven-page print view. `website/index.html` was not attached. DOM references in the checklist are implementation targets, not verified file line numbers.
- Backend deployment and test counts are reported by later repo documents. No fresh end-to-end provider or signing run was executed from this chat.
- Paid/public product launch, future-store approval, native language quality and audio legality cannot be certified by documents alone.

## Reproducibility

1. Compare repository head SHA before implementing changes. If it moved, review current source deltas and refresh all claims.
2. Re-open `docs/release/RELEASE_READINESS.md` and `src/InterviewAssistant.Backend/appsettings.json` at that commit; reconcile with the product decision log.
3. Audit real website HTML, serve it over HTTP, inspect accessibility tree, browser console, network access and current release links.
4. Run signed Windows install, provider-sanctioned sandbox billing and real audio matrix; retain evidence under a team-controlled secure path, not this ZIP.
5. Run `python3 VERIFY_PACKAGE.py` to verify the **documentation package**, which does not certify the application.

## Evidence label contract

- `SOURCE-VERIFIED`: source text/code observed at pinned snapshot, not proof the claim shipped publicly.
- `TEST-VERIFIED`: requires actual test environment, controlled output and dated artifact outside this package.
- `PROPOSED`: design or acceptance test requested, no implementation inferred.
- `UNKNOWN`: vendor account, user decision, legal interpretation or physical-platform behavior needs additional proof.
