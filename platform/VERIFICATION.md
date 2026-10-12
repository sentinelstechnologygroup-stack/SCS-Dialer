# Local migration verification â€” 2026-10-11

- Frozen Base44 source archives and checkpoints preserved. New independent local apps at ../SCS-Dialer and ../SCS-Admin; shared package here.
- Both local production bundles compile without Base44 SDK/Vite plugin. Firebase imports/configuration and standard React/Vite tooling replace those runtime dependencies. Base44 resource files remain unused reference material. Social login/public registration removed from active auth pages.
- Browser navigation: all11 employee pages and36 customer-admin pages render locally.
- Local390px phone smoke: all11 employee main containers fit390px; all36 admin main containers fit375â€“390px depending on scrollbar. Header and bottom tabs visually inspected. These are layout/navigation checks, not complete business workflow acceptance.
- Shared domain tests:2 passed. Functions syntax build and ESLint pass;7 focused tests pass (authorization3, provider/integration contracts4).
- Firestore/Storage emulator tests:3 groups pass. Verified tenant isolation, anonymous/disabled/unverified denial, client role escalation/audit forging denial, admin recording read versus staff denial, client recording upload denial.
- Original admin adapter verification:20 pure assertions plus actual persistence-failure rollback harness previously passed. Existing Base44 UI simulations previously tested; not repeated as live-provider tests.
- Bundle-size warnings remain (~1.4MB JS before compression); code splitting/package cleanup is planned. No npm audit fix executed.
- No GitHub connection, commits/pushes, deployment, live Telnyx operations or CRM modifications. No provider secrets obtained.
- Production stays disabled: client data services are still demo adapters; authentication and callable invitation foundation are not a completed production UI. MFA, complete invitation flow, server/provider ingestion, real provisioning, Atlas integration and native capabilities remain open in ACCEPTANCE.md.


## Membership increment — 2026-10-11
- Added server-controlled workspace discovery, invitation list/revocation, verified-email acceptance, and atomic membership index creation. Invitation hashes/tokens are excluded from list responses.
- Added shared local-emulator membership console: contact subscription, administrator employee list/disable, invite creation/revocation. Membership listener removes data access when inactive. Production gate remains closed; original demo apps remain simulated.
- Functions build/lint and seven unit tests passed. Four Firestore/Storage emulator groups passed, including real invitation transaction, mismatched email rejection, single-use rejection, membership discovery and disabled membership exclusion. Handler tests invoke `.run`; HTTP App Check and UI/device workflows remain unverified.
- Both frontend production builds passed with existing bundle-size warnings.
- Added Telnyx ingestion module with injected signature verifier, server-owned connection-to-company mapping, transactional duplicate suppression and blocked Atlas outbox. No HTTP webhook endpoint, SDK client, outbound provider operation or Atlas delivery is enabled or verified yet.
- Firebase project selection remains pending. No deployment, live communications or GitHub connection.


## Standalone cleanup — 2026-10-11
Retired provider resource folders, OAuth consent pages and empty client/auth parameter modules moved to external recoverable archive Base44-Retirement/20261011-200445 (26 files with hashes). Updated operating rules to standalone Firebase stack. Local image fallback replaces vendor asset; vendor transformation host map disabled. Added npm run check:standalone to both apps. Fixed nine pre-existing unused imports in Dialer. Both production builds and frontend lint passed; Functions build/lint and seven unit tests passed; all four security/invitation emulator groups passed. Browser regression: dialpad digit entry, Messages navigation, mobile admin drawer-to-Employees navigation; 390px employee main width375 scroll375. Prototype interactions remain simulated; cloud project/configuration, full UI Firebase wiring and live provider acceptance are incomplete. No deployment or GitHub connection.


## Firebase contact increment — October 11, 2026
Separate SCS Firebase project approved; actual ID and configuration pending. Added server-side contact create/edit with strict field whitelist, company ownership, transactional membership recheck and atomic audit. Shared emulator acceptance console supports contact editing; prototype phone/admin data adapters remain local until broader migration is complete. Added possession-token invitation inspection before app registration. Five security emulator groups passed including invitation preflight and contact isolation/disabled membership; eight Functions unit tests and build/lint passed. Both demo builds and standalone checks passed; Firebase-mode Admin build also passed. These handler/emulator results do not verify HTTP App Check, Firebase Auth invitation UI, mobile device behavior or live provider operations. Production gate remains disabled.


## Support/customer separation — October 11, 2026
Added separate /support preview routes and default entry; customer /scs routes have fixed company and no role/client switchers. Dialer displays only assigned fictional company. Firebase customers now require canonical server-written users/companyId in addition to active membership; invitation transaction rejects another company assignment. Firestore and Storage rules enforce canonical assignment. Support authority is server-written platformStaff role; client writes denied. Added audited 30-minute actor/company-bound support sessions, customer onboarding with admin invitation and pending ownership number preload, and company-admin number request workflow. Support callable console implements onboarding and request inspection in emulator mode; broad customer operations are still being migrated, and actual support account bootstrap/cloud project setup remain pending. Six security emulator groups passed; ten unit tests and Functions build/lint passed. Both demo builds/lint passed, Firebase-mode Admin build passed. Browser verified visible support drawer navigation with selected GMS, customer selector/role buttons absent, dialer selector absent. Telnyx search adapter is server-only and disabled; ordering, spending limits, quote validation and ambiguous-order recovery are NOT implemented/activated. No live purchases/deployment/GitHub connection.
