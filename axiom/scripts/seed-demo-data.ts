/**
 * seed-demo-data.ts — Khởi tạo dữ liệu mẫu cho AXIOM HRM
 *
 * Cách chạy:
 *   npx tsx scripts/seed-demo-data.ts
 *
 * Dữ liệu tạo ra:
 *   5 phòng ban, 15+ chức vụ
 *   3 Ban Giám đốc (1 GĐ + 2 PGĐ)
 *   5 Trưởng phòng (1 / phòng ban)
 *   50 Nhân viên chính thức (10 / phòng ban)
 *   5 Nhân viên thử việc (1 / phòng ban)
 *   1 Admin (không tính nhân viên)
 *   Tổng: 63 nhân viên + 1 admin = 64 tài khoản
 *   Hợp đồng, chấm công T3/2026, nghỉ phép, cấu hình lương, lịch sử công tác, công tác phí
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@127.0.0.1:5432/axiom_hrm"
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ── Helpers ───────────────────────────────────────────────────
function workdaysOfMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function randomPhone() {
  return `09${Math.floor(10000000 + Math.random() * 89999999)}`
}

function randomDate(from: string, to: string) {
  const f = new Date(from).getTime()
  const t = new Date(to).getTime()
  return new Date(f + Math.random() * (t - f))
}

/** Tính ngày kết thúc HĐ hiện hành: luôn trong tương lai (sau 2026-03-31) */
function contractEndFrom(hireDate: Date | string, years: number): Date {
  // Lấy ngày hôm nay làm gốc để đảm bảo HĐ còn hiệu lực
  // (mô phỏng HĐ đã được gia hạn và đang chạy)
  const base = new Date("2026-03-31")
  const d = new Date(base)
  // Cộng thêm 1–3 năm từ bây giờ để HĐ còn thời hạn
  d.setFullYear(d.getFullYear() + years)
  // Thêm một chút ngẫu nhiên (0–6 tháng) cho đa dạng
  d.setMonth(d.getMonth() + Math.floor(Math.random() * 6))
  return d
}

function randomCCCD() {
  return `0790${Math.floor(10000000 + Math.random() * 89999999)}`
}

// ── Vietnamese name pools ─────────────────────────────────────
const HO_NAM = ["Nguyễn Văn", "Trần Đức", "Lê Minh", "Phạm Quang", "Hoàng Đức",
  "Vũ Thanh", "Đặng Quốc", "Bùi Xuân", "Đỗ Anh", "Ngô Hữu",
  "Dương Bảo", "Lý Trí", "Hồ Sỹ", "Tô Đình", "Phan Thành"]
const HO_NU = ["Nguyễn Thị", "Trần Thị", "Lê Thị", "Phạm Thu", "Hoàng Thị",
  "Vũ Thị", "Đặng Ngọc", "Bùi Thị", "Đỗ Thị", "Ngô Thị",
  "Dương Thị", "Lý Thị", "Hồ Thị", "Tô Thị", "Phan Thị"]
const TEN_NAM = ["An", "Bình", "Cường", "Dũng", "Hùng", "Khoa", "Long", "Minh",
  "Nam", "Phúc", "Quân", "Sơn", "Thắng", "Toàn", "Tuấn",
  "Việt", "Hải", "Đạt", "Kiên", "Trung", "Hoàng", "Tùng", "Hưng", "Khánh", "Nghĩa"]
const TEN_NU = ["Anh", "Bình", "Chi", "Dung", "Hà", "Hương", "Lan", "Mai",
  "Ngọc", "Phương", "Quỳnh", "Thảo", "Trang", "Vân", "Yến",
  "Linh", "Oanh", "My", "Trâm", "Hiền", "Nhung", "Hạnh", "Diệp", "Ly", "Giang"]
const ADDRESSES = [
  "123 Nguyễn Huệ, Quận 1, TP.HCM", "45 Lê Lợi, Quận 3, TP.HCM",
  "67 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM", "89 Trần Hưng Đạo, Quận 5, TP.HCM",
  "12 Phạm Văn Đồng, Gò Vấp, TP.HCM", "34 Cách Mạng Tháng 8, Quận 10, TP.HCM",
  "56 Hai Bà Trưng, Quận 1, TP.HCM", "78 Võ Văn Tần, Quận 3, TP.HCM",
  "90 Lý Thường Kiệt, Tân Bình, TP.HCM", "21 Phan Xích Long, Phú Nhuận, TP.HCM",
  "33 Nguyễn Đình Chiểu, Quận 3, TP.HCM", "15 Lê Văn Sỹ, Quận 3, TP.HCM",
  "44 Hoàng Diệu, Quận 4, TP.HCM", "66 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM",
  "88 Trường Sa, Bình Thạnh, TP.HCM",
]

