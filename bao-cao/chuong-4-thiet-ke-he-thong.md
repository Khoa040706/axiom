# CHƯƠNG 4. THIẾT KẾ HỆ THỐNG

## 4.1 Use Case

### 4.1.1 Xác định tác nhân

Hệ thống AXIOM HRM có **6 tác nhân** (Actor) tương đương với 6 vai trò người dùng. Dưới đây là đặc tả chi tiết từng tác nhân:

---

**Tác nhân 1: Quản trị viên (Admin)**

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên tác nhân** | Quản trị viên (Admin) |
| **Vai trò** | Quản trị hệ thống toàn diện (System Administrator) |
| **Mô tả** | Admin quản trị toàn bộ hệ thống AXIOM HRM. Có quyền tạo/xóa tài khoản, phân quyền vai trò, quản lý nhân viên, hợp đồng, lịch sử công tác và cấu hình tham số lương. |
| **Quyền hạn** | Truy cập toàn bộ các module. Không thể thao tác trên tài khoản Admin khác. Quyền đổi role bị giới hạn theo ràng buộc thăng/hạ chức. |
| **Xác thực** | Đăng nhập bằng username/password. Middleware kiểm tra `session.user.role === "Admin"` trước mọi Server Action quản trị. |

*Bảng 4.1 — Đặc tả tác nhân Admin*

---

**Tác nhân 2: Giám đốc (Director)**

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên tác nhân** | Giám đốc (Director) |
| **Vai trò** | Lãnh đạo cấp cao, theo dõi KPI toàn công ty |
| **Mô tả** | Director xem các chỉ số kinh doanh và nhân sự tổng hợp. Không thực hiện thao tác nghiệp vụ, chỉ xem báo cáo và xuất dữ liệu. |
| **Quyền hạn** | Xem Dashboard Director (6 biểu đồ Recharts), xuất báo cáo PDF/Excel. Không thể sửa dữ liệu, tạo hồ sơ hay duyệt đơn. |
| **Xác thực** | Đăng nhập username/password. Middleware kiểm tra `role === "Director"` để chặn quyền ghi. |

*Bảng 4.2 — Đặc tả tác nhân Director*

---

**Tác nhân 3: Trưởng phòng Nhân sự (HRManager)**

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên tác nhân** | Trưởng phòng Nhân sự (HRManager) |
| **Vai trò** | Quản lý toàn bộ nghị vụ nhân sự |
| **Mô tả** | HRManager quản lý nhân viên, hợp đồng, chấm công, nghỉ phép, công tác và lịch sử công tác. Là đầu mối xử lý các yêu cầu nhân sự trong công ty. |
| **Quyền hạn** | CRUD nhân viên, hợp đồng; duyệt đơn nghỉ phép và công tác; xem/sửa bảng chấm công; xem dữ liệu toàn bộ nhân viên không phân biệt phòng ban. |
| **Xác thực** | Đăng nhập username/password. `role === "HRManager"` kiểm tra ở mọi Server Action liên quan nhân sự. |

*Bảng 4.3 — Đặc tả tác nhân HRManager*

---

**Tác nhân 4: Trưởng phòng bộ phận (Manager)**

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên tác nhân** | Trưởng phòng bộ phận (Manager) |
| **Vai trò** | Quản lý nhân viên trong phòng ban của mình |
| **Mô tả** | Manager có phạm vi quyền hạn giới hạn trong phòng ban mình phụ trách. Chỉ xem được dữ liệu của nhân viên thuộc phòng của mình. |
| **Quyền hạn** | Xem bảng chấm công, duyệt đơn nghỉ phép và công tác của nhân viên trong phòng. Không xâm phạm dữ liệu phòng khác. |
| **Xác thực** | `role === "Manager"`. Mọi query dữ liệu đều được filter thêm `departmentId` của Manager để đảm bảo phân quyền dữ liệu cấp hàng. |

*Bảng 4.4 — Đặc tả tác nhân Manager*

---

