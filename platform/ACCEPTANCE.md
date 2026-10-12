# SCS acceptance and migration ledger

Owner: Sentinels Technology Group. MDX first client, Golden Marketing Services next. Independent Dialer and Admin applications; Atlas is an integration, not the product host.

## Frozen design references

- Admin: `../SCS-Model-Backups/SCS-Admin/20261011-165656`, source checkpoint `6acc0628f0d9affb23b9bbb5`, commit `8388c3c31c60d0089ead43075ade897da48370cd`.
- Dialer: `../SCS-Model-Backups/SCS-Dialer/20261011-171107`, checkpoint `6acc097e8e186ce57314aac4`, commit `1e9cdc9bbad54fc8530adbd9b638b45faafb983a`.
- Local source changes do not change these references. No Base44/GitHub connection. No deployment authorization.
- Patrick has authorized migration; subjective visual/workflow acceptance remains for Patrick's review. Navigation and selected simulations passing do not imply full feature acceptance.

## Feature gaps against the approved brief

| Area | Evidence in model | Remaining acceptance work |
|---|---|---|
| Dialer, favorites, recents | 11 pages navigate at phone/tablet/desktop; sample outbound and terminal-call guard tested | Provider audio, caller ID permission, multiple-call lifecycle and headset tests |
| Receptionist | Directory, queue, inbound simulator answer/end tested | Live consult/transfer recovery, parking retrieval across employees, coverage handoff |
| Main number/IVR | Admin pages, hours/menu editing model | Real routing engine, simultaneous callers, invalid/no-input, holiday/overflow tests |
| Department queues | Department/ring group controls | Fairness, longest-idle, wrap-up, priority, callbacks and escalation implementation |
| Voicemail | Greeting text, demo test tone, transcript placeholders | Actual recorded speech, shared resolution, retention, secure playback/export |
| Recording/transcription | Automatic simulated indicator, fictional evidence | Telnyx policy/webhook ingestion, disclosure, pause/resume and recording access |
| Scoring/coaching | AI-control settings model | Department scorecards, evidence-linked review, human approval, supervisor features |
| Contacts | Editing/filter/import/export model; company isolation tested | CSV edge cases/dedupe/permissions, native bidirectional permission-based sync |
| SMS/MMS | Draft isolation, failure/retry/newer draft tests, local attachment samples | Registration, provider delivery, opt-outs, attachments, assignment and limits |
| Team chat | Channels, reactions, phone single-pane screenshot verified | Membership permissions, mentions, search, threads, real-time persistence |
| Fax | Inbox/composer sample UI | Provider selection, PDF validation, multi-recipient status and privacy |
| Meetings/booking | Sample rooms/calendar/download/booking preview | Meeting provider, authenticated joins, calendar sync, timezone/collision handling |
| Notifications/ringtones/audio | Preference controls and capability model | Native lock-screen ringing, OS Bluetooth/output/ringtones and permission tests |
| Automations | Prototype settings and former Base44 workflow references | Tenant-scoped durable jobs, idempotency, consent, history and retry handling |
| Administration | 36 pages + platform view navigate; extension isolation/storage rollback tested | Validated server provisioning, invitations, offboarding/revocation, feature permissions |
| Reporting | Sample charts and counters | Call/session metric definitions, transfer dedupe, actual costs and source-backed totals |
| Security | Local prototype role switch; not production access control | Firebase membership/auth/App Check/MFA/recovery, rules, server audit and penetration checks |
| Number migration | Port status model | Portability, documents, provider schedule, cutover and rollback; no port requested |
| Emergency calling | Settings model only | Location workflow, provider configuration and authorized emergency test process |
| Atlas/GMS | Integration placeholders | Authenticated outbox/inbox, tenant mappings, contact matching and duplicate prevention |
| White label | Two fictional workspaces and branding model | Shared canonical IDs, customer invitation/branding isolation and platform ownership operations |

## Delivery gates

1. Local UI: no Base44 network/SDK/plugin runtime; both builds pass and approved layouts survive migration.
2. Security foundation: default deny, active verified memberships, server-only provisioning; cross-company and disabled-user emulator tests pass.
3. Production adapters: Firestore and server commands replace demo storage. Production stays closed while demo adapters remain.
4. Provider pilot: approved temporary numbers, Telnyx credentials via server secrets, verified signature/idempotency, two-way audio and real devices.
5. Atlas/GMS integration: explicit company mappings, signed server delivery and CRM regression tests.
6. Launch: Patrick authorizes deployment; controlled pilot acceptance and number-port plan completed.

No production claims for demo provisioning, delivery, compliance, security, recordings, scoring, emergency calling or native behavior.
