import { z } from "zod"

export const attendanceSchema = z.object({
  employeeId: z.number().int().positive("Vui lòng chọn nhân viên"),
  workDate: z.string().min(1, "Vui lòng chọn ngày làm việc"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(["Đi làm", "Nghỉ phép", "Nghỉ lễ", "Vắng mặt"]).default("Đi làm"),
  otHours: z.number().min(0).max(12).default(0),
  lateMinutes: z.number().int().min(0).default(0),
  earlyMinutes: z.number().int().min(0).default(0),
  notes: z.string().max(255).optional(),
})

export type AttendanceInput = z.infer<typeof attendanceSchema>

export const checkInSchema = z.object({
  employeeId: z.number().int().positive(),
  workDate: z.string().min(1),
  checkIn: z.string().min(1, "Vui lòng nhập giờ vào"),
})

export type CheckInInput = z.infer<typeof checkInSchema>

export const checkOutSchema = z.object({
  attendanceId: z.number().int().positive(),
  checkOut: z.string().min(1, "Vui lòng nhập giờ ra"),
})

export type CheckOutInput = z.infer<typeof checkOutSchema>
