import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
        createdAt: true,
      },
      orderBy: { name: "asc" },
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
