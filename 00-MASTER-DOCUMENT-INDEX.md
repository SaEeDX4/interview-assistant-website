# 00 — Master Document Register (Numbered, Owned, Dependency-Mapped)

**Total:** 71 numbered documents; **estimated:** 13,105 physical lines; **actual counted:** 16,531 physical lines.
**Counting:** `len(path.read_text().splitlines())` on each `docs/**/*.md` numbered document. No blank-line padding routine is used; actual line count includes Markdown syntax, tables, acceptance rows and legitimate whitespace.
**Source stance:** Existing Windows product; future Android/iOS/macOS research only. Proposed docs and acceptance tests do not imply software has shipped.

## Estimate arithmetic

- Original 8 docs × 260 planned lines = 2,080 estimated lines.
- New 63 specialist docs × 175 planned lines = 11,025 estimated lines.
- **Estimated total = 2,080 + 11,025 = 13,105 > 10,000.**
- **Actual total = sum of every row below = 16,531 > 10,000.**
- Real documented scope exceeds the initial estimates; actual rows supersede estimates in quality review.

## Documents by area

### Product — 5 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 01 | `docs/01-PRD.md` | Product Requirements: Windows Commercial Website | Fully reconciled and testable upgrade of the attached v1 document | Product Lead | SOURCE, OWNER | 260 | 297 |
| 09 | `docs/product/09-PERSONAS-JTBD.md` | Personas and Jobs to Be Done | Identify evidence-limited target audiences and their real tasks | Product Lead | docs/01-PRD.md | 175 | 223 |
| 10 | `docs/product/10-MEASUREMENT-PLAN.md` | Product Success Metrics and Instrumentation | Measure learning and conversion without collecting interview content | Product Analytics | docs/01-PRD.md, docs/06-CONTENT-SEO.md | 175 | 223 |
| 11 | `docs/product/11-CLAIM-VALIDATION.md` | Claims, Evidence and Truth Gates | Prove each statement before it reaches the public site | Product Lead | docs/06-CONTENT-SEO.md, docs/07-SECURITY-PRIVACY-ETHICS.md | 175 | 241 |
| 12 | `docs/product/12-LAUNCH-SCOPE-AND-NON-GOALS.md` | Launch Scope and Explicit Non-Goals | Prevent scope drift and fabricated future promises | Product Lead | docs/01-PRD.md, docs/08-ROADMAP.md | 175 | 223 |

**Subtotal:** 1,207 actual lines.

### Architecture — 4 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 02 | `docs/02-ARCHITECTURE.md` | Static Website and Backend Boundaries | Fully reconciled and testable upgrade of the attached v1 document | Principal Architect | SOURCE, OWNER | 260 | 209 |
| 13 | `docs/architecture/13-TRUST-BOUNDARIES.md` | System Boundaries and Component Ownership | Isolate public marketing from service credentials and desktop processes | Principal Architect | docs/02-ARCHITECTURE.md, docs/07-SECURITY-PRIVACY-ETHICS.md | 175 | 223 |
| 14 | `docs/architecture/14-INTEGRATION-CONTRACTS.md` | Website and Desktop Integration Contracts | Define concrete touchpoints that can be tested end-to-end | Principal Architect | docs/02-ARCHITECTURE.md, docs/architecture/13-TRUST-BOUNDARIES.md | 175 | 244 |
| 15 | `docs/architecture/15-DATA-FLOW-DIAGRAMS.md` | Data Flows and Trust Boundaries | Specify sensitive-data routes with observable failure states | Principal Architect | docs/architecture/13-TRUST-BOUNDARIES.md, docs/architecture/14-INTEGRATION-CONTRACTS.md | 175 | 223 |

**Subtotal:** 899 actual lines.

