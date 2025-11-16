"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Generate sequential passport number
async function generatePassportNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.horse.count({
    where: {
      passportNumber: {
        contains: `VETSENSE-E-${year}`,
      },
    },
  });
  const sequence = (count + 1).toString().padStart(3, "0");
  return `VETSENSE-E-${year}-${sequence}`;
}

// Get all horses
export async function getHorses() {
  try {
    const session = await getSession();
    if (!session) redirect("/auth/signin");

    const horses = await prisma.horse.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
        },
        vet: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return horses;
  } catch (error) {
    console.error("Error fetching horses:", error);
    return [];
  }
}

// Get horse by ID
export async function getHorseById(id) {
  try {
    const horse = await prisma.horse.findUnique({
      where: { id },
      include: {
        owner: true,
        vet: true,
        medicalRecords: {
          orderBy: { date: "desc" },
        },
        vaccinations: {
          orderBy: { date: "desc" },
        },
      },
    });
    return horse;
  } catch (error) {
    console.error("Error fetching horse:", error);
    return null;
  }
}

// Create new horse
export async function createHorse(formData) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const passportNumber = await generatePassportNumber();

    const horseData = {
      passportNumber,
      name: formData.get("name"),
      breed: formData.get("breed"),
      color: formData.get("color"),
      dateOfBirth: new Date(formData.get("dateOfBirth")),
      gender: formData.get("gender"),
      ownerId: formData.get("ownerId"),
      vetId: session.user.id,
    };

    const horse = await prisma.horse.create({
      data: horseData,
    });

    revalidatePath("/horses");
    revalidatePath("/dashboard");
    return { success: true, horse };
  } catch (error) {
    console.error("Error creating horse:", error);
    return { success: false, error: error.message };
  }
}

// Update horse
export async function updateHorse(id, formData) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const horseData = {
      name: formData.get("name"),
      breed: formData.get("breed"),
      color: formData.get("color"),
      dateOfBirth: new Date(formData.get("dateOfBirth")),
      gender: formData.get("gender"),
    };

    await prisma.horse.update({
      where: { id },
      data: horseData,
    });

    revalidatePath("/horses");
    revalidatePath(`/horses/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating horse:", error);
    return { success: false, error: error.message };
  }
}

// Delete horse
export async function deleteHorse(id) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await prisma.horse.delete({
      where: { id },
    });

    revalidatePath("/horses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting horse:", error);
    return { success: false, error: error.message };
  }
}
