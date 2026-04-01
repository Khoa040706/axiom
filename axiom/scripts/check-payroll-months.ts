import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@127.0.0.1:5432/axiom_hrm" })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const r1 = await prisma.payroll.count({ where: { payMonth: 1, payYear: 2026 } })
  const r2 = await prisma.payroll.count({ where: { payMonth: 2, payYear: 2026 } })
  const r3 = await prisma.payroll.count({ where: { payMonth: 3, payYear: 2026 } })
  console.log(`Tháng 1/2026: ${r1} bản ghi`)
  console.log(`Tháng 2/2026: ${r2} bản ghi`)
  console.log(`Tháng 3/2026: ${r3} bản ghi`)

  // Check sample contract startDates
  const contracts = await prisma.contract.findMany({ take: 3, orderBy: { startDate: "asc" }, select: { startDate: true, status: true, employee: { select: { fullName: true } } } })
  console.log("\nHợp đồng sớm nhất:")
  contracts.forEach(c => console.log(`  ${c.employee?.fullName ?? "?"}: startDate=${c.startDate?.toISOString().slice(0,10)} status=${c.status}`))

  await prisma.$disconnect()
  await pool.end()
}
main().catch(e => { console.error(e); process.exit(1) })
