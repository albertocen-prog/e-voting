const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('AdminPassword123!', 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@e-voting.local' },
    update: {},
    create: {
      email: 'admin@e-voting.local',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  // Create Election Official
  await prisma.user.upsert({
    where: { email: 'official@e-voting.local' },
    update: {},
    create: {
      email: 'official@e-voting.local',
      name: 'Chief Election Official',
      passwordHash,
      role: 'ELECTION_OFFICIAL',
      status: 'APPROVED',
    },
  });

  // Create Observer
  await prisma.user.upsert({
    where: { email: 'observer@e-voting.local' },
    update: {},
    create: {
      email: 'observer@e-voting.local',
      name: 'Independent Observer',
      passwordHash,
      role: 'OBSERVER',
      status: 'APPROVED',
    },
  });

  console.log('Seed accounts created successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
