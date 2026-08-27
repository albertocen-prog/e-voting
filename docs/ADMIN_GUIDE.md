# Student Voting Platform — Admin Guide

Version: 1.0

Last updated: 2026-08-27

This guide is intended for system administrators and operators responsible for installing, configuring, operating, and troubleshooting the Student Voting Platform.

1. Purpose
- This guide is intended for system administrators and ops engineers who will install, operate, and troubleshoot the Student Voting Platform in development, staging, and production environments.

2. Summary / Who should read
- System Administrators, DevOps, Site Reliability Engineers, Security Officers, and emergency support staff.

3. System requirements (baseline)
- OS
  - Ubuntu LTS (22.04+) recommended, or equivalent Debian-based distribution.
  - Alternatives: CentOS/AlmaLinux/RHEL, macOS for local dev.
- Hardware (small-medium deployment)
  - CPU: 2 vCPU minimum; 4+ vCPU recommended for production.
  - RAM: 4 GB minimum; 8+ GB recommended for production (more for heavy concurrency).
  - Disk: 20 GB minimum; use SSD for performance. Allocate separate volumes for DB and app logs/backups.
- Node.js
  - Node 18+ (Node 20 recommended)
- npm
  - npm 8+
- Database
  - PostgreSQL 14+ (15 recommended). Ensure WAL archiving and backups configured.
