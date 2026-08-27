# Student Voting Platform (E-Voting)

A secure, role-based electronic voting system intended for academic institutions. This project is an MVP implementation providing voter registration and login, election and ballot management, vote casting with DB-level guarantees for "one vote per voter per election", and an append-only audit trail.

This README documents how to run the project locally, the important design decisions (especially around vote safety), developer workflows (migrations, seed, tests), and where to find the main pieces of the codebase.

---

## What this is

A full-stack Next.js application (pages router) that exposes both server-rendered UI and REST API routes. The backend uses Prisma with PostgreSQL for persistent storage. The system models roles (VOTER, ELECTION_OFFICIAL, OBSERVER, ADMIN), supports voter registration approval, and protects vote integrity using a combination of a unique DB constraint and transactional row-level locking.

## Quick links
- Code: pages/ (UI + API routes)
- API examples: pages/api/*
- Prisma schema: prisma/schema.prisma
- Seed script: prisma/seed.js
- Vote handler (safety): pages/api/votes/index.ts
- Auth: pages/api/auth/* and lib/auth/*

---

## Stack
- Language: TypeScript (primary)
- Framework / runtime: Next.js (Pages router)
- Database: PostgreSQL (Prisma ORM)
- Notable libraries: next, react, prisma, jsonwebtoken, bcryptjs

---

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm
- PostgreSQL (or Docker / docker-compose)

---

## Environment variables
Create a `.env.local` (or `.env`) at the project root and set the following variables:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/e_voting
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Make sure the database referenced by DATABASE_URL is reachable and a user/database are prepared.

---

## Setup and development

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npx prisma generate
# or: npm run prisma:generate
```

3. Create database migrations

```bash
npx prisma migrate dev --name init
# or: npm run prisma:migrate
```

4. Seed the database (creates admin, sample election, ballot, options, and an approved voter)

```bash
node prisma/seed.js
# or: npm run prisma:seed (if configured)
```

5. Start the dev server

```bash
npm run dev
# open http://localhost:3000
```

---

## Production build

```bash
npm run build
npm start
```

When deploying, ensure `DATABASE_URL` and `JWT_SECRET` are set in the environment.

---

## Docker (optional local development)

A `Dockerfile` and `docker-compose.yml` are included to run a Postgres database and the Next.js app together:

```bash
docker-compose up --build
```

This will:
- start a Postgres container
- build the app image
- run `npx prisma migrate deploy` and `npm start` in the container (see docker-compose.yml command)

Adjust credentials and secrets before using in any shared environment.

---

## Tests

A simple Jest test exists to validate the database-level uniqueness guard for votes. To run tests:

```bash
npm test
```

Notes:
- Tests that hit the database require `DATABASE_URL` to point to a test database. The CI workflow will look for `TEST_DATABASE_URL` if configured.
- Tests create and delete data used for assertions — prefer a dedicated test DB instance.

---

## API reference (high level)

This project exposes REST API routes under `pages/api`. Key endpoints:

- POST /api/auth/login
  - Email + password login for staff (ELECTION_OFFICIAL, OBSERVER, ADMIN)
  - Returns a JWT and sets an HttpOnly session cookie for browser flows.

- POST /api/auth/voter-login
  - Voter ID login for VOTER role. Returns a JWT and sets cookie.

- GET /api/elections
  - List elections (pagination, status filtering). Observers/Voters see only OPEN elections.

- POST /api/elections
  - Create an election (requires appropriate role).

- GET /api/ballots?electionId=<id>
  - List ballots for an election.

- GET /api/ballots/:id
  - Get ballot and options for a ballot.

- POST /api/votes
  - Cast a vote.
  - Body: { electionId, ballotId, optionId }
  - Requires an approved voter. See "Vote safety" below for implementation details.

- GET /api/results/:electionId
  - Aggregate results for the election (counts per option).

- GET/POST /api/voters
  - Endpoints for voter registration and approval (some paths under pages/api/voters/)

- GET /api/audit
  - Read audit logs with filters (requires permissions).

Refer to the code in `pages/api` for full details and parameters. Each endpoint validates inputs and returns clear HTTP status codes for errors.

---

## Vote safety (important)

The system enforces "one vote per voter per election" at multiple layers:

1. Database constraint (Prisma schema):
   The Vote model includes a unique constraint on (electionId, voterRegistrationId). This is the final safety net.

2. Transactional row-level locking:
   The vote creation endpoint (`POST /api/votes`) uses a single interactive transaction that locks the voter's `VoterRegistration` row using `SELECT ... FOR UPDATE`. Within that transaction the handler:
   - validates election status (must be OPEN), ballot and option membership
   - checks for an existing Vote for that (election, voterRegistration)
   - creates the Vote and an AuditLog record

   Locking the `VoterRegistration` row serializes concurrent vote attempts for the same voter while allowing different voters to vote concurrently.

3. Unique-constraint fallback:
   Even with locking, the code also catches the Prisma unique-constraint error (P2002) and returns HTTP 409 — this ensures safety in case of unexpected races.

This strategy balances correctness with performance. If you expect extremely high concurrency and want alternate strategies (advisory locks, queuing, or per-election sharding), we can discuss and adapt.

---

## Session vs token

- Login endpoints return a JWT in JSON for API clients and also set a secure, HttpOnly cookie (`auth_token`) for browser clients.
- The middleware supports extracting token from `Authorization: Bearer <token>` and from the session cookie.
- For browser-based flows, prefer the cookie; for external API clients/scripts, use the Authorization header.

Security note: if you use cookies, add CSRF protections to state-changing endpoints (e.g., vote casting) as needed for your threat model.

---

## Security notes and best practices

- Use a strong `JWT_SECRET` in production and rotate secrets as needed.
- Serve the app via HTTPS (cookies set `Secure` attribute).
- Consider adding rate limiting on auth endpoints to prevent brute force attacks.
- Monitor and alert on suspicious audit log entries (massive registrations, repeated failed logins, etc.).
- Keep Prisma and DB dependencies patched and follow a migration plan when changing the schema in production.

---

## Troubleshooting

- Database connection errors: confirm `DATABASE_URL` is correct and database accepts connections from your host.
- Prisma issues: run `npx prisma generate` after any schema change; run `npx prisma migrate dev` to create migrations in development.
- Missing env vars: check `.env.example` for required variables.

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/my-change`
2. Run tests and lint locally.
3. Create a PR describing the change and include tests for behavior where appropriate.

Please include migration files for any schema changes and update `prisma/seed.js` if you need new seeded data.

---

## License

This project does not include a license file; add one (e.g., MIT) if you intend to open-source it.

---

If you want, I can also:
- Add sample Postman collections or OpenAPI spec for the API
- Add a k6 script to stress-test concurrent vote casting
- Wire CI to run DB-backed tests using a hosted test database

Which of these would you like next?