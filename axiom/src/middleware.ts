import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * proxy.ts — Bảo vệ route cho AXIOM HRM (Next.js 16+ convention)
 * Dùng NextAuth v5 session cookie để kiểm tra xác thực
 */

// Các route công khai (không cần đăng nhập)
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/forgot-password",
  "/_next",
  "/favicon.ico",
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

// Next.js 16: export default function hoặc named export "proxy"
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect root → login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Cho phép route công khai
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // ── Kiểm tra NextAuth v5 session token ──────────────────
  // NextAuth v5 dùng "authjs.session-token" (development) hoặc "__Secure-authjs.session-token" (production)
  const token =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token") ??
    // NextAuth v4 fallback
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token")

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Áp dụng proxy cho tất cả route trừ static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
