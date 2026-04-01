"use server"

import { dashboardService } from "@/lib/services/dashboard.service"
import { serialize } from "@/lib/helpers/serialize"

export async function getDashboardStats() {
  try {
    const [empStats, pendingLeave, expiringContracts] = await Promise.all([
      dashboardService.getEmployeeStats(),
      dashboardService.getPendingLeaveCount(),
      dashboardService.getExpiringContracts(),
    ])
    return { success: true, data: serialize({ empStats, pendingLeave, expiringContracts }) }
  } catch (error) {
    console.error("[getDashboardStats]", error)
    return { success: false, error: "Không thể tải dữ liệu dashboard" }
  }
}

export async function getDashboardCharts() {
  try {
    const [headcount, payrollTrend] = await Promise.all([
      dashboardService.getHeadcountByDepartment(),
      dashboardService.getPayrollTrend(6),
    ])
    return { success: true, data: serialize({ headcount, payrollTrend }) }
  } catch (error) {
    console.error("[getDashboardCharts]", error)
    return { success: false, error: "Không thể tải biểu đồ dashboard" }
  }
}

export async function getDashboardAttendanceTrend() {
  try {
    const attendanceTrend = await dashboardService.getAttendanceTrend(6)
    return { success: true, data: serialize(attendanceTrend) }
  } catch (error) {
    console.error("[getDashboardAttendanceTrend]", error)
    return { success: false, error: "Không thể tải xu hướng chấm công" }
  }
}
