# 05 — Cross-Document Conflict Register

| Conflict | Earlier text | Later / code evidence | Required resolution | Status |
|---|---|---|---|---|
| Runtime | BUILD.md describes .NET 8 | global.json SDK 10.0.100 and architecture .NET 10 | Update installation/build instructions for current release | OPEN |
| Backend deploy | STATUS_REPORT_V2 says deployment smoke pending | DEPLOYMENT + RELEASE_READINESS describe running Railway and checks | Date/commit evidence; do not confuse live service with commercial signoff | PARTIALLY RECONCILED |
| Test counts | STATUS_REPORT_V2: 201 core, 44 backend | RELEASE_READINESS: 215 core, 78 backend | Cite source snapshot; re-run CI for current count | OPEN |
| Developer mode | README and older client docs describe user own-key | Later RELEASE_READINESS says Debug/DeveloperBuild only | Verify release artifact before marketing dev mode | OPEN |
| Audio logs | Historical SECURITY.md says duplicate-suppression question text can be logged | PRIVACY_IMPLEMENTATION and v2 Security say content-free logs | Inspect current log statements in built release; do not overpromise | OPEN |
| Deleting identity | Old status says Supabase identity deletion absent | RC3/RC5 describe service-role admin deletion queue | Prove actual configured status and deletion through provider | OPEN |
| Upload size | Attached security says 10 MB upload | Backend appsettings MaxDocumentBytes = 2 MiB | Separate local importer from cloud endpoint and prove each | OPEN |
| Language quality | Registry has ten locales | MULTILINGUAL_VALIDATION says live real audio/native review pending | Gate claims by language tested | OPEN |
| Billing | Sandbox Pro 19.99 plan reference | Later deployed catalog may show 19.99 but live Paddle still blocked | Merchant + price approval and receipts before buy | OPEN |
| Download | Website CTA text says Windows download | Release candidate unsigned, no verified public signing | Signed asset SHA/source-commit map | OPEN |
| Site waitlist | UX spec implies completed sign-up | app.js local draft reports no email sent | Remove success claim until real endpoint | OPEN |
| Future platforms | Existing docs Android only | User scope Android, iOS, native Mac | Separate audio/legal/permission feasibility gate for each | DESIGN ADDED |

**Precedence rule:** live source code and release-qualified artifacts outweigh older general descriptions; a later document is not by itself proof the claimed integration was exercised in real production. UNKNOWN stays unknown when proof is absent.
