# scripts/ README

This directory holds small admin/operator helper scripts for local and operational tasks. These scripts are intended for use by trusted operators only — do not expose or include them in public CI without proper secret handling.

Files
- create_admin.js — create an ADMIN user using Prisma and bcrypt.
- reset_password.js — reset a user's password by hashing it with bcrypt and updating the DB via Prisma.
- backup_db.sh — wrapper script that runs `pg_dump` to produce a logical database backup (.dump).

Security and permissions
- These scripts operate with database credentials and can modify user accounts. Only run them from a secure host and with credentials that are kept in a secrets manager or environment variables.
- Recommended file permissions:
  chmod 700 scripts/*.js scripts/backup_db.sh
- Never commit production secrets (DATABASE_URL, DB passwords, JWT_SECRET) into the repository.

Prerequisites
- Node.js 18+ and npm (for the JS scripts)
- bcryptjs and @prisma/client installed in the project (run in repo root):
  npm ci
  # ensure dependencies are present (bcryptjs and @prisma/client should be in package.json)
- PostgreSQL client tools for backup (pg_dump)

Usage examples

1) Create an admin user

This script creates an ADMIN user and sets passwordHash using bcrypt.

Usage:

  node scripts/create_admin.js '<password>' '<email>' '<name(optional)>'

Example:

  node scripts/create_admin.js 'S3cureP@ss!' 'admin@example.edu' 'Site Admin'

Notes:
- The script requires a valid DATABASE_URL in your environment or in .env. Use a secrets manager in production.

2) Reset a user's password

Usage:

  node scripts/reset_password.js '<email>' '<newPassword>'

Example:

  node scripts/reset_password.js 'jdoe@example.edu' 'N3wP@ssw0rd!'

Notes:
- This updates the user's passwordHash in the database. After running, you may want to invalidate previous sessions (see admin notes in the Admin Guide).

3) Backup database

Usage:

  PGHOST=your-db-host PGUSER=your-db-user PGDATABASE=your_db_name ./scripts/backup_db.sh /path/to/outdir

Example:

  PGHOST=db.internal PGUSER=backup_user PGDATABASE=e_voting ./scripts/backup_db.sh /srv/backups

The script writes a single compressed dump file: /path/to/outdir/e-voting-YYYY-MM-DD_HHMMSS.dump

Required environment variables (for backup_db.sh):
- PGHOST (default: localhost)
- PGUSER (default: postgres)
- PGDATABASE (default: e_voting)
- You will be prompted for the DB password if needed, or set PGPASSWORD in the environment (avoid storing in plaintext). Example:

  export PGPASSWORD='your-db-password'
  PGHOST=db.internal PGUSER=backup_user PGDATABASE=e_voting ./scripts/backup_db.sh /srv/backups

Security recommendations for backups:
- Store backups off-host in a secure object store (S3, GCS) with server-side encryption and limited access.
- Apply lifecycle/retention policies; rotate and test restores regularly.

Running in CI or automated jobs
- When using CI (e.g., GitHub Actions) or a cron job to run backups, fetch DB credentials from a secrets manager and set them as environment variables in the runner.
- Ensure the runner has `pg_dump` available (install postgresql-client or similar).

Troubleshooting
- If create_admin.js or reset_password.js fail with Prisma connection errors, verify DATABASE_URL and Prisma Client are generated (run `npx prisma generate`).
- Backup fails with permission or network error: verify connectivity to the DB host and correct credentials; if using cloud-hosted DB, ensure the runner has network access.

Operational notes
- Restrict access to the scripts directory and log usage of admin operations in your audit log.
- Consider encapsulating scripts into an internal admin microservice with RBAC and audit logging if frequent operations are needed by non-ops users.

Support
- For platform-level support, see docs/ADMIN_GUIDE.md or contact the primary ops team (ops@example.edu).
