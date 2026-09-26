import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create 5 profesionales
  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { username: `profesional${i}` },
      update: {},
      create: {
        username: `profesional${i}`,
        password: `password${i}`,
        name: `Profesional ${i}`,
        role: "PROFESSIONAL",
      },
    })
  }

  // Create an admisionista for testing
  await prisma.user.upsert({
    where: { username: "admin1" },
    update: {},
    create: {
      username: "admin1",
      password: "password1",
      name: "Admisionista 1",
      role: "ADMINISIONISTA",
    },
  })

  console.log("Database seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
