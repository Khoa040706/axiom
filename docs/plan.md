# 📅 Kế Hoạch 15 Ngày – HRM & Payroll System

> **Đề tài:** Xây dựng Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp  
> **Tech Stack:** C# .NET 6+ · WinForms · SQL Server LocalDB · Kiến trúc 3 lớp  
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

## 🗂️ Cấu trúc thư mục dự án

> **Tech Stack:** C# (.NET 6+) · WinForms · SQL Server (LocalDB) · Kiến trúc 3 lớp (DAL / BLL / UI)

```
HRMPayroll/                              # Thư mục gốc
│
├── HRMPayroll.sln                       # Solution file – mở bằng Visual Studio
│
├── 📁 HRMPayroll/                       # Project chính (C# WinForms)
│   │
│   ├── 📁 Models/                       # Lớp thực thể dữ liệu (POCO classes)
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
│   ├── 📁 DAL/                          # Data Access Layer – giao tiếp CSDL
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
│   ├── 📁 BLL/                          # Business Logic Layer – xử lý nghiệp vụ
│   │   ├── EmployeeService.cs           # Logic: tìm kiếm, lọc, validate nhân viên
│   │   ├── ContractService.cs           # Logic: cảnh báo hợp đồng hết hạn
│   │   ├── AttendanceService.cs         # Logic: tổng hợp công, tính OT, đi muộn
│   │   ├── LeaveService.cs              # Logic: duyệt nghỉ, trừ quỹ phép tự động
│   │   ├── BusinessTripService.cs       # Logic: tính phụ cấp công tác
│   │   ├── PayrollEngine.cs             # Logic: tính lương Gross → Net (BH + thuế TNCN)
│   │   ├── PayslipService.cs            # Logic: tạo & xuất phiếu lương
│   │   ├── ReportService.cs             # Logic: tổng hợp báo cáo Dashboard
│   │   └── AuthService.cs               # Logic: đăng nhập, phân quyền RBAC
│   │
│   ├── 📁 UI/                           # Presentation Layer – WinForms Forms
│   │   │
│   │   ├── 📁 Auth/                     # Đăng nhập
│   │   │   └── frmLogin.cs              # Form đăng nhập
│   │   │
│   │   ├── 📁 Dashboard/                # Trang chủ theo vai trò
│   │   │   ├── frmAdminDashboard.cs     # Dashboard: Admin / Ban lãnh đạo
│   │   │   ├── frmHRDashboard.cs        # Dashboard: HR Manager / Kế toán
│   │   │   └── frmEmployeeDashboard.cs  # Dashboard: Nhân viên
│   │   │
│   │   ├── 📁 CoreHR/                   # Phân hệ 1: Hồ sơ nhân sự
│   │   │   ├── frmEmployeeList.cs       # Danh sách nhân viên
│   │   │   ├── frmEmployeeDetail.cs     # Thêm / Sửa hồ sơ nhân viên
│   │   │   ├── frmContractList.cs       # Danh sách hợp đồng
│   │   │   ├── frmContractDetail.cs     # Thêm / Sửa hợp đồng
│   │   │   ├── frmDepartmentList.cs     # Quản lý phòng ban
│   │   │   └── frmCareerHistory.cs      # Lịch sử công tác / khen thưởng / kỷ luật
│   │   │
│   │   ├── 📁 TimeAttendance/           # Phân hệ 2: Chấm công & Nghỉ phép
│   │   │   ├── frmAttendanceMonth.cs    # Bảng chấm công tháng
│   │   │   ├── frmAttendanceInput.cs    # Nhập / chỉnh sửa công (HR)
│   │   │   ├── frmLeaveRequest.cs       # Nhân viên gửi đơn xin nghỉ
│   │   │   ├── frmLeaveApproval.cs      # HR / Trưởng phòng duyệt nghỉ
│   │   │   ├── frmLeaveBalance.cs       # Xem quỹ phép còn lại
│   │   │   └── frmBusinessTrip.cs       # Quản lý lệnh công tác
│   │   │
│   │   ├── 📁 Payroll/                  # Phân hệ 3: Tiền lương
│   │   │   ├── frmSalaryConfig.cs       # Cấu hình công thức lương / BH / thuế
│   │   │   ├── frmPayrollRun.cs         # Chạy tính lương tháng
│   │   │   ├── frmPayrollSummary.cs     # Bảng lương tổng hợp
│   │   │   └── frmPayslipView.cs        # Xem phiếu lương (nhân viên)
│   │   │
│   │   └── 📁 Reports/                  # Phân hệ 4: Báo cáo
│   │       ├── frmReportHeadcount.cs    # Báo cáo biến động nhân sự
│   │       ├── frmReportAttendance.cs   # Báo cáo chấm công / nghỉ phép
│   │       ├── frmReportPayroll.cs      # Báo cáo quỹ lương tháng/quý
│   │       └── frmReportContract.cs     # Báo cáo hợp đồng sắp hết hạn
│   │
│   ├── 📁 Utils/                        # Tiện ích dùng chung
│   │   ├── AppSession.cs                # Lưu thông tin đăng nhập hiện tại
│   │   ├── TaxCalculator.cs             # Tính thuế TNCN lũy tiến
│   │   ├── PrintHelper.cs               # In / xuất báo cáo PDF
│   │   └── ValidationHelper.cs          # Kiểm tra dữ liệu đầu vào
│   │
│   ├── 📁 Resources/                    # Tài nguyên nhúng
│   │   ├── 📁 Icons/                    # Icon ứng dụng
│   │   └── 📁 Images/                   # Ảnh logo, avatar mặc định
│   │
│   ├── App.config                       # Connection string SQL Server
│   ├── Program.cs                        # Entry point – Application.Run()
│   └── HRMPayroll.csproj                # File project C#
│
├── 📁 Database/                         # Scripts CSDL SQL Server
│   ├── 01_schema.sql                    # Tạo toàn bộ bảng (ERD → SQL)
│   ├── 02_seed.sql                      # Dữ liệu mẫu (phòng ban, tài khoản, NV)
│   └── 03_stored_procedures.sql         # Stored procedures (tính lương, báo cáo)
│
├── 📁 docs/                             # Tài liệu dự án
│   ├── usecase.html                     # ✅ Đã có – Sơ đồ Use Case
│   ├── ERD.png                          # Entity Relationship Diagram
│   └── system-architecture.md           # Kiến trúc 3 lớp tổng thể
│
├── README.md                            # ✅ Đã có
├── SETUP.md                             # Hướng dẫn cài đặt & chạy app
├── plan.md                              # ✅ Đã có – Kế hoạch 15 ngày
└── color-palette.md                     # ✅ Đã có – Bảng màu UI
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

| Giai đoạn | Ngày | Nội dung |
|-----------|------|----------|
| **Phase 1 – Nền tảng** | Ngày 1–3 | Phân tích, thiết kế CSDL, khởi tạo dự án |
| **Phase 2 – Core HR** | Ngày 4–6 | Quản lý hồ sơ, hợp đồng, tài khoản & phân quyền |
| **Phase 3 – Chấm công & Nghỉ phép** | Ngày 7–9 | Time & Attendance, nghỉ phép, công tác phí |
| **Phase 4 – Tiền lương** | Ngày 10–12 | Cấu hình lương, tính lương tự động, xuất phiếu |
| **Phase 5 – Dashboard & Hoàn thiện** | Ngày 13–15 | Báo cáo, kiểm thử, fix bug, nộp bài |

---

## 📋 Chi tiết từng ngày

### 🔴 Phase 1 – Nền tảng & Phân tích (Ngày 1–3)

#### Ngày 1 – Phân tích & Thiết kế hệ thống
- [ ] Xác định rõ yêu cầu chức năng (Functional Requirements) theo 4 phân hệ
- [ ] Xác định yêu cầu phi chức năng (bảo mật, phân quyền RBAC, hiệu suất)
- [ ] Vẽ sơ đồ Use Case tổng quan toàn hệ thống
- [ ] Phân công nhiệm vụ cụ thể cho từng thành viên
- [x] **Thống nhất tech stack:** C# .NET 6+ · WinForms (Desktop App) · SQL Server LocalDB · Kiến trúc 3 lớp (DAL/BLL/UI)

#### Ngày 2 – Thiết kế CSDL
- [ ] Thiết kế ERD (Entity Relationship Diagram) đầy đủ:
  - Bảng: `employees`, `departments`, `contracts`, `positions`
  - Bảng: `attendance`, `leave_requests`, `leave_balance`, `business_trips`
  - Bảng: `salary_config`, `payroll`, `payslips`
  - Bảng: `users`, `roles`, `permissions`
- [ ] Review ERD – đảm bảo quan hệ và ràng buộc dữ liệu chính xác
- [ ] Viết script SQL tạo CSDL

#### Ngày 3 – Khởi tạo dự án & Setup môi trường
- [ ] Tạo Solution `HRMPayroll.sln` + Project WinForms theo đúng cấu trúc thư mục (Models / DAL / BLL / UI)
- [ ] Cài đặt môi trường: Visual Studio 2022, .NET 6+, SQL Server LocalDB
- [ ] Cấu hình `App.config`: connection string SQL Server LocalDB
- [ ] Implement `DatabaseHelper.cs`: kết nối CSDL, execute query dùng chung
- [ ] Xây dựng `frmLogin.cs` + `AuthService.cs` + `UserDAO.cs`: đăng nhập, xác thực, phân quyền RBAC
- [ ] Implement `AppSession.cs`: lưu thông tin người dùng hiện tại sau đăng nhập
- [ ] Seed dữ liệu mẫu (`02_seed.sql`): phòng ban, chức vụ, 3 tài khoản (admin / hr_manager / nv001)

---

### 🟠 Phase 2 – Quản lý Hồ sơ Nhân sự – Core HR (Ngày 4–6)

#### Ngày 4 – Quản lý thông tin nhân viên
- [ ] CRUD nhân viên: thêm, sửa, xóa, xem danh sách
- [ ] Form thông tin: cá nhân, liên hệ, người phụ thuộc (giảm trừ gia cảnh)
- [ ] Tìm kiếm & lọc nhân viên theo phòng ban, chức vụ, trạng thái
- [ ] Upload ảnh đại diện nhân viên

#### Ngày 5 – Quản lý Hợp đồng lao động
- [ ] CRUD hợp đồng: loại (thử việc / chính thức), ngày bắt đầu, ngày kết thúc
- [ ] Gắn bậc lương, phụ cấp trách nhiệm vào hợp đồng
- [ ] **Cảnh báo tự động:** Thông báo hợp đồng sắp hết hạn (trong vòng 30 ngày)
- [ ] Hiển thị trạng thái hợp đồng (Đang hiệu lực / Hết hạn / Đã chấm dứt)

#### Ngày 6 – Lịch sử công tác & Phân quyền
- [ ] Module quản lý quá trình công tác: thăng chức, điều chuyển phòng ban
- [ ] Ghi nhận khen thưởng / kỷ luật
- [ ] Hoàn thiện RBAC: phân quyền chi tiết từng chức năng theo vai trò
- [ ] Kiểm thử toàn bộ Phase 2, fix bug

---

### 🟡 Phase 3 – Time & Attendance và Nghỉ phép (Ngày 7–9)

#### Ngày 7 – Quản lý Chấm công
- [ ] Giao diện nhập/xem dữ liệu chấm công (Check-in / Check-out)
- [ ] Tự động tổng hợp: số ngày công thực tế, giờ làm thêm (OT), phút đi muộn/về sớm
- [ ] Hiển thị bảng chấm công tháng theo nhân viên
- [ ] Cho phép HR chỉnh sửa / giải trình công

#### Ngày 8 – Quản lý Nghỉ phép
- [ ] Nhân viên gửi yêu cầu nghỉ phép (nghỉ ốm, nghỉ năm, việc riêng)
- [ ] Trưởng phòng/HR xét duyệt yêu cầu (Approve / Reject)
- [ ] Tự động trừ quỹ phép năm khi được duyệt
- [ ] Nhân viên xem quỹ phép còn lại
- [ ] Thông báo kết quả duyệt nghỉ phép

#### Ngày 9 – Công tác phí & Kiểm thử Phase 3
- [ ] Module lệnh điều động công tác: tạo, duyệt, theo dõi
- [ ] Tính toán phụ cấp công tác tự động
- [ ] Kiểm thử toàn bộ Phase 3, fix bug
- [ ] Đảm bảo dữ liệu chấm công/nghỉ phép sẵn sàng kết nối sang Payroll

---

### 🟢 Phase 4 – Quản lý Tiền lương – Payroll (Ngày 10–12)

#### Ngày 10 – Cấu hình công thức lương
- [ ] Giao diện cấu hình tham số lương: lương cơ bản, hệ số lương, phụ cấp
- [ ] Thiết lập tỷ lệ bảo hiểm: BHXH (8%), BHYT (1.5%), BHTN (1%)
- [ ] Cấu hình Thuế TNCN theo bậc lũy tiến (theo quy định pháp luật hiện hành)
- [ ] Kịch bản tính: Lương Gross → các khoản khấu trừ → Lương Net

#### Ngày 11 – Tính lương tự động
- [ ] Engine tính lương: tổng hợp dữ liệu từ chấm công + nghỉ phép
- [ ] Tính lương thực nhận (Net) cho từng nhân viên trong tháng
- [ ] Tính OT (làm thêm giờ), thưởng, phạt
- [ ] Tạo bảng lương tổng hợp (Payroll Summary) theo tháng

#### Ngày 12 – Xuất phiếu lương & Kiểm thử
- [ ] Tạo Payslip (phiếu lương) chi tiết cho từng nhân viên
- [ ] Chức năng xuất phiếu lương ra PDF hoặc xem trực tuyến
- [ ] Nhân viên có thể xem phiếu lương của mình
- [ ] Kiểm thử tính toán lương với nhiều kịch bản (đủ công, thiếu công, nghỉ ốm, OT)
- [ ] Fix bug Phase 4

---

### 🔵 Phase 5 – Dashboard, Kiểm thử & Hoàn thiện (Ngày 13–15)

#### Ngày 13 – Dashboard & Báo cáo
- [ ] Dashboard Admin/HR: biểu đồ biến động nhân sự, tỷ lệ nghỉ việc
- [ ] Biểu đồ tổng quỹ lương theo tháng/quý
- [ ] Báo cáo danh sách nhân viên, hợp đồng sắp hết hạn
- [ ] Báo cáo tổng hợp chấm công, nghỉ phép theo tháng
- [ ] Xuất báo cáo ra Excel/PDF (nếu kịp)

#### Ngày 14 – Kiểm thử tổng thể (Integration Testing)
- [ ] Test end-to-end toàn bộ luồng nghiệp vụ:
  - Thêm nhân viên → ký hợp đồng → chấm công → xin nghỉ → tính lương → xem phiếu lương
- [ ] Kiểm thử phân quyền: đăng nhập bằng 3 tài khoản (Admin / HR Manager / Nhân viên)
- [ ] Kiểm thử tính toán lương: đủ công, thiếu công, OT, nghỉ ốm, cảnh báo hợp đồng hết hạn
- [ ] Kiểm thử exception handling: nhập sai dữ liệu, CSDL mất kết nối
- [ ] Ghi nhận và fix toàn bộ bug còn lại

#### Ngày 15 – Hoàn thiện & Nộp bài
- [ ] Viết hướng dẫn cài đặt và sử dụng (README.md)
- [ ] Dọn dẹp code, xóa console.log, comment rõ ràng
- [ ] Chuẩn bị slide báo cáo / demo (nếu yêu cầu)
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
