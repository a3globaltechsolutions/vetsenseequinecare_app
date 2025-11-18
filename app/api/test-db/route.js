// app/api/test-db/route.js
// Create this file temporarily to test DB connection
// DELETE after testing!

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      userCount,
      users,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