**Tác nhân 5: Kế toán (Accountant)**

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên tác nhân** | Kế toán (Accountant) |
| **Vai trò** | Quản lý lương và tài chính nhân sự |
| **Mô tả** | Accountant chịu trách nhiệm tính lương hàng tháng, xác nhận chi lương và quản lý phiếu lương của toàn bộ nhân viên. |
| **Quyền hạn** | Tính lương đơn lẻ và hàng loạt, xác nhận chi lương, xem phiếu lương mọi nhân viên, cấu hình tham số lương (cùng Admin), xuất báo cáo lương Excel. |
| **Xác thực** | `role === "Accountant"`. Payroll Server Actions kiểm tra role trước khi cho phép tính toán hoặc xác nhận. |

*Bảng 4.5 — Đặc tả tác nhân Accountant*

---

**Tác nhân 6: Nhân viên (Employee)**

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên tác nhân** | Nhân viên (Employee) |
| **Vai trò** | Người dùng cuối, sử dụng các chức năng cá nhân |
| **Mô tả** | Employee sử dụng hệ thống cho các tác vụ hàng ngày: check-in/check-out, gửi đơn nghỉ phép, đăng ký công tác, xem phiếu lương. |
| **Quyền hạn** | Chỉ xem và thao tác dữ liệu của bản thân. Không xem dữ liệu của nhân viên khác. Mọi route quản trị đều bị Middleware chặn và redirect về dashboard riêng. |
| **Xác thực** | `role === "Employee"`. API lương và chấm công filter thêm `employeeId` từ session để tránh rò rỉ dữ liệu. |

*Bảng 4.6 — Đặc tả tác nhân Employee*

---

### 4.1.2 Tổng hợp danh sách Use Case

| STT | Mã UC | Tên Use Case | Tác nhân |
|:---:|:-----:|-------------|----------|
| 1 | UC-01 | Xác thực (Đăng nhập / Đăng xuất / Quên mật khẩu) | Tất cả |
| 2 | UC-02 | Quản lý Nhân viên | Admin, HRManager |
| 3 | UC-03 | Quản lý Hợp đồng lao động | Admin, HRManager |
| 4 | UC-04 | Chấm công GPS | Employee, HRManager, Manager |
| 5 | UC-05 | Nghỉ phép | Employee, HRManager, Manager |
| 6 | UC-06 | Tính lương | Accountant, Admin |
| 7 | UC-07 | Phiếu lương | Employee, Accountant |
| 8 | UC-08 | Công tác phí | Employee, HRManager |
| 9 | UC-09 | Quá trình công tác (Career History) | Admin, HRManager |
| 10 | UC-10 | Quản lý Tài khoản & Phân quyền (RBAC) | Admin |
| 11 | UC-11 | Dashboard & Báo cáo | Director, HRManager, Accountant |

*Bảng 4.7 — Tổng hợp danh sách Use Case của hệ thống*

### 4.1.3 Use Case chi tiết theo phân hệ

---

#### UC-01: Phân hệ Xác thực

> **[HÌNH 4.2]** Sơ đồ Use Case UC-01 — Phân hệ Xác thực (Actor: Tất cả người dùng)

#### Bảng 4.1 — Đặc tả luồng Use Case UC-01

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-01.1 | Đăng nhập | Tất cả | Nhập thông tin để truy cập hệ thống. | Chưa có session hợp lệ. | Tạo session JWT, chuyển đến dashboard theo role. | Truy cập `/login` → Nhập username & password → Hệ thống xác thực qua NextAuth.js (bcrypt compare) → Tạo JWT token → Redirect theo `dashboardPath` của role. | Sai thông tin → Cảnh báo "Tên đăng nhập hoặc mật khẩu không đúng". Tài khoản bị vô hiệu → Cảnh báo "Tài khoản đã bị khóa". |
| UC-01.2 | Đăng xuất | Tất cả (đã đăng nhập) | Kết thúc phiên làm việc an toàn. | Đang có session hợp lệ. | Session bị hủy, chuyển về `/login`. | Click avatar → Chọn "Đăng xuất" → Hiện modal xác nhận → Nhấn xác nhận → Xóa session (NextAuth signOut) + xóa localStorage → Redirect `/login`. | Không có. |
| UC-01.3 | Quên mật khẩu | Tất cả | Đặt lại mật khẩu khi quên. | Chưa đăng nhập, có tài khoản trong hệ thống. | Mật khẩu tạm được tạo và gửi qua email. | Truy cập `/forgot-password` → Nhập username → Hệ thống tạo mật khẩu tạm (10 ký tự ngẫu nhiên) → Hash bcrypt → Lưu DB → Gửi email chứa mật khẩu tạm. | Username không tồn tại → Báo lỗi "Không tìm thấy tài khoản". |
| UC-01.4 | Thiết lập Gmail cá nhân | Tất cả (lần đầu đăng nhập) | Bắt buộc nhập Gmail cá nhân khi login lần đầu. | Đăng nhập thành công, chưa có `personalEmail`. | Gmail cá nhân được lưu vào User record. | Hệ thống redirect đến `/setup-email` → Nhập Gmail → Validate định dạng `@gmail.com` → Lưu vào DB → Redirect về dashboard. | Email không phải Gmail → Báo lỗi "Chỉ chấp nhận @gmail.com". |

