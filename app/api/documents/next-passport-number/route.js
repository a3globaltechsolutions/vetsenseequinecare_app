import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const year = new Date().getFullYear();

    // Get the last passport number for this year
    const lastPassport = await prisma.document.findFirst({
      where: {
        type: "PASSPORT",
        passportNo: {
          startsWith: `VETSENSE-E-${year}-`,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let seq = 1;
    if (lastPassport && lastPassport.passportNo) {
      const parts = lastPassport.passportNo.split("-");
      seq = parseInt(parts[3]) + 1;
    }

    const passportNo = `VETSENSE-E-${year}-${seq.toString().padStart(3, "0")}`;

    return NextResponse.json({ passportNo });
  } catch (error) {
    console.error("Error generating passport number:", error);
    return NextResponse.json(
      { error: "Failed to generate passport number" },
      { status: 500 }
    );
  }
}
