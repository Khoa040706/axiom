// next-auth.d.ts — Type augmentation cho NextAuth v5 (Auth.js)

import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      employeeId?: number
      dashboardPath?: string
      personalEmail?: string | null
    }
  }

  interface User {
    id: string
    role: string
    employeeId?: number
    dashboardPath?: string
    personalEmail?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    employeeId?: number
    dashboardPath?: string
    personalEmail?: string | null
  }
}
