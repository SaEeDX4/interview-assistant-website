# 04 — Detailed Audit Findings (P0/P1/P2)

**Scope:** all supplied Markdown, CSS, JS and seven-page PDF; repository docs plus selected critical C# contracts. The exact website HTML is absent.
**Severity:** P0 public-launch/audit blocker; P1 major risk; P2 polish/test debt. Findings are testable proposals, not claims that new code was implemented.

## F-001 — P0 — `website/index.html`

**Location:** `website/index.html` (not supplied as source file).
**Issue / quote:** `not attached` — Actual HTML file absent: only `index(1).pdf` shows printed markup, so cannot inspect semantic DOM, CSP/meta, href destinations or dead links.
**Concrete fix:** Provide exact `website/index.html` and run parser, keyboard and link audits.
**Basis:** Evidence: attachment inventory.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-002 — P0 — `08-ROADMAP.md`

**Location:** `08-ROADMAP.md` source attachment `08-ROADMAP(2).md` L31.
**Issue / quote:** `Paddle sandbox` — No source proves a successful paid public Paddle live checkout or signed stable Windows installer, regardless of backend service health.
**Concrete fix:** Block buy/download CTAs until sandbox E2E, Paddle live approval, signing and hash proven.
**Basis:** Repo docs/release/RELEASE_READINESS.md; RC5_COMMERCIALIZATION_READINESS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-003 — P0 — `04-UX-SPEC.md`

**Location:** `04-UX-SPEC.md` source attachment `04-UX-SPEC(2).md` L29.
**Issue / quote:** `Privacy Policy` — No approved Terms, Privacy and Billing Terms linked; ethics snippet alone cannot safely replace actual public policies for a paid product.
**Concrete fix:** Counsel approves real legal URLs matching backend `ProductLinks`; support identity published.
**Basis:** Repo docs/release/RELEASE_READINESS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-004 — P0 — `06-CONTENT-SEO.md`

**Location:** `06-CONTENT-SEO.md` source attachment `06-CONTENT-SEO(2).md` L4.
**Issue / quote:** `10 languages` — Ten-language resource/registry capability must not be interpreted as verified real live transcription and answer quality in all languages.
**Concrete fix:** Language claim downgraded until named per-language real-audio + native review sign-off.
**Basis:** Repo docs/v2/MULTILINGUAL_VALIDATION.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-005 — P0 — `08-ROADMAP.md`

**Location:** `08-ROADMAP.md` source attachment `08-ROADMAP(2).md` L107.
**Issue / quote:** `Android` — Current roadmap covers Android but not native Mac or iOS; new user-required scope absent.
**Concrete fix:** Add Android, iOS, native Mac architecture, permission models and experiments with companion fallback.
**Basis:** Original roadmap section and future platform requirement.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-006 — P1 — `README.md`

**Location:** `README.md` source attachment `README(4).md` L70.
**Issue / quote:** `Developer mode` — Staging README suggests developer own-key capability as broadly current, while later commercial readiness limits customer builds to service-only with developer mode in Debug/DeveloperBuild.
**Concrete fix:** Publish mode distinctions only after checking the actual production build configuration.
**Basis:** Repo docs/release/RELEASE_READINESS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-007 — P1 — `01-PRD.md`

**Location:** `01-PRD.md` source attachment `01-PRD(3).md` L27.
**Issue / quote:** `Existing prep tools` — Competitor-wide differentiation claim lacks dated comparative evidence.
**Concrete fix:** Replace with testable positioning hypothesis and independent competitor matrix.
**Basis:** Absence of competitor citations in attached PRD.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-008 — P1 — `01-PRD.md`

**Location:** `01-PRD.md` source attachment `01-PRD(3).md` L68.
**Issue / quote:** `under 10 seconds` — Comprehension goal uses aspirational study but no results, recruiting criteria or pass threshold.
**Concrete fix:** Document moderated five-person test with clear pass 4/5 and no study-complete claim.
**Basis:** Attached PRD goals.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-009 — P1 — `01-PRD.md`

