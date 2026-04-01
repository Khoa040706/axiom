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
    where: { status: "Đang làm" },
    select: { id: true, code: true, fullName: true },
  })

  const workdays = getWorkdays(year, month)
  console.log(`📋 ${employees.length} nhân viên · ${workdays.length} ngày làm việc\n`)

  let created = 0, skipped = 0

  for (const emp of employees) {
    for (const workDate of workdays) {
      // Random: 92% đi làm, 5% vắng, 3% nghỉ phép
      const rand = Math.random()
      const status = rand < 0.92 ? "Đi làm" : rand < 0.97 ? "Vắng" : "Nghỉ phép"
      // OT ngẫu nhiên: 15% ngày có OT 1-3 giờ
      const otHours = (status === "Đi làm" && Math.random() < 0.15)
        ? Math.floor(Math.random() * 3) + 1
        : 0

      try {
        await prisma.attendance.upsert({
          where: { employeeId_workDate: { employeeId: emp.id, workDate } },
          create: {
            employeeId: emp.id,
            workDate,
            status,
            checkIn:  status === "Đi làm" ? new Date(1970, 0, 1, 8, 0, 0) : null,
            checkOut: status === "Đi làm" ? new Date(1970, 0, 1, 17, 0, 0) : null,
            otHours,
            notes: null,
          },
          update: {
            status,
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
