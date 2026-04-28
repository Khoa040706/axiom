# 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY AXIOM HRM — Từ A đến Z

> **Dự án:** AXIOM — Hệ thống Quản lý Nhân sự & Tiền lương  
> **Tech Stack:** Next.js 16 · React 19 · TypeScript · PostgreSQL 17 · Prisma 7 · NextAuth v5  
> **Nhóm:** 52400017 – 52400133 – 52400004  
> **Cập nhật:** 28/04/2026

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#-1--yêu-cầu-hệ-thống)
2. [Cài đặt công cụ](#-2--cài-đặt-công-cụ)
3. [Clone dự án & Cài dependencies](#-3--clone-dự-án--cài-dependencies)
4. [Khởi động Database (Docker)](#-4--khởi-động-database-docker)
5. [Cấu hình biến môi trường (.env)](#-5--cấu-hình-biến-môi-trường-env)
6. [Tạo bảng Database (Migration)](#%EF%B8%8F-6--tạo-bảng-database-migration)
7. [Seed dữ liệu demo](#-7--seed-dữ-liệu-demo)
8. [Chạy ứng dụng](#-8--chạy-ứng-dụng)
9. [Tài khoản đăng nhập demo](#-9--tài-khoản-đăng-nhập-demo)
10. [Các lệnh hay dùng](#-10--các-lệnh-hay-dùng)
11. [Cấu trúc thư mục](#-11--cấu-trúc-thư-mục)
12. [Xử lý lỗi thường gặp](#-12--xử-lý-lỗi-thường-gặp)
13. [Cập nhật code từ Git](#-13--cập-nhật-code-từ-git)
14. [Lưu ý kỹ thuật quan trọng](#-14--lưu-ý-kỹ-thuật-quan-trọng)

---

## 📋 1 — Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy đã cài đủ các công cụ sau:

| Công cụ | Phiên bản tối thiểu | Mục đích | Link tải |
|---------|---------------------|----------|----------|
| **Node.js** | 20.x trở lên | Chạy Next.js & TypeScript | https://nodejs.org |
| **npm** | 10.x+ (kèm Node.js) | Quản lý thư viện | _(cài kèm Node.js)_ |
| **Docker Desktop** | Latest | Chạy PostgreSQL trong container | https://www.docker.com/products/docker-desktop |
| **Git** | Bất kỳ | Quản lý mã nguồn | https://git-scm.com |

> 💡 **Docker Desktop** đã bao gồm sẵn Docker Compose. PostgreSQL sẽ chạy trong Docker container — **không cần cài PostgreSQL riêng lên máy**.

---

## 🔧 2 — Cài đặt công cụ

### 2.1. Cài Node.js

1. Vào https://nodejs.org → Tải bản **LTS** (20.x trở lên)
2. Chạy file `.msi` (Windows) hoặc `.pkg` (macOS) → Next → Next → Finish
3. **Khởi động lại Terminal/PowerShell** sau khi cài

### 2.2. Cài Docker Desktop

1. Vào https://www.docker.com/products/docker-desktop → Tải Docker Desktop
2. Cài đặt và **khởi động lại máy** khi được yêu cầu
3. Mở Docker Desktop, đợi icon Docker ở taskbar chuyển sang **màu xanh** (Running)

### 2.3. Cài Git

1. Vào https://git-scm.com → Tải Git
2. Cài đặt với cấu hình mặc định (Next → Next → Finish)

### 2.4. Kiểm tra tất cả đã cài xong

Mở **PowerShell** (Windows) hoặc **Terminal** (macOS/Linux), gõ từng lệnh:

```powershell
node --version          # → v20.x.x trở lên ✅
npm --version           # → 10.x.x trở lên ✅
docker --version        # → Docker version 2x.x.x ✅
docker compose version  # → Docker Compose version v2.x.x ✅
git --version           # → git version 2.x.x ✅
```

> ⚠️ Nếu lệnh nào báo `not found` hoặc `not recognized`, hãy cài lại công cụ đó và **khởi động lại Terminal**.

---

## 📥 3 — Clone dự án & Cài dependencies

```powershell
# 1. Clone repository về máy
git clone <URL-REPO>

# 2. Di chuyển vào thư mục Next.js project
cd 52400017_52400133_52400004/axiom

# 3. Cài đặt tất cả thư viện (39 packages)
npm install
```

> ⏳ Lệnh `npm install` sẽ mất **2–5 phút** tùy tốc độ mạng. Sau khi xong sẽ xuất hiện thư mục `node_modules/`.
>
> ⚠️ Nếu gặp lỗi **`ERESOLVE could not resolve`** (xung đột phiên bản nodemailer), chạy lại bằng:
> ```powershell
> npm install --legacy-peer-deps
> ```
> File `.npmrc` trong project đã được cấu hình sẵn `legacy-peer-deps=true` để tự xử lý. Nếu vẫn lỗi, xóa cache và thử lại:
> ```powershell
> rm -rf node_modules package-lock.json
> npm install --legacy-peer-deps
> ```

**Kiểm tra cài thành công:**
```powershell
# Phải thấy thư mục node_modules tồn tại
ls node_modules
```

---

## 🐘 4 — Khởi động Database (Docker)

> ⚠️ **Bắt buộc:** Docker Desktop phải đang **chạy** (icon xanh ở taskbar) trước khi thực hiện bước này.

```powershell
# Đảm bảo đang ở thư mục axiom/
docker compose up -d
```

Lệnh này sẽ tự động tải image PostgreSQL 17 và pgAdmin 4 về máy (lần đầu mất ~2 phút), sau đó khởi chạy 2 container:

| Container | Cổng | Mục đích |
|-----------|------|----------|
| `axiom_db` | `5432` | PostgreSQL 17 Alpine — database chính |
| `axiom_pgadmin` | `5050` | pgAdmin 4 — giao diện web quản lý DB (tùy chọn) |

**Kiểm tra container đã chạy:**
```powershell
docker ps
```
Phải thấy 2 dòng: `axiom_db` (STATUS: Up) và `axiom_pgadmin` (STATUS: Up).

**Truy cập pgAdmin (tùy chọn — để xem DB bằng giao diện web):**
- URL: http://localhost:5050
- Email: `admin@axiom.dev`
- Password: `admin123`

---

## 🔑 5 — Cấu hình biến môi trường (.env)

```powershell
# Copy file mẫu thành file .env
cp .env.example .env
```

Mở file `.env` bằng bất kỳ text editor nào (VSCode, Notepad++...) và kiểm tra nội dung:

```env
# ── DATABASE ──────────────────────────────────────────────────────
DATABASE_URL="postgresql://axiom:axiom_password@localhost:5432/axiom_hrm?schema=public"

# ── AUTHENTICATION ────────────────────────────────────────────────
AUTH_SECRET="your-super-secret-key-change-in-production-min-32-chars"
AUTH_URL="http://localhost:3000"

# ── APP CONFIG ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME="AXIOM HRM"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── GMAIL SMTP (cho tính năng Quên mật khẩu) ─────────────────────
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

### Giải thích từng biến:

| Biến | Mô tả | Cần thay đổi? |
|------|-------|---------------|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL Docker | ❌ Giữ nguyên nếu dùng Docker mặc định |
| `AUTH_SECRET` | Khóa bí mật cho NextAuth (≥32 ký tự) | ✅ Nên đổi thành chuỗi ngẫu nhiên |
| `AUTH_URL` | URL ứng dụng | ❌ Giữ nguyên |
| `GMAIL_USER` | Gmail để gửi email quên mật khẩu | ⚡ Chỉ cần nếu muốn dùng tính năng **Quên mật khẩu** |
| `GMAIL_APP_PASSWORD` | App Password của Gmail | ⚡ Chỉ cần nếu muốn dùng tính năng **Quên mật khẩu** |

> 💡 **Tạo AUTH_SECRET ngẫu nhiên:**
> ```powershell
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

> 📧 **Hướng dẫn lấy Gmail App Password** (chỉ cần nếu muốn gửi email thật):
> 1. Vào https://myaccount.google.com/security
> 2. Bật "Xác minh 2 bước" nếu chưa bật
> 3. Tìm "Mật khẩu ứng dụng" → Tạo mật khẩu mới → Chọn "Thư"
> 4. Copy dãy 16 ký tự vào `GMAIL_APP_PASSWORD`

---

## 🗄️ 6 — Tạo bảng Database (Migration)

```powershell
# Tạo tất cả 13 bảng trong database
npx prisma migrate dev
```

Khi được hỏi tên migration, có thể nhập bất kỳ (ví dụ: `init`) hoặc nhấn Enter để bỏ qua.

**Kết quả mong đợi:**
```
✅ 13 bảng đã được tạo:
   departments, positions, employees, contracts, users,
   attendance, leave_requests, leave_balance, payroll,
   payslips, career_history, business_trips, salary_config
```

> 💡 Nếu migration đã chạy trước đó, lệnh này sẽ tự phát hiện và bỏ qua.

---

## 🌱 7 — Seed dữ liệu demo

Chạy lần lượt 3 lệnh sau để tạo dữ liệu mẫu:

```powershell
# Bước 7a: Tạo nhân viên, tài khoản, phòng ban, hợp đồng, chấm công T3...
npx tsx scripts/seed-demo-data.ts

# Bước 7b: Tính lương tháng 3/2026 cho toàn bộ nhân viên
npx tsx scripts/generate-payroll.ts --month=3 --year=2026

# Bước 7c (tùy chọn): Tạo biến động lương nhiều tháng (cho biểu đồ xu hướng)
npx tsx scripts/vary-payroll.ts
```

**Kết quả sau khi seed:**
```
✅ 5 phòng ban  |  19 chức vụ
✅ 63 nhân viên (3 BGĐ + 5 Trưởng phòng + 50 NV + 5 Thử việc)
✅ 64 tài khoản (1 Admin + 63 NV)
✅ 63 hợp đồng lao động
✅ ~1.280 records chấm công T3/2026
✅ 63 quỹ nghỉ phép  |  8 đơn nghỉ phép
✅ 7 sự kiện công tác  |  6 chuyến công tác phí
✅ 7 tham số cấu hình lương VN 2026
✅ Payroll T3/2026: Tổng Net ~1.41 tỷ đ
```

> ⚠️ Script seed sẽ **xóa toàn bộ dữ liệu cũ** trước khi tạo mới. Chỉ chạy khi muốn reset data.

---

## ▶️ 8 — Chạy ứng dụng

```powershell
npm run dev
```

Mở trình duyệt tại: **http://localhost:3000**

Hệ thống sẽ tự chuyển đến trang đăng nhập. Sử dụng tài khoản demo ở bước 9 để đăng nhập.

> 💡 Nhấn `Ctrl + C` trong Terminal để dừng server.

---

## 👤 9 — Tài khoản đăng nhập demo

### 6 tài khoản thử nhanh (1 tài khoản / vai trò)

| Vai trò | Username | Mật khẩu | Dashboard | Chức năng chính |
|---------|----------|----------|-----------|-----------------|
| 👑 **Admin** | `admin` | `admin` | `/dashboard` | Quản trị toàn hệ thống, RBAC |
| 🏛️ **Giám đốc** | `giamdoc` | `giamdoc` | `/dashboard-director` | Xem KPI, biểu đồ toàn công ty |
| 👨‍💼 **Nhân sự** | `nhansu` | `nhansu` | `/dashboard-hr` | QL nhân viên, duyệt nghỉ phép |
| 💰 **Kế toán** | `ketoan` | `ketoan` | `/dashboard-accountant` | Tính lương, BH, thuế TNCN |
| 🏢 **Trưởng phòng** | `quanly` | `quanly` | `/dashboard-manager` | Chấm công, duyệt phép phòng ban |
| 👤 **Nhân viên** | `nhanvien` | `nhanvien` | `/dashboard-employee` | Chấm công, phiếu lương cá nhân |

### Tài khoản bổ sung

| Username | Mật khẩu | Role | Ghi chú |
|----------|----------|------|---------|
| `pgd1`, `pgd2` | `123456` | Director | Phó Giám đốc |
| `tp_kinhdoanh`, `tp_marketing` | `123456` | Manager | Trưởng phòng |
| `nv009` → `nv063` | `123456` | Employee | 55 nhân viên các phòng ban |

> 🔐 Tất cả user (trừ Admin) khi đăng nhập lần đầu sẽ được yêu cầu **thiết lập Gmail cá nhân** tại `/setup-email` để sử dụng tính năng quên mật khẩu. Một số tài khoản chính (`giamdoc`, `nhansu`, `ketoan`, `quanly`, `nhanvien`) đã được thiết lập sẵn.

---

## 📜 10 — Các lệnh hay dùng

### Development
```powershell
npm run dev                         # Chạy dev server (http://localhost:3000)
npm run build                       # Build production
npm run start                       # Chạy production server
npm run lint                        # Kiểm tra code style
```

### Database
```powershell
npx prisma studio                   # Mở GUI quản lý DB (http://localhost:5555)
npx prisma migrate dev              # Tạo & chạy migration mới
npx prisma generate                 # Tạo lại Prisma Client (sau khi sửa schema)
node scripts/test-db.mjs            # Test kết nối database
```

### Docker
```powershell
docker compose up -d                # Khởi động PostgreSQL & pgAdmin
docker compose down                 # Dừng containers (dữ liệu được giữ lại)
docker compose down -v              # Dừng & XÓA dữ liệu (reset hoàn toàn)
docker ps                           # Xem container đang chạy
docker compose logs -f postgres     # Xem logs PostgreSQL
```

### Seed & Payroll
```powershell
npx tsx scripts/seed-demo-data.ts               # Seed dữ liệu demo (63 NV + 64 TK)
npx tsx scripts/generate-attendance.ts           # Tạo chấm công tháng hiện tại
npx tsx scripts/generate-payroll.ts --month=3 --year=2026  # Tính lương tháng cụ thể
npx tsx scripts/vary-payroll.ts                  # Tạo biến động lương nhiều tháng
npx tsx scripts/check-payroll-months.ts          # Kiểm tra payroll theo tháng
```

---

## 📁 11 — Cấu trúc thư mục

```
52400017_52400133_52400004/         ← Root repository
├── README.md                       ← Giới thiệu dự án
├── docs/                           ← Tài liệu
│   ├── SETUP.md                    ← 📍 File này
│   ├── project-summary.md          ← Tóm tắt dự án
│   ├── tai-khoan-demo.md           ← Danh sách 64 tài khoản chi tiết
│   ├── thuyet-trinh.md             ← Nội dung thuyết trình
│   ├── mo-ta-de-tai.md             ← Mô tả đề tài
│   └── bangmau.md                  ← Bảng màu thiết kế
├── UML/                            ← Biểu đồ UML (Use Case, Activity, Class, ERD)
├── bao-cao/                        ← Báo cáo Word/PDF
└── axiom/                          ← 🔥 NEXT.JS PROJECT (thư mục chính)
    ├── .env / .env.example         ← Biến môi trường
    ├── docker-compose.yml          ← Docker: PostgreSQL + pgAdmin
    ├── package.json                ← Dependencies (39 packages)
    ├── prisma/
    │   ├── schema.prisma           ← Database schema (13 models)
    │   └── migrations/             ← SQL migrations tự động
    ├── prisma.config.ts            ← Prisma 7 connection config
    ├── scripts/                    ← 9 seed & utility scripts
    │   ├── seed-demo-data.ts       ← Tạo 63 NV + 64 TK + toàn bộ data
    │   ├── generate-attendance.ts  ← Tạo chấm công
    │   ├── generate-payroll.ts     ← Tính lương hàng loạt
    │   ├── vary-payroll.ts         ← Biến động lương nhiều tháng
    │   └── ...
    ├── public/                     ← Static assets (logo, avatar, cờ...)
    └── src/                        ← Source code chính
        ├── middleware.ts           ← Auth guard (Edge Runtime)
        ├── app/
        │   ├── (auth)/             ← Trang login, quên mật khẩu
        │   ├── (dashboard)/        ← 6 dashboards + 14 trang chức năng
        │   │   ├── layout.tsx      ← Layout chung: sidebar + header + theme
        │   │   ├── dashboard/      ← Trang chủ Admin
        │   │   ├── dashboard-director/  ← Dashboard Giám đốc / Thống kê
        │   │   ├── dashboard-hr/        ← Dashboard Nhân sự
        │   │   ├── dashboard-accountant/ ← Dashboard Kế toán
        │   │   ├── dashboard-manager/   ← Dashboard Trưởng phòng
        │   │   ├── dashboard-employee/  ← Dashboard Nhân viên
        │   │   ├── employees/      ← Quản lý nhân sự
        │   │   ├── contracts/      ← Hợp đồng lao động
        │   │   ├── career-history/ ← Quá trình công tác
        │   │   ├── attendance/     ← Chấm công
        │   │   ├── leave/          ← Nghỉ phép
        │   │   ├── payroll/        ← Bảng lương & cấu hình
        │   │   ├── payslips/       ← Phiếu lương
        │   │   ├── business-trips/ ← Công tác phí
        │   │   ├── profile/        ← Hồ sơ cá nhân
        │   │   └── settings/       ← RBAC phân quyền
        │   ├── api/                ← 10+ API routes
        │   └── setup-email/        ← Thiết lập Gmail lần đầu
        ├── components/             ← Shared UI components
        ├── hooks/                  ← Custom React hooks
        ├── lib/                    ← Server Actions, helpers, i18n
        └── types/                  ← TypeScript type definitions
```

---

## 🐛 12 — Xử lý lỗi thường gặp

### ❌ `Can't reach database server at localhost:5432`
**Nguyên nhân:** PostgreSQL Docker chưa chạy.
```powershell
# Giải pháp:
docker compose up -d         # Khởi động container
docker ps                    # Kiểm tra: phải thấy axiom_db
```

### ❌ `Error: P1001 Can't reach database`
**Nguyên nhân:** `DATABASE_URL` trong `.env` sai hoặc Docker chưa khởi động.
```powershell
# Giải pháp:
# 1. Kiểm tra Docker đang chạy: docker ps
# 2. Kiểm tra .env có đúng: DATABASE_URL="postgresql://axiom:axiom_password@localhost:5432/axiom_hrm?schema=public"
# 3. Khởi động lại: docker compose down && docker compose up -d
```

### ❌ `npm install` bị lỗi hoặc treo
```powershell
# Xóa cache và cài lại:
rm -rf node_modules package-lock.json
npm install
```

### ❌ `next: command not found` hoặc `npx: command not found`
**Nguyên nhân:** Chưa chạy `npm install` hoặc Node.js chưa cài đúng.
```powershell
npm install        # Cài lại dependencies
```

### ❌ `EACCES: permission denied` khi upload avatar
```powershell
# Tạo thư mục upload thủ công:
mkdir -p public/uploads/avatars
```

### ❌ `Error [ERR_MODULE_NOT_FOUND]` khi chạy seed
```powershell
# Chưa cài dependencies:
npm install
```

### ❌ `Edge Runtime` hoặc `crypto` error ở middleware
**Nguyên nhân:** Middleware import sai file.
```
→ middleware.ts chỉ được import auth.config.ts (Edge-safe)
→ KHÔNG import auth.ts (chứa bcrypt — chỉ chạy trên Node.js)
```

### ❌ Port 3000 đang bị chiếm
```powershell
# Tìm process đang dùng port 3000:
netstat -ano | findstr :3000
# Kết thúc process (thay PID bằng số thực tế):
taskkill /PID <PID> /F

# Hoặc chạy dev trên port khác:
npx next dev -p 3001
```

### ❌ `prisma migrate dev` bị lỗi "shadow database"
```powershell
# Reset database hoàn toàn:
docker compose down -v
docker compose up -d
# Đợi 5 giây cho DB khởi động
npx prisma migrate dev
```

---

## 🔄 13 — Cập nhật code từ Git

Khi có code mới từ thành viên khác:

```powershell
# 1. Kéo code mới
git pull origin main

# 2. Cài lại dependencies (nếu package.json thay đổi)
npm install

# 3. Chạy migration (nếu schema.prisma thay đổi)
npx prisma migrate dev

# 4. Chạy dev server
npm run dev
```

---

## 📌 14 — Lưu ý kỹ thuật quan trọng

### Prisma 7 — Driver Adapter Pattern
- Connection URL được cấu hình trong `prisma.config.ts`, **không phải** trong `schema.prisma`
- File `schema.prisma` chỉ khai báo `provider = "postgresql"` mà không có `url`
- Khi chạy seed scripts, connection URL được đọc từ biến `DATABASE_URL` trong `.env`

### NextAuth v5 — Edge Runtime
- `middleware.ts` sử dụng `auth.config.ts` (Edge-safe) thay vì `auth.ts`
- `auth.ts` chứa bcrypt (Node.js only) — **không được import trong middleware**

### Thiết lập Gmail lần đầu
- Mỗi user (trừ Admin) khi đăng nhập lần đầu sẽ được redirect đến `/setup-email`
- Yêu cầu nhập Gmail cá nhân để kích hoạt tính năng "Quên mật khẩu"
- Các tài khoản chính (`giamdoc`, `nhansu`, `ketoan`, `quanly`, `nhanvien`) đã được thiết lập sẵn, không cần setup lại

### Song ngữ (Bilingual)
- Hệ thống hỗ trợ **Tiếng Việt** và **Tiếng Anh**
- Chuyển đổi bằng nút cờ 🇻🇳/🇬🇧 trên header
- Tất cả labels, messages, biểu đồ, PDF đều được dịch

### Dark Mode
- Chuyển đổi sáng/tối bằng nút ☀️/🌙 trên header
- Toàn bộ giao diện (sidebar, cards, biểu đồ, tables) đều hỗ trợ

---

## ⚡ TÓM TẮT NHANH — 8 lệnh để chạy từ đầu

```powershell
git clone <URL-REPO>                                    # 1. Clone
cd 52400017_52400133_52400004/axiom                     # 2. Vào thư mục
npm install                                             # 3. Cài thư viện
docker compose up -d                                    # 4. Khởi động DB
cp .env.example .env                                    # 5. Tạo file .env
npx prisma migrate dev                                  # 6. Tạo bảng
npx tsx scripts/seed-demo-data.ts                       # 7a. Seed data
npx tsx scripts/generate-payroll.ts --month=3 --year=2026  # 7b. Tính lương
npm run dev                                             # 8. Chạy app → localhost:3000
```

**Đăng nhập thử:** `admin` / `admin` → Trang chủ Admin với đầy đủ dữ liệu demo.

---

> 📖 Xem thêm: [tai-khoan-demo.md](./tai-khoan-demo.md) — Danh sách chi tiết 64 tài khoản với chức năng từng role.
