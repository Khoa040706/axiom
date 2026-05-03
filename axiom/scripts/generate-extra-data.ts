/**
 * generate-extra-data.ts — Thêm đơn nghỉ phép + lịch sử công tác + công tác phí
 *
 * Mục đích: Bổ sung data cho các module phụ trợ để demo đầy đủ
 *
 * Cách chạy:
 *   npx tsx scripts/generate-extra-data.ts
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
  console.log("📋 AXIOM HRM — Generate Extra Data")
  console.log("   Đơn nghỉ phép + Lịch sử công tác + Công tác phí")
  console.log("═══════════════════════════════════════════════════\n")

  // Lấy tất cả NV theo code để mapping
  const employees = await prisma.employee.findMany({
    select: { id: true, code: true, fullName: true, departmentId: true },
    orderBy: { code: "asc" },
  })
  const byCode = (code: string) => employees.find(e => e.code === code)

  // ═══════════════════════════════════════════════════════════════
  // A. ĐƠN NGHỈ PHÉP "CHỜ DUYỆT" (~15 đơn)
  // ═══════════════════════════════════════════════════════════════
  console.log("🗓️  A. Tạo đơn nghỉ phép Chờ duyệt...\n")

  const leaveRequests = [
    // Phòng CNTT (NV010-012)
    { code: "NV010", type: "Nghỉ phép năm", from: "2026-05-12", to: "2026-05-13", days: 2, reason: "Xin nghỉ phép đi khám sức khỏe định kỳ" },
    { code: "NV011", type: "Nghỉ bệnh",     from: "2026-05-14", to: "2026-05-15", days: 2, reason: "Bị cảm sốt, cần nghỉ ngơi" },
    { code: "NV012", type: "Việc riêng",     from: "2026-05-19", to: "2026-05-20", days: 2, reason: "Dự đám cưới người thân ở quê" },
    // Phòng Nhân sự (NV019-021)
    { code: "NV019", type: "Nghỉ phép năm", from: "2026-05-13", to: "2026-05-14", days: 2, reason: "Đưa con đi thi học kỳ" },
    { code: "NV020", type: "Nghỉ bệnh",     from: "2026-05-15", to: "2026-05-16", days: 2, reason: "Đau răng, cần đi nha khoa" },
    { code: "NV021", type: "Việc riêng",     from: "2026-05-20", to: "2026-05-21", days: 2, reason: "Hoàn thành thủ tục giấy tờ cá nhân" },
    // Phòng Kế toán (NV029-031)
    { code: "NV029", type: "Nghỉ phép năm", from: "2026-05-14", to: "2026-05-16", days: 3, reason: "Du lịch gia đình cuối tuần dài" },
    { code: "NV030", type: "Nghỉ bệnh",     from: "2026-05-19", to: "2026-05-19", days: 1, reason: "Đi tái khám bệnh viện" },
    { code: "NV031", type: "Nghỉ phép năm", from: "2026-05-21", to: "2026-05-22", days: 2, reason: "Nghỉ phép cá nhân" },
    // Phòng Kinh doanh (NV039-041)
    { code: "NV039", type: "Nghỉ phép năm", from: "2026-05-15", to: "2026-05-16", days: 2, reason: "Về quê thăm gia đình" },
    { code: "NV040", type: "Việc riêng",     from: "2026-05-20", to: "2026-05-20", days: 1, reason: "Dọn nhà mới" },
    { code: "NV041", type: "Nghỉ bệnh",     from: "2026-05-22", to: "2026-05-23", days: 2, reason: "Bị đau dạ dày, cần nghỉ điều trị" },
    // Phòng Marketing (NV049-051)
    { code: "NV049", type: "Việc riêng",     from: "2026-05-16", to: "2026-05-16", days: 1, reason: "Nộp hồ sơ xin visa du lịch" },
    { code: "NV050", type: "Nghỉ phép năm", from: "2026-05-19", to: "2026-05-21", days: 3, reason: "Tham gia hội thảo cá nhân" },
    { code: "NV051", type: "Nghỉ bệnh",     from: "2026-05-22", to: "2026-05-23", days: 2, reason: "Bị sốt virus, xin nghỉ 2 ngày" },
  ]

  let leaveCount = 0
  for (const lr of leaveRequests) {
    const emp = byCode(lr.code)
    if (!emp) { console.log(`   ⚠️  Không tìm thấy ${lr.code}`); continue }

    // Kiểm tra đơn đã tồn tại chưa (tránh duplicate khi chạy lại)
    const existing = await prisma.leaveRequest.findFirst({
      where: { employeeId: emp.id, startDate: new Date(lr.from), leaveType: lr.type },
    })
    if (existing) { continue }

    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        leaveType: lr.type,
        startDate: new Date(lr.from),
        endDate: new Date(lr.to),
        totalDays: lr.days,
        reason: lr.reason,
        status: "Chờ duyệt",
      },
    })
    leaveCount++
  }
  console.log(`   ✅ ${leaveCount} đơn nghỉ phép "Chờ duyệt"\n`)

  // ═══════════════════════════════════════════════════════════════
  // B. LỊCH SỬ CÔNG TÁC (~20 sự kiện bổ sung)
  // ═══════════════════════════════════════════════════════════════
  console.log("📜 B. Tạo sự kiện lịch sử công tác...\n")

  const careerEvents: Array<{
    code: string; eventType: string; date: string; desc: string
    oldPos?: string; newPos?: string; oldDept?: string; newDept?: string
    oldSalary?: number; newSalary?: number
    rewardType?: string; rewardAmount?: number
    penaltyType?: string; decisionNumber?: string
  }> = [
    // ── Bổ nhiệm (4) ──
    { code: "NV004", eventType: "Bổ nhiệm", date: "2020-07-01",
      desc: "Bổ nhiệm Trưởng phòng CNTT theo QĐ số 15/QĐ-GĐ",
      oldPos: "Lập trình viên", newPos: "Trưởng phòng CNTT",
      decisionNumber: "15/QĐ-GĐ" },
    { code: "NV005", eventType: "Bổ nhiệm", date: "2021-01-01",
      desc: "Bổ nhiệm Trưởng phòng Nhân sự theo QĐ số 22/QĐ-GĐ",
      oldPos: "Chuyên viên nhân sự", newPos: "Trưởng phòng Nhân sự",
      decisionNumber: "22/QĐ-GĐ" },
    { code: "NV006", eventType: "Bổ nhiệm", date: "2020-10-01",
      desc: "Bổ nhiệm Trưởng phòng Kế toán theo QĐ số 18/QĐ-GĐ",
      oldPos: "Kế toán viên", newPos: "Trưởng phòng Kế toán",
      decisionNumber: "18/QĐ-GĐ" },
    { code: "NV007", eventType: "Bổ nhiệm", date: "2021-06-01",
      desc: "Bổ nhiệm Trưởng phòng Kinh doanh theo QĐ số 30/QĐ-GĐ",
      oldPos: "Nhân viên kinh doanh", newPos: "Trưởng phòng Kinh doanh",
      decisionNumber: "30/QĐ-GĐ" },

    // ── Thăng chức (4) ──
    { code: "NV010", eventType: "Thăng chức", date: "2024-07-01",
      desc: "Thăng chức Senior Developer dựa trên đánh giá xuất sắc H1/2024",
      oldPos: "Lập trình viên", newPos: "Lập trình viên Senior" },
    { code: "NV019", eventType: "Thăng chức", date: "2025-01-01",
      desc: "Thăng chức Chuyên viên chính sau 3 năm đánh giá tốt liên tiếp",
      oldPos: "Chuyên viên nhân sự", newPos: "Chuyên viên nhân sự chính" },
    { code: "NV039", eventType: "Thăng chức", date: "2024-10-01",
      desc: "Thăng chức Team Lead nhóm kinh doanh B2B",
      oldPos: "Nhân viên kinh doanh", newPos: "Team Lead Kinh doanh" },
    { code: "NV049", eventType: "Thăng chức", date: "2025-03-01",
      desc: "Thăng chức Senior Marketing sau chiến dịch Q4/2024 thành công",
      oldPos: "Chuyên viên Marketing", newPos: "Chuyên viên Marketing Senior" },

    // ── Điều chuyển (3) ──
    { code: "NV012", eventType: "Điều chuyển", date: "2024-04-01",
      desc: "Điều chuyển sang team DevOps để hỗ trợ dự án cloud migration",
      oldPos: "Lập trình viên", newPos: "Kỹ sư DevOps",
      oldDept: "Công nghệ thông tin", newDept: "Công nghệ thông tin" },
    { code: "NV022", eventType: "Điều chuyển", date: "2024-08-01",
      desc: "Chuyển từ nhóm tuyển dụng sang nhóm C&B",
      oldPos: "Chuyên viên tuyển dụng", newPos: "Chuyên viên nhân sự" },
    { code: "NV033", eventType: "Điều chuyển", date: "2025-02-01",
      desc: "Chuyển sang phụ trách mảng thuế TNCN",
      oldPos: "Kế toán viên", newPos: "Chuyên viên thuế" },

    // ── Điều chỉnh lương (4) ──
    { code: "NV001", eventType: "Điều chỉnh lương", date: "2025-07-01",
      desc: "Tăng lương theo lộ trình hàng năm cho Ban Giám đốc",
      oldSalary: 75_000_000, newSalary: 80_000_000 },
    { code: "NV002", eventType: "Điều chỉnh lương", date: "2025-07-01",
      desc: "Tăng lương theo lộ trình hàng năm cho Ban Giám đốc",
      oldSalary: 55_000_000, newSalary: 60_000_000 },
    { code: "NV005", eventType: "Điều chỉnh lương", date: "2024-01-01",
      desc: "Tăng lương sau khi đảm nhận Trưởng phòng NS 3 năm",
      oldSalary: 32_000_000, newSalary: 38_000_000 },
    { code: "NV010", eventType: "Điều chỉnh lương", date: "2024-07-01",
      desc: "Tăng lương theo thăng chức Senior Developer",
      oldSalary: 22_000_000, newSalary: 28_000_000 },

    // ── Khen thưởng (4) ──
    { code: "NV009", eventType: "Khen thưởng", date: "2024-12-31",
      desc: "Nhân viên xuất sắc năm 2024 — Phòng CNTT",
      rewardType: "Bằng khen + Tiền thưởng", rewardAmount: 5_000_000,
      decisionNumber: "88/QĐ-KT" },
    { code: "NV029", eventType: "Khen thưởng", date: "2024-12-31",
      desc: "Nhân viên xuất sắc năm 2024 — Phòng Kế toán",
      rewardType: "Giấy khen + Tiền thưởng", rewardAmount: 3_000_000,
      decisionNumber: "89/QĐ-KT" },
    { code: "NV048", eventType: "Khen thưởng", date: "2025-06-30",
      desc: "Hoàn thành xuất sắc chỉ tiêu KD H1/2025",
      rewardType: "Tiền thưởng", rewardAmount: 8_000_000,
      decisionNumber: "45/QĐ-KT" },
    { code: "NV052", eventType: "Khen thưởng", date: "2025-03-31",
      desc: "Thiết kế ấn phẩm truyền thông đạt giải cuộc thi sáng tạo",
      rewardType: "Bằng khen + Tiền thưởng", rewardAmount: 4_000_000,
      decisionNumber: "33/QĐ-KT" },

    // ── Kỷ luật (2) ──
    { code: "NV015", eventType: "Kỷ luật", date: "2024-09-15",
      desc: "Đi muộn quá 5 lần trong tháng 8/2024 — Nhắc nhở bằng văn bản",
      penaltyType: "Khiển trách",
      decisionNumber: "12/QĐ-KL" },
    { code: "NV045", eventType: "Kỷ luật", date: "2025-01-10",
      desc: "Vi phạm quy trình bảo mật thông tin khách hàng",
      penaltyType: "Cảnh cáo",
      decisionNumber: "05/QĐ-KL" },
  ]

  let careerCount = 0
  for (const ce of careerEvents) {
    const emp = byCode(ce.code)
    if (!emp) { console.log(`   ⚠️  Không tìm thấy ${ce.code}`); continue }

    // Kiểm tra duplicate
    const existing = await prisma.careerHistory.findFirst({
      where: { employeeId: emp.id, eventType: ce.eventType, eventDate: new Date(ce.date) },
    })
    if (existing) continue

    await prisma.careerHistory.create({
      data: {
        employeeId: emp.id,
        eventType: ce.eventType,
        eventDate: new Date(ce.date),
        description: ce.desc,
        decisionNumber: ce.decisionNumber,
        oldPosition: ce.oldPos,
        newPosition: ce.newPos,
        oldDepartment: ce.oldDept,
        newDepartment: ce.newDept,
        oldSalary: ce.oldSalary,
        newSalary: ce.newSalary,
        rewardType: ce.rewardType,
        rewardAmount: ce.rewardAmount,
        penaltyType: ce.penaltyType,
      },
    })
    careerCount++
  }
  console.log(`   ✅ ${careerCount} sự kiện lịch sử công tác\n`)

  // ═══════════════════════════════════════════════════════════════
  // C. CÔNG TÁC PHÍ BỔ SUNG (~5 chuyến)
  // ═══════════════════════════════════════════════════════════════
  console.log("✈️  C. Tạo chuyến công tác phí bổ sung...\n")

  const trips = [
    { code: "NV010", dest: "Đà Lạt",   from: "2026-05-15", to: "2026-05-17", purpose: "Khảo sát datacenter đối tác",  allow: 6_000_000,  status: "Chờ duyệt" },
    { code: "NV039", dest: "Cần Thơ",   from: "2026-05-20", to: "2026-05-22", purpose: "Gặp khách hàng khu vực ĐBSCL", allow: 5_000_000,  status: "Chờ duyệt" },
    { code: "NV049", dest: "Phú Quốc",  from: "2026-05-25", to: "2026-05-27", purpose: "Quay video quảng cáo sản phẩm", allow: 10_000_000, status: "Chờ duyệt" },
    { code: "NV019", dest: "Huế",       from: "2026-05-10", to: "2026-05-11", purpose: "Đào tạo quy trình nhân sự chi nhánh", allow: 4_000_000, status: "Đã duyệt" },
    { code: "NV029", dest: "Vũng Tàu",  from: "2026-05-08", to: "2026-05-09", purpose: "Kiểm toán chi nhánh miền Đông", allow: 3_500_000, status: "Đã duyệt" },
  ]

  let tripCount = 0
  for (const t of trips) {
    const emp = byCode(t.code)
    if (!emp) { console.log(`   ⚠️  Không tìm thấy ${t.code}`); continue }

    // Kiểm tra duplicate
    const existing = await prisma.businessTrip.findFirst({
      where: { employeeId: emp.id, destination: t.dest, startDate: new Date(t.from) },
    })
    if (existing) continue

    await prisma.businessTrip.create({
      data: {
        employeeId: emp.id,
        destination: t.dest,
        startDate: new Date(t.from),
        endDate: new Date(t.to),
        purpose: t.purpose,
        allowance: t.allow,
        status: t.status,
      },
    })
    tripCount++
  }
  console.log(`   ✅ ${tripCount} chuyến công tác phí\n`)

  // ═══════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════")
  console.log("✅ HOÀN THÀNH!")
  console.log(`   🗓️  ${leaveCount} đơn nghỉ phép`)
  console.log(`   📜 ${careerCount} sự kiện công tác`)
  console.log(`   ✈️  ${tripCount} chuyến công tác phí`)
  console.log("═══════════════════════════════════════════════════\n")
}

main()
  .catch(e => { console.error("❌ Lỗi:", e); process.exit(1) })
  .finally(() => { prisma.$disconnect(); pool.end() })
