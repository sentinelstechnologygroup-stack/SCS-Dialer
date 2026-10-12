# MDX Phone implementation status

## Preserved source

- Base44 app: `6ac732badf9128c696b33c9a`.
- Checkpoint: `6ac747eadb83a8a592a4ef03`.
- Source commit: `09ac4011732229c050a5d3970b532120b97f3e05`.
- Export: `reference/base44/mdx-dial.snapshot.json`; 136 files, no truncated responses. This is reference source, not executable Atlas code.
- Isolated branch: `codex/mdx-phone-system`, based on Atlas commit `e44d353`. Existing uncommitted energy-price work stays in its original checkout.

## Access and automation

Local PowerShell and repository reads work again. Base44 connector reads and checkpoint creation succeeded. Browser/device testing has not yet been reverified. Existing `review-mdx-phone-prototype` heartbeat is ACTIVE every 30 minutes and authorizes monitoring, not implementation.

## Foundations reviewed

Atlas already routes authenticated pages through `src/auth/AuthContext.jsx`, backed by FirebaseAuthProvider. Preserve that account and permission model; do not import Base44 authentication, social login, registration or role switching.

GMS candidates reviewed: `Customer-Portal/firebase/functions/telephony/providers.cjs` and `readiness.cjs`. They implement Telnyx API transport, signature verification, credential lookup, call/conference controls, SMS and configuration gates. They require adaptation: GMS brand/campaign ownership is not MDX employee/department authorization. Source inspection is not evidence of successful live provider testing.

## Model inventory and migration boundaries

| Area | Observed model | Required production work |
| --- | --- | --- |
| Employee phone | Keypad, recents, contacts, voicemail, messages | Favorites, reliable state machine, full More sheet, persistent end control, real audio |
| Mobile navigation | Sidebar removed; bottom tabs | Real viewport/device tests, accessibility and error states |
| Contacts | Editing, picker import, vCard helper | Ownership, deduplication, local cache lifecycle, permission-based native sync |
| Audio | Device picker | Capability detection, actual routing, VoIP call handoff separate from audio selection |
| Notifications/sounds | Menu, settings, ringtone helper | Push registration, background behavior, permissions, native ringtone integration |
| Receptionist | Directory, queue, simulated inbound | Authorized call ownership, tested transfers, parking, recovery |
| Administration | Extensions, departments, routing, staff, history, overview | Server-side provisioning, audit, status/retry, schedules, retention and access |
| Automation | Missed-call auto-text resource | Default-off customer outreach, opt-outs, deduplication, audit and retries |
| Recording/transcription | Generated transcript function | Automatic Telnyx pipeline; never substitute generated text for actual call evidence |
| Identity | Base44 authentication | Atlas employee accounts, authorized personal email exceptions, no self-assigned admin roles |

## Implementation sequence

1. Extract reference components into a namespaced Phone workspace; preserve existing Atlas UI and schemas.
2. Separate provider-independent UI/domain logic, explicit simulation, authenticated Firebase repositories and privileged Functions.
3. Implement and test terminal call-state handling, duplicate-start protection, retries/errors and safe navigation before live calling.
4. Define employee, receptionist, supervisor and administrator permissions; enforce them server-side and in default-deny Firestore/Storage rules.
5. Add secure Telnyx provisioning and verified event handling; keep live calling disabled until account/number/configuration readiness passes.
6. Integrate automatic recording/transcription, messaging and reviewable Atlas follow-ups.
7. Add native clients for background ringing, OS call integration, full contact sync and audio/ringtone controls.
8. Run production build, Functions build/lint, focused unit and emulator security/workflow checks, manual regressions and authorized real-device/provider pilot.

Deployment, number purchase/porting and cancellation of the old provider remain separate, explicitly authorized actions. No production integration, live call or device capability is verified by this source capture.

## Prototype source review — 2026-10-08