- Other
  - reverse proxy (Nginx) or load balancer, TLS termination (Let's Encrypt or managed certs), process manager (systemd / PM2 / Docker).
- Network
  - Open ports: 80/443 (HTTP/HTTPS), SSH (22), DB port (5432) restricted to app hosts or private network only.

4. Preparation & credentials
- Secrets you must have before installation:
  - DATABASE_URL (Postgres connection string)
  - JWT_SECRET (strong random secret, rotate periodically)
  - NODE_ENV (production in prod)
  - Optional: SMTP credentials for notifications, SENTRY_DSN for error reporting.
- Create a secure vault for secrets (HashiCorp Vault, AWS Secrets Manager, environment variables in CI/CD).

5. Get the software
- On a management workstation:
  git clone https://github.com/<your-org>/e-voting.git
  cd e-voting
- Use the branch you want to deploy (e.g., main or release/*).

6. Install & build (app server)
- Install Node + npm, then:
  npm ci
  npx prisma generate
- Migrate DB (staging/dev):
  npx prisma migrate dev --name init
- For production, use:
  npx prisma migrate deploy
- Seed (optional, local/staging only):
  node prisma/seed.js
- Build:
  npm run build
- Start (prod):
  npm start
- Dev:
  npm run dev

7. Recommended production deployment approaches
- Docker / docker-compose:
  - Use the provided docker-compose.yml to run Postgres + app for local environment. Do not use for production without adapting volumes and secrets.
- Containerized (recommended):
  - Build a container image, run via Kubernetes or ECS, configure env vars from secrets store.
- Systemd (simple VM):
  - Create a systemd unit that runs `npm start` in /srv/e-voting. Example:
    /etc/systemd/system/e-voting.service
    ```
    [Unit]
    Description=E-Voting Next.js app
    After=network.target

    [Service]
    Type=simple
    User=www-data
    WorkingDirectory=/srv/e-voting
    ExecStart=/usr/bin/npm start
    Environment=NODE_ENV=production
    Environment=DATABASE_URL=postgresql://...
    Restart=on-failure
    RestartSec=5s

    [Install]
    WantedBy=multi-user.target
    ```
  - Then:
    sudo systemctl daemon-reload
    sudo systemctl enable --now e-voting

- Reverse proxy: Nginx example (TLS termination)
  - Use Nginx to proxy to app (localhost:3000). Make sure to set appropriate headers.

8. Environment configuration
- Primary ENV variables
  - DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, PORT, SMTP_*.
- DB connection pool
  - Configure Prisma’s connection pool via DATABASE_URL params and environment (PGSSLMODE, connection limit).
- Session & cookie
  - Ensure secure cookies: SameSite=Lax/Strict, Secure=true (only HTTPS), HttpOnly=true.
- Logging
  - Route logs to stdout/stderr (containers) or to logfile with rotation. Use structured logs (JSON) for ingestion.

9. Creating and managing admin accounts
- Option A — Seed script
  - The seed script (prisma/seed.js) creates a default admin (admin@example.com / adminpass in seed). Replace or rotate seeded password immediately.
- Option B — Prisma Studio (GUI)
  - Run `npx prisma studio` and create a new user, set role to ADMIN, and set passwordHash (use a hashed value or use script to create with bcrypt).
- Option C — Node script (safe, recommended)
  - Create scripts/create_admin.js:
    ```js
    const bcrypt = require('bcryptjs')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    ;(async ()=> {
      const hash = await bcrypt.hash(process.argv[2], 10)
      const user = await prisma.user.create({
        data:{ email: process.argv[3], name: process.argv[4]||'Admin', passwordHash: hash, role:'ADMIN', status:'APPROVED'}
      })
      console.log('Created admin', user.id)
      await prisma.$disconnect()
    })().catch(e=>{console.error(e); process.exit(1)})
    ```
  - Usage:
    node scripts/create_admin.js 'StrongP@ssw0rd' 'admin@example.com' 'Admin User'
- Option D — Direct SQL (not recommended unless you know schema)
  - Use parameterized insert and bcrypt-hash. If using SQL, always confirm with schema before inserting.

10. Resetting passwords (staff)
- Safe approach: use a server-side script that hashes new password then updates user.passwordHash.
- Example script: scripts/reset_password.js:
  ```js
  const bcrypt = require('bcryptjs')
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  ;(async ()=> {
    const [userEmail, newPassword] = process.argv.slice(2)
    if(!userEmail || !newPassword) { console.error('usage: node reset_password.js user@example.com newpw'); process.exit(2) }
    const hash = await bcrypt.hash(newPassword, 10)
    const user = await prisma.user.update({ where: { email: userEmail }, data: { passwordHash: hash } })
    console.log('Password reset for', user.email)
    await prisma.$disconnect()
  })().catch(e=>{console.error(e); process.exit(1)})
  ```
- Usage:
  node scripts/reset_password.js admin@example.com 'NewStrongPass1!'
- If you absolutely must reset via SQL, compute bcrypt hash elsewhere and update user table:
  UPDATE "User" SET "passwordHash" = '<bcrypt-hash>' WHERE email = 'admin@example.com';
- Invalidate sessions after password reset if you use a session store or rotate JWT_SECRET to invalidate tokens.

11. Managing user accounts (approve/suspend/role changes)
- Via Prisma script:
  ```js
  // change role
  await prisma.user.update({ where:{ email:'x' }, data: { role: 'ELECTION_OFFICIAL' } })
  // suspend:
  await prisma.user.update({ where:{ email:'x' }, data: { status: 'SUSPENDED' } })
  ```
- Or use Prisma Studio (npx prisma studio).
- Note: Deleting users is destructive; prefer 'SUSPENDED' or 'DEACTIVATED'.

12. Approving voters
- When a voter registers, Election Officials should:
  - Verify their documents/ID.
  - Update voterRegistration.approvedAt and approvedBy (admin id).
- Use admin UI or via API endpoints (server-side) that validate and set approvedAt.

13. Diagnostics & clearing error codes
- General approach:
  1. Review application logs (journalctl, container logs, PM2 logs).
     - systemd: sudo journalctl -u e-voting -f
     - Docker: docker logs -f <container>
  2. Check web server logs (Nginx access/error).
  3. Check DB logs for errors.
  4. Reproduce the error locally in staging with same inputs.
- Common Prisma errors:
  - P2002 — Unique constraint failed (duplicate key)
    - Diagnostic: check which unique index is violated (error.meta.target).
    - Fix: inspect DB for duplicates, remove or resolve conflicting rows, then retry operation.
    - Example SQL: SELECT * FROM "Vote" WHERE "electionId" = '...' AND "voterRegistrationId" = '...';
  - P300x — Connection issues
    - Check DATABASE_URL, network, and DB accept connections.
- Clearing "stuck" transactions
  - Inspect pg_stat_activity to find long-running transactions:
    SELECT pid, usename, application_name, state, query_start, query FROM pg_stat_activity WHERE state <> 'idle';
  - If safe, terminate problematic backend:
    SELECT pg_terminate_backend(<pid>);
- If the app reports "Lock acquisition timeout" or deadlocks:
  - Check for long transactions (vacuum, maintenance tasks).
  - Increase lock wait timeout (temporary) or fix the code causing long transactions.
- If an ingress 502 occurs:
  - Check app process status, restart if crashed:
    sudo systemctl restart e-voting
  - Check reverse proxy and upstream health.

14. Recovery after failed migration
- If migrate dev failed locally:
  - Investigate migration file and SQL errors, fix schema or migration file.
- If prod migration failed:
  - Do NOT run migrate reset in prod.
  - Restore DB from pre-migration backup, fix migration or apply manual SQL fixes.
  - Recommended workflow:
    - Create backup (pg_dump) before any migration.
      pg_dump -Fc --no-acl --no-owner -h host -U user dbname > backup-YYYYMMDD.dump
    - If rollback required, restore from backup:
      pg_restore --clean --no-acl --no-owner -h host -U user -d dbname backup-YYYYMMDD.dump
- For small fixes, consider writing a targeted SQL migration to fix the issue.

15. Backups & restore
- Full logical backup:
  pg_dump -h <host> -U <user> -F c -b -v -f /backups/e-voting-YYYYMMDD.dump <dbname>
- Restore:
  pg_restore -h <host> -U <user> -d <dbname> /backups/e-voting-YYYYMMDD.dump
- Automate backups (daily) and keep retention (e.g., 7 days daily + weekly/monthly snapshots).
- Test restore process regularly on staging.

16. Logs, monitoring & alerting
- Logging
  - Send application logs to stdout (containers) or to a centralized logging system (ELK, Datadog, Papertrail).
  - Capture Prisma query logs at debug level only in staging.
- Errors
  - Integrate Sentry (SENTRY_DSN) for error aggregation.
  - Configure alerts for:
    - Application 5xx rate increase
    - DB connectivity errors
    - High query latency or slow queries
- Monitoring
  - Collect metrics (Prometheus) for app latency, DB connections, concurrency, CPU, memory.
  - Health checks: readiness and liveness endpoints (or ensure Next.js returns 200 on health route).

17. Security best practices
- TLS everywhere — terminate at reverse proxy, enforce HSTS.
- JWT_SECRET: use long, random secret, rotate periodically.
- Secure cookies: HttpOnly, Secure, SameSite=Lax/Strict.
- Rate limiting: add rate limiters for auth endpoints.
- Input validation & sanitize user input for file uploads and text fields.
- SSO / MFA for staff-access accounts where possible.
- Database access: restrict DB port to application hosts or VPC only.
- Regular vulnerability scanning and dependency updates (dependabot).

18. Maintenance & housekeeping
- DB maintenance
  - Regular VACUUM ANALYZE (Postgres).
  - Monitor bloat and index health.
- Periodic tasks
  - Migrate schema on staging/test before production.
  - Rotate secrets and keys.
  - Audit and prune old accounts if required by policy.

19. Troubleshooting common problems
- App returns 500
  - Check application logs for stack trace.
  - If related to Prisma P2002, handle duplicates as above.
- Cannot connect to DB
  - Verify DATABASE_URL and connectivity; try psql -h host -U user dbname.
  - Check for network ACLs, firewall rules, or cloud security groups.
- "You have already voted" returned unexpectedly
  - Confirm voterRegistration ID matches what client sends.
  - Check Vote table for existing rows: SELECT * FROM "Vote" WHERE electionId='...' AND voterRegistrationId='...';
  - If duplicates found, verify whether they are legitimate; check audit logs.
- 502/504 from reverse proxy
  - Check backend process status, restart service if necessary.
  - Check CPU/memory and DB connection usage.

20. Emergency procedures
- If DB is down
  - Promote a read-only replica (if configured) or restore from the latest backup to a warm standby.
  - Notify stakeholders.
- Security breach
  - Revoke/rotate JWT_SECRET and DB credentials immediately.
  - Export logs and preserve forensic evidence.
  - Follow institutional incident response plan.

21. Useful admin scripts (examples)
- create_admin.js (see section 9)
- reset_password.js (see section 10)
- backup_db.sh
  ```bash
  #!/usr/bin/env bash
  PGHOST=...
  PGUSER=...
  PGDATABASE=...
  OUT="/backups/e-voting-$(date +%F).dump"
  pg_dump -Fc --no-acl --no-owner -h "$PGHOST" -U "$PGUSER" "$PGDATABASE" > "$OUT"
  ```
- prune_logs.sh (use logrotate for production)

22. Appendix: SQL snippets
- Find duplicate vote:
  SELECT electionId, voterRegistrationId, count(*) FROM "Vote" GROUP BY electionId, voterRegistrationId HAVING count(*) > 1;
- Remove a duplicate row (identify one id to keep, delete others):
  DELETE FROM "Vote" WHERE id = '<duplicate-id>';
- View long-running queries:
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state <> 'idle' ORDER BY duration DESC LIMIT 20;

23. Checklist before opening an election
- Verify ballots and options.
- Confirm voter approvals are up-to-date.
- Ensure backups are completed.
- Confirm monitoring and alerting are active.
- Communicate start and end times to stakeholders.

24. Contacts & escalation
- List internal on-call rotations and emails (replace with real contacts).
  - Primary ops: ops@example.edu
  - Security: sec@example.edu
  - DB Admin: dba@example.edu

25. Change log & versioning
- Record changes to infra, secrets, or critical config in CHANGELOG or releases.

26. Where to store this guide
- Keep this file in the repo under docs/ADMIN_GUIDE.md and ensure an operations team member reviews and signs off on it. Generate a PDF for distribution to authorized admins when needed.

---

If you want I will:
- commit this file to docs/ADMIN_GUIDE.md and open a PR (I can prepare the PR body and branch name), or
- also add the helper scripts (create_admin.js, reset_password.js, backup_db.sh) to scripts/ and commit them,
- add a CI workflow that auto-generates the PDF and uploads as artifact,
- or produce a one-page quick-checklist printable PDF for on-call staff.
