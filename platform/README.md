GitHub handoff: shared package bundled within this repository. Historical verification notes below describe earlier local milestones. Canonical shared implementation: SCS-Admin/platform; synchronize the Dialer snapshot when shared changes are made. No deployment is authorized by this upload.

# SCS shared foundation

Sentinels Technology Group owns this standalone white-label platform. SCS-Dialer and SCS-Admin depend on this local package. No Base44-to-GitHub connection.

`npm test` checks canonical tenant/role contracts. `npm run test:rules` starts only demo Firestore/Storage emulators. Under `functions`, `npm run build`, `npm run lint`, and `npm test` validate server code. No deployment script is provided.

Client Firebase setup requires project configuration and App Check, or explicit localhost emulators. No provider secret belongs in a VITE variable. Email/password/recovery functions exist; employee invitation activation UI, MFA enrollment/recovery, production membership selection and real data adapters remain incomplete. ProductionGate prevents use of demo service/role switches as production access control. Demo mode must be explicitly enabled in `.env.local`.

Server foundation: App Check-enforced callable invitation creation/acceptance and membership disabling, active verified company-admin authorization, single-use hashed invitation token, matching verified email and expiry, transactional membership/audit creation. No invitations emailed, accounts created, users disabled or services deployed during this work. Full callable/emulator integration coverage remains to be added; current server tests cover authorization and event contracts, not all callable workflows.

Telnyx verification contract follows https://developers.telnyx.com/docs/development/sdk/node/webhooks and https://developers.telnyx.com/docs/development/api-fundamentals/webhooks/receiving-webhooks. Inject a maintained SDK verifier with server-only secrets; no SDK client/provider connection exists yet. Event contracts test replay rejection, raw-body forwarding, signature-error propagation and terminal call ordering. They do not establish real signature/provider acceptance. Durable ingestion/outbox, number ownership maps, routing engine, credential provisioning and provider commands remain to be implemented.

Atlas/GMS event envelopes define tenant/resource IDs and exclude private transcripts/media by default. No CRM integration endpoint has been connected or CRM source changed. See ACCEPTANCE.md for the full feature-gap ledger.

Next inputs: choose an isolated SCS Firebase project; configure its Authentication, Firestore, Storage and App Check; choose secure server secret storage for Telnyx. Deployment, provider pilot and porting require separate authorization. Remaining local code work includes production adapters, membership-driven UI, full invitation workflows and integration persistence before provider/device acceptance.


Firebase hosting decision: Patrick approved a separate SCS Firebase project on October 11, 2026. Both apps share this project, with company membership isolation. Actual project ID, client configuration, App Check registration and provider secrets are not configured. Production remains blocked.
