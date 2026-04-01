import { z } from "zod"
import { EMPLOYEE_STATUS, CONTRACT_TYPES } from "@/lib/constants"

export const employeeSchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã nhân viên").max(20),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
  gender: z.enum(["Nam", "Nữ", "Khác"]).optional(),
  dateOfBirth: z.string().optional(),
  idNumber: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().max(255).optional(),
  departmentId: z.number().int().positive("Vui lòng chọn phòng ban").optional(),
  positionId: z.number().int().positive("Vui lòng chọn chức vụ").optional(),
  hireDate: z.string().min(1, "Vui lòng chọn ngày vào làm"),
  status: z.enum(EMPLOYEE_STATUS).default("Đang làm"),
  taxCode: z.string().max(20).optional(),
  numDependents: z.number().int().min(0).default(0),
})

export type EmployeeInput = z.infer<typeof employeeSchema>

export const employeeUpdateSchema = employeeSchema.partial().extend({
  id: z.number().int().positive(),
})

export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>
