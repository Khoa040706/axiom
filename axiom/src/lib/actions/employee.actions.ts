"use server"

import { employeeService } from "@/lib/services/employee.service"
import { employeeSchema, employeeUpdateSchema } from "@/lib/validators/employee.schema"
import { serialize } from "@/lib/helpers/serialize"

export async function getEmployees(params?: {
  departmentId?: number
  status?: string
  search?: string
  skip?: number
  take?: number
}) {
  try {
    const employees = await employeeService.findMany(params)
    return { success: true, data: serialize(employees) }
  } catch (error) {
    console.error("[getEmployees]", error)
    return { success: false, error: "Không thể tải danh sách nhân viên" }
  }
}

export async function getEmployeeById(id: number) {
  try {
    const employee = await employeeService.findById(id)
    if (!employee) return { success: false, error: "Không tìm thấy nhân viên" }
    return { success: true, data: serialize(employee) }
  } catch (error) {
    console.error("[getEmployeeById]", error)
    return { success: false, error: "Lỗi khi tải thông tin nhân viên" }
  }
}

export async function createEmployee(formData: unknown) {
  try {
    const parsed = employeeSchema.safeParse(formData)
    if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors }

    const { hireDate, dateOfBirth, ...rest } = parsed.data
    const employee = await employeeService.create({
      ...rest,
      hireDate: new Date(hireDate),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    })
    return { success: true, data: serialize(employee) }
  } catch (error) {
    console.error("[createEmployee]", error)
    return { success: false, error: "Không thể tạo nhân viên" }
  }
}

export async function updateEmployee(id: number, formData: Record<string, unknown>) {
  try {
    const parsed = employeeUpdateSchema.safeParse({ ...formData, id })
    if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors }

    const { id: _id, hireDate, dateOfBirth, ...rest } = parsed.data
    const employee = await employeeService.update(id, {
      ...rest,
      ...(hireDate ? { hireDate: new Date(hireDate) } : {}),
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
    })
    return { success: true, data: serialize(employee) }
  } catch (error) {
    console.error("[updateEmployee]", error)
    return { success: false, error: "Không thể cập nhật nhân viên" }
  }
}

export async function deleteEmployee(id: number) {
  try {
    await employeeService.softDelete(id)
    return { success: true }
  } catch (error) {
    console.error("[deleteEmployee]", error)
    return { success: false, error: "Không thể xóa nhân viên" }
  }
}

export async function hardDeleteEmployee(id: number) {
  try {
    await employeeService.hardDelete(id)
    return { success: true }
  } catch (error) {
    console.error("[hardDeleteEmployee]", error)
    return { success: false, error: "Không thể xóa nhân viên khỏi hệ thống" }
  }
}

export async function reinstateEmployee(id: number) {
  try {
    const employee = await employeeService.update(id, { status: "Đang làm" })
    return { success: true, data: serialize(employee) }
  } catch (error) {
    console.error("[reinstateEmployee]", error)
    return { success: false, error: "Không thể khôi phục nhân viên" }
  }
}

export async function getEmployeeByCode(code: string) {
  try {
    const employee = await employeeService.findByCode(code)
    if (!employee) return { success: false, error: "Không tìm thấy nhân viên" }
    return { success: true, data: serialize(employee) }
  } catch (error) {
    console.error("[getEmployeeByCode]", error)
    return { success: false, error: "Lỗi khi tải thông tin nhân viên" }
  }
}