### Backend — 8 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 16 | `docs/backend/16-AUTH-PKCE-SESSION.md` | Authentication, PKCE and Session Integrity | Describe authenticated flows and unauthorized-state handling | Backend Lead | docs/architecture/14-INTEGRATION-CONTRACTS.md, docs/security/43-THREAT-MODEL.md | 175 | 242 |
| 17 | `docs/backend/17-POSTGRES-SCHEMA-REVIEW.md` | PostgreSQL Schema, Indexes and Migrations | Map entities to isolation, consistency and reversibility rules | Database Lead | docs/architecture/15-DATA-FLOW-DIAGRAMS.md, docs/backend/16-AUTH-PKCE-SESSION.md | 175 | 223 |
| 18 | `docs/backend/18-ERROR-CONTRACTS.md` | API Error Taxonomy and Recovery | Give clients stable error codes and recoverable next actions | Backend Lead | docs/architecture/14-INTEGRATION-CONTRACTS.md, docs/backend/16-AUTH-PKCE-SESSION.md | 175 | 223 |
| 19 | `docs/backend/19-ENTITLEMENT-STATE.md` | Entitlements and Plan State Machine | Ensure limits live on server not in marketing JS | Backend Lead | docs/05-PRICING-BILLING.md, docs/backend/16-AUTH-PKCE-SESSION.md | 175 | 240 |
| 20 | `docs/backend/20-SESSION-LEASE-METERING.md` | Live Session Leases and Metering | Bound chargeable time and close audio streams promptly | Backend Lead | docs/backend/19-ENTITLEMENT-STATE.md, docs/architecture/15-DATA-FLOW-DIAGRAMS.md | 175 | 241 |
| 21 | `docs/backend/21-AI-PROXY-FAILURE-MODES.md` | AI Proxy, Fallback and Provider Outages | Define provider failures without claiming unsupported multi-vendor redundancy | AI Lead | docs/backend/20-SESSION-LEASE-METERING.md, docs/data-ai/61-FACT-TRUTH-BOUNDARY.md | 175 | 223 |
| 22 | `docs/backend/22-BILLING-WEBHOOK-STATE.md` | Billing Webhook State and Financial Integrity | Protect entitlement state from replay, ordering and fraud | Billing Engineer | docs/05-PRICING-BILLING.md, docs/backend/19-ENTITLEMENT-STATE.md | 175 | 244 |
| 23 | `docs/backend/23-SERVICE-OPERATIONS.md` | Backend Service Operations and SLO Proposals | Make runtime monitoring and incident actions explicit | SRE Lead | docs/backend/18-ERROR-CONTRACTS.md, docs/backend/20-SESSION-LEASE-METERING.md | 175 | 223 |

**Subtotal:** 1,859 actual lines.

### Frontend / Website — 5 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 24 | `docs/frontend-website/24-HTML-SEMANTICS.md` | Semantic HTML and Content Structure | Specify accessible page markup despite missing source HTML | Frontend Lead | docs/04-UX-SPEC.md, docs/03-DESIGN-SYSTEM.md | 175 | 223 |
| 25 | `docs/frontend-website/25-DEMO-STATE-MACHINE.md` | Simulated Demo State Machine and Test Cases | Make the interactive demo truthful and deterministically testable | Frontend Lead | docs/04-UX-SPEC.md, docs/03-DESIGN-SYSTEM.md | 175 | 246 |
| 26 | `docs/frontend-website/26-WEB-VITALS-BUDGET.md` | Website Core Web Vitals and Payload Budgets | Set measured targets before production rollout | Frontend Performance | docs/02-ARCHITECTURE.md, docs/03-DESIGN-SYSTEM.md | 175 | 239 |
| 27 | `docs/frontend-website/27-STRUCTURED-SEO.md` | Search Metadata and Structured Data Validation | Expose only verifiable metadata and crawlable pages | SEO Lead | docs/06-CONTENT-SEO.md, docs/frontend-website/24-HTML-SEMANTICS.md | 175 | 223 |
| 28 | `docs/frontend-website/28-WAITLIST-PRIVACY.md` | Waitlist Submission and Consent Flow | Specify an optional real opt-in with no deceptive form | Frontend Lead | docs/07-SECURITY-PRIVACY-ETHICS.md, docs/frontend-website/24-HTML-SEMANTICS.md | 175 | 223 |

**Subtotal:** 1,154 actual lines.

