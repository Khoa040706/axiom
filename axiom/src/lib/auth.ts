/**
 * auth.ts — NextAuth v5 (Auth.js) configuration — Node.js only
 * Import file này trong Server Components, API routes, Server Actions
 * KHÔNG import trong middleware.ts (Edge Runtime)
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "@/lib/auth.config"
import { userService } from "@/lib/services/user.service"
import bcrypt from "bcryptjs"

// Role → dashboard mapping (giữ ở đây cho CredentialsProvider)
const ROLE_DASHBOARD: Record<string, string> = {
  Admin:      "/dashboard",
  HRManager:  "/dashboard-hr",
  Accountant: "/dashboard-accountant",
  Director:   "/dashboard-director",
  Manager:    "/dashboard-manager",
  Employee:   "/dashboard-employee",
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
            id:            String(user.id),
            name:          user.employee?.fullName ?? user.username,
            email:         null,
            role:          user.role,
            employeeId:    user.employeeId ?? undefined,
            dashboardPath: dashboard,
            personalEmail: user.personalEmail ?? null,
          }
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],
})
