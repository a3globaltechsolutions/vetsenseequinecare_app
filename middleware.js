import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/auth/login", req.url);
      return NextResponse.redirect(url);
    }

    // Redirect /dashboard to role-specific dashboard
    if (pathname === "/dashboard") {
      if (token.role === "VET") {
        return NextResponse.redirect(new URL("/dashboard/vet", req.url));
      } else if (token.role === "OWNER") {
        return NextResponse.redirect(new URL("/dashboard/owner", req.url));
      }
    }

    // Vet-only routes
    if (pathname.startsWith("/dashboard/vet") && token.role !== "VET") {
      return NextResponse.redirect(new URL("/dashboard/owner", req.url));
    }

    // Owner-only routes
    if (pathname.startsWith("/dashboard/owner") && token.role !== "OWNER") {
      return NextResponse.redirect(new URL("/dashboard/vet", req.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === "/auth/login" && token) {
    if (token.role === "VET") {
      return NextResponse.redirect(new URL("/dashboard/vet", req.url));
    } else if (token.role === "OWNER") {
      return NextResponse.redirect(new URL("/dashboard/owner", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
};
