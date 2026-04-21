# 🎤 BÀI THUYẾT TRÌNH — AXIOM HRM & Payroll System

> **Đề tài:** Xây dựng Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp
> **Nhóm:** 52400017 · 52400133 · 52400004
> **Môn học:** Đồ án Công nghệ Phần mềm — Đại học Tôn Đức Thắng

---

# PHẦN 1: TỔNG QUAN CÔNG NGHỆ SỬ DỤNG

## 1.1. Tại sao nhóm chọn Next.js?

Khi bắt đầu đồ án, nhóm có 2 lựa chọn: một là làm theo kiểu truyền thống — tách riêng frontend bằng React và backend bằng Express.js, hai là dùng Next.js để gộp cả frontend và backend vào chung một project.

Nhóm chọn **Next.js phiên bản 16** vì một lý do rất đơn giản: **tiết kiệm thời gian và giảm phức tạp**. Thay vì phải viết frontend một chỗ, viết REST API một chỗ, rồi lo chuyện kết nối giữa 2 bên, thì với Next.js mình chỉ cần 1 project duy nhất. Code frontend và backend nằm chung, chia sẻ chung kiểu dữ liệu TypeScript, deploy cũng chỉ 1 lần.

Nói cách khác, nếu dùng React + Express, nhóm phải:
- Viết REST API ở Express (ví dụ `GET /api/employees`, `POST /api/employees`)
- Rồi bên React phải `fetch()` tới API đó
- Phải tự xử lý CORS, error handling, authentication giữa 2 bên

Còn với Next.js, nhóm chỉ cần viết một hàm gọi là **Server Action**, đánh dấu `"use server"` ở đầu file, rồi bên giao diện gọi thẳng hàm đó như gọi hàm JavaScript bình thường. Next.js tự lo phần gửi request ngầm phía sau. Rất tiện và ít lỗi hơn.

## 1.2. TypeScript — JavaScript nhưng có kiểm tra kiểu dữ liệu

Nhóm viết toàn bộ code bằng **TypeScript** thay vì JavaScript thuần. Về cơ bản TypeScript chính là JavaScript, nhưng bổ sung thêm **hệ thống kiểu dữ liệu** (type system). Ví dụ:

```typescript
// JavaScript thuần — không biết employee có những field gì, dễ viết sai
function getEmployee(id) {
  // ...gì cũng được, không ai kiểm tra
}

// TypeScript — nếu viết sai tên field hay sai kiểu, IDE báo đỏ ngay
function getEmployee(id: number): Employee {
  // Employee có fullName: string, email: string, departmentId: number, ...
}
```

Lợi ích lớn nhất là: **phát hiện lỗi ngay lúc viết code, không cần chạy thử mới biết sai**. Với một project lớn 114 file như AXIOM, nếu dùng JavaScript thuần thì rất dễ viết nhầm tên biến, truyền sai kiểu mà không biết. TypeScript giúp tránh được phần lớn lỗi kiểu này.

## 1.3. Giao diện — React 19, Tailwind CSS 4, Recharts

**React 19** là thư viện xây dựng giao diện phổ biến nhất hiện nay. Ý tưởng cốt lõi của React là chia giao diện thành các **component** nhỏ, mỗi component lo một phần riêng. Ví dụ trong AXIOM: component `StatCard` hiển thị ô KPI trên dashboard, component `LeaveForm` hiển thị form tạo đơn nghỉ phép, component `PayrollTable` hiển thị bảng lương. Các component này có thể tái sử dụng ở nhiều trang khác nhau.

**Tailwind CSS 4** là cách nhóm viết CSS. Thay vì tạo file `.css` riêng rồi đặt tên class như cách truyền thống, Tailwind cho phép viết style trực tiếp bằng các class có sẵn. Ví dụ muốn một nút màu đỏ, bo góc, thì viết `className="bg-red-500 rounded-lg px-4 py-2"` — không cần tạo file CSS riêng. Tailwind hỗ trợ sẵn responsive (giao diện tự co giãn theo kích thước màn hình) và dark mode (chế độ tối).

**Recharts** là thư viện vẽ biểu đồ cho React. Nhóm dùng nó để vẽ biểu đồ cột (bar chart), biểu đồ đường (line chart), biểu đồ tròn (pie chart) trên các trang dashboard.

## 1.4. Cơ sở dữ liệu — PostgreSQL 17

