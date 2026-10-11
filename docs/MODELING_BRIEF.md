# Sentinels Communication Systems (SCS) modeling brief

Owner: Sentinels Technology Group. Standalone white-label product. MDX first customer, Atlas first CRM adapter, Golden Marketing Services second adapter. Customer membership, branding, data and provider resources must remain isolated. Current UI company selector is demonstration only.

## Modeling scope

Employee desktop: collapsible navigation, Contacts (company/shared/personal/business), Favorites, call history, voicemail with audio playback and transcript, messaging, fax inbox/composer, meetings, team chat, integrations, preferences, notification center. Floating/minimizable keypad, contact search, approved caller ID, device selection, mute, hold, keypad, transfer/consult, conference, park/retrieve, More and persistent End Call.

Fax: recipients, cover page, PDF selection/preview, size validation, outbox, delivery states, retry, logs and exports. Meeting: schedule/join, permanent rooms, calendar connection placeholders, booking-page editor, availability and branding; in-meeting functionality not yet inventoried.

Administration: onboarding, employees/invitations/extensions, numbers and porting status, devices, receptionist/ring groups, queues, IVR, hours/holidays/on-call/overflow, caller ID, emergency notifications, call blocking, parking, automatic recording/transcription policies, directory, contact widget, hot desking, desk phones, media/greetings, messaging registration, multi-site, music, shared speed dial, team chat, integrations, AI controls, reporting, usage, service health, audit, security and offboarding. HIPAA-related settings require separately verified requirements and implementation; do not claim compliance from a mock toggle.

Platform console: customer onboarding, branding, feature flags, membership, service readiness, support, usage and billing placeholders. No live purchases, number ports or account changes from the prototype.

## Migration constraints

Use reusable React components and plain domain objects. Keep Base44 SDK imports inside adapters; domain code and UI should use service interfaces for identity, companies, contacts, calls, inboxes, fax, meetings, notifications and admin. Prefer fictional demo fixtures to adding Base44 entities/functions. No provider secrets, service-role access or real Ooma records in browser code or backups. Firebase Auth/Firestore/Storage/Functions/App Check replace adapters during migration. Telnyx integration is server-side. Preserve existing source until replacement is tested.

## Acceptance

Every navigation entry opens its own screen. Editable demos retain local changes within company scope. Async operations expose pending, success and failure; preserve drafts. Terminal calls cannot reconnect. End stays reachable during More/transfers. Playback must actually play bundled fictional audio or show unavailable. No generated transcript masquerades as a real recording. Mark fax/call/message/meeting behavior simulated; no invented live typing or receipts. Test phone/tablet/desktop layouts, keyboard access, overflow, loading/empty/error/offline states.

## Preservation and current blocker

Local backup includes the 136-file Base44 export captured previously, not a fresh export of today's remote app. Copy verified by matching SHA-256 on 2026-10-11. Live source read/checkpoint failed because Base44 requires reauthentication. Reconnect before modeling or claiming current synchronization. GitHub repository will be created by Patrick; remote is not configured yet. Do not maintain independently edited canonical copies after the repository is established.
