import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req, context) {
  const params = await context.params; // Next.js 15 fix

  try {
    // Fetch document
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        horse: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { valid: false, error: "Document not found" },
        { status: 404 }
      );
    }

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
    return NextResponse.json(
      { valid: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
