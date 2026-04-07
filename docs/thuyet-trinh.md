# 🎤 BÀI THUYẾT TRÌNH — AXIOM HRM & Payroll System

> **Đề tài:** Xây dựng Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp
> **Nhóm:** 52400017 · 52400133 · 52400004
> **Môn học:** Đồ án Công nghệ Phần mềm — Đại học Tôn Đức Thắng
> **Ngày nộp:** 08/04/2026

---

## 📑 DÀN BÀI THUYẾT TRÌNH (Gợi ý ~15–20 phút)

| # | Phần | Thời lượng | Người trình bày |
|---|------|-----------|----------------|
| 1 | Giới thiệu đề tài & Mục tiêu | ~2 phút | TV1 |
| 2 | Phân tích yêu cầu & Bản vẽ UML | ~4 phút | TV2 |
| 3 | Kiến trúc hệ thống & Tech stack | ~3 phút | TV3 |
| 4 | Database & Business Logic | ~3 phút | TV1 |
| 5 | Demo trực tiếp hệ thống | ~5 phút | Cả nhóm |
| 6 | Kết luận & Hướng phát triển | ~2 phút | TV1 |

---

## PHẦN 1: GIỚI THIỆU ĐỀ TÀI

### 1.1. Bối cảnh & Vấn đề

**Thực trạng doanh nghiệp vừa và nhỏ tại Việt Nam:**
- Quản lý nhân sự bằng Excel, giấy tờ → sai sót, mất dữ liệu
- Tính lương thủ công → chậm trễ, không chính xác
- Không có hệ thống chấm công tập trung → khó giám sát
- Nghỉ phép đăng ký qua giấy → quy trình rườm rà
- Ban lãnh đạo thiếu số liệu thời gian thực để ra quyết định

### 1.2. Giải pháp — AXIOM HRM

**AXIOM** (Tiên đề — sự chính xác tuyệt đối) là hệ thống **Quản lý Nhân sự và Tiền lương** toàn diện, quản lý xuyên suốt **vòng đời nhân viên**: từ ký hợp đồng → chấm công → nghỉ phép → tính lương tự động.

### 1.3. Mục tiêu cốt lõi (4 trụ cột)

| # | Mục tiêu | Mô tả |
|---|----------|-------|
| 1 | **Centralized Data** | Tập trung hóa 100% dữ liệu nhân sự vào 1 hệ thống |
| 2 | **Tự động hóa 90%** | Giảm 90% thao tác thủ công trong tính lương |
| 3 | **Bảo mật RBAC** | Phân quyền chi tiết theo 6 vai trò |
| 4 | **Dashboard Real-time** | Báo cáo trực quan, biểu đồ cho ban lãnh đạo |

### 1.4. Phân công nhóm

| Thành viên | MSSV | Vai trò | Phân hệ phụ trách |
|---|---|---|---|
| **Thành viên 1** | 52400017 | Team Lead + Full-stack | Core HR + DevOps |
| **Thành viên 2** | 52400133 | Full-stack | Time & Attendance + Dashboard |
| **Thành viên 3** | 52400004 | Full-stack | Payroll + Auth/RBAC |

---

## PHẦN 2: PHÂN TÍCH YÊU CẦU & BẢN VẼ UML

### 2.1. Bốn phân hệ nghiệp vụ

```
┌─────────────────────────────────────────────────────────────────┐
│                    AXIOM HRM & PAYROLL SYSTEM                    │
├─────────────┬──────────────┬──────────────┬─────────────────────┤
│  🅰️ Core HR  │  🅱️ Time &    │  🅲️ Payroll   │  🅳️ Báo cáo &      │
│             │  Attendance  │             │  Quản trị           │
├─────────────┼──────────────┼──────────────┼─────────────────────┤
│ • Nhân viên │ • Chấm công  │ • Cấu hình  │ • 6 Dashboard       │
│ • Phòng ban │ • Check-in/  │   BHXH/BHYT │ • Export Excel/PDF  │
│ • Chức vụ   │   Check-out  │ • Tính lương│ • Quản lý tài khoản │
│ • Hợp đồng  │ • Nghỉ phép  │   Gross→Net │ • Phân quyền RBAC   │
│ • Lịch sử   │ • Công tác   │ • Phiếu     │ • Profile cá nhân   │
│   công tác  │   phí        │   lương PDF │ • Forgot password   │
└─────────────┴──────────────┴──────────────┴─────────────────────┘
```

