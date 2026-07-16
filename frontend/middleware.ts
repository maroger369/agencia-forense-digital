import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/verificar/",
  "/",
];

const clientPaths = ["/dashboard"];
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Si es login o register, verificamos si ya está autenticado para redirigirlo
    if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
      const token = getTokenFromRequest(request);
      if (token) {
        const payload = verifyToken(token);
        if (payload) {
          const redirectPath = payload.role === "CLIENTE" ? "/dashboard" : "/admin/evidencias";
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }
    }

    // Even for public paths, remove the prefix condition
    if (pathname.startsWith("/api/verificar/")) {
      // Allow certificate verification API
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/api/health"
  ) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = verifyToken(token);
  if (!payload) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = payload;

  // Check admin routes
  if (pathname.startsWith("/admin") && role === "CLIENTE") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check client routes
  if (pathname.startsWith("/dashboard") && role !== "CLIENTE") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