### Design / System — 4 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 03 | `docs/03-DESIGN-SYSTEM.md` | Premium Dark Design System | Fully reconciled and testable upgrade of the attached v1 document | Design Lead | SOURCE, OWNER | 260 | 266 |
| 29 | `docs/design-system/29-VISUAL-TOKENS.md` | Premium Visual Tokens and Usage Rules | Make visual decisions reproducible from token to screenshot | Design Lead | docs/03-DESIGN-SYSTEM.md, docs/frontend-website/26-WEB-VITALS-BUDGET.md | 175 | 235 |
| 30 | `docs/design-system/30-COMPONENT-STATE-ATLAS.md` | Component Anatomy and State Atlas | Remove ambiguous states from every important control | Design Lead | docs/03-DESIGN-SYSTEM.md, docs/design-system/29-VISUAL-TOKENS.md | 175 | 223 |
| 31 | `docs/design-system/31-MOTION-AND-A11Y.md` | Motion, Focus and Accessibility Decisions | Balance premium animation with readable reduced motion | Accessibility Lead | docs/design-system/29-VISUAL-TOKENS.md, docs/design-system/30-COMPONENT-STATE-ATLAS.md | 175 | 237 |

**Subtotal:** 961 actual lines.

### UX — 4 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 04 | `docs/04-UX-SPEC.md` | Website Experience and Flows | Fully reconciled and testable upgrade of the attached v1 document | UX Lead | SOURCE, OWNER | 260 | 391 |
| 32 | `docs/ux/32-ONBOARDING-JOURNEY.md` | First-Session Onboarding and Activation | Document full flow from site to a truthful first preparation | UX Lead | docs/01-PRD.md, docs/backend/19-ENTITLEMENT-STATE.md | 175 | 223 |
| 33 | `docs/ux/33-CONVERSION-FLOWS.md` | Conversion, Pricing and Trust Journeys | Avoid deceptive conversion and abandoned trial flows | UX Lead | docs/05-PRICING-BILLING.md, docs/04-UX-SPEC.md | 175 | 223 |
| 34 | `docs/ux/34-RTL-LOCALIZATION-UX.md` | Internationalization, RTL and Language QA | Protect Persian Arabic and mixed-script legibility | Localization Lead | docs/03-DESIGN-SYSTEM.md, docs/04-UX-SPEC.md | 175 | 223 |

**Subtotal:** 1,060 actual lines.

### Mobile / Android — 2 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 35 | `docs/mobile-android/35-ANDROID-SHARED-ARCH.md` | Android Companion Architecture Proposal | Plan Android honestly as a future companion first | Android Lead | docs/architecture/13-TRUST-BOUNDARIES.md, docs/data-ai/61-FACT-TRUTH-BOUNDARY.md | 175 | 232 |
| 36 | `docs/mobile-android/36-ANDROID-AUDIO-FEASIBILITY.md` | Android Audio Capture Experiment Plan | Measure whether lawful third-party meeting playback is actually accessible | Android Audio Engineer | docs/mobile-android/35-ANDROID-SHARED-ARCH.md, docs/security/43-THREAT-MODEL.md | 175 | 243 |

**Subtotal:** 475 actual lines.

### Mobile / iOS — 2 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 37 | `docs/mobile-ios/37-IOS-SHARED-ARCH.md` | iOS Companion Architecture Proposal | Propose an honest iPhone app without assuming background audio access | iOS Lead | docs/architecture/13-TRUST-BOUNDARIES.md, docs/data-ai/61-FACT-TRUTH-BOUNDARY.md | 175 | 233 |
| 38 | `docs/mobile-ios/38-IOS-AUDIO-FEASIBILITY.md` | iOS Audio Capture and Store Review Research | Define and test platform constraints before promising live help | iOS Audio Engineer | docs/mobile-ios/37-IOS-SHARED-ARCH.md, docs/security/43-THREAT-MODEL.md | 175 | 239 |

**Subtotal:** 472 actual lines.

### Desktop / Windows — 2 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 41 | `docs/desktop-windows/41-WINDOWS-CURRENT-CAPABILITIES.md` | Windows Product Evidence and Constraints | Keep the public product tied to the implemented Windows path | Windows Lead | docs/architecture/13-TRUST-BOUNDARIES.md, docs/01-PRD.md | 175 | 223 |
| 42 | `docs/desktop-windows/42-WINDOWS-RELEASE-INTEGRITY.md` | Windows Installer, Signing and Update Acceptance | Make installation a verified deliverable not a placeholder CTA | Release Engineer | docs/desktop-windows/41-WINDOWS-CURRENT-CAPABILITIES.md, docs/devops-deployment/58-GITHUB-PAGES-OPERATIONS.md | 175 | 238 |

**Subtotal:** 461 actual lines.

