import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single horse
export async function GET({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      include: {
        owners: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        medicalRecords: {
          orderBy: { recordDate: "desc" },
        },
        vaccinations: {
          orderBy: { dateGiven: "desc" },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    // Check authorization (owners can only see their horses)
    if (session.user.role === "OWNER") {
      const isOwner = horse.owners.some(
        (ownership) => ownership.ownerId === session.user.id
      );
      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(horse);
  } catch (error) {
    console.error("Error fetching horse:", error);
    return NextResponse.json(
      { error: "Failed to fetch horse" },
      { status: 500 }
    );
  }
}

// PUT - Update horse
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Check if microchip is being changed and if it already exists
    if (data.microchip) {
      const existing = await prisma.horse.findFirst({
        where: {
          microchip: data.microchip,
          NOT: { id: params.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A horse with this microchip already exists" },
          { status: 400 }
        );
      }
    }

    const horse = await prisma.horse.update({
      where: { id: params.id },
      data: {
        name: data.name,
        breed: data.breed || null,
        age: data.age ? parseInt(data.age) : null,
        color: data.color || null,
        sex: data.sex || null,
        microchip: data.microchip || null,
        imageUrl: data.imageUrl || null,
        status: data.status || "ACTIVE",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horse.id,
        action: "HORSE_UPDATED",
        details: `Updated horse profile: ${horse.name}`,
      },
    });

    return NextResponse.json(horse);
  } catch (error) {
    console.error("Error updating horse:", error);
    return NextResponse.json(
      { error: "Failed to update horse" },
      { status: 500 }
    );
  }
}

// DELETE horse
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      select: { name: true },
    });

    if (!horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    // Log activity before deletion
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: params.id,
        action: "HORSE_DELETED",
        details: `Deleted horse profile: ${horse.name}`,
      },
    });

    await prisma.horse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Horse deleted successfully" });
  } catch (error) {
    console.error("Error deleting horse:", error);
    return NextResponse.json(
      { error: "Failed to delete horse" },
      { status: 500 }
    );
  }
}
