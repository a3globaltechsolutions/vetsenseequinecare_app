import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/owner/profile - Get current owner's profile
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        title: true,
        email: true,
        phone: true,
        role: true,
        address: true,
        state: true,
        country: true,
        createdAt: true,

        ownedHorses: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            horse: {
              select: {
                id: true,
                name: true,
                breed: true,
                age: true,
                color: true,
                sex: true,
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },

        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            action: true,
            details: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching owner profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/owner/profile - Update current owner's profile
export async function PUT(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      title,
      phone,
      address,
      state,
      country,
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    // Validate required fields
    if (!name || !country) {
      return NextResponse.json(
        { error: "Name and country are required" },
        { status: 400 }
      );
    }

    // Handle password change if requested
    if (currentPassword || newPassword || confirmPassword) {
      // Validate all password fields are present
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: "All password fields are required to change password" },
          { status: 400 }
        );
      }

      // Validate password length
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New passwords do not match" },
          { status: 400 }
        );
      }

      // Get user's current password hash
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user profile with new password
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: name.trim(),
          title: title?.trim() || null,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          state: state?.trim() || null,
          country: country.trim(),
          passwordHash: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          title: true,
          email: true,
          phone: true,
          role: true,
          address: true,
          state: true,
          country: true,
          createdAt: true,
        },
      });

      // Log the activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "Profile & Password Updated",
          details: "Owner updated their profile information and password",
        },
      });

      return NextResponse.json(updatedUser);
    }

    // Update user profile without password change
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        title: title?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        state: state?.trim() || null,
        country: country.trim(),
      },
      select: {
        id: true,
        name: true,
        title: true,
        email: true,
        phone: true,
        role: true,
        address: true,
        state: true,
        country: true,
        createdAt: true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Profile Updated",
        details: "Owner updated their profile information",
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating owner profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
