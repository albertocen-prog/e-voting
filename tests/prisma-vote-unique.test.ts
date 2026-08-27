// tests/prisma-vote-unique.test.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

describe('vote uniqueness', () => {
  beforeAll(async () => {
    // Optionally: run migrations and seed before tests in CI/local
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('cannot create two votes for same election and voterRegistration', async () => {
    // create user
    const user = await prisma.user.create({ data: { name: 'Test Voter', email: `tv-${Date.now()}@example.com`, role: 'VOTER', status: 'APPROVED' } })
    const reg = await prisma.voterRegistration.create({ data: { userId: user.id, voterId: `V-${Date.now()}` } })
    // create election, ballot, option
    const admin = await prisma.user.create({ data: { name: 'Admin', email: `a-${Date.now()}@example.com`, role: 'ADMIN', status: 'APPROVED' } })
    const election = await prisma.election.create({ data: { title: 'T', startAt: new Date(), endAt: new Date(Date.now() + 3600 * 1000), status: 'OPEN', createdBy: admin.id } })
    const ballot = await prisma.ballot.create({ data: { electionId: election.id, title: 'B' } })
    const option = await prisma.option.create({ data: { ballotId: ballot.id, label: 'Opt' } })

    // first vote should succeed
    const v1 = await prisma.vote.create({ data: { electionId: election.id, ballotId: ballot.id, optionId: option.id, voterRegistrationId: reg.id } })
    expect(v1).toBeDefined()

    // second vote should throw Prisma P2002 (unique constraint)
    let threw = false
    try {
      await prisma.vote.create({ data: { electionId: election.id, ballotId: ballot.id, optionId: option.id, voterRegistrationId: reg.id } })
    } catch (err) {
      threw = true
      expect(err.code === 'P2002' || err.message).toBeTruthy()
    }
    expect(threw).toBe(true)
  }, 20000)
})
