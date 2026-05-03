/**
 * generate-historical-data.ts — Tạo dữ liệu chấm công + payroll cho nhiều tháng
 *
 * Mục đích: Tạo data lịch sử T12/2025 → T4/2026 cho TẤT CẢ 63 NV,
 *           và T5/2026 (đến hôm qua) chỉ cho 57 NV ảo (bỏ qua 6 TK demo).
 *
 * Cách chạy:
 *   npx tsx scripts/generate-historical-data.ts
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import {
  BHXH_RATE, BHYT_RATE, BHTN_RATE,
  PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION, TAX_BRACKETS,
} from "../src/lib/constants"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@127.0.0.1:5432/axiom_hrm"
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// 6 username demo chính — sẽ được skip ở T5/2026
const DEMO_USERNAMES = ["admin", "giamdoc", "nhansu", "ketoan", "quanly", "nhanvien"]

// ── Helpers ────────────────────────────────────────────────────

/** Seeded random: cùng input → cùng output (không random mỗi lần chạy) */
function seeded(empId: number, month: number, year: number, salt: number): number {
  const h = ((empId * 31 + month * 17 + year * 13 + salt * 7) * 2654435761) >>> 0
  return h / 0xFFFFFFFF // 0..1
}

function seededInt(empId: number, month: number, year: number, salt: number, min: number, max: number): number {
  return min + Math.floor(seeded(empId, month, year, salt) * (max - min + 1))
}

/** Lấy danh sách ngày đi làm trong tháng (bỏ T7 + CN) */
function getWorkdays(year: number, month: number, untilDate?: Date): Date[] {
  const days: Date[] = []
  const totalDays = new Date(year, month, 0).getDate()
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month - 1, d)
    if (untilDate && date >= untilDate) break
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) days.push(date)
  }
  return days
}

/** Tính lương Gross → Net */
function calcPayroll(params: {
  baseSalary: number; allowance: number; otHours: number;
  numDependents: number; workDays: number
}) {
  const { baseSalary, allowance, otHours, numDependents, workDays } = params
  const standardDays = 26
  const earnedSalary = Math.round(baseSalary / standardDays * workDays)
  const otPay = Math.round((baseSalary / standardDays / 8) * 1.5 * otHours)
  const gross = earnedSalary + allowance + otPay

  const bhxh = Math.round(earnedSalary * BHXH_RATE)
  const bhyt = Math.round(earnedSalary * BHYT_RATE)
  const bhtn = Math.round(earnedSalary * BHTN_RATE)
  const insurance = bhxh + bhyt + bhtn

  const familyDeduction = PERSONAL_DEDUCTION + numDependents * DEPENDENT_DEDUCTION
  const taxableIncome = Math.max(0, gross - insurance - familyDeduction)
  let remaining = taxableIncome, tax = 0, prev = 0
  for (const b of TAX_BRACKETS) {
    const inBracket = Math.min(remaining, b.max - prev)
    tax += inBracket * b.rate
    remaining -= inBracket
    prev = b.max
    if (remaining <= 0) break
  }
  const pit = Math.round(tax)
  const deductions = insurance + pit
  const net = gross - deductions

  return { earnedSalary, otPay, gross, bhxh, bhyt, bhtn, insurance, taxableIncome, pit, deductions, net }
}

