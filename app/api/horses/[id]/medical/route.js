import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "VET") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 DEBUG - Horse ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Horse ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.diagnosis || !body.treatment) {
      return NextResponse.json(
        { error: "Diagnosis and treatment are required" },
        { status: 400 }
      );
    }

    // Check if horse exists
    const horse = await prisma.horse.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    // Create medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        horseId: id,
        diagnosis: body.diagnosis,
        treatment: body.treatment,
        drug: body.drug || null, // NEW: Drug used
        dosage: body.dosage || null, // NEW: Dosage information
        vet: body.vet || null, // NEW: Administering veterinarian
        notes: body.notes || null,
        attachments: body.attachments || [],
        recordDate: body.recordDate ? new Date(body.recordDate) : new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: id,
        action: "MEDICAL_RECORD_ADDED",
        details: `Added medical record for ${horse.name}: ${body.diagnosis}`,
      },
    });

    return NextResponse.json(medicalRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating medical record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Horse ID is required" },
        { status: 400 }
      );
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { horseId: id },
      orderBy: { recordDate: "desc" },
    });

    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
