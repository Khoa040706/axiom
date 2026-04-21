# 📦 Tóm Tắt Toàn Bộ Dự Án — AXIOM HRM & Payroll System

> **Nhóm:** 52400017 · 52400133 · 52400004
> **Môn học:** Đồ án Công nghệ Phần mềm — TDTU
> **Ngày cập nhật:** 15/04/2026

---

## 1. Tổng quan dự án

**AXIOM** (viết tắt từ "Tiên đề — sự chính xác tuyệt đối") là một hệ thống **Quản lý Nhân sự và Tiền lương** (HRM & Payroll) toàn diện xây dựng trên nền tảng **Web Application** hiện đại. Hệ thống quản lý xuyên suốt vòng đời nhân viên: từ ký hợp đồng, chấm công hàng ngày, quản lý nghỉ phép, đến tính lương tự động theo đúng quy định pháp luật Việt Nam.

### Mục tiêu cốt lõi

| Mục tiêu | Mô tả |
|---|---|
| Centralized Data | Tập trung hóa toàn bộ dữ liệu nhân sự |
| Tự động hóa 90% | Giảm thao tác thủ công trong tính lương |
| Bảo mật RBAC | Phân quyền chi tiết theo 6 vai trò |
| Dashboard Real-time | Báo cáo trực quan cho ban lãnh đạo |

### Số liệu codebase (15/04/2026)

| Metric | Giá trị |
|---|---|
| Tổng source files (`.ts` + `.tsx`) | **114 files** |
| Tổng source code size | **~1015 KB** |
| Tổng page files (`page.tsx`) | **31** |
| API route files (`route.ts`) | **8** |
| Layout files (`layout.tsx`) | **3** |
| Database models (Prisma) | **13 bảng** |
| Database migrations | **2** |
| Service files | **10** |
| Server Action files | **11** |
| Zod Validator schemas | **5** |
| Custom React Hooks | **5** |
| Helper / Utility files | **6** (`payroll-calculator`, `format-helpers`, `serialize`, `search`, `utils`, `i18n-maps`) |
| RBAC roles | **6** |
| Demo employees + accounts | **63 NV + 64 TK** |

---

## 2. Tech Stack

### Framework chính

| Công nghệ | Phiên bản (package.json) | Vai trò |
|---|---|---|
| **Next.js** | `16.2.1` | Full-stack React framework (App Router + Server Actions) |
| **React** | `19.2.4` | UI Library với Server Components & Suspense |
| **TypeScript** | `^5` | Ngôn ngữ chính — Type-safe toàn codebase |

### Frontend UI

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Tailwind CSS** | `^4` | Utility-first CSS framework |
| **Lucide React** | `^1.7.0` | Icon library (~1500 icons SVG) |
| **Recharts** | `^3.8.1` | Dashboard charts (Bar, Line, Pie, Area) |
| **React Hook Form** | `^7.72.0` | Quản lý form phức tạp |
| **Zod** | `^4.3.6` | Schema validation client + server |
| **class-variance-authority** | `^0.7.1` | Variant-based component styling |
| **clsx + tailwind-merge** | latest | Conditional className merging |
| **sonner** | `^2.0.7` | Toast notifications |
| **nuqs** | `^2.8.9` | Type-safe URL search params |

### Backend & Database

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Next.js Server Actions** | built-in | Server-side mutations |
| **Prisma ORM** | `^7.6.0` | Type-safe DB access, migrations |
| **@prisma/adapter-pg** | `^7.6.0` | Prisma 7 driver adapter cho pg |
| **PostgreSQL** | `17.x` | Primary relational database |
| **NextAuth.js** | `^5.0.0-beta.30` | Authentication + JWT session |
| **bcryptjs** | `^3.0.3` | Password hashing |
| **pg** | `^8.20.0` | PostgreSQL Node.js client |
| **nodemailer** | `^8.0.4` | Gửi email (forgot password → Gmail) |

### Export & Utilities

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **date-fns** | `^4.1.0` | Xử lý date/time |
| **@react-pdf/renderer** | `^4.3.2` | Xuất phiếu lương PDF |
| **exceljs** | `^4.4.0` | Export báo cáo Excel (primary) |
| **xlsx** | `^0.18.5` | Excel fallback |
| **Docker + Docker Compose** | — | Containerize PostgreSQL |

---

## 3. Kiến trúc hệ thống (3 lớp + Edge Middleware)

```
Client (Browser)
    │ HTTPS
Next.js 16 Server
    ├── Edge Middleware  (src/middleware.ts)     → Auth guard + Email setup redirect
    │       └── auth.config.ts                  → Edge-safe NextAuth (KHÔNG bcrypt)
    ├── App Router      (src/app/)              → Pages (31 page.tsx)
    ├── Server Actions  (src/lib/actions/)      → Mutations (11 files)
    └── API Routes      (src/app/api/)          → REST endpoints (8 route.ts)
         │
    SERVICE LAYER (src/lib/services/)           ← Lớp BLL (10 files)
         │
    PRISMA ORM + @prisma/adapter-pg             ← Lớp DAL
         │ TCP/5432
PostgreSQL 17 Database (Docker container)
```

| Lớp | Thư mục | Vai trò |
|---|---|---|
| **Presentation** | `src/app/` | React Server/Client Components |
| **Business Logic** | `src/lib/services/` | Service functions — xử lý nghiệp vụ |
| **Data Access** | `prisma/schema.prisma` | Prisma ORM + Schema (13 models) |

> **Lưu ý Prisma 7:** Dùng driver adapter pattern — `PrismaPg` + `Pool` từ `pg`.
> URL kết nối không khai báo trong `schema.prisma`, chỉ cấu hình qua `prisma.config.ts`.

> **Edge Middleware Pattern:** `middleware.ts` import `auth.config.ts` (không bcrypt) → chạy được trên Edge Runtime. `auth.ts` import `auth.config.ts` + bcryptjs → chỉ dùng trong Node.js (Server Components, API routes, Server Actions).

---

## 4. Cấu trúc thư mục dự án