Source inspection findings; browser/device behavior remains unverified.
- Call lifecycle: delayed simulated connection must not revive ended calls; retain End during transfers; pending/error states for every command.
- Reception: subscribe to presence; display load failures and retries rather than empty directories; guard repeated commands.
- Messaging: preserve failed drafts, expose retry; separate demo typing/read receipts from provider capabilities; add pagination (currently 50 latest messages for conversation list and 100 oldest for a thread).
- Notifications: deep link to the relevant item; acknowledge missed calls; show load failures honestly.
- Contacts: reviewed import/deduplication, editing, permission handling, and native two-way sync remain acceptance requirements.
- Administration: staff selection currently changes only User.extension_number; enforce consistent extension ownership server-side. Implement invitations, suspension, session/device revocation and offboarding.
- Routing: current form saves a prototype record, not provider provisioning. Add timezone schedules, holiday exceptions, overflow, validated IVR destinations, routing preview/version history, and requested/processing/ready/failed states.
- Security: replace demo role switching and Base44 service-role handlers with Atlas authorization, App Check, and default-deny rules. Remove invented transcripts and recording URLs from production paths.
- Device acceptance: real Android/iPhone background ringing, OS audio routing, ringtone access and lock-screen behavior require native implementation and device tests.

## Standalone product implementation — 2026-10-11

Owner: Sentinels Technology Group. Approved direction supersedes the original Atlas-only implementation sequence. The product lives in apps/phone with an independent package/build/Firebase configuration; Atlas and GMS are company-scoped adapters rather than product dependencies. Prototype review automation is PAUSED.

Implemented: independent responsive React shell, MDX/GMS demo branding, familiar bottom navigation/keypad, explicit simulated call controls with terminal-state guards, company-scoped path and integration-event contracts, default-deny Firestore membership/read boundaries and closed Storage rules. No CRM application code or existing security rules changed.

Validated: standalone production build and three domain tests pass. Emulator and device/manual verification status must be recorded separately. Dependency installation reports advisories requiring triage before release; no audit fix was run.

Not implemented: real authentication/invitations, backend provisioning, persistent contacts/messages/voicemail, Atlas/GMS adapter transport, Telnyx calling/texting/webhooks, native clients, billing and complete role policy. Demo company switch is not production authorization. No deployment or live provider activity.

Validation update: Firestore emulator test passed for cross-company denial, disabled/anonymous denial, assigned-call reads, and forbidden membership escalation. Existing Functions build/lint could not run in this worktree because its dependencies are absent (tsc/cross-env unavailable); Functions source was not changed. Manual browser/device regression remains outstanding.

## Ooma portal workflow inventory — 2026-10-11

Read-only signed-in UI inspection of office-app.ooma.com and office.ooma.com. Inventory is observed capability, not proof that our platform implements it. No calls, messages, fax delivery, meeting start, purchases, or configuration saves performed. Fax composer opened empty; no documents/recipients added. Do not save portal tokens, customer numbers or account contents into reference artifacts.

Employee app observed: Company/Shared/Business contact tabs with search/filter/sort; Calls; Voicemails; Faxes; Meetings; Team Chat; Integrations; More features; floating/minimizable keypad. Call Options exposes noise reduction, outgoing caller-ID selection/privacy, and dial-via external line or mobile app. Fax inbox has search/filter, CSV logs and preview; composer supports multiple recipients (UI limit nine), cover page, PDF attachments (UI limit 10 MB). Meetings offers scheduled/recent/permanent rooms, start/schedule, Google/Microsoft calendar connections and branded booking pages with availability. No in-meeting controls verified.

Admin navigation observed: Dashboard, Settings, Account, Store; Extensions, Users, Phone Numbers, Devices, System, Integrations, AI settings. System tabs: General, 911 Notifications, Dynamic Caller ID, Call Queues, Auto Dialer, Call Blocking, Call Park, Call Recording, Company Directory, Contact Us Widget, HIPAA, Hot Desking, IP Phones, Media, Messaging, Multi-Site Support, Music, Shared Speed Dial, Team Chat. Onboarding checklist includes main-line handling, porting, app downloads, phones, hold/transfer music, blocked callers, caller ID, texting and team chat.

Next inventory pass: inspect each admin settings pane, extension details, user options, call/voicemail filters, team chat, integrations and meeting configuration. Represent features with our own Sentinels branding and simpler UX. Fax and meetings are separate service scopes requiring provider/backend verification; a Base44 UI model cannot validate production delivery or native capabilities. User requests full functional breadth; no claim of completed parity.