### 2.2. Chi tiết từng phân hệ

#### 🅰️ Phân hệ 1: Quản lý Hồ sơ Nhân sự (Core HR) — 9 trang

| Chức năng | Route | Mô tả |
|---|---|---|
| Danh sách nhân viên | `/employees` | CRUD + tìm kiếm tiếng Việt + lọc phòng ban + phân trang |
| Chi tiết nhân viên | `/employees/[id]` | Thông tin đầy đủ + hợp đồng + lịch sử |
| Thêm nhân viên | `/employees/new` | Form validation Zod |
| Quản lý phòng ban | `/departments` | CRUD + soft delete (isActive) |
| Quản lý chức vụ | `/positions` | CRUD + gán cho nhân viên |
| Hợp đồng lao động | `/contracts` | CRUD + **cảnh báo hết hạn 30 ngày** |
| Chi tiết hợp đồng | `/contracts/[id]` | Bậc lương, phụ cấp, thời hạn |
| Lịch sử công tác | `/career-history` | Timeline: thăng chức, điều chuyển, khen thưởng, kỷ luật |
| Công tác phí | `/business-trips` | Quản lý lệnh công tác + phê duyệt |

#### 🅱️ Phân hệ 2: Quản lý Thời gian & Nghỉ phép — 4 trang

| Chức năng | Route | Mô tả |
|---|---|---|
| Bảng chấm công tháng | `/attendance` | Tổng hợp ngày công, OT, đi muộn + xuất PDF |
| Check-in / Check-out | `/attendance/check-in` | Ghi nhận vào/ra real-time + tính lateMinutes tự động |
| Danh sách nghỉ phép | `/leave` | Danh sách đơn + duyệt/từ chối + trừ quỹ phép |
| Tạo đơn nghỉ phép | `/leave/request` | Chọn loại (Nghỉ năm, Việc riêng, Ốm) + xem quỹ còn |

#### 🅲️ Phân hệ 3: Quản lý Tiền lương — 4 trang

| Chức năng | Route | Mô tả |
|---|---|---|
| Bảng lương Gross→Net | `/payroll` | Tổng hợp công → tính lương tự động cho toàn bộ NV |
| Cấu hình lương | `/payroll/config` | Thiết lập tỷ lệ BHXH/BHYT/BHTN/Thuế |
| Danh sách phiếu lương | `/payslips` | Xem phiếu lương theo tháng |
| Chi tiết phiếu lương | `/payslips/[id]` | Chi tiết Gross→Net + in/xuất PDF |

**⭐ Công thức tính lương (theo quy định VN 2026):**
```
Gross    = (Lương cơ bản × Hệ số lương) + Phụ cấp + Tiền OT
BHXH     = Gross × 8%       ← Người lao động đóng
BHYT     = Gross × 1.5%
BHTN     = Gross × 1%
Giảm trừ = 11.000.000đ/tháng + 4.400.000đ × Số người phụ thuộc
Thuế TNCN = Biểu lũy tiến 7 bậc (5% → 35%)
Net      = Gross − BHXH − BHYT − BHTN − Thuế TNCN − Khấu trừ khác
OT pay   = (Lương cơ bản × Hệ số / 26 ngày / 8 giờ) × 1.5 × Giờ OT
```

#### 🅳️ Phân hệ 4: Báo cáo & Quản trị — 14 trang

