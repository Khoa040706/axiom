# 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY AXIOM HRM — Từ A đến Z

> **Dự án:** AXIOM — Hệ thống Quản lý Nhân sự & Tiền lương  
> **Tech Stack:** Next.js 16 · React 19 · TypeScript · PostgreSQL 17 · Prisma 7 · NextAuth v5  
> **Nhóm:** 52400017 – 52400133 – 52400004  
> **Cập nhật:** 13/05/2026

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#-1--yêu-cầu-hệ-thống)
2. [Cài đặt công cụ](#-2--cài-đặt-công-cụ)
3. [Clone dự án & Cài dependencies](#-3--clone-dự-án--cài-dependencies)
4. [Khởi động Database (Docker)](#-4--khởi-động-database-docker)
5. [Cấu hình biến môi trường (.env)](#-5--cấu-hình-biến-môi-trường-env)
6. [Thiết lập Database (migration)](#-6--thiết-lập-database-migration)
7. [Seed dữ liệu demo](#-7--seed-dữ-liệu-demo)
8. [Chạy ứng dụng](#-8--chạy-ứng-dụng)
9. [Tài khoản demo](#-9--tài-khoản-demo)
10. [Cấu hình bổ sung](#-10--cấu-hình-bổ-sung)
11. [Xử lý lỗi thường gặp](#-11--xử-lý-lỗi-thường-gặp)

---

## 📌 1 · Yêu cầu hệ thống

Trước khi bắt đầu, máy tính cần có các công cụ sau:

| Công cụ | Phiên bản tối thiểu | Mục đích | Link tải |
|---|---|---|---|
| **Node.js** | 20.x trở lên | Chạy Next.js & TypeScript | https://nodejs.org |
| **npm** | 10.x (đi kèm Node.js) | Quản lý thư viện | (đi kèm Node.js) |
| **Docker Desktop** | Mới nhất | Chạy PostgreSQL trong container | https://www.docker.com/products/docker-desktop |
| **Git** | Bất kỳ | Quản lý mã nguồn | https://git-scm.com |

> ⚠️ **Docker Desktop** là bắt buộc. PostgreSQL sẽ chạy trong Docker container. Nếu không dùng Docker, cần cài PostgreSQL riêng.

---

## 📌 2 · Cài đặt công cụ

### 2.1. Cài Node.js

1. Vào https://nodejs.org để tải bản **LTS** (20.x trở lên)
2. Chạy file `.msi` (Windows) hoặc `.pkg` (macOS), bấm Next → Next → Finish
3. Mở lại Terminal/PowerShell sau khi cài

### 2.2. Cài Docker Desktop

1. Vào https://www.docker.com/products/docker-desktop để tải Docker Desktop
2. Cài đặt, mở lên, đăng nhập (nếu yêu cầu), chờ nó khởi động
3. Mở Docker Desktop, nhìn icon Docker ở taskbar chuyển sang **"màu xanh"** (Running)

### 2.3. Cài Git

1. Vào https://git-scm.com để tải git
2. Cài mặc định (bấm Next hết) → Finish (Mở lại Next lần Finish)

### 2.4. Kiểm tra tất cả đã cài xong

Mở **PowerShell** (Windows) hoặc **Terminal** (macOS/Linux), gõ:

```powershell
node --version          # Phải v20.x.x trở lên
npm --version           # Phải 10.x.x trở lên
docker --version        # Phải Docker version 2x.x.x trở lên
docker-compose version  # Phải Docker Compose version v2.x.x trở lên
git --version           # Phải git version 2.x.x trở lên
```

> ❌ Nếu lệnh nào báo `not found` hoặc `not recognized`, hãy cài lại công cụ đó và **mở lại Terminal**.

---

## 📌 3 · Clone dự án & Cài dependencies

```powershell
# 1. Clone repository về máy
git clone https://github.com/Khoa040706/axiom.git

# 2. Di chuyển vào thư mục dự án
cd axiom/axiom

# 3. Cài đặt tất cả thư viện (dependencies)
npm install
```

> ⏳ `npm install` có thể mất 2-5 phút tùy mạng. Đừng tắt terminal.

---

## 📌 4 · Khởi động Database (Docker)

```powershell
# Trong thư mục axiom/axiom, chạy:
docker-compose up -d
```

Lệnh này sẽ:
- Tải image PostgreSQL 17 (lần đầu mất ~1-2 phút)
- Tạo container `axiom-postgres` chạy ở port `5432`
- Tạo database `axiom_hrm` với user/password mặc định

Kiểm tra container đang chạy:
```powershell
docker ps
# Phải thấy container axiom-postgres ở trạng thái "Up"
```

---

## 📌 5 · Cấu hình biến môi trường (.env)

File `.env` đã được tạo sẵn trong thư mục `axiom/`. Kiểm tra nội dung:

```env
# Database
DATABASE_URL="postgresql://axiom:axiom123@localhost:5432/axiom_hrm?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="axiom-hrm-secret-key-2026"
```

> ⚠️ Nếu bạn thay đổi user/password PostgreSQL trong `docker-compose.yml`, phải cập nhật `DATABASE_URL` tương ứng.

---

## 📌 6 · Thiết lập Database (migration)

```powershell
# Tạo các bảng trong database từ Prisma schema
npx prisma migrate deploy

# Hoặc nếu là lần đầu thiết lập (dev):
npx prisma db push
```

Sau khi chạy xong, kiểm tra:
```powershell
npx prisma studio
# Mở trình duyệt → http://localhost:5555 để xem các bảng
```

---

## 📌 7 · Seed dữ liệu demo

```powershell
# Chạy seed script để tạo dữ liệu mẫu
npx prisma db seed
```

Seed sẽ tạo:
- Các phòng ban (IT, HR, Kế toán, ...)
- Nhân viên mẫu (10+ nhân viên)
- Tài khoản đăng nhập cho từng role
- Dữ liệu chấm công, nghỉ phép, lương mẫu

---

## 📌 8 · Chạy ứng dụng

```powershell
npm run dev
```

Mở trình duyệt → **http://localhost:3000**

> ✅ Nếu thấy trang đăng nhập AXIOM HRM → Cài đặt thành công!

---

## 📌 9 · Tài khoản demo

| Role | Username | Password | Mô tả |
|---|---|---|---|
| **Admin** | `admin` | `123456` | Quản trị hệ thống, phân quyền RBAC |
| **Giám đốc** | `giamdoc` | `123456` | Dashboard thống kê, phê duyệt |
| **Trưởng phòng NS** | `truongphong_ns` | `123456` | Quản lý nhân sự, duyệt nghỉ phép |
| **Kế toán** | `ketoan` | `123456` | Bảng lương, phiếu lương, BHXH |
| **Trưởng phòng** | `truongphong` | `123456` | Duyệt nghỉ phép phòng, chấm công |
| **Nhân viên** | `nhanvien` | `123456` | Chấm công, xin nghỉ, xem phiếu lương |

> 💡 Mỗi tài khoản sẽ thấy giao diện và menu khác nhau tùy theo quyền hạn.

---

## 📌 10 · Cấu hình bổ sung

### Thay đổi port

Mặc định app chạy ở port `3000`. Để đổi:
```powershell
# Windows
set PORT=3001 && npm run dev

# macOS/Linux
PORT=3001 npm run dev
```

### Prisma Studio (xem database)

```powershell
npx prisma studio
# Mở http://localhost:5555
```

### Reset database

```powershell
npx prisma migrate reset
# Sẽ xóa toàn bộ dữ liệu và chạy lại seed
```

---

## 📌 11 · Xử lý lỗi thường gặp

### ❌ `Can't reach database server`
```
Nguyên nhân: Docker container chưa chạy
Giải pháp: docker-compose up -d
```

### ❌ `Module not found`
```
Nguyên nhân: Chưa cài dependencies
Giải pháp: npm install
```

### ❌ `Port 3000 is already in use`
```
Nguyên nhân: Có ứng dụng khác đang dùng port 3000
Giải pháp: Tắt ứng dụng đó hoặc đổi port (xem mục 10)
```

### ❌ `NEXTAUTH_SECRET is not set`
```
Nguyên nhân: Thiếu file .env
Giải pháp: Tạo file .env theo mục 5
```

### ❌ `Prisma migrate: database does not exist`
```
Nguyên nhân: Database chưa được tạo
Giải pháp: docker-compose up -d (tạo lại container)
```

---

## 🔗 Link hữu ích

| Tài liệu | Link |
|---|---|
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://www.prisma.io/docs |
| NextAuth Docs | https://next-auth.js.org |
| Docker Docs | https://docs.docker.com |
| PostgreSQL Docs | https://www.postgresql.org/docs |

---

> **Nếu gặp vấn đề**, liên hệ nhóm qua email hoặc tạo issue trên GitHub repository.
