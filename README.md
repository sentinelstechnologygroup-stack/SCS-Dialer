# Sentinels Communication Systems (SCS)

Owned by **Sentinels Technology Group**. Standalone white-label phone platform; MDX is the first client. Golden Marketing Services branding is a demo of the shared application, not a provisioned account.

Run `npm install`, `npm run dev`, `npm test`, and `npm run build` in this directory. The application is independent of the Atlas UI and Base44 runtime. All current interaction is explicitly simulated. Company selection is a demo control, not production authorization.

Data lives under `companies/{companyId}`. Firebase membership is server-provisioned; client self-registration, membership changes, credentials, and provider operations are denied. Production integration must derive company membership from verified authentication and never trust a client company ID by itself. Privileged Functions require Firebase Auth, App Check, explicit operation permissions, idempotency, and audit records. Storage is closed until access-controlled recording delivery is implemented.

Atlas/GMS adapters consume versioned company-scoped events. MDX fuel/dispatch workflows remain in Atlas. Adapter authentication, delivery, retries and CRM writes are not implemented yet. Use a separate Firebase project for the product; do not deploy these rules over Atlas rules.

Security test: `npx firebase emulators:exec --project demo-sentinels-phone --only firestore "node --test tests/isolation.emulator.js"`.

Next: invitation and membership backend, authenticated workspace discovery, repositories and integration adapters, contacts and inboxes, receptionist/admin workflows, Telnyx provisioning/events, native mobile capabilities, and end-to-end acceptance. Live calling, texting, recordings, push and native device integration are not connected.
