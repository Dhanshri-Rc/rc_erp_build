# Production hardening implemented

- Removed packaged environment files and added safe `.env.example` templates.
- Replaced the normal destructive seed command with a non-destructive administrator bootstrap.
- Blocked demo database reset in production and added an explicit destructive confirmation requirement.
- Upgraded Express and Multer; dependency audits now pass.
- Added login-specific rate limiting, trusted-origin write protection, unsafe MongoDB-key rejection and sanitized production errors.
- Added revocable database-backed sessions with issuer/audience validation and expiry.
- Added session revocation after logout, password reset and account deactivation.
- Prevented self-deactivation and deactivation of the last active administrator.
- Removed mass assignment from vendor, lead and catalogue writes.
- Enforced assignment of vendors/leads to active Sales users.
- Replaced predictable timestamp references with cryptographically random references.
- Made authorship prices authoritative on the server using article catalogue pricing.
- Added MongoDB transactions to sale creation and payment verification/rejection.
- Recalculate outstanding balances from verified payments only.
- Added atomic duplicate-verification protection and one receipt per payment.
- Added financial validation and common query indexes.
- Removed public upload serving; files now require role/ownership authorization.
- Added upload content-signature checks and orphan-file cleanup for failed sale creation.
- Added CSV formula-injection protection.
- Added production environment validation, database-aware health response and graceful shutdown.
- Preserved Axios error status, added global expired-session handling and added a React error boundary.
- Added authenticated payment-proof URLs and production bundle splitting.
- Added backend security regression tests and deployment/acceptance checklists.

## Deployment requirement

Financial transactions require MongoDB Atlas or another MongoDB replica set. Uploaded files are access-controlled, but use private durable object storage before deploying on an ephemeral hosting platform.