Nhóm dùng **PostgreSQL** — một hệ quản trị CSDL quan hệ mã nguồn mở, miễn phí. PostgreSQL được chọn vì nó hỗ trợ tốt các kiểu dữ liệu phức tạp (Decimal cho tiền lương, Time cho giờ chấm công) và hỗ trợ **transaction** — tức là một nhóm thao tác phải thành công hết hoặc hủy hết, rất quan trọng khi xử lý lương và nghỉ phép.

Database chạy trong **Docker container**. Docker giống như một "máy ảo nhẹ" — thay vì phải cài PostgreSQL thực lên máy mỗi thành viên, nhóm chỉ cần chạy lệnh `docker-compose up -d` là có sẵn database, ai clone project về cũng chạy được ngay mà không cần cài đặt gì thêm.

Database có tổng cộng **13 bảng**: departments (phòng ban), positions (chức vụ), employees (nhân viên), contracts (hợp đồng), users (tài khoản), attendance (chấm công), leave_requests (đơn nghỉ phép), leave_balance (quỹ phép), payroll (bảng lương), payslips (phiếu lương), career_history (lịch sử công tác), business_trips (công tác phí), salary_config (cấu hình lương).

## 1.5. Prisma ORM — thao tác database không cần viết SQL

Thay vì viết câu SQL thủ công, nhóm dùng **Prisma ORM phiên bản 7** để tương tác với database. ORM (Object-Relational Mapping) là công cụ cho phép thao tác database bằng code JavaScript/TypeScript thay vì viết SQL trực tiếp.

Ví dụ so sánh:

```sql
-- Cách truyền thống: viết SQL thủ công
SELECT * FROM employees
WHERE department_id = 1
ORDER BY full_name ASC
LIMIT 10 OFFSET 0;
```

```typescript
// Với Prisma: viết code TypeScript, IDE hỗ trợ autocomplete, kiểm tra lỗi
const employees = await prisma.employee.findMany({
  where: { departmentId: 1 },
  orderBy: { fullName: "asc" },
  take: 10,
  skip: 0,
})
```

Lợi ích của Prisma:
- **Không cần viết SQL** — viết TypeScript, Prisma tự dịch sang SQL
- **Tự sinh kiểu dữ liệu** — từ file `schema.prisma`, Prisma tự tạo ra TypeScript types cho 13 bảng. Nên khi viết `employee.fullName`, IDE tự hiểu đó là string
- **Migration tự động** — khi thay đổi schema (thêm/sửa cột), chỉ cần chạy `prisma migrate dev`, Prisma tự tạo SQL migration

## 1.6. Xác thực — NextAuth v5 (đăng nhập, phân quyền)

Hệ thống đăng nhập sử dụng **NextAuth.js phiên bản 5**. Khi người dùng nhập username + password:

1. Hệ thống tìm user trong database theo username
2. So sánh mật khẩu đã nhập với mật khẩu đã hash trong DB bằng **bcryptjs** (thư viện mã hóa mật khẩu — không bao giờ lưu mật khẩu dạng text thuần)
3. Nếu đúng → tạo **JWT token** (một chuỗi mã hóa) chứa thông tin: role, employeeId, dashboardPath
4. Token này được lưu dưới dạng cookie, mỗi lần truy cập trang mới, trình duyệt gửi token lên → server biết ai đang đăng nhập

Hệ thống có **6 vai trò** (role): Admin, Director (Giám đốc), HRManager (Trưởng phòng Nhân sự), Accountant (Kế toán), Manager (Trưởng phòng), Employee (Nhân viên). Mỗi role được chuyển hướng đến dashboard riêng và có quyền truy cập khác nhau.

**Bảo vệ route bằng Edge Middleware:** Trước mỗi request, hệ thống có một hàm middleware chạy trước để kiểm tra:
- Chưa đăng nhập? → Chuyển hướng về trang `/login`
- Đã đăng nhập nhưng chưa thiết lập email cá nhân? → Chuyển hướng về `/setup-email`
- Đã đăng nhập + đã có email? → Cho phép truy cập trang

Middleware này chạy trên **Edge Runtime** — hiểu đơn giản là nó chạy ở tầng mạng (CDN), nhanh hơn so với chạy trên server Node.js thông thường.

> **Một vấn đề kỹ thuật nhóm gặp phải:** Edge Runtime không hỗ trợ một số thư viện Node.js, mà thư viện mã hóa mật khẩu `bcryptjs` lại cần các thư viện đó. Nếu import bcryptjs vào middleware → ứng dụng bị crash. Giải pháp: nhóm **tách cấu hình NextAuth thành 2 file**:
> - File `auth.config.ts` — không có bcryptjs → chạy được trên Edge (dùng cho middleware)
> - File `auth.ts` — có bcryptjs → chỉ chạy trên Node.js (dùng cho đăng nhập, API)

