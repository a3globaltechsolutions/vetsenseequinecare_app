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

  // Create Owner user
  const ownerPassword = await bcrypt.hash("owner123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      passwordHash: ownerPassword,
      name: "John Doe",
      phone: "08012345678",
      title: "Mr",
      role: "OWNER",
    },
  });
  console.log("✅ Owner user created:", owner.email);

  console.log("\n📋 Login Credentials:");
  console.log("\n🏥 VET Account:");
  console.log("   Email: vet@vetsense.com");
  console.log("   Password: vet123");
  console.log("\n👤 OWNER Account:");
  console.log("   Email: owner@example.com");
  console.log("   Password: owner123");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
