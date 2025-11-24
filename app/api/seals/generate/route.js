import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  generateCircularSeal,
  generateEmblemSeal,
  generateWaxSeal,
  generateSignatureOverlay,
} from "@/lib/seals/sealGenerator";

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Mark all existing seals as inactive
    await prisma.sealAsset.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Generate all seal types
    console.log("Generating circular seal...");
    const circular = await generateCircularSeal();

    console.log("Generating emblem seal...");
    const emblem = await generateEmblemSeal();

    console.log("Generating wax seal...");
    const wax = await generateWaxSeal();

    console.log("Generating signature overlay...");
    const signature = await generateSignatureOverlay();

    // Save to database
    const seals = await Promise.all([
      prisma.sealAsset.create({
        data: {
          type: circular.type,
          pngUrl: circular.pngUrl,
          fingerprint: circular.fingerprint,
          metadata: circular.metadata,
          isActive: true,
        },
      }),
      prisma.sealAsset.create({
        data: {
          type: emblem.type,
          pngUrl: emblem.pngUrl,
          fingerprint: emblem.fingerprint,
          metadata: emblem.metadata,
          isActive: true,
        },
      }),
      prisma.sealAsset.create({
        data: {
          type: wax.type,
          pngUrl: wax.pngUrl,
          fingerprint: wax.fingerprint,
          metadata: wax.metadata,
          isActive: true,
        },
      }),
      prisma.sealAsset.create({
        data: {
          type: signature.type,
          pngUrl: signature.pngUrl,
          fingerprint: signature.fingerprint,
          metadata: signature.metadata,
          isActive: true,
        },
      }),
    ]);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "SEALS_GENERATED",
        details:
          "Generated all seal types (circular, emblem, wax, signature overlay)",
      },
    });

    return NextResponse.json({
      success: true,
      message: "All seals generated successfully",
      seals: seals.map((seal) => ({
        id: seal.id,
        type: seal.type,
        url: seal.pngUrl,
        fingerprint: seal.fingerprint,
      })),
    });
  } catch (error) {
    console.error("Seal generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate seals", details: error.message },
      { status: 500 }
    );
  }
}
