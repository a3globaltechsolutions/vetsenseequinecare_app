// lib/seals/sealGenerator.js
import { createCanvas, loadImage, registerFont } from "canvas";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Register fonts (make sure these fonts exist in your public/fonts directory)
try {
  registerFont(
    path.join(process.cwd(), "public/fonts/PlayfairDisplay-Bold.ttf"),
    {
      family: "Playfair Display",
      weight: "bold",
    }
  );
  registerFont(path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"), {
    family: "Inter",
    weight: "normal",
  });
  registerFont(path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"), {
    family: "Inter",
    weight: "bold",
  });
} catch (error) {
  console.warn("Custom fonts not found, using system fonts");
}

const SEAL_CONFIG = {
  diameter: 800, // Increased for better quality
  practice: "VETSENSE EQUINE CARE & CONSULTING",
  owner: "Dr. A. M. Simpa (DVM, 8829)",
  colors: {
    primary: "#7A1FA2", // Purple
    secondary: "#12ADA0", // Teal
    accent: "#FF6B35", // Orange
    gold: "#D4AF37", // Gold
    dark: "#1A1F36", // Dark blue
    light: "#F8FAFC", // Light background
  },
  fonts: {
    title: "Playfair Display, serif",
    body: "Inter, Arial, sans-serif",
  },
};

// Helper function for gradient creation
function createGradients(ctx, width, height) {
  return {
    purpleTeal: ctx.createLinearGradient(0, 0, width, height),
    radialGold: ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width / 2
    ),
    metallic: ctx.createLinearGradient(0, 0, 0, height),
  };
}

// --------------------------
// Premium Circular Seal
// --------------------------
export async function generateCircularSeal() {
  const size = SEAL_CONFIG.diameter;
  const center = size / 2;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Clear with light background
  ctx.fillStyle = SEAL_CONFIG.colors.light;
  ctx.fillRect(0, 0, size, size);

  // Outer decorative ring with gradient
  const outerGradient = ctx.createRadialGradient(
    center,
    center,
    center - 100,
    center,
    center,
    center
  );
  outerGradient.addColorStop(0, SEAL_CONFIG.colors.primary);
  outerGradient.addColorStop(1, SEAL_CONFIG.colors.secondary);

  ctx.strokeStyle = outerGradient;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(center, center, center - 20, 0, 2 * Math.PI);
  ctx.stroke();

  // Inner gold ring
  ctx.strokeStyle = SEAL_CONFIG.colors.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center, center, center - 60, 0, 2 * Math.PI);
  ctx.stroke();

  // Center emblem background
  const centerGradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    120
  );
  centerGradient.addColorStop(0, "#FFFFFF");
  centerGradient.addColorStop(1, SEAL_CONFIG.colors.light);

  ctx.fillStyle = centerGradient;
  ctx.beginPath();
  ctx.arc(center, center, 120, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = SEAL_CONFIG.colors.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center, center, 120, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw curved text
  function drawCurvedText(
    text,
    radius,
    startAngle,
    fontSize = 24,
    fontWeight = "bold"
  ) {
    ctx.font = `${fontWeight} ${fontSize}px ${SEAL_CONFIG.fonts.body}`;
    ctx.fillStyle = SEAL_CONFIG.colors.dark;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const chars = text.split("");
    const anglePerChar = (Math.PI * 1.8) / chars.length;
    let angle = startAngle;

    chars.forEach((char) => {
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);
      ctx.fillText(char, 0, -radius);
      ctx.restore();
      angle += anglePerChar;
    });
  }

  // Top curved text
  drawCurvedText(SEAL_CONFIG.practice, center - 80, Math.PI * 0.9, 28);

  // Bottom curved text (rotated)
  drawCurvedText(SEAL_CONFIG.owner, center - 80, Math.PI * 2.7, 22, "normal");

  // Center content
  try {
    const logoPath = path.join(process.cwd(), "public", "vetsense_logo.jpg");
    const logo = await loadImage(logoPath);
    const logoSize = 140;
    ctx.drawImage(
      logo,
      center - logoSize / 2,
      center - logoSize / 2,
      logoSize,
      logoSize
    );
  } catch (err) {
    // Fallback center design
    ctx.font = `bold 48px ${SEAL_CONFIG.fonts.title}`;
    ctx.fillStyle = SEAL_CONFIG.colors.primary;
    ctx.textAlign = "center";
    ctx.fillText("VS", center, center - 10);

    ctx.font = `normal 16px ${SEAL_CONFIG.fonts.body}`;
    ctx.fillStyle = SEAL_CONFIG.colors.dark;
    ctx.fillText("OFFICIAL SEAL", center, center + 25);
  }

  // Add decorative elements
  ctx.strokeStyle = SEAL_CONFIG.colors.gold;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(center + 130 * Math.cos(angle), center + 130 * Math.sin(angle));
    ctx.lineTo(center + 180 * Math.cos(angle), center + 180 * Math.sin(angle));
    ctx.stroke();
  }

  return await uploadSeal(canvas, "circular");
}