---

#### UC-02: Phân hệ Quản lý nhân viên

> **[HÌNH 4.3]** Sơ đồ Use Case UC-02 — Phân hệ Quản lý nhân viên (Actor: Admin, HRManager)

#### Bảng 4.2 — Đặc tả luồng Use Case UC-02

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-02.1 | Xem danh sách nhân viên | Admin, HRManager | Xem toàn bộ danh sách nhân viên với bộ lọc. | Đăng nhập với role Admin/HRManager. | Danh sách nhân viên được hiển thị. | Vào `/employees` → Hệ thống gọi `getEmployees()` → Hiển thị bảng (mã, tên, phòng ban, chức vụ, trạng thái) → Có thể lọc theo phòng ban, trạng thái, hoặc tìm kiếm theo tên. | Không có dữ liệu → Hiển thị "Chưa có nhân viên nào". |
| UC-02.2 | Thêm nhân viên mới | Admin, HRManager | Tạo hồ sơ nhân viên mới trong hệ thống. | Đăng nhập với role Admin/HRManager. | Bản ghi Employee mới được lưu vào CSDL. | Nhấn "Thêm nhân viên" → Điền form (họ tên, giới tính, ngày sinh, email, SĐT, phòng ban, chức vụ, ngày vào làm) → Validate bằng Zod schema → Gọi `createEmployee()` → Lưu DB → Thông báo thành công. | Dữ liệu không hợp lệ → Hiển thị lỗi validation từng trường. Mã nhân viên trùng → Báo lỗi. |
| UC-02.3 | Sửa thông tin nhân viên | Admin, HRManager | Cập nhật thông tin hồ sơ nhân viên. | Nhân viên đã tồn tại trong hệ thống. | Thông tin nhân viên được cập nhật trong CSDL. | Chọn nhân viên → Nhấn "Sửa" → Chỉnh sửa form → Validate → Gọi `updateEmployee()` → Lưu DB → Thông báo thành công. | Dữ liệu không hợp lệ → Hiển thị lỗi validation. |
| UC-02.4 | Xóa nhân viên | Admin, HRManager | Xóa mềm (soft delete) hồ sơ nhân viên. | Nhân viên đang ở trạng thái "Đang làm". | Trạng thái nhân viên chuyển sang "Đã nghỉ". | Chọn nhân viên → Nhấn "Xóa" → Xác nhận → Gọi `softDelete()` → Cập nhật `status = "Đã nghỉ"`. | Không có. |
| UC-02.5 | Khôi phục nhân viên | Admin, HRManager | Khôi phục nhân viên đã bị xóa mềm. | Nhân viên đang ở trạng thái "Đã nghỉ". | Trạng thái chuyển về "Đang làm". | Chọn nhân viên đã nghỉ → Nhấn "Khôi phục" → Gọi `reinstateEmployee()` → Cập nhật `status = "Đang làm"`. | Không có. |

---

#### UC-03: Phân hệ Quản lý hợp đồng lao động

> **[HÌNH 4.4]** Sơ đồ Use Case UC-03 — Phân hệ Quản lý hợp đồng (Actor: Admin, HRManager)