```
52400017_52400133_52400004/    ← Root repository
├── README.md                  ← "Hiến pháp" dự án
├── docs/
│   ├── SETUP.md               ← Hướng dẫn cài đặt
│   ├── mo-ta-de-tai.md        ← Mô tả đề tài
│   ├── bangmau.md             ← Bảng màu thiết kế (15 màu)
│   ├── plan.md                ← Kế hoạch phát triển
│   ├── tai-khoan-demo.md      ← Danh sách 64 tài khoản demo
│   ├── thuyet-trinh.md        ← Tài liệu thuyết trình
│   └── project-summary.md     ← File này
├── UML/
│   ├── Activity Diagram/      ← 4 JPG + 4 HTML diagrams
│   ├── Class Diagram/         ← ⚠️ TRỐNG — cần bổ sung
│   ├── ERD/                   ← ⚠️ TRỐNG — cần bổ sung
│   └── Usecase/               ← 5 usecase diagrams (HTML)
└── axiom/                     ← Next.js 16 Project
    ├── .env / .env.example
    ├── docker-compose.yml     ← PostgreSQL container
    ├── setup_db.sql           ← SQL khởi tạo DB
    ├── prisma/
    │   ├── schema.prisma      ← 13 models, 282 dòng
    │   └── migrations/        ← 2 migrations (init + avatar_path_to_text)
    ├── prisma.config.ts       ← Prisma 7 connection config
    ├── scripts/               ← 6 utility scripts
    │   ├── seed-demo-data.ts  ← Tạo 63NV + 64TK (33.8KB)
    │   ├── generate-payroll.ts ← Tính lương hàng loạt (8.4KB)
    │   ├── generate-attendance.ts ← Tạo dữ liệu chấm công (3.1KB)
    │   ├── vary-payroll.ts    ← Tạo biến động lương (5.0KB)
    │   ├── check-payroll-months.ts ← Kiểm tra payroll (1.2KB)
    │   └── test-db.mjs        ← Test kết nối database
    ├── public/
    │   └── images/            ← LogoAXIOM.png, avatarmacdinh.jpg, CoVietNam.png, coanh.png
    └── src/                   ← 114 files, ~1015KB
        ├── middleware.ts      ← Edge Runtime auth guard + email setup redirect (65 dòng)
        ├── app/
        │   ├── layout.tsx     ← Root layout (AuthProvider wrapper)
        │   ├── globals.css    ← Design tokens + Tailwind + responsive utils
        │   ├── page.tsx       ← redirect → /login
        │   ├── setup-email/   ← Thiết lập Gmail cá nhân (11.2KB)
        │   ├── (auth)/        ← layout.tsx + login (45.6KB), forgot-password (11.6KB), reset-password (16.1KB)
        │   ├── (dashboard)/   ← layout.tsx (41.0KB) + 18 sub-modules
        │   └── api/           ← 5 thư mục API routes
        │       ├── auth/[...nextauth]/route.ts
        │       ├── departments/route.ts + [id]/route.ts
        │       ├── forgot-password/route.ts (6.7KB)
        │       ├── upload-avatar/route.ts
        │       └── export/
        │           ├── excel/route.ts (21.7KB)
        │           ├── payslip-pdf/route.ts
        │           └── report-excel/route.ts (22.7KB)
        ├── components/
        │   ├── providers/     ← auth-provider.tsx (SessionProvider)
        │   ├── ui/            ← avatar-img.tsx
        │   ├── layout/        ← breadcrumb, header, sidebar, theme-toggle
        │   ├── dashboard/     ← stat-card, payroll-chart, headcount-chart, recent-activity
        │   ├── employees/     ← employee-form, employee-columns, employee-card
        │   ├── attendance/    ← calendar-view, check-in-button, attendance-summary
        │   ├── leave/         ← leave-form, leave-balance, approval-actions
        │   └── payroll/       ← payroll-table, salary-breakdown, payslip-template
        ├── hooks/
        │   ├── use-current-user.ts   ← NextAuth session + mock fallback (2.6KB)
        │   ├── use-breakpoint.ts     ← (1.5KB)
        │   ├── use-debounce.ts       ← (0.5KB)
        │   ├── use-pagination.ts     ← (1.6KB)
        │   └── use-confirmation.ts   ← (1.4KB)
        ├── lib/
        │   ├── prisma.ts             ← PrismaClient singleton (Prisma 7 adapter, 27 dòng)
        │   ├── auth.ts               ← NextAuth v5 config (CredentialsProvider) — Node.js only (63 dòng)
        │   ├── auth.config.ts        ← Edge-safe NextAuth config (callbacks only, 53 dòng)
        │   ├── mock-auth.ts          ← Legacy mock (localStorage) — fallback only (13.8KB)
        │   ├── dashboard-context.tsx  ← Dark/Light + VI/EN context (78 dòng)
        │   ├── constants.ts          ← Rates, tax brackets, enums, EN translations (113 dòng)
        │   ├── i18n-maps.ts          ← Central VI→EN mapping: dept, position, career phrases (167 dòng, 8.3KB)
        │   ├── utils.ts              ← cn() (tailwind-merge)
        │   ├── services/             ← 10 service files
        │   ├── actions/              ← 11 server action files
        │   ├── validators/           ← 5 Zod schemas
        │   ├── helpers/              ← payroll-calculator (97 dòng), format-helpers (121 dòng), serialize (54 dòng)
        │   └── utils/                ← search.ts (Vietnamese search — normalizeVN, matchAny, 1.8KB)
        ├── styles/
        │   └── print.css
        └── types/
            ├── index.ts
            ├── employee.types.ts     ← EmployeeWithRelations, DepartmentBasic, etc. (88 dòng)
            ├── payroll.types.ts      ← PayrollRecord, PayslipRecord, etc. (63 dòng)
            └── next-auth.d.ts        ← Session/User/JWT augmentation (36 dòng)
```

---

## 5. Phân hệ nghiệp vụ (4 modules)

### 🅰️ Phân hệ 1: Quản lý Hồ sơ Nhân sự (Core HR)

| Chức năng | Route | Trạng thái |
|---|---|---|
| Quản lý nhân viên (CRUD + search + filter) | `/employees` | ✅ Hoàn chỉnh |
| Chi tiết nhân viên | `/employees/[id]` | ✅ Hoàn chỉnh |
| Thêm nhân viên mới | `/employees/new` | ✅ Hoàn chỉnh |
| Quản lý phòng ban | `/departments` | ✅ Hoàn chỉnh |
| Quản lý chức vụ | `/positions` | ✅ Hoàn chỉnh |
| Hợp đồng lao động + cảnh báo 30 ngày | `/contracts` | ✅ Hoàn chỉnh |
| Chi tiết hợp đồng | `/contracts/[id]` | ✅ Hoàn chỉnh |
| Lịch sử công tác (timeline) | `/career-history` | ✅ Hoàn chỉnh |
| Công tác phí | `/business-trips` | ✅ Hoàn chỉnh |

**Employee Deletion Flow (2-step):**
- **Soft delete** (`deleteEmployee`): Đổi status → "Nghỉ việc" (reversible)
- **Hard delete** (`hardDeleteEmployee`): Xóa hoàn toàn + tất cả data liên quan (transaction)
- **Reinstate** (`reinstateEmployee`): Khôi phục NV đã soft-delete → "Đang làm"

