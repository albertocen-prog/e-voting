// scripts/reset_password.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const [email, newPassword] = process.argv.slice(2);
  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset_password.js <email> <newPassword>');
    process.exit(2);
  }
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
    });
    console.log('Password reset for:', user.email);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
