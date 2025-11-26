// app/api/horses/[id]/generate-passport/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { generatePassport } from "@/lib/pdf/passportGenerator";
import { UTApi } from "uploadthing/server";
import crypto from "crypto";

const prisma = new PrismaClient();
const utapi = new UTApi();

export async function POST(req, context) {
  const params = await context.params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get horse data with owners
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      include: {
        owners: {
          include: { owner: true },
        },
      },
    });

    if (!horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    // Get next passport number
    const year = new Date().getFullYear();
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

    // Generate PDF
    const pdf = await generatePassport(
      horse,
      {
        name: "Dr. Simpa Muhammad AbdulAzeez",
        title: "DVM, 8829",
        practice: "VETSENSE Equine Care and Consulting",
      },
      passportNo
    );

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Calculate fingerprint
    const fingerprint = crypto
      .createHash("sha256")
      .update(pdfBuffer)
      .digest("hex");

    // Create a File object for UploadThing
    const pdfFile = new File([pdfBuffer], `${passportNo}.pdf`, {
      type: "application/pdf",
    });

    // Upload to UploadThing
    const uploadResult = await utapi.uploadFiles(pdfFile);

    if (uploadResult.error) {
      throw new Error(`Upload failed: ${uploadResult.error.message}`);
    }

    // Save document record
    const document = await prisma.document.create({
      data: {
        horseId: horse.id,
        type: "PASSPORT",
        passportNo: passportNo,
        fileUrl: uploadResult.data.url, // UploadThing URL
        fingerprint: fingerprint,
        metadata: {
          generated: new Date().toISOString(),
          vetId: session.user.id,
          horseName: horse.name,
          generatedBy: session.user.name,
          uploadthingKey: uploadResult.data.key, // Store for deletion later
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horse.id,
        action: "PASSPORT_GENERATED",
        details: `Generated passport ${passportNo} for ${horse.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      document: document,
      downloadUrl: uploadResult.data.url,
      passportNo: passportNo,
    });
  } catch (error) {
    console.error("Passport generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate passport", details: error.message },
      { status: 500 }
    );
  }
}
