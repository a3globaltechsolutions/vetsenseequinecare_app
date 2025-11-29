import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET single owner
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ✅ AWAIT params
    const owner = await prisma.user.findUnique({
      where: { id, role: "OWNER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        title: true,
        address: true,
        state: true,
        country: true,
        createdAt: true,
        ownedHorses: {
          include: {
            horse: {
              select: {
                id: true,
                name: true,
                breed: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json(owner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch owner" },
      { status: 500 }
    );
  }
}

// PUT - Update owner
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ✅ AWAIT params first!
    const data = await req.json();

    // Check if owner exists
    const existingOwner = await prisma.user.findUnique({
      where: { id }, // ✅ Use the awaited id
    });

    if (!existingOwner || existingOwner.role !== "OWNER") {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingOwner.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailTaken && emailTaken.id !== id) {
        // ✅ Also check it's not the same user
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      title: data.title || null,
      address: data.address || null,
      state: data.state || null,
      country: data.country || "Nigeria",
    };

    // If password is provided, hash it
    if (data.password && data.password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Update owner
    const owner = await prisma.user.update({
      where: { id }, // ✅ Use the awaited id
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        title: true,
        address: true,
        state: true,
        country: true,
        createdAt: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "OWNER_UPDATED",
        details: `Updated owner account: ${owner.name} (${owner.email})`,
      },
    });

    return NextResponse.json(owner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update owner" },
      { status: 500 }
    );
  }
}

// DELETE owner
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ✅ AWAIT params first!
    const owner = await prisma.user.findUnique({
      where: { id }, // ✅ Use the awaited id
      select: {
        name: true,
        email: true,
        role: true,
        _count: {
          select: { ownedHorses: true },
        },
      },
    });

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Check if owner has horses
    if (owner._count.ownedHorses > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete owner. ${owner.name} has ${owner._count.ownedHorses} horse(s) assigned. Please reassign or remove horses first.`,
        },
        { status: 400 }
      );
    }

    // Log activity before deletion
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "OWNER_DELETED",
        details: `Deleted owner account: ${owner.name} (${owner.email})`,
      },
    });

    // Delete owner
    await prisma.user.delete({
      where: { id }, // ✅ Use the awaited id
    });

    return NextResponse.json({ message: "Owner deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete owner" },
      { status: 500 }
    );
  }
}
