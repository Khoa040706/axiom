# 🚀 SETUP – Hướng Dẫn Cài Đặt & Chạy AXIOM HRM

> **Dự án:** AXIOM — HRM & Payroll System  
> **Tech Stack:** Next.js 16 · React 19 · TypeScript · PostgreSQL 17 · Prisma 7 · NextAuth v5  
> **Nhóm:** 52400017 – 52400133 – 52400004  
> **Cập nhật:** 11/04/2026

---

## 📋 Yêu cầu hệ thống

| Công cụ | Phiên bản | Link tải |
|---------|-----------|----------|
| **Node.js** | 20.x trở lên | https://nodejs.org |
| **npm** | 10.x+ (kèm Node.js) | — |
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Git** | Bất kỳ | https://git-scm.com |

> 💡 Docker Desktop bao gồm sẵn Docker Compose. PostgreSQL sẽ chạy trong Docker container, **không cần cài riêng**.

---

## ⚙️ Bước 1 – Kiểm tra môi trường

Mở **PowerShell** hoặc **Terminal**, gõ từng lệnh:

```powershell
# Kiểm tra Node.js
node --version
# Kết quả mong đợi: v20.x.x trở lên

# Kiểm tra npm
npm --version
# Kết quả mong đợi: 10.x.x trở lên

# Kiểm tra Docker
docker --version
# Kết quả mong đợi: Docker version 2x.x.x

# Kiểm tra Docker Compose
docker compose version
# Kết quả mong đợi: Docker Compose version v2.x.x

# Kiểm tra Git
git --version
```

---

## 📥 Bước 2 – Clone dự án & Cài dependencie

```powershell
# Clone repository
git clone <URL-REPO>

# Vào thư mục Next.js project
cd 52400017_52400133_52400004/axiom

# Cài đặt dependencies
npm install
```

> ⏳ Quá trình `npm install` có thể mất 2–5 phút tùy tốc độ mạng.

---

## 🐘 Bước 3 – Khởi động PostgreSQL (Docker)

```powershell
# Đảm bảo đang ở thư mục axiom/
docker compose up -d
```

Docker sẽ khởi chạy 2 container:

| Container | Cổng | Mô tả |
|-----------|------|-------|
| `axiom_db` | `5432` | PostgreSQL 17 Alpine |
| `axiom_pgadmin` | `5050` | pgAdmin 4 (Web GUI quản lý DB) |

**Kiểm tra container đã chạy:**
```powershell
docker ps
# Phải thấy 2 container: axiom_db, axiom_pgadmin
```

**Truy cập pgAdmin (tùy chọn):**
- URL: http://localhost:5050
- Email: `admin@axiom.dev`
- Password: `admin123`

---

## 🔧 Bước 4 – Cấu hình biến môi trường

```powershell
# Copy file mẫu
cp .env.example .env
```

Mở file `.env` và chỉnh sửa (hoặc giữ nguyên nếu dùng Docker mặc định):

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
# Hướng dẫn lấy App Password:
#   1. Vào https://myaccount.google.com/security
#   2. Bật "Xác minh 2 bước" nếu chưa bật
#   3. Tìm "Mật khẩu ứng dụng" → Tạo mật khẩu mới → Chọn "Thư"
#   4. Copy dãy 16 ký tự vào GMAIL_APP_PASSWORD bên dưới
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

> ⚠️ `AUTH_SECRET` phải **ít nhất 32 ký tự**. Có thể generate bằng: `openssl rand -base64 32`

> ⚠️ `GMAIL_USER` và `GMAIL_APP_PASSWORD` chỉ cần thiết nếu muốn dùng tính năng **Quên mật khẩu** (gửi email thực qua SMTP).

---

## 🗄️ Bước 5 – Tạo bảng Database (Migration)

```powershell
# Chạy Prisma migrations — tạo tất cả 13 bảng
npx prisma migrate dev
```

> ✅ Sau bước này, database `axiom_hrm` đã có đầy đủ schema (13 bảng).

---

## 🌱 Bước 6 – Seed dữ liệu demo

```powershell
# Tạo 63 nhân viên + 64 tài khoản + phòng ban + chức vụ + hợp đồng + nghỉ phép...
npx tsx scripts/seed-demo-data.ts

# Tạo dữ liệu chấm công tháng 3/2026
npx tsx scripts/generate-attendance.ts

# Tính lương tháng 3/2026 (58 NV, tổng Net ~1.41 tỷ đ)
npx tsx scripts/generate-payroll.ts --month=3 --year=2026
```

**Kết quả seed:**
```
✅ 5 phòng ban | 19 chức vụ
✅ 63 nhân viên | 63 hợp đồng
✅ 1.280 records chấm công T3/2026
✅ 63 quỹ nghỉ phép | 8 đơn nghỉ | 6 chuyến công tác
✅ Payroll T3/2026: 58 NV | Tổng Net: ~1.412.561.866 đ
```

---

## ▶️ Bước 7 – Chạy Dev Server

```powershell
npm run dev
```

Mở trình duyệt tại: **http://localhost:3000** (tự chuyển tới trang đăng nhập)

---

## 👤 Tài khoản demo (sau khi seed)

### Tài khoản chính

| Vai trò | Username | Password | Dashboard |
|---------|----------|----------|-----------|
| **Admin** | `admin` | `admin` | `/dashboard` |
| **Giám đốc** | `giamdoc` | `giamdoc` | `/dashboard-director` |
| **Nhân sự** | `tp_nhansu` | `123456` | `/dashboard-hr` |
| **Kế toán** | `tp_ketoan` | `123456` | `/dashboard-accountant` |
| **Trưởng phòng** | `tp_cntt` | `123456` | `/dashboard-manager` |
| **Nhân viên** | `nv009` | `123456` | `/dashboard-employee` |

