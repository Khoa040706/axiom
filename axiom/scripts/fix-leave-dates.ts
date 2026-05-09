/**
 * fix-leave-dates.ts — Sửa lại ngày nghỉ phép cho hợp lý (tháng 5/2026)
 *
 * Vấn đề: Đơn nghỉ phép seed có ngày nghỉ tháng 3-4 nhưng nộp tháng 5 → bất hợp lý
 * Giải pháp: Xóa đơn cũ, tạo lại 8 đơn gốc + 15 đơn bổ sung với ngày hợp lý
 *
 * Cách chạy:
 *   npx tsx scripts/fix-leave-dates.ts
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
  console.log("🔧 FIX — Cập nhật ngày nghỉ phép cho hợp lý")
  console.log("═══════════════════════════════════════════════════\n")

  // 1. Xóa toàn bộ đơn nghỉ phép cũ
  const deleted = await prisma.leaveRequest.deleteMany()
  console.log(`   🗑️  Đã xóa ${deleted.count} đơn nghỉ phép cũ\n`)

  // 2. Lấy danh sách nhân viên
  const employees = await prisma.employee.findMany({
    select: { id: true, code: true, fullName: true },
    orderBy: { code: "asc" },
  })
  const byCode = (code: string) => employees.find(e => e.code === code)

  // 3. Tạo lại đơn nghỉ phép với ngày hợp lý
  // ── Đơn đã duyệt / từ chối (tháng 4/2026 — quá khứ) ──────────
  const pastLeaves = [
    { code: "NV009", type: "Nghỉ phép năm", from: "2026-04-07", to: "2026-04-08", days: 2, reason: "Đưa gia đình đi du lịch cuối tuần", status: "Đã duyệt", createdAt: "2026-04-02" },
    { code: "NV013", type: "Nghỉ bệnh",     from: "2026-04-14", to: "2026-04-15", days: 2, reason: "Bị sốt virus, cần nghỉ ngơi",       status: "Đã duyệt", createdAt: "2026-04-13" },
    { code: "NV023", type: "Nghỉ phép năm", from: "2026-04-21", to: "2026-04-22", days: 2, reason: "Về quê thăm ông bà",                status: "Đã duyệt", createdAt: "2026-04-17" },
    { code: "NV033", type: "Việc riêng",     from: "2026-04-28", to: "2026-04-29", days: 2, reason: "Dự đám cưới bạn thân",               status: "Từ chối",  createdAt: "2026-04-24" },
  ]

  // ── Đơn đã duyệt gần đây (đầu tháng 5) ────────────────────────
  const recentApproved = [
    { code: "NV018", type: "Nghỉ phép năm", from: "2026-05-05", to: "2026-05-06", days: 2, reason: "Đi khám sức khỏe tổng quát",      status: "Đã duyệt", createdAt: "2026-05-01" },
    { code: "NV043", type: "Nghỉ bệnh",     from: "2026-05-07", to: "2026-05-08", days: 2, reason: "Bị viêm họng, cần nghỉ ngơi",     status: "Đã duyệt", createdAt: "2026-05-06" },
  ]

  // ── Đơn chờ duyệt (tháng 5/2026 — tương lai gần) ──────────────
  const pendingLeaves = [
    // Phòng CNTT
    { code: "NV010", type: "Nghỉ phép năm", from: "2026-05-12", to: "2026-05-13", days: 2, reason: "Xin nghỉ phép đi khám sức khỏe định kỳ",   status: "Chờ duyệt", createdAt: "2026-05-08" },
    { code: "NV011", type: "Nghỉ bệnh",     from: "2026-05-14", to: "2026-05-15", days: 2, reason: "Bị cảm sốt, cần nghỉ ngơi",                status: "Chờ duyệt", createdAt: "2026-05-09" },
    { code: "NV012", type: "Việc riêng",     from: "2026-05-19", to: "2026-05-20", days: 2, reason: "Dự đám cưới người thân ở quê",              status: "Chờ duyệt", createdAt: "2026-05-09" },
    // Phòng Nhân sự
    { code: "NV019", type: "Nghỉ phép năm", from: "2026-05-13", to: "2026-05-14", days: 2, reason: "Đưa con đi thi học kỳ",                    status: "Chờ duyệt", createdAt: "2026-05-08" },
    { code: "NV020", type: "Nghỉ bệnh",     from: "2026-05-15", to: "2026-05-16", days: 2, reason: "Đau răng, cần đi nha khoa",                 status: "Chờ duyệt", createdAt: "2026-05-09" },
    // Phòng Kế toán
    { code: "NV029", type: "Nghỉ phép năm", from: "2026-05-14", to: "2026-05-16", days: 3, reason: "Du lịch gia đình cuối tuần dài",            status: "Chờ duyệt", createdAt: "2026-05-08" },
    { code: "NV030", type: "Nghỉ bệnh",     from: "2026-05-19", to: "2026-05-19", days: 1, reason: "Đi tái khám bệnh viện",                     status: "Chờ duyệt", createdAt: "2026-05-09" },
    // Phòng Kinh doanh
    { code: "NV039", type: "Nghỉ phép năm", from: "2026-05-15", to: "2026-05-16", days: 2, reason: "Về quê thăm gia đình",                      status: "Chờ duyệt", createdAt: "2026-05-09" },
    { code: "NV040", type: "Việc riêng",     from: "2026-05-20", to: "2026-05-20", days: 1, reason: "Dọn nhà mới",                                status: "Chờ duyệt", createdAt: "2026-05-09" },
    // Phòng Marketing
    { code: "NV049", type: "Việc riêng",     from: "2026-05-16", to: "2026-05-16", days: 1, reason: "Nộp hồ sơ xin visa du lịch",                status: "Chờ duyệt", createdAt: "2026-05-09" },
    { code: "NV050", type: "Nghỉ phép năm", from: "2026-05-19", to: "2026-05-21", days: 3, reason: "Tham gia hội thảo cá nhân",                  status: "Chờ duyệt", createdAt: "2026-05-08" },
  ]

  const allLeaves = [...pastLeaves, ...recentApproved, ...pendingLeaves]
  let count = 0

  for (const lr of allLeaves) {
    const emp = byCode(lr.code)
    if (!emp) {
      console.log(`   ⚠️  Không tìm thấy ${lr.code}`)
      continue
    }

    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        leaveType: lr.type,
        startDate: new Date(lr.from),
        endDate: new Date(lr.to),
        totalDays: lr.days,
        reason: lr.reason,
        status: lr.status,
        createdAt: new Date(lr.createdAt + "T08:30:00+07:00"),
      },
    })
    count++
  }

  console.log(`   ✅ Đã tạo ${count} đơn nghỉ phép mới\n`)
  console.log("   📊 Chi tiết:")
  console.log(`      • ${pastLeaves.length} đơn đã duyệt/từ chối (tháng 4)`)
  console.log(`      • ${recentApproved.length} đơn đã duyệt (đầu tháng 5)`)
  console.log(`      • ${pendingLeaves.length} đơn chờ duyệt (giữa-cuối tháng 5)`)

  console.log("\n═══════════════════════════════════════════════════")
  console.log("✅ HOÀN THÀNH!")
  console.log("═══════════════════════════════════════════════════\n")
}

main()
  .catch(e => { console.error("❌ Lỗi:", e); process.exit(1) })
  .finally(() => { prisma.$disconnect(); pool.end() })