#### Bảng 4.3 — Đặc tả luồng Use Case UC-03

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-03.1 | Xem danh sách hợp đồng | Admin, HRManager | Xem toàn bộ hợp đồng lao động. | Đăng nhập với role Admin/HRManager. | Danh sách hợp đồng được hiển thị. | Vào `/contracts` → Gọi `getAllContracts()` → Hiển thị bảng (nhân viên, loại HĐ, lương cơ bản, hệ số, ngày bắt đầu/kết thúc, trạng thái) → Lọc theo trạng thái hoặc tìm kiếm. | Không có dữ liệu → Hiển thị thông báo trống. |
| UC-03.2 | Tạo hợp đồng mới | Admin, HRManager | Tạo hợp đồng lao động cho nhân viên. | Nhân viên đã tồn tại trong hệ thống. | Bản ghi Contract mới được lưu vào CSDL. | Nhấn "Tạo hợp đồng" → Chọn nhân viên → Điền loại HĐ, lương cơ bản, hệ số lương, phụ cấp, ngày bắt đầu/kết thúc → Validate Zod → Gọi `createContract()` → Lưu DB. | Dữ liệu không hợp lệ → Lỗi validation. Nhân viên đã có HĐ hiệu lực → Cảnh báo. |
| UC-03.3 | Thanh lý hợp đồng | Admin, HRManager | Chấm dứt hợp đồng lao động. | Hợp đồng đang ở trạng thái "Hiệu lực". | Trạng thái hợp đồng chuyển sang "Đã thanh lý". | Chọn hợp đồng → Nhấn "Thanh lý" → Xác nhận → Gọi `terminateContract()` → Cập nhật status. | Không có. |
| UC-03.4 | Xem hợp đồng sắp hết hạn | Admin, HRManager | Xem danh sách hợp đồng sắp hết hạn trong 30 ngày. | Đăng nhập với role phù hợp. | Danh sách cảnh báo được hiển thị. | Gọi `getExpiringContracts(30)` → Hiển thị danh sách HĐ có `endDate` trong vòng 30 ngày tới. | Không có HĐ sắp hết hạn → Thông báo "Không có cảnh báo". |

---

#### UC-04: Phân hệ Chấm công

> **[HÌNH 4.5]** Sơ đồ Use Case UC-04 — Phân hệ Chấm công GPS (Actor: Employee, HRManager, Manager)

#### Bảng 4.4 — Đặc tả luồng Use Case UC-04

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-04.1 | Check-in GPS | Employee | Ghi nhận giờ vào làm tại vị trí văn phòng. | Đã đăng nhập; chưa check-in trong ngày; thiết bị hỗ trợ GPS. | Bản ghi Attendance được tạo với `checkIn` timestamp. | Vào `/attendance/check-in` → Browser xin quyền Geolocation → Lấy tọa độ GPS → Tính khoảng cách đến văn phòng (Haversine formula) → Nếu ≤ 500m: hiện nút Check-in → Nhấn Check-in → Gọi `checkIn()` → Ghi `checkIn` timestamp, tính `lateMinutes` (so với 07:30) → Timer bắt đầu đếm. | Khoảng cách > 500m → Khóa nút, hiển thị "Ngoài khu vực (~Xm)". Từ chối GPS → Báo lỗi "Bạn đã từ chối quyền GPS". |
| UC-04.2 | Check-out | Employee | Ghi nhận giờ ra về. | Đã check-in trong ngày, chưa check-out. | `checkOut` timestamp được cập nhật; `otHours` được tính. | Nhấn "Check-out" → Gọi `checkOut()` → Ghi `checkOut` timestamp → Tính `netHours = (checkOut - checkIn) - 90 phút nghỉ trưa` → Nếu > 8h: tính `otHours`. | Không có. |
| UC-04.3 | Xem bảng chấm công tháng | HRManager, Manager | Xem bảng chấm công toàn bộ nhân viên theo tháng. | Đăng nhập với role HR/Manager. | Bảng chấm công được hiển thị. | Vào `/attendance` → Chọn tháng/năm → Gọi `getAttendanceByMonth()` → Hiển thị bảng (nhân viên, ngày, giờ vào/ra, trạng thái, phút muộn, OT). | Không có dữ liệu → Hiển thị thông báo trống. |
| UC-04.4 | Xuất Excel chấm công | HRManager | Xuất báo cáo chấm công ra file Excel. | Có dữ liệu chấm công tháng đó. | File Excel được tải về thiết bị. | Nhấn "Xuất Excel" → Gọi `/api/export/excel` → Hệ thống tạo file .xlsx (ExcelJS) → Browser tải về. | Không có dữ liệu → Báo lỗi. |