### 🅱️ Phân hệ 2: Quản lý Thời gian & Nghỉ phép (Time & Attendance)

| Chức năng | Route | Trạng thái |
|---|---|---|
| Bảng chấm công tháng | `/attendance` | ✅ Hoàn chỉnh |
| Check-in / Check-out real-time | `/attendance/check-in` | ✅ Hoàn chỉnh |
| Đăng ký và duyệt nghỉ phép | `/leave` | ✅ Hoàn chỉnh |
| Tạo đơn xin nghỉ | `/leave/request` | ✅ Hoàn chỉnh |

### 🅲️ Phân hệ 3: Quản lý Tiền lương (Payroll)

| Chức năng | Route | Trạng thái |
|---|---|---|
| Bảng lương Gross → Net | `/payroll` | ✅ Hoàn chỉnh |
| Cấu hình BHXH/BHYT/Thuế | `/payroll/config` | ✅ Hoàn chỉnh |
| Danh sách phiếu lương | `/payslips` | ✅ Hoàn chỉnh |
| Xem + xuất PDF phiếu lương | `/payslips/[id]` | ✅ Hoàn chỉnh |

**Công thức tính lương (payroll-calculator.ts — 97 dòng):**
```
Gross        = (baseSalary × salaryGrade) + allowance + otPay
BHXH         = (baseSalary × salaryGrade) × 8%     ← Đúng quy định: BH tính trên lương cơ bản × hệ số
BHYT         = (baseSalary × salaryGrade) × 1.5%
BHTN         = (baseSalary × salaryGrade) × 1%
Taxable      = Gross − BHXH − BHYT − BHTN − 11.000.000 − (4.400.000 × numDependents)
Thuế TNCN    = Biểu lũy tiến 7 bậc (5% / 10% / 15% / 20% / 25% / 30% / 35%)
Net          = Gross − BHXH − BHYT − BHTN − Thuế TNCN − otherDeductions
OT pay       = (baseSalary × salaryGrade / 26 ngày / 8 giờ) × 1.5 × otHours
```

**Thực tập sinh:** `effectiveBaseSalary = baseSalary × 0.85` (85% lương cơ bản, phụ cấp giữ nguyên)

**Biểu thuế TNCN 7 bậc (Điều 22, Luật Thuế TNCN VN):**

| Bậc | Thu nhập chịu thuế | Thuế suất |
|---|---|---|
| 1 | ≤ 5 triệu | 5% |
| 2 | 5 – 10 triệu | 10% |
| 3 | 10 – 18 triệu | 15% |
| 4 | 18 – 32 triệu | 20% |
| 5 | 32 – 52 triệu | 25% |
| 6 | 52 – 80 triệu | 30% |
| 7 | > 80 triệu | 35% |

### 🅳️ Phân hệ 4: Báo cáo & Quản trị hệ thống

| Chức năng | Route | Trạng thái |
|---|---|---|
| Dashboard Admin | `/dashboard` | ✅ Hoàn chỉnh |
| Dashboard HR Manager | `/dashboard-hr` | ✅ Hoàn chỉnh |
| Dashboard Kế toán | `/dashboard-accountant` | ✅ Hoàn chỉnh |
| Dashboard Giám đốc | `/dashboard-director` | ✅ Hoàn chỉnh |
| Dashboard Trưởng phòng | `/dashboard-manager` | ✅ Hoàn chỉnh |
| Dashboard Nhân viên | `/dashboard-employee` | ✅ Hoàn chỉnh |
| Quản lý tài khoản RBAC | `/settings/users` | ✅ Hoàn chỉnh |
| Hồ sơ cá nhân + Crop avatar | `/profile` | ✅ Hoàn chỉnh |
| Thiết lập Gmail cá nhân | `/setup-email` | ✅ Hoàn chỉnh |
| Settings tổng | `/settings` | ✅ Hoàn chỉnh |
| Export Excel / PDF | API routes | ✅ Hoàn chỉnh |

---

## 6. Database Schema (13 bảng — prisma/schema.prisma — 282 dòng)

