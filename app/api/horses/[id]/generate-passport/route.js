// // app/api/horses/[id]/generate-passport/route.js
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { PrismaClient } from "@prisma/client";
// import { NextResponse } from "next/server";
// import { generatePassport } from "@/lib/pdf/passportGenerator";
// import { UTApi } from "uploadthing/server";
// import crypto from "crypto";

// const prisma = new PrismaClient();
// const utapi = new UTApi();

// export async function POST(req, context) {
//   const params = await context.params;
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "VET") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     // FIXED: Get horse data with ALL necessary relations
//     const horse = await prisma.horse.findUnique({
//       where: { id: params.id },
//       include: {
//         owners: {
//           include: { owner: true },
//         },
//         // ✅ ADD THESE TWO INCLUDES
//         vaccinations: {
//           orderBy: { dateGiven: "desc" },
//         },
//         medicalRecords: {
//           orderBy: { recordDate: "desc" },
//         },
//       },
//     });

//     if (!horse) {
//       return NextResponse.json({ error: "Horse not found" }, { status: 404 });
//     }

//     // Get next passport number
//     const year = new Date().getFullYear();
//     const lastPassport = await prisma.document.findFirst({
//       where: {
//         type: "PASSPORT",
//         passportNo: {
//           startsWith: `VETSENSE-E-${year}-`,
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     let seq = 1;
//     if (lastPassport && lastPassport.passportNo) {
//       const parts = lastPassport.passportNo.split("-");
//       seq = parseInt(parts[3]) + 1;
//     }

//     const passportNo = `VETSENSE-E-${year}-${seq.toString().padStart(3, "0")}`;

//     // Get vet data (either from session or default)
//     const vetData = {
//       name: session.user.name || "Dr. Simpa Muhammad AbdulAzeez",
//       title: session.user.title || "DVM, 8829",
//       practice: "Vetsense Equine Care and Consulting",
//       phone: session.user.phone || "07067677446",
//       email: session.user.email || "Vetsense.equinecare@gmail.com",
//       address: session.user.address || "Kaduna, Nigeria",
//     };

//     // Generate PDF with complete data
//     const pdf = await generatePassport(horse, vetData, passportNo);

//     // Convert PDF to buffer
//     const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

//     // Calculate fingerprint
//     const fingerprint = crypto
//       .createHash("sha256")
//       .update(pdfBuffer)
//       .digest("hex");

//     // Create a File object for UploadThing
//     const pdfFile = new File([pdfBuffer], `${passportNo}.pdf`, {
//       type: "application/pdf",
//     });

//     // Upload to UploadThing
//     const uploadResult = await utapi.uploadFiles(pdfFile);

//     if (uploadResult.error) {
//       throw new Error(`Upload failed: ${uploadResult.error.message}`);
//     }

//     // Save document record
//     const document = await prisma.document.create({
//       data: {
//         horseId: horse.id,
//         type: "PASSPORT",
//         passportNo: passportNo,
//         fileUrl: uploadResult.data.url, // FIXED: Changed from ufsUrl to url
//         fingerprint: fingerprint,
//         metadata: {
//           generated: new Date().toISOString(),
//           vetId: session.user.id,
//           horseName: horse.name,
//           generatedBy: session.user.name,
//           uploadthingKey: uploadResult.data.key,
//           vaccinationCount: horse.vaccinations?.length || 0,
//           medicalRecordCount: horse.medicalRecords?.length || 0,
//         },
//       },
//     });

//     // Log activity
//     await prisma.activityLog.create({
//       data: {
//         userId: session.user.id,
//         horseId: horse.id,
//         action: "PASSPORT_GENERATED",
//         details: `Generated passport ${passportNo} for ${horse.name} (${
//           horse.vaccinations?.length || 0
//         } vaccinations, ${horse.medicalRecords?.length || 0} medical records)`,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       document: document,
//       downloadUrl: uploadResult.data.url,
//       passportNo: passportNo,
//       stats: {
//         vaccinations: horse.vaccinations?.length || 0,
//         medicalRecords: horse.medicalRecords?.length || 0,
//       },
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to generate passport", details: error.message },
//       { status: 500 }
//     );
//   }
// }

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

// Add timeout configuration
export const maxDuration = 60; // Maximum execution time in seconds
export const dynamic = "force-dynamic"; // Ensure dynamic rendering

