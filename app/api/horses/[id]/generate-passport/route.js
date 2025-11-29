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
    // FIXED: Get horse data with ALL necessary relations
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      include: {
        owners: {
          include: { owner: true },
        },
        // ✅ ADD THESE TWO INCLUDES
        vaccinations: {
          orderBy: { dateGiven: "desc" },
        },
        medicalRecords: {
          orderBy: { recordDate: "desc" },
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

    // Get vet data (either from session or default)
    const vetData = {
      name: session.user.name || "Dr. Simpa Muhammad AbdulAzeez",
      title: session.user.title || "DVM, 8829",
      practice: "Vetsense Equine Care and Consulting",
      phone: session.user.phone || "07067677446",
      email: session.user.email || "Vetsense.equinecare@gmail.com",
      address: session.user.address || "Kaduna, Nigeria",
    };

    // Generate PDF with complete data
    const pdf = await generatePassport(horse, vetData, passportNo);

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
        fileUrl: uploadResult.data.url, // FIXED: Changed from ufsUrl to url
        fingerprint: fingerprint,
        metadata: {
          generated: new Date().toISOString(),
          vetId: session.user.id,
          horseName: horse.name,
          generatedBy: session.user.name,
          uploadthingKey: uploadResult.data.key,
          vaccinationCount: horse.vaccinations?.length || 0,
          medicalRecordCount: horse.medicalRecords?.length || 0,
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        horseId: horse.id,
        action: "PASSPORT_GENERATED",
        details: `Generated passport ${passportNo} for ${horse.name} (${
          horse.vaccinations?.length || 0
        } vaccinations, ${horse.medicalRecords?.length || 0} medical records)`,
      },
    });

    return NextResponse.json({
      success: true,
      document: document,
      downloadUrl: uploadResult.data.url,
      passportNo: passportNo,
      stats: {
        vaccinations: horse.vaccinations?.length || 0,
        medicalRecords: horse.medicalRecords?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Passport generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate passport", details: error.message },
      { status: 500 }
    );
  }
}
