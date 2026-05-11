// API route: Tạo phiếu lương tháng 1-4/2026 cho NV demo
// Gọi: GET /api/seed-payslips

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  BHXH_RATE, BHYT_RATE, BHTN_RATE,
  PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION, TAX_BRACKETS,
} from "@/lib/constants"

export const runtime = "nodejs"

function calcPayroll(params: {
  baseSalary: number
  allowance: number
  otHours: number
  workDays: number
  numDependents: number
}) {
  const { baseSalary, allowance, otHours, numDependents } = params
  const otPay = Math.round((baseSalary / 26 / 8) * 1.5 * otHours)
  const gross = baseSalary + allowance + otPay

  const bhxh = Math.round(gross * BHXH_RATE)
  const bhyt = Math.round(gross * BHYT_RATE)
  const bhtn = Math.round(gross * BHTN_RATE)
  const totalInsurance = bhxh + bhyt + bhtn

  let taxableIncome = Math.max(0,
    gross - totalInsurance - PERSONAL_DEDUCTION - numDependents * DEPENDENT_DEDUCTION
  )
  let remaining = taxableIncome, tax = 0, prev = 0
  for (const b of TAX_BRACKETS) {
    const inBracket = Math.min(remaining, b.max - prev)
    tax += inBracket * b.rate
    remaining -= inBracket
    prev = b.max
    if (remaining <= 0) break
  }
  const pit = Math.round(tax)
  const net = gross - totalInsurance - pit

  return {
    gross: Math.round(gross), otPay,
    bhxh, bhyt, bhtn, totalInsurance,
    taxableIncome: Math.round(taxableIncome),
    pit, deductions: totalInsurance + pit, net: Math.round(net),
  }
}

export async function GET() {
  try {
    const year = 2026
    const months = [1, 2, 3, 4] // Chỉ tạo tháng 1-4, KHÔNG tạo tháng hiện tại

    // Lấy tất cả NV đang làm có hợp đồng
    const employees = await prisma.employee.findMany({
      where: { status: "Đang làm" },
      include: {
        contracts: {
          where: { status: "Hiệu lực" },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    })

    let totalCreated = 0

    for (const month of months) {
      for (const emp of employees) {
        const contract = emp.contracts[0]
        if (!contract) continue

        const baseSalary = Number(contract.baseSalary) * Number(contract.salaryGrade)
        const allowance = Number(contract.allowance)

        // Giả lập ngày công & OT hợp lý cho các tháng quá khứ
        // Seed: hash đơn giản từ empId + month để data khác nhau
        const seed = (emp.id * 31 + month * 7) % 100
        const workDays = 20 + (seed % 4)  // 20-23 ngày
        const otHours = (seed % 8)          // 0-7h OT
        const numDependents = emp.numDependents ?? 0

        const result = calcPayroll({ baseSalary, allowance, otHours, workDays, numDependents })

        // Upsert payroll
        const payroll = await prisma.payroll.upsert({
          where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: month, payYear: year } },
          create: {
            employeeId: emp.id, payMonth: month, payYear: year,
            workDays, otHours,
            baseSalary, allowance,
            otPay: result.otPay,
            grossSalary: result.gross,
            bhxh: result.bhxh, bhyt: result.bhyt, bhtn: result.bhtn,
            taxIncome: result.taxableIncome, taxAmount: result.pit,
            deductions: result.deductions, netSalary: result.net,
            status: "Đã thanh toán",
          },
          update: {}, // Không ghi đè nếu đã có
        })

        // Upsert payslip
        const existing = await prisma.payslip.findFirst({
          where: { payrollId: payroll.id, employeeId: emp.id },
        })
        if (!existing) {
          // Ngày phát lương: ngày 5 tháng sau
          const issuedDate = new Date(year, month, 5)
          await prisma.payslip.create({
            data: { payrollId: payroll.id, employeeId: emp.id, issuedDate },
          })
          totalCreated++
        }
      }
    }

    // Xóa phiếu lương tháng hiện tại (tháng 5) nếu chưa hết tháng
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentDate = new Date().getDate()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    if (currentDate < daysInMonth) {
      // Chưa hết tháng → xóa payslip tháng hiện tại
      const currentPayrolls = await prisma.payroll.findMany({
        where: { payMonth: currentMonth, payYear: currentYear },
        select: { id: true },
      })
      if (currentPayrolls.length > 0) {
        const deleted = await prisma.payslip.deleteMany({
          where: { payrollId: { in: currentPayrolls.map(p => p.id) } },
        })
        return NextResponse.json({
          success: true,
          message: `Đã tạo ${totalCreated} phiếu lương (tháng 1-4). Xóa ${deleted.count} phiếu tháng ${currentMonth} (chưa hết tháng).`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${totalCreated} phiếu lương cho tháng 1-4/2026.`,
    })
  } catch (err) {
    console.error("[seed-payslips]", err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}