| # | Model | Bảng DB | Fields chính | Ghi chú |
|---|---|---|---|---|
| 1 | `Department` | `departments` | id, name, description, isActive | soft delete |
| 2 | `Position` | `positions` | id, name, description, isActive | soft delete |
| 3 | `Employee` | `employees` | id, code(unique), fullName, gender, dateOfBirth, idNumber, phone, email, address, avatarPath(Text), departmentId, positionId, hireDate, status, taxCode, numDependents | avatarPath: Text (migration #2) |
| 4 | `Contract` | `contracts` | id, employeeId, contractType, startDate, endDate, baseSalary, salaryGrade(Decimal 5,2), allowance, status, notes | Decimal(18,2) |
| 5 | `CareerHistory` | `career_history` | id, employeeId, eventType, eventDate, description, decisionNumber, old/newDepartment, old/newPosition, old/newSalary, rewardType, rewardAmount, penaltyType | 17 fields |
| 6 | `User` | `users` | id, username(unique), passwordHash, employeeId(unique?), role, isActive, lastLogin, createdAt, **personalEmail** | personalEmail → forgot password |
| 7 | `Attendance` | `attendance` | id, employeeId, workDate, checkIn(Time), checkOut(Time), status, otHours, lateMinutes, earlyMinutes, notes | @@unique [employeeId, workDate] |
| 8 | `LeaveRequest` | `leave_requests` | id, employeeId, leaveType, startDate, endDate, totalDays, reason, status, approvedBy, approvedDate | approvedBy → User |
| 9 | `LeaveBalance` | `leave_balance` | id, employeeId, year, leaveType, totalDays, usedDays | @@unique [employeeId, year, leaveType] |
| 10 | `BusinessTrip` | `business_trips` | id, employeeId, destination, startDate, endDate, purpose, allowance, status, approvedBy | approvedBy → User |
| 11 | `SalaryConfig` | `salary_config` | id, configKey(unique), configValue, description, updatedAt | Decimal(18,4) |
| 12 | `Payroll` | `payroll` | id, employeeId, payMonth, payYear, workDays, otHours, baseSalary, allowance, otPay, grossSalary, bhxh, bhyt, bhtn, taxIncome, taxAmount, deductions, netSalary, status | @@unique [employeeId, payMonth, payYear] |
| 13 | `Payslip` | `payslips` | id, payrollId, employeeId, issuedDate, pdfPath, isViewed | |

### Migrations

| # | Migration | Nội dung |
|---|---|---|
| 1 | `20260329164831_init` | Tạo tất cả 13 bảng |
| 2 | `20260329204037_avatar_path_to_text` | `avatarPath` VarChar(255) → Text |

---

## 7. Phân quyền RBAC (6 vai trò)

| Vai trò DB | Dashboard | Username demo | Password |
|---|---|---|---|
| `Admin` | `/dashboard` | `admin` | `admin` |
| `Director` | `/dashboard-director` | `giamdoc` | `giamdoc` |
| `HRManager` | `/dashboard-hr` | `nhansu` | `nhansu` |
| `Accountant` | `/dashboard-accountant` | `ketoan` | `ketoan` |
| `Manager` | `/dashboard-manager` | `quanly` | `quanly` |
| `Employee` | `/dashboard-employee` | `nhanvien` | `nhanvien` |

---

## 8. Dữ liệu demo (63 nhân viên + 64 tài khoản)

### Cấu trúc tổ chức (seed-demo-data.ts — 33.8KB)

| Nhóm | Số lượng | Role hệ thống |
|---|---|---|
| Admin (system) | 1 | Admin |
| Ban Giám đốc | 3 | Director |
| Trưởng phòng | 5 | Manager / HRManager / Accountant |
| Nhân viên chính thức | 50 | Employee (10/phòng × 5 phòng) |
| Nhân viên thử việc | 5 | Employee |

### 5 phòng ban

- Công nghệ Thông tin (CNTT)
- Nhân sự
- Kế toán - Tài chính
- Kinh doanh
- Marketing

### Hợp đồng được seed theo nhóm

| Nhóm | Loại HĐ | Thời hạn |
|---|---|---|
| Ban Giám đốc | Chính thức | 31/03/2026 + **3 năm** + 0–6 tháng ngẫu nhiên |
| Trưởng phòng | Chính thức | 31/03/2026 + **2 năm** + 0–6 tháng |
| Nhân viên chính thức | Chính thức | 31/03/2026 + **1–3 năm** + 0–6 tháng |
| Nhân viên thử việc | Thử việc | Cố định **31/05/2026** (2 tháng) |

### Dữ liệu đã seed thực tế

```
✅ 5 phòng ban | 19 chức vụ
✅ 63 nhân viên | 63 hợp đồng
✅ 1.280 records chấm công T3/2026
✅ 63 quỹ nghỉ phép | 8 đơn nghỉ | 6 chuyến công tác
✅ Payroll T3/2026: 58 NV | Tổng Net: 1.412.561.866 đ
```

---

## 9. Services Layer (Business Logic — 10 files)

| Service | Chức năng chính |
|---|---|
| `employee.service.ts` (144 dòng) | findMany (search/filter/pagination), findById, findByCode, count, create, update, **softDelete**, **hardDelete** (transaction xóa toàn bộ data liên quan) |
| `department.service.ts` (41 dòng) | findAll, findById, create, update, delete (isActive=false) |
| `contract.service.ts` (104 dòng) | findAll, findByEmployee, findActive, findExpiringSoon (30 ngày), create, update, terminate |
| `career-history.service.ts` (187 dòng) | findAll, findByEmployee, create (**transaction → tự cập nhật Employee position/department**), delete, getStatsByEmployee, getOverviewStats, getEmployeesForSelect, getDepartmentsForSelect, getPositionsForSelect |
| `attendance.service.ts` (130 dòng) | findByMonth, findToday, checkIn (tính lateMinutes từ 8:00), checkOut (tính otHours/earlyMinutes từ 17:00), upsert |
| `leave.service.ts` (120 dòng) | findMany, create, approve (**transaction: kiểm tra quỹ phép + trừ balance**), getBalance, getAllBalances |
| `payroll.service.ts` (149 dòng) | findByPeriod, findById, calculate (**lấy HĐ + chấm công → Gross→Net tự động**, intern 85%), getSummary |
| `payslip.service.ts` (76 dòng) | create, createOrUpdate (chống duplicate), findByEmployee, findByPeriod, markViewed, updatePdfPath |
| `dashboard.service.ts` (133 dòng) | getEmployeeStats, getHeadcountByDepartment, getPayrollTrend, getPendingLeaveCount, getExpiringContracts, getAttendanceTrend, getRecentActivity |
| `user.service.ts` (207 dòng) | findByUsername, findById, findAll, createWithEmployee (**transaction: auto-gen NV code**), create, updateRole, toggleActive, deactivate, deleteWithEmployee, resetPassword, findForPasswordChange, updatePassword, updateLastLogin, updateEmployeeProfile, setTempPassword, getDepartmentsForSelect, countActiveAdmins |

---

## 10. Server Actions (Mutations — 11 files)

Tất cả đều `"use server"` + pattern `{ success, data?, error? }`:

| Action file | Hàm chính |
|---|---|
| `employee.actions.ts` (110 dòng) | getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, **hardDeleteEmployee**, **reinstateEmployee**, getEmployeeByCode |
| `contract.actions.ts` (67 dòng) | getAllContracts, getContractsByEmployee, getExpiringContracts, createContract, terminateContract |
| `attendance.actions.ts` (67 dòng) | getAttendanceByMonth, getTodayAttendance, checkIn, checkOut, upsertAttendance |
| `leave.actions.ts` (85 dòng) | getLeaveRequests, createLeaveRequest, approveLeave, getLeaveBalance, getAllLeaveBalances |
| `payroll.actions.ts` (59 dòng) | getPayrollByPeriod, calculatePayroll, getPayrollSummary, getPayslipsByEmployee, getEmployeePayroll |
| `career-history.actions.ts` (111 dòng) | getCareerHistories, getCareerHistoryByEmployee, createCareerHistory, deleteCareerHistory, getCareerOverviewStats, getEmployeesForCareerSelect, getDepartmentsForCareerSelect, getPositionsForCareerSelect |
| `business-trips.actions.ts` (78 dòng) | getBusinessTrips, createBusinessTrip, approveBusinessTrip |
| `user-admin.actions.ts` (219 dòng) | getAllUsersFromDB, createUserInDB, toggleUserActiveInDB, deleteUserFromDB, adminResetPasswordInDB, updateUserRoleInDB, getDepartmentsForSelect, changePasswordInDB, updateProfileInDB, getEmployeeAvatar, setTempPasswordInDB, **savePersonalEmailInDB**, **getPersonalEmail** |
| `dashboard.actions.ts` (42 dòng) | getDashboardStats, getDashboardCharts, getDashboardAttendanceTrend |
| `department.actions.ts` (33 dòng) | getDepartments, getPositions |
| `auth.actions.ts` (35 dòng) | getUsers, updateUserRole, deactivateUser |

---

## 11. API Routes (8 files trong src/app/api/)

| Route | Method | Chức năng |
|---|---|---|
| `api/auth/[...nextauth]/route.ts` | GET, POST | NextAuth v5 catch-all handler |
| `api/departments/route.ts` | GET | Lấy danh sách phòng ban |
| `api/departments/[id]/route.ts` | GET, PUT, DELETE | CRUD phòng ban theo ID |
| `api/forgot-password/route.ts` (6.7KB) | POST | Tìm user theo personalEmail → generate tempPw → bcrypt hash → gửi email qua Gmail SMTP (nodemailer) |
| `api/upload-avatar/route.ts` | POST | Nhận base64 image → decode → lưu file vào `public/uploads/avatars/` → cập nhật DB |
| `api/export/excel/route.ts` (21.7KB) | GET/POST | Export Excel bảng lương |
| `api/export/payslip-pdf/route.ts` | GET/POST | Export phiếu lương PDF |
| `api/export/report-excel/route.ts` (22.7KB) | GET/POST | Export báo cáo Excel tổng hợp |

---

## 12. Zod Validators (src/lib/validators/)

| Schema file | Schemas exported |
|---|---|
| `employee.schema.ts` (28 dòng) | `employeeSchema`, `employeeUpdateSchema` |
| `contract.schema.ts` (23 dòng) | `contractSchema` (CONTRACT_TYPES enum), `contractUpdateSchema` |
| `attendance.schema.ts` (31 dòng) | `attendanceSchema`, `checkInSchema`, `checkOutSchema` |
| `leave.schema.ts` (31 dòng) | `leaveRequestSchema`, `leaveApprovalSchema`, `leaveBalanceSchema` |
| `payroll.schema.ts` (32 dòng) | `payrollSchema`, `salaryConfigSchema` |

---

## 13. Hằng số hệ thống (constants.ts — 113 dòng)

| Hằng số | Giá trị | Ghi chú |
|---|---|---|
| `BHXH_RATE` | `0.08` | 8% — NLĐ đóng |
| `BHYT_RATE` | `0.015` | 1.5% — NLĐ đóng |
| `BHTN_RATE` | `0.01` | 1% — NLĐ đóng |
| `PERSONAL_DEDUCTION` | `11_000_000` | 11tr/tháng — Nghị quyết 954/2020 |
| `DEPENDENT_DEDUCTION` | `4_400_000` | 4.4tr/người phụ thuộc/tháng |
| `DEFAULT_ANNUAL_LEAVE_DAYS` | `12` | Ngày nghỉ phép mặc định/năm |
| `OT_RATE_WEEKDAY` | `1.5` | 150% ngày thường |
| `OT_RATE_WEEKEND` | `2.0` | 200% cuối tuần |
| `OT_RATE_HOLIDAY` | `3.0` | 300% ngày lễ |

**Enums:**
- `ROLES`: Admin, HRManager, Accountant, Director, Manager, Employee
- `CONTRACT_TYPES`: Thử việc, Chính thức, Thời vụ, **Thực tập**
- `EMPLOYEE_STATUS`: Đang làm, Thử việc, Nghỉ việc
- `LEAVE_TYPES`: Nghỉ năm, Nghỉ ốm, Việc riêng, Khác
- `CAREER_EVENT_TYPES`: Bổ nhiệm, Miễn nhiệm, Thăng chức, Giáng chức, Điều chuyển, Điều chỉnh lương, Khen thưởng, Kỷ luật, Khác
- `CAREER_EVENT_CATEGORIES`: position, transfer, salary, reward, penalty, other (with VI/EN labels)
- `REWARD_TYPES`: Bằng khen, Giấy khen, Tiền thưởng, Thưởng dự án, Khác
- `PENALTY_TYPES`: Khiển trách, Cảnh cáo, Hạ bậc lương, Chuyển công tác, Sa thải, Khác

**English Translation Maps (constants.ts):**
- `CAREER_EVENT_TYPE_EN` → 9 event types
- `REWARD_TYPE_EN` → 5 values
- `PENALTY_TYPE_EN` → 6 values
- `CONTRACT_TYPE_EN` → 3 values
- `EMPLOYEE_STATUS_EN` → 3 values

---

## 14. i18n Architecture (Hệ thống đa ngôn ngữ)

### dashboard-context.tsx (78 dòng)
- `DashLang`: `"vi" | "en"` — toggle bằng cờ quốc kỳ
- `DashboardProvider`: Dark/Light + VI/EN + localStorage sync
- `useDashboard()`: hook cho mọi Client Component

### i18n-maps.ts (167 dòng, 8.3KB)
Central mapping VI→EN cho tất cả dynamic data từ DB:
- `DEPT_VI_TO_EN`: 15 phòng ban
- `POS_VI_TO_EN`: 24 chức vụ
- `CAREER_PHRASES_VI_TO_EN`: 37 career description phrases (ordered longest-first)
- `CONTRACT_TYPE_VI_TO_EN`: 6 loại hợp đồng
- Helper functions: `tDept()`, `tPos()`, `tContractType()`, `tCareerDetail()` (multi-step translation)

---

## 15. Middleware & Auth Flow

### middleware.ts — Edge Runtime auth guard (65 dòng)

```
Kiến trúc 2 file:
  auth.config.ts  ← Edge-safe (callbacks only, KHÔNG bcrypt, KHÔNG providers)
  auth.ts         ← Node.js only (CredentialsProvider + bcrypt + auth.config.ts)
  middleware.ts   ← import auth.config.ts → Edge compatible

Public paths: /login, /forgot-password, /reset-password, /api/auth, /api/forgot-password, /setup-email, /_next, /favicon.ico
Roles skip email check: ["Admin"]

Luồng xử lý:
  1. Root / → redirect /login
  2. Public path → next()
  3. Chưa đăng nhập → redirect /login?callbackUrl=<path>
  4. Chưa có personalEmail (trừ Admin) → redirect /setup-email
  5. Đã xác thực + có email → next()
```

### Auth flow (auth.ts — NextAuth v5, 63 dòng)

1. **Login**: CredentialsProvider → `userService.findByUsername()` → `bcrypt.compare()` → `userService.updateLastLogin()`
2. **JWT callback**: Token ghi thêm `role`, `employeeId`, `dashboardPath`, `personalEmail`
3. **Session callback**: Session ghi `user.id`, `user.role`, `user.employeeId`, `user.dashboardPath`, `user.personalEmail`
4. **Session update**: Client gọi `session.update({ personalEmail })` → JWT cập nhật runtime
5. **Redirect sau login**: Client đọc `session.user.dashboardPath` → push router

### Type augmentation (next-auth.d.ts — 36 dòng)

```typescript
Session.user: { id, name, email, image, role, employeeId, dashboardPath, personalEmail }
JWT: { role, employeeId, dashboardPath, personalEmail }
```

### useCurrentUser hook (2.6KB)

- Ưu tiên: **NextAuth session** (`useSession()`) → trả về MockUser-compatible object
- Fallback: `mock-auth.ts` → `getCurrentUser()` (localStorage)
- Exports thêm: `useEmployeeId()`, `useUserId()`

---

## 16. Tính năng nổi bật

### 🆕 Thiết lập Gmail cá nhân (setup-email — 11.2KB)

- **Route**: `/setup-email` (ngoài dashboard layout)
- **Bắt buộc**: Middleware redirect tất cả user (trừ Admin) chưa có personalEmail
- **Flow**: Nhập Gmail → validate `@gmail.com` → `savePersonalEmailInDB()` → `session.update()` → redirect dashboard
- **UI**: Dark/Light mode, AXIOM branding, shield icon, Gmail indicator

### 🆕 Quên mật khẩu với Email thực (forgot-password — 6.7KB API)

- **API**: `POST /api/forgot-password`
- **Flow**: Nhập Gmail cá nhân → tìm user theo `personalEmail` → generate temp password 10 ký tự → bcrypt hash → cập nhật DB → gửi email qua **Gmail SMTP** (nodemailer)
- **Email template**: HTML đẹp với AXIOM branding, gradient header, temporary password display, employee info, login CTA
- **Security**: Trả `success: true` kể cả khi email không tồn tại (tránh lộ thông tin)

### 🆕 Avatar Upload & Crop Modal (profile — 46KB)

- **API route**: `POST /api/upload-avatar` — nhận base64 image, decode, lưu file disk, cập nhật DB
- **Crop Modal** (`AvatarCropModal` component):
  - Drag-to-pan (pointer events)
  - Scroll/button zoom (0.1x → 5x)
  - Circular clipping mask (260px visual, 400px output)
  - Zoom slider với knob
  - Reset button, Auto-fit on load
  - Canvas-based rendering

### 🆕 Employee Two-Step Deletion

- **Soft delete**: Đổi status → "Nghỉ việc" (có thể reinstate)
- **Hard delete**: Transaction xóa toàn bộ: payslips, payroll, contracts, career history, attendance, leave requests, leave balance, business trips, user account, employee record
- **Reinstate**: Khôi phục NV đã soft-delete về "Đang làm"

### 🆕 Intern Salary Calculation

- Nhận diện qua `contractType === "Thực tập"`
- `effectiveBaseSalary = baseSalary × 0.85` (85%)
- Phụ cấp (allowance) giữ nguyên 100%

### 🆕 Vietnamese Search Utility (search.ts — 1.8KB)

- `normalizeVN(str)`: NFD decompose + remove combining diacritics + đ→d → lowercase
- `matchSearch(text, query)`: Tìm kiếm hỗ trợ có dấu và không dấu
- `matchAny(fields[], query)`: Search trên nhiều trường cùng lúc

### 🆕 Edge-safe Auth Architecture

- `auth.config.ts`: Tách JWT/session callbacks ra file riêng, không import bcrypt
- `middleware.ts`: Import `auth.config.ts` thay vì `auth.ts` → chạy được trên Edge Runtime
- `auth.ts`: Spread `authConfig` + thêm CredentialsProvider (Node.js only)

---

## 17. Top 15 Files theo kích thước

| # | File | Size |
|---|---|---|
| 1 | `contracts/page.tsx` | 59.7 KB |
| 2 | `payroll/page.tsx` | 57.9 KB |
| 3 | `employees/page.tsx` | 54.1 KB |
| 4 | `profile/page.tsx` | 46.0 KB |
| 5 | `login/page.tsx` | 45.6 KB |
| 6 | `(dashboard)/layout.tsx` | 41.0 KB |
| 7 | `settings/users/page.tsx` | 39.5 KB (731 dòng) |
| 8 | `leave/page.tsx` | 39.2 KB |
| 9 | `career-history/page.tsx` | 35.6 KB |
| 10 | `dashboard/page.tsx` | 32.9 KB |
| 11 | `payroll/config/page.tsx` | 32.7 KB |
| 12 | `leave/request/page.tsx` | 30.6 KB |
| 13 | `export/report-excel/route.ts` | 22.7 KB |
| 14 | `attendance/check-in/page.tsx` | 22.0 KB |
| 15 | `export/excel/route.ts` | 21.7 KB |

---

## 18. Trang đăng nhập (login/page.tsx — 45.6KB)

| Tính năng | Chi tiết |
|---|---|
| **Dark / Light mode** | Toggle ☀️/🌙, default dark (`#100505`), light (`#FDF3F4`) |
| **Bilingual** | VI 🇻🇳 / EN 🇬🇧, toggle bằng cờ quốc kỳ |
| **Canvas animation** | 120 star particles (dark mode), `requestAnimationFrame` |
| **Floating cards** | 4 thẻ góc: Payroll chart, 5 Phòng ban, Attendance rate 98.5%, Payslip PDF/XLSX |
| **Card animations** | tilt1–tilt4, 7–10s ease-in-out infinite |
| **Sliding views** | Login ↔ Forgot password (slideInUp/slideOutUp) — không chuyển trang |
| **Forgot password** | 4 email requirements, submit → `POST /api/forgot-password`, gửi email thực qua SMTP |
| **Gradient button** | `gradMove` animation + shine sweep, hover lift effect |
| **Bảng màu** | `#D32F2F` · `#9A0007` · `#FF6659` · `#100505` (dark bg) |

---

## 19. Profile Module (profile/page.tsx — 46.0KB)

| Tab | Chức năng |
|---|---|
| **Thông tin cá nhân** | Xem/chỉnh sửa email, phone (fullName, mã NV, phòng ban read-only) |
| **Đổi mật khẩu** | Old password + new password với 4 security requirements + strength meter |
| **Ảnh đại diện** | File picker → Crop modal (pan + zoom + circular mask) → Upload API → Save |

---

## 20. Settings/Users Module (settings/users/page.tsx — 39.5KB, 731 dòng)

| Tính năng | Chi tiết |
|---|---|
| **Auth Guard** | Chỉ Admin mới truy cập được |
| **CRUD tài khoản** | Tạo user + Employee (transaction), xóa + soft-delete employee liên kết |
| **Inline Role Change** | RoleDropdown component — đổi role trực tiếp từ bảng, 6 màu phân biệt |
| **Reset Password** | Modal reset mật khẩu admin (không cần mật khẩu cũ) |
| **Toggle Active** | Khoá/mở khoá tài khoản |
| **Sort & Filter** | Sortable columns (name/username A→Z/Z→A), search, role filter dropdown |
| **Pagination** | 10 rows/page, ellipsis pagination, first/last/prev/next buttons |
| **Stats Row** | 4 stat cards: Total, Active, Inactive, Admin count |
| **i18n** | Full bilingual VI/EN |
| **Avatar** | AvatarImg component cho mỗi user row |

---

## 21. UML Diagrams

### Use Case Diagrams (5 files HTML — UML/Usecase/)

| File | Nội dung |
|---|---|
| `usecasetongquan.html` | Tổng quan toàn hệ thống |
| `usecase_corehr.html` | Core HR — Quản lý nhân sự |
| `usecase_timeattendance.html` | Time & Attendance |
| `usecase_payroll.html` | Payroll — Tiền lương |
| `usecase_baocao.html` | Báo cáo & Quản trị |

### Activity Diagrams (4 JPG + 4 HTML — UML/Activity Diagram/)

| File | Nội dung |
|---|---|
| `Activity Diagram Core HR.jpg` + `.html` | Luồng Core HR |
| `Activity Diagram Time & Attendance.jpg` + `.html` | Luồng chấm công |
| `Activity Diagram Payroll.jpg` + `.html` | Luồng tính lương |
| `Activity Diagram Report.jpg` + `.html` | Luồng báo cáo |

> ⚠️ **Thư mục `Class Diagram/` và `ERD/` hiện đang TRỐNG — cần bổ sung trước ngày nộp.**

---

## 22. Thiết kế màu sắc (bangmau.md — globals.css)

| CSS Variable | Giá trị | Vai trò |
|---|---|---|
| `--red` | `#D0211C` | Màu đỏ chính (globals.css) |
| `#D32F2F` | — | Đỏ tươi đậm (login page, inline styles) |
| `#9A0007` | — | Đỏ thẫm / gradient end |
| `#FF6659` | — | Đỏ cam / gradient start |
| `--bg-page` | `#fce9e9` (light) / `#1a0a0a` (dark) | Nền trang |
| `--surface` | `#ffffff` / `#1e1414` | Card background |
| `--border` | `#e2e8f0` / `#3d2020` | Viền |
| `--text-1` | `#1a202c` / `#f1e9e9` | Văn bản chính |
| `--text-2` | `#64748b` / `#a08080` | Văn bản phụ |

### Dashboard Theme (dashboard-context.tsx)

| Token | Light | Dark |
|---|---|---|
| `pageBg` | `#FEF2F2` | `#0f172a` |
| `cardBg` | `#ffffff` | `#1e293b` |
| `tableHead` | `#F9FAFB` | `#1a2640` |
| `text1` | `#0f172a` | `#f8fafc` |
| `text2` | `#4B5563` | `#cbd5e1` |

---

## 23. Responsive Design (globals.css)

| Breakpoint | Behavior |
|---|---|
| `> 1024px` | Full layout: sidebar + content |
| `640–1024px` | Tablet: collapsed sidebar, 2-col grids |
| `< 640px` | Mobile: bottom nav, 1-col, card layout thay bảng |

---

## 24. Trạng thái phát triển (tính đến 15/04/2026)

### Tổng quan

| Hạng mục | Kết quả |
|---|---|
| Tổng source files | **114** |
| Tổng page files | **31** |
| API route files | **8** |
| Pages dùng DB thật | **Tất cả** (đã fix hết mock) |
| Mock data còn lại | **0** |
| TypeScript errors | **0** |
| Responsive design | ✅ Hoàn chỉnh |
| Email integration | ✅ Nodemailer + Gmail SMTP |
| Avatar upload | ✅ File-based + Crop modal |
| Bilingual (VI/EN) | ✅ Hoàn chỉnh (constants + i18n-maps) |
| Employee 2-step delete | ✅ Soft delete + Hard delete + Reinstate |
| Intern salary (85%) | ✅ Thực tập → 85% baseSalary |
| Bugs đã fix | **12 bugs** |

### Bugs đã fix

| # | Bug | Giải pháp |
|---|---|---|
| 1 | `leaveRequestSchema` enum sai | Bỏ strict enum, auto-tính `totalDays` |
| 2 | `payslips/[id]` đọc sai field | Map từ `slip.payroll.*` |
| 3 | `payslips/page.tsx` mock cứng | Rewrite với `getPayslipsByEmployee` |
| 4 | `avatarPath` VarChar(255) ngắn | Đổi thành `Text`, migration applied |
| 5 | `api/forgot-password` dùng mock-auth | Rewrite với Prisma + bcrypt + nodemailer |
| 6 | `reset-password` dùng mock | Dùng `adminResetPasswordInDB` |
| 7 | Seed roles sai (ketoan/truongphong) | Fix → `Accountant` / `Manager` |
| 8 | Responsive overflow mobile | Fix bottom nav, card layout |
| 9 | Edge Runtime crypto error | Tách `auth.config.ts` (Edge-safe) khỏi `auth.ts` (Node.js) |
| 10 | `dashboard-manager` StatCard precedence bug | `d.cat===vi?"X":"Y"` → `d.cat===(vi?"X":"Y")` — ternary cần ngoặc |
| 11 | `payroll/config` PIT chỉ 5 bậc | Sửa thành 7 bậc đúng Luật Thuế TNCN VN (Điều 22) |
| 12 | `payroll/config` PIT brackets sai range/formula | Cập nhật range + quick formula đúng biểu lũy tiến 7 bậc |

---

## 25. Hướng dẫn chạy nhanh

```bash
# 1. Vào thư mục axiom
cd axiom

# 2. Cài dependencies
npm install

# 3. Khởi động PostgreSQL (Docker)
docker-compose up -d

# 4. Copy và cấu hình env
cp .env.example .env
# → Chỉnh DATABASE_URL, AUTH_SECRET
# → Thêm GMAIL_USER, GMAIL_APP_PASSWORD (cho forgot password)

# 5. Tạo bảng database
npx prisma migrate dev

# 6. Seed dữ liệu demo (63 NV + 64 TK)
npx tsx scripts/seed-demo-data.ts

# 7. Tạo dữ liệu chấm công T3/2026
npx tsx scripts/generate-attendance.ts

# 8. Tính lương T3/2026
npx tsx scripts/generate-payroll.ts --month=3 --year=2026

# 9. Chạy dev server
npm run dev
# → http://localhost:3000  (redirect → /login)
```

### Environment Variables (.env)

```env
DATABASE_URL="postgresql://axiom:axiom_password@localhost:5432/axiom_hrm"
AUTH_SECRET="your-auth-secret"
GMAIL_USER="axiomhrmpayroll@gmail.com"          # Gmail dùng gửi email
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"        # App password (không phải mật khẩu chính)
NEXT_PUBLIC_APP_URL="http://localhost:3000"      # URL hiển thị trong email
```

---

## 26. Scripts utility (axiom/scripts/)

| Script | Lệnh | Size |
|---|---|---|
| Seed demo | `npx tsx scripts/seed-demo-data.ts` | 33.8KB |
| Generate payroll | `npx tsx scripts/generate-payroll.ts` | 8.4KB |
| Generate attendance | `npx tsx scripts/generate-attendance.ts` | 3.1KB |
| Vary payroll | `npx tsx scripts/vary-payroll.ts` | 5.0KB |
| Check payroll | `npx tsx scripts/check-payroll-months.ts` | 1.2KB |
| Test DB | `node scripts/test-db.mjs` | 0.4KB |

---

## 27. Component Architecture (src/components/ — 8 thư mục)

| Thư mục | Files | Chức năng |
|---|---|---|
| `providers/` | auth-provider.tsx | NextAuth SessionProvider wrapper |
| `ui/` | avatar-img.tsx | Reusable avatar image component |
| `layout/` | breadcrumb.tsx, header.tsx, sidebar.tsx, theme-toggle.tsx | Layout primitives |
| `dashboard/` | stat-card.tsx, payroll-chart.tsx, headcount-chart.tsx, recent-activity.tsx | Dashboard widgets (Recharts) |
| `employees/` | employee-form.tsx, employee-columns.tsx, employee-card.tsx | Employee CRUD components |
| `attendance/` | calendar-view.tsx, check-in-button.tsx, attendance-summary.tsx | Attendance components |
| `leave/` | leave-form.tsx, leave-balance.tsx, approval-actions.tsx | Leave management components |
| `payroll/` | payroll-table.tsx, salary-breakdown.tsx, payslip-template.tsx | Payroll display components |

---

## 28. Helper Modules chi tiết

### payroll-calculator.ts (97 dòng)
- `calculateInsurance(grossSalary)` → `{ bhxh, bhyt, bhtn, total }`
- `calculateIncomeTax(taxableIncome)` → tax amount (7-bracket progressive)
- `calculateSalary(input)` → `{ grossSalary, bhxh, bhyt, bhtn, totalInsurance, taxableIncome, taxAmount, netSalary }`

### format-helpers.ts (121 dòng)
- Tiền tệ: `formatVND()`, `formatCurrencyFull()`, `formatMillions()`
- Ngày: `toDate()`, `formatDateVN()`, `formatDateISO()`, `formatDateTime()`, `formatTime()`, `formatMonthYear()`
- Tính toán: `countWorkingDays()`, `countCalendarDays()`, `isExpiringSoon()`, `isExpired()`, `getRecentMonths()`

### serialize.ts (54 dòng)
- `serialize<T>(data)`: Deep-serialize Prisma objects → plain JSON (Decimal→number, Date→string, BigInt→number)

---

## 29. Tổng hợp phân trang (31 page files)

| # | Route | File | Size |
|---|---|---|---|
| 1 | `/` | `page.tsx` | redirect → /login |
| 2 | `/login` | `(auth)/login/page.tsx` | 45.6KB |
| 3 | `/forgot-password` | `(auth)/forgot-password/page.tsx` | 11.6KB |
| 4 | `/reset-password` | `(auth)/reset-password/page.tsx` | 16.1KB |
| 5 | `/setup-email` | `setup-email/page.tsx` | 11.2KB |
| 6 | `/dashboard` | `(dashboard)/dashboard/page.tsx` | 32.9KB |
| 7 | `/dashboard-hr` | `(dashboard)/dashboard-hr/page.tsx` | 16.7KB |
| 8 | `/dashboard-accountant` | `(dashboard)/dashboard-accountant/page.tsx` | 12.2KB |
| 9 | `/dashboard-director` | `(dashboard)/dashboard-director/page.tsx` | 13.6KB |
| 10 | `/dashboard-manager` | `(dashboard)/dashboard-manager/page.tsx` | 15.5KB |
| 11 | `/dashboard-employee` | `(dashboard)/dashboard-employee/page.tsx` | 18.7KB |
| 12 | `/employees` | `(dashboard)/employees/page.tsx` | 54.1KB |
| 13 | `/employees/new` | `(dashboard)/employees/new/page.tsx` | 16.5KB |
| 14 | `/employees/[id]` | `(dashboard)/employees/[id]/page.tsx` | 20.1KB |
| 15 | `/departments` | `(dashboard)/departments/page.tsx` | 13.1KB |
| 16 | `/positions` | `(dashboard)/positions/page.tsx` | 6.5KB |
| 17 | `/contracts` | `(dashboard)/contracts/page.tsx` | 59.7KB |
| 18 | `/contracts/[id]` | `(dashboard)/contracts/[id]/page.tsx` | — |
| 19 | `/career-history` | `(dashboard)/career-history/page.tsx` | 35.6KB |
| 20 | `/business-trips` | `(dashboard)/business-trips/page.tsx` | 17.2KB |
| 21 | `/attendance` | `(dashboard)/attendance/page.tsx` | 18.0KB |
| 22 | `/attendance/check-in` | `(dashboard)/attendance/check-in/page.tsx` | 22.0KB |
| 23 | `/leave` | `(dashboard)/leave/page.tsx` | 39.2KB |
| 24 | `/leave/request` | `(dashboard)/leave/request/page.tsx` | 30.6KB |
| 25 | `/payroll` | `(dashboard)/payroll/page.tsx` | 57.9KB |
| 26 | `/payroll/config` | `(dashboard)/payroll/config/page.tsx` | 32.7KB |
| 27 | `/payslips` | `(dashboard)/payslips/page.tsx` | 13.4KB |
| 28 | `/payslips/[id]` | `(dashboard)/payslips/[id]/page.tsx` | 8.1KB |
| 29 | `/profile` | `(dashboard)/profile/page.tsx` | 46.0KB |
| 30 | `/settings` | `(dashboard)/settings/page.tsx` | — |
| 31 | `/settings/users` | `(dashboard)/settings/users/page.tsx` | 39.5KB |

---

> **Ghi chú:** File này được cập nhật ngày 15/04/2026 dựa trên đọc toàn bộ source code thực tế.
> Phiên bản: Next.js **16.2.1**, React **19.2.4**, Prisma **7.6.0**, NextAuth **5.0.0-beta.30**.
> Tất cả 31 pages đều sử dụng DB thật (Prisma + PostgreSQL), không còn mock data.
> Docs đã cập nhật: SETUP.md, plan.md, project-summary.md, thuyet-trinh.md, tai-khoan-demo.md.
