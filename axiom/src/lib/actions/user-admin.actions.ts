"use server"

import { userService } from "@/lib/services/user.service"
import bcrypt from "bcryptjs"
import { serialize } from "@/lib/helpers/serialize"

/** Lấy tất cả users (dùng cho settings/users page) */
export async function getAllUsersFromDB() {
  try {
    const users = await userService.findAll()
    return { success: true, data: serialize(users) }
  } catch (err) {
    console.error("[getAllUsersFromDB]", err)
    return { success: false, error: "Không thể tải danh sách user" }
  }
}

/** Tạo user mới + Employee record */
export async function createUserInDB(data: {
  username: string
  password: string
  fullName: string
  email?: string
  phone?: string
  role: string
  departmentId?: number
  positionId?: number
}) {
  try {
    const passwordHash = await bcrypt.hash(data.password, 10)
    const result = await userService.createWithEmployee({
      username: data.username,
      passwordHash,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      departmentId: data.departmentId,
      positionId: data.positionId,
    })
    return { success: true, data: serialize(result) }
  } catch (err) {
    console.error("[createUserInDB]", err)
    const msg = err instanceof Error ? err.message : "Không thể tạo tài khoản"
    return { success: false, error: msg }
  }
}

/** Toggle active/inactive */
export async function toggleUserActiveInDB(userId: number) {
  try {
    const updated = await userService.toggleActive(userId)
    return { success: true, data: serialize(updated) }
  } catch (err) {
    console.error("[toggleUserActiveInDB]", err)
    const msg = err instanceof Error ? err.message : "Không thể cập nhật trạng thái"
    return { success: false, error: msg }
  }
}

/** Xóa user (+ soft-delete employee liên kết) */
export async function deleteUserFromDB(userId: number) {
  try {
    await userService.deleteWithEmployee(userId)
    return { success: true }
  } catch (err) {
    console.error("[deleteUserFromDB]", err)
    const msg = err instanceof Error ? err.message : "Không thể xoá tài khoản"
    return { success: false, error: msg }
  }
}

/** Admin reset password (không cần mật khẩu cũ) */
export async function adminResetPasswordInDB(userId: number, newPassword: string) {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await userService.resetPassword(userId, passwordHash)
    return { success: true }
  } catch (err) {
    console.error("[adminResetPasswordInDB]", err)
    return { success: false, error: "Không thể reset mật khẩu" }
  }
}

/** Đổi role */
export async function updateUserRoleInDB(userId: number, role: string) {
  try {
    const updated = await userService.updateRole(userId, role)
    return { success: true, data: serialize(updated) }
  } catch (err) {
    console.error("[updateUserRoleInDB]", err)
    return { success: false, error: "Không thể cập nhật quyền" }
  }
}

/** Lấy departments cho dropdown khi tạo user */
export async function getDepartmentsForSelect() {
  try {
    const data = await userService.getDepartmentsForSelect()
    return { success: true, data }
  } catch (err) {
    return { success: false, data: [] }
  }
}

/** User tự đổi password (cần mật khẩu cũ) */
export async function changePasswordInDB(userId: number, oldPassword: string, newPassword: string) {
  try {
    const user = await userService.findForPasswordChange(userId)
    if (!user) return { success: false, error: "User không tồn tại" }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!valid) return { success: false, error: "Mật khẩu hiện tại không đúng" }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await userService.updatePassword(userId, passwordHash)
    return { success: true }
  } catch (err) {
    console.error("[changePasswordInDB]", err)
    return { success: false, error: "Không thể đổi mật khẩu" }
  }
}

/** Cập nhật profile employee (name, email, phone, avatar) */
export async function updateProfileInDB(employeeId: number, data: {
  fullName?: string
  email?: string
  phone?: string
  avatarPath?: string  // base64
}) {
  try {
    const updated = await userService.updateEmployeeProfile(employeeId, data)
    return { success: true, data: serialize(updated) }
  } catch (err) {
    console.error("[updateProfileInDB]", err)
    return { success: false, error: "Không thể cập nhật hồ sơ" }
  }
}

/** Lấy avatarPath của employee từ DB (dùng để đồng bộ avatar sau khi upload) */
export async function getEmployeeAvatar(employeeId: number) {
  try {
    const { prisma } = await import("@/lib/prisma")
    const emp = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { avatarPath: true },
    })
    return { success: true, avatarPath: emp?.avatarPath ?? null }
  } catch (err) {
    console.error("[getEmployeeAvatar]", err)
    return { success: false, avatarPath: null }
  }
}

/** Forgot password: generate temp pw + hash + lưu DB */
export async function setTempPasswordInDB(username: string): Promise<{
  success: boolean; tempPassword?: string; error?: string
}> {
  try {
    // Generate temp password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
    let tempPassword = ""
    for (let i = 0; i < 10; i++) {
      tempPassword += chars[Math.floor(Math.random() * chars.length)]
    }

    const passwordHash = await bcrypt.hash(tempPassword, 10)
    await userService.setTempPassword(username, passwordHash)
    return { success: true, tempPassword }
  } catch (err) {
    console.error("[setTempPasswordInDB]", err)
    const msg = err instanceof Error ? err.message : "Không thể đặt lại mật khẩu"
    return { success: false, error: msg }
  }
}
