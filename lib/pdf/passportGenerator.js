import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const MAX_IMAGE_WIDTH = 800;
const JPEG_QUALITY = 60;

// Cache for loaded images
const imageCache = new Map();

async function tryCompressBuffer(buffer, mimeType) {
  try {
    const sharp = require("sharp");
    const img = sharp(buffer);
    const metadata = await img.metadata();

    const shouldResize = metadata.width && metadata.width > MAX_IMAGE_WIDTH;

    let pipeline = img;
    if (shouldResize) {
      pipeline = pipeline.resize({
        width: MAX_IMAGE_WIDTH,
        withoutEnlargement: true,
      });
    }

    const jpegBuffer = await pipeline
      .jpeg({ quality: JPEG_QUALITY, progressive: true })
      .toBuffer();
    return { buffer: jpegBuffer, mime: "image/jpeg" };
  } catch (err) {
    return { buffer, mime: mimeType };
  }
}

function bufferToDataUrl(buffer, mime) {
  const b64 = buffer.toString("base64");
  return `data:${mime};base64,${b64}`;
}

async function compressAndDataUrlFromBuffer(buffer, originalMime) {
  const { buffer: compressed, mime } = await tryCompressBuffer(
    buffer,
    originalMime
  );
  return bufferToDataUrl(compressed, mime);
}

async function fetchImageAsDataUrl(url, cacheKey = null) {
  if (!url) return null;

  // Check cache first
  if (cacheKey && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/png";
    const dataUrl = await compressAndDataUrlFromBuffer(buffer, contentType);

    // Cache the result
    if (cacheKey) {
      imageCache.set(cacheKey, dataUrl);
    }

    return dataUrl;
  } catch (err) {
    console.error("fetchImageAsDataUrl error:", err.message);
    return null;
  }
}