**Location:** `01-PRD.md` source attachment `01-PRD(3).md` L10.
**Issue / quote:** `Android` — PRD introduces Android funnel but not iOS or native Mac future research; user plan differs.
**Concrete fix:** Add independent roadmap and feature-status table for all four target platforms.
**Basis:** Original scope and roadmap.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-010 — P1 — `01-PRD.md`

**Location:** `01-PRD.md` source attachment `01-PRD(3).md` L70.
**Issue / quote:** `Download` — Installer conversion metric is not tied to actual signed artifact fetch or trial activation.
**Concrete fix:** Measure CTA event separately from confirmed HTTP download and first-ready Windows session.
**Basis:** Download path not yet available.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-011 — P1 — `02-ARCHITECTURE.md`

**Location:** `02-ARCHITECTURE.md` source attachment `02-ARCHITECTURE(2).md` L67.
**Issue / quote:** `Railway` — Older docs describe incomplete deployment validation while later source readiness describes running Railway and green smoke; snapshots are inconsistent.
**Concrete fix:** Maintain source snapshot and evidence status matrix; do not promote operational readiness to paid launch.
**Basis:** Repo docs/v2/DEPLOYMENT.md; docs/release/RELEASE_READINESS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-012 — P1 — `02-ARCHITECTURE.md`

**Location:** `02-ARCHITECTURE.md` source attachment `02-ARCHITECTURE(2).md` L16.
**Issue / quote:** `GitHub Pages` — Host recommendation lacks authoritative final custom domain and verified HTTPS/CSP/rollback design.
**Concrete fix:** Record owner-selected host, deploy path, cache policy and actual headers.
**Basis:** No domain supplied.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-013 — P1 — `02-ARCHITECTURE.md`

**Location:** `02-ARCHITECTURE.md` source attachment `02-ARCHITECTURE(2).md` L71.
**Issue / quote:** `Android notify-me` — Waitlist integration has no approved processor, API, consent language or retention.
**Concrete fix:** Either disable collection or implement verified opt-in with deletion and abuse controls.
**Basis:** Attached file explicitly describes local-only demo.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-014 — P1 — `02-ARCHITECTURE.md`

**Location:** `02-ARCHITECTURE.md` source attachment `02-ARCHITECTURE(2).md` L64.
**Issue / quote:** `Signed installer` — Document promises a signed artifact in future but no verified URL or checksum.
**Concrete fix:** Define release manifest URL/hash and acceptance tests before activation.
**Basis:** Repo docs/v2/INSTALLER_AND_UPDATES.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-015 — P1 — `03-DESIGN-SYSTEM.md`