## 1.7. Gửi email, xuất PDF, xuất Excel

- **Gửi email:** Dùng thư viện `nodemailer` để gửi email thật qua Gmail. Ứng dụng cụ thể: khi nhân viên quên mật khẩu → hệ thống tạo mật khẩu tạm → gửi qua email cá nhân đã thiết lập. Cần có App Password của Gmail để gửi được.

- **Xuất PDF:** Dùng `@react-pdf/renderer` — thư viện cho phép tạo file PDF từ React component. Nhóm dùng nó để xuất phiếu lương cá nhân ra PDF, có đầy đủ thông tin Gross, bảo hiểm, thuế, lương Net.

- **Xuất Excel:** Dùng `exceljs` — thư viện tạo file Excel (.xlsx). Nhóm dùng để xuất báo cáo bảng lương tổng hợp và danh sách nhân viên.

## 1.8. Kiểm tra dữ liệu đầu vào — Zod

Khi người dùng nhập dữ liệu vào form (thêm nhân viên, tạo hợp đồng, ...), cần kiểm tra dữ liệu có hợp lệ không. Nhóm dùng **Zod** — thư viện validation cho TypeScript. Ví dụ:

```typescript
const employeeSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email:    z.string().email("Email không hợp lệ"),
  phone:    z.string().min(10, "SĐT tối thiểu 10 số"),
})
```

Zod kiểm tra ở cả 2 nơi: trên trình duyệt (cho phản hồi nhanh cho người dùng) và trên server (để đảm bảo an toàn, tránh gửi dữ liệu xấu trực tiếp tới API).

## 1.9. Kiến trúc tổng thể — mô hình 3 lớp

Hệ thống được chia thành **3 lớp**, giống như kiến trúc MVC mà mọi người đã học, nhưng áp dụng cho web hiện đại:

```
┌──────────────────────────────────────────────────────────────┐
│  LỚP 1: GIAO DIỆN (Presentation Layer)                       │
│  Nhiệm vụ: Hiển thị trang web cho người dùng                 │
│  Gồm: 31 trang React (page.tsx), 3 layout, CSS, biểu đồ     │
│  Hỗ trợ: Responsive, Dark Mode, Song ngữ VI/EN               │
├──────────────────────────────────────────────────────────────┤
│  LỚP 2: XỬ LÝ NGHIỆP VỤ (Business Logic Layer)             │
│  Nhiệm vụ: Tính toán, kiểm tra logic, xử lý dữ liệu        │
│  Gồm: 10 file service (tính lương, duyệt phép, chấm công)   │
│  + 11 file Server Actions + 5 file validation (Zod)           │
├──────────────────────────────────────────────────────────────┤
│  LỚP 3: TRUY CẬP DỮ LIỆU (Data Access Layer)               │
│  Nhiệm vụ: Đọc/ghi dữ liệu từ database                      │
│  Gồm: Prisma ORM kết nối PostgreSQL (13 bảng)                │
└──────────────────────────────────────────────────────────────┘
```

**Lớp 1** lo việc hiển thị — khi người dùng bấm nút "Duyệt đơn nghỉ phép", Lớp 1 gọi xuống Lớp 2.
**Lớp 2** lo logic — kiểm tra quỹ phép còn đủ không, tính ngày nghỉ, rồi gọi xuống Lớp 3.
**Lớp 3** lo database — ghi vào bảng leave_requests, cập nhật bảng leave_balance.

Lợi ích: nếu sau này muốn đổi database (ví dụ từ PostgreSQL sang MySQL), chỉ cần sửa Lớp 3, Lớp 1 và Lớp 2 không bị ảnh hưởng. Hoặc muốn thêm mobile app, chỉ cần thay Lớp 1, Lớp 2 và 3 giữ nguyên.

## 1.10. Tổng kết công nghệ

