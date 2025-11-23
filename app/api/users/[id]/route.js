import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/users/:id - Get a single user with full details
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await params in Next.js 15+
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
            id: true, // Ownership record ID
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
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

// PUT /api/users/:id - Update a user (Admin only)
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      title,
      phone,
      address,
      state,
      country,
      role,
      newPassword,
      confirmPassword,
    } = body;

    // Validate required fields
    if (!name || !country || !role) {
      return NextResponse.json(
        { error: "Name, country, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["VET", "OWNER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      title: title?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      state: state?.trim() || null,
      country: country.trim(),
      role: role,
    };

    // Handle password change if requested
    if (newPassword || confirmPassword) {
      // Validate password fields
      if (!newPassword) {
        return NextResponse.json(
          { error: "Please enter a new password" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "Passwords do not match" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.passwordHash = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        userId: id,
        action: newPassword
          ? "Profile & Password Updated by Admin"
          : "Profile Updated by Admin",
        details: `Admin (${session.user.name}) updated user information${
          newPassword ? " and reset password" : ""
        }`,
      },
    });

    // Also log in admin's activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Updated User",
        details: `Updated user: ${updatedUser.name} (${updatedUser.email})`,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id - Delete a user (Admin only)
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VET") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedHorses: true,
        activityLogs: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log the deletion in admin's activity before deleting
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Deleted User",
        details: `Deleted user: ${existingUser.name} (${existingUser.email}) - Role: ${existingUser.role}`,
      },
    });

    // Delete user (cascade will handle related records)
    // The cascade is defined in your Prisma schema
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
