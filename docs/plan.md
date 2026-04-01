# 📅 Kế Hoạch Phát Triển – AXIOM HRM & Payroll System

> **Đề tài:** Xây dựng Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp  
> **Tech Stack:** Next.js 16 · React 19 · TypeScript · PostgreSQL · Prisma 7 · NextAuth v5  
> **Nhóm:** 52400017 – 52400133 – 52400004 (3 thành viên)  
> **Hạn chót:** 📅 **08/04/2026**  
> **Thời gian còn lại:** ~9 ngày (30/03 → 08/04)  
> **Cập nhật lần cuối:** 🕐 **31/03/2026 – 01:00**

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

## ✅ TRẠNG THÁI THỰC TẾ SAU AUDIT (30/03/2026 – 19:00)

> [!NOTE]
> Kết quả audit toàn bộ codebase chi tiết. Phân loại theo mức độ hoàn thiện thực tế.

### 📊 Tổng quan nhanh

| Hạng mục | Số lượng | Trạng thái |
|---|---|---|
| Total pages | **34 files** | — |
| DB thật (Prisma) | **22/34** | ✅ |
| Mock data còn lại | **0/34** | ✅ Đã fix hết |
| TypeScript errors | **0** | ✅ Clean |
| Responsive design | **Hoàn chỉnh** | ✅ Done |
| Seed script | **Đã chạy ✅** | ✅ 63 NV, 64 TK, T3/2026 |
| Generate payroll | **Đã chạy ✅** | ✅ 58 NV, tổng Net 1.41 tỷ đ |

---

## 📋 TRẠNG THÁI TỪNG FILE (Audit chi tiết)

### 🔐 Auth & API
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `(auth)/login/page.tsx` | ✅ NextAuth v5 + bcrypt | ✅ **Hoàn chỉnh** | RBAC → dashboard redirect đúng |
| `(auth)/forgot-password/page.tsx` | ✅ Prisma + bcrypt | ✅ **Hoàn chỉnh** | |
| `(auth)/reset-password/page.tsx` | ✅ adminResetPasswordInDB | ✅ **Hoàn chỉnh** | |
| `api/auth/[...nextauth]/route.ts` | ✅ NextAuth v5 | ✅ **Hoàn chỉnh** | |
| `api/forgot-password/route.ts` | ✅ Prisma + bcrypt | ✅ **Hoàn chỉnh** | |
| `api/departments/route.ts` | ✅ Prisma | ✅ **Hoàn chỉnh** | |
| `api/export/[...]/route.ts` | ✅ | ✅ **Hoàn chỉnh** | |
| `middleware.ts` | ✅ JWT cookie check | ✅ **Hoàn chỉnh** | |

### 📊 Dashboard
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `(dashboard)/layout.tsx` | ✅ useSession | ✅ **Hoàn chỉnh** | Bottom nav mobile, sidebar responsive |
| `(dashboard)/dashboard/page.tsx` | ⚠️ **Hybrid** | 🔄 **Cần fix** | KPI từ DB (getDashboardStats ✅), biểu đồ chấm công dùng static mock data |
| `(dashboard)/dashboard-hr/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | getDashboardStats + getLeaveRequests từ DB |
| `(dashboard)/dashboard-accountant/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | getDashboardCharts → payrollTrend từ DB |
| `(dashboard)/dashboard-director/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | getDashboardStats + getDashboardCharts từ DB |
| `(dashboard)/dashboard-manager/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | getDashboardStats + getLeaveRequests + getAttendanceByMonth |
| `(dashboard)/dashboard-employee/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | |

### 👤 Core HR
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `employees/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | CRUD + card mobile layout |
| `employees/[id]/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | |
| `employees/new/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | |
| `departments/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | |
| `positions/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | |
| `contracts/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | Card mobile layout |
| `career-history/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | getCareerHistories + create + delete |
| `business-trips/page.tsx` | ✅ **DB thật** | ✅ **Hoàn chỉnh** | getBusinessTrips + create + approve |

### ⏰ Chấm công
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `attendance/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | getAttendanceByMonth + getTodayAttendance |
| `attendance/check-in/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | checkIn/checkOut real-time |

### 📋 Nghỉ phép
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `leave/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | getLeaveRequests + approveLeave |
| `leave/request/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | createLeaveRequest + getLeaveBalance |

