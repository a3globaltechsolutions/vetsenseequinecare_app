import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n📊 VETSENSE Database Statistics\n");
  console.log("=".repeat(50));

  // Count all records
  const userCount = await prisma.user.count();
  const horseCount = await prisma.horse.count();
  const ownershipCount = await prisma.ownership.count();
  const medicalRecordCount = await prisma.medicalRecord.count();
  const vaccinationCount = await prisma.vaccination.count();
  const documentCount = await prisma.document.count();
  const sealAssetCount = await prisma.sealAsset.count();
  const activityLogCount = await prisma.activityLog.count();

  console.log(`\n👥 Users: ${userCount}`);
  const users = await prisma.user.findMany({
    select: { name: true, email: true, role: true },
  });
  users.forEach((user) => {
    console.log(`   • ${user.name} (${user.role}) - ${user.email}`);
  });

  console.log(`\n🐴 Horses: ${horseCount}`);
  const horses = await prisma.horse.findMany({
    select: { name: true, breed: true, status: true },
    orderBy: { name: "asc" },
  });
  horses.forEach((horse) => {
    console.log(
      `   • ${horse.name} - ${horse.breed || "Unknown breed"} (${horse.status})`
    );
  });

  console.log(`\n🔗 Ownership Links: ${ownershipCount}`);
  console.log(`📋 Medical Records: ${medicalRecordCount}`);
  console.log(`💉 Vaccinations: ${vaccinationCount}`);
  console.log(`📄 Documents: ${documentCount}`);
  console.log(`🔒 Seal Assets: ${sealAssetCount}`);
  console.log(`📝 Activity Logs: ${activityLogCount}`);

  // Check for recent activity
  const recentLogs = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      horse: { select: { name: true } },
    },
  });

  if (recentLogs.length > 0) {
    console.log("\n📝 Recent Activity:");
    recentLogs.forEach((log) => {
      const userName = log.user?.name || "System";
      const horseName = log.horse?.name || "";
      const details = horseName ? `(${horseName})` : "";
      console.log(`   • ${userName}: ${log.action} ${details}`);
    });
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