| Thành phần | Công nghệ | Phiên bản | Dùng để làm gì |
|---|---|---|---|
| Framework | Next.js | 16.2.1 | Gộp frontend + backend trong 1 project |
| Ngôn ngữ | TypeScript | 5 | Viết code có kiểm tra kiểu, ít lỗi hơn |
| Giao diện | React | 19.2.4 | Xây dựng UI theo component |
| CSS | Tailwind CSS | 4 | Viết style nhanh, responsive, dark mode |
| Icon | Lucide React | 1.7.0 | 1500+ icon SVG cho giao diện |
| Biểu đồ | Recharts | 3.8.1 | Vẽ biểu đồ trên dashboard |
| Database | PostgreSQL | 17 | Lưu trữ dữ liệu (13 bảng) |
| ORM | Prisma | 7.6.0 | Thao tác DB bằng TypeScript thay vì SQL |
| Đăng nhập | NextAuth v5 | beta 30 | Xác thực + phân quyền JWT |
| Mã hóa MK | bcryptjs | 3.0.3 | Hash mật khẩu an toàn |
| Gửi email | nodemailer | 8.0.4 | Gửi email quên mật khẩu qua Gmail |
| Xuất PDF | @react-pdf/renderer | 4.3.2 | Xuất phiếu lương PDF |
| Xuất Excel | exceljs | 4.4.0 | Xuất báo cáo Excel |
| Validation | Zod | 4.3.6 | Kiểm tra dữ liệu đầu vào |
| Container | Docker Compose | — | Chạy PostgreSQL trong container |

---

# PHẦN 2: SRS — ĐẶC TẢ YÊU CẦU PHẦN MỀM

## 2.1. Yêu cầu chức năng (Functional Requirements)

| ID | Nhóm chức năng | Mô tả tổng quan | Trang liên quan |
|---|---|---|---|
| FR01 | **Quản lý Nhân viên** | Thêm, sửa, xóa, tìm kiếm, lọc nhân viên theo phòng ban/trạng thái. Hỗ trợ tìm kiếm tiếng Việt không dấu (gõ "hoang" tìm được "Hoàng"). Xóa 2 bước: xóa mềm (chuyển "Nghỉ việc") → xóa cứng (xóa vĩnh viễn kèm toàn bộ dữ liệu liên quan bằng transaction). Có thể khôi phục NV đã nghỉ việc. Upload + crop ảnh đại diện | `/employees`, `/employees/[id]`, `/employees/new` |
| FR02 | **Quản lý Phòng ban** | Thêm, sửa, xóa mềm phòng ban (dùng cờ isActive). Hiển thị số nhân viên mỗi phòng ban | `/departments` |
| FR03 | **Quản lý Chức vụ** | Thêm, sửa, xóa mềm chức vụ. Hiển thị số nhân viên đang giữ từng chức vụ | `/positions` |
| FR04 | **Quản lý Hợp đồng Lao động** | Tạo hợp đồng với 4 loại (Chính thức, Thử việc, Thời vụ, Thực tập), ghi nhận lương cơ bản + hệ số + phụ cấp. Tự động cảnh báo hợp đồng sắp hết hạn trong 30 ngày. Hỗ trợ chấm dứt hợp đồng | `/contracts` |
| FR05 | **Chấm công** | Nhân viên check-in/check-out hàng ngày. Hệ thống tự tính: phút đi muộn (so với 8:00), giờ tăng ca (sau 17:00), phút về sớm (trước 17:00). Bảng chấm công tổng hợp theo tháng, lọc theo phòng ban. Admin sửa chấm công thủ công khi cần | `/attendance`, `/attendance/check-in` |
| FR06 | **Quản lý Nghỉ phép** | Tạo đơn nghỉ (6 loại: Nghỉ năm, Nghỉ ốm, Việc riêng, Nghỉ lễ, Thai sản, Không lương), tự tính ngày làm việc (trừ T7/CN). Manager/HR/Admin duyệt hoặc từ chối. Khi duyệt: kiểm tra quỹ phép → trừ quỹ (dùng transaction). Xem quỹ phép còn lại — mặc định 12 ngày/năm | `/leave`, `/leave/request` |
| FR07 | **Quản lý Tiền lương** | Tính lương tự động Gross→Net: lấy hợp đồng hiệu lực + chấm công → áp dụng BHXH 8%, BHYT 1.5%, BHTN 1%, giảm trừ gia cảnh 11tr + 4.4tr/người phụ thuộc, thuế TNCN 7 bậc (5%→35%) theo luật VN. Thực tập sinh: lương × 85%. Xuất phiếu lương PDF và báo cáo Excel. Cấu hình tỷ lệ BH/thuế | `/payroll`, `/payroll/config`, `/payslips`, `/payslips/[id]` |
| FR08 | **Đăng nhập & Phân quyền** | Đăng nhập bằng username/password (mật khẩu hash bcrypt). Phân quyền RBAC 6 vai trò — mỗi role có dashboard riêng. Edge Middleware bảo vệ mọi route. Quên mật khẩu: gửi mật khẩu tạm qua Gmail SMTP. Bắt buộc thiết lập email cá nhân khi login lần đầu. Đổi mật khẩu | `/login`, `/forgot-password`, `/setup-email` |
| FR09 | **Dashboard & Báo cáo** | 6 dashboard riêng biệt: Admin (KPI + biểu đồ nhân sự), HR (nghỉ phép + biến động NV), Kế toán (quỹ lương), Giám đốc (tổng quan), Trưởng phòng (phòng ban), Nhân viên (cá nhân + phiếu lương). Quản lý tài khoản user (CRUD + gán role). Hồ sơ cá nhân + upload avatar | `/dashboard`, `/dashboard-*`, `/settings/users`, `/profile` |
| FR10 | **Lịch sử Công tác & Công tác phí** | Ghi nhận sự kiện: bổ nhiệm, thăng chức, giáng chức, điều chuyển, khen thưởng, kỷ luật — hiển thị dạng timeline. Khi thăng chức/điều chuyển: tự động cập nhật chức vụ/phòng ban NV (transaction). Quản lý công tác phí + phê duyệt | `/career-history`, `/business-trips` |
| FR11 | **Tính năng giao diện** | Responsive 3 kích thước (Desktop/Tablet/Mobile — trên mobile bảng thành card, sidebar thành bottom nav). Dark/Light mode (lưu localStorage). Song ngữ Việt/Anh toàn hệ thống (toggle bằng icon cờ) | Toàn hệ thống |