| Chức năng | Route | Mô tả |
|---|---|---|
| Dashboard Admin | `/dashboard` | KPI tổng quan + biểu đồ nhân sự + quỹ lương |
| Dashboard HR | `/dashboard-hr` | Đơn nghỉ phép + biến động nhân sự |
| Dashboard Kế toán | `/dashboard-accountant` | Quỹ lương + biểu đồ chi phí |
| Dashboard Giám đốc | `/dashboard-director` | Tổng quan doanh nghiệp |
| Dashboard Trưởng phòng | `/dashboard-manager` | Quản lý phòng ban |
| Dashboard Nhân viên | `/dashboard-employee` | Thông tin cá nhân + phiếu lương |
| Quản lý tài khoản | `/settings/users` | CRUD user + gán role + reset password |
| Hồ sơ cá nhân | `/profile` | Đổi thông tin + đổi mật khẩu + crop avatar |
| Thiết lập Gmail | `/setup-email` | Bắt buộc khi đăng nhập lần đầu |
| Settings | `/settings` | Cài đặt hệ thống |

### 2.3. Bản vẽ UML (đã hoàn thành)

#### Use Case Diagrams — 5 bản vẽ

| # | File | Nội dung |
|---|------|---------|
| 1 | `UML/Usecase/usecasetongquan.html` | **Tổng quan toàn hệ thống** — 6 Actor × 4 phân hệ |
| 2 | `UML/Usecase/usecase_corehr.html` | Use Case — Quản lý Hồ sơ Nhân sự |
| 3 | `UML/Usecase/usecase_timeattendance.html` | Use Case — Chấm công & Nghỉ phép |
| 4 | `UML/Usecase/usecase_payroll.html` | Use Case — Tiền lương |
| 5 | `UML/Usecase/usecase_baocao.html` | Use Case — Báo cáo & Quản trị |

#### Activity Diagrams — 4 bản vẽ (JPG + HTML tương tác)

| # | File | Nội dung |
|---|------|---------|
| 1 | `Activity Diagram Core HR.jpg` | Luồng xử lý Core HR |
| 2 | `Activity Diagram Time & Attendance.jpg` | Luồng chấm công & nghỉ phép |
| 3 | `Activity Diagram Payroll.jpg` | Luồng tính lương Gross→Net |
| 4 | `Activity Diagram Report.jpg` | Luồng xuất báo cáo |

> ⚠️ **Class Diagram** và **ERD**: Thư mục đã tạo, có thể generate từ Prisma schema.

---

## PHẦN 3: KIẾN TRÚC HỆ THỐNG & TECH STACK

### 3.1. Kiến trúc 3 lớp

```
┌────────────────────────────────────────────────┐
│         🎨 LỚP 1: PRESENTATION LAYER           │
│   React 19 · Next.js 16 App Router · Tailwind  │
│   31 page files · 3 layouts · Responsive       │
├────────────────────────────────────────────────┤
│         💼 LỚP 2: BUSINESS LOGIC LAYER          │
│   10 Services · 11 Server Actions · 5 Validators│
│   payroll-calculator.ts · search.ts · helpers   │
├────────────────────────────────────────────────┤
│         🗄️ LỚP 3: DATA ACCESS LAYER             │
│   Prisma 7 ORM · PostgreSQL 17 · 13 Models     │
│   @prisma/adapter-pg · 2 Migrations            │
└────────────────────────────────────────────────┘
```

### 3.2. Tech Stack chính

| Lớp | Công nghệ | Phiên bản | Vai trò |
|-----|-----------|-----------|---------|
| **Framework** | Next.js | 16.2.1 | Full-stack (App Router + Server Actions) |
| **UI** | React | 19.2.4 | Server & Client Components |
| **Language** | TypeScript | 5 | Type-safe toàn bộ codebase |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS + responsive |
| **Icons** | Lucide React | 1.7.0 | 1500+ SVG icons |
| **Charts** | Recharts | 3.8.1 | Biểu đồ dashboard (Bar, Line, Pie) |
| **ORM** | Prisma | 7.6.0 | Type-safe DB queries + migrations |
| **Database** | PostgreSQL | 17 | Docker container |
| **Auth** | NextAuth v5 | 5.0.0-beta.30 | JWT session + RBAC |
| **Hash** | bcryptjs | 3.0.3 | Password hashing |
| **Email** | nodemailer | 8.0.4 | Gửi email quên mật khẩu |
| **Export** | @react-pdf/renderer + exceljs | latest | Xuất phiếu lương PDF, báo cáo Excel |
| **Validation** | Zod | 4.3.6 | Schema validation client+server |

