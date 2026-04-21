# 📅 Kế Hoạch Phát Triển – AXIOM HRM & Payroll System

> **Đề tài:** Xây dựng Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp  
> **Tech Stack:** Next.js 16 · React 19 · TypeScript · PostgreSQL 17 · Prisma 7 · NextAuth v5  
> **Nhóm:** 52400017 – 52400133 – 52400004 (3 thành viên)  
> **Cập nhật lần cuối:** 🕐 **15/04/2026**

---

> [!IMPORTANT]
> **QUY ĐỊNH:** Trước khi code bất kỳ module nào → ĐỌC `README.md` ở thư mục gốc.  
> README là "hiến pháp" dự án, quy định tech stack, cấu trúc, naming convention.

---

## 👥 Phân công nhóm (3 người)

| Thành viên | MSSV | Vai trò | Phân hệ phụ trách |
|---|---|---|---|
| **Thành viên 1** | 52400017 | Team Lead + Full-stack | Phân hệ 1 (Core HR) + DevOps |
| **Thành viên 2** | 52400133 | Full-stack | Phân hệ 2 (Time & Attendance) + Phân hệ 4 (Dashboard) |
| **Thành viên 3** | 52400004 | Full-stack | Phân hệ 3 (Payroll) + Auth/RBAC |

---

## ✅ TRẠNG THÁI DỰ ÁN (Tính đến 15/04/2026)

> [!NOTE]
> Kết quả audit toàn bộ codebase (114 source files, ~1015 KB). Tất cả các module đã hoàn chỉnh và sử dụng DB thật (Prisma + PostgreSQL).

### 📊 Tổng quan nhanh

| Hạng mục | Số lượng | Trạng thái |
|---|---|---|
| Total source files (`.ts` + `.tsx`) | **114** | ✅ |
| Total source code size | **~1015 KB** | ✅ |
| Total page files (`page.tsx`) | **31** | ✅ |
| API route files (`route.ts`) | **8** | ✅ |
| Layout files (`layout.tsx`) | **3** | ✅ |
| DB thật (Prisma) | **31/31** | ✅ Tất cả |
| Mock data còn lại | **0** | ✅ Đã fix hết |
| TypeScript errors | **0** | ✅ Clean |
| Responsive design | **Hoàn chỉnh** | ✅ Done |
| Seed script | **Đã chạy** | ✅ 63 NV, 64 TK, T3/2026 |
| Generate payroll | **Đã chạy** | ✅ 58 NV, tổng Net ~1.41 tỷ đ |
| Database models (Prisma) | **13 bảng** | ✅ |
| Service files | **10** | ✅ |
| Server Action files | **11** | ✅ |
| Zod Validator schemas | **5** | ✅ |
| Custom React Hooks | **5** | ✅ |
| RBAC roles | **6** | ✅ |
| Email integration | Nodemailer + Gmail SMTP | ✅ |
| Avatar upload | File-based + Crop modal | ✅ |
| Bilingual (VI/EN) | constants + i18n-maps (8.3KB) | ✅ |
| Employee 2-step delete | Soft + Hard + Reinstate | ✅ |
| Intern salary (85%) | contractType="Thực tập" → 85% | ✅ |
| Bugs đã fix | **12** | ✅ |

---

## 📋 TRẠNG THÁI TỪNG FILE (Audit chi tiết)

### 🔐 Auth & API
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `(auth)/login/page.tsx` (45.6KB) | ✅ NextAuth v5 + bcrypt | ✅ **Hoàn chỉnh** | RBAC → dashboard redirect đúng |
| `(auth)/forgot-password/page.tsx` (11.6KB) | ✅ Prisma + bcrypt | ✅ **Hoàn chỉnh** | Sliding view trong login |
| `(auth)/reset-password/page.tsx` (16.1KB) | ✅ adminResetPasswordInDB | ✅ **Hoàn chỉnh** | |
| `setup-email/page.tsx` (11.2KB) | ✅ savePersonalEmailInDB | ✅ **Hoàn chỉnh** | Bắt buộc khi login lần đầu |
| `api/auth/[...nextauth]/route.ts` | ✅ NextAuth v5 | ✅ **Hoàn chỉnh** | |
| `api/forgot-password/route.ts` (6.7KB) | ✅ Prisma + nodemailer | ✅ **Hoàn chỉnh** | Gmail SMTP |
| `api/upload-avatar/route.ts` | ✅ Prisma + file disk | ✅ **Hoàn chỉnh** | Base64 → file |
| `api/departments/route.ts` + `[id]` | ✅ Prisma | ✅ **Hoàn chỉnh** | |
| `api/export/excel/route.ts` (21.7KB) | ✅ | ✅ **Hoàn chỉnh** | Excel bảng lương |
| `api/export/report-excel/route.ts` (22.7KB) | ✅ | ✅ **Hoàn chỉnh** | Excel báo cáo tổng hợp |
| `api/export/payslip-pdf/route.ts` | ✅ | ✅ **Hoàn chỉnh** | PDF phiếu lương |
| `middleware.ts` (65 dòng) | ✅ JWT + Edge-safe | ✅ **Hoàn chỉnh** | auth.config.ts pattern |

