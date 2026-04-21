"use server"

import { careerHistoryService } from "@/lib/services/career-history.service"
import { serialize } from "@/lib/helpers/serialize"

/** Lấy toàn bộ lịch sử công tác (hỗ trợ filter + search) */
export async function getCareerHistories(params?: {
  eventType?: string
  search?: string
}) {
  try {
    const records = await careerHistoryService.findAll(params)
    return { success: true, data: serialize(records) }
  } catch (error) {
    console.error("[getCareerHistories]", error)
    return { success: false, error: "Không thể tải lịch sử công tác" }
  }
}

/** Lấy lịch sử công tác của 1 nhân viên */
export async function getCareerHistoryByEmployee(employeeId: number) {
  try {
    const records = await careerHistoryService.findByEmployee(employeeId)
    return { success: true, data: serialize(records) }
  } catch (error) {
    console.error("[getCareerHistoryByEmployee]", error)
    return { success: false, error: "Không thể tải lịch sử nhân viên" }
  }
}

/** Tạo sự kiện công tác mới */
export async function createCareerHistory(data: {
  employeeId: number
  eventType: string
  eventDate: string
  description?: string
  oldDepartment?: string
  newDepartment?: string
  oldPosition?: string
  newPosition?: string
  oldSalary?: number
  newSalary?: number
  rewardType?: string
  rewardAmount?: number
  penaltyType?: string
}) {
  try {
    const record = await careerHistoryService.create({
      ...data,
      eventDate: new Date(data.eventDate),
    })
    return { success: true, data: serialize(record) }
  } catch (error) {
    console.error("[createCareerHistory]", error)
    return { success: false, error: "Không thể tạo sự kiện công tác" }
  }
}

/** Xoá sự kiện công tác */
export async function deleteCareerHistory(id: number) {
  try {
    await careerHistoryService.delete(id)
    return { success: true }
  } catch (error) {
    console.error("[deleteCareerHistory]", error)
    return { success: false, error: "Không thể xoá sự kiện" }
  }
}

/** Lấy thống kê overview (dùng cho stat cards) */
export async function getCareerOverviewStats() {
  try {
    const stats = await careerHistoryService.getOverviewStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error("[getCareerOverviewStats]", error)
    return { success: false, error: "Không thể tải thống kê" }
  }
}

/** Lấy employees cho dropdown */
export async function getEmployeesForCareerSelect() {
  try {
    const data = await careerHistoryService.getEmployeesForSelect()
    return { success: true, data: serialize(data) }
  } catch (error) {
    return { success: false, data: [] }
  }
}

/** Lấy departments cho dropdown */
export async function getDepartmentsForCareerSelect() {
  try {
    const data = await careerHistoryService.getDepartmentsForSelect()
    return { success: true, data: serialize(data) }
  } catch (error) {
    return { success: false, data: [] }
  }
}

/** Lấy positions cho dropdown */
export async function getPositionsForCareerSelect() {
  try {
    const data = await careerHistoryService.getPositionsForSelect()
    return { success: true, data: serialize(data) }
  } catch (error) {
    return { success: false, data: [] }
  }
}