---

#### UC-05: Phân hệ Nghỉ phép

> **[HÌNH 4.6]** Sơ đồ Use Case UC-05 — Phân hệ Nghỉ phép (Actor: Employee, HRManager, Manager)

#### Bảng 4.5 — Đặc tả luồng Use Case UC-05

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-05.1 | Đăng ký nghỉ phép | Employee | Gửi đơn xin nghỉ phép. | Đã đăng nhập; còn quỹ phép hoặc loại phép không giới hạn. | Đơn nghỉ phép "Chờ duyệt" được lưu vào CSDL. | Vào `/leave` → Nhấn "Tạo đơn" → Chọn loại (Nghỉ năm/Nghỉ ốm/Việc riêng/Không lương) → Chọn ngày bắt đầu/kết thúc → Nhập lý do → Hệ thống tính `totalDays` (trừ T7, CN) → Gọi `createLeaveRequest()` → Lưu DB với `status = "Chờ duyệt"`. | Ngày kết thúc < ngày bắt đầu → Lỗi. Quỹ phép không đủ → Cảnh báo. |
| UC-05.2 | Duyệt đơn nghỉ phép | HRManager, Manager | Phê duyệt đơn nghỉ phép. | Có đơn ở trạng thái "Chờ duyệt". | Đơn chuyển "Đã duyệt"; quỹ phép (LeaveBalance) bị trừ. | Vào `/leave` → Xem danh sách chờ → Nhấn "Duyệt" → Gọi `approveLeave(id, approverId, true)` → Hệ thống cập nhật `status = "Đã duyệt"` + trừ `usedDays` trong LeaveBalance (transaction). | Quỹ phép không đủ → Lỗi, không cập nhật. |
| UC-05.3 | Từ chối đơn nghỉ phép | HRManager, Manager | Từ chối đơn nghỉ phép. | Có đơn ở trạng thái "Chờ duyệt". | Đơn chuyển "Từ chối"; quỹ phép không bị trừ. | Nhấn "Từ chối" → Gọi `approveLeave(id, approverId, false)` → Cập nhật `status = "Từ chối"`. | Không có. |
| UC-05.4 | Xem quỹ phép | Employee, HRManager | Xem số ngày phép còn lại theo loại. | Đã đăng nhập. | Thông tin quỹ phép được hiển thị. | Gọi `getLeaveBalance(employeeId, year)` → Hiển thị bảng (loại phép, tổng ngày, đã dùng, còn lại) với thanh progress bar. | Chưa có quỹ phép → "Chưa có dữ liệu quỹ phép". |

---

#### UC-06: Phân hệ Tính lương

> **[HÌNH 4.7]** Sơ đồ Use Case UC-06 — Phân hệ Tính lương (Actor: Accountant)

