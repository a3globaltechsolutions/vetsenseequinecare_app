import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all horses
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let horses;

    if (session.user.role === "VET") {
      // Vet sees all horses
      horses = await prisma.horse.findMany({
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
          _count: {
            select: {
              medicalRecords: true,
              vaccinations: true,
              documents: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Owner sees only their horses
      horses = await prisma.horse.findMany({
        where: {
          owners: {
            some: {
              ownerId: session.user.id,
            },
          },
        },
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
          _count: {
            select: {
              medicalRecords: true,
              vaccinations: true,
              documents: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(horses);
  } catch (error) {
    console.error("Error fetching horses:", error);
    return NextResponse.json(
      { error: "Failed to fetch horses" },
      { status: 500 }
    );
  }
}

// POST - Create new horse
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Horse name is required" },
        { status: 400 }
      );
    }

    // Check if microchip already exists
    if (data.microchip) {
      const existing = await prisma.horse.findUnique({
        where: { microchip: data.microchip },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A horse with this microchip already exists" },
          { status: 400 }
        );
      }
    }

    // Create horse
    const horse = await prisma.horse.create({
      data: {
        name: data.name,
        breed: data.breed || null,
        age: data.age ? parseInt(data.age) : null,
        color: data.color || null,
        sex: data.sex || null,
        microchip: data.microchip || null,
        imageUrl: data.imageUrl || null,
        status: "ACTIVE",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horse.id,
        action: "HORSE_CREATED",
        details: `Created horse profile: ${horse.name}`,
      },
    });

    return NextResponse.json(horse, { status: 201 });
  } catch (error) {
    console.error("Error creating horse:", error);
    return NextResponse.json(
      { error: "Failed to create horse" },
      { status: 500 }
    );
  }
}