### 📊 Dashboard (6 dashboards theo role)
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `(dashboard)/layout.tsx` (41.0KB) | ✅ useSession | ✅ **Hoàn chỉnh** | Sidebar + bottom nav responsive |
| `dashboard/page.tsx` (32.9KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Admin: KPI + charts từ DB |
| `dashboard-hr/page.tsx` (16.7KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | HR Manager dashboard |
| `dashboard-accountant/page.tsx` (12.2KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Kế toán dashboard |
| `dashboard-director/page.tsx` (13.6KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Giám đốc dashboard |
| `dashboard-manager/page.tsx` (15.5KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Trưởng phòng dashboard |
| `dashboard-employee/page.tsx` (18.7KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Nhân viên dashboard |

### 👤 Core HR
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `employees/page.tsx` (54.1KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | CRUD + search + filter + 2-step delete + reinstate |
| `employees/[id]/page.tsx` (20.1KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Chi tiết + tabs |
| `employees/new/page.tsx` (16.5KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Form tạo mới |
| `departments/page.tsx` (13.1KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | CRUD phòng ban |
| `positions/page.tsx` (6.5KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | CRUD chức vụ |
| `contracts/page.tsx` (59.7KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | + cảnh báo hết hạn 30 ngày |
| `contracts/[id]/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | Chi tiết hợp đồng |
| `career-history/page.tsx` (35.6KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Timeline + CRUD + auto-update |
| `business-trips/page.tsx` (17.2KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | CRUD + duyệt |

### ⏰ Chấm công & Nghỉ phép
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `attendance/page.tsx` (18.0KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Bảng chấm công tháng |
| `attendance/check-in/page.tsx` (22.0KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Check-in/out real-time |
| `leave/page.tsx` (39.2KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Danh sách + duyệt |
| `leave/request/page.tsx` (30.6KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Tạo đơn xin nghỉ |

### 💰 Tiền lương & Phiếu lương
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `payroll/page.tsx` (57.9KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Bảng lương Gross → Net |
| `payroll/config/page.tsx` (32.7KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Cấu hình BHXH/BHYT/Thuế 7 bậc |
| `payslips/page.tsx` (13.4KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Danh sách phiếu lương |
| `payslips/[id]/page.tsx` (8.1KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | Xem + xuất PDF |

### ⚙️ Settings & Profile
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `settings/page.tsx` | ✅ useSession | ✅ **Hoàn chỉnh** | Cài đặt chung |
| `settings/users/page.tsx` (39.5KB, 731 dòng) | ✅ Full CRUD DB | ✅ **Hoàn chỉnh** | CRUD + sort/filter + pagination + inline role change |
| `profile/page.tsx` (46.0KB) | ✅ DB thật | ✅ **Hoàn chỉnh** | 3 tabs: Info + Password + Avatar crop |

---

## 🏗️ KIẾN TRÚC & STATE

### Services Layer (src/lib/services/ — 10 files)
| Service | Tình trạng |
|---|---|
| `employee.service.ts` (144 dòng) | ✅ findMany, findById, findByCode, count, create, update, **softDelete, hardDelete (transaction)** |
| `department.service.ts` (41 dòng) | ✅ findAll, findById, create, update, delete (soft) |
| `contract.service.ts` (104 dòng) | ✅ findAll, findByEmployee, findActive, findExpiringSoon, create, update, terminate |
| `career-history.service.ts` (187 dòng) | ✅ findAll, findByEmployee, create (transaction → auto-update Employee), delete, getOverviewStats, getEmployees/Depts/PositionsForSelect |
| `attendance.service.ts` (130 dòng) | ✅ findByMonth, findToday, checkIn (lateMinutes), checkOut (otHours/earlyMinutes), upsert |
| `leave.service.ts` (120 dòng) | ✅ findMany, create, approve (transaction: kiểm tra + trừ quỹ phép), getBalance, getAllBalances |
| `payroll.service.ts` (149 dòng) | ✅ findByPeriod, findById, calculate (HĐ + chấm công → Gross→Net, **intern 85%**), getSummary |
| `payslip.service.ts` (76 dòng) | ✅ create, createOrUpdate, findByEmployee, findByPeriod, markViewed, updatePdfPath |
| `dashboard.service.ts` (133 dòng) | ✅ getEmployeeStats, getHeadcount, getPayrollTrend, getPendingLeave, getExpiringContracts, getAttendanceTrend, getRecentActivity |
| `user.service.ts` (207 dòng) | ✅ findByUsername, findAll, createWithEmployee (transaction), toggleActive, deleteWithEmployee, resetPassword, updatePassword, updateEmployeeProfile, setTempPassword, countActiveAdmins |

### Server Actions (src/lib/actions/ — 11 files)
| Action file | Tình trạng |
|---|---|
| `employee.actions.ts` (110 dòng) | ✅ 8 hàm (incl. hardDelete, reinstate, getByCode) |
| `contract.actions.ts` (67 dòng) | ✅ 5 hàm |
| `attendance.actions.ts` (67 dòng) | ✅ 5 hàm |
| `leave.actions.ts` (85 dòng) | ✅ 5 hàm |
| `payroll.actions.ts` (59 dòng) | ✅ 5 hàm |
| `career-history.actions.ts` (111 dòng) | ✅ 8 hàm (incl. dropdown selects) |
| `business-trips.actions.ts` (78 dòng) | ✅ 3 hàm |
| `user-admin.actions.ts` (219 dòng) | ✅ 13 hàm (full CRUD + password + avatar + email) |
| `dashboard.actions.ts` (42 dòng) | ✅ 3 hàm |
| `department.actions.ts` (33 dòng) | ✅ 2 hàm |
| `auth.actions.ts` (35 dòng) | ✅ 3 hàm |

### Helpers (src/lib/helpers/ — 3 files)
| Helper | Tình trạng |
|---|---|
| `payroll-calculator.ts` (97 dòng) | ✅ calculateInsurance, calculateIncomeTax (7 bậc), calculateSalary |
| `format-helpers.ts` (121 dòng) | ✅ VND format, date format, working days, expiry checks |
| `serialize.ts` (54 dòng) | ✅ Deep-serialize Prisma → plain JSON |

### i18n (src/lib/ — 2 files)
| File | Tình trạng |
|---|---|
| `constants.ts` (113 dòng) | ✅ Rates, enums, 5 EN translation maps |
| `i18n-maps.ts` (167 dòng, 8.3KB) | ✅ 15 depts, 24 positions, 37 career phrases, contract types, helper functions |

### Scripts (axiom/scripts/ — 6 files)
| Script | Tình trạng |
|---|---|
| `seed-demo-data.ts` (33.8KB) | ✅ 63 NV + 64 TK, roles đúng |
| `generate-payroll.ts` (8.4KB) | ✅ Công thức VN 2026 |
| `generate-attendance.ts` (3.1KB) | ✅ Chấm công T3/2026 |
| `vary-payroll.ts` (5.0KB) | ✅ Biến động lương |
| `check-payroll-months.ts` (1.2KB) | ✅ Kiểm tra payroll |
| `test-db.mjs` (0.4KB) | ✅ Test kết nối |

### Database Schema (13 models)
Department · Position · Employee · Contract · CareerHistory · User · Attendance · LeaveRequest · LeaveBalance · BusinessTrip · SalaryConfig · Payroll · Payslip

---

## ✅ CÁC PHASE ĐÃ HOÀN THÀNH

### Phase 1–3: Setup + Core Development *(trước 30/03)*
- [x] Setup Next.js 16 + PostgreSQL + Prisma 7 + Docker
- [x] Thiết kế database schema (13 bảng)
- [x] Xây dựng 4 phân hệ nghiệp vụ
- [x] Phân quyền RBAC 6 vai trò
- [x] UI/UX với Tailwind CSS + Dark/Light mode + Bilingual VI/EN

### Phase 4: Seed + Test *(31/03/2026)* ✅
- [x] Seed 63 NV + 64 TK + payroll T3/2026
- [x] Verify tất cả roles login đúng dashboard
- [x] Verify user flows: Check-in → Nghỉ phép → Phiếu lương

### Phase 5: Fix Mock + Career/BusinessTrip *(31/03/2026)* ✅
- [x] Admin Dashboard attendance chart từ DB (không mock)
- [x] Career-history module: Full CRUD từ DB
- [x] Business-trips module: Full CRUD + approve/reject từ DB

### Phase 6: Testing & Polish *(03/04 → 07/04)* ✅
- [x] Test user flow hoàn chỉnh: Login → Setup Email → Check-in → Nghỉ phép → Phiếu lương
- [x] Test RBAC: 6 roles → sidebar + dashboard khác nhau
- [x] Test tạo user mới từ admin → đăng nhập được
- [x] Test dark mode toàn bộ pages
- [x] Test forgot password flow: login → forgot → nhập Gmail → nhận email → login lại
- [x] Test avatar upload + crop modal
- [x] Fix 12 bugs phát sinh
- [x] Tính năng mới: Setup Email bắt buộc, Avatar Crop Modal, Vietnamese Search, Edge-safe Auth

### Phase 7: Advanced Features *(08/04 → 12/04)* ✅
- [x] Employee 2-step deletion: soft delete → hard delete (transaction) + reinstate
- [x] Intern salary calculation: 85% baseSalary cho contractType="Thực tập"
- [x] Bilingual i18n-maps: 15 depts, 24 positions, 37 career phrases
- [x] Insurance tính trên lương cơ bản × hệ số (đúng quy định BHXH VN)
- [x] Settings/users page: sortable columns, pagination, inline role dropdown
- [x] Payslip createOrUpdate: chống duplicate khi tính lương lại

### Phase 8: Documentation & Final *(11/04 → 15/04)* ✅
- [x] Cập nhật README.md (hiến pháp dự án)
- [x] Cập nhật project-summary.md (chi tiết toàn bộ — 29 sections)
- [x] Cập nhật SETUP.md (hướng dẫn cài đặt chính xác)
- [x] Cập nhật plan.md (kế hoạch & audit)
- [x] Chuẩn bị tài liệu thuyết trình (thuyet-trinh.md)
- [x] Chuẩn bị tài khoản demo (tai-khoan-demo.md)

---

## ⚡ MVP tối thiểu để demo

> [!CAUTION]
> 10 tính năng cốt lõi đủ để demo:

1. ✅ **Login + RBAC** — 6 roles, đúng dashboard
2. ✅ **CRUD Nhân viên** — Thêm/sửa/xoá (2-step)/khôi phục/xem chi tiết
3. ✅ **Check-in / Check-out** — Real-time từ DB
4. ✅ **Đơn nghỉ phép** — Tạo + duyệt + trừ quỹ phép
5. ✅ **Phiếu lương** — Xem + in PDF
6. ✅ **Quản lý tài khoản** — Admin tạo user, reset password, đổi role inline
7. ✅ **Seed data** — 63 NV + 64 TK, sẵn sàng demo
8. ✅ **Payroll data** — Lương T3/2026 đã tính (intern 85%)
9. ✅ **Email thực** — Forgot password gửi Gmail qua SMTP
10. ✅ **Bilingual** — Chuyển đổi VI/EN hoàn toàn

---

## 🐛 Bugs đã fix (12 bugs)

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
| 10 | `dashboard-manager` StatCard precedence | `d.cat===vi?"X":"Y"` → `d.cat===(vi?"X":"Y")` |
| 11 | `payroll/config` PIT chỉ 5 bậc | Sửa thành 7 bậc đúng Luật Thuế TNCN VN (Điều 22) |
| 12 | `payroll/config` PIT brackets sai range | Cập nhật range + quick formula đúng biểu lũy tiến 7 bậc |

---

## 📌 Tài khoản demo (seed)

| Username | Mật khẩu | Role | Dashboard |
|---|---|---|---|
| `admin` | `admin` | Admin | `/dashboard` |
| `giamdoc` | `giamdoc` | Director | `/dashboard-director` |
| `pgd1`, `pgd2` | `123456` | Director | `/dashboard-director` |
| `tp_cntt` | `123456` | Manager | `/dashboard-manager` |
| `tp_nhansu` | `123456` | HRManager | `/dashboard-hr` |
| `tp_ketoan` | `123456` | Accountant | `/dashboard-accountant` |
| `tp_kinhdoanh` | `123456` | Manager | `/dashboard-manager` |
| `tp_marketing` | `123456` | Manager | `/dashboard-manager` |
| `nv009`–`nv063` | `123456` | Employee | `/dashboard-employee` |

---

## ⚠️ Cần bổ sung trước nộp

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Class Diagram | ❌ TRỐNG | `UML/Class Diagram/` cần tạo |
| ERD | ❌ TRỐNG | `UML/ERD/` cần tạo |

---

> **Ghi chú:** File này được cập nhật ngày 15/04/2026 sau khi audit toàn bộ 114 source files thực tế.
> Phiên bản: Next.js **16.2.1**, React **19.2.4**, Prisma **7.6.0**, NextAuth **5.0.0-beta.30**.
> Tất cả 31 pages đều sử dụng DB thật (Prisma + PostgreSQL), không còn mock data.
