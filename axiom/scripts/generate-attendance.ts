/**
 * generate-attendance.ts — Tạo dữ liệu chấm công demo cho tháng chỉ định
 * Dùng để có dữ liệu chấm công cho script tính lương batch
 *
 * Cách dùng:
 *   npx tsx scripts/generate-attendance.ts --month=1 --year=2026
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@127.0.0.1:5432/axiom_hrm"
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

// Lấy danh sách ngày làm việc trong tháng (bỏ Sat + Sun)
function getWorkdays(year: number, month: number): Date[] {
  const days: Date[] = []
  const totalDays = getDaysInMonth(year, month)
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month - 1, d)
    const dow = date.getDay() // 0=Sun,6=Sat
    if (dow !== 0 && dow !== 6) days.push(date)
  }
  return days
}

async function generateAttendance(month: number, year: number) {
  console.log(`\n🚀 Tạo dữ liệu chấm công: Tháng ${month}/${year}`)

  const employees = await prisma.employee.findMany({
    where: { status: { in: ["Đang làm", "Thử việc"] } },
    select: { id: true, code: true, fullName: true },
  })

  const workdays = getWorkdays(year, month)
  console.log(`📋 ${employees.length} nhân viên · ${workdays.length} ngày làm việc\n`)

  let created = 0, skipped = 0

  for (const emp of employees) {
    for (const workDate of workdays) {
      // Random: 92% đi làm, 5% vắng, 3% nghỉ phép
      const rand = Math.random()
      const baseStatus = rand < 0.92 ? "Đi làm" : rand < 0.97 ? "Vắng" : "Nghỉ phép"
      // OT ngẫu nhiên: 15% ngày có OT 1-3 giờ
      const otHours = (baseStatus === "Đi làm" && Math.random() < 0.15)
        ? Math.floor(Math.random() * 3) + 1
        : 0

      // Giờ hành chính: 7:30 - 11:30 và 13:00 - 17:00
      // 80% đúng giờ (±5 phút), 20% đi muộn (5-30 phút)
      let lateMinutes = 0
      let checkInHour = 7, checkInMin = 30
      if (baseStatus === "Đi làm") {
        if (Math.random() < 0.20) {
          // Đi muộn: 5-30 phút
          lateMinutes = Math.floor(Math.random() * 26) + 5
        } else {
          // Đúng giờ: ±5 phút
          lateMinutes = 0
          const delta = Math.floor(Math.random() * 11) - 5  // -5 to +5
          checkInMin = 30 + delta
          if (checkInMin < 0)  { checkInHour = 6; checkInMin += 60 }
          if (checkInMin >= 60) { checkInHour = 8; checkInMin -= 60 }
        }
        if (lateMinutes > 0) {
          checkInMin = 30 + lateMinutes
          checkInHour = 7 + Math.floor(checkInMin / 60)
          checkInMin  = checkInMin % 60
        }
      }

      // Status cuối: "Đi muộn" nếu lateMinutes > 0
      const status = baseStatus === "Đi làm" && lateMinutes > 0 ? "Đi muộn" : baseStatus

      try {
        await prisma.attendance.upsert({
          where: { employeeId_workDate: { employeeId: emp.id, workDate } },
          create: {
            employeeId: emp.id,
            workDate,
            status,
            checkIn:      status === "Đi làm" ? new Date(1970, 0, 1, checkInHour, checkInMin, 0) : null,
            checkOut:     status === "Đi làm" ? new Date(1970, 0, 1, 17, 0, 0) : null,
            lateMinutes,
            otHours,
            notes: null,
          },
          update: {
            status,
            checkIn:      status === "Đi làm" ? new Date(1970, 0, 1, checkInHour, checkInMin, 0) : null,
            checkOut:     status === "Đi làm" ? new Date(1970, 0, 1, 17, 0, 0) : null,
            lateMinutes,
            otHours,
          },
        })
        created++
      } catch {
        skipped++
      }
    }
  }

  console.log(`✅ Tạo xong: ${created} bản ghi | Bỏ qua: ${skipped}`)
  await prisma.$disconnect()
  await pool.end()
}

const args = process.argv.slice(2)
const monthArg = args.find(a => a.startsWith("--month="))
const yearArg  = args.find(a => a.startsWith("--year="))
const month = monthArg ? parseInt(monthArg.split("=")[1]) : new Date().getMonth() + 1
const year  = yearArg  ? parseInt(yearArg.split("=")[1])  : new Date().getFullYear()

generateAttendance(month, year).catch(e => { console.error(e); process.exit(1) })