#### Bảng 4.6 — Đặc tả luồng Use Case UC-06

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-06.1 | Tính lương đơn lẻ | Accountant | Tính lương cho 1 nhân viên theo kỳ. | Nhân viên có hợp đồng hiệu lực và dữ liệu chấm công. | Bản ghi Payroll + Payslip được tạo/cập nhật. | Vào `/payroll` → Chọn tháng/năm → Chọn nhân viên → Nhấn "Tính lương" → Gọi `calculatePayroll()` → Lấy hợp đồng hiệu lực → Tổng hợp ngày công + OT → Tính Gross → Tính BH (10.5%) → Tính thuế TNCN lũy tiến → Net = Gross − BH − Thuế → Lưu Payroll → Tạo Payslip. | Không có hợp đồng hiệu lực → Báo lỗi. |
| UC-06.2 | Tính lương hàng loạt | Accountant | Tính lương toàn bộ nhân viên đang làm/thử việc. | Có nhân viên với trạng thái "Đang làm" hoặc "Thử việc". | Bảng lương toàn bộ nhân viên được tạo. | Nhấn "Tính lương tự động" → Gọi `calculatePayrollBatch()` → Lấy danh sách NV active → Loop: tính lương từng người → Tạo Payslip → Thông báo "Đã tính X/Y nhân viên". | NV không có HĐ → Bỏ qua, đếm vào `failed`. |
| UC-06.3 | Xác nhận chi lương | Accountant | Xác nhận đã thanh toán lương cho nhân viên. | Bản ghi Payroll đã tồn tại. | Status chuyển sang "Đã thanh toán". | Chọn bản ghi → Nhấn "Xác nhận chi lương" → Gọi `confirmPayment()` → Cập nhật `status = "Đã thanh toán"`. | Không có. |
| UC-06.4 | Cấu hình tham số lương | Accountant, Admin | Thiết lập các tham số BHXH, thuế TNCN. | Đăng nhập với role phù hợp. | Tham số lương được cập nhật trong bảng SalaryConfig. | Vào `/payroll/config` → Xem/sửa các tham số (tỷ lệ BHXH, BHYT, BHTN, giảm trừ bản thân, giảm trừ người phụ thuộc) → Lưu. | Không có. |

---

#### UC-07: Phân hệ Phiếu lương

> **[HÌNH 4.8]** Sơ đồ Use Case UC-07 — Phân hệ Phiếu lương (Actor: Employee, Accountant)

#### Bảng 4.7 — Đặc tả luồng Use Case UC-07

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-07.1 | Xem phiếu lương | Employee, Accountant | Xem chi tiết phiếu lương theo kỳ. | Kế toán đã tính lương kỳ đó. | Phiếu lương được đánh dấu `isViewed = true`. | Vào `/payslips` → Chọn kỳ lương → Gọi `getPayslipsByEmployee()` → Hiển thị chi tiết (Gross, phụ cấp, OT, BHXH, BHYT, BHTN, thuế TNCN, Net) → Gọi `markViewed()`. | Kỳ lương chưa tính → "Chưa có dữ liệu lương kỳ này". |
| UC-07.2 | Tải PDF phiếu lương | Employee, Accountant | Tải phiếu lương dạng PDF. | Phiếu lương đã tồn tại. | File PDF được tải về thiết bị. | Nhấn "Tải PDF" → Gọi `/api/export/payslip-pdf` → Hệ thống tạo PDF (jsPDF) → Browser tải về. | Không có dữ liệu → Báo lỗi. |

---

#### UC-08: Phân hệ Công tác phí

> **[HÌNH 4.9]** Sơ đồ Use Case UC-08 — Phân hệ Công tác phí (Actor: Employee, HRManager)

#### Bảng 4.8 — Đặc tả luồng Use Case UC-08

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-08.1 | Đăng ký công tác | Employee | Tạo đề xuất công tác mới. | Đã đăng nhập với role Employee. | Đề xuất công tác "Chờ duyệt" được lưu. | Vào `/business-trips` → Nhấn "Tạo đề xuất" → Điền (điểm đến, ngày đi/về, mục đích, phụ cấp) → Gọi `createBusinessTrip()` → Lưu DB với `status = "Chờ duyệt"`. | Dữ liệu không hợp lệ → Lỗi validation. |
| UC-08.2 | Duyệt / Từ chối công tác | HRManager | Phê duyệt hoặc từ chối đề xuất công tác. | Có đề xuất ở trạng thái "Chờ duyệt". | Đề xuất chuyển "Đã duyệt" hoặc "Từ chối". | Xem danh sách chờ → Nhấn Duyệt/Từ chối → Gọi `approveBusinessTrip()` → Cập nhật status + ghi `approvedBy`. | Không có. |

---

#### UC-09: Phân hệ Quá trình công tác

> **[HÌNH 4.10]** Sơ đồ Use Case UC-09 — Phân hệ Quá trình công tác (Actor: Admin, HRManager)

