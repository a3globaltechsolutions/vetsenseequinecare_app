// lib/pdf/passportGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

export async function generatePassport(horseData, vetData, passportNo) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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
        ["Date of Birth", ""],
        ["Country of Birth", ""],
        ["Sire (Father)", ""],
        ["Dam (Mother)", ""],
      ],
    },
    {
      title: "2. Ownership & Contact",
      fields: [
        ["Owner Name", horseData.owners?.[0]?.owner?.name || ""],
        ["Contact Phone", horseData.owners?.[0]?.owner?.phone || ""],
        ["Email Address", horseData.owners?.[0]?.owner?.email || ""],
        ["Physical Address", ""],
        [
          "Ownership Start Date",
          horseData.owners?.[0]?.startDate
            ? new Date(horseData.owners[0].startDate).toLocaleDateString()
            : "",
        ],
        ["Previous Owner", ""],
        ["Transfer Date", ""],
        ["Emergency Contact", ""],
        ["Emergency Phone", ""],
        ["Insurance Details", ""],
      ],
    },
    {
      title: "3. Veterinary Information",
      fields: [
        ["Primary Vet", "Dr. Simpa Muhammad AbdulAzeez"],
        ["Vet License No.", "8829"],
        ["Practice Name", "VETSENSE Equine Care and Consulting"],
        ["Vet Contact", "07067677446"],
        ["Last Examination Date", ""],
        ["Next Checkup Due", ""],
        ["Blood Type", ""],
        ["Known Allergies", ""],
        ["Current Medications", ""],
        ["Special Medical Notes", ""],
      ],
    },
    {
      title: "4. Health & Medical History",
      fields: [
        ["General Health Status", ""],
        ["Chronic Conditions", ""],
        ["Past Surgeries", ""],
        ["Injuries/Accidents", ""],
        ["Behavioral Notes", ""],
        ["Dietary Requirements", ""],
        ["Exercise Restrictions", ""],
        ["Weight", ""],
        ["Body Condition Score", ""],
        ["Last Deworming Date", ""],
      ],
    },
    {
      title: "5. Vaccination Record",
      fields: [
        ["Tetanus", "Date: ________  Due: ________"],
        ["Influenza", "Date: ________  Due: ________"],
        ["Rhinopneumonitis", "Date: ________  Due: ________"],
        ["West Nile Virus", "Date: ________  Due: ________"],
        ["Rabies", "Date: ________  Due: ________"],
        ["Strangles", "Date: ________  Due: ________"],
        ["Other Vaccines", ""],
        ["Batch Numbers", ""],
        ["Administering Vet", ""],
        ["Vaccination Certificate No.", ""],
      ],
    },
    {
      title: "6. Laboratory Tests",
      fields: [
        ["Last Blood Test Date", ""],
        ["Blood Test Results", ""],
        ["Fecal Analysis Date", ""],
        ["Fecal Analysis Results", ""],
        ["Coggins Test Date", ""],
        ["Coggins Test Result", ""],
        ["Urine Analysis", ""],
        ["Other Lab Tests", ""],
        ["Lab Reference Numbers", ""],
        ["Testing Facility", ""],
      ],
    },
    {
      title: "7. Coggins / EIA Certificate",
      fields: [
        ["Test Date", ""],
        ["Test Result", "Negative / Positive"],
        ["Laboratory Name", ""],
        ["Lab Accreditation No.", ""],
        ["Certificate Number", ""],
        ["Expiration Date", ""],
        ["Testing Veterinarian", ""],
        ["License Number", ""],
        ["Digital Certificate Link", ""],
        ["QR Verification Code", ""],
      ],
    },
    {
      title: "8. Farrier / Dentistry / Physiotherapy",
      fields: [
        ["Last Farrier Visit", ""],
        ["Shoeing Type", ""],
        ["Hoof Condition", ""],
        ["Next Farrier Due", ""],
        ["Last Dental Exam", ""],
        ["Dental Treatments", ""],
        ["Next Dental Due", ""],
        ["Physiotherapy Sessions", ""],
        ["Therapist Name", ""],
        ["Treatment Notes", ""],
      ],
    },
    {
      title: "9. Movement & Transport History",
      fields: [
        ["Current Location", ""],
        ["Previous Locations", ""],
        ["International Travel", ""],
        ["Quarantine Records", ""],
        ["Export/Import Permits", ""],
        ["Transport Company", ""],
        ["Travel Dates", ""],
        ["Health Certificates", ""],
        ["Border Crossing Records", ""],
        ["Customs Documents", ""],
      ],
    },
    {
      title: "10. Notes & Attachments",
      fields: [
        ["Additional Medical Notes", ""],
        ["Competition Records", ""],
        ["Registration Numbers", ""],
        ["Breeding Records", ""],
        ["Performance History", ""],
        ["Training Notes", ""],
        ["Special Instructions", ""],
        ["Insurance Policy No.", ""],
        ["Microchip Scanner Info", ""],
        ["Document Revision Date", new Date().toLocaleDateString()],
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

  doc.text("Date: ___________________________", 20, 140);

  doc.text("Practice Stamp / Seal:", 20, 160);

  // QR code for verification
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify/passport/${passportNo}`;
  const verifyQR = await QRCode.toDataURL(verifyUrl);
  doc.addImage(verifyQR, "PNG", 20, 180, 40, 40);
  doc.setFontSize(8);
  doc.text("Scan to verify this passport", 20, 225);

  return doc;
}
