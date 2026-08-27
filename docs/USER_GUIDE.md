---
title: "Student Voting Platform — User Guide"
author: "Student Voting Platform Team"
date: 2026-08-27
---

# Student Voting Platform — User Guide

Version: 1.0  
Last updated: 2026-08-27

## Contents
- Introduction
- Who should read this
- Key concepts and roles
- Quick start (voter)
- Quick start (official / admin)
- Detailed workflows
  - Voter: register, login, cast a vote, view receipt/results
  - Election Official: create/manage election, ballots, options, open/close election, approve voters
  - Observer: view/read-only dashboards and audit logs
  - Administrator: user management, system settings, delete/archive
- Audit logs & compliance
- Security & privacy
- Accessibility
- Troubleshooting & FAQs
- Support & contact
- Glossary

---

## Introduction
Student Voting Platform is a secure, role-based electronic voting system designed for academic institutions. It supports voter registration and approval, election and ballot management, secure vote casting with database guarantees to enforce one vote per voter per election, and an append-only audit trail for compliance.

## Who should read this
- Voters — how to register, login, and cast a vote.
- Election Officials — how to create and manage elections, ballots and approve voters.
- Observers — how to monitor elections in read-only mode and view audit logs.
- Administrators — system-level responsibilities (users, archive, settings).
- Support staff — troubleshooting and escalation steps.

## Key concepts & roles
- **Voter** — a person eligible to cast a vote. Must register and be approved before voting.
- **Election Official** — staff who create and manage elections and ballots, and approve voter registrations.
- **Observer** — read-only users who monitor elections and view audit logs/results.
- **Administrator** — full system access (user management, system settings, delete/archive).
- **VoterRegistration** — a database record linking a user to a voterId and approval state.
- **Ballot** — a set of options within an election (e.g., “Student President”).
- **Option** — a single selectable choice on a ballot (candidate, choice).
- **Vote** — an immutable record of a voter’s selection. The system enforces at most one vote per voter per election.
- **AuditLog** — append-only trail of system actions (who did what, when).

---

## Quick start — Voter
1. **Register**
   - Go to the site Home -> "Register" or "Voter Registration".
   - Fill in required fields: name, email, voter ID (as requested), and any verification info.
   - Submit registration.

2. **Wait for approval**
   - Your registration is reviewed by an Election Official. You will be notified by email and via the system when approved or rejected.

3. **Login**
   - After approval, go to Login -> Voter Login.
   - Enter your voter ID (or use the provided login flow). For web flows, a secure HttpOnly cookie is set and a token is returned.

4. **Vote**
   - Navigate to Elections -> open election.
   - Select the ballot for which you are eligible.
   - Choose an option and confirm your selection.
   - You will receive a confirmation (vote receipt) and the vote is recorded.

---

## Quick start — Election Official / Admin
1. **Login**
   - Go to Login -> Official/Admin Login and sign in with your staff credentials.

2. **Create election**
   - Navigate to Admin / Elections -> Create Election.
   - Enter title, description, start and end times; save as DRAFT or directly create.

3. **Configure ballots**
   - Within an election, add ballots (title, type) and options (labels, metadata).

4. **Approve voter registrations**
   - Go to Voters -> Pending registrations.
   - Review submitted verification info; approve or reject.

5. **Open election**
   - Set status to OPEN at the scheduled time (or open manually). Only open elections accept votes.

6. **Close election**
   - Set status to CLOSED once voting window ends and view/export results.

---

## Detailed workflows

### Voter workflow
**Registration**
1. Click “Register” from the navigation.
2. Fill required info (name, email, voter ID, optional verification docs).
3. Submit and note the confirmation message.
4. Expect email / system notification after official review.

**Login**
- Use the Voter Login page and your voter ID. If the election uses only voter ID authentication, enter voter ID and press “Log in”.
- On success you get a session cookie and/or JWT. The cookie is HttpOnly and Secure in production.

**Casting a vote**
1. Go to Elections -> select the OPEN election.
2. Pick the ballot you’re eligible to vote in.
3. Select exactly one option for single-choice ballots (or allowed number for multi-choice if implemented).
4. Review and confirm. After confirmation:
   - A vote record is created.
   - You’ll see a vote receipt (ID and timestamp).
5. Note: The system prevents double-voting. If you attempt to cast again in the same election you’ll get an error.

**Viewing results**
- Results are displayed after the election is CLOSED (real-time aggregation while open may be restricted).
- Observers and officials may view real-time aggregation depending on permissions.


### Election Official workflow
**Creating an election**
1. Login with Official or Admin account.
2. Admin/Elections -> Create New Election.
3. Provide Title, Description, StartAt (date/time), EndAt (date/time) — ensure Start < End.
4. Save as DRAFT (you can edit before opening).

**Adding ballots & options**
1. Open the election in the dashboard.
2. Add a new ballot: Title, Type (e.g., SINGLE_CHOICE).
3. For each ballot, add options: label, optional metadata (e.g., candidate bio).
4. Save changes.

