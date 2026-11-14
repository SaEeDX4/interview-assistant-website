# 07 — Saeed Owner Decision Log

**All decisions are recommendations, not recorded approvals.** Select an option, sign and date a decision record. The defaults below keep public claims conservative.

| ID | Decision | Options / question | Recommendation | Consequence if deferred or wrong |
|---|---|---|---|---|
| D01 | Brand and domain | Approve a distinct name/domain now OR defer public launch | Approve domain after conflict/trademark check | Unapproved domain prevents canonical URLs, legal identity and credible support. |
| D02 | Website hosting | Prefer static Pages if header requirements met; otherwise Cloudflare Pages/Netlify after security review | Decide based on real CSP/headers and rollback proof | Premature selection may block security compliance or break root/subpath assets. |
| D03 | Windows download | Publish information-only site; no active installer until trusted signing and hashes | Require signed setup+sha256 and clean PC acceptance | Immediate unverified download risks user trust and SmartScreen warnings. |
| D04 | Live Pro price | Do not present final live price until merchant and finance approval | Model verified current provider costs, churn and taxes | Price mismatch creates checkout or margin issues. |
| D05 | Legal ownership | Counsel approval before any paid promotion | Agree governing law, controller, refund and international transfers | Unreviewed text creates privacy/consumer risk. |
| D06 | Support channel | Approve monitored support channel and hours | Publish real contact, triage and data request route | No support blocks Paddle/consumer trust. |
| D07 | Waitlist | Keep non-collecting draft until privacy and backend budget approved | Name processor, consent, retention and unsubscribe | Fake subscription confirmation harms trust. |
| D08 | Analytics | Start with no scripts; optional aggregated analytics after legal review | Specify consent/lawful basis and opt-out | Unapproved cookies undermine privacy position. |
| D09 | Language marketing | Qualify feature registry; publish quality claims per language only after native and real-audio review | Fund language matrix and native reviewers | Overstated performance risks complaints and failed sessions. |
| D10 | Android scope | Companion-first research; full live only on proven permitted capture | Approve device/meeting-app test matrix | Live promise may be impossible due to app capture policies. |
| D11 | iOS scope | Research and build only companion once value established | Test foreground/background other-app audio and App Store policies | App Store limits may make core live story impossible. |
| D12 | Native Mac scope | Native SwiftUI/AppKit with ScreenCaptureKit proof and notarization plan | Approve dedicated engineering owner | Native audio/security architecture differs from Windows. |
| D13 | Developer mode claim | Do not mention as customer feature unless production artifact includes it | Reconcile newest Release Readiness with shipped configuration | False copy can change customer financial expectations. |
| D14 | Public launch threshold | Launch informational site only if truth/legal ready; paid flow after all gates | Sign go/no-go, verified installer, auth, Paddle, support | Paid first without proof increases dispute risk. |
| D15 | Data rights | Describe backend and Supabase deletion plus vendor/legal exceptions; backup UNKNOWN | Approve retention matrix with host, vendor, counsel | Absolute deletion promise cannot be verified. |
| D16 | Source branch/version | Omit public version until signed stable release digest maps to commit | Record release SHA and tag | Wrong version breaks support and install trust. |

## Decision template

`Decision ID: ___  Approver: Saeed  Selected option: ___  Evidence URI: ___  Effective phase: ___  Recorded at: ___  Reviewed by: ___`

Any UNKNOWN or unapproved decision that governs public payment, legal rights or platform availability is a release block; it is not automatically approved because a document exists.
