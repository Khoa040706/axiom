/**
 * auth.ts — NextAuth v5 (Auth.js) configuration
 * Dùng CredentialsProvider + bcrypt verify thủ công với DB
 * Không dùng PrismaAdapter (conflict với @prisma/adapter-pg của Prisma 7)
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { userService } from "@/lib/services/user.service"
import bcrypt from "bcryptjs"

// Role → dashboard mapping
const ROLE_DASHBOARD: Record<string, string> = {
  Admin:      "/dashboard",
  HRManager:  "/dashboard-hr",
  Accountant: "/dashboard-accountant",
  Director:   "/dashboard-director",
  Manager:    "/dashboard-manager",
  Employee:   "/dashboard-employee",
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        try {
          const user = await userService.findByUsername(credentials.username as string)
          if (!user || !user.isActive) return null

          const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)
          if (!isValid) return null

          await userService.updateLastLogin(user.id)

          const dashboard = ROLE_DASHBOARD[user.role] ?? "/dashboard-employee"

          return {
            id:          String(user.id),
            name:        user.employee?.fullName ?? user.username,
            email:       null,
            role:        user.role,
            employeeId:  user.employeeId ?? undefined,
            dashboardPath: dashboard,
          }
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role          = user.role
        token.employeeId    = user.employeeId
        token.dashboardPath = user.dashboardPath
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id            = token.sub ?? ""
        session.user.role          = typeof token.role === "string" ? token.role : "Employee"
        session.user.employeeId    = typeof token.employeeId === "number" ? token.employeeId : undefined
        session.user.dashboardPath = typeof token.dashboardPath === "string" ? token.dashboardPath : "/dashboard-employee"
      }
      return session
    },
  },
})
