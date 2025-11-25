import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// IMPORTANT: Next.js 15 requires this exact function signature
export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;

    console.log("Verifying document ID:", resolvedParams.id);

    // Fetch document
    const document = await prisma.document.findUnique({
      where: { id: resolvedParams.id },
      include: {
        horse: true,
      },
    });

    if (!document) {
      console.log("Document not found:", resolvedParams.id);
      return NextResponse.json(
        { valid: false, error: "Document not found" },
        { status: 404 }
      );
    }

    console.log("Document found:", document.passportNo);

    // Document exists in our database = valid
    return NextResponse.json({
      valid: true,
      document: {
        id: document.id,
        type: document.type,
        passportNo: document.passportNo,
        fingerprint: document.fingerprint,
        createdAt: document.createdAt,
        metadata: document.metadata,
      },
      horse: document.horse,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
