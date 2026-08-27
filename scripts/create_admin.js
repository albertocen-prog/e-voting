// scripts/create_admin.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const [password, email, name] = process.argv.slice(2);
  if (!password || !email) {
    console.error('Usage: node scripts/create_admin.js <password> <email> [name]');
    process.exit(2);
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || 'Admin',
        passwordHash: hash,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });
    console.log('Created admin:', user.id, user.email);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
