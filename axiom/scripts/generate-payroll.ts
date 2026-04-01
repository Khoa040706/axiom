/**
 * generate-payroll.ts — Script tính lương batch tự động
 *
 * Mục đích: Tính lương cho TẤT CẢ nhân viên đang làm việc
 * trong 1 kỳ lương (tháng/năm) dựa trên:
 *   - Hợp đồng lao động đang hiệu lực
 *   - Dữ liệu chấm công trong tháng
 *   - Quy định bảo hiểm + thuế TNCN VN 2026
 *
 * Cách chạy (khi đã có PostgreSQL):
 *   npx ts-node scripts/generate-payroll.ts --month=3 --year=2026
 *   npx ts-node scripts/generate-payroll.ts --month=3 --year=2026 --dry-run
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
// Import constants & calculator từ shared modules — không duplicate
import {
  BHXH_RATE, BHYT_RATE, BHTN_RATE,
  PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION, TAX_BRACKETS,
} from "../src/lib/constants"

// ── Hàm tính lương tổng hợp (dùng chung constants, không duplicate) ─
function calcPayroll(params: {
  baseSalary: number   // đã nhân hệ số
  allowance: number
  otHours: number
  otRate?: number
  numDependents: number
}) {
  const { baseSalary, allowance, otHours, otRate = 1.5, numDependents } = params
  // Tiền OT theo giờ: (lương/26 ngày/8 giờ) × hệ số OT × số giờ
  const otPay = Math.round((baseSalary / 26 / 8) * otRate * otHours)
  const gross = baseSalary + allowance + otPay

  const bhxh = Math.round(gross * BHXH_RATE)
  const bhyt = Math.round(gross * BHYT_RATE)
  const bhtn = Math.round(gross * BHTN_RATE)
  const totalInsurance = bhxh + bhyt + bhtn

  let taxableIncome = Math.max(0,
    gross - totalInsurance - PERSONAL_DEDUCTION - numDependents * DEPENDENT_DEDUCTION
  )
  // Tính thuế TNCN lũy tiến
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

// ── Main batch function ───────────────────────────────────────
async function generatePayroll(month: number, year: number, dryRun = false) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@127.0.0.1:5432/axiom_hrm"
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log(`\n🚀 AXIOM HRM — Tính lương batch`)
  console.log(`   Kỳ lương: Tháng ${month}/${year}`)
  console.log(`   Chế độ: ${dryRun ? "DRY RUN (không lưu)" : "PRODUCTION (lưu vào DB)"}`)
  console.log("─".repeat(60))

  try {
    // 1. Lấy tất cả nhân viên đang làm việc có hợp đồng hiệu lực
    const employees = await prisma.employee.findMany({
      where: { status: "Đang làm" },
      include: {
        contracts: {
          where: {
            status: "Hiệu lực",
            startDate: { lte: new Date(year, month - 1, 1) },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date(year, month - 1, 1) } },
            ],
          },
          orderBy: { startDate: "desc" },
          take: 1,
        },
        attendance: {
          where: {
            workDate: {
              gte: new Date(year, month - 1, 1),
              lt:  new Date(year, month, 1),
            },
          },
        },
      },
    })

    console.log(`📋 Tìm thấy ${employees.length} nhân viên cần tính lương\n`)

    let successCount = 0
    let skipCount = 0
    let totalNet = 0

    for (const emp of employees) {
      const contract = emp.contracts[0]

      // Skip nếu không có HĐ hiệu lực
      if (!contract) {
        console.log(`   ⚠️  ${emp.code} — ${emp.fullName}: Không có hợp đồng hiệu lực → BỎ QUA`)
        skipCount++
        continue
      }

      // Tổng hợp chấm công
      const workDays = emp.attendance.filter((a: any) => a.status === "Đi làm").length
      const otHours  = emp.attendance.reduce((s: number, a: any) => s + Number(a.otHours || 0), 0)

      // Tính lương
      const result = calcPayroll({
        baseSalary:    Number(contract.baseSalary) * Number(contract.salaryGrade),
        allowance:     Number(contract.allowance),
        otHours,
        numDependents: emp.numDependents ?? 0,
      })

      console.log(`   ✅ ${emp.code} — ${emp.fullName.padEnd(25)} | Gross: ${result.gross.toLocaleString("vi-VN")} → Net: ${result.net.toLocaleString("vi-VN")} đ`)

      if (!dryRun) {
        // Các tháng quá khứ → Đã thanh toán; tháng hiện tại → Đã tính
        const now = new Date()
        const isPast = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
        const payrollStatus = isPast ? "Đã thanh toán" : "Đã tính"
        await prisma.payroll.upsert({
          where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: month, payYear: year } },
          create: {
            employeeId: emp.id, payMonth: month, payYear: year,
            workDays, otHours,
            baseSalary: Number(contract.baseSalary) * Number(contract.salaryGrade),
            allowance: Number(contract.allowance),
            otPay: result.otPay,
            grossSalary: result.gross,
            bhxh: result.bhxh, bhyt: result.bhyt, bhtn: result.bhtn,
            taxIncome: result.taxableIncome, taxAmount: result.pit,
            deductions: result.deductions, netSalary: result.net,
            status: payrollStatus,
          },
          update: {
            workDays, otHours,
            baseSalary: Number(contract.baseSalary) * Number(contract.salaryGrade),
            allowance: Number(contract.allowance),
            otPay: result.otPay,
            grossSalary: result.gross,
            bhxh: result.bhxh, bhyt: result.bhyt, bhtn: result.bhtn,
            taxIncome: result.taxableIncome, taxAmount: result.pit,
            deductions: result.deductions, netSalary: result.net,
            status: payrollStatus,
          },
        })

        // Tạo Payslip nếu chưa có (để nhân viên xem được)
        const newPayroll = await prisma.payroll.findUnique({
          where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: month, payYear: year } },
        })
        if (newPayroll) {
          const existingSlip = await prisma.payslip.findFirst({
            where: { payrollId: newPayroll.id, employeeId: emp.id },
          })
          if (!existingSlip) {
            await prisma.payslip.create({
              data: { payrollId: newPayroll.id, employeeId: emp.id, issuedDate: new Date() },
            })
          }
        }
      }

      totalNet += result.net
      successCount++
    }

    console.log("\n" + "─".repeat(60))
    console.log(`📊 KẾT QUẢ:`)
    console.log(`   ✅ Đã tính:   ${successCount} nhân viên`)
    console.log(`   ⚠️  Bỏ qua:   ${skipCount} nhân viên`)
    console.log(`   💰 Tổng Net:  ${totalNet.toLocaleString("vi-VN")} đ`)
    if (dryRun) {
      console.log(`\n   ℹ️  DRY RUN — không có dữ liệu nào được lưu vào DB`)
    } else {
      console.log(`\n   ✅ Đã lưu vào database thành công!`)
    }

  } catch (err) {
    console.error("\n❌ Lỗi khi tính lương:", err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// ── Parse arguments ───────────────────────────────────────────
const args = process.argv.slice(2)
const monthArg = args.find(a => a.startsWith("--month="))
const yearArg  = args.find(a => a.startsWith("--year="))
const dryRun   = args.includes("--dry-run")

const month = monthArg ? parseInt(monthArg.split("=")[1]) : new Date().getMonth() + 1
const year  = yearArg  ? parseInt(yearArg.split("=")[1])  : new Date().getFullYear()

if (isNaN(month) || month < 1 || month > 12) {
  console.error("❌ Tháng không hợp lệ. Dùng: --month=3")
  process.exit(1)
}
if (isNaN(year) || year < 2024 || year > 2030) {
  console.error("❌ Năm không hợp lệ. Dùng: --year=2026")
  process.exit(1)
}

generatePayroll(month, year, dryRun)
