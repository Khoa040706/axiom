"use server"

import { payrollService } from "@/lib/services/payroll.service"
import { payslipService } from "@/lib/services/payslip.service"
import { serialize } from "@/lib/helpers/serialize"
import { prisma } from "@/lib/prisma"

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
    // Tạo/cập nhật phiếu lương sau khi tính xong (chống duplicate khi tính lại)
    await payslipService.createOrUpdate(payroll.id, employeeId)
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

/**
 * Tính lương hàng loạt cho TẤT CẢ nhân viên đang làm trong kỳ
 * — Gọi từ nút "Tính lương tự động" trên UI
 */
export async function calculatePayrollBatch(month: number, year: number) {
  try {
    const activeEmployees = await prisma.employee.findMany({
      where: { status: { in: ["Đang làm", "Thử việc"] } },
      select: { id: true },
    })

    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const emp of activeEmployees) {
      try {
        const payroll = await payrollService.calculate(emp.id, month, year)
        await payslipService.createOrUpdate(payroll.id, emp.id)
        results.success++
      } catch (err) {
        results.failed++
        results.errors.push(`NV#${emp.id}: ${(err as Error).message}`)
      }
    }

    return {
      success: true,
      data: serialize(results),
      message: `Đã tính lương ${results.success}/${activeEmployees.length} nhân viên`,
    }
  } catch (error) {
    console.error("[calculatePayrollBatch]", error)
    return { success: false, error: "Lỗi khi tính lương hàng loạt" }
  }
}

/** Xác nhận chi lương cho 1 nhân viên (lưu DB) */
export async function confirmPayment(payrollId: number) {
  try {
    const updated = await prisma.payroll.update({
      where: { id: payrollId },
      data: { status: "Đã thanh toán" },
    })
    return { success: true, data: serialize(updated) }
  } catch (error) {
    console.error("[confirmPayment]", error)
    return { success: false, error: "Không thể xác nhận chi lương" }
  }
}
