import { auth } from "@/auth";
import { NextResponse } from "next/server";

const VENDOR_PATHS = ["/dashboard/vendor"];
const COUPLE_PATHS = ["/dashboard/couple"];
const ADMIN_PATHS = ["/dashboard/admin"];
const AUTH_PATHS = ["/login", "/register"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && session) {
    if (role === "VENDOR") return NextResponse.redirect(new URL("/dashboard/vendor", req.url));
    if (role === "COUPLE") return NextResponse.redirect(new URL("/dashboard/couple", req.url));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", req.url));
  }

  if (VENDOR_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "VENDOR") return NextResponse.redirect(new URL("/", req.url));
  }

  if (COUPLE_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "COUPLE") return NextResponse.redirect(new URL("/", req.url));
  }

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
