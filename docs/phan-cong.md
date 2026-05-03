# BẢNG PHÂN CÔNG CÔNG VIỆC — NHÓM

> Môn học: Lập Trình Web & Ứng Dụng  
> **Nhóm:** 52400017 – 52400133 – 52400004

| Thành viên | MSSV | Vai trò |
|------------|------|---------|
| **TV1** | 52400017 | Trưởng nhóm — Backend core, Auth, Payroll, Dashboard, RBAC |
| **TV2** | 52400133 | Frontend UI, Employee, Contract, Attendance |
| **TV3** | 52400004 | Leave, Business Trip, Career History, Export, Docs |

---

## ACCOUNT MANAGEMENT — 1.75 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 1 | Tạo tài khoản cho nhân viên | `createUserInDB()`: tạo User + Employee record, hash bcrypt, validate username trùng | — | — |
| 2 | Gửi email tự động khi quên mật khẩu | Tích hợp Nodemailer + Gmail SMTP; sinh mật khẩu tạm, build HTML email template chuyên nghiệp | — | — |
| 3 | Mật khẩu tạm thời có hiệu lực 24 giờ | Logic sinh `generateTempPassword()`, hash + lưu DB, cảnh báo hết hạn trong email | — | — |
| 4 | Nhân viên mới phải thiết lập Gmail cá nhân | Middleware kiểm tra `personalEmail == null` → redirect về `/setup-email`; chặn truy cập dashboard | — | — |
| 5 | Đăng nhập bằng mã nhân viên + mật khẩu | NextAuth v5 Credentials provider; `authorize()` → `bcrypt.compare()` → tạo JWT session với role + dashboardPath | — | — |
| 6 | Quên mật khẩu — gửi mật khẩu tạm qua Gmail | API route `POST /api/forgot-password`: tìm user theo `personalEmail`, generate temp pw, gửi email, cập nhật DB | — | — |
| 7 | Bắt buộc thiết lập Gmail trước khi truy cập | — | — | Trang `/setup-email`: form nhập Gmail, validate `@gmail.com`, `savePersonalEmailInDB()`, update JWT session |

---

## USER MANAGEMENT — 1.75 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 8 | Admin: Xem danh sách tài khoản | `getAllUsersFromDB()`: query tất cả users kèm employee info, serialize | — | — |
| 9 | Admin: Xem chi tiết nhân viên | — | Modal chi tiết: hiển thị đầy đủ thông tin, trạng thái, avatar, phòng ban | — |
| 10 | Admin: Reset mật khẩu | `adminResetPasswordInDB()`: hash password mới, cập nhật DB không cần mật khẩu cũ | — | — |
| 11 | Admin: Kích hoạt / Vô hiệu hóa tài khoản | `toggleUserActiveInDB()`: toggle `isActive`, session check server-side | — | — |
| 12 | Admin: Đổi vai trò (có ràng buộc) | `updateUserRoleInDB()`: kiểm tra Employee chỉ lên Manager, Manager chỉ xuống Employee | — | — |
| 13 | Admin: Xóa tài khoản | `deleteUserFromDB()`: soft-delete employee liên kết + xóa user record | — | — |
| 14 | Nhân viên: Xem/cập nhật hồ sơ | — | Trang `/profile`: GET hiển thị thông tin cá nhân; POST cập nhật fullName, email, phone | — |

---

## EMPLOYEE MANAGEMENT — 2.0 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 15 | Xem danh sách nhân viên | — | Trang `/employees`: bảng phân trang, filter phòng ban/trạng thái, search realtime | — |
| 16 | Thêm nhân viên mới | `createEmployee()`: Zod schema validation, parse date, gọi `employeeService.create()` | Form modal tạo nhân viên: input fields, dropdown phòng ban/chức vụ, date picker | — |
| 17 | Sửa thông tin nhân viên | `updateEmployee()`: Zod partial validation, merge data, gọi `employeeService.update()` | Form modal sửa: pre-fill dữ liệu cũ, validation UI | — |
| 18 | Xóa nhân viên | `deleteEmployee()` soft-delete + `hardDeleteEmployee()` xóa vĩnh viễn | — | — |
| 19 | Khôi phục nhân viên đã nghỉ | `reinstateEmployee()`: cập nhật status → "Đang làm" | — | — |
| 20 | Tìm nhân viên theo mã | `getEmployeeByCode()`: query theo code unique | — | — |
| 21 | Upload & crop avatar | — | Trang `/profile` tab avatar: Canvas crop modal, drag-to-pan, zoom in/out, export base64 → `updateProfileInDB()` | — |
| 22 | Đổi mật khẩu cá nhân | `changePasswordInDB()`: verify mật khẩu cũ với `bcrypt.compare()`, hash mới, lưu DB | — | — |

---

## DEPARTMENT & POSITION — 1.0 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 23 | Xem danh sách phòng ban | `getDepartments()`: API trả về departments kèm headcount | — | — |
| 24 | Xem danh sách chức vụ | — | Trang `/positions`: bảng chức vụ, search, hiển thị cấp bậc (C-Level/Manager/Staff), khung lương | — |
| 25 | Phân bổ nhân viên theo phòng ban | — | Hiển thị headcount per department, badge phòng ban cho mỗi nhân viên | — |
| 26 | Khung lương theo chức vụ | — | Hiển thị salary range (VND/EN) theo từng chức vụ trong bảng | — |