### Công thức tính lương (FR07 — theo luật Việt Nam)

```
Lương Gross  = (Lương cơ bản × Hệ số lương) + Phụ cấp + Tiền tăng ca
Bảo hiểm     = (Lương cơ bản × Hệ số) × 10.5%   [BHXH 8% + BHYT 1.5% + BHTN 1%]
Giảm trừ     = 11.000.000đ + 4.400.000đ × Số người phụ thuộc
Thu nhập      = max(0, Gross − Bảo hiểm − Giảm trừ)
  chịu thuế
Thuế TNCN    = Biểu lũy tiến 7 bậc (5% / 10% / 15% / 20% / 25% / 30% / 35%)
Lương Net    = Gross − Bảo hiểm − Thuế TNCN
Tiền tăng ca = (Lương CB × Hệ số / 26 ngày / 8 giờ) × 1.5 × Số giờ OT
Thực tập sinh = Lương cơ bản × 85% (phụ cấp giữ nguyên 100%)
```

## 2.2. Yêu cầu phi chức năng (Non-Functional Requirements)

| ID | Loại | Yêu cầu | Cách thực hiện |
|---|---|---|---|
| NFR01 | Hiệu năng | Thời gian tải trang dưới 2 giây | Server Components render HTML trên server |
| NFR02 | Bảo mật | Mật khẩu không lưu dạng text thuần | bcryptjs hash (salt rounds = 10) |
| NFR03 | Bảo mật | Mọi trang dashboard phải kiểm tra đăng nhập | Edge Middleware kiểm tra JWT trước mỗi request |
| NFR04 | Bảo mật | API upload phải có xác thực | Kiểm tra session trước khi xử lý |
| NFR05 | Khả dụng | Hoạt động trên Desktop, Tablet, Mobile | 3 breakpoints + bottom nav mobile |
| NFR06 | Khả dụng | Hỗ trợ chế độ tối | CSS variables + React Context |
| NFR07 | Đa ngôn ngữ | Song ngữ VI / EN | DashLang context + i18n-maps.ts |
| NFR08 | Toàn vẹn | Dữ liệu nhất quán khi thao tác đồng thời | Prisma $transaction() |
| NFR09 | Mở rộng | Dễ thêm module mới | Kiến trúc 3 lớp + Service pattern |

## 2.3. Ma trận phân quyền RBAC — 6 vai trò

| Chức năng | Admin | Director | HRManager | Accountant | Manager | Employee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard toàn bộ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dashboard riêng | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Thêm/sửa nhân viên | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Xem nhân viên | ✅ | 👁️ | ✅ | 👁️ | 👁️ phòng | 👁️ mình |
| Xóa nhân viên | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Duyệt nghỉ phép | ✅ | ❌ | ✅ | ❌ | ✅ phòng | ❌ |
| Tạo đơn nghỉ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tính lương | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Xem phiếu lương | ✅ | ✅ | ✅ | ✅ | 👁️ phòng | 👁️ mình |
| Quản lý tài khoản | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xuất báo cáo | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |


---


# PHẦN 3: USE CASE

## 3.1. Tổng quan Use Case — 6 Actor × 4 Phân hệ

```
                          ┌─────────────────────────────────────┐
                          │        AXIOM HRM & PAYROLL          │
                          │            SYSTEM                    │
                          │                                     │
 ┌──────────┐            │  ┌─────────────────────────────┐   │
 │  Admin   │────────────┼─▶│ UC-A: Quản lý Hồ sơ NV     │   │
 │(Quản trị)│            │  │  • CRUD Nhân viên            │   │
 └──────────┘            │  │  • CRUD Phòng ban            │   │
                          │  │  • CRUD Chức vụ              │   │
 ┌──────────┐            │  │  • CRUD Hợp đồng LĐ         │   │
 │ Director │────────────┼─▶│  • Lịch sử công tác          │   │
 │(Giám đốc)│            │  │  • Quản lý công tác phí      │   │
 └──────────┘            │  └─────────────────────────────┘   │
                          │                                     │
 ┌──────────┐            │  ┌─────────────────────────────┐   │
 │HRManager │────────────┼─▶│ UC-B: Chấm công & Nghỉ phép│   │
 │(TP Nhân  │            │  │  • Check-in / Check-out      │   │
 │  sự)     │            │  │  • Xem bảng chấm công        │   │
 └──────────┘            │  │  • Tạo đơn nghỉ phép         │   │
                          │  │  • Duyệt / Từ chối đơn      │   │
 ┌──────────┐            │  │  • Xem quỹ phép còn lại      │   │
 │Accountant│────────────┼─▶└─────────────────────────────┘   │
 │(Kế toán) │            │                                     │
 └──────────┘            │  ┌─────────────────────────────┐   │
                          │  │ UC-C: Quản lý Tiền lương    │   │
 ┌──────────┐            │  │  • Tính lương Gross → Net    │   │
 │ Manager  │────────────┼─▶│  • Xem bảng lương tháng      │   │
 │(Trưởng   │            │  │  • Xem/Xuất phiếu lương PDF │   │
 │ phòng)   │            │  │  • Cấu hình tỷ lệ BH/thuế  │   │
 └──────────┘            │  │  • Xuất báo cáo Excel        │   │
                          │  └─────────────────────────────┘   │
 ┌──────────┐            │                                     │
 │ Employee │────────────┼─▶┌─────────────────────────────┐   │
 │(Nhân viên)│            │  │ UC-D: Báo cáo & Quản trị   │   │
 └──────────┘            │  │  • Xem Dashboard (6 loại)    │   │
                          │  │  • Quản lý tài khoản user   │   │
                          │  │  • Đổi mật khẩu             │   │
                          │  │  • Quên mật khẩu (email)    │   │
                          │  │  • Thiết lập email cá nhân  │   │
                          │  │  • Upload/Crop avatar        │   │
                          │  └─────────────────────────────┘   │
                          └─────────────────────────────────────┘
```

## 3.2. Use Case chi tiết — UC-A: Quản lý Hồ sơ Nhân sự

| UC ID | Tên Use Case | Actor | Mô tả | Tiền điều kiện | Hậu điều kiện |
|---|---|---|---|---|---|
| UC-A01 | Quản lý nhân viên | Admin, HRManager | Thêm / sửa / xóa mềm / xóa cứng / khôi phục / tìm kiếm / lọc nhân viên | Đã đăng nhập với quyền Admin hoặc HRManager | Dữ liệu NV được cập nhật trong DB |
| UC-A02 | Quản lý phòng ban | Admin | Thêm / sửa / vô hiệu hóa phòng ban (soft delete) | Đã đăng nhập với quyền Admin | Phòng ban được cập nhật |
| UC-A03 | Quản lý chức vụ | Admin | Thêm / sửa / vô hiệu hóa chức vụ | Đã đăng nhập với quyền Admin | Chức vụ được cập nhật |
| UC-A04 | Quản lý hợp đồng | Admin, HRManager | Tạo / sửa / chấm dứt hợp đồng. Hệ thống tự động cảnh báo HĐ sắp hết hạn 30 ngày | Nhân viên đã tồn tại trong hệ thống | HĐ được tạo/cập nhật |
| UC-A05 | Lịch sử công tác | Admin, HRManager | Ghi nhận sự kiện: bổ nhiệm, thăng chức, điều chuyển, khen thưởng, kỷ luật — tự động cập nhật thông tin NV bằng transaction | Nhân viên đã tồn tại | Timeline cập nhật + Employee auto-update |
| UC-A06 | Quản lý công tác phí | All roles | Tạo lệnh công tác + quy trình phê duyệt | Đã đăng nhập | Lệnh CT được tạo/duyệt |