// --------------------------
// Modern Emblem Seal
// --------------------------
export async function generateEmblemSeal() {
  const size = SEAL_CONFIG.diameter;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background with subtle gradient
  const bgGradient = ctx.createLinearGradient(0, 0, size, size);
  bgGradient.addColorStop(0, "#FFFFFF");
  bgGradient.addColorStop(1, SEAL_CONFIG.colors.light);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  const center = size / 2;
  const emblemSize = size - 100;

  // Main emblem shape
  ctx.fillStyle = SEAL_CONFIG.colors.primary;
  ctx.beginPath();
  ctx.roundRect(
    center - emblemSize / 2,
    center - emblemSize / 2,
    emblemSize,
    emblemSize,
    40
  );
  ctx.fill();

  // Inner emblem
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(
    center - emblemSize / 2 + 20,
    center - emblemSize / 2 + 20,
    emblemSize - 40,
    emblemSize - 40,
    30
  );
  ctx.fill();

  // Top section with logo
  try {
    const logoPath = path.join(process.cwd(), "public", "vetsense_logo.jpg");
    const logo = await loadImage(logoPath);
    const logoSize = 80;
    ctx.drawImage(
      logo,
      center - logoSize / 2,
      center - emblemSize / 2 + 40,
      logoSize,
      logoSize
    );
  } catch (err) {
    ctx.font = `bold 36px ${SEAL_CONFIG.fonts.title}`;
    ctx.fillStyle = SEAL_CONFIG.colors.primary;
    ctx.textAlign = "center";
    ctx.fillText("VS", center, center - emblemSize / 2 + 80);
  }

  // Main title
  ctx.font = `bold 32px ${SEAL_CONFIG.fonts.title}`;
  ctx.fillStyle = SEAL_CONFIG.colors.dark;
  ctx.textAlign = "center";
  ctx.fillText("VETSENSE", center, center - 40);

  ctx.font = `normal 20px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.secondary;
  ctx.fillText("Equine Care & Consulting", center, center);

  // Divider line
  ctx.strokeStyle = SEAL_CONFIG.colors.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center - 120, center + 20);
  ctx.lineTo(center + 120, center + 20);
  ctx.stroke();

  // Doctor information
  ctx.font = `bold 24px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.dark;
  ctx.fillText("Dr. A. M. Simpa", center, center + 60);

  ctx.font = `normal 18px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.secondary;
  ctx.fillText("Doctor of Veterinary Medicine", center, center + 90);

  ctx.font = `bold 20px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.primary;
  ctx.fillText("License No. 8829", center, center + 120);

  // Decorative corners
  ctx.strokeStyle = SEAL_CONFIG.colors.gold;
  ctx.lineWidth = 3;

  const cornerSize = 30;
  const corners = [
    [center - emblemSize / 2 + 10, center - emblemSize / 2 + 10],
    [center + emblemSize / 2 - 10, center - emblemSize / 2 + 10],
    [center - emblemSize / 2 + 10, center + emblemSize / 2 - 10],
    [center + emblemSize / 2 - 10, center + emblemSize / 2 - 10],
  ];

  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y - cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x - cornerSize, y);
    ctx.stroke();
  });

  return await uploadSeal(canvas, "emblem");
}

