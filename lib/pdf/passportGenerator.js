// lib/pdf/passportGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

/**
 * Generates an equine passport PDF (jsPDF Document instance).
 *
 * - Expects horseData and vetData objects
 * - passportNo is used for identification + verification link
 *
 * Important: If running on the server (Next.js route), ensure `fetch` is available
 * (Node 18+ or polyfilled).
 */
export async function generatePassport(
  horseData = {},
  vetData = {},
  passportNo
) {
  const doc = new jsPDF();
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

  const currentOwner = horseData.owners?.[0]?.owner || null;
  const latestMedical = horseData.medicalRecords?.[0] || null;

  const getVaccine = (query) =>
    horseData.vaccinations?.find((v) =>
      v.vaccineName?.toLowerCase().includes(query.toLowerCase())
    );

  const getVaccineInfo = (vaccineName) => {
    const v = getVaccine(vaccineName);
    if (!v) return { date: "", nextDue: "", batch: "" };
    return {
      date: formatDate(v.dateGiven),
      nextDue: formatDate(v.nextDue),
      batch: v.batchNumber || "",
      vaccineName: v.vaccineName || vaccineName,
    };
  };

  const getAllBatchNumbers = () => {
    const batches = horseData.vaccinations
      ?.filter((v) => v.batchNumber)
      .map((v) => `${v.vaccineName}: ${v.batchNumber}`)
      .join("; ");
    return batches || "";
  };

  // Universal image loader -> returns data URL (works server & browser)
  async function fetchImageAsDataUrl(url) {
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    // Convert to base64
    let base64;
    if (typeof window === "undefined") {
      // Node
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      // Browser
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  }

  // Try to load logo from public folder path (Next.js serves /public at root)
  async function loadLocalLogo() {
    try {
      // Use relative path — works when called from client or server if NEXTAUTH_URL is set correctly
      return await fetchImageAsDataUrl("/vetsense_logo.jpg");
    } catch (err) {
      // fallback try jpeg explicitly
      try {
        return await fetchImageAsDataUrl("/vetsense_logo.png");
      } catch (e) {
        return null;
      }
    }
  }

  // Fetch circular seal - prefer vetData.sealUrl else call internal API
  async function fetchCircularSealUrl() {
    // 1) If vetData has explicit sealUrl, use it
    if (vetData?.sealUrl) return vetData.sealUrl;

    // 2) Else try the internal API (assumes generator runs on server or NEXTAUTH_URL is set)
    try {
      const base = process.env.NEXTAUTH_URL || ""; // ensure it's set in your env for server usage
      const apiUrl = base
        ? `${base}/api/get-seal?type=CIRCULAR`
        : `/api/get-seal?type=CIRCULAR`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("No active circular seal found");
      const data = await res.json();
      return data?.pngUrl || null;
    } catch (err) {
      // last fallback: try vetData.activeSealUrl or null
      return vetData?.activeSealUrl || null;
    }
  }

  // -------------------------
  // COVER PAGE
  // -------------------------
  // logo
  const logoDataUrl = await loadLocalLogo().catch(() => null);
  if (logoDataUrl) {
    // place top center
    const logoWidth = 60;
    const logoHeight = 60;
    doc.addImage(
      logoDataUrl,
      logoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG",
      pageWidth / 2 - logoWidth / 2,
      18,
      logoWidth,
      logoHeight
    );
  }

  doc.setFontSize(28);
  doc.setTextColor(122, 31, 162);
  doc.text("Equine E-Passport", pageWidth / 2, 95, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Passport No.: ${passportNo}`, pageWidth / 2, 108, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Dr. Simpa Muhammad AbdulAzeez (DVM, 8829)", pageWidth / 2, 125, {
    align: "center",
  });
  doc.text("VETSENSE Equine Care and Consulting", pageWidth / 2, 135, {
    align: "center",
  });
  doc.text(
    '"Our passion to care fuels our penchant to serve"',
    pageWidth / 2,
    145,
    {
      align: "center",
    }
  );

  doc.setFontSize(9);
  doc.text(
    "📞 07067677446  ✉ Vetsense.equinecare@gmail.com",
    pageWidth / 2,
    165,
    {
      align: "center",
    }
  );
  doc.text("📍 Kaduna, Nigeria", pageWidth / 2, 173, { align: "center" });

  // WhatsApp QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL("https://wa.me/2347067677446");
    doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 20, 182, 40, 40);
    doc.setFontSize(8);
    doc.text("Chat with us on WhatsApp", pageWidth / 2, 227, {
      align: "center",
    });
  } catch (err) {
    // ignore QR generation errors
  }

  // -------------------------
  // MAIN SECTIONS (ID, OWNER, VET, MEDICAL)
  // -------------------------
  const sections = [
    {
      title: "1. Identification",
      fields: [
        ["Horse Name", horseData.name || ""],
        ["Breed", horseData.breed || ""],
        ["Age", horseData.age ? `${horseData.age} years` : ""],
        ["Sex", horseData.sex || ""],
        ["Color/Markings", horseData.color || ""],
        ["Microchip Number", horseData.microchip || ""],
        ["Date of Birth", horseData.dob ? formatDate(horseData.dob) : ""],
        ["Country of Birth", horseData.countryOfBirth || "Nigeria"],
        ["Sire (Father)", horseData.sire || ""],
        ["Dam (Mother)", horseData.dam || ""],
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
        [
          "Previous Owner",
          horseData.owners?.[1]?.owner?.name || "Original Owner",
        ],
        ["Transfer Date", formatDate(horseData.owners?.[1]?.endDate)],
        ["Emergency Contact", currentOwner?.emergencyName || ""],
        ["Emergency Phone", currentOwner?.emergencyPhone || ""],
        ["Insurance Details", horseData.insurance || ""],
      ],
    },
    {
      title: "3. Veterinary Information",
      fields: [
        ["Primary Vet", vetData.name || "Dr. Simpa Muhammad AbdulAzeez"],
        ["Vet License No.", vetData.title || "8829"],
        [
          "Practice Name",
          vetData.practice || "VETSENSE Equine Care and Consulting",
        ],
        ["Vet Contact", vetData.phone || "07067677446"],
        ["Last Examination Date", formatDate(latestMedical?.recordDate)],
        ["Next Checkup Due", ""],
        ["Blood Type", horseData.bloodType || ""],
        ["Known Allergies", horseData.allergies || ""],
        ["Current Medications", horseData.currentMedications || ""],
        ["Special Medical Notes", latestMedical?.notes || ""],
      ],
    },
    {
      title: "4. Health & Medical History",
      fields: [
        ["General Health Status", horseData.status || ""],
        ["Chronic Conditions", latestMedical?.diagnosis || ""],
        [
          "Past Surgeries",
          horseData.medicalRecords
            ?.filter((r) =>
              (r.treatment || "").toLowerCase().includes("surgery")
            )
            .map((r) => `${formatDate(r.recordDate)}: ${r.treatment}`)
            .join("; ") || "",
        ],
        [
          "Injuries/Accidents",
          horseData.medicalRecords
            ?.filter(
              (r) =>
                (r.diagnosis || "").toLowerCase().includes("injury") ||
                (r.diagnosis || "").toLowerCase().includes("accident")
            )
            .map((r) => `${formatDate(r.recordDate)}: ${r.diagnosis}`)
            .join("; ") || "",
        ],
        ["Behavioral Notes", horseData.behavior || ""],
        ["Dietary Requirements", horseData.dietary || ""],
        ["Exercise Restrictions", horseData.exerciseRestrictions || ""],
        ["Weight", horseData.weight || ""],
        ["Body Condition Score", horseData.bodyConditionScore || ""],
        [
          "Last Deworming Date",
          horseData.lastDeworming ? formatDate(horseData.lastDeworming) : "",
        ],
      ],
    },
  ];

  // Render sections using autoTable on separate pages (start after cover)
  for (const section of sections) {
    doc.addPage();

    // Header
    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text("VETSENSE Equine Care and Consulting", pageWidth / 2, 20, {
      align: "center",
    });

    // Title
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

    // Footer
    const currentPageNum = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Passport No.: ${passportNo}`, 20, pageHeight - 12);
    doc.text(`Page ${currentPageNum}`, pageWidth / 2, pageHeight - 12, {
      align: "center",
    });
  }

  // -------------------------
  // DEDICATED VACCINATION / TREATMENT PAGES (one per client request)
  // Each page will have a seal at bottom-right and a signature area
  // -------------------------
  const circularSealUrl = await fetchCircularSealUrl().catch(() => null);
  const circularSealDataUrl = circularSealUrl
    ? await fetchImageAsDataUrl(circularSealUrl).catch(() => null)
    : null;

  // Helper to render a certificate page
  async function renderCertificatePage({ title, rows, certificateId }) {
    doc.addPage();
    // Header
    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text("VETSENSE Equine Care and Consulting", pageWidth / 2, 20, {
      align: "center",
    });

    // Title
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

    // Signature / stamp area near bottom
    const sigY = pageHeight - 70;
    doc.setFontSize(10);
    doc.text("Signature: ___________________________", 20, sigY);
    doc.text(
      `Vet: ${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (${
        vetData.title || "8829"
      })`,
      20,
      sigY + 10
    );
    doc.text(`Certificate No.: ${certificateId || ""}`, 20, sigY + 20);

    // Add seal bottom-right (professional placement)
    if (circularSealDataUrl) {
      const sealW = 48;
      const sealH = 48;
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

  // AHS
  const ahs = getVaccineInfo("african horse sickness");
  await renderCertificatePage({
    title: "African Horse Sickness Vaccination Certificate",
    rows: [
      ["Vaccination Date", ahs.date || "Date: ________"],
      ["Vaccine Name", ahs.vaccineName || "African Horse Sickness Vaccine"],
      ["Batch Number", ahs.batch || ""],
      ["Valid Until", ahs.nextDue || ""],
      ["Administering Vet", vetData.name || ""],
      ["Certificate Number", ""],
    ],
    certificateId: `${passportNo}-AHS`,
  });

  // Tetanus
  const tet = getVaccineInfo("tetanus");
  await renderCertificatePage({
    title: "Tetanus Vaccination Certificate",
    rows: [
      ["Vaccination Date", tet.date || "Date: ________"],
      ["Vaccine Name", tet.vaccineName || "Tetanus"],
      ["Batch Number", tet.batch || ""],
      ["Next Booster Due", tet.nextDue || ""],
      ["Administering Vet", vetData.name || ""],
      ["Certificate Number", ""],
    ],
    certificateId: `${passportNo}-TET`,
  });

  // Piroplasmosis prophylactic treatment
  // Look up matching medical record if present
  const piroRecord = horseData.medicalRecords?.find(
    (r) =>
      (r.treatment || "").toLowerCase().includes("piro") ||
      (r.treatment || "").toLowerCase().includes("babes") ||
      (r.treatment || "").toLowerCase().includes("theiler")
  );
  await renderCertificatePage({
    title: "Piroplasmosis Prophylactic Treatment",
    rows: [
      [
        "Treatment Date",
        piroRecord ? formatDate(piroRecord.recordDate) : "Date: ________",
      ],
      [
        "Drug Used",
        piroRecord?.drug ||
          piroRecord?.medication ||
          "Imidocarb (or as prescribed)",
      ],
      ["Dosage", piroRecord?.dosage || ""],
      ["Next Treatment Due", ""],
      ["Administering Vet", piroRecord?.vet || vetData.name || ""],
      ["Certificate Number", ""],
    ],
    certificateId: `${passportNo}-PIRO`,
  });

  // Equine Influenza
  const infl = getVaccineInfo("influenza");
  await renderCertificatePage({
    title: "Equine Influenza Vaccination Certificate",
    rows: [
      ["Vaccination Date", infl.date || "Date: ________"],
      ["Vaccine Brand", infl.vaccineName || "Equine Influenza Vaccine"],
      ["Batch Number", infl.batch || ""],
      ["Booster Due", infl.nextDue || ""],
      ["Administering Vet", vetData.name || ""],
      ["Certificate Number", ""],
    ],
    certificateId: `${passportNo}-FLU`,
  });

  // -------------------------
  // NOTES / ATTACHMENTS SUMMARY PAGE (optional)
  // -------------------------
  doc.addPage();
  doc.setFontSize(11);
  doc.setTextColor(122, 31, 162);
  doc.text("VETSENSE Equine Care and Consulting", pageWidth / 2, 20, {
    align: "center",
  });
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("10. Notes & Attachments", 20, 40);

  const notes = [
    [
      "Additional Medical Notes",
      horseData.medicalRecords
        ?.map((r) => `${formatDate(r.recordDate)}: ${r.notes || ""}`)
        .join(" | ") || "",
    ],
    ["Competition Records", horseData.competitionRecords || ""],
    ["Registration Number", horseData.microchip || ""],
    ["Breeding Records", horseData.breedingRecords || ""],
    ["Document Revision Date", formatDate(new Date())],
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

  // -------------------------
  // VALIDATION PAGE
  // -------------------------
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

  // signature line + vet details
  doc.text("Signature: ___________________________", 20, 100);
  doc.text(
    `${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (DVM, ${
      vetData.title || "8829"
    })`,
    20,
    110
  );
  doc.text("VETSENSE Equine Care and Consulting", 20, 120);

  doc.text(`Date: ${formatDate(new Date())}`, 20, 140);
  doc.text("Practice Stamp / Seal:", 20, 160);

  // QR verification code
  try {
    const verifyUrl =
      (process.env.NEXTAUTH_URL || "") + `/verify/passport/${passportNo}`;
    const verifyQR = await QRCode.toDataURL(verifyUrl);
    doc.addImage(verifyQR, "PNG", 20, 180, 40, 40);
    doc.setFontSize(8);
    doc.text("Scan to verify this passport", 20, 225);
  } catch (err) {
    // ignore
  }

  // Add circular seal on validation page (bigger)
  if (circularSealDataUrl) {
    const sW = 68;
    const sH = 68;
    doc.addImage(
      circularSealDataUrl,
      "PNG",
      pageWidth - sW - 20,
      pageHeight - sH - 30,
      sW,
      sH
    );
  }

  // Final: return the jsPDF document instance
  return doc;
}