let nameIdx = 0
function genName(gender: "Nam" | "Nữ") {
  const idx = nameIdx++
  if (gender === "Nam") {
    return `${HO_NAM[idx % HO_NAM.length]} ${TEN_NAM[idx % TEN_NAM.length]}`
  }
  return `${HO_NU[idx % HO_NU.length]} ${TEN_NU[idx % TEN_NU.length]}`
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log("🧹 XOÁ TOÀN BỘ DỮ LIỆU CŨ...\n")

  // Xoá theo thứ tự FK (con trước, cha sau)
  await prisma.payslip.deleteMany()
  await prisma.payroll.deleteMany()
  await prisma.businessTrip.deleteMany()
  await prisma.careerHistory.deleteMany()
  await prisma.leaveBalance.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.salaryConfig.deleteMany()
  await prisma.user.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
  console.log("   ✅ Đã xoá sạch tất cả bảng.\n")

  console.log("🌱 AXIOM HRM — Seed dữ liệu mới (63 NV + 1 Admin)...\n")

  // ═══════════════════════════════════════════════════════════════
  // 1. PHÒNG BAN (5)
  // ═══════════════════════════════════════════════════════════════
  console.log("📁 1. Tạo 5 phòng ban...")
  const DEPTS = [
    { name: "Công nghệ thông tin",  desc: "Phát triển phần mềm và hạ tầng IT" },
    { name: "Nhân sự",              desc: "Quản lý nhân sự, tuyển dụng, đào tạo" },
    { name: "Kế toán - Tài chính",  desc: "Kế toán, tài chính, thuế" },
    { name: "Kinh doanh",           desc: "Phát triển kinh doanh và khách hàng" },
    { name: "Marketing",            desc: "Truyền thông, digital marketing" },
  ]
  const depts = await Promise.all(
    DEPTS.map(d => prisma.department.create({ data: { name: d.name, description: d.desc } }))
  )

  // ═══════════════════════════════════════════════════════════════
  // 2. CHỨC VỤ (15+)
  // ═══════════════════════════════════════════════════════════════
  console.log("💼 2. Tạo chức vụ...")
  const POS_DATA = [
    // Ban Giám đốc
    { name: "Giám đốc",              desc: "Tổng giám đốc công ty" },
    { name: "Phó Giám đốc",          desc: "Phó Tổng giám đốc" },
    // Trưởng phòng
    { name: "Trưởng phòng CNTT",     desc: "Quản lý phòng Công nghệ thông tin" },
    { name: "Trưởng phòng Nhân sự",  desc: "Quản lý phòng Nhân sự" },
    { name: "Trưởng phòng Kế toán",  desc: "Kế toán trưởng" },
    { name: "Trưởng phòng Kinh doanh", desc: "Quản lý phòng Kinh doanh" },
    { name: "Trưởng phòng Marketing", desc: "Quản lý phòng Marketing" },
    // Nhân viên per dept
    { name: "Lập trình viên",        desc: "Phát triển phần mềm" },
    { name: "Kỹ sư DevOps",          desc: "Quản trị hạ tầng, CI/CD" },
    { name: "Tester / QA",           desc: "Kiểm thử chất lượng phần mềm" },
    { name: "Chuyên viên nhân sự",   desc: "Xử lý nghiệp vụ nhân sự" },
    { name: "Chuyên viên tuyển dụng", desc: "Tuyển dụng nhân sự mới" },
    { name: "Kế toán viên",          desc: "Xử lý nghiệp vụ kế toán" },
    { name: "Chuyên viên thuế",      desc: "Xử lý thuế TNCN, BHXH" },
    { name: "Nhân viên kinh doanh",  desc: "Phát triển khách hàng" },
    { name: "Chuyên viên CSKH",      desc: "Chăm sóc khách hàng" },
    { name: "Chuyên viên Marketing", desc: "Digital marketing, content" },
    { name: "Thiết kế đồ họa",       desc: "Thiết kế UI/UX, đồ họa" },
    { name: "Thực tập sinh",         desc: "Nhân viên thử việc / thực tập" },
  ]
  const positions = await Promise.all(
    POS_DATA.map(p => prisma.position.create({ data: { name: p.name, description: p.desc } }))
  )
  const posMap: Record<string, typeof positions[0]> = {}
  positions.forEach(p => { posMap[p.name] = p })

  // ═══════════════════════════════════════════════════════════════
  // 3. NHÂN VIÊN (63 người)
  // ═══════════════════════════════════════════════════════════════
  console.log("👥 3. Tạo 63 nhân viên...")

  const allEmployees: Array<{
    emp: any
    salary: number
    allowance: number
    contractType: string
    contractEnd: Date | null
    role: string  // for user account
    deptName: string
  }> = []

  let empCode = 1
  function nextCode() { return `NV${String(empCode++).padStart(3, "0")}` }

  // ── 3a. Ban Giám đốc (3 người) ───────────────────────────────
  // GĐ — không thuộc phòng ban cụ thể, gán vào dept đầu tiên
  const bgd = [
    { pos: "Giám đốc",     role: "Director",  salary: 80_000_000, allowance: 15_000_000, gender: "Nam" as const,
      dob: "1975-03-15", hire: "2015-01-01", dep: 0, taxCode: "8001234500", deps: 2 },
    { pos: "Phó Giám đốc", role: "Director",  salary: 60_000_000, allowance: 10_000_000, gender: "Nam" as const,
      dob: "1978-07-22", hire: "2016-06-01", dep: 1, taxCode: "8002345600", deps: 1 },
    { pos: "Phó Giám đốc", role: "Director",  salary: 60_000_000, allowance: 10_000_000, gender: "Nữ" as const,
      dob: "1980-11-08", hire: "2017-03-15", dep: 2, taxCode: "8003456700", deps: 2 },
  ]

  for (const b of bgd) {
    const code = nextCode()
    const name = genName(b.gender)
    const emp = await prisma.employee.create({
      data: {
        code, fullName: name, gender: b.gender,
        dateOfBirth: new Date(b.dob), idNumber: randomCCCD(),
        phone: randomPhone(), email: `${code.toLowerCase()}@axiom.vn`,
        address: ADDRESSES[empCode % ADDRESSES.length],
        departmentId: depts[b.dep].id, positionId: posMap[b.pos].id,
        hireDate: new Date(b.hire), status: "Đang làm",
        taxCode: b.taxCode, numDependents: b.deps,
      },
    })
    allEmployees.push({
      emp, salary: b.salary, allowance: b.allowance,
      contractType: "Chính thức", contractEnd: contractEndFrom(b.hire, 3),
      role: b.role, deptName: DEPTS[b.dep].name,
    })
  }

  // ── 3b. Trưởng phòng (5 người, 1 / dept) ─────────────────────
  const headPositions = [
    "Trưởng phòng CNTT", "Trưởng phòng Nhân sự", "Trưởng phòng Kế toán",
    "Trưởng phòng Kinh doanh", "Trưởng phòng Marketing",
  ]
  const headRoles = ["Manager", "HRManager", "Accountant", "Manager", "Manager"]
  const headSalaries = [40_000_000, 38_000_000, 38_000_000, 40_000_000, 38_000_000]

  for (let i = 0; i < 5; i++) {
    const code = nextCode()
    const gender = i % 2 === 0 ? "Nam" : "Nữ" as const
    const name = genName(gender)
    const emp = await prisma.employee.create({
      data: {
        code, fullName: name, gender,
        dateOfBirth: randomDate("1980-01-01", "1990-12-31"),
        idNumber: randomCCCD(),
        phone: randomPhone(), email: `${code.toLowerCase()}@axiom.vn`,
        address: ADDRESSES[empCode % ADDRESSES.length],
        departmentId: depts[i].id, positionId: posMap[headPositions[i]].id,
        hireDate: randomDate("2018-01-01", "2021-06-30"),
        status: "Đang làm",
        taxCode: `900${i}${Math.floor(100000 + Math.random() * 899999)}`,
        numDependents: Math.floor(Math.random() * 3),
      },
    })
    allEmployees.push({
      emp, salary: headSalaries[i], allowance: 5_000_000,
      contractType: "Chính thức", contractEnd: contractEndFrom(emp.hireDate, 2),
      role: headRoles[i], deptName: DEPTS[i].name,
    })
  }

  // ── 3c. Nhân viên chính thức (10 người / dept = 50) ───────────
  // Vị trí cho từng phòng ban
  const deptStaffPositions: string[][] = [
    // IT
    ["Lập trình viên", "Lập trình viên", "Lập trình viên", "Lập trình viên",
     "Kỹ sư DevOps", "Kỹ sư DevOps", "Tester / QA", "Tester / QA",
     "Lập trình viên", "Lập trình viên"],
    // HR
    ["Chuyên viên nhân sự", "Chuyên viên nhân sự", "Chuyên viên nhân sự",
     "Chuyên viên tuyển dụng", "Chuyên viên tuyển dụng", "Chuyên viên nhân sự",
     "Chuyên viên nhân sự", "Chuyên viên tuyển dụng", "Chuyên viên nhân sự",
     "Chuyên viên nhân sự"],
    // Accounting
    ["Kế toán viên", "Kế toán viên", "Kế toán viên", "Kế toán viên",
     "Chuyên viên thuế", "Chuyên viên thuế", "Kế toán viên",
     "Kế toán viên", "Chuyên viên thuế", "Kế toán viên"],
    // Sales
    ["Nhân viên kinh doanh", "Nhân viên kinh doanh", "Nhân viên kinh doanh",
     "Nhân viên kinh doanh", "Nhân viên kinh doanh", "Chuyên viên CSKH",
     "Chuyên viên CSKH", "Nhân viên kinh doanh", "Nhân viên kinh doanh",
     "Chuyên viên CSKH"],
    // Marketing
    ["Chuyên viên Marketing", "Chuyên viên Marketing", "Chuyên viên Marketing",
     "Thiết kế đồ họa", "Thiết kế đồ họa", "Chuyên viên Marketing",
     "Chuyên viên Marketing", "Thiết kế đồ họa", "Chuyên viên Marketing",
     "Chuyên viên Marketing"],
  ]
  const deptSalaryRange: [number, number][] = [
    [18_000_000, 30_000_000],  // IT
    [14_000_000, 22_000_000],  // HR
    [15_000_000, 25_000_000],  // Accounting
    [12_000_000, 28_000_000],  // Sales
    [13_000_000, 24_000_000],  // Marketing
  ]

  for (let d = 0; d < 5; d++) {
    for (let s = 0; s < 10; s++) {
      const code = nextCode()
      const gender = (d + s) % 3 === 0 ? "Nữ" : "Nam" as const
      // Tài khoản nhanvien/nhanvien — dùng tên thật
      const name = (d === 0 && s === 0) ? "Hoàng Thái Đăng Khoa" : genName(gender)
      const [minS, maxS] = deptSalaryRange[d]
      const salary = Math.round((minS + Math.random() * (maxS - minS)) / 500_000) * 500_000
      const allowance = Math.round((1_000_000 + Math.random() * 3_000_000) / 500_000) * 500_000

      const emp = await prisma.employee.create({
        data: {
          code, fullName: name, gender,
          dateOfBirth: randomDate("1990-01-01", "2000-12-31"),
          idNumber: randomCCCD(),
          phone: randomPhone(), email: `${code.toLowerCase()}@axiom.vn`,
          address: ADDRESSES[(empCode + s) % ADDRESSES.length],
          departmentId: depts[d].id, positionId: posMap[deptStaffPositions[d][s]].id,
          hireDate: randomDate("2021-01-01", "2025-06-30"),
          status: "Đang làm",
          taxCode: s < 7 ? `70${d}${s}${Math.floor(100000 + Math.random() * 899999)}` : "",
          numDependents: Math.floor(Math.random() * 4),
        },
      })
      allEmployees.push({
        emp, salary, allowance,
        contractType: "Chính thức",
        contractEnd: contractEndFrom(emp.hireDate, 1 + Math.floor(Math.random() * 3)), // 1–3 năm
        role: "Employee", deptName: DEPTS[d].name,
      })
    }
  }

  // ── 3d. Nhân viên thử việc (1 / dept = 5) ────────────────────
  for (let d = 0; d < 5; d++) {
    const code = nextCode()
    const gender = d % 2 === 0 ? "Nữ" : "Nam" as const
    const name = genName(gender)

    const emp = await prisma.employee.create({
      data: {
        code, fullName: name, gender,
        dateOfBirth: randomDate("1998-01-01", "2003-12-31"),
        idNumber: randomCCCD(),
        phone: randomPhone(), email: `${code.toLowerCase()}@axiom.vn`,
        address: ADDRESSES[(empCode + d) % ADDRESSES.length],
        departmentId: depts[d].id, positionId: posMap["Thực tập sinh"].id,
        hireDate: randomDate("2026-01-01", "2026-03-01"),
        status: "Thử việc",
        taxCode: "", numDependents: 0,
      },
    })
    allEmployees.push({
      emp, salary: 8_000_000, allowance: 500_000,
      contractType: "Thử việc", contractEnd: new Date("2026-05-31"),
      role: "Employee", deptName: DEPTS[d].name,
    })
  }

  console.log(`   ✅ Tổng: ${allEmployees.length} nhân viên\n`)

  // ═══════════════════════════════════════════════════════════════
  // 4. TÀI KHOẢN HỆ THỐNG
  // ═══════════════════════════════════════════════════════════════
  console.log("🔐 4. Tạo tài khoản đăng nhập...")
  const hash = await bcrypt.hash("123456", 10)
  const adminHash    = await bcrypt.hash("admin",    10)
  const giamdocHash  = await bcrypt.hash("giamdoc",  10)
  const nhansuHash   = await bcrypt.hash("nhansu",   10)
  const ketoanHash   = await bcrypt.hash("ketoan",   10)
  const quanlyHash   = await bcrypt.hash("quanly",   10)
  const nhanvienHash = await bcrypt.hash("nhanvien", 10)

  // 1 Admin (không gắn nhân viên, exempt khỏi yêu cầu personalEmail)
  await prisma.user.create({
    data: { username: "admin", passwordHash: adminHash, role: "Admin" },
  })

  // Ban Giám đốc
  await prisma.user.create({
    data: { username: "giamdoc", passwordHash: giamdocHash,
            role: "Director", employeeId: allEmployees[0].emp.id,
            personalEmail: "giamdoc@gmail.com" },
  })
  await prisma.user.create({
    data: { username: "pgd1", passwordHash: hash,
            role: "Director", employeeId: allEmployees[1].emp.id },
  })
  await prisma.user.create({
    data: { username: "pgd2", passwordHash: hash,
            role: "Director", employeeId: allEmployees[2].emp.id },
  })

  // Trưởng phòng (index 3–7)
  // quanly = TP CNTT (Manager), nhansu = TP Nhân sự (HRManager), ketoan = TP Kế toán (Accountant)
  const headUsernames    = ["quanly",         "nhansu",         "ketoan",         "tp_kinhdoanh", "tp_marketing"]
  const headPassHashes   = [quanlyHash,        nhansuHash,       ketoanHash,       hash,            hash          ]
  const headPersonalMail = ["quanly@gmail.com","nhansu@gmail.com","ketoan@gmail.com", null,           null          ]
  for (let i = 0; i < 5; i++) {
    await prisma.user.create({
      data: {
        username:     headUsernames[i],
        passwordHash: headPassHashes[i],
        role:         allEmployees[3 + i].role,
        employeeId:   allEmployees[3 + i].emp.id,
        ...(headPersonalMail[i] ? { personalEmail: headPersonalMail[i]! } : {}),
      },
    })
  }

  // Nhân viên (index 8 đến cuối)
  // — Tài khoản đầu tiên (NV009) = nhanvien / nhanvien có personalEmail sẵn (demo)
  // — Các tài khoản còn lại: không có personalEmail → được yêu cầu thiết lập khi login lần đầu
  for (let i = 8; i < allEmployees.length; i++) {
    const isFirstEmp = i === 8
    await prisma.user.create({
      data: {
        username:     isFirstEmp ? "nhanvien" : allEmployees[i].emp.code.toLowerCase(),
        passwordHash: isFirstEmp ? nhanvienHash : hash,
        role:         allEmployees[i].role,
        employeeId:   allEmployees[i].emp.id,
        ...(isFirstEmp ? { personalEmail: "dangkhoa040706@gmail.com" } : {}),
      },
    })
  }
  console.log(`   ✅ ${allEmployees.length + 1} tài khoản (1 admin + ${allEmployees.length} NV)\n`)

  // ═══════════════════════════════════════════════════════════════
  // 5. HỢP ĐỒNG LAO ĐỘNG
  // ═══════════════════════════════════════════════════════════════
  console.log("📝 5. Tạo hợp đồng lao động...")
  for (const item of allEmployees) {
    await prisma.contract.create({
      data: {
        employeeId:   item.emp.id,
        contractType: item.contractType,
        startDate:    item.emp.hireDate,
        endDate:      item.contractEnd,
        baseSalary:   item.salary,
        salaryGrade:  1.0,
        allowance:    item.allowance,
        status:       "Hiệu lực",
      },
    })
  }
  console.log(`   ✅ ${allEmployees.length} hợp đồng\n`)

  // ═══════════════════════════════════════════════════════════════
  // 6. CHẤM CÔNG THÁNG 3/2026
  // ═══════════════════════════════════════════════════════════════
  console.log("⏰ 6. Tạo dữ liệu chấm công tháng 3/2026...")
  const workDays = workdaysOfMonth(2026, 3) // 22 ngày
  let totalAttendance = 0

  for (const item of allEmployees) {
    // Thử việc chỉ đi 15-18 ngày, chính thức 19-22
    const maxDays = item.contractType === "Thử việc"
      ? 15 + Math.floor(Math.random() * 4)
      : 19 + Math.floor(Math.random() * 4)
    const take = Math.min(maxDays, workDays.length)
    const lateCount = Math.floor(Math.random() * 3) // 0-2 lần muộn
    const otDays = Math.floor(Math.random() * 4)     // 0-3 ngày OT

    for (let i = 0; i < take; i++) {
      const workDate = workDays[i]
      const isLate = i < lateCount
      const isOt = i < otDays
      const checkIn = new Date(workDate)
      checkIn.setHours(isLate ? 8 : 8, isLate ? (10 + Math.floor(Math.random() * 30)) : 0, 0, 0)
      const otHours = isOt ? (1 + Math.floor(Math.random() * 3)) : 0
      const checkOut = new Date(workDate)
      checkOut.setHours(17 + otHours, Math.floor(Math.random() * 30), 0, 0)

      await prisma.attendance.create({
        data: {
          employeeId: item.emp.id,
          workDate,
          checkIn,
          checkOut,
          status: "Đi làm",
          otHours,
          lateMinutes: isLate ? (10 + Math.floor(Math.random() * 30)) : 0,
          earlyMinutes: 0,
        },
      })
      totalAttendance++
    }
  }
  console.log(`   ✅ ${totalAttendance} records chấm công\n`)

  // ═══════════════════════════════════════════════════════════════
  // 7. QUỸ NGHỈ PHÉP 2026
  // ═══════════════════════════════════════════════════════════════
  console.log("📅 7. Tạo quỹ nghỉ phép 2026...")
  for (const item of allEmployees) {
    const total = item.contractType === "Thử việc" ? 6 : 15
    const used = Math.floor(Math.random() * Math.min(8, total))
    await prisma.leaveBalance.create({
      data: {
        employeeId: item.emp.id, year: 2026,
        leaveType: "Nghỉ năm", totalDays: total, usedDays: used,
      } as any,
    })
  }
  console.log("   ✅ Quỹ nghỉ phép 63 nhân viên\n")

  // ═══════════════════════════════════════════════════════════════
  // 8. ĐƠN NGHỈ PHÉP MẪU (8 đơn)
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 8. Tạo đơn nghỉ phép mẫu...")
  const leaveTypes = ["Nghỉ phép năm", "Nghỉ bệnh", "Việc riêng"]
  const leaveStatuses = ["Chờ duyệt", "Chờ duyệt", "Đã duyệt", "Đã duyệt", "Từ chối", "Chờ duyệt", "Chờ duyệt", "Đã duyệt"]
  // Ngày nghỉ trải từ tháng 4 → tháng 5/2026 — hợp lý với thời điểm hiện tại
  const leaveStartDates = [
    new Date(2026, 3, 7),   // 07/04/2026
    new Date(2026, 3, 14),  // 14/04/2026
    new Date(2026, 3, 21),  // 21/04/2026
    new Date(2026, 3, 28),  // 28/04/2026
    new Date(2026, 4, 5),   // 05/05/2026
    new Date(2026, 4, 12),  // 12/05/2026
    new Date(2026, 4, 15),  // 15/05/2026
    new Date(2026, 4, 19),  // 19/05/2026
  ]
  for (let i = 0; i < 8; i++) {
    const empItem = allEmployees[8 + (i * 5) % 50]
    const startDate = leaveStartDates[i]
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1 + Math.floor(Math.random() * 2))
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
    // Ngày nộp đơn = 3-5 ngày trước ngày nghỉ
    const createdAt = new Date(startDate)
    createdAt.setDate(createdAt.getDate() - 3 - Math.floor(Math.random() * 3))
    await prisma.leaveRequest.create({
      data: {
        employeeId: empItem.emp.id,
        leaveType:  leaveTypes[i % leaveTypes.length],
        startDate,
        endDate,
        totalDays,
        reason: `Đơn nghỉ phép mẫu #${i + 1}`,
        status: leaveStatuses[i],
        createdAt,
      },
    })
  }
  console.log("   ✅ 8 đơn nghỉ phép\n")

  // ═══════════════════════════════════════════════════════════════
  // 9. CẤU HÌNH LƯƠNG
  // ═══════════════════════════════════════════════════════════════
  console.log("⚙️  9. Cấu hình lương VN 2026...")
  const configs = [
    { key: "BHXH_RATE",           value: 0.08,         desc: "Tỷ lệ BHXH NLĐ đóng (8%)" },
    { key: "BHYT_RATE",           value: 0.015,        desc: "Tỷ lệ BHYT NLĐ đóng (1.5%)" },
    { key: "BHTN_RATE",           value: 0.01,         desc: "Tỷ lệ BHTN NLĐ đóng (1%)" },
    { key: "PERSONAL_DEDUCTION",  value: 15_500_000,   desc: "Giảm trừ bản thân (VN 2026)" },
    { key: "DEPENDENT_DEDUCTION", value: 6_200_000,    desc: "Giảm trừ người phụ thuộc (VN 2026)" },
    { key: "STANDARD_WORK_DAYS",  value: 26,           desc: "Số ngày làm việc chuẩn/tháng" },
    { key: "OT_RATE_WEEKDAY",     value: 1.5,          desc: "Hệ số OT ngày thường (150%)" },
  ]
  for (const c of configs) {
    await prisma.salaryConfig.create({
      data: { configKey: c.key, configValue: c.value, description: c.desc },
    })
  }
  console.log("   ✅ 7 tham số cấu hình lương\n")

  // ═══════════════════════════════════════════════════════════════
  // 10. LỊCH SỬ CÔNG TÁC MẪU
  // ═══════════════════════════════════════════════════════════════
  console.log("📜 10. Tạo lịch sử công tác mẫu...")
  const careerEvents: Array<{ empIdx: number; eventType: string; date: string; desc: string; oldPos?: string; newPos?: string }> = [
    { empIdx: 3,  eventType: "Thăng chức",      date: "2020-07-01", desc: "Đánh giá xuất sắc Q2/2020", oldPos: "Lập trình viên",      newPos: "Trưởng phòng CNTT" },
    { empIdx: 4,  eventType: "Bổ nhiệm",         date: "2021-01-01", desc: "Quyết định bổ nhiệm TP Nhân sự", oldPos: "Chuyên viên nhân sự", newPos: "Trưởng phòng Nhân sự" },
    { empIdx: 8,  eventType: "Khen thưởng",      date: "2023-12-31", desc: "Nhân viên xuất sắc năm 2023" },
    { empIdx: 28, eventType: "Điều chuyển",      date: "2024-01-01", desc: "Chuyển sang phụ trách thuế",  oldPos: "Kế toán viên",         newPos: "Chuyên viên thuế" },
    { empIdx: 0,  eventType: "Điều chỉnh lương", date: "2024-07-01", desc: "Tăng lương theo lộ trình 2024" },
    { empIdx: 3,  eventType: "Khen thưởng",      date: "2024-12-31", desc: "Trưởng phòng xuất sắc năm 2024" },
    { empIdx: 18, eventType: "Thăng chức",       date: "2025-03-01", desc: "Thăng lên chuyên viên chính",  oldPos: "Chuyên viên nhân sự", newPos: "Chuyên viên nhân sự" },
  ]
  for (const ce of careerEvents) {
    await prisma.careerHistory.create({
      data: {
        employeeId: allEmployees[ce.empIdx].emp.id,
        eventType:  ce.eventType,
        eventDate:  new Date(ce.date),
        description: ce.desc,
        oldPosition: ce.oldPos,
        newPosition: ce.newPos,
      },
    })
  }
  console.log(`   ✅ ${careerEvents.length} sự kiện công tác\n`)

  // ═══════════════════════════════════════════════════════════════
  // 11. CÔNG TÁC PHÍ MẪU
  // ═══════════════════════════════════════════════════════════════
  console.log("✈️  11. Tạo chuyến công tác mẫu...")
  const trips = [
    { empIdx: 0,  dest: "Hà Nội",         from: "2026-04-10", to: "2026-04-12", purpose: "Họp hội đồng quản trị",     allow: 15_000_000, status: "Đã duyệt" },
    { empIdx: 3,  dest: "Đà Nẵng",        from: "2026-04-15", to: "2026-04-17", purpose: "Hội thảo công nghệ",        allow: 8_000_000,  status: "Đã duyệt" },
    { empIdx: 4,  dest: "Nha Trang",       from: "2026-04-20", to: "2026-04-22", purpose: "Team building",             allow: 12_000_000, status: "Chờ duyệt" },
    { empIdx: 8,  dest: "Singapore",       from: "2026-05-05", to: "2026-05-08", purpose: "Triển khai hệ thống",       allow: 25_000_000, status: "Chờ duyệt" },
    { empIdx: 38, dest: "Hải Phòng",       from: "2026-04-25", to: "2026-04-26", purpose: "Khảo sát thị trường",       allow: 4_000_000,  status: "Chờ duyệt" },
    { empIdx: 48, dest: "TP. Hồ Chí Minh", from: "2026-04-28", to: "2026-04-30", purpose: "Chiến dịch quảng cáo Q2",  allow: 6_000_000,  status: "Đã duyệt" },
  ]
  for (const t of trips) {
    await prisma.businessTrip.create({
      data: {
        employeeId: allEmployees[t.empIdx].emp.id,
        destination: t.dest,
        startDate: new Date(t.from),
        endDate:   new Date(t.to),
        purpose:   t.purpose,
        allowance: t.allow,
        status:    t.status,
      },
    })
  }
  console.log(`   ✅ ${trips.length} chuyến công tác\n`)

  // ═══════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════")
  console.log("✅ SEED HOÀN THÀNH!")
  console.log("═══════════════════════════════════════════════════")
  console.log(`
📊 Tổng kết:
   🏢 5 phòng ban  |  💼 ${POS_DATA.length} chức vụ
   👔 3 Ban GĐ (1 GĐ + 2 PGĐ)
   👨‍💼 5 Trưởng phòng
   👥 50 NV chính thức (10/phòng ban)
   🧑‍🎓 5 NV thử việc (1/phòng ban)
   📝 ${allEmployees.length} hợp đồng
   ⏰ ${totalAttendance} records chấm công T3/2026
   📅 63 quỹ nghỉ phép | 📋 8 đơn nghỉ phép
   📜 ${careerEvents.length} sự kiện công tác | ✈️ ${trips.length} chuyến CT

📌 TÀI KHOẢN ĐĂNG NHẬP:
   ┌────────────────┬────────────┬──────────────┬──────────────────────┐
   │ Username       │ Mật khẩu   │ Role         │ Dashboard            │
   ├────────────────┼────────────┼──────────────┼──────────────────────┤
   │ admin          │ admin      │ Admin        │ /dashboard           │
   │ giamdoc        │ giamdoc    │ Director     │ /dashboard-director  │
   │ pgd1           │ 123456     │ Director     │ /dashboard-director  │
   │ pgd2           │ 123456     │ Director     │ /dashboard-director  │
   │ quanly         │ quanly     │ Manager      │ /dashboard-manager   │
   │ nhansu         │ nhansu     │ HRManager    │ /dashboard-hr        │
   │ ketoan         │ ketoan     │ Accountant   │ /dashboard-accountant│
   │ tp_kinhdoanh   │ 123456     │ Manager      │ /dashboard-manager   │
   │ tp_marketing   │ 123456     │ Manager      │ /dashboard-manager   │
   │ nhanvien       │ nhanvien   │ Employee     │ /dashboard-employee  │
   │ nv010..nv063   │ 123456     │ Employee     │ /dashboard-employee  │
   └────────────────┴────────────┴──────────────┴──────────────────────┘

⚠️  SAU KHI SEED, NHỚ CHẠY:
   npx tsx scripts/generate-payroll.ts --month=3 --year=2026
`)
}

main()
  .catch((e) => { console.error("❌ Lỗi seed:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
