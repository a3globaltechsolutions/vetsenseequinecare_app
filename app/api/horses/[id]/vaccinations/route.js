import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addYears } from "date-fns";

// GET all vaccinations for a horse
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params
    const { id } = await params;

    const vaccinations = await prisma.vaccination.findMany({
      where: { horseId: id },
      orderBy: { dateGiven: "desc" },
    });

    return NextResponse.json(vaccinations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vaccinations" },
      { status: 500 }
    );
  }
}

// POST - Create new vaccination
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { id } = await params;

    const data = await req.json();

    // Validate required fields
    if (!data.vaccineName || !data.dateGiven) {
      return NextResponse.json(
        { error: "Vaccine name and date given are required" },
        { status: 400 }
      );
    }

    // Check if horse exists - FIXED: Use include OR select, not both
    const horse = await prisma.horse.findUnique({
      where: { id },
      include: {
        owners: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    // Auto-calculate next due date (1 year from date given by default)
    const nextDue = data.nextDue
      ? new Date(data.nextDue)
      : addYears(new Date(data.dateGiven), 1);

    // Create vaccination record
    const vaccination = await prisma.vaccination.create({
      data: {
        horseId: id,
        vaccineName: data.vaccineName,
        dateGiven: new Date(data.dateGiven),
        nextDue: nextDue,
        batchNumber: data.batchNumber || null,
        administeredBy: data.administeredBy || null,
        certificateNo: data.certificateNo || null,
        notes: data.notes || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: id,
        action: "VACCINATION_ADDED",
        details: `Added ${data.vaccineName} vaccination for ${horse.name}`,
      },
    });

    // TODO: Send email notification to owners (Phase 9)
    // For now, we'll add a reminder in activity log
    if (horse.owners && horse.owners.length > 0) {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          horseId: id,
          action: "VACCINATION_REMINDER_SCHEDULED",
          details: `Vaccination reminder scheduled for ${new Date(
            nextDue
          ).toLocaleDateString()}`,
        },
      });
    }

    return NextResponse.json(vaccination, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create vaccination" },
      { status: 500 }
    );
  }
}