#### Bảng 4.9 — Đặc tả luồng Use Case UC-09

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-09.1 | Tạo sự kiện công tác | Admin, HRManager | Ghi nhận sự kiện nhân sự (bổ nhiệm, điều chuyển, khen thưởng, kỷ luật, tăng lương). | Nhân viên đã tồn tại. | Bản ghi CareerHistory được tạo; nếu là Bổ nhiệm/Điều chuyển thì Employee.positionId/departmentId tự động cập nhật. | Vào `/career-history` → Nhấn "Tạo sự kiện" → Chọn nhân viên → Chọn loại sự kiện → Điền chi tiết (phòng ban cũ/mới, chức vụ cũ/mới, lương cũ/mới) → Gọi `createCareerHistory()` → Hệ thống tự động cập nhật Employee nếu là sự kiện Bổ nhiệm/Điều chuyển. | Không có. |
| UC-09.2 | Xem lịch sử công tác | Admin, HRManager | Xem toàn bộ lịch sử sự kiện nhân sự. | Đăng nhập với role phù hợp. | Danh sách sự kiện được hiển thị. | Vào `/career-history` → Gọi `getCareerHistories()` → Hiển thị bảng (nhân viên, loại sự kiện, ngày, chi tiết) → Lọc theo loại sự kiện hoặc tìm kiếm. | Không có dữ liệu → Thông báo trống. |
| UC-09.3 | Xóa sự kiện công tác | Admin, HRManager | Xóa bản ghi sự kiện nhân sự. | Bản ghi sự kiện đã tồn tại. | Bản ghi CareerHistory bị xóa. | Chọn sự kiện → Nhấn "Xóa" → Xác nhận → Gọi `deleteCareerHistory()`. | Không có. |

---

#### UC-10: Phân hệ Quản lý tài khoản & Phân quyền (RBAC)

> **[HÌNH 4.11]** Sơ đồ Use Case UC-10 — Phân hệ Quản lý tài khoản (Actor: Admin)

#### Bảng 4.10 — Đặc tả luồng Use Case UC-10

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-10.1 | Tạo tài khoản | Admin | Tạo tài khoản người dùng + Employee liên kết. | Đăng nhập với role Admin. | Bản ghi User + Employee mới được tạo (transaction). | Vào `/settings/users` → Nhấn "Tạo tài khoản" → Điền (username, password, họ tên, email, SĐT, role, phòng ban, chức vụ) → Gọi `createUserInDB()` → Hash password (bcrypt 10 rounds) → Tạo User + Employee trong transaction → Thông báo thành công. | Username đã tồn tại → Báo lỗi. |
| UC-10.2 | Đổi role | Admin | Thay đổi quyền truy cập của tài khoản. | Tài khoản đã tồn tại. | Role được cập nhật. | Chọn user → Chọn role mới → Gọi `updateUserRoleInDB()` → Kiểm tra ràng buộc (Employee chỉ thăng lên Manager; Manager chỉ hạ về Employee) → Cập nhật DB. | Vi phạm ràng buộc thăng/hạ chức → Báo lỗi ràng buộc. |
| UC-10.3 | Kích hoạt / Vô hiệu hóa | Admin | Bật/tắt trạng thái hoạt động tài khoản. | Tài khoản đã tồn tại. | `isActive` được đảo trạng thái. | Chọn user → Nhấn toggle active → Gọi `toggleUserActiveInDB()` → Cập nhật `isActive`. | Không có. |
| UC-10.4 | Reset mật khẩu | Admin | Đặt lại mật khẩu cho tài khoản (không cần MK cũ). | Tài khoản đã tồn tại. | Mật khẩu mới được hash và lưu. | Chọn user → Nhấn "Reset mật khẩu" → Nhập mật khẩu mới → Gọi `adminResetPasswordInDB()` → Hash bcrypt → Cập nhật DB. | Không có. |
| UC-10.5 | Xóa tài khoản | Admin | Xóa tài khoản và soft-delete Employee liên kết. | Tài khoản đã tồn tại. | User bị xóa; Employee chuyển sang "Đã nghỉ". | Chọn user → Nhấn "Xóa" → Xác nhận → Gọi `deleteUserFromDB()` → Xóa User + soft-delete Employee. | Không có. |

---

#### UC-11: Phân hệ Dashboard & Báo cáo

