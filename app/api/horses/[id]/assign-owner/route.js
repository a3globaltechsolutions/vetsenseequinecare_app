import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST - Assign owner to horse
export async function POST(req, { params }) {
  // ✅ AWAIT params first!
  const { id: horseId } = await params;

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ownerId } = await req.json();

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 }
      );
    }

    // Check if horse exists
    const horse = await prisma.horse.findUnique({
      where: { id: horseId }, // ✅ Use horseId variable
    });

    if (!horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "User is not an owner" },
        { status: 400 }
      );
    }

    // Check if ownership already exists
    const existingOwnership = await prisma.ownership.findUnique({
      where: {
        horseId_ownerId: {
          horseId: horseId, // ✅ Use horseId variable
          ownerId: ownerId,
        },
      },
    });

    if (existingOwnership) {
      return NextResponse.json(
        { error: "This owner is already assigned to this horse" },
        { status: 400 }
      );
    }

    // Create ownership
    const ownership = await prisma.ownership.create({
      data: {
        horseId: horseId, // ✅ Use horseId variable
        ownerId: ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horseId, // ✅ Use horseId variable
        action: "OWNER_ASSIGNED",
        details: `Assigned ${owner.name} as owner of ${horse.name}`,
      },
    });

    return NextResponse.json(ownership, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign owner" },
      { status: 500 }
    );
  }
}

// DELETE - Remove owner from horse
export async function DELETE(req, { params }) {
  // ✅ AWAIT params first!
  const { id: horseId } = await params;

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 }
      );
    }

    // Find and delete ownership
    const ownership = await prisma.ownership.findUnique({
      where: {
        horseId_ownerId: {
          horseId: horseId, // ✅ Use horseId variable
          ownerId: ownerId,
        },
      },
      include: {
        owner: true,
        horse: true,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: "Ownership not found" },
        { status: 404 }
      );
    }

    await prisma.ownership.delete({
      where: {
        horseId_ownerId: {
          horseId: horseId, // ✅ Use horseId variable
          ownerId: ownerId,
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horseId, // ✅ Use horseId variable
        action: "OWNER_REMOVED",
        details: `Removed ${ownership.owner.name} as owner of ${ownership.horse.name}`,
      },
    });

    return NextResponse.json({ message: "Owner removed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove owner" },
      { status: 500 }
    );
  }
}
