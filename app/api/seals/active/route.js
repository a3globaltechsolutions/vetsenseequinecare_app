import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "CIRCULAR";

    const seal = await prisma.sealAsset.findFirst({
      where: {
        type: type.toUpperCase(),
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!seal) {
      return NextResponse.json({ error: "Seal not found" }, { status: 404 });
    }

    return NextResponse.json(seal);
  } catch (error) {
    console.error("Error fetching seal:", error);
    return NextResponse.json(
      { error: "Failed to fetch seal" },
      { status: 500 }
    );
  }
}

// Get all active seals
export async function POST(req) {
  try {
    const seals = await prisma.sealAsset.findMany({
      where: { isActive: true },
      orderBy: { type: "asc" },
    });

    return NextResponse.json(seals);
  } catch (error) {
    console.error("Error fetching seals:", error);
    return NextResponse.json(
      { error: "Failed to fetch seals" },
      { status: 500 }
    );
  }
}