### Desktop / Mac — 2 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 39 | `docs/desktop-mac/39-MAC-NATIVE-ARCH.md` | Dedicated Native macOS App Architecture | Specify a true native Mac product rather than a WPF port | Mac Lead | docs/architecture/13-TRUST-BOUNDARIES.md, docs/data-ai/61-FACT-TRUTH-BOUNDARY.md | 175 | 239 |
| 40 | `docs/desktop-mac/40-MAC-AUDIO-FEASIBILITY.md` | macOS System Audio Architecture and Experiments | Validate ScreenCaptureKit system audio pathways with permission | Mac Audio Engineer | docs/desktop-mac/39-MAC-NATIVE-ARCH.md, docs/security/43-THREAT-MODEL.md | 175 | 234 |

**Subtotal:** 473 actual lines.

### Security — 4 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 07 | `docs/07-SECURITY-PRIVACY-ETHICS.md` | Security Privacy and Ethics | Fully reconciled and testable upgrade of the attached v1 document | Security Lead | SOURCE, OWNER | 260 | 223 |
| 43 | `docs/security/43-THREAT-MODEL.md` | STRIDE Threat Model and Abuse Cases | Prioritize assets, adversaries and concrete controls | Security Lead | docs/07-SECURITY-PRIVACY-ETHICS.md, docs/architecture/13-TRUST-BOUNDARIES.md | 175 | 239 |
| 44 | `docs/security/44-AUTH-AND-API-HARDENING.md` | Security Test Contracts for Auth and APIs | Define exact negative tests for privileged operations | Security Lead | docs/backend/16-AUTH-PKCE-SESSION.md, docs/security/43-THREAT-MODEL.md | 175 | 223 |
| 45 | `docs/security/45-SUPPLY-CHAIN-RELEASE.md` | Dependency, Signing and Supply-Chain Gate | Enforce traceable binary provenance before distribution | AppSec Lead | docs/desktop-windows/42-WINDOWS-RELEASE-INTEGRITY.md, docs/security/43-THREAT-MODEL.md | 175 | 223 |

**Subtotal:** 908 actual lines.

### Privacy — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 46 | `docs/privacy/46-DATA-INVENTORY.md` | Personal Data Inventory and Processing Map | Define what is local remote transient and retained | Privacy Lead | docs/07-SECURITY-PRIVACY-ETHICS.md, docs/architecture/15-DATA-FLOW-DIAGRAMS.md | 175 | 239 |
| 47 | `docs/privacy/47-RETENTION-ERASURE.md` | Retention, Export and Erasure Controls | Avoid incomplete delete promises and invented timelines | Privacy Lead | docs/privacy/46-DATA-INVENTORY.md, docs/backend/19-ENTITLEMENT-STATE.md | 175 | 238 |
| 48 | `docs/privacy/48-DPIA-RISK-REGISTER.md` | Privacy Impact and Cross-Border Assessment | Assess risk and document necessary legal decisions | Privacy Counsel | docs/privacy/46-DATA-INVENTORY.md, docs/privacy/47-RETENTION-ERASURE.md | 175 | 223 |

**Subtotal:** 700 actual lines.

### Legal — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 49 | `docs/legal/49-TERMS-REQUIREMENTS.md` | Terms of Use Requirements for Counsel | Provide enforceable issues for legal drafting without pretending approval | Legal Counsel | docs/07-SECURITY-PRIVACY-ETHICS.md, docs/privacy/48-DPIA-RISK-REGISTER.md | 175 | 223 |
| 50 | `docs/legal/50-PRIVACY-POLICY-REQUIREMENTS.md` | Public Privacy Notice Requirements | Produce a traceable policy specification not fake legal language | Legal Counsel | docs/privacy/46-DATA-INVENTORY.md, docs/privacy/48-DPIA-RISK-REGISTER.md | 175 | 223 |
| 51 | `docs/legal/51-USER-CONSENT-AND-ETHICS.md` | Authorized Use and Informed Choice | Define user safety boundaries without stealth marketing | Policy Lead | docs/legal/49-TERMS-REQUIREMENTS.md, docs/legal/50-PRIVACY-POLICY-REQUIREMENTS.md | 175 | 223 |

**Subtotal:** 669 actual lines.

