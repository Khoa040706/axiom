/**
 * vary-payroll.ts — Làm cho payroll T1/T2/T3 có số liệu KHÁC nhau mỗi tháng
 * Mỗi NV sẽ có workDays và otHours ngẫu nhiên khác nhau theo tháng và theo nhân viên
 * Seed ổn định: cùng ID + tháng luôn cho cùng số liệu (không random mỗi lần chạy)
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
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// Seed ổn định: dùng id + month để hash → luôn nhất quán, không random mỗi lần chạy
function seededInt(empId: number, month: number, salt: number, min: number, max: number) {
  const h = ((empId * 31 + month * 17 + salt * 7) * 2654435761) >>> 0
  return min + (h % (max - min + 1))
}

function calcPayroll(params: {
  baseSalary: number; allowance: number; otHours: number; numDependents: number; workDays: number
}) {
  const { baseSalary, allowance, otHours, numDependents, workDays } = params
  const standardDays = 26
  // Lương theo ngày công
  const earnedSalary = Math.round(baseSalary / standardDays * workDays)
  const otPay = Math.round((baseSalary / standardDays / 8) * 1.5 * otHours)
  const gross = earnedSalary + allowance + otPay

  const bhxh = Math.round(earnedSalary * BHXH_RATE)
  const bhyt = Math.round(earnedSalary * BHYT_RATE)
  const bhtn = Math.round(earnedSalary * BHTN_RATE)
  const insurance = bhxh + bhyt + bhtn

  const familyDeduction = PERSONAL_DEDUCTION + numDependents * DEPENDENT_DEDUCTION
  let taxableIncome = Math.max(0, gross - insurance - familyDeduction)
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

// Cấu hình từng tháng: workDays range và OT max giờ
const MONTH_CONFIG: Record<number, { wMin: number; wMax: number; otMax: number }> = {
  1: { wMin: 20, wMax: 25, otMax: 8 },  // Tháng 1: workDays 20-25, OT 0-8h
  2: { wMin: 18, wMax: 24, otMax: 4 },  // Tháng 2: ít ngày hơn (Tết), OT ít
  3: { wMin: 21, wMax: 26, otMax: 10 }, // Tháng 3: workDays 21-26, OT nhiều hơn
}

async function main() {
  const months = [1, 2, 3]
  console.log(`📊 Cập nhật workDays + otHours cho T${months.join("/T")}/2026...\n`)

  // Lấy tất cả payroll T1, T2, T3 kèm employee info
  const payrolls = await prisma.payroll.findMany({
    where: { payYear: 2026, payMonth: { in: months } },
    include: { employee: { select: { numDependents: true, id: true } } },
  })

  console.log(`   Tìm thấy ${payrolls.length} bản ghi cần cập nhật`)

  let updated = 0
  const stats: Record<number, { count: number; totalNet: number }> = {}

  for (const p of payrolls) {
    const month = p.payMonth
    const empId = p.employee?.id ?? p.employeeId
    const deps  = p.employee?.numDependents ?? 0

    const cfg = MONTH_CONFIG[month] ?? { wMin: 20, wMax: 25, otMax: 6 }

    // Seed ổn định theo empId + month → số ngày công và OT khác nhau mỗi tháng/mỗi NV
    const workDays = seededInt(empId, month, 1, cfg.wMin, cfg.wMax)
    const otHours  = seededInt(empId, month, 2, 0, cfg.otMax)

    const baseSalary = Number(p.baseSalary)
    const allowance  = Number(p.allowance ?? 0)

    const calc = calcPayroll({ baseSalary, allowance, otHours, numDependents: deps, workDays })

    // T1 & T2 đã thanh toán; T3 là tháng hiện tại → "Đã tính"
    const status = month === 3 ? "Đã tính" : "Đã thanh toán"

    await prisma.payroll.update({
      where: { id: p.id },
      data: {
        workDays,
        otHours,
        otPay:       calc.otPay,
        grossSalary: calc.gross,
        bhxh:        calc.bhxh,
        bhyt:        calc.bhyt,
        bhtn:        calc.bhtn,
        taxIncome:   calc.taxableIncome,
        taxAmount:   calc.pit,
        deductions:  calc.deductions,
        netSalary:   calc.net,
        status,
      },
    })
    updated++
    if (!stats[month]) stats[month] = { count: 0, totalNet: 0 }
    stats[month].count++
    stats[month].totalNet += calc.net
  }

  console.log(`\n✅ Đã cập nhật ${updated} bản ghi`)
  for (const m of months) {
    const cfg = MONTH_CONFIG[m]
    const s = stats[m]
    if (!s) continue
    console.log(`   T${m}: workDays ~${cfg.wMin}-${cfg.wMax}, OT ~0-${cfg.otMax}h | ${s.count} NV | Tổng Net: ${s.totalNet.toLocaleString("vi-VN")} đ`)
  }
  console.log("")

  await prisma.$disconnect()
  await pool.end()
}

main().catch(e => { console.error("❌", e); process.exit(1) })
