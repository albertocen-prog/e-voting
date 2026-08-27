# Student Voting Platform — Developer Guide

Version: 1.0

This developer guide collects architecture notes, setup and run instructions, coding conventions, security and operational guidance, a prioritized issue list, and representative code snippets. Use this document for onboarding contributors, running the project locally, and preparing CI/deployments.

Table of contents
- Overview
- Architecture & key components
- Local setup (dev)
- Database: migrations, schema, seed
- Authentication and sessions
- Vote casting: correctness & concurrency
- API reference (summary)
- Testing & CI
- Docker & deployment
- Troubleshooting
- Prioritized issues / TODOs
- Representative code excerpts
- Contributing guidelines

---

Overview
--------
Student Voting Platform is a Next.js + TypeScript application using Prisma as ORM and PostgreSQL as the datastore. It implements role-based access (VOTER, ELECTION_OFFICIAL, OBSERVER, ADMIN) and enforces one vote per voter per election using a DB unique constraint and transactional locking.

Architecture & key components
-----------------------------
- Next.js app (pages router) — UI pages and server API routes in `pages/`.
- Prisma models in `prisma/schema.prisma` define Users, VoterRegistration, Election, Ballot, Option, Vote, AuditLog.
- Authentication: JWT tokens created by `lib/auth/jwt.ts`; password hashing via `lib/auth/password.ts` (bcryptjs).
- Session cookie helper in `lib/session.ts` sets a secure HttpOnly cookie for browser flows.
- Database access: `lib/db.ts` exports a single Prisma client instance.
- Vote endpoint: `pages/api/votes/index.ts` performs checks and creates vote inside a transaction while locking the voter registration row (SELECT ... FOR UPDATE).
- Audit logging: `lib/db/audit.ts` provides a helper `createAuditLog` used by API handlers.