### Tài khoản bổ sung

| Username | Password | Role |
|----------|----------|------|
| `pgd1`, `pgd2` | `123456` | Director |
| `tp_kinhdoanh`, `tp_marketing` | `123456` | Manager |
| `nv009` – `nv063` | `123456` | Employee |

> 🔐 User (trừ Admin) khi đăng nhập lần đầu sẽ được yêu cầu **thiết lập Gmail cá nhân** để sử dụng tính năng quên mật khẩu.

---

## 📜 Các lệnh hay dùng

```powershell
# ── Development ──────────────────────────────────────────
npm run dev                         # Chạy dev server (port 3000)
npm run build                       # Build production
npm run start                       # Chạy production server
npm run lint                        # Kiểm tra code style

# ── Database ─────────────────────────────────────────────
npx prisma studio                   # Mở GUI quản lý DB (http://localhost:5555)
npx prisma migrate dev              # Tạo & chạy migration
npx prisma generate                 # Tạo lại Prisma Client

# ── Docker ───────────────────────────────────────────────
docker compose up -d                # Khởi động PostgreSQL & pgAdmin
docker compose down                 # Dừng containers
docker compose logs -f postgres     # Xem logs PostgreSQL

# ── Seed & Payroll ───────────────────────────────────────
npx tsx scripts/seed-demo-data.ts           # Seed dữ liệu demo (63 NV + 64 TK)
npx tsx scripts/generate-attendance.ts      # Tạo chấm công
npx tsx scripts/generate-payroll.ts         # Tính lương hàng loạt
npx tsx scripts/vary-payroll.ts             # Tạo biến động lương
npx tsx scripts/check-payroll-months.ts     # Kiểm tra payroll theo tháng
node scripts/test-db.mjs                    # Test kết nối database
```

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: `Can't reach database server at localhost:5432`
```
→ PostgreSQL Docker chưa chạy
→ Chạy: docker compose up -d
→ Kiểm tra: docker ps (phải thấy axiom_db)
```

### Lỗi: `Error: P1001 Can't reach database`
```
→ DATABASE_URL trong .env sai hoặc Docker chưa khởi động
→ Kiểm tra lại .env và chạy docker compose up -d
```

### Lỗi: `EACCES: permission denied` (khi upload avatar)
```
→ Thư mục public/uploads/avatars/ chưa tồn tại hoặc không có quyền ghi
→ Tạo thủ công: mkdir -p public/uploads/avatars
```

### Lỗi: `Error [ERR_MODULE_NOT_FOUND]` khi chạy seed
```
→ Chưa chạy npm install
→ Chạy: npm install
```

### Lỗi: `next: command not found`
```
→ Chưa cài dependencies
→ Chạy: npm install
```

### Lỗi: Edge Runtime crypto (middleware)
```
→ Đừng import auth.ts trong middleware.ts
→ middleware.ts chỉ import auth.config.ts (Edge-safe, không bcrypt)
```

---

## 📁 Cấu trúc thư mục tổng quan

```
52400017_52400133_52400004/    ← Root repository
├── README.md                  ← "Hiến pháp" dự án (đọc trước khi code)
├── docs/                      ← Tài liệu dự án
│   ├── SETUP.md               ← File này
│   ├── project-summary.md     ← Tóm tắt toàn bộ dự án
│   ├── plan.md                ← Kế hoạch phát triển
│   ├── mo-ta-de-tai.md        ← Mô tả đề tài
│   ├── bangmau.md             ← Bảng màu thiết kế
│   ├── tai-khoan-demo.md      ← Danh sách 64 tài khoản demo
│   └── thuyet-trinh.md        ← Kế hoạch thuyết trình
├── UML/                       ← UML Diagrams (Use Case, Activity, Class, ERD)
└── axiom/                     ← 🔥 NEXT.JS PROJECT
    ├── .env / .env.example    ← Biến môi trường
    ├── docker-compose.yml     ← Docker: PostgreSQL + pgAdmin
    ├── prisma/schema.prisma   ← Database schema (13 models)
    ├── prisma.config.ts       ← Prisma 7 connection config
    ├── scripts/               ← Seed & utility scripts
    ├── public/                ← Static assets (logo, avatar, cờ...)
    └── src/                   ← Source code chính
        ├── middleware.ts      ← Auth guard (Edge Runtime)
        ├── app/               ← 31 pages (App Router)
        ├── components/        ← Shared UI components
        ├── hooks/             ← Custom React hooks
        ├── lib/               ← Services + Actions + Helpers
        └── types/             ← TypeScript type definitions
```

---

## 🔄 Cập nhật code mới nhất từ Git

```powershell
# Kéo code mới về
git pull origin main

# Cài lại dependencies (nếu package.json thay đổi)
npm install

# Chạy migration (nếu schema thay đổi)
npx prisma migrate dev

# Chạy dev server
npm run dev
```

---

> 📌 **Lưu ý quan trọng:**
> - Prisma 7 sử dụng **driver adapter pattern** — connection URL được cấu hình trong `prisma.config.ts`, không phải trong `schema.prisma`
> - Middleware sử dụng `auth.config.ts` (Edge-safe) thay vì `auth.ts` (Node.js only) để tránh lỗi crypto trên Edge Runtime
> - Mỗi user (trừ Admin) khi đăng nhập lần đầu sẽ phải thiết lập Gmail cá nhân tại `/setup-email`
