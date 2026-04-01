import { z } from "zod"

export const leaveRequestSchema = z.object({
  employeeId: z.number().int().positive("Vui lòng chọn nhân viên"),
  leaveType:  z.string().min(1, "Vui lòng chọn loại nghỉ phép"),
  startDate:  z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate:    z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  totalDays:  z.number().min(0.5, "Số ngày phải ít nhất 0.5").optional(),
  reason:     z.string().max(500).optional(),
  note:       z.string().max(500).optional(),
  requestDate: z.string().optional(),   // bỏ qua, không lưu DB
})

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>

export const leaveApprovalSchema = z.object({
  requestId: z.number().int().positive(),
  status: z.enum(["Đã duyệt", "Từ chối"]),
  approvedBy: z.number().int().positive(),
})

export type LeaveApprovalInput = z.infer<typeof leaveApprovalSchema>

export const leaveBalanceSchema = z.object({
  employeeId: z.number().int().positive(),
  year: z.number().int().min(2020).max(2100),
  totalDays: z.number().min(0).default(12),
})

export type LeaveBalanceInput = z.infer<typeof leaveBalanceSchema>