### 💰 Tiền lương & Phiếu lương
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `payroll/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | getPayrollByPeriod + upsert payroll |
| `payroll/config/page.tsx` | ✅ SalaryConfig DB | ✅ **Hoàn chỉnh** | |
| `payslips/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | getPayslipsByEmployee + card mobile |
| `payslips/[id]/page.tsx` | ✅ DB thật | ✅ **Hoàn chỉnh** | Full payslip detail, Print support |

### ⚙️ Settings & Profile
| File | DB? | Trạng thái | Ghi chú |
|---|---|---|---|
| `settings/page.tsx` | ✅ useSession | ✅ **Hoàn chỉnh** | |
| `settings/users/page.tsx` | ✅ Full CRUD DB | ✅ **Hoàn chỉnh** | Tạo/xoá/khoá/reset pw/đổi role — hoàn chỉnh nhất |
| `profile/page.tsx` | ✅ updateProfileInDB + changePasswordInDB | ✅ **Hoàn chỉnh** | Responsive tabs |

---

## 🏗️ KIẾN TRÚC & STATE

### Services Layer (src/lib/services/)
| Service | Tình trạng |
|---|---|
| `dashboard.service.ts` | ✅ getEmployeeStats, getHeadcountByDepartment, getPayrollTrend, getPendingLeaveCount, getExpiringContracts |
| `employee.service.ts` | ✅ Full CRUD |
| `attendance.service.ts` | ✅ checkIn/checkOut, getByMonth, getToday |
| `leave.service.ts` | ✅ getRequests, create, approve |
| `payroll.service.ts` | ✅ getByPeriod, upsert, confirm |
| `payslip.service.ts` | ✅ getByEmployee |
| `contract.service.ts` | ✅ Full |
| `department.service.ts` | ✅ Full |
| `user.service.ts` | ✅ findByUsername, updateLastLogin |

### Scripts
| Script | Tình trạng |
|---|---|
| `seed-demo-data.ts` | ✅ Đúng roles (Accountant/Manager đã fix), sẵn sàng chạy |
| `generate-payroll.ts` | ✅ Tính đúng công thức VN 2026, sẵn sàng chạy |

### Database Schema (12 models)
Department · Position · Employee · Contract · CareerHistory · User · Attendance · LeaveRequest · LeaveBalance · BusinessTrip · SalaryConfig · Payroll · Payslip

---

## 🗓️ ROADMAP (30/03 → 08/04/2026)

### ✅ Phase 4: Seed + Test — HOÀN THÀNH (31/03/2026)

> [!NOTE]
> Đã seed thành công. DB có đủ dữ liệu để test và demo.

**Kết quả seed:**
```
✅ 5 phòng ban | 19 chức vụ
✅ 3 Ban GĐ (1 GĐ + 2 PGĐ) | 5 Trưởng phòng
✅ 50 NV chính thức (10/phòng ban) | 5 NV thử việc
✅ 63 hợp đồng | 1.280 records chấm công T3/2026
✅ 63 quỹ nghỉ phép | 8 đơn nghỉ phép | 10 sự kiện công tác | 6 chuyến CT
✅ Payroll T3/2026: 58 NV | Tổng Net: 1.412.561.866 đ
```

**Tài khoản demo:**
| Username | Mật khẩu | Role | Dashboard |
|---|---|---|---|
| `admin` | `admin` | Admin | `/dashboard` |
| `giamdoc` | `giamdoc` | Director | `/dashboard-director` |
| `pgd1` | `123456` | Director | `/dashboard-director` |
| `pgd2` | `123456` | Director | `/dashboard-director` |
| `tp_cntt` | `123456` | Manager | `/dashboard-manager` |
| `tp_nhansu` | `123456` | HRManager | `/dashboard-hr` |
| `tp_ketoan` | `123456` | Accountant | `/dashboard-accountant` |
| `tp_kinhdoanh` | `123456` | Manager | `/dashboard-manager` |
| `tp_marketing` | `123456` | Manager | `/dashboard-manager` |
| `nv009`–`nv063` | `123456` | Employee | `/dashboard-employee` |

**User flows cần test:**
- [ ] Đăng nhập tất cả roles → vào đúng dashboard
- [ ] Nhân viên: Check-in → Xem chấm công → Xin nghỉ phép → Xem phiếu lương
- [ ] HR: Duyệt nghỉ phép, xem danh sách nhân viên
- [ ] Admin: Tạo user mới → user đó đăng nhập được
- [ ] Xuất Excel các dashboard

