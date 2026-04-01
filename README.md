<div align="center">

# ⚡ AXIOM — HRM & Payroll System

### Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com/)

**Nhóm:** `52400017` · `52400133` · `52400004`
**Môn học:** Đồ án Công nghệ Phần mềm — TDTU

</div>

---

> [!CAUTION]
> ## 🚨 QUY ĐỊNH BẮT BUỘC — ĐỌC TRƯỚC KHI CODE
>
> **Mọi thành viên trong nhóm và mọi AI agent (Gemini, Copilot, Claude...) khi tham gia chỉnh sửa code của dự án này đều PHẢI ĐỌC TOÀN BỘ file `README.md` này TRƯỚC KHI thực hiện bất kỳ thay đổi nào.**
>
> Đây là **"hiến pháp" của dự án** — quy định về:
> - ✅ Tech stack được sử dụng (KHÔNG thay đổi tech stack khi chưa có sự đồng ý của cả nhóm)
> - ✅ Cấu trúc thư mục & cách đặt tên file
> - ✅ Coding convention (naming, component structure)
> - ✅ Kiến trúc 3 lớp (UI → Service → Prisma)
> - ✅ Phân quyền RBAC
> - ✅ Công thức tính lương VN
>
> **Vi phạm quy tắc = Code sẽ bị reject khi review.**

---

