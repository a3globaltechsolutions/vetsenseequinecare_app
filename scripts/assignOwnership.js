import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔗 Assigning horses to owners...\n");

  // Get all horses
  const horses = await prisma.horse.findMany({
    select: { id: true, name: true },
  });

  // Get all owners
  const owners = await prisma.user.findMany({
    where: { role: "OWNER" },
    select: { id: true, name: true, email: true },
  });

  if (horses.length === 0) {
    console.log("❌ No horses found. Please add horses first.");
    return;
  }

  if (owners.length === 0) {
    console.log("❌ No owners found. Please create owner accounts first.");
    return;
  }

  console.log(
    `Found ${horses.length} horse(s) and ${owners.length} owner(s)\n`
  );

  // Assign each horse to the first owner (or distribute evenly)
  for (let i = 0; i < horses.length; i++) {
    const horse = horses[i];
    const owner = owners[i % owners.length]; // Distribute evenly

    // Check if ownership already exists
    const existing = await prisma.ownership.findUnique({
      where: {
        horseId_ownerId: {
          horseId: horse.id,
          ownerId: owner.id,
        },
      },
    });

    if (existing) {
      console.log(`⏭️  ${horse.name} already assigned to ${owner.name}`);
      continue;
    }

    // Create ownership
    await prisma.ownership.create({
      data: {
        horseId: horse.id,
        ownerId: owner.id,
      },
    });

    console.log(`✅ Assigned ${horse.name} to ${owner.name} (${owner.email})`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Ownership assignment complete!");
  console.log("=".repeat(50) + "\n");

  // Show summary
  console.log("📊 Summary:");
  for (const owner of owners) {
    const ownerships = await prisma.ownership.findMany({
      where: { ownerId: owner.id },
      include: {
        horse: { select: { name: true } },
      },
    });

    console.log(`\n${owner.name} (${owner.email}):`);
    if (ownerships.length === 0) {
      console.log("  No horses assigned");
    } else {
      ownerships.forEach((o) => {
        console.log(`  • ${o.horse.name}`);
      });
    }
  }

  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