---

### ✅ Phase 5: Fix Admin Dashboard chart & Mock — HOÀN THÀNH (31/03/2026)

| Task | File | Kết quả |
|---|---|---|
| Admin Dashboard attendance chart | `dashboard/page.tsx` | ✅ Dùng `getDashboardAttendanceTrend()` từ DB (fallback static nếu rỗng) |
| Rewrite `career-history` DB thật | `career-history/page.tsx` | ✅ Full CRUD: list + create + delete |
| Rewrite `business-trips` DB thật | `business-trips/page.tsx` | ✅ Full CRUD: list + create + approve/reject |
| Server actions mới | `career-history.actions.ts` | ✅ getCareerHistories, create, delete |
| Server actions mới | `business-trips.actions.ts` | ✅ getBusinessTrips, create, approve |
| Seed demo data | One-shot script | ✅ 8 career events + 4 trips đã seed |

---

### 🧪 Phase 6: Testing & Polish (03/04 → 05/04)

| Task | Ưu tiên |
|---|---|
| Test user flow hoàn chỉnh: Login → Check-in → Nghỉ phép → Phiếu lương | 🔴 Cao |
| Test RBAC: 6 roles → sidebar + dashboard khác nhau | 🔴 Cao |
| Test tạo user mới từ admin panel → user đó đăng nhập | 🔴 Cao |
| Test dark mode toàn bộ pages | 🟡 Trung |
| Test bilingual VI/EN toàn bộ pages | 🟡 Trung |
| Test responsive mobile (375px, 768px, 1440px) | ✅ Đã làm |
| Fix bugs phát sinh | 🔴 Cao |

---

### 🚀 Phase 7: Build + Deploy (05/04 → 08/04)

| Task | Lệnh / Ghi chú | Trạng thái |
|---|---|---|
| Production build check | `npm run build` | ⬜ |
| Fix build errors nếu có | — | ⬜ |
| Cấu hình `.env` production | `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` | ⬜ |
| Deploy lên Vercel/Railway | Chọn 1 platform | ⬜ |
| Setup PostgreSQL production | Railway DB hoặc Supabase | ⬜ |
| Chạy seed trên production DB | `npx tsx scripts/seed-demo-data.ts` | ⬜ |
| Verify production site | Test toàn bộ features | ⬜ |
| Chuẩn bị slide / video demo | PowerPoint + screen record | ⬜ |
| Cập nhật tài liệu UML | ERD, Class Diagram, Activity Diagram | ⬜ |

---

## ⚡ MVP tối thiểu để demo (nếu thiếu thời gian)

> [!CAUTION]
> Chỉ cần 6 tính năng này là đủ demo được:

1. ✅ **Login + RBAC** — 6 roles, đúng dashboard
2. ✅ **CRUD Nhân viên** — Thêm/sửa/xoá/xem chi tiết
3. ✅ **Check-in / Check-out** — Real-time từ DB
4. ✅ **Đơn nghỉ phép** — Tạo + duyệt
5. ✅ **Phiếu lương** — Xem + in
6. ✅ **Quản lý tài khoản** — Admin tạo user, reset password
7. ⬜ **Seed data** → **PHẢI CHẠY TRƯỚC KHI DEMO**
8. ⬜ **generate-payroll** → Tạo dữ liệu phiếu lương

---

## 🐛 Bugs đã fix (tính đến 30/03/2026)

| # | Bug | Giải pháp |
|---|---|---|
| 1 | `leaveRequestSchema` enum sai → đơn nghỉ phép fail | Bỏ strict enum, auto-tính totalDays từ ngày |
| 2 | `payslips/[id]` đọc sai field | Map đúng từ `slip.payroll.*` |
| 3 | `payslips/page.tsx` hardcoded mock | Viết lại với `getPayslipsByEmployee` |
| 4 | `avatarPath` VarChar(255) → không lưu được base64 | Đổi thành `Text`, migration applied |
| 5 | `api/forgot-password` dùng mock-auth | Rewrite với Prisma + bcrypt |
| 6 | `reset-password` dùng `clearMustChangePassword` mock | Dùng `adminResetPasswordInDB` |
| 7 | Seed roles `ketoan`/`truongphong` sai (Employee) | Đã fix → `Accountant`/`Manager` |
| 8 | Responsive layout overflow trên mobile | Đã fix → bottom nav, card layout, .table-scroll |
