// lib/seals/sealGenerator.js
import { createCanvas, loadImage } from "canvas";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SEAL_CONFIG = {
  diameter: 600, // pixels
  practice: "VETSENSE EQUINE CARE AND CONSULTING",
  owner: "Dr. A. M. Simpa (DVM, 8829)",
  colors: {
    primary: "#7A1FA2",
    secondary: "#12ADA0",
  },
};

export async function generateCircularSeal() {
  const size = SEAL_CONFIG.diameter;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Outer ring
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
  ctx.stroke();

  // Inner ring
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 50, 0, 2 * Math.PI);
  ctx.stroke();

  // Center embossed background
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2 - 50
  );
  gradient.addColorStop(0, "rgba(122, 31, 162, 0.1)");
  gradient.addColorStop(1, "rgba(122, 31, 162, 0.05)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 50, 0, 2 * Math.PI);
  ctx.fill();

  // Top text (curved) - practice name
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Split text into two lines for better fit
  const line1 = "VETSENSE EQUINE CARE";
  const line2 = "AND CONSULTING";
  ctx.fillText(line1, size / 2, 80);
  ctx.font = "bold 28px Arial";
  ctx.fillText(line2, size / 2, 110);

  // Bottom text - vet name
  ctx.font = "bold 26px Arial";
  ctx.fillText("Dr. A. M. Simpa", size / 2, size - 100);
  ctx.font = "normal 22px Arial";
  ctx.fillText("DVM, 8829", size / 2, size - 70);

  // Try to load and center logo (if exists)
  try {
    const logoPath = path.join(process.cwd(), "public", "vetsense_logo.png");
    const logo = await loadImage(logoPath);
    const logoSize = 120;
    ctx.globalAlpha = 0.25; // Faint embossed effect
    ctx.drawImage(
      logo,
      size / 2 - logoSize / 2,
      size / 2 - logoSize / 2,
      logoSize,
      logoSize
    );
    ctx.globalAlpha = 1.0;
  } catch (err) {
    // Logo not found, add placeholder
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "rgba(122, 31, 162, 0.2)";
    ctx.fillText("VS", size / 2, size / 2);
  }

  return await uploadSeal(canvas, "circular");
}

export async function generateEmblemSeal() {
  const size = SEAL_CONFIG.diameter;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  // Badge rectangle with rounded corners
  const pad = 50;
  const rectWidth = size - pad * 2;
  const rectHeight = size - pad * 2;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(pad, pad, rectWidth, rectHeight, 30);
  ctx.stroke();

  // Fill with subtle gradient
  const gradient = ctx.createLinearGradient(pad, pad, pad, size - pad);
  gradient.addColorStop(0, "rgba(122, 31, 162, 0.05)");
  gradient.addColorStop(1, "rgba(18, 173, 160, 0.05)");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Central circle motif
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.35, 70, 0, 2 * Math.PI);
  ctx.stroke();

  // Inner decorative circle
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.35, 60, 0, 2 * Math.PI);
  ctx.stroke();

  // Text at top
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("VETSENSE", size / 2, 80);
  ctx.font = "normal 22px Arial";
  ctx.fillText("Equine Care & Consulting", size / 2, 105);

  // Text at bottom
  ctx.font = "bold 24px Arial";
  ctx.fillText("Dr. A. M. Simpa", size / 2, size - 90);
  ctx.font = "normal 20px Arial";
  ctx.fillText("DVM, 8829", size / 2, size - 65);

  // Add decorative elements
  ctx.strokeStyle = SEAL_CONFIG.colors.primary;
  ctx.lineWidth = 2;

  // Top decorative lines
  ctx.beginPath();
  ctx.moveTo(pad + 50, 130);
  ctx.lineTo(size - pad - 50, 130);
  ctx.stroke();

  // Bottom decorative lines
  ctx.beginPath();
  ctx.moveTo(pad + 50, size - 110);
  ctx.lineTo(size - pad - 50, size - 110);
  ctx.stroke();

  return await uploadSeal(canvas, "emblem");
}

export async function generateWaxSeal() {
  const size = SEAL_CONFIG.diameter;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  // Irregular wax shape (simplified polygon)
  ctx.fillStyle = "rgba(122, 31, 162, 0.75)";
  ctx.beginPath();
  const points = 36;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const jitter = Math.sin(angle * 3) * 15 + Math.cos(angle * 5) * 10;
    const radius = size / 2 - 100 + jitter;
    const x = size / 2 + radius * Math.cos(angle);
    const y = size / 2 + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Add shadow effect
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Text on wax (embossed look)
  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("VETSENSE", size / 2, size / 2 - 50);

  ctx.font = "normal 20px Arial";
  ctx.fillText("Equine Care", size / 2, size / 2 - 20);
  ctx.fillText("& Consulting", size / 2, size / 2 + 10);

  ctx.font = "bold 22px Arial";
  ctx.fillText("Dr. A. M. Simpa", size / 2, size / 2 + 50);
  ctx.font = "normal 18px Arial";
  ctx.fillText("DVM, 8829", size / 2, size / 2 + 75);

  return await uploadSeal(canvas, "wax");
}

export async function generateSignatureOverlay() {
  const width = 1200;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, width, height);

  // Small circular seal on left
  const sealSize = 100;
  const sealX = 100;
  const sealY = height / 2;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealSize / 2, 0, 2 * Math.PI);
  ctx.stroke();

  // Inner circle
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealSize / 2 - 10, 0, 2 * Math.PI);
  ctx.stroke();

  // Text in seal
  ctx.font = "bold 12px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("VETSENSE", sealX, sealY - 10);
  ctx.font = "normal 10px Arial";
  ctx.fillText("Official Seal", sealX, sealY + 10);

  // Signature text (cursive style simulation)
  ctx.font = "italic bold 42px Georgia";
  ctx.fillStyle = "#1a3b7c"; // Blue ink
  ctx.textAlign = "left";
  ctx.fillText("Dr. A. M. Simpa (DVM, 8829)", 230, height / 2 + 15);

  // Underline for signature
  ctx.strokeStyle = "#1a3b7c";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(230, height / 2 + 25);
  ctx.lineTo(750, height / 2 + 25);
  ctx.stroke();

  // Date line on right
  ctx.font = "20px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "right";
  ctx.fillText("Date: __________________", width - 50, height / 2 + 15);

  return await uploadSeal(canvas, "signature_overlay");
}

async function uploadSeal(canvas, type) {
  const buffer = canvas.toBuffer("image/png");
  const fingerprint = crypto.createHash("sha256").update(buffer).digest("hex");
  const fingerprintTag = `VETSENSE-SEAL-2025-${fingerprint.slice(0, 8)}`;

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vetsense/seals",
        public_id: `${type}_seal_${Date.now()}`,
        format: "png",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  return {
    type: type.toUpperCase(),
    pngUrl: uploadResult.secure_url,
    fingerprint: fingerprintTag,
    metadata: {
      practice: SEAL_CONFIG.practice,
      owner: SEAL_CONFIG.owner,
      created: new Date().toISOString(),
    },
  };
}
