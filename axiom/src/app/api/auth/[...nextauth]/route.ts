/**
 * api/auth/[...nextauth]/route.ts
 * NextAuth v5 route handler — kết nối với lib/auth.ts
 */
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
