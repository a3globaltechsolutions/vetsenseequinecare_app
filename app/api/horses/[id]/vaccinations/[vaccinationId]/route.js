import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single vaccination
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { vaccinationId } = await params;

    const vaccination = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
    });

    if (!vaccination) {
      return NextResponse.json(
        { error: "Vaccination not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vaccination);
  } catch (error) {
    console.error("Error fetching vaccination:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccination" },
      { status: 500 }
    );
  }
}

// PUT - Update vaccination
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { vaccinationId, id: horseId } = await params;

    const data = await req.json();

    const vaccination = await prisma.vaccination.update({
      where: { id: vaccinationId },
      data: {
        vaccineName: data.vaccineName,
        dateGiven: new Date(data.dateGiven),
        nextDue: new Date(data.nextDue),
        batchNumber: data.batchNumber || null,
        notes: data.notes || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horseId,
        action: "VACCINATION_UPDATED",
        details: `Updated ${data.vaccineName} vaccination`,
      },
    });

    return NextResponse.json(vaccination);
  } catch (error) {
    console.error("Error updating vaccination:", error);
    return NextResponse.json(
      { error: "Failed to update vaccination" },
      { status: 500 }
    );
  }
}

// DELETE vaccination
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params first
    const { vaccinationId, id: horseId } = await params;

    const vaccination = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
      select: { vaccineName: true },
    });

    if (!vaccination) {
      return NextResponse.json(
        { error: "Vaccination not found" },
        { status: 404 }
      );
    }

    await prisma.vaccination.delete({
      where: { id: vaccinationId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horseId,
        action: "VACCINATION_DELETED",
        details: `Deleted ${vaccination.vaccineName} vaccination`,
      },
    });

    return NextResponse.json({ message: "Vaccination deleted successfully" });
  } catch (error) {
    console.error("Error deleting vaccination:", error);
    return NextResponse.json(
      { error: "Failed to delete vaccination" },
      { status: 500 }
    );
  }
}
