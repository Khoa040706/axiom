import { prisma } from "@/lib/prisma"
import { payrollService } from "@/lib/services/payroll.service"

async function main() {
  const months = [
    { m: 1, y: 2026 },
    { m: 2, y: 2026 },
    { m: 3, y: 2026 },
    { m: 4, y: 2026 },
  ]

  const emps = await prisma.employee.findMany({
    where: { status: "Đang làm" },
    select: { id: true, fullName: true },
  })

  console.log(`🔄 Tính lại lương cho ${emps.length} nhân viên...\n`)

  for (const { m, y } of months) {
    let ok = 0, skip = 0
    for (const emp of emps) {
      try {
        await payrollService.calculate(emp.id, m, y)
        ok++
      } catch {
        skip++
      }
    }
    console.log(`✅ Tháng ${m}/${y}: cập nhật=${ok} | bỏ qua (không HĐ)=${skip}`)
  }

  await prisma.$disconnect()
}

main()
