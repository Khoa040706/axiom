"use server"

import { payrollService } from "@/lib/services/payroll.service"
import { payslipService } from "@/lib/services/payslip.service"
import { serialize } from "@/lib/helpers/serialize"

export async function getPayrollByPeriod(month: number, year: number) {
  try {
    const data = await payrollService.findByPeriod(month, year)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getPayrollByPeriod]", error)
    return { success: false, error: "Không thể tải bảng lương" }
  }
}

export async function calculatePayroll(employeeId: number, month: number, year: number) {
  try {
    const payroll = await payrollService.calculate(employeeId, month, year)
    // Tạo phiếu lương sau khi tính xong
    await payslipService.create(payroll.id, employeeId)
    return { success: true, data: serialize(payroll) }
  } catch (error) {
    console.error("[calculatePayroll]", error)
    return { success: false, error: (error as Error).message ?? "Không thể tính lương" }
  }
}

export async function getPayrollSummary(month: number, year: number) {
  try {
    const data = await payrollService.getSummary(month, year)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getPayrollSummary]", error)
    return { success: false, error: "Không thể tải tổng quỹ lương" }
  }
}

export async function getPayslipsByEmployee(employeeId: number) {
  try {
    const data = await payslipService.findByEmployee(employeeId)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getPayslipsByEmployee]", error)
    return { success: false, error: "Không thể tải phiếu lương" }
  }
}

export async function getEmployeePayroll(employeeId: number, month: number, year: number) {
  try {
    const data = await payrollService.findByPeriod(month, year)
    const record = data.find((p) => p.employeeId === employeeId) ?? null
    return { success: true, data: serialize(record) }
  } catch (error) {
    console.error("[getEmployeePayroll]", error)
    return { success: false, error: "Không thể tải lương nhân viên" }
  }
}
