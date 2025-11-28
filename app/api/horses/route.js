import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all horses
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Test database connection
    await prisma.$connect();

    let horses;

    if (session.user.role === "VET") {
      // Vet sees all horses
      horses = await prisma.horse.findMany({
        include: {
          vaccinations: {
            orderBy: { dateGiven: "desc" },
          },
          medicalRecords: {
            orderBy: { recordDate: "desc" },
          },
          owners: {
            include: {
              owner: {
                select: { id: true, name: true, email: true, phone: true },
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
          vaccinations: {
            orderBy: { dateGiven: "desc" },
          },
          medicalRecords: {
            orderBy: { recordDate: "desc" },
          },
          owners: {
            include: {
              owner: {
                select: { id: true, name: true, email: true, phone: true },
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

    return NextResponse.json(horses, { status: 200 });
  } catch (error) {
    console.error("Error fetching horses:", error);

    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to fetch horses",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new horse
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "VET") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Normalize dates to ISO format (midnight UTC)
    const dobISO = data.dob ? new Date(`${data.dob}T00:00:00Z`) : null;
    const lastDewormingISO = data.lastDeworming
      ? new Date(`${data.lastDeworming}T00:00:00Z`)
      : null;

    // Create horse
    const horse = await prisma.horse.create({
      data: {
        name: data.name,
        breed: data.breed || null,
        dob: dobISO,
        color: data.color || null,
        sex: data.sex || null,
        microchip: data.microchip || null,
        imageUrl: data.imageUrl || null,
        countryOfBirth: data.countryOfBirth || "Nigeria",
        sire: data.sire || null,
        dam: data.dam || null,
        weight: data.weight ? parseFloat(data.weight) : null,
        bodyConditionScore: data.bodyConditionScore
          ? parseFloat(data.bodyConditionScore)
          : null,
        lastDeworming: lastDewormingISO,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        behavior: data.behavior || null,
        dietary: data.dietary || null,
        exerciseRestrictions: data.exerciseRestrictions || null,
        insurance: data.insurance || null,
        currentMedications: data.currentMedications || null,
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
      {
        error: "Failed to create horse",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