export async function POST(req, context) {
  const startTime = Date.now();

  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "VET") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Passport Gen] Starting for horse: ${params.id}`);

    // Fetch horse data with relations
    const horse = await prisma.horse.findUnique({
      where: { id: params.id },
      include: {
        owners: {
          include: { owner: true },
        },
        vaccinations: {
          orderBy: { dateGiven: "desc" },
        },
        medicalRecords: {
          orderBy: { recordDate: "desc" },
        },
      },
    });

    if (!horse) {
      console.error(`[Passport Gen] Horse not found: ${params.id}`);
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    console.log(
      `[Passport Gen] Horse found: ${horse.name}, Vaccinations: ${
        horse.vaccinations?.length || 0
      }, Medical Records: ${horse.medicalRecords?.length || 0}`
    );

    // Get next passport number with retry logic
    const year = new Date().getFullYear();
    let passportNo;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
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

        passportNo = `VETSENSE-E-${year}-${seq.toString().padStart(3, "0")}`;
        break;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error("Failed to generate passport number");
        }
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
      }
    }

    console.log(`[Passport Gen] Generated passport number: ${passportNo}`);

    // Get vet data
    const vetData = {
      name: session.user.name || "Dr. Simpa Muhammad AbdulAzeez",
      title: session.user.title || "DVM, 8829",
      titles: session.user.titles || "DVM, 8829",
      practice: "Vetsense Equine Care and Consulting",
      phone: session.user.phone || "07067677446",
      email: session.user.email || "Vetsense.equinecare@gmail.com",
      address: session.user.address || "Kaduna, Nigeria",
    };

    // Generate PDF with timeout protection
    console.log(`[Passport Gen] Starting PDF generation...`);
    const pdfGenStart = Date.now();

    let pdf;
    try {
      pdf = await Promise.race([
        generatePassport(horse, vetData, passportNo),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("PDF generation timeout")), 45000)
        ),
      ]);
    } catch (pdfError) {
      console.error("[Passport Gen] PDF generation failed:", pdfError);
      throw new Error(`PDF generation failed: ${pdfError.message}`);
    }

    console.log(
      `[Passport Gen] PDF generated in ${Date.now() - pdfGenStart}ms`
    );

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
    console.log(
      `[Passport Gen] PDF buffer size: ${(
        pdfBuffer.length /
        1024 /
        1024
      ).toFixed(2)}MB`
    );

    // Calculate fingerprint
    const fingerprint = crypto
      .createHash("sha256")
      .update(pdfBuffer)
      .digest("hex");

    // Create a File object for UploadThing
    const pdfFile = new File([pdfBuffer], `${passportNo}.pdf`, {
      type: "application/pdf",
    });

    // Upload to UploadThing with retry
    console.log(`[Passport Gen] Uploading to UploadThing...`);
    let uploadResult;
    let uploadAttempts = 0;
    const maxUploadAttempts = 3;

    while (uploadAttempts < maxUploadAttempts) {
      try {
        uploadResult = await utapi.uploadFiles(pdfFile);
        if (!uploadResult.error) break;
        throw new Error(uploadResult.error.message);
      } catch (uploadErr) {
        uploadAttempts++;
        console.error(
          `[Passport Gen] Upload attempt ${uploadAttempts} failed:`,
          uploadErr
        );

        if (uploadAttempts >= maxUploadAttempts) {
          throw new Error(
            `Upload failed after ${maxUploadAttempts} attempts: ${uploadErr.message}`
          );
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, uploadAttempts))
        );
      }
    }

    if (uploadResult.error) {
      throw new Error(`Upload failed: ${uploadResult.error.message}`);
    }

    console.log(`[Passport Gen] Upload successful: ${uploadResult.data.url}`);

    // Save document record
    const document = await prisma.document.create({
      data: {
        horseId: horse.id,
        type: "PASSPORT",
        passportNo: passportNo,
        fileUrl: uploadResult.data.url,
        fingerprint: fingerprint,
        metadata: {
          generated: new Date().toISOString(),
          vetId: session.user.id,
          horseName: horse.name,
          generatedBy: session.user.name,
          uploadthingKey: uploadResult.data.key,
          vaccinationCount: horse.vaccinations?.length || 0,
          medicalRecordCount: horse.medicalRecords?.length || 0,
          generationTimeMs: Date.now() - startTime,
          pdfSizeMB: (pdfBuffer.length / 1024 / 1024).toFixed(2),
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
        } vaccinations, ${
          horse.medicalRecords?.length || 0
        } medical records) in ${Date.now() - startTime}ms`,
      },
    });

    console.log(`[Passport Gen] Complete in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      document: document,
      downloadUrl: uploadResult.data.url,
      passportNo: passportNo,
      stats: {
        vaccinations: horse.vaccinations?.length || 0,
        medicalRecords: horse.medicalRecords?.length || 0,
        generationTimeMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("[Passport Gen] Error:", error);
    console.error("[Passport Gen] Stack:", error.stack);

    return NextResponse.json(
      {
        error: "Failed to generate passport",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
