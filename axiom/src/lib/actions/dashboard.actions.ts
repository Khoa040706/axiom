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

/** Dữ liệu mở rộng cho Director Dashboard */
export async function getDashboardExtended() {
  const [grossNetRes, empStatusRes, contractTypesRes, leaveTypesRes, newHiresRes] =
    await Promise.allSettled([
      dashboardService.getGrossNetTrend(6),
      dashboardService.getEmployeeStatusBreakdown(),
      dashboardService.getContractTypeBreakdown(),
      dashboardService.getLeaveTypeBreakdown(),
      dashboardService.getNewHireTrend(6),
    ])

  // Log lỗi từng phần để debug dễ hơn
  if (grossNetRes.status      === "rejected") console.error("[grossNet]",      grossNetRes.reason)
  if (empStatusRes.status     === "rejected") console.error("[empStatus]",     empStatusRes.reason)
  if (contractTypesRes.status === "rejected") console.error("[contractTypes]", contractTypesRes.reason)
  if (leaveTypesRes.status    === "rejected") console.error("[leaveTypes]",    leaveTypesRes.reason)
  if (newHiresRes.status      === "rejected") console.error("[newHires]",      newHiresRes.reason)

  return {
    success: true,
    data: serialize({
      grossNet:      grossNetRes.status      === "fulfilled" ? grossNetRes.value      : [],
      empStatus:     empStatusRes.status     === "fulfilled" ? empStatusRes.value     : [],
      contractTypes: contractTypesRes.status === "fulfilled" ? contractTypesRes.value : [],
      leaveTypes:    leaveTypesRes.status    === "fulfilled" ? leaveTypesRes.value    : [],
      newHires:      newHiresRes.status      === "fulfilled" ? newHiresRes.value      : [],
    }),
  }
}

/** KPI riêng cho trang kế toán */
export async function getAccountantDashboardStats() {
  try {
    const stats = await dashboardService.getAccountantStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error("[getAccountantDashboardStats]", error)
    return { success: false, error: "Không thể tải dữ liệu kế toán" }
  }
}

/** Hoạt động gần đây */
export async function getDashboardActivity() {
  try {
    const activity = await dashboardService.getRecentActivity(8)
    return { success: true, data: serialize(activity) }
  } catch (error) {
    console.error("[getDashboardActivity]", error)
    return { success: false, error: "Không thể tải hoạt động" }
  }
}