async function loadLocalImageDataUrl(filePathCandidates = [], cacheKey = null) {
  // Check cache first
  if (cacheKey && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  for (const p of filePathCandidates) {
    try {
      if (fs.existsSync(p)) {
        const buffer = fs.readFileSync(p);
        const ext = path.extname(p).toLowerCase();
        const mime =
          ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
        const dataUrl = await compressAndDataUrlFromBuffer(buffer, mime);

        // Cache the result
        if (cacheKey) {
          imageCache.set(cacheKey, dataUrl);
        }

        return dataUrl;
      }
    } catch (err) {
      console.warn("loadLocalImageDataUrl error:", p, err.message);
    }
  }
  return null;
}

export async function generatePassport(
  horseData = {},
  vetData = {},
  passportNo
) {
  console.log("[PDF Gen] Starting passport generation...");
  const genStart = Date.now();

  // Enable jsPDF compression
  const doc = new jsPDF({
    compress: true,
    putOnlyUsedFonts: true,
    floatPrecision: 2,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // -------------------------
  // Utilities
  // -------------------------
  const formatDate = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return String(date);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} years`;
  };

  const generationDate = new Date();
  const formattedDate = formatDate(generationDate);

  const currentOwner = horseData.owners?.[0]?.owner || {};

  const sortedMedicalRecords = horseData.medicalRecords
    ? [...horseData.medicalRecords].sort(
        (a, b) => new Date(b.recordDate) - new Date(a.recordDate)
      )
    : [];
  const latestMedical = sortedMedicalRecords[0] || null;

  const sortedVaccinations = horseData.vaccinations
    ? [...horseData.vaccinations].sort(
        (a, b) => new Date(b.dateGiven) - new Date(a.dateGiven)
      )
    : [];
  const latestVaccination = sortedVaccinations[0] || null;

  const getVaccine = (searchName) => {
    return horseData.vaccinations?.find((v) => {
      const vaccineName = (v.vaccineName || "").toLowerCase().trim();
      const search = searchName.toLowerCase().trim();

      if (vaccineName === search) return true;
      if (vaccineName.includes(search) || search.includes(vaccineName))
        return true;

      const keywords = search.split(" ");
      const matchedKeywords = keywords.filter(
        (keyword) => vaccineName.includes(keyword) && keyword.length > 3
      );
      return matchedKeywords.length > 0;
    });
  };

  const getVaccineInfo = (vaccineName) => {
    const v = getVaccine(vaccineName);
    if (!v) {
      return {
        date: "",
        nextDue: "",
        batch: "",
        administeredBy: "",
        certificateNo: "",
        vaccineName: vaccineName,
      };
    }

    return {
      date: formatDate(v.dateGiven),
      nextDue: formatDate(v.nextDue),
      batch: v.batchNumber || "",
      vaccineName: v.vaccineName || vaccineName,
      administeredBy: v.administeredBy || "",
      certificateNo: v.certificateNo || "",
    };
  };

  const getPiroplasmosisTreatment = () => {
    const piroRecord = sortedMedicalRecords.find((r) =>
      ((r.diagnosis || "") + "").toLowerCase().includes("piro")
    );
    if (!piroRecord) return null;
    return {
      date: formatDate(piroRecord.recordDate),
      drug: piroRecord.drug || "Not specified",
      dosage: piroRecord.dosage || "Not specified",
      vet: piroRecord.vet || vetData.name || "Not specified",
      diagnosis: piroRecord.diagnosis,
      treatment: piroRecord.treatment,
      notes: piroRecord.notes || "",
    };
  };

  // -------------------------
  // Image loading (with fallbacks for production)
  // -------------------------
  async function loadLocalLogo() {
    // Try multiple paths for production compatibility
    const paths = [
      path.join(process.cwd(), "public", "vetsense_logo.jpg"),
      path.join(process.cwd(), "public", "vetsense_logo.png"),
      "./public/vetsense_logo.jpg",
      "./public/vetsense_logo.png",
    ];
    return await loadLocalImageDataUrl(paths, "logo");
  }

  async function loadSignature() {
    const paths = [
      path.join(process.cwd(), "public", "sign.png"),
      path.join(process.cwd(), "public", "sign.jpg"),
      "./public/sign.png",
      "./public/sign.jpg",
    ];
    return await loadLocalImageDataUrl(paths, "signature");
  }

  async function fetchCircularSealUrl() {
    if (vetData?.sealUrl) return vetData.sealUrl;
    try {
      const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const apiUrl = `${base}/api/seals/active?type=WAX`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("No active seal");
      const data = await res.json();
      return data?.pngUrl || null;
    } catch (err) {
      console.warn("Seal fetch failed:", err.message);
      return vetData?.activeSealUrl || null;
    }
  }

  // -------------------------
  // COVER PAGE
  // -------------------------
  console.log("[PDF Gen] Creating cover page...");
  const logoDataUrl = await loadLocalLogo().catch(() => null);
  if (logoDataUrl) {
    const logoWidth = 40;
    const logoHeight = 40;
    const centerX = pageWidth / 2 - logoWidth / 2;
    const centerY = 18;

    const imgType = logoDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
    doc.addImage(logoDataUrl, imgType, centerX, centerY, logoWidth, logoHeight);

    doc.setDrawColor(122, 31, 162);
    doc.setLineWidth(1);
    doc.circle(pageWidth / 2, centerY + logoHeight / 2, logoWidth / 2 + 2, "S");
  }

  doc.setFontSize(28);
  doc.setTextColor(122, 31, 162);
  doc.text("Vetsense Equine Care E-Passport", pageWidth / 2, 95, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Passport No.: ${passportNo}`, pageWidth / 2, 108, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Dr. ${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (DVM, 8829)`,
    pageWidth / 2,
    125,
    { align: "center" }
  );
  doc.text(
    vetData.practice || "Vetsense Equine Care and Consulting",
    pageWidth / 2,
    135,
    { align: "center" }
  );
  doc.text(
    '"Our passion to care fuels our penchant to serve"',
    pageWidth / 2,
    145,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.text(
    `${vetData.phone || "07067677446"} | ${
      vetData.email || "vetsense.equinecare@gmail.com"
    }`,
    pageWidth / 2,
    165,
    { align: "center" }
  );
  doc.text(vetData.address || "Kaduna, Nigeria", pageWidth / 2, 173, {
    align: "center",
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(
      `https://wa.me/${vetData.phone || "2347067677446"}`,
      { width: 200, margin: 1 }
    );
    doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 20, 182, 40, 40);
    doc.setFontSize(8);
    doc.text("Chat with us on WhatsApp", pageWidth / 2, 227, {
      align: "center",
    });
  } catch (error) {
    console.warn("QR code generation failed:", error.message);
  }

  console.log("[PDF Gen] Cover page complete");

  // -------------------------
  // MAIN SECTIONS
  // -------------------------
  const sections = [
    {
      title: "1. Identification",
      fields: [
        ["Horse Name", horseData.name || ""],
        ["Breed", horseData.breed || ""],
        ["Date of Birth", horseData.dob ? formatDate(horseData.dob) : ""],
        ["Age", calculateAge(horseData.dob)],
        ["Sex", horseData.sex || ""],
        ["Color/Markings", horseData.color || ""],
        ["Microchip Number", horseData.microchip || ""],
        ["Country of Birth", horseData.countryOfBirth || ""],
        ["Sire", horseData.sire || ""],
        ["Dam", horseData.dam || ""],
      ],
    },
    {
      title: "2. Ownership & Contact",
      fields: [
        ["Owner Name", currentOwner?.name || ""],
        ["Contact Phone", currentOwner?.phone || ""],
        ["Email Address", currentOwner?.email || ""],
        ["Physical Address", currentOwner?.address || ""],
        ["Ownership Start Date", formatDate(horseData.owners?.[0]?.startDate)],
        ["Emergency Contact", currentOwner?.name || ""],
        ["Emergency Phone", currentOwner?.phone || ""],
      ],
    },
    {
      title: "3. Veterinary Information",
      fields: [
        [
          "Primary Vet",
          `Dr. ${vetData.name}` || "Dr. Simpa Muhammad AbdulAzeez",
        ],
        ["Vet License No.", "DVM 8829"],
        [
          "Practice Name",
          vetData.practice || "Vetsense Equine Care and Consulting",
        ],
        ["Vet Contact", vetData.phone || "07067677446"],
        [
          "Last Vaccination Date",
          latestVaccination
            ? formatDate(latestVaccination.dateGiven)
            : "Not recorded",
        ],
        [
          "Next Vaccination Due",
          latestVaccination
            ? formatDate(latestVaccination.nextDue)
            : "Not scheduled",
        ],
        ["Blood Type", horseData.bloodType || "Not recorded"],
        ["Known Allergies", horseData.allergies || "None recorded"],
        [
          "Current Medications",
          horseData.currentMedications || "None recorded",
        ],
        [
          "Special Medical Notes",
          latestVaccination?.notes || latestMedical?.notes || "None",
        ],
      ],
    },
    {
      title: "4. Health & Medical History",
      fields: [
        ["General Health Status", horseData.status || ""],
        ["Chronic Conditions", latestMedical?.diagnosis || "None recorded"],
        [
          "Medical History Summary",
          sortedMedicalRecords.length > 0
            ? sortedMedicalRecords
                .slice(0, 5) // Limit to 5 most recent to avoid huge PDFs
                .map((r) => {
                  const parts = [];
                  if (r.recordDate) parts.push(formatDate(r.recordDate));
                  if (r.diagnosis) parts.push(`Diagnosis: ${r.diagnosis}`);
                  if (r.treatment) parts.push(`Treatment: ${r.treatment}`);
                  if (r.drug) parts.push(`Drug: ${r.drug}`);
                  if (r.dosage) parts.push(`Dosage: ${r.dosage}`);
                  return parts.join(" | ");
                })
                .join("\n\n")
            : "No medical history recorded",
        ],
        ["Behavioral Notes", horseData.behavior || "None recorded"],
        ["Dietary Requirements", horseData.dietary || "Standard diet"],
        ["Exercise Restrictions", horseData.exerciseRestrictions || "None"],
        [
          "Weight",
          horseData.weight ? `${horseData.weight} kg` : "Not recorded",
        ],
        [
          "Body Condition Score",
          horseData.bodyConditionScore || "Not assessed",
        ],
        [
          "Last Deworming Date",
          horseData.lastDeworming
            ? formatDate(horseData.lastDeworming)
            : "Not recorded",
        ],
      ],
    },
  ];

  console.log("[PDF Gen] Loading signature...");
  const signatureDataUrl = await loadSignature().catch(() => null);

  console.log("[PDF Gen] Creating main sections...");
  for (const section of sections) {
    doc.addPage();

    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text(
      vetData.practice || "Vetsense Equine Care and Consulting",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, 20, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Field", "Details"]],
      body: section.fields,
      theme: "grid",
      headStyles: {
        fillColor: [122, 31, 162],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      styles: {
        cellPadding: 4,
        fontSize: 9,
        overflow: "linebreak",
        valign: "top",
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { cellWidth: "auto" },
      },
    });

    const currentPageNum = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Passport No.: ${passportNo}`, 20, pageHeight - 12);
    doc.text(`Page ${currentPageNum}`, pageWidth / 2, pageHeight - 12, {
      align: "center",
    });
  }

  // -------------------------
  // CERTIFICATE PAGES
  // -------------------------
  console.log("[PDF Gen] Loading circular seal...");
  const circularSealUrl = await fetchCircularSealUrl().catch(() => null);
  const circularSealDataUrl = circularSealUrl
    ? await fetchImageAsDataUrl(circularSealUrl, "seal").catch(() => null)
    : null;

  async function renderCertificatePage({ title, rows, certificateId }) {
    doc.addPage();

    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text(
      vetData.practice || "Vetsense Equine Care and Consulting",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 20, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Field", "Details"]],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [122, 31, 162],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      styles: {
        cellPadding: 6,
        fontSize: 10,
        overflow: "linebreak",
        valign: "top",
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: "bold" },
        1: { cellWidth: "auto" },
      },
    });

    const sigY = pageHeight - 70;
    doc.setFontSize(10);

    if (signatureDataUrl) {
      const sigWidth = 80;
      const sigHeight = 30;
      const sigType = signatureDataUrl.startsWith("data:image/jpeg")
        ? "JPEG"
        : "PNG";
      doc.addImage(signatureDataUrl, sigType, 20, sigY, sigWidth, sigHeight);
      doc.text("Signature", 20 + sigWidth / 2, sigY + sigHeight + 5, {
        align: "center",
      });
    } else {
      doc.text("Signature: ___________________________", 20, sigY);
    }

    doc.text(
      `Vet: Dr. ${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (${
        vetData.titles || "DVM 8829"
      })`,
      20,
      sigY + (signatureDataUrl ? 40 : 10)
    );
    doc.text(
      `Certificate No.: ${certificateId || ""}`,
      20,
      sigY + (signatureDataUrl ? 50 : 20)
    );
    doc.text(`Date: ${formattedDate}`, 20, sigY + (signatureDataUrl ? 60 : 30));

    if (circularSealDataUrl) {
      const sealW = 48,
        sealH = 48;
      doc.addImage(
        circularSealDataUrl,
        "PNG",
        pageWidth - sealW - 20,
        pageHeight - sealH - 30,
        sealW,
        sealH
      );
    }
  }

  console.log("[PDF Gen] Creating vaccine certificates...");
  const vaccines = [
    { name: "African Horse Sickness", code: "AHS" },
    { name: "Tetanus", code: "TET" },
    { name: "Equine Influenza", code: "FLU" },
  ];

  for (const vac of vaccines) {
    const info = getVaccineInfo(vac.name);

    await renderCertificatePage({
      title: `${vac.name} Vaccination Certificate`,
      rows: [
        ["Vaccination Date", info.date || "Not yet administered"],
        ["Vaccine Name", info.vaccineName],
        ["Batch Number", info.batch || "Not recorded"],
        ["Next Due Date", info.nextDue || "Not scheduled"],
        [
          "Administering Vet",
          info.administeredBy ||
            vetData.name ||
            "Dr. Simpa Muhammad AbdulAzeez",
        ],
        [
          "Certificate Number",
          info.certificateNo || `${passportNo}-${vac.code}`,
        ],
      ],
      certificateId: info.certificateNo || `${passportNo}-${vac.code}`,
    });
  }

  const piroTreatment = getPiroplasmosisTreatment();
  if (piroTreatment) {
    await renderCertificatePage({
      title: "Piroplasmosis Prophylactic Treatment Certificate",
      rows: [
        ["Treatment Date", piroTreatment.date],
        ["Diagnosis", piroTreatment.diagnosis],
        ["Drug/Medication", piroTreatment.drug],
        ["Dosage", piroTreatment.dosage],
        ["Treatment Protocol", piroTreatment.treatment],
        ["Administering Vet", piroTreatment.vet],
        ["Additional Notes", piroTreatment.notes || "None"],
        ["Certificate Number", `${passportNo}-PIRO`],
      ],
      certificateId: `${passportNo}-PIRO`,
    });
  }

  // -------------------------
  // NOTES & VALIDATION PAGES (shortened for performance)
  // -------------------------
  doc.addPage();
  doc.setFontSize(11);
  doc.setTextColor(122, 31, 162);
  doc.text(
    vetData.practice || "Vetsense Equine Care and Consulting",
    pageWidth / 2,
    20,
    { align: "center" }
  );
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("10. Notes & Attachments", 20, 40);

  const notes = [
    [
      "Additional Medical Notes",
      sortedMedicalRecords
        .slice(0, 3)
        .map((r) => `${formatDate(r.recordDate)}: ${r.notes || "No notes"}`)
        .join(" | ") || "No medical notes recorded",
    ],
    ["Registration Number", horseData.microchip || "Not registered"],
    ["Insurance Information", horseData.insurance || "Not insured"],
    ["Document Revision Date", formattedDate],
  ];

  autoTable(doc, {
    startY: 55,
    head: [["Field", "Details"]],
    body: notes,
    theme: "grid",
    headStyles: {
      fillColor: [122, 31, 162],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: "bold",
    },
    styles: { cellPadding: 5, fontSize: 10, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      1: { cellWidth: "auto" },
    },
  });

  // VALIDATION PAGE
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(122, 31, 162);
  doc.text("Veterinary Validation", 20, 40);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "This document certifies the information contained herein is accurate",
    20,
    60
  );
  doc.text("and has been verified by the undersigned veterinarian.", 20, 70);

  const valSigY = 100;
  if (signatureDataUrl) {
    const sigWidth = 100;
    const sigHeight = 40;
    const sigType = signatureDataUrl.startsWith("data:image/jpeg")
      ? "JPEG"
      : "PNG";
    doc.addImage(signatureDataUrl, sigType, 20, valSigY, sigWidth, sigHeight);
    doc.text("Signature", 20 + sigWidth / 2, valSigY + sigHeight + 5, {
      align: "center",
    });
  } else {
    doc.text("Signature: ___________________________", 20, valSigY);
  }

  doc.text(
    `Dr. ${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (${
      vetData.titles || "DVM 8829"
    })`,
    20,
    valSigY + (signatureDataUrl ? 50 : 10)
  );
  doc.text(
    vetData.practice || "Vetsense Equine Care and Consulting",
    20,
    valSigY + (signatureDataUrl ? 60 : 20)
  );
  doc.text(
    `Date: ${formattedDate}`,
    20,
    valSigY + (signatureDataUrl ? 70 : 30)
  );
  doc.text(
    "Practice Stamp / Seal:",
    20,
    valSigY + (signatureDataUrl ? 90 : 50)
  );

  try {
    const verifyUrl =
      (process.env.NEXTAUTH_URL || "http://localhost:3000") +
      `/verify/passport/${passportNo}`;
    const verifyQR = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
    });
    doc.addImage(
      verifyQR,
      "PNG",
      20,
      valSigY + (signatureDataUrl ? 110 : 70),
      40,
      40
    );
    doc.setFontSize(8);
    doc.text(
      "Scan to verify this passport",
      20,
      valSigY + (signatureDataUrl ? 155 : 115)
    );
  } catch (error) {
    console.warn("Verification QR code failed:", error.message);
  }

  if (circularSealDataUrl) {
    const sW = 68,
      sH = 68;
    doc.addImage(
      circularSealDataUrl,
      "PNG",
      pageWidth - sW - 20,
      pageHeight - sH - 30,
      sW,
      sH
    );
  }
  return doc;
}
