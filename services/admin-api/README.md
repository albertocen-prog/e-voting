# Admin API (internal)

This internal microservice provides a minimal, secured administrative API for the e-voting platform. It wraps frequently used operational tasks (create admin users, reset passwords, trigger DB backups) and records actions to the application's audit log.

Important: This service is powerful and must only be deployed in a trusted environment. Consider restricting network access (VPN, private subnets), using short-lived tokens, and enabling mutual TLS.

Environment variables
- DATABASE_URL: Prisma database connection string (used by @prisma/client)
- ADMIN_API_JWT_SECRET: HMAC secret used to verify incoming admin API JWTs
- PORT: port to listen on (default 4000)
- BACKUP_DIR: directory to write database backups (default: ./backups)
- PGHOST / PGUSER / PGDATABASE / PGPASSWORD: used when running pg_dump (or use .pgpass)

Bootstrap
1. Build and run locally:

```bash
cd services/admin-api
npm ci
ADMIN_API_JWT_SECRET="$(openssl rand -hex 32)" DATABASE_URL=... npm start
```

2. Docker (example):

```bash
docker build -t e-voting-admin-api .
docker run -e ADMIN_API_JWT_SECRET=... -e DATABASE_URL=... -e PGHOST=... -e PGUSER=... -e PGPASSWORD=... -p 4000:4000 e-voting-admin-api
```

API endpoints
- GET /health — health check
- POST /admin/create-admin — create an ADMIN user (requires ADMIN role)
  - body: { email, password, name }
- POST /admin/reset-password — reset user's password (requires ADMIN or OPS role)
  - body: { email, newPassword }
- POST /admin/backup — trigger a pg_dump backup (requires OPS role)
- POST /admin/mint-token — mint a short-lived token for a target user (ADMIN only; remove in production)

Authentication
- All endpoints require a Bearer JWT signed with ADMIN_API_JWT_SECRET. The token payload is expected to include `sub` (user id) and `role` (string). Token verification is performed by the service.

Audit logging
- Each admin operation writes an entry to the application's `AuditLog` via Prisma. If your Prisma schema uses a different model name or fields, adjust the code in `src/index.js`.

Security considerations
- Do NOT expose this service on the public internet.
- Use network-level restrictions and strong secrets.
- Consider adding mutual TLS and IP allowlists.
- Rotate ADMIN_API_JWT_SECRET periodically and invalidate old tokens.

