# 06 — Website Implementation Checklist (No Code Rewritten)

**Source gap:** `website/index.html` was not attached; HTML-specific changes are proposals anchored to visible PDF content and existing JS IDs, not verified DOM defects.
**Rule:** implementation is intentionally deferred; all attached CSS and JS are copied unchanged into `website-review/input-copies/`.

| Severity | File | Exact section | Required change | Acceptance |
|---|---|---|---|---|
| P0 | `website/index.html` | Source availability | Provide actual text HTML, inspect semantic sections and actual hrefs; the PDF is not a substitute. | HTML parser reports no missing required element IDs. |
| P0 | `website/index.html` | Download actions | Remove active `Download for Windows` when signed SHA-256 verified public setup is absent. | No active asset link returns a 404, unsigned build or placeholder. |
| P0 | `website/index.html` | Pricing section | Mark USD 19.99 as indicative sandbox reference only until live pricing approval; suppress checkout promise. | Paid CTA not activatable in sandbox-only public state. |
| P0 | `website/index.html` | Footer legal | Link published approved Terms, Privacy, Billing/refund terms or block paid promotion; coming-soon is not acceptable for public payments. | URLs return approved documents and match backend ProductLinks. |
| P0 | `website/index.html` | Language section | Do not imply fully validated real-live quality across ten languages; scope to source registry and verification. | Every public language claim has native+real-audio signoff. |
| P0 | `website/index.html` | Future platforms | Show Android, iOS and native Mac as future research only; no platform store buttons, prices, dates. | Copy review finds zero availability promises. |
| P0 | `website/index.html` | Authorized use | Surface explicit permitted-use statement near live-assist explanation and CTA. | Statement readable without obscurity at 320px. |
| P0 | `website/index.html` | Consent / support | Publish only verified support destination and approved privacy details for any actual data collection. | No data submission without named processor and policy. |
| P0 | `website/app.js` | Waitlist submit (252-260) | Until a real backend exists, preserve explicit no-data-sent message; never show subscribed state. | No network request; success absent from local draft. |
| P0 | `website/index.html` | External scripts | Check source has no uncontrolled third-party script, backend credentials or payment secret. | HAR and repository scan show no unauthorized egress/secret. |
| P1 | `website/app.js` | renderBullets (122-145) | Stagger actual content visibility/DOM insertion rather than only class animation; timer cancellation. | At reveal checkpoints visible counts are 1, 2, 3. |
| P1 | `website/app.js` | showAnswer (174-198) | Prevent stale loading/status from previous question on repeated fast click. | Rapid interaction shows last selected question and no stale content. |
| P1 | `website/app.js` | mode state (200-210) | Use valid pressed state, focus retention, and mode-specific output count. | Coach exactly 3 keys+structure; Answer exactly 3 points. |
| P1 | `website/app.js` | Samples (25-98) | Replace fabricated autobiographical examples or label clearly and persistently as illustrative. | No sample personal career achievement looks like a customer testimonial. |
| P1 | `website/app.js` | Generic typed question (101-113) | Keep fallback generic, no tailored first-person resume claims. | Test arbitrary sensitive questions produce a framework only. |
| P1 | `website/app.js` | DOM IDs (9-15) | Guard against missing nodes and build real HTML integration test. | No null property error on navigation or load. |
| P1 | `website/app.js` | RTL sample (85-98,174-181) | Isolate fa sample language/dir and Latin mixed content. | NVDA and visual RTL pass. |
| P1 | `website/styles.css` | Primary CTA (102-103) | Fix #fff on #7c6cff contrast ~3.86:1. | AA ≥4.5:1 normal text across hover and active. |
| P1 | `website/styles.css` | Tertiary labels (5-22) | Fix #6b7484 on dark surface ~3.84:1. | AA ≥4.5:1 at all normal small-text use sites. |
| P1 | `website/styles.css` | Mobile nav (271-280) | Test open/close overlay, non-overlap and 320px viewport. | Zero horizontal overflow; all controls hit-tested. |
| P1 | `website/styles.css` | Responsive 640px (281-290) | Keep demo input and full buttons visible without unintended scroll. | 320px and 400% zoom interaction complete. |
| P1 | `website/styles.css` | Forced-colors and focus | Audit focus ring contrast in Windows forced-colors mode. | Visible focus indication on all tabbable nodes. |
| P1 | `website/index.html` | Hero accessibility | One h1, logical h2 order and skip target; no duplicated content. | Heading navigation and skip link validated by screen reader. |
| P1 | `website/index.html` | FAQ | Use accessible details/summary or buttons with correct expanded state. | Keyboard and assistive-tech pass. |
| P1 | `website/index.html` | Form semantics | Pair question input label, errors and live region with real nodes. | Input error described and focus moves predictably. |
| P1 | `website/index.html` | Metadata | Canonical, page title and description reflect Windows-only scope; no unsupported structured review. | HTML validator and source-backed SEO audit pass. |
| P1 | `website/index.html` | CSP and deployment | Verify actual static host can meet header requirements; do not assume GitHub Pages supports all custom headers. | Deployed response header audit passes or compensating host chosen. |
| P1 | `website/styles.css` | Reduced motion (291-295) | Preserve all answer text and focus when animations disabled. | Reduced motion does not suppress content. |
| P1 | `website/index.html` | Download metadata | Show exact SHA, certificate publisher, asset build and supported Windows requirements after signed launch. | Digest and certificate match independently downloaded file. |
| P1 | `website/index.html` | Screenshot provenance | Use real app screenshots, no altered UI or invented live demo screen. | Image manifest shows capture source and approval. |
| P2 | `website/styles.css` | Typography (31-45) | Tune type hierarchy via screenshot review without importing slow network fonts. | At 320/768/1440 headings are legible with no widows blocking meaning. |
| P2 | `website/styles.css` | Cards | Provide hover/active/focus/error/skeleton styles consistent with tokens. | State inventory screenshot available. |
| P2 | `website/styles.css` | Accent discipline | Reserve teal for listening and amber for Coach; avoid visual confusion. | Design audit of every colored surface passes. |
| P2 | `website/index.html` | Social sharing | Create real screenshot-based OG image and preview, no invented reviews. | WhatsApp/X/LinkedIn preview matches content. |
| P2 | `website/index.html` | FAQ honesty | Answer offline behavior, minutes, cancellation and authorized use in plain language. | Five-user comprehension test 4/5 understand limits. |
| P2 | `website/index.html` | Motion copy | Call website demo simulated rather than real live transcription. | No page text implies actual audio capture. |
| P2 | `website/app.js` | Mode persistence | Decide whether demo modes reset per question and document it. | Deterministic test for toggle/new sample. |
| P2 | `website/index.html` | SEO discovery | Create robots and sitemap only after a real domain is approved. | Validated URLs return 200. |
| P2 | `website/index.html` | Analytics | Add nothing by default; collect only approved anonymous counts after privacy review. | HAR events contain no question text. |
| P2 | `website/index.html` | Product name and support | Replace provisional IA monogram only after brand approval. | Owner-approved assets and support URL shown. |

## Proposed implementation order

1. Restore/inspect actual HTML and fix P0 public-truth, legal, download and consent states.
2. Repair CSS contrasts and JS stagger; run static and screen-reader tests.
3. Run official account, signed installer, Paddle and legal approvals before actual paid CTA.
4. Execute progressive visual design enhancements without weakening the source-claim gates.
5. Freeze commit + screenshots + test evidence, release behind reversible static deployment.
