// lib/pdf/passportGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

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
    const found = horseData.vaccinations?.find((v) => {
      const vaccineName = (v.vaccineName || "").toLowerCase().trim();
      const search = searchName.toLowerCase().trim();

      if (vaccineName === search) {
        return true;
      }

      if (vaccineName.includes(search) || search.includes(vaccineName)) {
        return true;
      }

      const keywords = search.split(" ");
      const matchedKeywords = keywords.filter(
        (keyword) => vaccineName.includes(keyword) && keyword.length > 3
      );

      if (matchedKeywords.length > 0) {
        return true;
      }

      return false;
    });

    return found;
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
    const piroRecord = sortedMedicalRecords.find(
      (r) =>
        (r.diagnosis || "").toLowerCase().includes("piroplasmosis") ||
        (r.diagnosis || "").toLowerCase().includes("babesiosis") ||
        (r.diagnosis || "").toLowerCase().includes("piro")
    );

    if (!piroRecord) {
      return null;
    }

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

  async function fetchImageAsDataUrl(url) {
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    let base64;
    if (typeof window === "undefined") {
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
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

  async function loadLocalLogo() {
    const publicDir = path.join(process.cwd(), "public");
    const jpgPath = path.join(publicDir, "vetsense_logo.jpg");
    const pngPath = path.join(publicDir, "vetsense_logo.png");

    try {
      if (fs.existsSync(jpgPath)) {
        const buffer = fs.readFileSync(jpgPath);
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      } else if (fs.existsSync(pngPath)) {
        const buffer = fs.readFileSync(pngPath);
        return `data:image/png;base64,${buffer.toString("base64")}`;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }

  async function loadSignature() {
    const publicDir = path.join(process.cwd(), "public");
    const pngPath = path.join(publicDir, "sign.png");
    const jpgPath = path.join(publicDir, "sign.jpg");

    try {
      if (fs.existsSync(pngPath)) {
        const buffer = fs.readFileSync(pngPath);
        return `data:image/png;base64,${buffer.toString("base64")}`;
      } else if (fs.existsSync(jpgPath)) {
        const buffer = fs.readFileSync(jpgPath);
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }

  async function fetchCircularSealUrl() {
    if (vetData?.sealUrl) return vetData.sealUrl;
    try {
      const base = process.env.NEXTAUTH_URL || "";
      const apiUrl = base
        ? `${base}/api/seals/active?type=WAX`
        : `/api/seals/active?type=WAX`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("No active circular seal found");
      const data = await res.json();
      return data?.pngUrl || null;
    } catch {
      return vetData?.activeSealUrl || null;
    }
  }

  // -------------------------
  // COVER PAGE
  // -------------------------
  const logoDataUrl = await loadLocalLogo().catch(() => null);
  if (logoDataUrl) {
    const logoWidth = 40;
    const logoHeight = 40;
    const centerX = pageWidth / 2 - logoWidth / 2;
    const centerY = 18;

    doc.addImage(
      logoDataUrl,
      logoDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG",
      centerX,
      centerY,
      logoWidth,
      logoHeight
    );

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
    `${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (${
      vetData.title || "8829"
    })`,
    pageWidth / 2,
    125,
    {
      align: "center",
    }
  );
  doc.text(
    vetData.practice || "VETSENSE Equine Care and Consulting",
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
      vetData.email || "Vetsense.equinecare@gmail.com"
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
      `https://wa.me/${vetData.phone || "2347067677446"}`
    );
    doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 20, 182, 40, 40);
    doc.setFontSize(8);
    doc.text("Chat with us on WhatsApp", pageWidth / 2, 227, {
      align: "center",
    });
  } catch (error) {}

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
        ["Primary Vet", vetData.name || "Dr. Simpa Muhammad AbdulAzeez"],
        ["Vet License No.", vetData.title || "8829"],
        [
          "Practice Name",
          vetData.practice || "VETSENSE Equine Care and Consulting",
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

  const signatureDataUrl = await loadSignature().catch(() => null);

  for (const section of sections) {
    doc.addPage();

    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text(
      vetData.practice || "VETSENSE Equine Care and Consulting",
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
  // Certificate Pages
  // -------------------------
  const circularSealUrl = await fetchCircularSealUrl().catch(() => null);
  const circularSealDataUrl = circularSealUrl
    ? await fetchImageAsDataUrl(circularSealUrl).catch(() => null)
    : null;

  async function renderCertificatePage({ title, rows, certificateId }) {
    doc.addPage();

    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text(
      vetData.practice || "VETSENSE Equine Care and Consulting",
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
      doc.addImage(
        signatureDataUrl,
        signatureDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG",
        20,
        sigY,
        sigWidth,
        sigHeight
      );
      doc.text("Signature", 20 + sigWidth / 2, sigY + sigHeight + 5, {
        align: "center",
      });
    } else {
      doc.text("Signature: ___________________________", 20, sigY);
    }

    doc.text(
      `Vet: ${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (${
        vetData.title || "8829"
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
  // NOTES & ATTACHMENTS SUMMARY
  // -------------------------
  doc.addPage();
  doc.setFontSize(11);
  doc.setTextColor(122, 31, 162);
  doc.text(
    vetData.practice || "VETSENSE Equine Care and Consulting",
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

  const valSigY = 100;
  if (signatureDataUrl) {
    const sigWidth = 100;
    const sigHeight = 40;
    doc.addImage(
      signatureDataUrl,
      signatureDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG",
      20,
      valSigY,
      sigWidth,
      sigHeight
    );
    doc.text("Signature", 20 + sigWidth / 2, valSigY + sigHeight + 5, {
      align: "center",
    });
  } else {
    doc.text("Signature: ___________________________", 20, valSigY);
  }

  doc.text(
    `${vetData.name || "Dr. Simpa Muhammad AbdulAzeez"} (DVM, ${
      vetData.title || "8829"
    })`,
    20,
    valSigY + (signatureDataUrl ? 50 : 10)
  );
  doc.text(
    vetData.practice || "VETSENSE Equine Care and Consulting",
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
    const verifyQR = await QRCode.toDataURL(verifyUrl);
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
  } catch (error) {}

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
