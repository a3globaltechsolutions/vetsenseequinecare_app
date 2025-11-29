import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single medical record
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { recordId } = await params;

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch medical record" },
      { status: 500 }
    );
  }
}

// PUT - Update medical record
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { recordId, id: horseId } = await params;

    const data = await req.json();

    const record = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes || null,
        drug: data.drug || null,
        dosage: data.dosage || null,
        vet: data.vet || null,
        attachments: data.attachments || [],
        recordDate: data.recordDate ? new Date(data.recordDate) : undefined,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horseId,
        action: "MEDICAL_RECORD_UPDATED",
        details: `Updated medical record: ${data.diagnosis}`,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update medical record" },
      { status: 500 }
    );
  }
}

// DELETE medical record
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { recordId, id: horseId } = await params;

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      select: { diagnosis: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.medicalRecord.delete({
      where: { id: recordId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horseId,
        action: "MEDICAL_RECORD_DELETED",
        details: `Deleted medical record: ${record.diagnosis}`,
      },
    });

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete medical record" },
      { status: 500 }
    );
  }
}