// --------------------------
// Luxury Wax Seal
// --------------------------
export async function generateWaxSeal() {
  const size = SEAL_CONFIG.diameter;
  const center = size / 2;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Create wax-like texture
  const waxGradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center - 50
  );
  waxGradient.addColorStop(0, "#8B4513"); // Dark brown
  waxGradient.addColorStop(0.3, "#CD5C5C"); // Red-brown
  waxGradient.addColorStop(1, "#8B4513"); // Dark brown

  ctx.fillStyle = waxGradient;
  ctx.beginPath();

  // Create irregular wax shape
  const points = 48;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const jitter = Math.sin(angle * 4) * 8 + Math.cos(angle * 6) * 6;
    const radius = center - 80 + jitter;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Add wax texture highlights
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (center - 150);
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    const size = Math.random() * 15 + 5;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Inner seal impression
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(center, center, center - 150, 0, 2 * Math.PI);
  ctx.stroke();

  // Center design
  ctx.font = `bold 42px ${SEAL_CONFIG.fonts.title}`;
  ctx.fillStyle = "#D4AF37";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VETSENSE", center, center - 30);

  ctx.font = `italic 24px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillText("Official Seal", center, center + 10);

  ctx.font = `bold 20px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillText("Dr. A. M. Simpa", center, center + 50);
  ctx.font = `normal 16px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillText("DVM • 8829", center, center + 75);

  // Add wax cracks
  ctx.strokeStyle = "rgba(139, 69, 19, 0.6)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const length = Math.random() * 50 + 20;
    const startX = center + (center - 130) * Math.cos(angle);
    const startY = center + (center - 130) * Math.sin(angle);
    const endX = startX + length * Math.cos(angle + Math.random() * 0.5 - 0.25);
    const endY = startY + length * Math.sin(angle + Math.random() * 0.5 - 0.25);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  return await uploadSeal(canvas, "wax");
}

// --------------------------
// Professional Signature Overlay
// --------------------------
export async function generateSignatureOverlay() {
  const width = 1400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Clean professional background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  const leftMargin = 80;
  const rightMargin = width - 80;

  // Mini seal on left
  const sealSize = 80;
  const sealX = leftMargin + sealSize;
  const sealY = height / 2;

  // Mini circular seal
  ctx.strokeStyle = SEAL_CONFIG.colors.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealSize / 2, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = SEAL_CONFIG.colors.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealSize / 2 - 8, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.font = `bold 12px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.primary;
  ctx.textAlign = "center";
  ctx.fillText("VETSENSE", sealX, sealY - 8);
  ctx.font = `normal 8px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillText("SEAL", sealX, sealY + 8);

  // Signature area
  const signatureX = sealX + sealSize + 60;

  ctx.font = `italic bold 48px ${SEAL_CONFIG.fonts.title}`;
  ctx.fillStyle = SEAL_CONFIG.colors.dark;
  ctx.textAlign = "left";
  ctx.fillText("Dr. A. M. Simpa", signatureX, height / 2 - 10);

  // Signature line
  ctx.strokeStyle = SEAL_CONFIG.colors.primary;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(signatureX, height / 2 + 15);
  ctx.lineTo(signatureX + 400, height / 2 + 15);
  ctx.stroke();
  ctx.setLineDash([]);

  // Credentials
  ctx.font = `normal 20px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.secondary;
  ctx.fillText(
    "Doctor of Veterinary Medicine • License No. 8829",
    signatureX,
    height / 2 + 50
  );

  // Date area on right
  ctx.font = `bold 18px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.dark;
  ctx.textAlign = "right";
  ctx.fillText("Date:", rightMargin - 150, height / 2 - 10);

  ctx.strokeStyle = SEAL_CONFIG.colors.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rightMargin - 150, height / 2 + 5);
  ctx.lineTo(rightMargin, height / 2 + 5);
  ctx.stroke();

  // Contact information
  ctx.font = `normal 14px ${SEAL_CONFIG.fonts.body}`;
  ctx.fillStyle = SEAL_CONFIG.colors.secondary;
  ctx.textAlign = "center";
  ctx.fillText(
    "VETSENSE Equine Care & Consulting • Official Document",
    width / 2,
    height - 30
  );

  return await uploadSeal(canvas, "signature_overlay");
}

// --------------------------
// Upload Helper
// --------------------------
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
        quality: "auto:best",
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
      version: "2.0",
    },
  };
}