### Billing — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 05 | `docs/05-PRICING-BILLING.md` | Pricing Billing and Entitlements | Fully reconciled and testable upgrade of the attached v1 document | Billing Lead | SOURCE, OWNER | 260 | 206 |
| 52 | `docs/billing/52-PRICE-APPROVAL.md` | Pricing Approval, Display and Change Control | Separate configured sandbox limits from commercially approved prices | Finance Lead | docs/05-PRICING-BILLING.md, docs/backend/19-ENTITLEMENT-STATE.md | 175 | 239 |
| 53 | `docs/billing/53-REFUNDS-CHARGEBACKS.md` | Refund, Chargeback and Account State Rules | Specify dispute handling that protects paid access and consumers | Billing Lead | docs/backend/22-BILLING-WEBHOOK-STATE.md, docs/billing/52-PRICE-APPROVAL.md | 175 | 223 |

**Subtotal:** 668 actual lines.

### QA / Testing — 4 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 54 | `docs/qa-testing/54-VERIFICATION-STRATEGY.md` | Verification Pyramid and Test Ownership | Make critical confidence evidence reproducible | QA Lead | docs/08-ROADMAP.md, docs/security/43-THREAT-MODEL.md | 175 | 223 |
| 55 | `docs/qa-testing/55-E2E-ACCEPTANCE-MATRIX.md` | End-to-End Commercial Acceptance Matrix | Gate release on realistic user and failure journeys | QA Lead | docs/qa-testing/54-VERIFICATION-STRATEGY.md, docs/ux/32-ONBOARDING-JOURNEY.md | 175 | 243 |
| 56 | `docs/qa-testing/56-WEB-ACCESSIBILITY-AUDIT.md` | Website Accessibility Manual and Automated QA | Test WCAG 2.2 AA with assistive technology | Accessibility Lead | docs/frontend-website/24-HTML-SEMANTICS.md, docs/design-system/31-MOTION-AND-A11Y.md | 175 | 223 |
| 57 | `docs/qa-testing/57-PLATFORM-FEASIBILITY-GATES.md` | Future Platform Proof Experiments | Separate confirmed capture evidence from concept demos | Research QA | docs/mobile-android/36-ANDROID-AUDIO-FEASIBILITY.md, docs/mobile-ios/38-IOS-AUDIO-FEASIBILITY.md, docs/desktop-mac/40-MAC-AUDIO-FEASIBILITY.md | 175 | 223 |

**Subtotal:** 912 actual lines.

### DevOps / Deployment — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 58 | `docs/devops-deployment/58-GITHUB-PAGES-OPERATIONS.md` | Static Website Hosting and Release Management | Publish a deterministic static folder with verified domain | DevOps Lead | docs/02-ARCHITECTURE.md, docs/frontend-website/26-WEB-VITALS-BUDGET.md | 175 | 246 |
| 59 | `docs/devops-deployment/59-RAILWAY-PRODUCTION-GATES.md` | Railway Backend Deployment and Rollback | Tie website claims to running backend and payment readiness | SRE Lead | docs/backend/23-SERVICE-OPERATIONS.md, docs/devops-deployment/58-GITHUB-PAGES-OPERATIONS.md | 175 | 237 |
| 60 | `docs/devops-deployment/60-INCIDENT-PLAYBOOK.md` | Incidents, Alerting and Customer Communication | Define containment and evidence discipline for incidents | Incident Commander | docs/backend/23-SERVICE-OPERATIONS.md, docs/devops-deployment/59-RAILWAY-PRODUCTION-GATES.md | 175 | 223 |

**Subtotal:** 706 actual lines.

### Data / AI — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 61 | `docs/data-ai/61-FACT-TRUTH-BOUNDARY.md` | Grounding and Fact Safety Contract | Never allow unconfirmed candidate assertions to be marketed as fact | AI Lead | docs/01-PRD.md, docs/privacy/46-DATA-INVENTORY.md | 175 | 239 |
| 62 | `docs/data-ai/62-MODEL-EVALUATION.md` | Answer Quality and Latency Evaluation Protocol | Measure model usefulness without scores of candidates | AI Evaluation Lead | docs/backend/21-AI-PROXY-FAILURE-MODES.md, docs/data-ai/61-FACT-TRUTH-BOUNDARY.md | 175 | 234 |
| 63 | `docs/data-ai/63-MULTILINGUAL-VALIDATION.md` | Ten-Language Capability Matrix and Gates | Avoid equating registry support with native-speech production quality | Localization Lead | docs/ux/34-RTL-LOCALIZATION-UX.md, docs/data-ai/62-MODEL-EVALUATION.md | 175 | 241 |

