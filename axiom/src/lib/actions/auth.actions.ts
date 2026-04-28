"use server"

import { userService } from "@/lib/services/user.service"
import { serialize } from "@/lib/helpers/serialize"

export async function getUsers() {
  try {
    const data = await userService.findAll()
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getUsers]", error)
    return { success: false, error: "Không thể tải danh sách tài khoản" }
  }
}

export async function updateUserRole(id: number, role: string) {
  try {
    // Ràng buộc chuyển vai trò — đồng bộ với user-admin.actions.ts
    const { prisma } = await import("@/lib/prisma")
    const current = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (!current) return { success: false, error: "Không tìm thấy tài khoản" }

    if (current.role === "Employee" && role !== "Manager" && role !== "Employee") {
      return { success: false, error: "Nhân viên chỉ có thể được thăng lên chức vụ Trưởng phòng" }
    }
    if (current.role === "Manager" && role !== "Manager" && role !== "Employee") {
      return { success: false, error: "Trưởng phòng chỉ có thể được giữ nguyên hoặc hạ xuống Nhân viên" }
    }

    const data = await userService.updateRole(id, role)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[updateUserRole]", error)
    return { success: false, error: "Không thể cập nhật vai trò" }
  }
}

export async function deactivateUser(id: number) {
  try {
    await userService.deactivate(id)
    return { success: true }
  } catch (error) {
    console.error("[deactivateUser]", error)
    return { success: false, error: "Không thể vô hiệu hóa tài khoản" }
  }
}