### 3.3. Luồng xác thực (Auth Flow)

```
                    ┌──────────────┐
                    │  Đăng nhập   │
                    │  /login      │
                    └──────┬───────┘
                           │ username + password
                    ┌──────▼───────┐
                    │  NextAuth v5 │
                    │ bcrypt.compare│
                    └──────┬───────┘
                           │ ✅ Thành công
                    ┌──────▼───────┐
              ┌─────┤  JWT Token   ├─────┐
              │     │ role, empId  │     │
              │     │ dashboardPath│     │
              │     │ personalEmail│     │
              │     └──────────────┘     │
              │                          │
     ┌────────▼────────┐       ┌────────▼────────┐
     │ Có personalEmail│       │ Chưa có email   │
     │ → Dashboard     │       │ → /setup-email  │
     │   theo role     │       │  (bắt buộc)     │
     └─────────────────┘       └─────────────────┘
```

### 3.4. Phân quyền RBAC — 6 vai trò

| Chức năng | Admin | Director | HRManager | Accountant | Manager | Employee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard toàn bộ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dashboard riêng | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRUD nhân viên | ✅ | 👁️ | ✅ | 👁️ | 👁️ | 👁️ mình |
| Duyệt nghỉ phép | ✅ | ❌ | ✅ | ❌ | ✅ phòng | ❌ |
| Tính lương | ✅ | 👁️ | ❌ | ✅ | ❌ | ❌ |
| Phiếu lương | ✅ | ✅ | ✅ | ✅ | 👁️ phòng | 👁️ mình |
| Quản lý tài khoản | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export báo cáo | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## PHẦN 4: DATABASE & BUSINESS LOGIC

### 4.1. Database Schema — 13 bảng

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ departments │←────│  employees   │────→│  positions  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                      ↑    │    ↑
              ┌───────┘    │    └───────┐
              │            │            │
      ┌───────┴──┐  ┌──────┴───┐  ┌────┴──────┐
      │ contracts│  │attendance│  │leave_req  │
      └──────────┘  └──────────┘  └───────────┘
              │            │
      ┌───────┴──┐  ┌──────┴────┐     ┌──────────┐
      │  users   │  │  payroll  │────→│ payslips │
      └──────────┘  └───────────┘     └──────────┘
              │
      ┌───────┴───────┐  ┌─────────────┐  ┌──────────────┐
      │career_history │  │leave_balance│  │business_trips│
      └───────────────┘  └─────────────┘  └──────────────┘
                                           ┌──────────────┐
                                           │salary_config │
                                           └──────────────┘