**Approving voters**
1. Navigate to Voters -> Pending.
2. Review verification info (IDs, documents).
3. Approve or Reject:
   - Approve sets approvedAt and approvedBy.
   - Approved voters can log in and vote.

**Opening & closing elections**
- Change election status to OPEN to accept votes (or schedule StartAt/EndAt).
- When closing, change status to CLOSED; optionally ARCHIVE afterward.

**Exporting results / reports**
- Once closed, use Results -> Export -> CSV (available for officials/admins).
- Export includes aggregated counts, vote metadata (as allowed by policy).


### Observer workflow
**Access**
- Observers have read-only access: view election status, live aggregation (if enabled), and audit trail.

**Audit logs**
- Observers can apply filters (actor, action, date range) to inspect actions.


### Administrator workflow
**User management**
- Create or remove user accounts.
- Change roles (VOTER, ELECTION_OFFICIAL, OBSERVER, ADMIN).
- Suspend or delete accounts (use with caution — deletions may be irreversible).

**System settings**
- Configure JWT_SECRET and session policies (cookie lifetime, expiry).
- Configure rate limiting thresholds, logging sinks, and backup policies.

---

## Audit logs & compliance
All critical actions (election creation, voter approvals, vote cast events, login events) are appended to an AuditLog table.

Audit entries include actorId, actorRole, action, targetType, targetId, details, createdAt.

Logs are append-only and retained according to institutional policy. Export functionality is available for audits.

---

## Security & privacy
**Authentication**
- Staff login: password-hash (bcrypt).
- Voter login: voterId or other configured flow.
- JWTs issued for API clients; HttpOnly cookies set for browser sessions.

**Authorization**
- Role-based access control enforced at API and DB logic layers.

**Vote integrity**
- DB-level UNIQUE constraint enforces one vote per voter per election.
- Vote creation uses transactional row-level locking to avoid race conditions under concurrency.

**Data protection**
- Use HTTPS; session cookies set Secure and HttpOnly.
- Protect JWT_SECRET and database credentials; rotate secrets per policy.

**Privacy**
- Votes are stored without linking public identifiers unless required by audit/receipt design. Follow local privacy rules when sharing exports.

---

## Accessibility
UI is designed with accessible markup and WCAG considerations (ARIA attributes, keyboard navigation). If users need additional accessibility features (screen reader testing, larger fonts), contact the admin team.

---

## Troubleshooting & FAQs
**Q: I cannot log in with my voter ID.**
- A: Ensure your registration was approved. Check your account status in any confirmation email you received. If pending, contact election officials.

**Q: I saw a "You have already voted" or a 409 error.**
- A: That indicates either you already cast a vote for this election or a concurrent attempt was blocked. If you believe this is in error, contact support with your voter ID and the election ID.

**Q: How do I recover my password (staff)?**
- A: Use the "Forgot password" flow (if enabled) or contact an admin to reset.

**Q: Can I change my vote after submitting?**
- A: No — votes are immutable once recorded. If you need an exception, contact an election official immediately (process depends on policy).

**Q: How do I verify a vote was recorded?**
- A: After casting, you should receive a vote receipt (ID and timestamp). Officials can verify via the admin audit or results.

**Q: What happens if an election accidentally opens/ends at the wrong time?**
- A: Officials can change the election status or schedule; consult administrators to correct logs or run a mitigation plan.

---

## Support & contact
- First contact your local election team (email/phone provided by your institution).
- For platform-level incidents, contact system administrators: ops@example.edu (replace with real support email) with:
  - your user id / voter id
  - election id
  - timestamps and a brief description

---

## Glossary
- **DRAFT / OPEN / CLOSED / ARCHIVED** — election status lifecycle.
- **JWT** — JSON Web Token used for API authentication.
- **FOR UPDATE** — SQL row-level locking used during transactional vote creation.
- **P2002** — Prisma error code for unique constraint violation.

---

## Appendix: Example step-by-step (casting a vote)
1. Login as approved voter (Voter Login).
2. Click “Elections” → select the OPEN election.
3. Click the relevant Ballot.
4. Click the option you want, then Confirm.
5. Read and save the Vote Receipt (ID, timestamp).
6. If you see an error, capture the message and contact support.

---

## Policies & recommended administration checklist before an election
Before opening:
- Verify ballots and options are correct and complete.
- Ensure voter list is up to date and relevant voters are approved.
- Test the login and vote flow in a staging environment.
- Communicate the voting window and instructions to voters.
- Enable observers for transparency.

After closing:
- Export results and keep archival copies.
- Keep audit logs for required retention period.
- If disputes occur, follow institutional adjudication process.

---

## Customization & configuration
This platform can be configured for varying authentication flows (multi-factor for staff, voter id + OTP for voters), SSO integration, or additional ballot types.
Contact your technical team to request customizations (API, layout, reporting).

---

End of User Guide
