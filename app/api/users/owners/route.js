import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET all owners (for vet only)
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const owners = await prisma.user.findMany({
      where: { role: "OWNER" },
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
        _count: {
          select: {
            ownedHorses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(owners);
  } catch (error) {
    console.error("Error fetching owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 }
    );
  }
}

// POST - Create new owner
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create owner with all fields
    const owner = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: passwordHash,
        phone: data.phone || null,
        title: data.title || null,
        address: data.address || null,
        state: data.state || null,
        country: data.country || "Nigeria",
        role: "OWNER",
      },
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
        action: "OWNER_CREATED",
        details: `Created owner account: ${owner.name} (${owner.email})`,
      },
    });

    return NextResponse.json(owner, { status: 201 });
  } catch (error) {
    console.error("Error creating owner:", error);
    return NextResponse.json(
      { error: "Failed to create owner" },
      { status: 500 }
    );
  }
}
