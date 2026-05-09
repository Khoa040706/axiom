"use server"

import { attendanceService } from "@/lib/services/attendance.service"
import { attendanceSchema } from "@/lib/validators/attendance.schema"
import { serialize } from "@/lib/helpers/serialize"

export async function getAttendanceByMonth(month: number, year: number, departmentId?: number) {
  try {
    const records = await attendanceService.findByMonth(month, year, departmentId)
    return { success: true, data: serialize(records) }
  } catch (error) {
    console.error("[getAttendanceByMonth]", error)
    return { success: false, error: "Không thể tải dữ liệu chấm công" }
  }
}

export async function getTodayAttendance(employeeId?: number) {
  try {
    const records = await attendanceService.findToday(employeeId)
    return { success: true, data: serialize(records) }
  } catch (error) {
    console.error("[getTodayAttendance]", error)
    return { success: false, error: "Không thể tải chấm công hôm nay" }
  }
}

export async function checkIn(employeeId: number) {
  try {
    const now = new Date()
    const record = await attendanceService.checkIn(employeeId, now)
    return { success: true, data: serialize(record) }
  } catch (error) {
    console.error("[checkIn]", error)
    const msg = error instanceof Error ? error.message : "Không thể check-in"
    return { success: false, error: msg }
  }
}

export async function checkOut(attendanceId: number) {
  try {
    const now = new Date()
    const record = await attendanceService.checkOut(attendanceId, now)
    return { success: true, data: serialize(record) }
  } catch (error) {
    console.error("[checkOut]", error)
    return { success: false, error: "Không thể check-out" }
  }
}

export async function upsertAttendance(formData: unknown) {
  try {
    const parsed = attendanceSchema.safeParse(formData)
    if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors }

    const { workDate, checkIn: ci, checkOut: co, ...rest } = parsed.data
    const record = await attendanceService.upsert({
      ...rest,
      workDate: new Date(workDate),
      checkIn: ci ? new Date(ci) : undefined,
      checkOut: co ? new Date(co) : undefined,
    })
    return { success: true, data: serialize(record) }
  } catch (error) {
    console.error("[upsertAttendance]", error)
    return { success: false, error: "Không thể lưu chấm công" }
  }
}
