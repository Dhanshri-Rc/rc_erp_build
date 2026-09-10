# RC ERP production checklist

## Required before deployment

- Rotate the MongoDB password and JWT secret that existed in earlier archives.
- Create new backend and frontend environment variables from the included `.env.example` files.
- Use separate development, staging and production MongoDB databases.
- Enable MongoDB Atlas backups and test a restore.
- Confirm the MongoDB deployment supports transactions.
- Use HTTPS for both frontend and API.
- Set the exact frontend origin in `FRONTEND_URL`.
- Use private durable object storage for long-term payment proofs and manuscripts. The included local file endpoint is authenticated, but local disks may be temporary on hosting platforms.
- Run backend checks and frontend build/audit.
- Test admin, sales and finance workflows against staging data.
- Configure centralized logs, exception monitoring, uptime alerts and database alerts.

## Required acceptance tests

1. Admin login, logout and expired-session redirect.
2. Admin creates, disables and resets a Sales/Finance account.
3. Sales can access only assigned vendors, leads, sales and payment proofs.
4. Finance can verify or reject a payment but cannot access user administration.
5. A failed transaction creates no partial sale, payment or receipt records.
6. Concurrent payment verification creates exactly one receipt.
7. Database records remain after logout, restart and redeployment.
8. Unauthorized and cross-origin write requests return 401/403.
9. Invalid or spoofed uploads are rejected.
10. Backup restoration succeeds in a separate database.

## Known product-scope items

Several navigation destinations are informational placeholders (settings, advanced reports, templates and communication). Implement or remove them before advertising those modules as available.
