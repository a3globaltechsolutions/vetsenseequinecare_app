import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test users...");

  // Create Vet user
  const vetPassword = await bcrypt.hash("vet123", 10);
  const vet = await prisma.user.upsert({
    where: { email: "vet@vetsense.com" },
    update: {},
    create: {
      email: "vet@vetsense.com",
      passwordHash: vetPassword,
      name: "Simpa Muhammad AbdulAzeez",
      phone: "07067677446",
      title: "Dr",
      role: "VET",
    },
  });
  console.log("✅ Vet user created:", vet.email);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
