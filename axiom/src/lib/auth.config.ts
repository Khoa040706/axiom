/**
 * auth.config.ts — Cấu hình NextAuth KHÔNG dùng bcrypt
 * File này chạy được trên Edge Runtime (dùng trong middleware.ts)
 * Chỉ chứa session strategy, pages, và callbacks
 * KHÔNG import bcryptjs, userService hay bất kỳ Node.js module nào
 */

import type { NextAuthConfig } from "next-auth"

const ROLE_DASHBOARD: Record<string, string> = {
  Admin:      "/dashboard",
  HRManager:  "/dashboard-hr",
  Accountant: "/dashboard-accountant",
  Director:   "/dashboard-director",
  Manager:    "/dashboard-manager",
  Employee:   "/dashboard-employee",
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [], // Không khai báo provider ở đây — chỉ cần cho middleware
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role          = (user as any).role
        token.employeeId    = (user as any).employeeId
        token.department    = (user as any).department
        token.dashboardPath = (user as any).dashboardPath ?? ROLE_DASHBOARD[(user as any).role] ?? "/dashboard-employee"
        token.personalEmail = (user as any).personalEmail ?? null
      }
      // Cập nhật personalEmail khi client gọi session.update()
      if (trigger === "update" && session?.personalEmail !== undefined) {
        token.personalEmail = session.personalEmail
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id            = token.sub ?? ""
        session.user.role          = typeof token.role === "string" ? token.role : "Employee"
        session.user.employeeId    = typeof token.employeeId === "number" ? token.employeeId : undefined
        session.user.department    = typeof token.department === "string" ? token.department : undefined
        session.user.dashboardPath = typeof token.dashboardPath === "string" ? token.dashboardPath : "/dashboard-employee"
        session.user.personalEmail = token.personalEmail as string | null | undefined
      }
      return session
    },
  },
}