Local setup (dev)
-----------------
Prerequisites:
- Node.js 18+ (20 recommended)
- npm
- PostgreSQL (or Docker)

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` with at least:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/e_voting
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

3. Generate Prisma client

```bash
npx prisma generate
```

4. Run migrations

```bash
npx prisma migrate dev --name init
```

5. Seed database

```bash
node prisma/seed.js
```

6. Run dev server

```bash
npm run dev
# open http://localhost:3000
```

Database: migrations, schema, seed
----------------------------------
- Schema: `prisma/schema.prisma` contains the canonical models. Key constraint: Vote model has `@@unique([electionId, voterRegistrationId])`.
- Migrations: use `npx prisma migrate dev --name <name>` for dev. In CI, use `npx prisma migrate deploy`.
- Seed: `prisma/seed.js` creates an admin user (`admin@example.com` with password `adminpass` in seed), a sample OPEN election, ballot, options, and an approved voter `VOTER-0001`.

Authentication and sessions
---------------------------
- Staff login: `POST /api/auth/login` — email + password. Passwords are hashed with bcryptjs (lib/auth/password.ts).
- Voter login: `POST /api/auth/voter-login` — provides voterId.
- Both endpoints issue JWT tokens (lib/auth/jwt.ts) and set an HttpOnly cookie via `lib/session.ts` for browser clients.
- Middleware: `lib/auth/middleware.ts` exposes `authMiddleware`, `requireRole(...)`, and `requireApprovedVoter` wrappers for API handlers.

Vote casting: correctness & concurrency
--------------------------------------
- Primary guard: DB-level unique constraint on Vote: `@@unique([electionId, voterRegistrationId])`.
- Serialization guard: the endpoint `POST /api/votes` locks the `VoterRegistration` row for the user with `SELECT ... FOR UPDATE` inside a Prisma transaction; this serializes concurrent attempts by the same voter and prevents race conditions.
- Fallback: code catches Prisma unique constraint error (P2002) and returns 409 Conflict.

API reference (summary)
-----------------------
- Auth
  - POST /api/auth/login — { email, password }
  - POST /api/auth/voter-login — { voterId }
- Elections
  - GET /api/elections
  - POST /api/elections
  - GET /api/elections/:id
- Ballots
  - GET /api/ballots?electionId=...
  - POST /api/ballots
  - GET /api/ballots/:id
- Votes
  - POST /api/votes — { electionId, ballotId, optionId }
- Results
  - GET /api/results/:electionId
- Voters
  - POST /api/voters/register
  - POST /api/voters/approve

Testing & CI
------------
- Unit/integration tests: Jest is used. Tests that use the DB require a test database and `DATABASE_URL` pointing to it.
- Example test: `tests/prisma-vote-unique.test.js` verifies that creating a second vote for the same (election, voterRegistration) fails with P2002.
- CI: `.github/workflows/ci.yml` runs `npm ci`, `npx prisma generate`, lint, and tests. If `TEST_DATABASE_URL` is provided in secrets, migration deploy and DB tests run.

Docker & deployment
-------------------
- Dockerfile builds the Next.js app; docker-compose spins up Postgres and the web service. The compose file runs `npx prisma migrate deploy` before starting the app.
- For production, use `npx prisma migrate deploy` to apply migrations and keep `DATABASE_URL` and `JWT_SECRET` in secure environment variables.

Troubleshooting
---------------
- `Error: P2002` when seeding: indicates unique constraint conflicts. Delete conflicting rows or reset DB.
- JWT issues: ensure `JWT_SECRET` is same across services and environments.
- Prisma client mismatch: run `npx prisma generate` after schema changes.

Prioritized issues / TODOs
-------------------------
High priority (must do before production):
1. Add rate limiting to authentication endpoints (prevent brute-force).
2. Add CSRF protection if using cookies for authentication.
3. Add real monitoring and error reporting (Sentry/LogRocket).
4. Harden password policies and email verification flows.

Medium priority:
5. Add end-to-end tests for voting flow including concurrency stress test.
6. Implement pagination and filters on results and audit endpoints.
7. Replace in-repo seed password with better secret handling; rotate credentials.

Low priority / Nice to have:
8. Improve admin UI for voter approvals and audit filtering.
9. Add OpenAPI-based request validation middleware.
10. Publish client SDKs generated from OpenAPI spec.

Representative code excerpts
----------------------------
1) Vote creation (transaction + FOR UPDATE) — `pages/api/votes/index.ts`

```ts
// See full file in repo; snippet:
const createdVote = await prisma.$transaction(async (tx) => {
  const rows = await tx.$queryRaw`SELECT id, "voterId", "approvedAt", "userId" FROM "VoterRegistration" WHERE "userId" = ${user.userId} FOR UPDATE`
  const voterReg = rows[0]
  if (!voterReg || !voterReg.approvedAt) throw { status: 403 }
  // validate election/ballot/option
  const existing = await tx.vote.findFirst({ where: { electionId, voterRegistrationId: voterReg.id } })
  if (existing) throw { status: 409 }
  const vote = await tx.vote.create({ data: { electionId, ballotId, optionId, voterRegistrationId: voterReg.id } })
  await tx.auditLog.create({ data: { actorId: voterReg.userId, action: 'vote_cast', targetType: 'election', targetId: electionId, details: JSON.stringify({ voteId: vote.id }) } })
  return vote
})
```

2) Auth login (sets cookie and returns token) — `pages/api/auth/login.ts`

```ts
const token = generateToken({ userId: user.id, email: user.email, role: user.role })
setSessionCookie(res, token)
return res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
```

Testing & concurrency script (suggestion)
-----------------------------------------
We recommend using k6 or Artillery to run concurrent requests against `/api/votes` for the same voter token and ensure only one request succeeds.

Example k6 scenario (pseudo):
- Setup: login to get token
- Scenario: N virtual users simultaneously POST to /api/votes with same token
- Assert: exactly 1 success (201) and N-1 409 responses

Contributing guidelines
-----------------------
- Branch naming: `feat/*`, `fix/*`, `chore/*`.
- Tests: add unit/integration tests for all new behavior; DB schema changes require migrations.
- PRs: include explanation, testing steps, and any infra changes required.

Appendices
----------
A. Useful commands
- Generate client: `npx prisma generate`
- Create migration: `npx prisma migrate dev --name <name>`
- Apply migrations (prod): `npx prisma migrate deploy`
- Seed DB: `node prisma/seed.js`
- Run dev: `npm run dev`
- Run tests: `npm test`

B. Key file locations
- pages/api/* — API handlers
- pages/* — UI pages
- lib/* — helpers: db, auth, session, password
- prisma/schema.prisma — DB schema
- prisma/seed.js — seed script
- .github/workflows/ci.yml — CI
- docker-compose.yml, Dockerfile — local containers

---

End of guide.
