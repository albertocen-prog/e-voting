// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash('adminpass', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'APPROVED',
    },
  })

  // Create a sample election (OPEN) with a ballot and options
  const election = await prisma.election.create({
    data: {
      title: 'Sample Election 2026',
      description: 'Seeded sample election',
      startAt: new Date(Date.now() - 1000 * 60 * 60),
      endAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      status: 'OPEN',
      createdBy: admin.id,
    },
  })

  const ballot = await prisma.ballot.create({
    data: {
      electionId: election.id,
      title: 'Student Council President',
    },
  })

  const optionA = await prisma.option.create({
    data: { ballotId: ballot.id, label: 'Candidate A' },
  })
  const optionB = await prisma.option.create({
    data: { ballotId: ballot.id, label: 'Candidate B' },
  })

  // Create an approved voter
  const voterUser = await prisma.user.create({
    data: {
      email: 'voter1@example.com',
      name: 'Voter One',
      role: 'VOTER',
      status: 'APPROVED',
    },
  })

  const voterReg = await prisma.voterRegistration.create({
    data: {
      userId: voterUser.id,
      voterId: 'VOTER-0001',
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  })

  console.log('Seed complete:')
  console.log({ admin: admin.email, electionId: election.id, ballotId: ballot.id, optionA: optionA.id, optionB: optionB.id, voterId: voterReg.voterId })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
