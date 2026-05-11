/**
 * fix-emails.ts — Đổi email domain từ @axiom.vn → @gmail.com
 *
 * Cách chạy:
 *   npx tsx scripts/fix-emails.ts
 *
 * Hoặc gọi API: GET /api/fix-emails
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

async function main() {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("🔧 FIX — Đổi email @axiom.vn → @gmail.com")
  console.log("═══════════════════════════════════════════════════\n")

  // Tìm tất cả nhân viên có email @axiom.vn
  const employees = await prisma.employee.findMany({
    where: { email: { contains: "@axiom.vn" } },
    select: { id: true, code: true, fullName: true, email: true },
  })

  console.log(`   📧 Tìm thấy ${employees.length} nhân viên có email @axiom.vn\n`)

  let count = 0
  for (const emp of employees) {
    if (!emp.email) continue
    const newEmail = emp.email.replace("@axiom.vn", "@gmail.com")
    await prisma.employee.update({
      where: { id: emp.id },
      data: { email: newEmail },
    })
    console.log(`   ✅ ${emp.code} ${emp.fullName}: ${emp.email} → ${newEmail}`)
    count++
  }

  console.log(`\n   📊 Đã cập nhật ${count} email`)
  console.log("\n═══════════════════════════════════════════════════")
  console.log("✅ HOÀN THÀNH!")
  console.log("═══════════════════════════════════════════════════\n")
}

main()
  .catch(e => { console.error("❌ Lỗi:", e); process.exit(1) })
  .finally(() => { prisma.$disconnect(); pool.end() })
