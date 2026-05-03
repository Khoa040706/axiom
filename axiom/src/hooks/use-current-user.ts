/**
 * useCurrentUser — Hook lấy thông tin user hiện tại từ NextAuth session
 * Fallback sang mock-auth (localStorage) để backward compat
 * Trả về MockUser-compatible object cho toàn bộ UI
 */
"use client"

import { useSession } from "next-auth/react"
import { getCurrentUser, type MockUser } from "@/lib/mock-auth"

const ROLE_MAP: Record<string, string> = {
  Admin:      "admin",
  HRManager:  "truongphong_ns",
  Accountant: "ketoan",
  Director:   "giamdoc",
  Manager:    "truongphong",
  Employee:   "nhanvien",
}

const ROLE_LABEL: Record<string, { vi: string; en: string }> = {
  Admin:      { vi: "Quản trị viên",          en: "System Admin" },
  HRManager:  { vi: "Trưởng phòng Nhân sự",   en: "HR Manager" },
  Accountant: { vi: "Kế toán",                 en: "Accountant" },
  Director:   { vi: "Giám đốc",               en: "Director" },
  Manager:    { vi: "Trưởng phòng Công nghệ Thông tin", en: "IT Department Manager" },
  Employee:   { vi: "Nhân viên",              en: "Employee" },
}

export function useCurrentUser(): MockUser | null {
  const { data: session, status } = useSession()

  // Loading chờ session
  if (status === "loading") return null

  // Nếu có NextAuth session → dùng session
  if (session?.user) {
    const su = session.user
    const role = su.role ?? "Employee"
    const labels = ROLE_LABEL[role] ?? { vi: "Nhân viên", en: "Employee" }
    return {
      id:           su.employeeId ? `NV${String(su.employeeId).padStart(3, "0")}` : "ADMIN",
      username:     su.name ?? "user",
      password:     "",
      name:         su.name ?? "User",
      email:        su.email ?? "",
      role:         (ROLE_MAP[role] ?? "nhanvien") as MockUser["role"],
      roleLabel:    labels.vi,
      roleLabelEn:  labels.en,
      department:   "AXIOM HRM",
      dashboardPath: su.dashboardPath ?? "/dashboard",
      employeeId_num: su.employeeId ?? undefined,
    }
  }

  // Fallback → mock-auth (localStorage)
  return getCurrentUser()
}

/** Lấy employeeId dạng số từ session (dùng cho DB queries) */
export function useEmployeeId(): number | null {
  const { data: session } = useSession()
  const employeeId = session?.user?.employeeId
  if (employeeId) return Number(employeeId)
  // Từ mock-auth
  const u = getCurrentUser()
  if (!u) return null
  const match = u.id.match(/\d+$/)
  return match ? parseInt(match[0]) : null
}

/** Lấy userId dạng số từ session */
export function useUserId(): number | null {
  const { data: session } = useSession()
  const id = session?.user?.id
  if (id) return Number(id)
  return null
}