**Subtotal:** 714 actual lines.

### Content / SEO — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 06 | `docs/06-CONTENT-SEO.md` | Content SEO and Claims | Fully reconciled and testable upgrade of the attached v1 document | Content Lead | SOURCE, OWNER | 260 | 226 |
| 64 | `docs/content-seo/64-PUBLIC-COPY-CLAIM-MATRIX.md` | Public Copy Inventory and Proof Rules | Make each sentence traceable to a verification record | Content Lead | docs/06-CONTENT-SEO.md, docs/product/11-CLAIM-VALIDATION.md | 175 | 243 |
| 65 | `docs/content-seo/65-LAUNCH-CONTENT-PLAN.md` | SEO, Education and Launch Publishing | Publish honest search content around interview preparation | Content Lead | docs/frontend-website/27-STRUCTURED-SEO.md, docs/content-seo/64-PUBLIC-COPY-CLAIM-MATRIX.md | 175 | 223 |

**Subtotal:** 692 actual lines.

### Support — 2 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 66 | `docs/support/66-SUPPORT-PLAYBOOKS.md` | Support Triage and Known Failure Recovery | Provide customer-facing steps with correlation-only diagnostics | Support Lead | docs/backend/18-ERROR-CONTRACTS.md, docs/devops-deployment/60-INCIDENT-PLAYBOOK.md | 175 | 223 |
| 67 | `docs/support/67-PRIVACY-REQUEST-RUNBOOK.md` | Data Rights and Sensitive Support Handling | Give support a secure evidence-limited privacy request process | Privacy Operations | docs/privacy/47-RETENTION-ERASURE.md, docs/support/66-SUPPORT-PLAYBOOKS.md | 175 | 223 |

**Subtotal:** 446 actual lines.

### Growth — 2 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 68 | `docs/growth/68-EXPERIMENT-PROGRAM.md` | Ethical Conversion Experiment Design | Test comprehension improvements without deception | Growth Lead | docs/product/10-MEASUREMENT-PLAN.md, docs/ux/33-CONVERSION-FLOWS.md | 175 | 223 |
| 69 | `docs/growth/69-ANALYTICS-PRIVACY.md` | Privacy-Preserving Analytics and Attribution | Make measurement defensible with no transcript collection | Growth Analytics | docs/product/10-MEASUREMENT-PLAN.md, docs/privacy/46-DATA-INVENTORY.md | 175 | 223 |

**Subtotal:** 446 actual lines.

### Roadmap — 3 document(s)

| # | Filename | Title | Purpose | Owner | Dependencies | Est. lines | Actual lines |
|---:|---|---|---|---|---|---:|---:|
| 08 | `docs/08-ROADMAP.md` | Phased Commercialization Roadmap | Fully reconciled and testable upgrade of the attached v1 document | Program Manager | SOURCE, OWNER | 260 | 203 |
| 70 | `docs/roadmap/70-PROGRAM-DEPENDENCIES.md` | Milestone Dependencies and Critical Path | Expose the launch critical path and honest mobile gating | Program Manager | docs/08-ROADMAP.md, docs/devops-deployment/59-RAILWAY-PRODUCTION-GATES.md | 175 | 223 |
| 71 | `docs/roadmap/71-OWNER-DECISION-REGISTER.md` | Owner Decision Log and Consequences | Centralize Saeed decisions and prevent implicit sign-off | Program Manager | docs/08-ROADMAP.md, docs/billing/52-PRICE-APPROVAL.md | 175 | 223 |

**Subtotal:** 649 actual lines.

## Comprehensive total and readiness warning

- Numbered documents: **71**.
- Estimated line counts are budgeting placeholders; actual are measured bytes on disk after generation.
- Actual numbered Markdown lines: **16,531**.
- The comprehensive audit, readme, decision log and website checklist add additional lines but are deliberately excluded from the counted documentation target.
- Numerous controls are **proposed** and not validated; substantive engineering, legal and user testing is a release dependency, not completed by prose.