---

## CONTRACT MANAGEMENT — 1.25 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 27 | Xem danh sách hợp đồng | — | Trang `/contracts`: bảng hợp đồng, filter trạng thái, search nhân viên | — |
| 28 | Tạo hợp đồng mới | `createContract()`: Zod validation, parse dates, gọi `contractService.create()` | Form modal tạo hợp đồng | — |
| 29 | Chấm dứt hợp đồng | `terminateContract()`: cập nhật trạng thái hợp đồng | — | — |
| 30 | Cảnh báo hợp đồng sắp hết hạn | `getExpiringContracts(30)`: query hợp đồng endDate trong 30 ngày tới | — | — |
| 31 | Xem hợp đồng theo nhân viên | `getContractsByEmployee()`: query theo employeeId | — | — |

---

## ATTENDANCE MANAGEMENT — 1.25 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 32 | Check-in / Check-out realtime | `checkIn()` + `checkOut()`: ghi nhận thời gian, validation trùng ngày | Giao diện nút Check-in/out, hiển thị thời gian realtime | — |
| 33 | Xem bảng chấm công theo tháng | `getAttendanceByMonth()`: query theo month/year, filter departmentId | Bảng chấm công tháng, dropdown phòng ban, tháng/năm | — |
| 34 | Xem chấm công hôm nay | `getTodayAttendance()`: query ngày hiện tại | — | — |
| 35 | Chỉnh sửa / bổ sung chấm công | `upsertAttendance()`: Zod validation, upsert record | — | — |
| 36 | Xuất báo cáo chấm công Excel | — | — | API `/api/export/excel`: generate Excel file từ attendance data, download |

---

## LEAVE MANAGEMENT — 1.5 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 37 | Tạo đơn nghỉ phép | — | — | `createLeaveRequest()`: Zod validation, tính ngày làm việc (bỏ T7/CN), gọi `leaveService.create()` + Form modal 6 loại nghỉ phép |
| 38 | Duyệt / Từ chối đơn | — | — | `approveLeave()`: cập nhật status + approvedBy, UI nút Duyệt/Từ chối cho Manager+ |
| 39 | Xem danh sách đơn nghỉ phép | — | — | Trang `/leave`: bảng đơn, tabs filter (Tất cả/Chờ duyệt/Đã duyệt/Từ chối), stat cards |
| 40 | Xem chi tiết đơn | — | — | Modal chi tiết: header gradient, thông tin người nộp, lý do, ghi chú, trạng thái |
| 41 | Quản lý quỹ phép | — | — | `getAllLeaveBalances()`: tổng/đã dùng/còn lại, thanh progress, phân trang 6/page |
| 42 | Phân quyền dữ liệu nghỉ phép | Middleware filter: nhân viên chỉ thấy đơn bản thân, manager thấy tất cả | — | — |

---

## PAYROLL MANAGEMENT — 2.0 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 43 | Tính lương tự động (1 NV) | `payrollService.calculate()`: lương cơ bản + phụ cấp + OT − BHXH − BHYT − BHTN − thuế TNCN lũy tiến. Logic phức tạp nhất hệ thống | — | — |
| 44 | Tính lương hàng loạt | `calculatePayrollBatch()`: loop tất cả NV active, try-catch từng người, trả về success/failed count | — | — |
| 45 | Xem bảng lương theo kỳ | `getPayrollByPeriod()`: query theo month/year | Trang `/payroll`: bảng lương, dropdown kỳ, hiển thị gross/net/deductions | — |
| 46 | Xác nhận chi lương | `confirmPayment()`: update status → "Đã thanh toán" | — | — |
| 47 | Cấu hình lương | — | Trang `/payroll/config`: form cấu hình tỷ lệ bảo hiểm, thuế, phụ cấp | — |
| 48 | Tổng quỹ lương | `getPayrollSummary()`: tổng gross, net, deductions theo kỳ | — | — |
| 49 | Xuất phiếu lương PDF | — | — | API `/api/export/payslip-pdf`: generate PDF phiếu lương chi tiết, layout chuyên nghiệp |

---

## PAYSLIP — 0.5 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 50 | Xem phiếu lương theo NV | — | Trang `/payslips`: modal chi tiết phiếu lương, breakdown từng khoản | — |
| 51 | Tự động tạo phiếu lương | `payslipService.createOrUpdate()`: tạo/cập nhật payslip sau khi tính lương xong (chống duplicate) | — | — |

---

## BUSINESS TRIP — 0.75 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 52 | Tạo đề xuất công tác | — | — | `createBusinessTrip()`: destination, dates, purpose, allowance + Form modal tạo |
| 53 | Duyệt / Từ chối công tác | — | — | `approveBusinessTrip()`: update status + approvedBy |
| 54 | Xem danh sách công tác | — | — | Trang `/business-trips`: bảng, filter trạng thái/nhân viên, stat cards |

