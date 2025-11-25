// lib/pdf/passportGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

export async function generatePassport(horseData, vetData, passportNo) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to get current owner
  const currentOwner = horseData.owners?.[0]?.owner;

  // Helper to get latest medical record
  const latestMedical = horseData.medicalRecords?.[0];

  // Helper to compile vaccination info
  const getVaccineInfo = (vaccineName) => {
    const vaccine = horseData.vaccinations?.find((v) =>
      v.vaccineName.toLowerCase().includes(vaccineName.toLowerCase())
    );
    if (!vaccine) return "Date: ________  Due: ________";
    return `Date: ${formatDate(vaccine.dateGiven)}  Due: ${formatDate(
      vaccine.nextDue
    )}`;
  };

  // Helper to get all vaccine batch numbers
  const getAllBatchNumbers = () => {
    const batches = horseData.vaccinations
      ?.filter((v) => v.batchNumber)
      .map((v) => `${v.vaccineName}: ${v.batchNumber}`)
      .join("; ");
    return batches || "";
  };

  // === COVER PAGE ===
  doc.setFontSize(28);
  doc.setTextColor(122, 31, 162); // Purple
  doc.text("Equine E-Passport", pageWidth / 2, 80, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Passport No.: ${passportNo}`, pageWidth / 2, 100, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Dr. Simpa Muhammad AbdulAzeez (DVM, 8829)", pageWidth / 2, 120, {
    align: "center",
  });
  doc.text("VETSENSE Equine Care and Consulting", pageWidth / 2, 130, {
    align: "center",
  });
  doc.text(
    '"Our passion to care fuels our penchant to serve"',
    pageWidth / 2,
    140,
    { align: "center" }
  );

  // Contact info
  doc.setFontSize(9);
  doc.text(
    "📞 07067677446 ✉ Vetsense.equinecare@gmail.com",
    pageWidth / 2,
    170,
    { align: "center" }
  );
  doc.text("📍 Kaduna, Nigeria", pageWidth / 2, 180, { align: "center" });

  // WhatsApp QR Code
  const qrDataUrl = await QRCode.toDataURL("https://wa.me/2347067677446");
  doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 20, 200, 40, 40);
  doc.setFontSize(8);
  doc.text("Chat with us on WhatsApp", pageWidth / 2, 245, { align: "center" });

  // === SECTION PAGES ===
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
        ["Date of Birth", ""], // Not in current schema - can be added
        ["Country of Birth", "Nigeria"], // Default
        ["Sire (Father)", ""], // Not in current schema - can be added
        ["Dam (Mother)", ""], // Not in current schema - can be added
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
        ["Emergency Contact", ""], // Can be added to User model
        ["Emergency Phone", ""], // Can be added to User model
        ["Insurance Details", ""], // Can be added as separate model/field
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
        ["Vet Contact", "07067677446"],
        ["Last Examination Date", formatDate(latestMedical?.recordDate)],
        ["Next Checkup Due", ""], // Can calculate based on last exam
        ["Blood Type", ""], // Not in current schema
        ["Known Allergies", ""], // Not in current schema - could add to Horse
        ["Current Medications", ""], // Could extract from recent medical records
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
            ?.filter((r) => r.treatment.toLowerCase().includes("surgery"))
            .map((r) => `${formatDate(r.recordDate)}: ${r.treatment}`)
            .join("; ") || "",
        ],
        [
          "Injuries/Accidents",
          horseData.medicalRecords
            ?.filter(
              (r) =>
                r.diagnosis.toLowerCase().includes("injury") ||
                r.diagnosis.toLowerCase().includes("accident")
            )
            .map((r) => `${formatDate(r.recordDate)}: ${r.diagnosis}`)
            .join("; ") || "",
        ],
        ["Behavioral Notes", ""], // Not in current schema
        ["Dietary Requirements", ""], // Not in current schema
        ["Exercise Restrictions", ""], // Not in current schema
        ["Weight", ""], // Not in current schema
        ["Body Condition Score", ""], // Not in current schema
        ["Last Deworming Date", ""], // Not in current schema - could add to Vaccination
      ],
    },
    {
      title: "5. Vaccination Record",
      fields: [
        ["Tetanus", getVaccineInfo("tetanus")],
        ["Influenza", getVaccineInfo("influenza")],
        ["Rhinopneumonitis", getVaccineInfo("rhino")],
        ["West Nile Virus", getVaccineInfo("west nile")],
        ["Rabies", getVaccineInfo("rabies")],
        ["Strangles", getVaccineInfo("strangles")],
        [
          "Other Vaccines",
          horseData.vaccinations
            ?.filter(
              (v) =>
                ![
                  "tetanus",
                  "influenza",
                  "rhino",
                  "west nile",
                  "rabies",
                  "strangles",
                ].some((name) => v.vaccineName.toLowerCase().includes(name))
            )
            .map((v) => `${v.vaccineName}: ${formatDate(v.dateGiven)}`)
            .join("; ") || "",
        ],
        ["Batch Numbers", getAllBatchNumbers()],
        ["Administering Vet", vetData.name || "Dr. Simpa Muhammad AbdulAzeez"],
        ["Vaccination Certificate No.", ""], // Could add to Vaccination model
      ],
    },
    {
      title: "6. Laboratory Tests",
      fields: [
        ["Last Blood Test Date", ""], // Not tracked separately - could add
        ["Blood Test Results", ""], // Not tracked separately
        ["Fecal Analysis Date", ""], // Not tracked separately
        ["Fecal Analysis Results", ""], // Not tracked separately
        ["Coggins Test Date", ""], // Not tracked separately
        ["Coggins Test Result", ""], // Not tracked separately
        ["Urine Analysis", ""], // Not tracked separately
        ["Other Lab Tests", ""], // Not tracked separately
        ["Lab Reference Numbers", ""], // Could add to MedicalRecord
        ["Testing Facility", "VETSENSE Laboratory Services"], // Default
      ],
    },
    {
      title: "7. Coggins / EIA Certificate",
      fields: [
        ["Test Date", ""], // Need separate model or field
        ["Test Result", "Negative / Positive"], // Need separate model
        ["Laboratory Name", ""], // Need separate model
        ["Lab Accreditation No.", ""], // Need separate model
        ["Certificate Number", ""], // Need separate model
        ["Expiration Date", ""], // Need separate model
        ["Testing Veterinarian", vetData.name || ""],
        ["License Number", vetData.title || "8829"],
        ["Digital Certificate Link", ""], // Could link to Document
        ["QR Verification Code", ""], // Could generate
      ],
    },
    {
      title: "8. Farrier / Dentistry / Physiotherapy",
      fields: [
        ["Last Farrier Visit", ""], // Not in schema - could add Service model
        ["Shoeing Type", ""], // Not in schema
        ["Hoof Condition", ""], // Not in schema
        ["Next Farrier Due", ""], // Not in schema
        ["Last Dental Exam", ""], // Not in schema
        ["Dental Treatments", ""], // Not in schema
        ["Next Dental Due", ""], // Not in schema
        ["Physiotherapy Sessions", ""], // Not in schema
        ["Therapist Name", ""], // Not in schema
        ["Treatment Notes", ""], // Not in schema
      ],
    },
    {
      title: "9. Movement & Transport History",
      fields: [
        ["Current Location", currentOwner?.address || ""], // Using owner address
        ["Previous Locations", currentOwner?.state || ""], // Limited info
        ["International Travel", ""], // Not tracked
        ["Quarantine Records", ""], // Not tracked
        ["Export/Import Permits", ""], // Not tracked
        ["Transport Company", ""], // Not tracked
        ["Travel Dates", ""], // Not tracked
        ["Health Certificates", ""], // Could link to Documents
        ["Border Crossing Records", ""], // Not tracked
        ["Customs Documents", ""], // Not tracked
      ],
    },
    {
      title: "10. Notes & Attachments",
      fields: [
        [
          "Additional Medical Notes",
          horseData.medicalRecords
            ?.map((r) => `${formatDate(r.recordDate)}: ${r.notes || ""}`)
            .filter((n) => n.includes(":") && n.split(":")[1].trim())
            .join(" | ") || "",
        ],
        ["Competition Records", ""], // Not in schema
        ["Registration Numbers", horseData.microchip || ""], // Using microchip
        ["Breeding Records", ""], // Not in schema
        ["Performance History", ""], // Not in schema
        ["Training Notes", ""], // Not in schema
        ["Special Instructions", ""], // Not in schema
        ["Insurance Policy No.", ""], // Not in schema
        [
          "Microchip Scanner Info",
          horseData.microchip ? "ISO 11784/11785 Compatible" : "",
        ],
        ["Document Revision Date", formatDate(new Date())],
      ],
    },
  ];

  sections.forEach((section, index) => {
    doc.addPage();

    // Header
    doc.setFontSize(11);
    doc.setTextColor(122, 31, 162);
    doc.text("VETSENSE Equine Care and Consulting", pageWidth / 2, 20, {
      align: "center",
    });

    // Section title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, 20, 40);

    // Table with fields using autoTable
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
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Passport No.: ${passportNo}`, 20, pageHeight - 15);
    doc.text(`Page ${index + 2} of 11`, pageWidth / 2, pageHeight - 15, {
      align: "center",
    });
  });

  // === VALIDATION PAGE ===
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

  doc.text("Signature: ___________________________", 20, 100);
  doc.text("Dr. Simpa Muhammad AbdulAzeez (DVM, 8829)", 20, 110);
  doc.text("VETSENSE Equine Care and Consulting", 20, 120);

  doc.text(`Date: ${formatDate(new Date())}`, 20, 140);

  doc.text("Practice Stamp / Seal:", 20, 160);

  // QR code for verification
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify/passport/${passportNo}`;
  const verifyQR = await QRCode.toDataURL(verifyUrl);
  doc.addImage(verifyQR, "PNG", 20, 180, 40, 40);
  doc.setFontSize(8);
  doc.text("Scan to verify this passport", 20, 225);

  return doc;
}
