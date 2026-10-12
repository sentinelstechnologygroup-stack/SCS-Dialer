# SCS-Dialer

Standalone SCS local migration. Owned by Sentinels Technology Group.

Run npm install then npm run dev. Shared package: platform.
.env.local explicitly selects fictional demo mode; production is disabled until membership-controlled data/provider acceptance. Never put provider secrets in VITE variables.

See platform/ACCEPTANCE.md for gaps and verified reference checkpoints. Retired prototype resources are archived outside the active projects. Production remains disabled. GitHub upload was authorized on October 11, 2026.


The platform package is bundled under platform/ so each repository builds independently. SCS-Admin/platform is the canonical shared backend/package; SCS-Dialer/platform is a matching snapshot. Synchronize shared changes deliberately; deploy the shared backend only once. Secrets and local environment files are excluded. Use demo mode locally, or configure the separate SCS Firebase project for acceptance testing.

For a simulated local preview, create .env.local containing VITE_SCS_MODE=demo, then run npm install and npm run dev. This does not enable live services. Without demo mode, production remains blocked until Firebase configuration and acceptance.