> **[HÌNH 4.12]** Sơ đồ Use Case UC-11 — Phân hệ Dashboard (Actor: Director, HRManager, Accountant)

#### Bảng 4.11 — Đặc tả luồng Use Case UC-11

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-11.1 | Dashboard Director | Director | Xem KPI tổng hợp toàn công ty. | Đăng nhập với role Director. | Dashboard KPI được hiển thị. | Vào `/dashboard-director` → Gọi `getDashboardStats()` + `getDashboardExtended()` → Hiển thị biểu đồ (Headcount, Payroll trend, Gross/Net, Attendance, Leave, New Hires). | Không có dữ liệu → Biểu đồ trống. |
| UC-11.2 | Xuất báo cáo PDF | Director | Xuất toàn bộ dashboard thành PDF. | Dashboard đã có dữ liệu. | File PDF được tải về. | Nhấn "Xuất PDF" → Gọi `/api/export/dashboard-pdf` → Tạo PDF (jsPDF + autoTable) → Tải về. | Không có. |
| UC-11.3 | Dashboard HR | HRManager | Xem tổng quan nhân sự. | Đăng nhập với role HRManager. | Dashboard HR được hiển thị. | Vào `/dashboard-hr` → Hiển thị (tổng nhân viên, hợp đồng sắp hết hạn, đơn nghỉ phép chờ duyệt, hoạt động gần đây). | Không có. |
| UC-11.4 | Dashboard Accountant | Accountant | Xem tổng quan tài chính/lương. | Đăng nhập với role Accountant. | Dashboard kế toán được hiển thị. | Vào `/dashboard-accountant` → Gọi `getAccountantDashboardStats()` → Hiển thị (tổng quỹ lương, số NV đã tính lương, chờ thanh toán). | Không có. |

---

## 4.2 Class Diagram

Sơ đồ lớp thể hiện cấu trúc các đối tượng trong hệ thống Axiom HRM, bao gồm các thuộc tính, phương thức và mối quan hệ giữa các lớp.

> **[HÌNH 4.13]** Sơ đồ Class Diagram tổng quát — Thể hiện các lớp chính và các quan hệ Association, Composition, Dependency giữa chúng.

### Mô tả các lớp chính

| Lớp | Thuộc tính chính | Phương thức chính |
|-----|----------------|------------------|
| **User** | id, username, passwordHash, role, isActive, personalEmail | login(), logout(), changePassword(), resetPassword() |
| **Employee** | id, code, fullName, gender, dateOfBirth, email, phone, departmentId, positionId, hireDate, status, taxCode, numDependents | getFullProfile(), updateInfo(), softDelete(), reinstate() |
| **Department** | id, name, description, isActive | findAll(), findById(), create(), update(), delete() |
| **Position** | id, name, isActive | findAll(), findById() |
| **Contract** | id, employeeId, contractType, baseSalary, salaryGrade, allowance, startDate, endDate, status | create(), terminate(), findExpiringSoon() |
| **CareerHistory** | id, employeeId, eventType, eventDate, oldDept, newDept, oldPos, newPos, oldSalary, newSalary | create(), findByEmployee(), autoUpdateEmployee() |
| **Attendance** | id, employeeId, workDate, checkIn, checkOut, status, lateMinutes, earlyMinutes, otHours | checkIn(), checkOut(), calculateLateMinutes(), calculateNetHours() |
| **LeaveRequest** | id, employeeId, leaveType, startDate, endDate, totalDays, status, approvedBy, reason | create(), approve(), reject(), countWeekdays() |
| **LeaveBalance** | id, employeeId, year, leaveType, totalDays, usedDays | getRemaining(), deduct() |
| **BusinessTrip** | id, employeeId, destination, startDate, endDate, purpose, allowance, status, approvedBy | create(), approve(), reject() |
| **Payroll** | id, employeeId, payMonth, payYear, workDays, otHours, baseSalary, allowance, otPay, grossSalary, bhxh, bhyt, bhtn, pit, netSalary, status | calculate(), confirmPayment() |
| **Payslip** | id, payrollId, employeeId, issuedDate, pdfPath, isViewed | create(), markViewed(), exportPDF() |




