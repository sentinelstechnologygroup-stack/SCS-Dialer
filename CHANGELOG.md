# SCS Dialer — Changelog

This file is a development changelog only — it is **not** a Base44 platform
checkpoint. A real source checkpoint (code, schemas, backend functions) must
be created from the app dashboard's Version History. All calls, messages,
faxes, and meetings are simulated demo data; no live provider operations are
performed.

## v0.3.0 — 2026-10-11 (Completeness pass)

### Calling
- Floating, minimizable desktop dialer widget with caller ID and dial-via-device
  entry point (desktop only; mobile uses the Keypad tab).
- Capability-aware audio picker: probes `navigator.mediaDevices`, reports
  honest offline / unsupported / no-permission / no-devices / ready states,
  and offers a "Grant access" button to request mic permission.
- Call waiting banner when a second call rings while one is connected.
- Conference (add a third participant), consult transfer (call target first,
  then complete), park, and retrieve — all simulated on the CallLog entity.
- In-call "More" panel with a persistent End button that is always reachable.

### Messaging
- MMS attachment previews rendered inline as fictional bundled SVG data URIs
  — no `UploadPrivateFile`, no signed-URL runtime dependency. The real
  storage provider stays behind the message adapter for production.
- Failed-send retry: a message can be created with status `failed` and
  retried later; the draft is preserved on failure so nothing is lost.

### Voicemail
- Voicemail greetings (editable text, persisted in the local demo store).
- Callback action from a voicemail (dials the `from_number`).
- Demo test tone playback (synthesized) — labeled as a demo test tone, not a
  real voicemail recording or speech.

### Contacts
- Filter chips: All / Company / Shared / Personal / Business.
- Deduplicate by phone number on import and manual add.
- Export all contacts to CSV; import from CSV; vCard download per contact.
- Migrated to the `contactAdapter` boundary (no raw SDK calls in the view).

### Call history (Recents)
- Filter by direction (All / Inbound / Outbound / Missed / Voicemail).
- Expandable details with editable notes (saved to the CallLog entity).
- Migrated to the `callAdapter` boundary.

### Meetings
- Permanent rooms with stable join links and a "copy link" action.
- Calendar placeholder: download a `.ics` file for scheduled meetings.
- Live booking-page preview in the schedule form.

### Integrations
- Statuses now read "Not connected" or "Planned" — never "Linked" or
  "Available" when no real connection was established.
- Sync stack label corrected to "Firebase Firestore" (not Realtime DB).

### Architecture
- Old screen components (ContactsList, RecentsList, VoicemailList,
  ConversationView, ConversationList, ActiveCallScreen) migrated to the
  service-adapter / local-demo boundary — no raw `base44.entities` calls
  remain in view components.
- All demo data uses the selected fictional company (MDX / GMS) consistently.

### Accessibility
- Accessible names (`aria-label`) added to every icon-only button across the
  shell, dialer, contacts, recents, voicemail, messages, meetings, fax, and
  settings.

### Entities
- `Message`: added `attachments` (JSON string of MMS attachments).
- `CallLog`: added `conference_participant`, `consulting_with`, `parked_at`.

## v0.2.0 — White-label rebuild

- Service adapters (`src/services/adapters.js`) isolating the Base44 SDK.
- Local demo persistence (`src/lib/demoStore.js`) for non-critical features.
- Responsive AppShell with collapsible sidebar and mobile bottom tabs.
- Pages: Favorites, Keypad, Recents, Contacts, Voicemail, Messages, Team
  Chat, Fax, Meetings, Integrations, Settings.
- Static fictional demo transcripts (no LLM, no fake provider URLs).
- Call-lifecycle bug fixes (delayed auto-connect, duplicate commands, lost
  drafts, no automatic fabricated indicators).

## v0.1.0 — Initial prototype

- Role-based consoles (Employee, Receptionist, Admin).
- Simulated inbound/outbound calling with live state sync.
- Rich messaging, notifications, ringtones, and the admin overview dashboard.