```

### 4.2. Services Layer (10 file — Lớp BLL)

| Service | Số method | Chức năng chính |
|---------|-----------|-----------------|
| `employee.service.ts` | 6 | CRUD + search/filter/pagination |
| `contract.service.ts` | 6 | CRUD + cảnh báo hết hạn 30 ngày |
| `attendance.service.ts` | 5 | Check-in/out + tự động tính lateMinutes, otHours |
| `leave.service.ts` | 5 | Tạo đơn + duyệt + tự động trừ quỹ phép |
| `payroll.service.ts` | 4 | Tính lương Gross→Net tự động |
| `payslip.service.ts` | 5 | CRUD phiếu lương + markViewed |
| `user.service.ts` | 14 | Quản lý tài khoản + createWithEmployee (transaction) |
| `department.service.ts` | 4 | CRUD + soft delete |
| `career-history.service.ts` | 5 | CRUD + auto-update Employee |
| `dashboard.service.ts` | 5 | Aggregate KPI + charts data |

### 4.3. Dữ liệu demo đã seed

```
✅ 5 phòng ban (CNTT, Nhân sự, Kế toán-TC, Kinh doanh, Marketing)
✅ 19 chức vụ
✅ 63 nhân viên (3 GĐ + 5 Trưởng phòng + 50 NV + 5 Thử việc)
✅ 63 hợp đồng lao động
✅ 64 tài khoản (1 Admin + 63 NV)
✅ 1.280 records chấm công T3/2026
✅ 63 quỹ nghỉ phép | 8 đơn nghỉ | 6 chuyến công tác
✅ Payroll T3/2026: 58 NV — Tổng Net: 1.412.561.866 đ
```

---

## PHẦN 5: DEMO TRỰC TIẾP

### 5.1. Kịch bản demo (5 phút)

**Bước 1 — Đăng nhập (30s)**
- Login `admin` / `admin` → vào Dashboard Admin
- Chỉ ra: 6 role có 6 dashboard khác nhau

**Bước 2 — Core HR (1 phút)**
- Vào `/employees` → tìm kiếm tiếng Việt (gõ không dấu tìm được có dấu)
- Bấm xem chi tiết 1 nhân viên
- Vào `/contracts` → chỉ ra cảnh báo hợp đồng sắp hết hạn

**Bước 3 — Chấm công & Nghỉ phép (1 phút)**
- Logout → Login `nv009` / `123456` (nhân viên)
- Vào `/attendance/check-in` → bấm Check-in
- Vào `/leave/request` → tạo đơn nghỉ phép → xem quỹ phép

**Bước 4 — Tính lương (1 phút)**
- Login `tp_ketoan` / `123456` (Kế toán)
- Vào `/payroll` → xem bảng lương T3/2026 (Gross → Net)
- Vào `/payslips/[id]` → xem chi tiết phiếu lương → in PDF

**Bước 5 — Quản trị (1 phút)**
- Login `admin` → `/settings/users` → tạo user mới → đổi role
- Toggle dark mode / chuyển ngôn ngữ VI ↔ EN
- Profile → upload avatar → crop modal

**Bước 6 — Responsive (30s)**
- Thu nhỏ trình duyệt → hiện bottom nav + card layout

### 5.2. Tài khoản demo nhanh (6 roles)

| Role | Username | Password | Dashboard |
|------|----------|----------|-----------|
| Admin | `admin` | `admin` | `/dashboard` |
| Director | `giamdoc` | `giamdoc` | `/dashboard-director` |
| HRManager | `tp_nhansu` | `123456` | `/dashboard-hr` |
| Accountant | `tp_ketoan` | `123456` | `/dashboard-accountant` |
| Manager | `tp_cntt` | `123456` | `/dashboard-manager` |
| Employee | `nv009` | `123456` | `/dashboard-employee` |

---

## PHẦN 6: KẾT LUẬN

### 6.1. Kết quả đạt được

| Hạng mục | Kết quả |
|----------|---------|
| Tổng số trang | **31 page files** + 8 API routes |
| Database | **13 bảng**, 100% dùng Prisma ORM thật |
| Responsive | ✅ Desktop + Tablet + Mobile |
| Dark/Light mode | ✅ Toàn hệ thống |
| Song ngữ VI/EN | ✅ Toàn hệ thống |
| Bảo mật | ✅ RBAC 6 roles + bcrypt + JWT + Edge Middleware |
| Email integration | ✅ Gửi email thật qua Gmail SMTP |
| Export | ✅ PDF phiếu lương + Excel báo cáo |
| Bugs đã fix | **9 bugs** |

### 6.2. Tính năng nổi bật

1. **Tính lương tự động** — Đúng công thức thuế TNCN 7 bậc theo luật VN
2. **Cảnh báo hợp đồng** — Auto-detect hợp đồng sắp hết hạn 30 ngày
3. **Tìm kiếm tiếng Việt** — Gõ không dấu vẫn tìm được có dấu (`hoang` → `Hoàng`)
4. **Avatar Crop Modal** — Kéo + zoom + cắt tròn ngay trên trình duyệt
5. **Quên mật khẩu** — Gửi email thật qua Gmail SMTP với template đẹp
6. **Edge Middleware** — Bảo vệ route + bắt buộc thiết lập email khi login lần đầu
7. **6 Dashboard riêng biệt** — Mỗi role có dashboard phù hợp với công việc

### 6.3. Quá trình phát triển (Timeline)

| Giai đoạn | Thời gian | Công việc chính |
|-----------|-----------|-----------------|
| **Phase 1**: Phân tích & Thiết kế | 24–27/03 | Phân tích yêu cầu, vẽ UML, thiết kế DB schema |
| **Phase 2**: Setup & Scaffold | 27–28/03 | Khởi tạo Next.js, Prisma, Docker, Auth, cấu trúc thư mục |
| **Phase 3**: Core Development | 28–30/03 | Code 4 phân hệ (31 pages), services, actions |
| **Phase 4**: Seed & Integration | 30–31/03 | Seed 63 NV, generate payroll, tích hợp toàn bộ DB |
| **Phase 5**: Fix & Polish | 31/03–03/04 | Fix 9 bugs, career-history, business-trips DB thật |
| **Phase 6**: Testing | 03–05/04 | Test RBAC, responsive, dark mode, user flows |
| **Phase 7**: Final Features | 05–07/04 | Setup-email, upload-avatar, forgot-password email, search VN |

### 6.4. Hướng phát triển tương lai

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | Deploy production | Vercel + Railway PostgreSQL |
| 2 | Mobile App | React Native chia sẻ business logic |
| 3 | Biểu đồ nâng cao | Phân tích xu hướng nhân sự, turnover rate |
| 4 | Tích hợp máy chấm công | API kết nối máy vân tay/thẻ từ |
| 5 | Quản lý KPI | Đánh giá hiệu suất nhân viên |
| 6 | Chatbot HR | Tự động trả lời câu hỏi về chế độ, lương |
| 7 | Multi-tenant | Phục vụ nhiều doanh nghiệp trên 1 platform |

### 6.5. Bài học kinh nghiệm

- **Prisma 7 driver adapter** — Cần tách config edge-safe vs Node.js
- **Server Actions** — Ưu việt hơn API routes cho CRUD mutations
- **Responsive-first** — Thiết kế mobile trước, mở rộng ra desktop
- **Seed data sớm** — Seed dữ liệu từ đầu giúp test & demo hiệu quả
- **Vietnamese search** — NFD decomposition giải quyết vấn đề tìm kiếm tiếng Việt

---

## PHỤ LỤC: CHUẨN BỊ TRƯỚC KHI DEMO

### Checklist trước thuyết trình

- [ ] Chạy `docker-compose up -d` (PostgreSQL container)
- [ ] Kiểm tra `.env` có đúng `DATABASE_URL` và `AUTH_SECRET`
- [ ] Chạy `npm run dev` → truy cập `http://localhost:3000`
- [ ] Test login `admin` / `admin` → vào dashboard thành công
- [ ] Mở sẵn 6 tab browser với 6 tài khoản khác nhau
- [ ] Tắt extension có thể gây lỗi (ad blocker, dark reader)
- [ ] Chuẩn bị backup plan (screenshots) nếu demo lỗi

### Câu hỏi thường gặp khi bảo vệ

| Câu hỏi | Gợi ý trả lời |
|---------|----------------|
| Tại sao chọn Next.js? | Full-stack, Server Components giảm JS client, Server Actions thay API |
| Tại sao Prisma 7? | Type-safe, auto-generate types, migration management, driver adapter mới |
| Bảo mật thế nào? | bcrypt hash password, JWT token, Edge middleware, RBAC 6 roles |
| Tính lương có chính xác? | Theo đúng biểu thuế TNCN 7 bậc Điều 22 Luật Thuế TNCN VN |
| Responsive ra sao? | 3 breakpoints (640/768/1024px), bottom nav mobile, card layout |
| Có deploy được không? | Sẵn sàng deploy Vercel + Railway PostgreSQL |

---

> 📌 **File này phục vụ bài thuyết trình bảo vệ đồ án ngày 08/04/2026.**
> Tham khảo thêm: `docs/project-summary.md` (chi tiết kỹ thuật đầy đủ)