**Luồng chính UC-A01 — Thêm nhân viên mới:**
```
1. Admin/HR vào trang /employees → bấm "Thêm nhân viên"
2. Điền form: Họ tên, Email, SĐT, Phòng ban, Chức vụ, Ngày vào
3. Hệ thống validate bằng Zod (kiểm tra email, họ tên không rỗng, ...)
4. Nếu hợp lệ → Server Action → Service → Prisma create → Lưu DB
5. Hệ thống tự động gán mã nhân viên (NV001, NV002, ...)
6. Quay về danh sách + hiển thị thông báo "Thành công"
```

**Luồng phụ — Xóa nhân viên 2 bước:**
```
Bước 1 — Xóa mềm:
  Admin bấm "Xóa" → Status → "Nghỉ việc" (dữ liệu còn, có thể khôi phục)

Bước 2 — Xóa cứng (chỉ NV "Nghỉ việc"):
  Admin bấm "Xóa vĩnh viễn" → Transaction xóa toàn bộ data liên quan:
  phiếu lương → bảng lương → hợp đồng → lịch sử → chấm công
  → nghỉ phép → quỹ phép → công tác phí → tài khoản → nhân viên

Khôi phục:
  Admin bấm "Đi làm lại" trên NV "Nghỉ việc" → Status → "Đang làm"
```

## 3.3. Use Case chi tiết — UC-B: Chấm công & Nghỉ phép

| UC ID | Tên Use Case | Actor | Mô tả | Tiền điều kiện | Hậu điều kiện |
|---|---|---|---|---|---|
| UC-B01 | Check-in | Employee | Ghi nhận giờ vào làm. Tự động tính phút đi muộn nếu sau 8:00 | Đã đăng nhập, chưa check-in hôm nay | Record attendance được tạo |
| UC-B02 | Check-out | Employee | Ghi nhận giờ về. Tự tính: OT nếu sau 17:00, về sớm nếu trước 17:00 | Đã check-in hôm nay | otHours + earlyMinutes được tính |
| UC-B03 | Xem chấm công | All roles | Xem bảng tổng hợp chấm công theo tháng, lọc phòng ban | Đã đăng nhập | Hiển thị bảng chấm công |
| UC-B04 | Tạo đơn nghỉ phép | Employee | Chọn loại nghỉ → chọn ngày → nhập lý do → xác nhận. Tự tính ngày (trừ T7/CN) | Đã đăng nhập | Đơn ở trạng thái "Chờ duyệt" |
| UC-B05 | Duyệt đơn nghỉ phép | Manager, HR, Admin | Duyệt hoặc từ chối. Nếu duyệt: kiểm tra quỹ phép → trừ quỹ (transaction) | Đơn ở trạng thái "Chờ duyệt" | "Đã duyệt" + quỹ trừ, hoặc "Từ chối" |

**Luồng chính UC-B05 — Duyệt đơn nghỉ phép (transaction):**
```
1. Manager/HR mở danh sách đơn "Chờ duyệt"
2. Bấm "Duyệt" trên 1 đơn
3. Hệ thống bắt đầu transaction:
   a. Tìm đơn nghỉ theo ID
   b. Tìm quỹ phép của NV đó (theo loại nghỉ + năm)
   c. Kiểm tra: ngày đã dùng + ngày xin ≤ tổng ngày được phép
      → Nếu KHÔNG đủ → lỗi "Quỹ phép không đủ" → hủy
   d. Cập nhật đơn: trạng thái → "Đã duyệt" + ghi người duyệt + ngày duyệt
   e. Trừ quỹ: ngày đã dùng += ngày xin nghỉ
4. Transaction thành công → Thông báo "Đã duyệt"
```

## 3.4. Use Case chi tiết — UC-C: Quản lý Tiền lương

