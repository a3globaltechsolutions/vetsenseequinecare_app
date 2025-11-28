import prisma from "../lib/prisma.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    console.log(
      "\n⚠️  WARNING: This will delete ONLY broken/orphaned records (safe)\n"
    );

    // Get existing IDs
    const existingUserIds = (
      await prisma.user.findMany({ select: { id: true } })
    ).map((u) => u.id);

    const existingHorseIds = (
      await prisma.horse.findMany({ select: { id: true } })
    ).map((h) => h.id);

    // Count broken records first
    const brokenOwnerships = await prisma.ownership.count({
      where: {
        OR: [
          { ownerId: { notIn: existingUserIds } },
          { horseId: { notIn: existingHorseIds } },
        ],
      },
    });

    const brokenVaccinations = await prisma.vaccination.count({
      where: { horseId: { notIn: existingHorseIds } },
    });

    const brokenMedicalRecords = await prisma.medicalRecord.count({
      where: { horseId: { notIn: existingHorseIds } },
    });

    const brokenDocuments = await prisma.document.count({
      where: { horseId: { notIn: existingHorseIds } },
    });

    console.log("Broken/orphaned records found:");
    console.log(`- Ownerships: ${brokenOwnerships}`);
    console.log(`- Vaccinations: ${brokenVaccinations}`);
    console.log(`- Medical Records: ${brokenMedicalRecords}`);
    console.log(`- Documents: ${brokenDocuments}\n`);

    if (
      brokenOwnerships === 0 &&
      brokenVaccinations === 0 &&
      brokenMedicalRecords === 0 &&
      brokenDocuments === 0
    ) {
      console.log("✅ No broken records found. Nothing to delete.");
      rl.close();
      return;
    }

    const answer = await question(
      "Do you want to delete these broken records? (type 'yes' to confirm): "
    );

    if (answer.toLowerCase() !== "yes") {
      console.log("❌ Cleanup cancelled.");
      rl.close();
      return;
    }

    console.log("\n🗑️  Deleting broken records...\n");

    const deletedOwnerships = await prisma.ownership.deleteMany({
      where: {
        OR: [
          { ownerId: { notIn: existingUserIds } },
          { horseId: { notIn: existingHorseIds } },
        ],
      },
    });
    console.log(
      `✅ Deleted ${deletedOwnerships.count} broken ownership records`
    );

    const deletedVaccinations = await prisma.vaccination.deleteMany({
      where: { horseId: { notIn: existingHorseIds } },
    });
    console.log(
      `✅ Deleted ${deletedVaccinations.count} broken vaccination records`
    );

    const deletedMedicalRecords = await prisma.medicalRecord.deleteMany({
      where: { horseId: { notIn: existingHorseIds } },
    });
    console.log(
      `✅ Deleted ${deletedMedicalRecords.count} broken medical records`
    );

    const deletedDocuments = await prisma.document.deleteMany({
      where: { horseId: { notIn: existingHorseIds } },
    });
    console.log(`✅ Deleted ${deletedDocuments.count} broken document records`);

    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the cleanup
main();
