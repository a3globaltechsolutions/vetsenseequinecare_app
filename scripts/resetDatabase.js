import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("\n⚠️  WARNING: This will delete ALL data from the database!\n");

  const answer = await question(
    "Are you sure you want to continue? (type 'yes' to confirm): "
  );

  if (answer.toLowerCase() !== "yes") {
    console.log("❌ Reset cancelled.");
    rl.close();
    return;
  }

  console.log("\n🗑️  Deleting all records...\n");

  try {
    // Delete in correct order (respecting foreign keys)
    await prisma.activityLog.deleteMany();
    console.log("✅ Deleted activity logs");

    await prisma.document.deleteMany();
    console.log("✅ Deleted documents");

    await prisma.vaccination.deleteMany();
    console.log("✅ Deleted vaccinations");

    await prisma.medicalRecord.deleteMany();
    console.log("✅ Deleted medical records");

    await prisma.ownership.deleteMany();
    console.log("✅ Deleted ownership records");

    await prisma.horse.deleteMany();
    console.log("✅ Deleted horses");

    await prisma.sealAsset.deleteMany();
    console.log("✅ Deleted seal assets");

    await prisma.user.deleteMany();
    console.log("✅ Deleted users");

    console.log("\n✅ Database reset complete!");
    console.log("\n💡 You can now run 'npm run seed' to add test data.\n");
  } catch (error) {
    console.error("❌ Error during reset:", error);
  } finally {
    rl.close();
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
