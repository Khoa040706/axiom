/**
 * middleware.ts — Auth guard cho AXIOM HRM
 * Dùng NextAuth instance riêng với authConfig (Edge-safe, không bcryptjs)
 * Không import auth.ts (có bcrypt) để tránh lỗi Edge Runtime crypto
 */

import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

// Tạo NextAuth instance CHỈ với authConfig (Edge-compatible)
const { auth } = NextAuth(authConfig)

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/forgot-password",
  "/setup-email",
  "/_next",
  "/favicon.ico",
]

const ROLES_SKIP_EMAIL_CHECK = ["Admin"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Redirect root → login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Route công khai — bỏ qua mọi check
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Chưa đăng nhập → login
  if (!session) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Chưa thiết lập Gmail cá nhân → /setup-email (trừ Admin)
  const role = session.user?.role ?? ""
  if (
    !session.user?.personalEmail &&
    !ROLES_SKIP_EMAIL_CHECK.includes(role)
  ) {
    return NextResponse.redirect(new URL("/setup-email", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