---

## CAREER HISTORY — 1.25 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 55 | Xem lịch sử công tác | — | — | Trang `/career-history`: bảng timeline, filter loại sự kiện, search |
| 56 | Tạo sự kiện công tác | — | — | `createCareerHistory()`: thăng chức, chuyển phòng, khen thưởng, kỷ luật, tăng lương + Form modal |
| 57 | Xóa sự kiện | — | — | `deleteCareerHistory()` + confirm dialog |
| 58 | Thống kê overview | — | — | `getCareerOverviewStats()`: stat cards tổng hợp |
| 59 | Xem lịch sử theo NV | — | — | `getCareerHistoryByEmployee()`: filter theo employeeId |

---

## DASHBOARD & REPORTS — 2.5 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 60 | Dashboard Admin | `getDashboardStats()`: tổng hợp empStats + pendingLeave + expiringContracts | Giao diện stat cards, biểu đồ tròn/cột | — |
| 61 | Dashboard Giám đốc (khó nhất) | `getDashboardExtended()`: 5 Promise.allSettled — grossNet, empStatus, contractTypes, leaveTypes, newHires. Xử lý từng phần lỗi độc lập | Giao diện 6 biểu đồ: line, bar, pie, doughnut, area chart | — |
| 62 | Dashboard Kế toán | `getAccountantDashboardStats()`: KPI tài chính, quỹ lương, chi phí | Giao diện KPI cards, trend charts | — |
| 63 | Dashboard Nhân sự | — | Trang `/dashboard-hr`: tổng hợp nhân sự, headcount, turnover | — |
| 64 | Dashboard Trưởng phòng | — | Trang `/dashboard-manager`: team overview, attendance summary | — |
| 65 | Dashboard Nhân viên | — | Trang `/dashboard-employee`: thông tin cá nhân, lương, nghỉ phép | — |
| 66 | Xuất báo cáo PDF | — | — | API `/api/export/dashboard-pdf`: generate PDF báo cáo tổng hợp, layout đa trang |
| 67 | Xuất báo cáo Excel | — | — | API `/api/export/report-excel`: generate Excel báo cáo multi-sheet |
| 68 | Xuất danh sách NV Excel | — | — | API `/api/export/excel`: generate Excel danh sách nhân viên |

---

## RBAC & SECURITY — 1.5 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 69 | Hệ thống 6 vai trò | Cấu hình NextAuth callbacks: jwt + session → inject role, dashboardPath, employeeId | — | — |
| 70 | Sidebar động theo vai trò | — | `layout.tsx` (53KB): sidebar config per role, active state detection, responsive collapse | — |
| 71 | Redirect tự động theo vai trò | NextAuth `signIn` callback → trả `dashboardPath` dựa trên role | — | — |
| 72 | Phân quyền dữ liệu | Server actions filter: `if (!isManager) filter by sessionEmployeeId` — áp dụng toàn bộ modules | — | — |
| 73 | Ràng buộc thăng/giáng chức | `updateUserRoleInDB()`: logic Employee↔Manager only, block các transition khác | — | — |
| 74 | Mã hóa + JWT session | bcrypt hash (salt=10) + NextAuth v5 JWT strategy + session serialization | — | — |

---

## UI/UX & BỔ SUNG — 1.0 điểm

| STT | Chức năng | TV1 — 52400017 | TV2 — 52400133 | TV3 — 52400004 |
|-----|-----------|----------------|----------------|----------------|
| 75 | Song ngữ VI/EN | i18n maps: `tLeaveType()`, `tDept()`, `tLeaveReason()` — toàn hệ thống | — | — |
| 76 | Dark/Light mode | — | `dashboard-context.tsx`: global theme toggle, CSS variables, realtime switch | — |
| 77 | Responsive layout | — | Media queries, `useBreakpoint()` hook, mobile sidebar, table scroll | — |
| 78 | Trang đăng nhập premium | Canvas star particles, 4 floating cards animation, gradient sweep button, bilingual | — | — |

---

## TỔNG KẾT PHÂN CÔNG

| Thành viên | Số task | Điểm phụ trách | Tỷ lệ | Vai trò chính |
|------------|:---:|:---:|:---:|---------------|
| **TV1 — 52400017** | **38** | **~10.0** | **~50%** | Backend core, Auth, Payroll, RBAC, Dashboard logic, Security, i18n |
| **TV2 — 52400133** | **20** | **~5.0** | **~25%** | Frontend UI, Employee pages, Contract, Attendance, Positions, Profile, Layout |
| **TV3 — 52400004** | **20** | **~5.0** | **~25%** | Leave, Business Trip, Career History, Export (PDF/Excel), Setup Email, Docs |
| **Tổng** | **78** | **20.0** | **100%** | |

> **Ghi chú:** TV1 phụ trách toàn bộ backend core (services, actions, Prisma schema, NextAuth, payroll engine) và các chức năng phức tạp nhất. TV2 và TV3 chia đều phần frontend UI và các module nghiệp vụ còn lại.
