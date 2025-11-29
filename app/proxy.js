import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "edge";

export default async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Redirect /dashboard to role-specific dashboard
    if (pathname === "/dashboard") {
      if (token.role === "VET") {
        return NextResponse.redirect(new URL("/dashboard/vet", request.url));
      } else if (token.role === "OWNER") {
        return NextResponse.redirect(new URL("/dashboard/owner", request.url));
      }
    }

    // Vet-only routes
    if (pathname.startsWith("/dashboard/vet") && token.role !== "VET") {
      return NextResponse.redirect(new URL("/dashboard/owner", request.url));
    }

    // Owner-only routes
    if (pathname.startsWith("/dashboard/owner") && token.role !== "OWNER") {
      return NextResponse.redirect(new URL("/dashboard/vet", request.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === "/auth/login" && token) {
    if (token.role === "VET") {
      return NextResponse.redirect(new URL("/dashboard/vet", request.url));
    } else if (token.role === "OWNER") {
      return NextResponse.redirect(new URL("/dashboard/owner", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
};
