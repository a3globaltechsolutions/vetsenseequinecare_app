import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log("👥 Creating users...");

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
  console.log("✅ Vet created:", vet.email);

  const owner1Password = await bcrypt.hash("owner123", 10);
  const owner1 = await prisma.user.upsert({
    where: { email: "owner1@example.com" },
    update: {},
    create: {
      email: "owner1@example.com",
      passwordHash: owner1Password,
      name: "John Doe",
      phone: "08012345678",
      title: "Mr.",
      role: "OWNER",
    },
  });
  console.log("✅ Owner 1 created:", owner1.email);

  const owner2Password = await bcrypt.hash("owner123", 10);
  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@example.com" },
    update: {},
    create: {
      email: "owner2@example.com",
      passwordHash: owner2Password,
      name: "Jane Smith",
      phone: "08087654321",
      title: "Mr.",
      role: "OWNER",
    },
  });
  console.log("✅ Owner 2 created:", owner2.email);

  // ============================================
  // 2. CREATE HORSES
  // ============================================
  console.log("\n🐴 Creating horses...");

  const horse1 = await prisma.horse.create({
    data: {
      name: "Thunder",
      breed: "Arabian",
      age: 5,
      color: "Bay",
      sex: "STALLION",
      microchip: "985112345678901",
      status: "ACTIVE",
    },
  });
  console.log("✅ Horse created:", horse1.name);

  const horse2 = await prisma.horse.create({
    data: {
      name: "Luna",
      breed: "Thoroughbred",
      age: 3,
      color: "Chestnut",
      sex: "MARE",
      microchip: "985112345678902",
      status: "ACTIVE",
    },
  });
  console.log("✅ Horse created:", horse2.name);

  const horse3 = await prisma.horse.create({
    data: {
      name: "Spirit",
      breed: "Quarter Horse",
      age: 7,
      color: "Black",
      sex: "GELDING",
      microchip: "985112345678903",
      status: "ACTIVE",
    },
  });
  console.log("✅ Horse created:", horse3.name);

  // ============================================
  // 3. CREATE OWNERSHIP RELATIONSHIPS
  // ============================================
  console.log("\n🔗 Creating ownership relationships...");

  await prisma.ownership.create({
    data: {
      horseId: horse1.id,
      ownerId: owner1.id,
    },
  });
  console.log(`✅ ${horse1.name} assigned to ${owner1.name}`);

  await prisma.ownership.create({
    data: {
      horseId: horse2.id,
      ownerId: owner1.id,
    },
  });
  console.log(`✅ ${horse2.name} assigned to ${owner1.name}`);

  await prisma.ownership.create({
    data: {
      horseId: horse3.id,
      ownerId: owner2.id,
    },
  });
  console.log(`✅ ${horse3.name} assigned to ${owner2.name}`);

  // ============================================
  // 4. CREATE SAMPLE MEDICAL RECORDS
  // ============================================
  console.log("\n📋 Creating medical records...");

  await prisma.medicalRecord.create({
    data: {
      horseId: horse1.id,
      diagnosis: "Mild colic",
      treatment: "Administered banamine, monitored for 24 hours",
      notes: "Horse recovered fully, advised owner to monitor diet",
      attachments: [],
    },
  });
  console.log(`✅ Medical record added for ${horse1.name}`);

  await prisma.medicalRecord.create({
    data: {
      horseId: horse2.id,
      diagnosis: "Routine dental checkup",
      treatment: "Teeth floating performed",
      notes: "All teeth in good condition, next checkup in 6 months",
      attachments: [],
    },
  });
  console.log(`✅ Medical record added for ${horse2.name}`);

  // ============================================
  // 5. CREATE SAMPLE VACCINATIONS
  // ============================================
  console.log("\n💉 Creating vaccination records...");

  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  await prisma.vaccination.create({
    data: {
      horseId: horse1.id,
      vaccineName: "Tetanus Toxoid",
      dateGiven: today,
      nextDue: nextYear,
      batchNumber: "TT-2024-001",
      notes: "Annual tetanus booster",
    },
  });
  console.log(`✅ Vaccination record added for ${horse1.name}`);

  await prisma.vaccination.create({
    data: {
      horseId: horse2.id,
      vaccineName: "Equine Influenza",
      dateGiven: today,
      nextDue: nextYear,
      batchNumber: "FLU-2024-042",
      notes: "Seasonal flu vaccine",
    },
  });
  console.log(`✅ Vaccination record added for ${horse2.name}`);

  await prisma.vaccination.create({
    data: {
      horseId: horse3.id,
      vaccineName: "West Nile Virus",
      dateGiven: today,
      nextDue: nextYear,
      batchNumber: "WNV-2024-015",
      notes: "Annual WNV protection",
    },
  });
  console.log(`✅ Vaccination record added for ${horse3.name}`);

  // ============================================
  // 6. CREATE ACTIVITY LOGS
  // ============================================
  console.log("\n📝 Creating activity logs...");

  await prisma.activityLog.create({
    data: {
      userId: vet.id,
      horseId: horse1.id,
      action: "HORSE_CREATED",
      details: `Created horse profile for ${horse1.name}`,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: vet.id,
      horseId: horse1.id,
      action: "MEDICAL_RECORD_ADDED",
      details: "Added colic treatment record",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: vet.id,
      action: "SYSTEM_ACCESS",
      details: "Vet logged into system",
    },
  });

  console.log("✅ Activity logs created");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 Database seeding completed successfully!");
  console.log("=".repeat(50));

  const userCount = await prisma.user.count();
  const horseCount = await prisma.horse.count();
  const medicalRecordCount = await prisma.medicalRecord.count();
  const vaccinationCount = await prisma.vaccination.count();
  const activityLogCount = await prisma.activityLog.count();

  console.log("\n📊 Database Statistics:");
  console.log(`   Users: ${userCount}`);
  console.log(`   Horses: ${horseCount}`);
  console.log(`   Medical Records: ${medicalRecordCount}`);
  console.log(`   Vaccinations: ${vaccinationCount}`);
  console.log(`   Activity Logs: ${activityLogCount}`);

  console.log("\n📋 Login Credentials:");
  console.log("\n🏥 VET Account:");
  console.log("   Email: vet@vetsense.com");
  console.log("   Password: vet123");
  console.log("\n👤 OWNER 1 Account (has 2 horses):");
  console.log("   Email: owner1@example.com");
  console.log("   Password: owner123");
  console.log("\n👤 OWNER 2 Account (has 1 horse):");
  console.log("   Email: owner2@example.com");
  console.log("   Password: owner123");
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