// ── Cấu hình mỗi tháng ────────────────────────────────────────
const MONTH_CONFIG: Record<string, { wMin: number; wMax: number; otMax: number }> = {
  "12-2025": { wMin: 20, wMax: 24, otMax: 4 },   // T12: cuối năm, ít ngày hơn
  "1-2026":  { wMin: 18, wMax: 22, otMax: 3 },   // T1: Tết Nguyên Đán
  "2-2026":  { wMin: 19, wMax: 23, otMax: 6 },   // T2: sau Tết
  "3-2026":  { wMin: 21, wMax: 26, otMax: 10 },  // T3: quý 1 kết thúc
  "4-2026":  { wMin: 21, wMax: 25, otMax: 8 },   // T4: bình thường
  "5-2026":  { wMin: 20, wMax: 25, otMax: 8 },   // T5: tháng hiện tại
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 AXIOM HRM — Generate Historical Data")
  console.log("   T12/2025 → T4/2026 (tất cả 63 NV)")
  console.log("   T5/2026 đến hôm qua (57 NV ảo, bỏ 6 TK demo)")
  console.log("═══════════════════════════════════════════════════\n")

  // 1. Lấy danh sách employeeId demo để skip ở T5
  const demoUsers = await prisma.user.findMany({
    where: { username: { in: DEMO_USERNAMES } },
    select: { employeeId: true, username: true },
  })
  const demoEmployeeIds = new Set(
    demoUsers.filter(u => u.employeeId != null).map(u => u.employeeId!)
  )
  console.log(`🔑 6 TK demo → ${demoEmployeeIds.size} employeeId: [${[...demoEmployeeIds].join(", ")}]\n`)

  // 2. Lấy tất cả NV kèm HĐ
  const allEmployees = await prisma.employee.findMany({
    where: { status: { in: ["Đang làm", "Thử việc"] } },
    include: {
      contracts: {
        where: { status: "Hiệu lực" },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  })
  console.log(`👥 Tổng NV: ${allEmployees.length}\n`)

  // 3. Xử lý từng tháng
  const months: { month: number; year: number; skipDemo: boolean }[] = [
    { month: 12, year: 2025, skipDemo: false },
    { month: 1,  year: 2026, skipDemo: false },
    { month: 2,  year: 2026, skipDemo: false },
    // T3 đã có từ seed → skip
    { month: 4,  year: 2026, skipDemo: false },
    { month: 5,  year: 2026, skipDemo: true },  // T5: chỉ NV ảo
  ]

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let grandTotalAttendance = 0
  let grandTotalPayroll = 0

  for (const { month, year, skipDemo } of months) {
    const cfgKey = `${month}-${year}`
    const cfg = MONTH_CONFIG[cfgKey] ?? { wMin: 20, wMax: 25, otMax: 6 }

    // Xác định giới hạn ngày cho T5
    const untilDate = (month === 5 && year === 2026) ? today : undefined

    const workdays = getWorkdays(year, month, untilDate)
    const employees = skipDemo
      ? allEmployees.filter(e => !demoEmployeeIds.has(e.id))
      : allEmployees

    // Kiểm tra NV thử việc có hireDate sau tháng này không
    const monthStart = new Date(year, month - 1, 1)

    console.log(`\n📅 Tháng ${month}/${year} — ${employees.length} NV × ${workdays.length} ngày${skipDemo ? " (bỏ 6 TK demo)" : ""}`)

    let monthAttendance = 0
    let monthPayroll = 0

    for (const emp of employees) {
      const contract = emp.contracts[0]
      if (!contract) continue

      // NV thử việc chỉ có data từ khi vào làm
      if (emp.hireDate > monthStart) continue

      // ── Chấm công ────────────────────────────
      let totalWorkDays = 0
      let totalOtHours = 0

      for (let di = 0; di < workdays.length; di++) {
        const workDate = workdays[di]
        const rand = seeded(emp.id, month, year, di + 100)
        const baseStatus = rand < 0.90 ? "Đi làm" : rand < 0.95 ? "Vắng" : "Nghỉ phép"

        if (baseStatus !== "Đi làm") {
          // Upsert vắng/nghỉ phép
          try {
            await prisma.attendance.upsert({
              where: { employeeId_workDate: { employeeId: emp.id, workDate } },
              create: { employeeId: emp.id, workDate, status: baseStatus, lateMinutes: 0, otHours: 0 },
              update: { status: baseStatus },
            })
            monthAttendance++
          } catch { /* skip duplicate */ }
          continue
        }

        // Đi làm
        totalWorkDays++
        const isLate = seeded(emp.id, month, year, di + 200) < 0.20
        const hasOT = seeded(emp.id, month, year, di + 300) < 0.15
        const lateMinutes = isLate ? seededInt(emp.id, month, year, di + 400, 5, 30) : 0
        const otHours = hasOT ? seededInt(emp.id, month, year, di + 500, 1, 3) : 0
        totalOtHours += otHours

        const status = lateMinutes > 0 ? "Đi muộn" : "Đi làm"
        let checkInHour = 7, checkInMin = 30
        if (lateMinutes > 0) {
          checkInMin = 30 + lateMinutes
          checkInHour = 7 + Math.floor(checkInMin / 60)
          checkInMin = checkInMin % 60
        }

        try {
          await prisma.attendance.upsert({
            where: { employeeId_workDate: { employeeId: emp.id, workDate } },
            create: {
              employeeId: emp.id, workDate, status,
              checkIn: new Date(1970, 0, 1, checkInHour, checkInMin, 0),
              checkOut: new Date(1970, 0, 1, 17 + otHours, 0, 0),
              lateMinutes, otHours,
            },
            update: {
              status,
              checkIn: new Date(1970, 0, 1, checkInHour, checkInMin, 0),
              checkOut: new Date(1970, 0, 1, 17 + otHours, 0, 0),
              lateMinutes, otHours,
            },
          })
          monthAttendance++
        } catch { /* skip */ }
      }

      // ── Payroll ────────────────────────────
      const baseSalary = Number(contract.baseSalary) * Number(contract.salaryGrade)
      const allowance = Number(contract.allowance)
      const deps = emp.numDependents ?? 0

      // Dùng seeded random cho workDays/otHours thay vì real
      const sWorkDays = seededInt(emp.id, month, year, 1, cfg.wMin, cfg.wMax)
      const sOtHours = seededInt(emp.id, month, year, 2, 0, cfg.otMax)

      const calc = calcPayroll({
        baseSalary, allowance,
        otHours: sOtHours,
        numDependents: deps,
        workDays: sWorkDays,
      })

      // Tháng quá khứ → "Đã thanh toán", tháng hiện tại → "Đã tính"
      const now = new Date()
      const isPast = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
      const payrollStatus = isPast ? "Đã thanh toán" : "Đã tính"

      try {
        await prisma.payroll.upsert({
          where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: month, payYear: year } },
          create: {
            employeeId: emp.id, payMonth: month, payYear: year,
            workDays: sWorkDays, otHours: sOtHours,
            baseSalary, allowance, otPay: calc.otPay,
            grossSalary: calc.gross,
            bhxh: calc.bhxh, bhyt: calc.bhyt, bhtn: calc.bhtn,
            taxIncome: calc.taxableIncome, taxAmount: calc.pit,
            deductions: calc.deductions, netSalary: calc.net,
            status: payrollStatus,
          },
          update: {
            workDays: sWorkDays, otHours: sOtHours,
            baseSalary, allowance, otPay: calc.otPay,
            grossSalary: calc.gross,
            bhxh: calc.bhxh, bhyt: calc.bhyt, bhtn: calc.bhtn,
            taxIncome: calc.taxableIncome, taxAmount: calc.pit,
            deductions: calc.deductions, netSalary: calc.net,
            status: payrollStatus,
          },
        })

        // Tạo Payslip nếu chưa có
        const payroll = await prisma.payroll.findUnique({
          where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: month, payYear: year } },
        })
        if (payroll) {
          const existingSlip = await prisma.payslip.findFirst({
            where: { payrollId: payroll.id, employeeId: emp.id },
          })
          if (!existingSlip) {
            await prisma.payslip.create({
              data: { payrollId: payroll.id, employeeId: emp.id, issuedDate: new Date(year, month - 1, 28) },
            })
          }
        }

        monthPayroll++
      } catch { /* skip */ }
    }

    console.log(`   ✅ Chấm công: ${monthAttendance} records | Payroll: ${monthPayroll} NV`)
    grandTotalAttendance += monthAttendance
    grandTotalPayroll += monthPayroll
  }

  console.log("\n═══════════════════════════════════════════════════")
  console.log("✅ HOÀN THÀNH!")
  console.log(`   📊 Tổng chấm công: ${grandTotalAttendance} records`)
  console.log(`   💰 Tổng payroll:   ${grandTotalPayroll} records`)
  console.log("═══════════════════════════════════════════════════\n")
}

main()
  .catch(e => { console.error("❌ Lỗi:", e); process.exit(1) })
  .finally(() => { prisma.$disconnect(); pool.end() })