## 📖 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tech Stack](#-tech-stack)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [4 Phân hệ nghiệp vụ](#-4-phân-hệ-nghiệp-vụ)
- [Database Schema](#-database-schema)
- [Phân quyền RBAC](#-phân-quyền-rbac)
- [Quy tắc code](#-quy-tắc-code)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Scripts](#-scripts)
- [Biến môi trường](#-biến-môi-trường)
- [Tài liệu & UML](#-tài-liệu--uml)

---

## 🎯 Giới thiệu

**AXIOM** (Tiên đề — sự chính xác tuyệt đối) là hệ thống quản lý nhân sự và tiền lương toàn diện, xây dựng trên nền tảng **Web Application** hiện đại. Hệ thống quản lý xuyên suốt vòng đời nhân viên: từ ký hợp đồng, chấm công hàng ngày, quản lý nghỉ phép, đến tính lương tự động theo đúng quy định pháp luật Việt Nam.

### Mục tiêu
- **Centralized Data** — Tập trung hóa toàn bộ dữ liệu nhân sự
- **Tự động hóa** — Giảm 90% thao tác thủ công trong tính lương
- **Bảo mật** — Phân quyền RBAC chi tiết theo vai trò
- **Trực quan** — Dashboard & báo cáo real-time cho ban lãnh đạo

---

## 🚀 Tech Stack

### Core Framework
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Next.js** | `15.x` | Full-stack React framework (App Router + Server Actions) |
| **React** | `19.x` | UI library với Server Components & Suspense |
| **TypeScript** | `5.7+` | Ngôn ngữ chính — Type-safe toàn bộ codebase |

### Frontend UI
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Tailwind CSS** | `4.x` | Utility-first CSS framework |
| **shadcn/ui** | `latest` | Component library (Dialog, Table, Form, Select, Toast...) |
| **Radix UI** | `latest` | Headless accessible UI primitives (nền tảng của shadcn) |
| **Lucide React** | `latest` | Icon library (~1500 icons SVG) |
| **Recharts** | `2.x` | Dashboard charts (Bar, Line, Pie, Area) |
| **React Hook Form** | `7.x` | Quản lý form phức tạp, performant |
| **Zod** | `3.x` | Schema validation — dùng cho cả client lẫn server |

### Backend & Database
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Next.js Server Actions** | built-in | Server-side logic, mutations |
| **Next.js API Routes** | built-in | RESTful endpoints khi cần |
| **Prisma ORM** | `6.x` | Type-safe database access, migrations, seeding |
| **PostgreSQL** | `17.x` | Primary relational database |
| **NextAuth.js (Auth.js)** | `5.x` | Authentication + session management |
| **bcryptjs** | `latest` | Password hashing |

### Utilities
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **date-fns** | `4.x` | Xử lý date/time (chấm công, hợp đồng) |
| **@react-pdf/renderer** | `latest` | Xuất phiếu lương PDF |
| **xlsx / exceljs** | `latest` | Export báo cáo Excel |
| **sonner** | `latest` | Toast notifications đẹp |
| **nuqs** | `latest` | Type-safe URL search params |

### DevOps & Tooling
| Công nghệ | Vai trò |
|---|---|
| **Docker** + **Docker Compose** | Containerize app + PostgreSQL |
| **ESLint** + **Prettier** | Code linting & formatting |
| **Git** + **GitHub** | Version control |
| **Vercel** | Deploy frontend (optional) |
| **pnpm** | Package manager (nhanh hơn npm) |

---

## 🏛️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│         React 19 + Server Components + CSR           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│               NEXT.JS 15 SERVER                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ App Router  │  │Server Actions│  │ API Routes │  │
│  │  (Pages)    │  │ (Mutations)  │  │  (REST)    │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                │                │          │
│  ┌──────▼────────────────▼────────────────▼──────┐  │
│  │          SERVICE LAYER (Business Logic)        │  │
│  │  payroll.service · attendance.service · ...    │  │
│  └──────────────────────┬────────────────────────┘  │
│  ┌──────────────────────▼────────────────────────┐  │
│  │              PRISMA ORM (Data Layer)           │  │
│  └──────────────────────┬────────────────────────┘  │
└─────────────────────────┼────────────────────────────┘
                          │ TCP/5432
┌─────────────────────────▼────────────────────────────┐
│                 POSTGRESQL 17 DATABASE                │
│          (Docker Container / Cloud hosted)            │
└──────────────────────────────────────────────────────┘
```

### Kiến trúc 3 lớp (tương đương DAL / BLL / UI cũ)

| Lớp cũ (C# WinForms) | Lớp mới (Next.js) | Tương ứng |
|---|---|---|
| **UI** (WinForms) | `app/` — React Server/Client Components | Giao diện người dùng |
| **BLL** (Business Logic) | `lib/services/` — Service functions | Xử lý nghiệp vụ |
| **DAL** (Data Access) | `lib/prisma/` — Prisma ORM + Schema | Truy xuất dữ liệu |

---

## 📁 Cấu trúc thư mục

```
52400017_52400133_52400004/          ← Root repository
│
├── 📄 README.md                     ← File này
│
├── 📂 docs/                         ← 📚 Tài liệu dự án
│   ├── 📄 SETUP.md                  ← Hướng dẫn cài đặt
│   ├── 📄 mo-ta-de-tai.md           ← Mô tả đề tài chi tiết
│   ├── 📄 bangmau.md                ← Bảng màu thiết kế
│   ├── 📄 plan.md                   ← Kế hoạch phát triển
│   └── 📄 tai-khoan-demo.md         ← Danh sách tài khoản demo
│
├── 📂 UML/                          ← 📊 UML Diagrams
│   ├── 📂 Activity Diagram/         ← Activity Diagrams
│   ├── 📂 Class Diagram/            ← Class Diagrams
│   ├── 📂 ERD/                      ← Entity Relationship Diagrams
│   └── 📂 Usecase/                  ← Use Case Diagrams
│
└── 📂 axiom/                        ← 🔥 NEXT.JS PROJECT
    │
    ├── 📄 .env / .env.example       ← Biến môi trường
    ├── 📄 .gitignore                ← Git ignore rules
    ├── 📄 .prettierrc               ← Prettier config
    ├── 📄 docker-compose.yml        ← Docker: PostgreSQL container
    ├── 📄 setup_db.sql              ← SQL khởi tạo database
    ├── 📄 eslint.config.mjs         ← ESLint flat config
    ├── 📄 next.config.ts            ← Next.js configuration
    ├── 📄 postcss.config.mjs        ← PostCSS config (Tailwind)
    ├── 📄 prisma.config.ts          ← Prisma config
    ├── 📄 package.json              ← Dependencies & scripts
    ├── 📄 tsconfig.json             ← TypeScript config
    │
    ├── 📂 prisma/                   ═══════════════════════════════
    │   ├── 📄 schema.prisma         ← 🗄️ LỚP 3: DATA ACCESS LAYER
    │   └── 📂 migrations/           ← Schema (12 models, relations)
    │                                ═══════════════════════════════
    │
    ├── 📂 scripts/                  ← 🔨 Utility Scripts
    │   ├── 📄 seed-demo-data.ts     ← Tạo dữ liệu demo (63 NV, 64 TK)
    │   ├── 📄 generate-payroll.ts   ← Tính lương hàng loạt
    │   ├── 📄 generate-attendance.ts← Tạo dữ liệu chấm công
    │   ├── 📄 vary-payroll.ts       ← Tạo biến động lương
    │   ├── 📄 check-payroll-months.ts← Kiểm tra payroll theo tháng
    │   └── 📄 test-db.mjs          ← Test kết nối database
    │
    ├── 📂 public/                   ← Static assets
    │   ├── 📂 images/               ← Logo, avatar, cờ VN...
    │   └── 📄 *.svg                 ← SVG icons
    │
    └── 📂 src/                      ← 🔥 SOURCE CODE CHÍNH
        │
        ├── 📄 middleware.ts         ← Route protection (auth guard)
        │
        │   ══════════════════════════════════════════════════════
        │   🎨 LỚP 1: PRESENTATION LAYER (Giao diện người dùng)
        │   ══════════════════════════════════════════════════════
        │
        ├── 📂 app/                  ← 🎨 APP ROUTER (Pages & Layouts)
        │   ├── 📄 layout.tsx        ← Root layout (HTML, fonts, providers)
        │   ├── 📄 globals.css       ← Global styles + Tailwind directives
        │   ├── 📄 page.tsx          ← Root page (redirect → login)
        │   │
        │   ├── 📂 (auth)/           ← 🔐 Auth pages (không sidebar)
        │   │   ├── 📄 layout.tsx    ← Auth layout (centered)
        │   │   ├── 📂 login/page.tsx
        │   │   ├── 📂 forgot-password/page.tsx
        │   │   └── 📂 reset-password/page.tsx
        │   │
        │   ├── 📂 (dashboard)/      ← 📊 Main app (sidebar + header)
        │   │   ├── 📄 layout.tsx    ← Dashboard layout (sidebar + RBAC nav)
        │   │   │
        │   │   ├── 📂 dashboard/          ← 🏠 Trang chủ Admin
        │   │   ├── 📂 dashboard-hr/       ← 👥 Dashboard HR Manager
        │   │   ├── 📂 dashboard-accountant/ ← 💰 Dashboard Kế toán
        │   │   ├── 📂 dashboard-director/ ← 🎯 Dashboard Giám đốc
        │   │   ├── 📂 dashboard-manager/  ← 📋 Dashboard Trưởng phòng
        │   │   ├── 📂 dashboard-employee/ ← 👤 Dashboard Nhân viên
        │   │   │
        │   │   ├── 📂 employees/          ← 👤 Hồ sơ nhân sự (CRUD)
        │   │   │   ├── 📄 page.tsx        ← Danh sách + DataTable
        │   │   │   ├── 📂 [id]/page.tsx   ← Chi tiết nhân viên
        │   │   │   └── 📂 new/page.tsx    ← Thêm mới
        │   │   ├── 📂 departments/        ← 🏢 Phòng ban
        │   │   ├── 📂 positions/          ← 💼 Chức vụ
        │   │   ├── 📂 contracts/          ← 📝 Hợp đồng lao động
        │   │   │   ├── 📄 page.tsx        ← Danh sách + cảnh báo hết hạn
        │   │   │   └── 📂 [id]/page.tsx   ← Chi tiết hợp đồng
        │   │   ├── 📂 career-history/     ← 📜 Lịch sử công tác
        │   │   ├── 📂 business-trips/     ← ✈️ Công tác phí
        │   │   │
        │   │   ├── 📂 attendance/         ← ⏰ Chấm công
        │   │   │   ├── 📄 page.tsx        ← Bảng chấm công tháng
        │   │   │   └── 📂 check-in/page.tsx ← Check-in/Check-out
        │   │   ├── 📂 leave/              ← 🏖️ Nghỉ phép
        │   │   │   ├── 📄 page.tsx        ← Danh sách đơn + duyệt
        │   │   │   └── 📂 request/page.tsx ← Tạo đơn nghỉ
        │   │   │
        │   │   ├── 📂 payroll/            ← 💰 Tính lương
        │   │   │   ├── 📄 page.tsx        ← Bảng lương Gross → Net
        │   │   │   └── 📂 config/page.tsx ← Cấu hình BHXH/BHYT/Thuế
        │   │   ├── 📂 payslips/           ← 📄 Phiếu lương
        │   │   │   ├── 📄 page.tsx        ← Danh sách phiếu lương
        │   │   │   └── 📂 [id]/page.tsx   ← Xem + xuất PDF
        │   │   │
        │   │   ├── 📂 profile/            ← 👤 Hồ sơ cá nhân
        │   │   └── 📂 settings/           ← ⚙️ Quản trị hệ thống
        │   │       ├── 📄 page.tsx        ← Cài đặt chung
        │   │       └── 📂 users/page.tsx  ← Quản lý tài khoản RBAC
        │   │
        │   └── 📂 api/                    ← 🔌 API Routes
        │       ├── 📂 auth/[...nextauth]/ ← NextAuth.js handler
        │       ├── 📂 departments/        ← REST API phòng ban
        │       ├── 📂 forgot-password/    ← API quên mật khẩu
        │       └── 📂 export/             ← API xuất báo cáo
        │           ├── 📂 excel/          ← Export Excel danh sách
        │           ├── 📂 payslip-pdf/    ← Export PDF phiếu lương
        │           └── 📂 report-excel/   ← Export báo cáo tổng hợp
        │
        ├── 📂 components/               ← 🧩 SHARED UI COMPONENTS
        │   ├── 📂 providers/             ← Context & Session providers
        │   │   └── 📄 auth-provider.tsx  ← NextAuth SessionProvider
        │   ├── 📂 ui/                    ← Base UI components
        │   │   └── 📄 avatar-img.tsx     ← Avatar image component
        │   ├── 📂 layout/               ← Layout components
        │   │   ├── 📄 sidebar.tsx        ← Sidebar navigation
        │   │   ├── 📄 header.tsx         ← Top header
        │   │   ├── 📄 breadcrumb.tsx     ← Breadcrumb navigation
        │   │   └── 📄 theme-toggle.tsx   ← Dark/Light mode toggle
        │   ├── 📂 dashboard/            ← Dashboard widgets
        │   │   ├── 📄 stat-card.tsx      ← KPI card
        │   │   ├── 📄 payroll-chart.tsx  ← Biểu đồ quỹ lương
        │   │   ├── 📄 headcount-chart.tsx ← Biểu đồ nhân sự
        │   │   └── 📄 recent-activity.tsx ← Hoạt động gần đây
        │   ├── 📂 employees/            ← Employee components
        │   │   ├── 📄 employee-form.tsx  ← Form thêm/sửa
        │   │   ├── 📄 employee-columns.tsx ← Column definitions
        │   │   └── 📄 employee-card.tsx  ← Profile card
        │   ├── 📂 attendance/           ← Attendance components
        │   │   ├── 📄 calendar-view.tsx  ← Lịch chấm công
        │   │   ├── 📄 check-in-button.tsx ← Nút check-in/out
        │   │   └── 📄 attendance-summary.tsx ← Tổng hợp công
        │   ├── 📂 leave/                ← Leave components
        │   │   ├── 📄 leave-form.tsx     ← Form xin nghỉ
        │   │   ├── 📄 leave-balance.tsx  ← Quỹ phép
        │   │   └── 📄 approval-actions.tsx ← Duyệt/Từ chối
        │   └── 📂 payroll/              ← Payroll components
        │       ├── 📄 payroll-table.tsx  ← Bảng lương chi tiết
        │       ├── 📄 salary-breakdown.tsx ← Chi tiết Gross → Net
        │       └── 📄 payslip-template.tsx ← Template phiếu lương
        │
        ├── 📂 hooks/                    ← 🪝 CUSTOM REACT HOOKS
        │   ├── 📄 use-current-user.ts   ← Hook lấy thông tin user hiện tại
        │   ├── 📄 use-breakpoint.ts     ← Responsive breakpoint detection
        │   ├── 📄 use-debounce.ts       ← Debounce search input
        │   ├── 📄 use-pagination.ts     ← Pagination logic
        │   └── 📄 use-confirmation.ts   ← Confirm dialog hook
        │
        ├── 📂 types/                    ← 📐 TYPESCRIPT TYPES
        │   ├── 📄 index.ts              ← Shared types & interfaces
        │   ├── 📄 employee.types.ts     ← Employee-related types
        │   ├── 📄 payroll.types.ts      ← Payroll-related types
        │   └── 📄 next-auth.d.ts        ← NextAuth type augmentation
        │
        ├── 📂 styles/                   ← 🎨 Additional CSS
        │   └── 📄 print.css             ← CSS cho in phiếu lương
        │
        │   ══════════════════════════════════════════════════════
        │   💼 LỚP 2: BUSINESS LOGIC LAYER (Xử lý nghiệp vụ)
        │   ══════════════════════════════════════════════════════
        │
        └── 📂 lib/                      ← 🔧 BUSINESS LOGIC & UTILITIES
            ├── 📄 prisma.ts             ← Prisma client singleton (DAL bridge)
            ├── 📄 auth.ts               ← NextAuth.js config
            ├── 📄 mock-auth.ts          ← Mock auth fallback (backward compat)
            ├── 📄 dashboard-context.tsx  ← Dashboard theme context
            ├── 📄 utils.ts              ← General utility functions
            ├── 📄 constants.ts          ← Hằng số (thuế, BHXH, BHYT...)
            │
            ├── 📂 services/             ← 💼 SERVICE LAYER (Core BLL)
            │   ├── 📄 employee.service.ts    ← CRUD nhân viên
            │   ├── 📄 department.service.ts  ← CRUD phòng ban
            │   ├── 📄 contract.service.ts    ← CRUD hợp đồng + cảnh báo
            │   ├── 📄 career-history.service.ts ← Lịch sử công tác
            │   ├── 📄 attendance.service.ts  ← Check-in/out, tổng hợp công
            │   ├── 📄 leave.service.ts       ← Duyệt phép, quỹ phép
            │   ├── 📄 payroll.service.ts     ← ⭐ Tính lương Gross→Net
            │   ├── 📄 payslip.service.ts     ← Xuất phiếu lương
            │   ├── 📄 dashboard.service.ts   ← Aggregate data dashboard
            │   └── 📄 user.service.ts        ← Quản lý tài khoản
            │
            ├── 📂 actions/              ← ⚡ SERVER ACTIONS (Mutations)
            │   ├── 📄 employee.actions.ts
            │   ├── 📄 contract.actions.ts
            │   ├── 📄 attendance.actions.ts
            │   ├── 📄 leave.actions.ts
            │   ├── 📄 payroll.actions.ts
            │   ├── 📄 auth.actions.ts
            │   ├── 📄 dashboard.actions.ts
            │   ├── 📄 department.actions.ts
            │   ├── 📄 career-history.actions.ts
            │   ├── 📄 business-trips.actions.ts
            │   └── 📄 user-admin.actions.ts
            │
            ├── 📂 validators/           ← 📏 ZOD SCHEMAS (Validation)
            │   ├── 📄 employee.schema.ts
            │   ├── 📄 contract.schema.ts
            │   ├── 📄 attendance.schema.ts
            │   ├── 📄 leave.schema.ts
            │   └── 📄 payroll.schema.ts
            │
            └── 📂 helpers/              ← 🛠️ HELPER FUNCTIONS
                ├── 📄 format-helpers.ts  ← Format tiền VNĐ, ngày tháng
                ├── 📄 payroll-calculator.ts ← Công thức tính lương VN
                └── 📄 serialize.ts       ← Serialize Prisma objects
```


### 📝 Quy tắc seed dữ liệu hợp đồng

Script `seed-demo-data.ts` tạo **63 nhân viên + 63 hợp đồng** với ngày kết thúc thực tế:

| Nhóm | Số lượng | Loại HĐ | Thời hạn HĐ hiện tại |
|---|---|---|---|
| Ban Giám đốc | 3 | Chính thức | Từ 31/03/2026 + **3 năm** + 0–6 tháng ngẫu nhiên |
| Trưởng phòng | 5 | Chính thức | Từ 31/03/2026 + **2 năm** + 0–6 tháng ngẫu nhiên |
| Nhân viên chính thức | 50 | Chính thức | Từ 31/03/2026 + **1–3 năm** ngẫu nhiên + 0–6 tháng |
| Nhân viên thử việc | 5 | Thử việc | Cố định **31/05/2026** (2 tháng thử việc) |

> **Lưu ý:** `contractEndFrom()` luôn tính từ ngày **2026-03-31** (ngày hiện tại của hệ thống demo) để đảm bảo tất cả HĐ còn hiệu lực, mô phỏng trạng thái HĐ đã được gia hạn và đang chạy.

**Chạy lại seed + payroll:**
```bash
npx tsx scripts/seed-demo-data.ts
npx tsx scripts/generate-payroll.ts --month=3 --year=2026
```

---

## 📋 4 Phân hệ nghiệp vụ

### 🅰️ Phân hệ 1: Quản lý Hồ sơ Nhân sự (Core HR)

| Chức năng | Mô tả | Route |
|---|---|---|
| Quản lý nhân viên | CRUD hồ sơ, ảnh đại diện, người phụ thuộc | `/employees` |
| Quản lý phòng ban | CRUD phòng ban, gán trưởng phòng | `/departments` |
| Quản lý chức vụ | CRUD chức vụ | `/positions` |
| Hợp đồng lao động | CRUD hợp đồng, cảnh báo hết hạn 30 ngày | `/contracts` |
| Lịch sử công tác | Timeline thăng chức, điều chuyển, khen thưởng, kỷ luật | `/career-history` |

### 🅱️ Phân hệ 2: Quản lý Thời gian & Nghỉ phép (Time & Attendance)

| Chức năng | Mô tả | Route |
|---|---|---|
| Chấm công | Check-in/Check-out, ghi nhận OT, đi muộn/về sớm | `/attendance` |
| Nghỉ phép | Đăng ký, duyệt phép, tự động trừ quỹ phép năm | `/leave` |
| Công tác phí | Quản lý lệnh công tác, phụ cấp công tác | `/business-trips` |

### 🅲️ Phân hệ 3: Quản lý Tiền lương (Payroll)

| Chức năng | Mô tả | Route |
|---|---|---|
| Cấu hình lương | Thiết lập tham số BHXH, BHYT, BHTN, thuế TNCN | `/payroll/config` |
| Tính lương | Tự động tổng hợp công ⟶ tính Gross ⟶ khấu trừ ⟶ Net | `/payroll` |
| Phiếu lương | Xem chi tiết, xuất PDF cho từng nhân viên | `/payslips` |

**Công thức tính lương:**
```
Gross = (Lương cơ bản × Hệ số) + Phụ cấp + Tiền OT
BHXH  = Gross × 8%
BHYT  = Gross × 1.5%
BHTN  = Gross × 1%
Thu nhập chịu thuế = Gross - BHXH - BHYT - BHTN - 11.000.000 - (4.400.000 × Số người phụ thuộc)
Thuế TNCN = Tính theo biểu lũy tiến từng phần 7 bậc
Net = Gross - BHXH - BHYT - BHTN - Thuế TNCN - Khấu trừ khác
```

### 🅳️ Phân hệ 4: Báo cáo & Quản trị hệ thống

| Chức năng | Mô tả | Route |
|---|---|---|
| Dashboard | KPI cards, biểu đồ nhân sự, quỹ lương, tỷ lệ nghỉ việc | `/dashboard` |
| Quản lý users | CRUD tài khoản, gán vai trò RBAC | `/settings/users` |
| Export | Xuất báo cáo Excel, phiếu lương PDF | API routes |

---

## 🗄️ Database Schema

### Danh sách bảng (11 tables)

| # | Bảng | Mô tả | Quan hệ chính |
|---|---|---|---|
| 1 | `departments` | Phòng ban | → `employees` |
| 2 | `positions` | Chức vụ | → `employees` |
| 3 | `employees` | Nhân viên (core) | → departments, positions |
| 4 | `contracts` | Hợp đồng lao động | → employees |
| 5 | `career_history` | Lịch sử công tác | → employees |
| 6 | `users` | Tài khoản & phân quyền | → employees |
| 7 | `attendance` | Chấm công | → employees |
| 8 | `leave_requests` | Đơn nghỉ phép | → employees, users |
| 9 | `leave_balance` | Quỹ phép năm | → employees |
| 10 | `business_trips` | Công tác phí | → employees, users |
| 11 | `salary_config` | Cấu hình lương | — |
| 12 | `payroll` | Bảng lương | → employees |
| 13 | `payslips` | Phiếu lương | → payroll, employees |

> **Lưu ý:** Schema đã được thiết kế sẵn tại `prisma/schema.prisma`, chuyển đổi từ SQL Server sang PostgreSQL.

---

## 🔐 Phân quyền RBAC

Hệ thống phân quyền theo 3 vai trò (Role-Based Access Control):

| Chức năng | Admin | HR Manager | Employee |
|---|:---:|:---:|:---:|
| Dashboard (toàn bộ) | ✅ | ✅ | ❌ |
| Dashboard (cá nhân) | ✅ | ✅ | ✅ |
| Quản lý nhân viên | ✅ CRUD | ✅ CRUD | 👁️ Xem hồ sơ mình |
| Quản lý phòng ban / chức vụ | ✅ CRUD | ✅ CRUD | ❌ |
| Hợp đồng lao động | ✅ CRUD | ✅ CRUD | 👁️ Xem HĐ mình |
| Chấm công | ✅ Xem tất cả | ✅ Xem phòng mình | ✅ Check-in/out + xem |
| Nghỉ phép — Tạo đơn | ✅ | ✅ | ✅ |
| Nghỉ phép — Duyệt/Từ chối | ✅ | ✅ (phòng mình) | ❌ |
| Tính lương | ✅ | ✅ Xem | ❌ |
| Phiếu lương | ✅ Tất cả | ✅ Tất cả | 👁️ Xem phiếu mình |
| Quản lý tài khoản | ✅ CRUD | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ |

---

## 📏 Quy tắc code

### Naming Convention
```typescript
// Files: kebab-case
employee-form.tsx
payroll.service.ts
tax-calculator.ts

// Components: PascalCase
export function EmployeeForm() {}
export function PayrollTable() {}

// Functions & Variables: camelCase
const totalWorkDays = 22;
function calculateNetSalary() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_LEAVE_DAYS = 12;
const BHXH_RATE = 0.08;

// Types & Interfaces: PascalCase with prefix
type EmployeeWithDepartment = { ... }
interface CreateEmployeeInput { ... }

// Database columns (Prisma): snake_case
employee_id, full_name, base_salary
```

### Component Structure
```typescript
// Thứ tự trong một component file:
// 1. Imports
// 2. Types/Interfaces (nếu local)
// 3. Constants (nếu local)
// 4. Component function
// 5. Sub-components (nếu có)
// 6. Helper functions (nếu có)

"use client"; // ← Chỉ khi cần interactivity (form, state, event handlers)

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createEmployee } from "@/lib/actions/employee.actions";
import type { Employee } from "@/types";

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
}

export function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  // Component logic here
}
```

### Quy tắc quan trọng

1. **Server Components mặc định** — Chỉ thêm `"use client"` khi thật sự cần (form, state, onClick...)
2. **Server Actions cho mutations** — Tạo/sửa/xóa data luôn dùng Server Actions, không gọi API từ client
3. **Zod validation ở cả 2 phía** — Client (form) và Server (action) đều validate bằng cùng 1 Zod schema
4. **Prisma queries trong services** — Không viết Prisma queries trực tiếp trong components hay actions
5. **Error handling** — Mọi Server Action phải return `{ success, data?, error? }` pattern
6. **Tiếng Việt Unicode** — Dùng `NVARCHAR` / `TEXT` cho mọi trường có tiếng Việt, font phải hỗ trợ UTF-8

---

## 💻 Cài đặt & Chạy dự án

### Yêu cầu hệ thống
- **Node.js** >= 20.x
- **pnpm** >= 9.x (hoặc npm/yarn)
- **Docker Desktop** (để chạy PostgreSQL)
- **Git**

### Bước 1: Clone & Cài đặt

```bash
git clone https://github.com/<your-repo>/axiom-hrm.git
cd axiom-hrm
pnpm install
```

### Bước 2: Khởi động Database (Docker)

```bash
docker-compose up -d
```

### Bước 3: Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa .env theo hướng dẫn bên dưới
```

### Bước 4: Chạy Migration & Seed

```bash
pnpm prisma migrate dev    # Tạo tables
pnpm prisma db seed        # Nạp dữ liệu mẫu
```

### Bước 5: Chạy dev server

```bash
pnpm dev                   # http://localhost:3000
```

### Tài khoản mặc định

| Vai trò | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| HR Manager | `hr_manager` | `hr123` |
| Nhân viên | `nv001` | `nv123` |

---

## 📜 Scripts

```bash
# Development
pnpm dev                    # Chạy dev server (port 3000)
pnpm build                  # Build production
pnpm start                  # Start production server
pnpm lint                   # Chạy ESLint
pnpm format                 # Format code với Prettier

# Database
pnpm prisma studio          # Mở Prisma Studio (GUI quản lý DB)
pnpm prisma migrate dev     # Tạo & chạy migration
pnpm prisma db seed         # Nạp dữ liệu mẫu
pnpm prisma generate        # Generate Prisma Client

# Docker
docker-compose up -d        # Start PostgreSQL container
docker-compose down         # Stop containers
docker-compose logs -f      # Xem logs

# Utilities
pnpm type-check             # Kiểm tra TypeScript types
```

---

## 🔑 Biến môi trường

Tạo file `.env` tại root với nội dung:

```env
# ── DATABASE ──────────────────────────────────────
DATABASE_URL="postgresql://axiom:axiom_password@localhost:5432/axiom_hrm?schema=public"

# ── AUTHENTICATION ────────────────────────────────
AUTH_SECRET="your-super-secret-key-change-in-production"
AUTH_URL="http://localhost:3000"

# ── APP CONFIG ────────────────────────────────────
NEXT_PUBLIC_APP_NAME="AXIOM HRM"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📚 Tài liệu & UML

| Tài liệu | Đường dẫn |
|---|---|
| Mô tả đề tài | `docs/mo-ta-de-tai.md` |
| Kế hoạch phát triển | `docs/plan.md` |
| Bảng màu thiết kế | `docs/bangmau.md` |
| Tài khoản demo | `docs/tai-khoan-demo.md` |
| Hướng dẫn cài đặt | `docs/SETUP.md` |
| Use Case Diagrams | `UML/Usecase/` |
| Class Diagrams | `UML/Class Diagram/` |
| Activity Diagrams | `UML/Activity Diagram/` |
| ERD | `UML/ERD/` |

---

## 📄 License

Dự án phục vụ mục đích học tập — Đồ án Công nghệ Phần mềm, Đại học Tôn Đức Thắng.

---

<div align="center">

**Built with ❤️ by Team 52400017 · 52400133 · 52400004**

*AXIOM — Precision in every calculation*

</div>
