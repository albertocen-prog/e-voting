import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables. Skipping admin creation.')
    return
  }

  // Hash the admin password from environment variables
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Upsert admin user (creates if not exists, updates password/role if exists)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN', // Or whatever role identifier you use
    },
    create: {
      email: adminEmail,
      name: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Admin user configured for: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
