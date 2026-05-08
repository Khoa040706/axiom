/**
 * fake-data-sync.service.ts — Tự động cập nhật chấm công + payroll ảo hàng ngày
 *
 * Mỗi khi dashboard load, service này kiểm tra và tạo data ảo cho 57 NV
 * (bỏ qua 6 TK demo) đến ngày hôm qua.
 *
 * ⚠️ CHỈ DÙNG CHO DEMO — Không sử dụng trong production
 */

import { prisma } from "@/lib/prisma"
import {
  BHXH_RATE, BHYT_RATE, BHTN_RATE,
  PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION, TAX_BRACKETS,
} from "@/lib/constants"

// 6 username demo chính — KHÔNG generate data ảo cho họ
const DEMO_USERNAMES = ["admin", "giamdoc", "nhansu", "ketoan", "quanly", "nhanvien"]

// Cache: chỉ chạy 1 lần/ngày (in-memory)
let lastSyncDate: string | null = null

/** Seeded random để kết quả nhất quán */
function seeded(empId: number, day: number, month: number, year: number, salt: number): number {
  const h = ((empId * 31 + day * 13 + month * 17 + year * 7 + salt * 11) * 2654435761) >>> 0
  return h / 0xFFFFFFFF
}

function seededInt(empId: number, day: number, month: number, year: number, salt: number, min: number, max: number): number {
  return min + Math.floor(seeded(empId, day, month, year, salt) * (max - min + 1))
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

/**
 * Kiểm tra và tự động cập nhật data ảo cho 57 NV đến ngày hôm qua
 * @returns Số records mới tạo
 */
export async function ensureFakeDataUpToDate(): Promise<{ synced: boolean; newRecords: number }> {
  const todayStr = new Date().toISOString().slice(0, 10) // "2026-05-03"

  // Đã sync hôm nay rồi → bỏ qua
  if (lastSyncDate === todayStr) {
    return { synced: false, newRecords: 0 }
  }

  try {
    // 1. Lấy employeeId của 6 TK demo
    const demoUsers = await prisma.user.findMany({
      where: { username: { in: DEMO_USERNAMES } },
      select: { employeeId: true },
    })
    const demoEmployeeIds = new Set(
      demoUsers.filter(u => u.employeeId != null).map(u => u.employeeId!)
    )

    // 2. Lấy tất cả NV (không phải demo) kèm HĐ
    const employees = await prisma.employee.findMany({
      where: {
        status: { in: ["Đang làm", "Thử việc"] },
        id: { notIn: [...demoEmployeeIds] },
      },
      include: {
        contracts: {
          where: { status: "Hiệu lực" },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    })

    if (employees.length === 0) {
      lastSyncDate = todayStr
      return { synced: true, newRecords: 0 }
    }

    // 3. Tìm ngày hôm qua
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    // 4. Tìm ngày chấm công gần nhất của NV ảo → bắt đầu từ đó
    const latestAttendance = await prisma.attendance.findFirst({
      where: { employeeId: { notIn: [...demoEmployeeIds] } },
      orderBy: { workDate: "desc" },
      select: { workDate: true },
    })

    const startDate = new Date(latestAttendance?.workDate ?? new Date(2026, 4, 1)) // fallback: 01/05/2026
    startDate.setDate(startDate.getDate() + 1) // bắt đầu từ ngày tiếp theo

    // Nếu không cần sync (đã cập nhật rồi)
    if (startDate > yesterday) {
      lastSyncDate = todayStr
      return { synced: true, newRecords: 0 }
    }

    // 5. Generate chấm công cho mỗi ngày thiếu
    let newRecords = 0
    const currentDate = new Date(startDate)

    while (currentDate <= yesterday) {
      const dow = currentDate.getDay()

      // Bỏ qua T7 + CN
      if (dow !== 0 && dow !== 6) {
        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const workDate = new Date(currentDate)

        for (const emp of employees) {
          // NV thử việc chỉ có data từ khi vào làm
          if (emp.hireDate > workDate) continue

          const rand = seeded(emp.id, day, month, year, 100)
          const baseStatus = rand < 0.90 ? "Đi làm" : rand < 0.95 ? "Vắng" : "Nghỉ phép"

          if (baseStatus !== "Đi làm") {
            try {
              await prisma.attendance.upsert({
                where: { employeeId_workDate: { employeeId: emp.id, workDate } },
                create: { employeeId: emp.id, workDate, status: baseStatus, lateMinutes: 0, otHours: 0 },
                update: {},  // Không ghi đè nếu đã có
              })
              newRecords++
            } catch { /* skip */ }
            continue
          }

          // Đi làm
          const isLate = seeded(emp.id, day, month, year, 200) < 0.20
          const hasOT = seeded(emp.id, day, month, year, 300) < 0.15
          const lateMinutes = isLate ? seededInt(emp.id, day, month, year, 400, 5, 30) : 0
          const otHours = hasOT ? seededInt(emp.id, day, month, year, 500, 1, 3) : 0
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
              update: {},  // Không ghi đè nếu đã có
            })
            newRecords++
          } catch { /* skip */ }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 6. Recalc payroll cho TẤT CẢ tháng có data (từ startDate đến tháng hiện tại)
    const now = new Date()
    const currentPayMonth = now.getMonth() + 1
    const currentPayYear = now.getFullYear()

    // Tìm tháng bắt đầu cần tính payroll
    const syncStartMonth = startDate.getMonth() + 1
    const syncStartYear = startDate.getFullYear()

    // Duyệt từng tháng từ tháng sync đến tháng hiện tại
    let mYear = syncStartYear
    let mMonth = syncStartMonth
    while (mYear < currentPayYear || (mYear === currentPayYear && mMonth <= currentPayMonth)) {
      const monthStart = new Date(mYear, mMonth - 1, 1)
      const monthEnd = new Date(mYear, mMonth, 1)

      for (const emp of employees) {
        const contract = emp.contracts[0]
        if (!contract) continue

        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            employeeId: emp.id,
            workDate: { gte: monthStart, lt: monthEnd },
            status: { in: ["Đi làm", "Đi muộn"] },
          },
        })

        const workDays = attendanceRecords.length
        const otHours = attendanceRecords.reduce((s, a) => s + Number(a.otHours || 0), 0)

        if (workDays === 0) continue

        const baseSalary = Number(contract.baseSalary) * Number(contract.salaryGrade)
        const allowance = Number(contract.allowance)
        const deps = emp.numDependents ?? 0

        const calc = calcPayroll({ baseSalary, allowance, otHours, numDependents: deps, workDays })

        try {
          await prisma.payroll.upsert({
            where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: mMonth, payYear: mYear } },
            create: {
              employeeId: emp.id, payMonth: mMonth, payYear: mYear,
              workDays, otHours,
              baseSalary, allowance, otPay: calc.otPay,
              grossSalary: calc.gross,
              bhxh: calc.bhxh, bhyt: calc.bhyt, bhtn: calc.bhtn,
              taxIncome: calc.taxableIncome, taxAmount: calc.pit,
              deductions: calc.deductions, netSalary: calc.net,
              status: "Đã tính",
            },
            update: {
              workDays, otHours,
              otPay: calc.otPay, grossSalary: calc.gross,
              bhxh: calc.bhxh, bhyt: calc.bhyt, bhtn: calc.bhtn,
              taxIncome: calc.taxableIncome, taxAmount: calc.pit,
              deductions: calc.deductions, netSalary: calc.net,
            },
          })

          // Tạo Payslip nếu chưa có
          const payroll = await prisma.payroll.findUnique({
            where: { employeeId_payMonth_payYear: { employeeId: emp.id, payMonth: mMonth, payYear: mYear } },
          })
          if (payroll) {
            const existingSlip = await prisma.payslip.findFirst({
              where: { payrollId: payroll.id, employeeId: emp.id },
            })
            if (!existingSlip) {
              await prisma.payslip.create({
                data: { payrollId: payroll.id, employeeId: emp.id, issuedDate: new Date() },
              })
            }
          }
        } catch { /* skip */ }
      }

      // Chuyển sang tháng tiếp theo
      mMonth++
      if (mMonth > 12) { mMonth = 1; mYear++ }
    }

    lastSyncDate = todayStr
    console.log(`[fake-data-sync] ✅ Synced: ${newRecords} attendance records, payroll recalculated T${syncStartMonth}/${syncStartYear} → T${currentPayMonth}/${currentPayYear}`)
    return { synced: true, newRecords }

  } catch (error) {
    console.error("[fake-data-sync] ❌ Error:", error)
    return { synced: false, newRecords: 0 }
  }
}
