# 📅 Kế Hoạch 15 Ngày – HRM & Payroll System

> **Đề tài:** Xây dựng Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp  
> **Tech Stack:** C# .NET 8 · WinForms · SQL Server LocalDB · Kiến trúc 3 lớp  
> **Thời gian:** 15 ngày (Bắt đầu: 2026-03-21)  
> **Nhóm:** 52400017 – 52400133 – 52400004

---

## 📌 Mô tả đề tài

Hệ thống quản lý nhân sự và tiền lương doanh nghiệp (HRM & Payroll) cung cấp giải pháp phần mềm **desktop (C# WinForms)** toàn diện, được chia thành **4 phân hệ nghiệp vụ cốt lõi**:

| # | Phân hệ | Chức năng chính |
|---|---------|----------------|
| 1 | **Core HR** | Hồ sơ nhân viên, hợp đồng lao động (thử việc/chính thức), lịch sử thăng chức/điều chuyển/khen thưởng/kỷ luật |
| 2 | **Time & Attendance** | Chấm công (Check-in/out), tổng hợp ngày công/OT/đi muộn, đăng ký & duyệt nghỉ phép (ốm/năm/việc riêng), công tác phí |
| 3 | **Payroll** | Cấu hình lương + BHXH/BHYT/BHTN + Thuế TNCN lũy tiến, tính lương Gross→Net tự động, xuất phiếu lương (Payslip) |
| 4 | **Báo cáo & Quản trị** | Dashboard thống kê biến động nhân sự/quỹ lương, phân quyền RBAC (Admin / HR Manager / Nhân viên) |

**Luồng dữ liệu xuyên suốt:** Hồ sơ NV → Hợp đồng → Chấm công & Nghỉ phép → **Tính lương tự động** → Phiếu lương

---

## 📊 Trạng thái hiện tại (Cập nhật: 2026-03-23)

### ✅ Đã hoàn thành

| File | Mô tả | Trạng thái |
|------|-------|-----------|
| `HRMPayroll.csproj` | Project file (.NET 8, WinForms) | ✅ Hoàn chỉnh |
| `Program.cs` | Entry point → `frmLogin` | ✅ Hoàn chỉnh |
| `Utils/AppSession.cs` | Session + `UserInfo` DTO | ✅ Hoàn chỉnh |
| `BLL/AuthService.cs` | Xác thực (hardcoded demo: admin/hr/nv001) | ✅ Stub hoạt động |
| `UI/Auth/frmLogin.cs` | Form đăng nhập đầy đủ | ✅ Hoàn chỉnh |
| `UI/Auth/frmLogin.Designer.cs` | Layout login form | ✅ Hoàn chỉnh |
| `UI/Dashboard/frmAdminDashboard.cs` | Dashboard Admin (28 dòng) | ⚠️ Stub (chỉ label chào) |
| `UI/Dashboard/frmHRDashboard.cs` | Dashboard HR Manager (28 dòng) | ⚠️ Stub (chỉ label chào) |
| `UI/Dashboard/frmEmployeeDashboard.cs` | Dashboard Nhân viên (28 dòng) | ⚠️ Stub (chỉ label chào) |
| `Utils/CustomTextBox.cs` | TextBox custom vẽ placeholder | ✅ Hoàn chỉnh (không dùng với password field) |
| `images/` | Logo AXIOM, cờ VN, cờ Anh | ✅ Hoàn chỉnh |
| `docs/mo-ta-de-tai.md` | Mô tả đề tài | ✅ Hoàn chỉnh |
| `docs/README.md` | Giới thiệu dự án | ✅ Hoàn chỉnh |
| `docs/SETUP.md` | Hướng dẫn cài đặt | ✅ Hoàn chỉnh |
| `docs/color-palette.md` | Bảng màu UI | ✅ Hoàn chỉnh |
| `usecase.html` | Sơ đồ Use Case | ✅ Hoàn chỉnh |

### 🔴 Tính năng frmLogin đã có (600 dòng code + 267 dòng Designer)

- ✅ Giao diện card trắng trên gradient đỏ (bo tròn, soft shadow 8 layers)
- ✅ Dark mode / Light mode toggle (🌞/🌙) – nền gần-đen trung tính, card charcoal-grey
- ✅ Light mode: gradient đỏ mắt bớt chói, bóng đổ mềm
- ✅ Song ngữ VI ↔ EN (ảnh cờ quốc kì)
- ✅ Logo AXIOM phóng to, nền gradient bo tròn kiểu iOS
- ✅ Hiển thị/ẩn mật khẩu (👁/🙈)
- ✅ Link "Quên mật khẩu?"
- ✅ Validate input + thông báo lỗi
- ✅ Phân luồng Dashboard theo role (Admin/HR/Employee)
- ✅ Decorative circles trên background
- ✅ Win32 P/Invoke (EM_SETCUEBANNER) cho placeholder mật khẩu
- ✅ Focus input: đồng bộ màu TextBox và Panel wrap

### ❌ Chưa tồn tại (Cần xây dựng)

| Thư mục/File | Mô tả | Độ ưu tiên |
|-------------|-------|-----------|
| **`Models/`** | Toàn bộ entity classes (Employee, Department, Contract, Attendance...) | 🔴 Cao |
| **`DAL/`** | Toàn bộ Data Access Layer (DatabaseHelper, các DAO) | 🔴 Cao |
| **`Database/`** | SQL scripts (schema, seed, stored procedures) | 🔴 Cao |
| **`BLL/`** | Các service còn lại (Employee, Contract, Attendance, Leave, Payroll...) | 🔴 Cao |
| **`UI/CoreHR/`** | Forms quản lý nhân viên, hợp đồng, phòng ban, lịch sử công tác | 🟠 Cao |
| **`UI/TimeAttendance/`** | Forms chấm công, nghỉ phép, công tác phí | 🟠 Trung bình |
| **`UI/Payroll/`** | Forms cấu hình lương, tính lương, phiếu lương | 🟡 Trung bình |
| **`UI/Reports/`** | Forms báo cáo (headcount, attendance, payroll, contract) | 🟡 Trung bình |
| **Dashboard nâng cấp** | Biểu đồ, menu điều hướng, sidebar | 🟠 Trung bình |
| `Utils/TaxCalculator.cs` | Tính thuế TNCN lũy tiến | 🟡 Khi có Payroll |
| `Utils/PrintHelper.cs` | Xuất PDF báo cáo | 🔵 Thấp |
| `Utils/ValidationHelper.cs` | Validate input dùng chung | 🔵 Thấp |
| `App.config` | Connection string SQL Server | 🔴 Cần ngay khi có DAL |

---

## 🗂️ Cấu trúc thư mục dự án

> **Tech Stack:** C# (.NET 8) · WinForms · SQL Server (LocalDB) · Kiến trúc 3 lớp (DAL / BLL / UI)

```
HRMPayroll/                              # Thư mục gốc
│
├── HRMPayroll.sln                       # Solution file – mở bằng Visual Studio
│
├── 📁 HRMPayroll/                       # Project chính (C# WinForms)
│   │
│   ├── 📁 Models/                       # ❌ Chưa có – Lớp thực thể dữ liệu
│   │   ├── Employee.cs                  # Nhân viên
│   │   ├── Department.cs                # Phòng ban, chức vụ
│   │   ├── Contract.cs                  # Hợp đồng lao động
│   │   ├── CareerHistory.cs             # Lịch sử công tác
│   │   ├── Attendance.cs                # Chấm công
│   │   ├── LeaveRequest.cs              # Đơn xin nghỉ phép
│   │   ├── LeaveBalance.cs              # Quỹ phép còn lại
│   │   ├── BusinessTrip.cs              # Công tác phí
│   │   ├── SalaryConfig.cs              # Cấu hình công thức lương
│   │   ├── Payroll.cs                   # Bảng lương tháng
│   │   ├── Payslip.cs                   # Phiếu lương nhân viên
│   │   └── User.cs                      # Tài khoản & vai trò (RBAC)
│   │
│   ├── 📁 DAL/                          # ❌ Chưa có – Data Access Layer
│   │   ├── DatabaseHelper.cs            # Kết nối SQL Server, execute query
│   │   ├── EmployeeDAO.cs               # CRUD nhân viên
│   │   ├── DepartmentDAO.cs             # CRUD phòng ban
│   │   ├── ContractDAO.cs               # CRUD hợp đồng
│   │   ├── CareerHistoryDAO.cs          # CRUD lịch sử công tác
│   │   ├── AttendanceDAO.cs             # CRUD chấm công
│   │   ├── LeaveDAO.cs                  # CRUD nghỉ phép
│   │   ├── BusinessTripDAO.cs           # CRUD công tác phí
│   │   ├── SalaryConfigDAO.cs           # CRUD cấu hình lương
│   │   ├── PayrollDAO.cs                # CRUD bảng lương
│   │   ├── PayslipDAO.cs                # CRUD phiếu lương
│   │   └── UserDAO.cs                   # CRUD tài khoản & xác thực
│   │
│   ├── 📁 BLL/                          # ⚠️ Mới có AuthService
│   │   ├── ✅ AuthService.cs            # Đăng nhập (stub hardcoded)
│   │   ├── EmployeeService.cs           # ❌ Logic nhân viên
│   │   ├── ContractService.cs           # ❌ Logic hợp đồng
│   │   ├── AttendanceService.cs         # ❌ Logic chấm công
│   │   ├── LeaveService.cs              # ❌ Logic nghỉ phép
│   │   ├── BusinessTripService.cs       # ❌ Logic công tác phí
│   │   ├── PayrollEngine.cs             # ❌ Logic tính lương
│   │   ├── PayslipService.cs            # ❌ Logic phiếu lương
│   │   └── ReportService.cs             # ❌ Logic báo cáo
│   │
│   ├── 📁 UI/                           # ⚠️ Mới có Auth + Dashboard stubs
│   │   │
│   │   ├── 📁 Auth/                     # ✅ Hoàn chỉnh
│   │   │   ├── frmLogin.cs              # Form đăng nhập (full features)
│   │   │   └── frmLogin.Designer.cs     # Layout
│   │   │
│   │   ├── 📁 Dashboard/               # ⚠️ Chỉ stubs
│   │   │   ├── frmAdminDashboard.cs     # Stub – cần sidebar, charts
│   │   │   ├── frmHRDashboard.cs        # Stub – cần sidebar, menu
│   │   │   └── frmEmployeeDashboard.cs  # Stub – cần sidebar, self-service
│   │   │
│   │   ├── 📁 CoreHR/                   # ❌ Chưa có
│   │   ├── 📁 TimeAttendance/           # ❌ Chưa có
│   │   ├── 📁 Payroll/                  # ❌ Chưa có
│   │   └── 📁 Reports/                  # ❌ Chưa có
│   │
│   ├── 📁 Utils/                        # ⚠️ Mới có AppSession
│   │   ├── ✅ AppSession.cs             # Session + UserInfo DTO
│   │   ├── TaxCalculator.cs             # ❌ Chưa có
│   │   ├── PrintHelper.cs               # ❌ Chưa có
│   │   └── ValidationHelper.cs          # ❌ Chưa có
│   │
│   ├── App.config                       # ❌ Chưa có connection string
│   ├── ✅ Program.cs                    # Entry point
│   └── ✅ HRMPayroll.csproj             # .NET 8 WinForms
│
├── 📁 Database/                         # ❌ Chưa có
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── 03_stored_procedures.sql
│
├── 📁 docs/                             # ✅ Tài liệu
│   ├── ✅ mo-ta-de-tai.md
│   ├── ✅ README.md
│   ├── ✅ SETUP.md
│   ├── ✅ color-palette.md
│   └── ✅ plan.md (file này)
│
├── 📁 images/                           # ✅ Logo + cờ
│   ├── logoAXIOM.png
│   ├── covietnam.png
│   └── coanh.png
│
└── ✅ usecase.html                      # Sơ đồ Use Case
```

### 📌 Ghi chú cấu trúc Dashboard (3 roles – RBAC)

| Form | Vai trò | Chức năng chính |
|------|---------|----------------|
| `frmAdminDashboard` | Admin, Ban lãnh đạo | Thống kê tổng quát, quỹ lương, biến động nhân sự |
| `frmHRDashboard` | HR Manager, Kế toán | Quản lý toàn bộ hồ sơ, chấm công, tính lương |
| `frmEmployeeDashboard` | Nhân viên | Xem phiếu lương, quỹ phép, gửi đơn nghỉ |

> 💡 **Cơ chế RBAC:** Sau khi đăng nhập, `AuthService` đọc `role` từ DB, `AppSession` lưu thông tin. `Program.cs` khởi chạy đúng form Dashboard tương ứng với role.

---

## 🗓️ Tổng quan timeline

| Giai đoạn | Ngày | Nội dung | Trạng thái |
|-----------|------|----------|-----------|
| **Phase 1 – Nền tảng** | Ngày 1–3 | Phân tích, thiết kế CSDL, khởi tạo dự án | 🔄 Đang làm |
| **Phase 2 – Core HR** | Ngày 4–6 | Quản lý hồ sơ, hợp đồng, tài khoản & phân quyền | ⏳ Chưa bắt đầu |
| **Phase 3 – Chấm công & Nghỉ phép** | Ngày 7–9 | Time & Attendance, nghỉ phép, công tác phí | ⏳ Chưa bắt đầu |
| **Phase 4 – Tiền lương** | Ngày 10–12 | Cấu hình lương, tính lương tự động, xuất phiếu | ⏳ Chưa bắt đầu |
| **Phase 5 – Dashboard & Hoàn thiện** | Ngày 13–15 | Báo cáo, kiểm thử, fix bug, nộp bài | ⏳ Chưa bắt đầu |

---

## 📋 Chi tiết từng ngày

### 🔴 Phase 1 – Nền tảng & Phân tích (Ngày 1–3)

#### Ngày 1 – Phân tích & Thiết kế hệ thống ✅
- [x] Xác định rõ yêu cầu chức năng (Functional Requirements) theo 4 phân hệ
- [x] Xác định yêu cầu phi chức năng (bảo mật, phân quyền RBAC, hiệu suất)
- [x] Vẽ sơ đồ Use Case tổng quan toàn hệ thống (`usecase.html`)
- [x] Phân công nhiệm vụ cụ thể cho từng thành viên
- [x] **Thống nhất tech stack:** C# .NET 8 · WinForms (Desktop App) · SQL Server LocalDB · Kiến trúc 3 lớp (DAL/BLL/UI)

#### Ngày 2 – Thiết kế CSDL
- [ ] Thiết kế ERD (Entity Relationship Diagram) đầy đủ:
  - Bảng: `employees`, `departments`, `contracts`, `positions`
  - Bảng: `attendance`, `leave_requests`, `leave_balance`, `business_trips`
  - Bảng: `salary_config`, `payroll`, `payslips`
  - Bảng: `users`, `roles`, `permissions`
- [ ] Review ERD – đảm bảo quan hệ và ràng buộc dữ liệu chính xác
- [ ] Viết script SQL tạo CSDL (`Database/01_schema.sql`)

#### Ngày 3 – Khởi tạo dự án & Setup môi trường *(Hoàn thành phần lớn: 2026-03-23)*
- [x] Tạo Solution `HRMPayroll.sln` + Project WinForms theo đúng cấu trúc thư mục
- [x] Cài đặt môi trường: Visual Studio 2022, .NET 8, SQL Server LocalDB
- [ ] Cấu hình `App.config`: connection string SQL Server LocalDB
- [ ] Implement `DatabaseHelper.cs`: kết nối CSDL, execute query dùng chung
- [x] Xây dựng `frmLogin.cs` (600 dòng) + `frmLogin.Designer.cs` (267 dòng) – full features
- [x] `AuthService.cs` (stub hardcoded 3 tài khoản demo)
- [x] `AppSession.cs` + `UserInfo` DTO
- [x] 3 Dashboard stubs (Admin / HR / Employee)
- [x] `CustomTextBox.cs` – custom placeholder rendering
- [x] Win32 P/Invoke `EM_SETCUEBANNER` cho password placeholder
- [x] Dark mode chuẩn (nền trung tính, card charcoal, accent đỏ)
- [x] Light mode: gradient bớt chói, soft shadow card
- [ ] Seed dữ liệu mẫu (`02_seed.sql`)

---

### 🟠 Phase 2 – Quản lý Hồ sơ Nhân sự – Core HR (Ngày 4–6)

#### Ngày 4 – Quản lý thông tin nhân viên
- [ ] Tạo `Models/Employee.cs`, `Models/Department.cs`
- [ ] Implement `DAL/EmployeeDAO.cs`, `DAL/DepartmentDAO.cs`
- [ ] Implement `BLL/EmployeeService.cs`
- [ ] CRUD nhân viên: thêm, sửa, xóa, xem danh sách
- [ ] Form `UI/CoreHR/frmEmployeeList.cs`: danh sách + tìm kiếm + lọc
- [ ] Form `UI/CoreHR/frmEmployeeDetail.cs`: thêm/sửa hồ sơ chi tiết
- [ ] Form `UI/CoreHR/frmDepartmentList.cs`: quản lý phòng ban

#### Ngày 5 – Quản lý Hợp đồng lao động
- [ ] Tạo `Models/Contract.cs`
- [ ] Implement `DAL/ContractDAO.cs`, `BLL/ContractService.cs`
- [ ] CRUD hợp đồng: loại (thử việc / chính thức), ngày bắt đầu, ngày kết thúc
- [ ] Gắn bậc lương, phụ cấp trách nhiệm vào hợp đồng
- [ ] **Cảnh báo tự động:** Thông báo hợp đồng sắp hết hạn (trong vòng 30 ngày)
- [ ] Form `UI/CoreHR/frmContractList.cs` + `frmContractDetail.cs`

#### Ngày 6 – Lịch sử công tác & Phân quyền
- [ ] Tạo `Models/CareerHistory.cs`
- [ ] Implement `DAL/CareerHistoryDAO.cs`
- [ ] Form `UI/CoreHR/frmCareerHistory.cs`: thăng chức, điều chuyển, khen thưởng, kỷ luật
- [ ] Nâng cấp `AuthService.cs`: kết nối DB thật thay vì hardcoded
- [ ] Implement `DAL/UserDAO.cs`, `Models/User.cs`
- [ ] Kiểm thử toàn bộ Phase 2, fix bug

---

### 🟡 Phase 3 – Time & Attendance và Nghỉ phép (Ngày 7–9)

#### Ngày 7 – Quản lý Chấm công
- [ ] Tạo `Models/Attendance.cs`
- [ ] Implement `DAL/AttendanceDAO.cs`, `BLL/AttendanceService.cs`
- [ ] Form `UI/TimeAttendance/frmAttendanceMonth.cs`: bảng chấm công tháng
- [ ] Form `UI/TimeAttendance/frmAttendanceInput.cs`: nhập/chỉnh sửa công
- [ ] Tự động tổng hợp: ngày công thực tế, giờ OT, đi muộn/về sớm

#### Ngày 8 – Quản lý Nghỉ phép
- [ ] Tạo `Models/LeaveRequest.cs`, `Models/LeaveBalance.cs`
- [ ] Implement `DAL/LeaveDAO.cs`, `BLL/LeaveService.cs`
- [ ] Form `UI/TimeAttendance/frmLeaveRequest.cs`: nhân viên gửi đơn
- [ ] Form `UI/TimeAttendance/frmLeaveApproval.cs`: HR duyệt đơn
- [ ] Form `UI/TimeAttendance/frmLeaveBalance.cs`: xem quỹ phép
- [ ] Tự động trừ quỹ phép khi duyệt

#### Ngày 9 – Công tác phí & Kiểm thử Phase 3
- [ ] Tạo `Models/BusinessTrip.cs`
- [ ] Implement `DAL/BusinessTripDAO.cs`, `BLL/BusinessTripService.cs`
- [ ] Form `UI/TimeAttendance/frmBusinessTrip.cs`
- [ ] Kiểm thử toàn bộ Phase 3, fix bug

---

### 🟢 Phase 4 – Quản lý Tiền lương – Payroll (Ngày 10–12)

#### Ngày 10 – Cấu hình công thức lương
- [ ] Tạo `Models/SalaryConfig.cs`
- [ ] Implement `DAL/SalaryConfigDAO.cs`
- [ ] Implement `Utils/TaxCalculator.cs`: thuế TNCN lũy tiến
- [ ] Form `UI/Payroll/frmSalaryConfig.cs`: cấu hình lương cơ bản, BH, thuế

#### Ngày 11 – Tính lương tự động
- [ ] Tạo `Models/Payroll.cs`
- [ ] Implement `DAL/PayrollDAO.cs`, `BLL/PayrollEngine.cs`
- [ ] Engine: tổng hợp chấm công + nghỉ phép → Gross → khấu trừ → Net
- [ ] Form `UI/Payroll/frmPayrollRun.cs` + `frmPayrollSummary.cs`

#### Ngày 12 – Xuất phiếu lương & Kiểm thử
- [ ] Tạo `Models/Payslip.cs`
- [ ] Implement `DAL/PayslipDAO.cs`, `BLL/PayslipService.cs`
- [ ] Form `UI/Payroll/frmPayslipView.cs`
- [ ] `Utils/PrintHelper.cs`: xuất PDF
- [ ] Kiểm thử tính lương nhiều kịch bản

---

### 🔵 Phase 5 – Dashboard, Kiểm thử & Hoàn thiện (Ngày 13–15)

#### Ngày 13 – Dashboard & Báo cáo
- [ ] Nâng cấp `frmAdminDashboard`: sidebar menu + biểu đồ nhân sự + quỹ lương
- [ ] Nâng cấp `frmHRDashboard`: sidebar + quản lý đầy đủ
- [ ] Nâng cấp `frmEmployeeDashboard`: self-service (phiếu lương, nghỉ phép)
- [ ] Implement `BLL/ReportService.cs`
- [ ] Form `UI/Reports/frmReportHeadcount.cs`
- [ ] Form `UI/Reports/frmReportAttendance.cs`
- [ ] Form `UI/Reports/frmReportPayroll.cs`
- [ ] Form `UI/Reports/frmReportContract.cs`

#### Ngày 14 – Kiểm thử tổng thể (Integration Testing)
- [ ] Test end-to-end: Thêm NV → ký HĐ → chấm công → xin nghỉ → tính lương → xem phiếu
- [ ] Kiểm thử phân quyền: 3 tài khoản (Admin / HR / Employee)
- [ ] Kiểm thử tính toán lương: đủ công, thiếu công, OT, nghỉ ốm
- [ ] Kiểm thử exception handling: nhập sai, DB mất kết nối
- [ ] Fix toàn bộ bug còn lại

#### Ngày 15 – Hoàn thiện & Nộp bài
- [ ] Cập nhật README.md + SETUP.md
- [ ] Dọn dẹp code, comment rõ ràng
- [ ] Chuẩn bị slide báo cáo / demo
- [ ] **Demo thử toàn bộ hệ thống một lần cuối**
- [ ] Đóng gói, nộp bài đúng hạn ✅

---

## 👥 Phân công gợi ý

| Thành viên | Phụ trách chính |
|------------|-----------------|
| 52400017 | **BLL + Auth:** `AuthService`, `PayrollEngine`, `TaxCalculator`, `LeaveService`, `ReportService` |
| 52400133 | **DAL + Database:** `DatabaseHelper`, toàn bộ các `*DAO.cs`, scripts SQL (`schema`, `seed`, `stored procedures`) |
| 52400004 | **UI (WinForms Forms):** toàn bộ `frm*.cs` — Login, Dashboard, Core HR, TimeAttendance, Payroll, Reports |

> ⚠️ **Lưu ý:** Phân công có thể linh hoạt. Mỗi ngày cần họp nhóm 15–30 phút để đồng bộ tiến độ và giải quyết blockers ngay.

---

## ⚡ Nguyên tắc làm việc (15 ngày gấp rút)

1. **Ưu tiên core functionality** – Làm đủ chức năng chính trước, beauty sau
2. **Commit code hàng ngày** – Dùng Git, commit thường xuyên, tránh conflict
3. **Dữ liệu mẫu ngay từ đầu** – Seed data sớm để test không bị chờ đợi
4. **Giao tiếp liên tục** – Nếu bị block > 1 tiếng → hỏi ngay, không tự loay hoay
5. **Test song song với code** – Không để dồn test vào ngày cuối

---

## 🎯 Công việc tiếp theo (Bước tiếp theo cụ thể)

> Hiện tại đã hoàn thành **Ngày 3/15**. Login form hoàn chỉnh. Cần chuyển sang xây dựng backend.

### 🚨 ƯƯ TIÊN ngay – Database & Models (Ngày 4 sáng)

1. **Tạo `Database/01_schema.sql`** – SQL Server script tạo toàn bộ bảng:
   - `departments`, `positions` (đơn giản nhất, làm trước)
   - `employees` (FK → departments, positions)
   - `contracts` (FK → employees)
   - `career_history` (FK → employees)
   - `users`, `roles` (RBAC)
   - `attendance`, `leave_requests`, `leave_balance`
   - `salary_config`, `payroll`, `payslips`

2. **Tạo `Database/02_seed.sql`** – Dữ liệu mẫu:
   - 3–5 phòng ban, 5–10 chức vụ
   - 3 tài khoản (admin/hr/nv001) – khớp với AuthService stub
   - 10–15 nhân viên mẫu

3. **Tạo `Models/`** – Toàn bộ POCO classes mapping với DB:
   - `Employee.cs`, `Department.cs`, `Contract.cs`, `User.cs`...

4. **Tạo `DAL/DatabaseHelper.cs`** – Kết nối SQL Server, helper methods

5. **Tạo `App.config`** – Connection string

### ⏰ Sau đó – Core HR UI (Ngày 4 chiều – Ngày 6)

6. `DAL/EmployeeDAO.cs` + `BLL/EmployeeService.cs` → CRUD nhân viên
7. `UI/CoreHR/frmEmployeeList.cs` – DataGridView danh sách
8. `UI/CoreHR/frmEmployeeDetail.cs` – Form thêm/sửa
9. Tiếp tục theo plan Phase 2...
