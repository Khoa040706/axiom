"use server"

import { leaveService } from "@/lib/services/leave.service"
import { leaveRequestSchema } from "@/lib/validators/leave.schema"
import { serialize } from "@/lib/helpers/serialize"

export async function getLeaveRequests(params?: {
  employeeId?: number
  status?: string
  year?: number
}) {
  try {
    const data = await leaveService.findMany(params)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getLeaveRequests]", error)
    return { success: false, error: "Không thể tải danh sách nghỉ phép" }
  }
}

export async function createLeaveRequest(formData: unknown) {
  try {
    const parsed = leaveRequestSchema.safeParse(formData)
    if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { startDate, endDate, note, requestDate: _rd, totalDays: providedDays, ...rest } = parsed.data

    const start = new Date(startDate)
    const end   = new Date(endDate)

    // Tính số ngày làm việc (không tính T7, CN) nếu không được cung cấp
    let totalDays = providedDays ?? 0
    if (!providedDays) {
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay()
        if (day !== 0 && day !== 6) totalDays++
      }
      totalDays = Math.max(1, totalDays)
    }

    const data = await leaveService.create({
      ...rest,
      startDate: start,
      endDate:   end,
      totalDays,
    })
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[createLeaveRequest]", error)
    return { success: false, error: "Không thể tạo đơn nghỉ phép" }
  }
}

export async function approveLeave(requestId: number, approvedBy: number, approved: boolean) {
  try {
    const status = approved ? "Đã duyệt" as const : "Từ chối" as const
    const data = await leaveService.approve(requestId, approvedBy, status)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[approveLeave]", error)
    return { success: false, error: "Không thể cập nhật trạng thái đơn nghỉ phép" }
  }
}

export async function getLeaveBalance(employeeId: number, year: number, leaveType?: string) {
  try {
    const data = await leaveService.getBalance(employeeId, year, leaveType)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getLeaveBalance]", error)
    return { success: false, error: "Không thể tải quỹ phép" }
  }
}

export async function getAllLeaveBalances(year: number) {
  try {
    const data = await leaveService.getAllBalances(year)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getAllLeaveBalances]", error)
    return { success: false, error: "Không thể tải quỹ phép nhân viên" }
  }
}