**Location:** `03-DESIGN-SYSTEM.md` source attachment `03-DESIGN-SYSTEM(2).md` L39.
**Issue / quote:** `--muted-2` — Specified tertiary token is too dim for small caption text (actual #6b7484 on #12161e ≈3.84:1).
**Concrete fix:** Replace token in CSS and design source after color audit, target ≥4.5:1.
**Basis:** Attached styles.css token.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-016 — P1 — `03-DESIGN-SYSTEM.md`

**Location:** `03-DESIGN-SYSTEM.md` source attachment `03-DESIGN-SYSTEM(2).md` L40.
**Issue / quote:** `--accent` — Primary CTA uses #fff on #7c6cff (approx 3.86:1) under WCAG AA for normal text.
**Concrete fix:** Use dark text on current violet (≈5.08:1) or change accent to tested darker purple, including hover state.
**Basis:** styles.css `.btn-primary`.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-017 — P1 — `03-DESIGN-SYSTEM.md`

**Location:** `03-DESIGN-SYSTEM.md` source attachment `03-DESIGN-SYSTEM(2).md` L61.
**Issue / quote:** `Light theme` — Website dark-only is allowed, but contrast and OS forced-colors behavior have no test evidence.
**Concrete fix:** Manual forced-colors and 400% zoom checks with screenshot attachments.
**Basis:** WCAG 2.2 AA.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-018 — P2 — `03-DESIGN-SYSTEM.md`

**Location:** `03-DESIGN-SYSTEM.md` source attachment `03-DESIGN-SYSTEM(2).md` L68.
**Issue / quote:** `system stack` — The system stack is performant but premium typography and data-dense screenshots were not visually validated.
**Concrete fix:** Build a typographic QA sheet and compare tested hierarchy on real devices, no invented top percentile.
**Basis:** User-requested benchmark, visual evidence missing.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-019 — P1 — `04-UX-SPEC.md`

**Location:** `04-UX-SPEC.md` (phrase not matched; inspect full section).
**Issue / quote:** `You’re on the list` — Draft flow suggests success after submit, but `app.js` explicitly says nothing was sent.
**Concrete fix:** Replace flow success with honest local-demo state; only successful backend acknowledgement may show subscription success.
**Basis:** app.js lines 252–260.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-020 — P1 — `04-UX-SPEC.md`

**Location:** `04-UX-SPEC.md` source attachment `04-UX-SPEC(2).md` L139.
**Issue / quote:** `one at a time` — JavaScript appends all bullets immediately; animation class is delayed, not DOM availability.
**Concrete fix:** Stage visibility/DOM insertion and announce complete result accessibly, with timer cancellation test.
**Basis:** app.js lines 122–145.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-021 — P1 — `04-UX-SPEC.md`

**Location:** `04-UX-SPEC.md` source attachment `04-UX-SPEC(2).md` L13.
**Issue / quote:** `FAQ` — FAQ and trust content are present but no browser semantic/keyboard evidence exists without HTML source.
**Concrete fix:** Run real DOM and screen-reader tests once index.html supplied.
**Basis:** Missing attachment.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-022 — P2 — `04-UX-SPEC.md`

**Location:** `04-UX-SPEC.md` source attachment `04-UX-SPEC(2).md` L5.
**Issue / quote:** `sticky` — Sticky nav and anchor offsets need 320px, 200% zoom and keyboard access verification.
**Concrete fix:** Visual regression snapshots and focus restoration protocol.
**Basis:** styles.css responsive styles.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-023 — P0 — `05-PRICING-BILLING.md`

**Location:** `05-PRICING-BILLING.md` source attachment `05-PRICING-BILLING(2).md` L18.
**Issue / quote:** `19.99` — USD 19.99 is a Paddle sandbox reference, not a reviewed paid-live price or active sale.
**Concrete fix:** Keep explicit sandbox qualification and gate public subscribe buttons on merchant approval.
**Basis:** Repo docs/v2/ENTITLEMENTS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-024 — P1 — `05-PRICING-BILLING.md`

**Location:** `05-PRICING-BILLING.md` source attachment `05-PRICING-BILLING(2).md` L60.
**Issue / quote:** `0.006/min` — Unit-economics assumption from historic model pricing may be stale.
**Concrete fix:** Obtain dated provider invoices/price sheet and 600-minute all-in cost simulation.
**Basis:** Source estimates not independent evidence.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-025 — P1 — `05-PRICING-BILLING.md`

**Location:** `05-PRICING-BILLING.md` source attachment `05-PRICING-BILLING(2).md` L71.
**Issue / quote:** `Refund` — Payment handling and refunds require actual provider sandbox events, not only signed local fixtures.
**Concrete fix:** Run full refund, partial adjustment, chargeback, reversal and portal tests on named account.
**Basis:** Repo docs/v2/BILLING.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-026 — P1 — `05-PRICING-BILLING.md`

**Location:** `05-PRICING-BILLING.md` source attachment `05-PRICING-BILLING(2).md` L100.
**Issue / quote:** `Developer` — User-owned key and provider-billed dev mode must not be advertised in production if excluded by build flags.
**Concrete fix:** Test actual customer installer, align price FAQ to shipped mode.
**Basis:** Repo docs/release/RELEASE_READINESS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-027 — P1 — `06-CONTENT-SEO.md`

**Location:** `06-CONTENT-SEO.md` source attachment `06-CONTENT-SEO(2).md` L84.
**Issue / quote:** `Android is coming` — Future platform claim sounds committed despite unresolved media capture and no product release date.
**Concrete fix:** Use "Android under research; preparation-only scope possible" and equivalent iOS/native Mac roadmap labels.
**Basis:** Android API policy / future specs.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-028 — P1 — `06-CONTENT-SEO.md`

**Location:** `06-CONTENT-SEO.md` source attachment `06-CONTENT-SEO(2).md` L53.
**Issue / quote:** `download` — Public copy mentions download without a verified signed and hosted artifact.
**Concrete fix:** Disable CTA or label early access informational until signature/hash URL passes.
**Basis:** Repo INSTALLER_AND_UPDATES.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-029 — P1 — `06-CONTENT-SEO.md`

**Location:** `06-CONTENT-SEO.md` source attachment `06-CONTENT-SEO(2).md` L93.
**Issue / quote:** `Claim-to-source` — Claim matrix references file titles but not commit IDs or implementation vs externally tested distinction.
**Concrete fix:** Use claim IDs, source SHA, verified status, and re-review date.
**Basis:** Repository release snapshots vary.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-030 — P2 — `06-CONTENT-SEO.md`

**Location:** `06-CONTENT-SEO.md` source attachment `06-CONTENT-SEO(2).md` L1.
**Issue / quote:** `SEO` — Canonical domain, actual image asset, robots and sitemap are pending decisions.
**Concrete fix:** Publish only after domain and actual tested OG image are approved.
**Basis:** No verified domain in attachments.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-031 — P1 — `07-SECURITY-PRIVACY-ETHICS.md`

**Location:** `07-SECURITY-PRIVACY-ETHICS.md` source attachment `07-SECURITY-PRIVACY-ETHICS(2).md` L91.
**Issue / quote:** `not yet` — Draft source-status section is stale: later release reports live Railway service and Supabase identity delete queue with service-role dependency.
**Concrete fix:** Reconcile against latest release-readiness + code; document queue/failure and provider boundaries.
**Basis:** docs/v2/DEPLOYMENT.md; RC5 account audit.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-032 — P1 — `07-SECURITY-PRIVACY-ETHICS.md`

**Location:** `07-SECURITY-PRIVACY-ETHICS.md` source attachment `07-SECURITY-PRIVACY-ETHICS(2).md` L115.
**Issue / quote:** `10 MB` — File upload limit is described as 10MB while backend appsettings has `MaxDocumentBytes=2097152`. Could be separate local and server paths; not reconciled.
**Concrete fix:** Trace each upload/import limit to exact client/backend path, then publish correct user-facing limit.
**Basis:** Backend appsettings.json.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-033 — P1 — `07-SECURITY-PRIVACY-ETHICS.md`

**Location:** `07-SECURITY-PRIVACY-ETHICS.md` source attachment `07-SECURITY-PRIVACY-ETHICS(2).md` L152.
**Issue / quote:** `GDPR` — Lawful basis, cross-border transfers, processors, backup erasure and breach reporting are legal decisions without sign-off.
**Concrete fix:** Draft region-specific compliance matrix and counsel-approved public notice.
**Basis:** No counsel sign-off evidence.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-034 — P1 — `07-SECURITY-PRIVACY-ETHICS.md`

**Location:** `07-SECURITY-PRIVACY-ETHICS.md` source attachment `07-SECURITY-PRIVACY-ETHICS(2).md` L160.
**Issue / quote:** `No audio` — "No audio storage" is true of app/relay implementation, but not equal to no network transfer or third-party processing.
**Concrete fix:** Describe transient OpenAI audio processing with consent and provider retention verification.
**Basis:** docs/v2/PRIVACY_IMPLEMENTATION.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-035 — P1 — `08-ROADMAP.md`

**Location:** `08-ROADMAP.md` source attachment `08-ROADMAP(2).md` L34.
**Issue / quote:** `Phase 2` — Roadmap lacks precise kill/pause gates when billing approval, signed artifacts or legal pages fail.
**Concrete fix:** Adopt five gated phases with publish-only-when-evidenced controls.
**Basis:** Current roadmap.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-036 — P1 — `08-ROADMAP.md`

**Location:** `08-ROADMAP.md` source attachment `08-ROADMAP(2).md` L14.
**Issue / quote:** `test` — Older 201/44 test counts do not match later release readiness 215/78, and are both historical snapshots.
**Concrete fix:** Record source date/commit and current CI run before using numbers publicly.
**Basis:** docs/v2/STATUS_REPORT_V2.md vs docs/release/RELEASE_READINESS.md.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-037 — P1 — `08-ROADMAP.md`

**Location:** `08-ROADMAP.md` (phrase not matched; inspect full section).
**Issue / quote:** `timeline` — Timeboxes are proposals but depend on account approvals outside engineer control.
**Concrete fix:** Relative Week 1 etc only, exit on evidence not date.
**Basis:** Current roadmap.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-038 — P1 — `styles.css`

**Location:** `styles.css` source attachment `styles.css` L14.
**Issue / quote:** `--muted-2` — Tertiary small text color fails WCAG AA in dark surfaces.
**Concrete fix:** Change token to accessible value; audit every call site at normal and high contrast.
**Basis:** CSS lines 5–22; contrast calculation.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-039 — P1 — `styles.css`

**Location:** `styles.css` source attachment `styles.css` L102.
**Issue / quote:** `.btn-primary` — White text on violet CTA fails WCAG AA normal-text contrast.
**Concrete fix:** Use near-black foreground or darker violet and retest states.
**Basis:** CSS `.btn-primary` lines 102–103.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-040 — P1 — `styles.css`

**Location:** `styles.css` source attachment `styles.css` L192.
**Issue / quote:** `@media` — No evidence from provided render of actual mobile reflow, focus visibility under forced colors, or 320px horizontal overflow.
**Concrete fix:** Capture real browser screenshots and automated axe/keyboard checks.
**Basis:** CSS media queries.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-041 — P1 — `app.js`

**Location:** `app.js` source attachment `app.js` L122.
**Issue / quote:** `renderBullets` — All bullets are inserted before timeouts; stagger only adds animation class, violating literal sequential appearance.
**Concrete fix:** Render progressively with screen-reader-safe final state, or change the marketing wording to animation-only.
**Basis:** JS lines 122–145.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-042 — P1 — `app.js`

**Location:** `app.js` source attachment `app.js` L24.
**Issue / quote:** `SAMPLES` — Illustrative answers include invented employment and product leadership detail; clearly demo-only and not user-specific, but can be mistaken as actual personal proof.
**Concrete fix:** Keep an always-visible illustrative badge and use generic first-person-free examples.
**Basis:** JS lines 25–82.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-043 — P1 — `app.js`

**Location:** `app.js` source attachment `app.js` L252.
**Issue / quote:** `notify` — Waitlist locally rejects persistence; it cannot capture interest as promised in PRD.
**Concrete fix:** Explicitly mark unavailable, then add a real consented endpoint only after owner approval.
**Basis:** JS lines 252–260.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-044 — P2 — `app.js`

**Location:** `app.js` source attachment `app.js` L18.
**Issue / quote:** `currentKey` — No end-to-end DOM test proves absent elements cannot throw at startup.
**Concrete fix:** Add guard and browser smoke test for all expected IDs once HTML is supplied.
**Basis:** JS element references lines 9–15.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.

## F-045 — P2 — `index(1).pdf`

**Location:** `index(1).pdf` (not supplied as source file).
**Issue / quote:** `un-styled` — Printed page shows default blue links and no premium dark styling, possibly print CSS / missing stylesheet only.
**Concrete fix:** Use actual HTML served with styles, capture screen snapshots; do not assume screenshot proves live rendering.
**Basis:** PDF page 1 and page 7.
**Acceptance:** owner confirms both the corrected source-backed wording and an attached test or decision record; unsupported public CTA stays disabled.
