const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = bcrypt.hashSync("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vetsense.com" },
    update: {},
    create: {
      email: "admin@vetsense.com",
      name: "Dr. Simpa Muhammad AbdulAzeez",
      role: "ADMIN",
      password: adminPassword,
    },
  });

  // Create vet user
  const vetPassword = bcrypt.hashSync("vet123", 10);

  const vet = await prisma.user.upsert({
    where: { email: "vet@vetsense.com" },
    update: {},
    create: {
      email: "vet@vetsense.com",
      name: "Dr. Sarah Johnson",
      role: "VET",
      password: vetPassword,
    },
  });

  console.log({ admin, vet });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