| UC ID | Tên Use Case | Actor | Mô tả | Tiền điều kiện | Hậu điều kiện |
|---|---|---|---|---|---|
| UC-C01 | Tính lương | Admin, Accountant | Tính Gross→Net cho NV: lấy HĐ + chấm công → áp công thức | NV có HĐ hiệu lực + chấm công | Record payroll tạo/cập nhật |
| UC-C02 | Xem bảng lương | Admin, Accountant, Director | Xem bảng lương tổng hợp, lọc/sắp xếp | Payroll đã tính | Hiển thị bảng lương |
| UC-C03 | Xem phiếu lương | Tùy role | Xem chi tiết breakdown: Gross, BH, Thuế, Net | Payroll đã tính | Hiển thị phiếu lương |
| UC-C04 | Xuất PDF/Excel | Admin, Accountant | Export phiếu lương PDF hoặc báo cáo Excel | Payroll đã tính | File được tải về |

**Luồng chính UC-C01 — Tính lương:**
```
1. Admin/Kế toán vào /payroll → chọn tháng/năm → bấm "Tính lương"
2. Với mỗi nhân viên:
   a. Tìm hợp đồng đang hiệu lực
   b. Tổng hợp chấm công tháng: ngày công + giờ OT
   c. Nếu HĐ "Thực tập" → lương cơ bản × 85%
   d. Tính Gross = (lương CB × hệ số) + phụ cấp + tiền OT
   e. Tính BH = (lương CB × hệ số) × 10.5%
   f. Tính thuế TNCN theo 7 bậc
   g. Net = Gross − BH − Thuế
3. Lưu vào bảng payroll (upsert — tránh trùng)
```

## 3.5. Use Case chi tiết — UC-D: Báo cáo & Quản trị

| UC ID | Tên Use Case | Actor | Mô tả | Tiền điều kiện | Hậu điều kiện |
|---|---|---|---|---|---|
| UC-D01 | Xem Dashboard | All roles | Mỗi role xem dashboard riêng với KPI + biểu đồ phù hợp | Đã đăng nhập | Hiển thị dashboard |
| UC-D02 | Quản lý User | Admin | CRUD tài khoản + gán role + khóa/mở. Tạo user mới = tạo Employee (transaction) | Role Admin | User + Employee trong DB |
| UC-D03 | Đổi mật khẩu | All roles | Nhập MK cũ + MK mới → verify → hash → cập nhật | Đã đăng nhập | passwordHash cập nhật |
| UC-D04 | Quên mật khẩu | All roles | Nhập email → tìm user → tạo MK tạm → gửi email Gmail SMTP | Đã có personalEmail | Email gửi + MK tạm set |
| UC-D05 | Setup Email | non-Admin | Bắt buộc nhập Gmail khi login lần đầu, Middleware tự redirect | Login lần đầu | personalEmail lưu DB |
| UC-D06 | Upload Avatar | All roles | Upload ảnh → crop (kéo/zoom/cắt tròn) → lưu disk → cập nhật DB | Đã đăng nhập | Avatar lưu + path cập nhật |

## 3.6. Danh sách bản vẽ UML đã hoàn thành

### Use Case Diagrams — 5 bản vẽ

| # | File | Nội dung |
|---|------|---------|
| 1 | `UML/Usecase/usecasetongquan.html` | **Tổng quan toàn hệ thống** — 6 Actor × 4 phân hệ |
| 2 | `UML/Usecase/usecase_corehr.html` | Use Case chi tiết — Quản lý Hồ sơ Nhân sự |
| 3 | `UML/Usecase/usecase_timeattendance.html` | Use Case chi tiết — Chấm công & Nghỉ phép |
| 4 | `UML/Usecase/usecase_payroll.html` | Use Case chi tiết — Quản lý Tiền lương |
| 5 | `UML/Usecase/usecase_baocao.html` | Use Case chi tiết — Báo cáo & Quản trị |

### Activity Diagrams — 4 bản vẽ

| # | File | Nội dung |
|---|------|---------|
| 1 | `Activity Diagram Core HR.jpg` | Luồng CRUD nhân viên, hợp đồng |
| 2 | `Activity Diagram Time & Attendance.jpg` | Luồng check-in/out + duyệt nghỉ phép |
| 3 | `Activity Diagram Payroll.jpg` | Luồng tính lương Gross → Net |
| 4 | `Activity Diagram Report.jpg` | Luồng xuất báo cáo + dashboard |

---

> 📌 **File này phục vụ bài thuyết trình bảo vệ đồ án Công nghệ Phần mềm.**
> Tham khảo thêm: `docs/project-summary.md` (chi tiết kỹ thuật đầy đủ)
