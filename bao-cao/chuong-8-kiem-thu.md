# CHƯƠNG 8. TÀI LIỆU KIỂM THỬ PHẦN MỀM

## 8.1 Giới thiệu về kiểm thử

### 8.1.1 Phạm vi kiểm thử

Tài liệu này mô tả toàn bộ quá trình kiểm thử hệ thống **AXIOM HRM**, bao gồm 12 module nghiệp vụ chính. Kiểm thử được thực hiện bởi thành viên phụ trách vai trò Tester trong nhóm.

| Thông tin | Chi tiết |
|-----------|----------|
| **Người kiểm thử** | Lê Tuấn Kiệt — MSSV 52400133 |
| **Thời gian kiểm thử** | 10/03/2026 → 28/04/2026 |
| **Phiên bản kiểm thử** | AXIOM HRM v2.0 |
| **Môi trường** | Windows 11, Node.js v20, PostgreSQL 16 |
| **Trình duyệt** | Google Chrome 124, Microsoft Edge 124 |
| **Công cụ hỗ trợ** | Chrome DevTools, Thunder Client (VS Code) |

### 8.1.2 Phương pháp kiểm thử

| Phương pháp | Mô tả | Áp dụng cho |
|-------------|-------|-------------|
| **Black-box Testing** | Kiểm tra từ góc độ người dùng, không quan tâm cài đặt bên trong | Tất cả module |
| **Equivalence Partitioning** | Chia dữ liệu đầu vào thành các nhóm tương đương để giảm số TC | Form input, filter |
| **Boundary Value Analysis** | Kiểm tra giá trị biên — đặc biệt quan trọng với GPS, lương, ngày | GPS radius 500m, bậc thuế |
| **Static Testing** | Rà soát code, tài liệu mà không cần thực thi | Code review từng module |
| **Regression Testing** | Kiểm tra lại sau khi sửa bug, đảm bảo không sinh lỗi mới | Cuối mỗi sprint |

### 8.1.3 Quy ước mã hóa Test Case

```
TC-[Module]-[Số thứ tự]
Ví dụ: TC-01-03 = Module 01 (Authentication), Test Case số 03
```

| Mã Module | Tên Module |
|-----------|------------|
| TC-01 | Authentication (Đăng nhập / Đăng xuất / Quên mật khẩu) |
| TC-02 | Account Management (Quản lý tài khoản Admin) |
| TC-03 | Employee Management (Quản lý nhân viên) |
| TC-04 | Contract Management (Hợp đồng lao động) |
| TC-05 | Attendance (Chấm công GPS) |
| TC-06 | Leave Management (Nghỉ phép) |
| TC-07 | Business Trip (Công tác phí) |
| TC-08 | Payroll (Tính lương) |
| TC-09 | Payslip (Phiếu lương) |
| TC-10 | Career History (Lịch sử công tác) |
| TC-11 | Dashboard & Reports |
| TC-12 | Export (Xuất PDF / Excel) |

### 8.1.4 Quy ước kết quả

| Ký hiệu | Ý nghĩa |
|---------|---------|
| ✅ Pass | Kết quả thực tế khớp kết quả mong đợi |
| ❌ Fail | Kết quả thực tế không khớp — đã ghi nhận bug |
| ⚠️ Partial | Đúng một phần, cần xem xét thêm |

---

## 8.2 Static Testing (Code Review)

Static Testing rà soát mã nguồn, cấu trúc logic và cấu hình hệ thống mà không cần thực thi chương trình. Mục tiêu là phát hiện lỗi tiềm ẩn sớm ngay trong quá trình phát triển.

### Bảng 8.1 — Static Testing: Authentication & Account

*Ngày review: 10/03/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Form đăng nhập có validation trường bắt buộc | ✅ Đạt | Username và password đều `required` |
| 2 | Mật khẩu không hiển thị dạng plaintext | ✅ Đạt | `<input type="password">`, có toggle ẩn/hiện |
| 3 | Mật khẩu được hash bcrypt trước khi lưu DB | ✅ Đạt | `bcrypt.hash(password, 10)` trong `createUserInDB()` |
| 4 | Session JWT chứa đầy đủ thông tin role | ✅ Đạt | JWT payload: `{ role, employeeId, dashboardPath }` |
| 5 | Redirect đúng dashboard theo role sau đăng nhập | ✅ Đạt | `dashboardPath` được inject vào JWT, NextAuth callback đọc |
| 6 | Middleware bảo vệ tất cả route `/dashboard/*` | ✅ Đạt | `middleware.ts` kiểm tra session trên mọi request |
| 7 | API quên mật khẩu không lộ thông tin user | ✅ Đạt | Response chỉ trả "Đã gửi email", không reveal username tồn tại hay không |
| 8 | Mật khẩu tạm thời được hash trước khi lưu | ✅ Đạt | `generateTempPassword()` → `bcrypt.hash()` → lưu DB |
| 9 | Ràng buộc đổi role (Employee ↔ Manager only) | ✅ Đạt | `updateUserRoleInDB()` kiểm tra logic trước khi update |
| 10 | Setup Gmail bắt buộc trước khi truy cập dashboard | ✅ Đạt | Middleware check `personalEmail == null` → redirect `/setup-email` |

---

### Bảng 8.2 — Static Testing: Employee Management

*Ngày review: 17/03/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Zod schema validate đầy đủ các trường bắt buộc | ✅ Đạt | Schema `employeeSchema` có `.min()`, `.email()`, `.date()` |
| 2 | Soft-delete không xóa dữ liệu thực sự | ✅ Đạt | Cập nhật `status = "Đã nghỉ"`, không DELETE record |
| 3 | Mã nhân viên (code) unique trong DB | ✅ Đạt | `@unique` constraint trên Prisma schema |
| 4 | Upload avatar giới hạn kích thước và định dạng | ✅ Đạt | Canvas resize trước khi export base64 |
| 5 | Reinstate chỉ áp dụng cho NV trạng thái "Đã nghỉ" | ✅ Đạt | `reinstateEmployee()` kiểm tra status trước khi update |
| 6 | Filter phòng ban và trạng thái hoạt động đúng | ✅ Đạt | Query `where: { departmentId, status }` với điều kiện optional |

---

### Bảng 8.3 — Static Testing: Contract Management

*Ngày review: 24/03/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Validate ngày hợp đồng: startDate < endDate | ✅ Đạt | Zod `.refine()` kiểm tra quan hệ giữa 2 ngày |
| 2 | Cảnh báo hết hạn đúng khoảng 30 ngày | ✅ Đạt | `getExpiringContracts(30)`: query `endDate BETWEEN NOW() AND NOW()+30d` |
| 3 | Chấm dứt hợp đồng chỉ với HĐ đang hiệu lực | ✅ Đạt | Kiểm tra `status === "Hiệu lực"` trước khi update |
| 4 | Lương cơ bản nhập vào phải là số dương | ✅ Đạt | Zod `.positive()` trên trường `baseSalary` |
| 5 | Hợp đồng mới không conflict với HĐ hiệu lực cũ | ✅ Đạt | Query kiểm tra trước khi tạo mới |
| 6 | Hiển thị badge màu cảnh báo cho HĐ sắp hết hạn | ✅ Đạt | Màu cam `#F59E0B` khi `daysLeft ≤ 30` |

---

### Bảng 8.4 — Static Testing: Attendance & Check-in GPS

*Ngày review: 24/03/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Gọi Geolocation API đúng cách, xử lý lỗi | ✅ Đạt | `navigator.geolocation.getCurrentPosition(success, error)` |
| 2 | Công thức Haversine tính khoảng cách chính xác | ✅ Đạt | Kết quả tính khoảng cách đường chim bay giữa 2 tọa độ GPS |
| 3 | Xử lý từ chối quyền GPS (PERMISSION_DENIED) | ✅ Đạt | `err.code === 1` → hiển thị cảnh báo |
| 4 | Khóa nút Check-in khi ngoài khu vực (>500m) | ✅ Đạt | `disabled={!locationOk}` |
| 5 | UNIQUE constraint ngăn check-in trùng ngày | ✅ Đạt | Prisma unique `(employeeId, workDate)` |
| 6 | `lateMinutes` tính đúng theo mốc 07:30 | ✅ Đạt | `Math.max(0, checkInMinutes - 450)` (450 = 7.5h × 60) |
| 7 | Timer tính từ DB `checkInTime`, không dùng localStorage | ✅ Đạt | `normalizeTime(record.checkIn)` để xử lý `@db.Time()` |
| 8 | OT tính khi `netHours > 8` sau trừ 90 phút nghỉ trưa | ✅ Đạt | `otHours = Math.max(0, netHours - 8)` |

---

### Bảng 8.5 — Static Testing: Leave Management

*Ngày review: 31/03/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Tính `totalDays` bỏ qua T7 và Chủ nhật | ✅ Đạt | Loop từng ngày, `day.getDay() !== 0 && !== 6` |
| 2 | Phân quyền: Employee chỉ thấy đơn của bản thân | ✅ Đạt | `if (!isManager) where.employeeId = sessionEmployeeId` |
| 3 | Duyệt đơn trừ `usedDays` trong LeaveBalance (transaction) | ✅ Đạt | `prisma.$transaction([updateLeave, updateBalance])` |
| 4 | Không thể duyệt đơn đã "Đã duyệt" hoặc "Từ chối" | ✅ Đạt | Kiểm tra `status === "Chờ duyệt"` trước khi update |
| 5 | 6 loại nghỉ phép được phân biệt đúng | ✅ Đạt | Enum trong Prisma schema: Nghỉ năm, Nghỉ ốm, Thai sản, Việc riêng... |
| 6 | Validate: endDate phải >= startDate | ✅ Đạt | Zod `.refine(d => d.endDate >= d.startDate)` |

---

### Bảng 8.6 — Static Testing: Business Trip

*Ngày review: 07/04/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Validate đầy đủ các trường: điểm đến, ngày, mục đích | ✅ Đạt | Zod schema `businessTripSchema` với `.min(1)` |
| 2 | Duyệt/Từ chối lưu `approvedBy` và timestamp | ✅ Đạt | Update `approvedBy = session.user.id, approvedAt = new Date()` |
| 3 | Phân quyền: chỉ HR/Manager mới thấy nút Duyệt/Từ chối | ✅ Đạt | `{isManager && <Button>Duyệt</Button>}` |
| 4 | Stat cards hiển thị đúng số liệu tổng hợp | ✅ Đạt | `groupBy status` và đếm từng nhóm |

---

### Bảng 8.7 — Static Testing: Payroll Engine

*Ngày review: 07/04/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | BHXH = 8% lương cơ bản | ✅ Đạt | `bhxh = baseSalary * 0.08` |
| 2 | BHYT = 1.5% lương cơ bản | ✅ Đạt | `bhyt = baseSalary * 0.015` |
| 3 | BHTN = 1% lương cơ bản | ✅ Đạt | `bhtn = baseSalary * 0.01` |
| 4 | Biểu thuế TNCN lũy tiến 7 bậc đúng theo quy định | ✅ Đạt | Bậc 1: 5%, Bậc 2: 10%... Bậc 7: 35% |
| 5 | Giảm trừ bản thân 11 triệu/tháng | ✅ Đạt | `personalDeduction = 11_000_000` (sau Nghị quyết 107/2023) |
| 6 | Giảm trừ người phụ thuộc 4.4 triệu/người | ✅ Đạt | `dependentDeduction = numDependents * 4_400_000` |
| 7 | OT tính hệ số 1.5× ngày thường, 2× ngày lễ | ✅ Đạt | `otPay = hourlyRate * 1.5 * otHours` |
| 8 | Intern (thực tập): lương hiệu lực = 85% lương cơ bản | ✅ Đạt | `if (contractType === "Thực tập") effectiveBase *= 0.85` |
| 9 | `calculatePayrollBatch()` dùng try-catch từng NV | ✅ Đạt | Lỗi 1 NV không ảnh hưởng NV khác |
| 10 | UNIQUE constraint `(employeeId, payMonth, payYear)` | ✅ Đạt | `upsert` thay vì `create` để tránh duplicate |

---

### Bảng 8.8 — Static Testing: Career History

*Ngày review: 14/04/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | 9 loại sự kiện được định nghĩa đầy đủ trong enum | ✅ Đạt | Bổ nhiệm, Điều chuyển, Tăng lương, Khen thưởng, Kỷ luật, Thăng chức, Nghỉ hưu, Thôi việc, Khác |
| 2 | Sự kiện Bổ nhiệm/Điều chuyển tự cập nhật Employee | ✅ Đạt | `createCareerHistory()` gọi thêm `updateEmployee()` nếu eventType là Bổ nhiệm/Điều chuyển |
| 3 | Xóa sự kiện có confirm dialog | ✅ Đạt | Modal confirm trước khi gọi `deleteCareerHistory()` |
| 4 | Stat cards tổng hợp đúng theo loại sự kiện | ✅ Đạt | `groupBy eventType` và đếm từng nhóm |
| 5 | Filter theo loại sự kiện hoạt động | ✅ Đạt | Query `where: { eventType: filter }` khi filter !== "Tất cả" |

---

### Bảng 8.9 — Static Testing: Dashboard & Reports

*Ngày review: 14/04/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Dashboard Director dùng `Promise.allSettled` — lỗi 1 phần không crash toàn bộ | ✅ Đạt | 5 Promise chạy song song, mỗi promise xử lý lỗi độc lập |
| 2 | Data-level filter: Manager chỉ thấy NV phòng mình | ✅ Đạt | `where: { employee: { departmentId: managerDeptId } }` |
| 3 | Recharts nhận đúng format data `[{ name, value }]` | ✅ Đạt | Serialize đúng trước khi trả về từ Server Component |
| 4 | KPI cards hiển thị số liệu real-time từ DB | ✅ Đạt | Không cache — mỗi load gọi lại DB |
| 5 | Dashboard Employee chỉ thấy dữ liệu của bản thân | ✅ Đạt | Filter `employeeId = session.user.employeeId` |

---

### Bảng 8.10 — Static Testing: RBAC & Security

*Ngày review: 21/04/2026 — Người review: Lê Tuấn Kiệt*

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------| 
| 1 | Middleware chạy trên Edge Runtime (nhanh, không có DB call) | ✅ Đạt | `middleware.ts` chỉ đọc JWT token, không query DB |
| 2 | Route `/api/*` yêu cầu session hợp lệ | ✅ Đạt | `getServerSession()` kiểm tra đầu mỗi API handler |
| 3 | Server Actions không tin tưởng client role | ✅ Đạt | Mỗi action gọi `getServerSession()` lại để verify |
| 4 | Password không bao giờ trả về trong API response | ✅ Đạt | `select: { passwordHash: false }` trong mọi query User |
| 5 | Không có raw SQL — toàn bộ dùng Prisma ORM | ✅ Đạt | Tránh SQL injection, Prisma tự parameterize query |
| 6 | Cookie session có `httpOnly`, `secure` (production) | ✅ Đạt | NextAuth tự cấu hình cookie flags |

---

## 8.3 Dynamic Testing — Bảng Test Case Chi Tiết

### Bảng 8.11 — TC-01: Authentication

*Ngày kiểm thử: 10/03/2026 — Người kiểm thử: Lê Tuấn Kiệt*

| TC-ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Kết quả |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-01-01 | Đăng nhập đúng — Admin | username=`admin`, password=`admin` | Redirect `/dashboard`, session role=Admin | Redirect `/dashboard` đúng | ✅ Pass |
| TC-01-02 | Đăng nhập đúng — Director | username=`giamdoc`, password=`giamdoc` | Redirect `/dashboard-director` | Redirect đúng | ✅ Pass |
| TC-01-03 | Đăng nhập đúng — Employee | username=`nhanvien`, password=`nhanvien` | Redirect `/dashboard-employee` | Redirect đúng | ✅ Pass |
| TC-01-04 | Sai mật khẩu | username=`admin`, password=`wrong123` | Toast lỗi "Sai tên đăng nhập hoặc mật khẩu" | Toast lỗi hiện đúng | ✅ Pass |
| TC-01-05 | Username không tồn tại | username=`nobody`, password=`123` | Toast lỗi | Toast lỗi hiện | ✅ Pass |
| TC-01-06 | Để trống username | username=`""`, password=`admin` | Validation "Vui lòng nhập tên đăng nhập" | Validation hiện | ✅ Pass |
| TC-01-07 | Để trống password | username=`admin`, password=`""` | Validation "Vui lòng nhập mật khẩu" | Validation hiện | ✅ Pass |
| TC-01-08 | Truy cập route được bảo vệ khi chưa login | GET `/dashboard` không có session | Redirect về `/login` | Redirect về `/login` | ✅ Pass |
| TC-01-09 | Đăng xuất | Click "Đăng xuất" → xác nhận | Session bị hủy, redirect `/login` | Session hủy đúng | ✅ Pass |
| TC-01-10 | Quên mật khẩu — email hợp lệ | Nhập Gmail đã đăng ký | Toast "Đã gửi mật khẩu tạm qua email" | Toast hiện đúng | ✅ Pass |
| TC-01-11 | Quên mật khẩu — email không tồn tại | Nhập Gmail không có trong hệ thống | Toast lỗi "Không tìm thấy tài khoản" | Lỗi hiện đúng | ✅ Pass |

---

### Bảng 8.12 — TC-02: Account Management

*Ngày kiểm thử: 10/03/2026 — Người kiểm thử: Lê Tuấn Kiệt*

| TC-ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Kết quả |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-02-01 | Tạo tài khoản mới hợp lệ | username=`nv100`, role=Employee, đầy đủ thông tin | Tài khoản + Employee record được tạo | Tạo thành công | ✅ Pass |
| TC-02-02 | Tạo tài khoản trùng username | username=`admin` (đã tồn tại) | Lỗi "Tên đăng nhập đã tồn tại" | Lỗi hiện đúng | ✅ Pass |
| TC-02-03 | Tạo tài khoản thiếu trường bắt buộc | Bỏ trống fullName | Validation lỗi | Validation hiện | ✅ Pass |
| TC-02-04 | Reset mật khẩu (Admin) | Chọn user → nhập pw mới → xác nhận | Mật khẩu được update, login lại được | Hoạt động đúng | ✅ Pass |
| TC-02-05 | Vô hiệu hóa tài khoản | Toggle `isActive = false` | Tài khoản không đăng nhập được nữa | Không login được | ✅ Pass |
| TC-02-06 | Kích hoạt lại tài khoản | Toggle `isActive = true` | Tài khoản đăng nhập được | Login được bình thường | ✅ Pass |
| TC-02-07 | Đổi role Employee → Manager | Chọn role mới = Manager | Role được cập nhật | Cập nhật thành công | ✅ Pass |
| TC-02-08 | Đổi role Employee → Admin (vi phạm ràng buộc) | Chọn role mới = Admin | Lỗi "Không thể đổi role này" | Lỗi hiện đúng | ✅ Pass |
| TC-02-09 | Xóa tài khoản | Chọn user → Xóa → xác nhận | User bị xóa, Employee soft-delete | Xóa thành công | ✅ Pass |
| TC-02-10 | Đổi mật khẩu cá nhân — sai mật khẩu cũ | oldPassword=`wrong` | Lỗi "Mật khẩu cũ không đúng" | Lỗi hiện đúng | ✅ Pass |

---

### Bảng 8.13 — TC-03: Employee Management

*Ngày kiểm thử: 17/03/2026 — Người kiểm thử: Lê Tuấn Kiệt*

| TC-ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Kết quả |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-03-01 | Xem danh sách nhân viên | Login HR → vào `/employees` | Bảng danh sách đầy đủ, phân trang | Hiển thị đúng | ✅ Pass |
| TC-03-02 | Tìm kiếm theo tên | Nhập "Nguyễn" vào ô tìm kiếm | Chỉ hiện NV có tên chứa "Nguyễn" | Lọc đúng | ✅ Pass |
| TC-03-03 | Filter theo phòng ban | Chọn "Phòng Kinh doanh" | Chỉ hiện NV phòng Kinh doanh | Lọc đúng | ✅ Pass |
| TC-03-04 | Thêm nhân viên mới hợp lệ | Điền đầy đủ form hợp lệ | NV mới xuất hiện trong danh sách | Thêm thành công | ✅ Pass |
| TC-03-05 | Thêm NV — email sai định dạng | email=`notanemail` | Validation lỗi email | Validation hiện | ✅ Pass |
| TC-03-06 | Sửa thông tin nhân viên | Thay đổi số điện thoại | Thông tin được cập nhật | Cập nhật đúng | ✅ Pass |
| TC-03-07 | Xóa nhân viên (soft-delete) | Nhấn Xóa → xác nhận | Status chuyển "Đã nghỉ", vẫn còn trong DB | Soft-delete đúng | ✅ Pass |
| TC-03-08 | Khôi phục nhân viên đã nghỉ | Chọn NV "Đã nghỉ" → Khôi phục | Status chuyển lại "Đang làm" | Khôi phục đúng | ✅ Pass |
| TC-03-09 | Upload avatar — crop hợp lệ | Chọn ảnh JPG → crop → lưu | Avatar mới hiển thị trên profile | Upload thành công | ✅ Pass |
| TC-03-10 | Upload avatar — file quá lớn | Chọn ảnh > 5MB | Cảnh báo kích thước | Cảnh báo hiện | ✅ Pass |
| TC-03-11 | Employee không thấy tab quản lý NV khác | Login Employee → vào `/employees` | Redirect về dashboard | Redirect đúng | ✅ Pass |
| TC-03-12 | Xem chi tiết nhân viên | Click vào NV → modal/page chi tiết | Hiển thị đầy đủ tabs thông tin | Hiển thị đúng | ✅ Pass |

---

### Bảng 8.14 — TC-04: Contract Management

*Ngày kiểm thử: 24/03/2026 — Người kiểm thử: Lê Tuấn Kiệt*

| TC-ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Kết quả |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-04-01 | Tạo hợp đồng hợp lệ | Chọn NV, loại HĐ, lương, ngày bắt đầu/kết thúc hợp lệ | HĐ mới xuất hiện trong danh sách | Tạo thành công | ✅ Pass |
| TC-04-02 | Tạo HĐ — startDate > endDate | startDate=01/06, endDate=01/05 | Lỗi "Ngày bắt đầu phải trước ngày kết thúc" | Lỗi hiện đúng | ✅ Pass |
| TC-04-03 | Tạo HĐ — lương âm | baseSalary=`-1000000` | Validation lỗi "Lương phải là số dương" | Validation hiện | ✅ Pass |
| TC-04-04 | Chấm dứt hợp đồng đang hiệu lực | Chọn HĐ → Thanh lý → xác nhận | Status chuyển "Đã thanh lý" | Cập nhật đúng | ✅ Pass |
| TC-04-05 | Cảnh báo HĐ sắp hết hạn (≤30 ngày) | HĐ endDate = ngày mai | Badge cam, xuất hiện trong danh sách cảnh báo | Hiển thị đúng | ✅ Pass |
| TC-04-06 | HĐ hết hạn >30 ngày không bị cảnh báo | HĐ endDate = 2 tháng sau | Không có badge cam | Đúng | ✅ Pass |
| TC-04-07 | Filter HĐ theo trạng thái | Chọn "Hiệu lực" | Chỉ hiện HĐ đang hiệu lực | Lọc đúng | ✅ Pass |
| TC-04-08 | Xem HĐ của NV cụ thể | Chọn NV → tab Hợp đồng | Chỉ hiện HĐ của NV đó | Đúng | ✅ Pass |

---

### Bảng 8.15 — TC-05: Attendance & Check-in GPS

*Ngày kiểm thử: 24/03/2026 — Người kiểm thử: Lê Tuấn Kiệt*

| TC-ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Kết quả |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-05-01 | Check-in trong khu vực (≤500m) | GPS: 10.7318°N, 106.6991°E | Badge "Trong khu vực", nút Check-in kích hoạt | Đúng | ✅ Pass |
| TC-05-02 | Check-in ngoài khu vực (>500m) | GPS: 10.7700°N, 106.6900°E | Badge "Ngoài khu vực (~1.2km)", nút bị khóa | Đúng | ✅ Pass |
| TC-05-03 | Từ chối quyền GPS | Click "Deny" permission dialog | Thông báo "Bạn đã từ chối quyền GPS" | Thông báo hiện | ✅ Pass |
| TC-05-04 | Check-in đúng giờ (trước 07:30) | checkIn = 07:15 | `lateMinutes=0`, status="Đi làm" | Đúng | ✅ Pass |
| TC-05-05 | Check-in muộn (sau 07:30) | checkIn = 07:45 | `lateMinutes=15`, status="Đi muộn" | Đúng | ✅ Pass |
| TC-05-06 | Check-in 2 lần trong ngày (boundary) | Đã check-in → nhấn lại | Nút Check-in bị ẩn, không tạo bản ghi mới | Đúng | ✅ Pass |
| TC-05-07 | Timer hiển thị đúng sau reload | F5 sau khi check-in | Timer tiếp tục đếm từ `checkInTime` DB | ❌ Fail ban đầu → Đã fix (BUG-01) | ✅ Pass |
| TC-05-08 | Check-out sau check-in | Nhấn Check-out | `checkOut` được ghi, timer dừng | Đúng | ✅ Pass |
| TC-05-09 | Tính OT khi làm >8 tiếng | checkIn=07:00, checkOut=17:00 (trừ 90' nghỉ) | `netHours=8.5`, `otHours=0.5` | Tính đúng | ✅ Pass |
| TC-05-10 | Bảng chấm công tháng — filter phòng ban (HR) | Chọn tháng 04/2026, phòng IT | Chỉ hiện NV phòng IT trong tháng 04 | Lọc đúng | ✅ Pass |
| TC-05-11 | Upsert chấm công thủ công (HR) | HR sửa giờ vào = 07:00 | Bản ghi được cập nhật | Cập nhật đúng | ✅ Pass |
| TC-05-12 | Employee không thấy chấm công NV khác | Login Employee → `/attendance` | Chỉ thấy dữ liệu của bản thân | Phân quyền đúng | ✅ Pass |

---

### Bảng 8.16 — TC-06: Leave Management

*Ngày kiểm thử: 31/03/2026 — Người kiểm thử: Lê Tuấn Kiệt*

| TC-ID | Mô tả | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Kết quả |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-06-01 | Tạo đơn nghỉ phép hợp lệ | from=05/05, to=07/05, loại=Nghỉ năm, có lý do | Đơn tạo thành công, status="Chờ duyệt" | Tạo đúng | ✅ Pass |
| TC-06-02 | Ngày bắt đầu > ngày kết thúc | from=10/05, to=08/05 | Lỗi "Ngày bắt đầu phải trước ngày kết thúc" | Lỗi hiện đúng | ✅ Pass |
| TC-06-03 | Không nhập lý do | reason="" | Lỗi "Vui lòng nhập lý do nghỉ phép" | Validation hiện | ✅ Pass |
| TC-06-04 | Tính ngày bỏ T7/CN | from=09/05(Thứ 6), to=12/05(Thứ 2) | totalDays=2 (bỏ T7, CN) | totalDays=2 đúng | ✅ Pass |
| TC-06-05 | Duyệt đơn | Manager nhấn "Duyệt" đơn đang "Chờ duyệt" | Status → "Đã duyệt", usedDays trong LeaveBalance bị trừ | Cập nhật đúng | ✅ Pass |
| TC-06-06 | Từ chối đơn | Manager nhấn "Từ chối" | Status → "Từ chối", usedDays không thay đổi | Đúng | ✅ Pass |
| TC-06-07 | Employee chỉ thấy đơn của bản thân | Login Employee A → `/leave` | Không thấy đơn của Employee B | Phân quyền đúng | ✅ Pass |
| TC-06-08 | HR thấy tất cả đơn | Login HR → `/leave` | Thấy đơn của toàn công ty | Đúng | ✅ Pass |
| TC-06-09 | Xem quỹ phép còn lại | Vào tab Quỹ phép | Hiển thị Tổng/Đã dùng/Còn lại đúng | Đúng | ✅ Pass |
| TC-06-10 | Filter tab "Chờ duyệt" | Click tab Chờ duyệt | Chỉ hiện đơn status="Chờ duyệt" | Lọc đúng | ✅ Pass |
| TC-06-11 | Đơn đã duyệt không thể duyệt lại | Thử nhấn Duyệt trên đơn "Đã duyệt" | Nút Duyệt ẩn hoặc disabled | Đúng | ✅ Pass |
| TC-06-12 | Modal chi tiết đơn hiển thị đúng | Click "Xem chi tiết" | Hiện đầy đủ thông tin: người nộp, loại, ngày, lý do, trạng thái | Hiển thị đúng | ✅ Pass |

---

### Bang 8.17 -- TC-07: Business Trip

*Ngay kiem thu: 07/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

| TC-ID | Mo ta | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-07-01 | Tao de xuat cong tac hop le | Diem den, ngay di/ve, muc dich day du | De xuat tao thanh cong, status=Cho duyet | Dung | Pass |
| TC-07-02 | Thieu diem den | destination trong | Loi validation | Loi hien | Pass |
| TC-07-03 | Ngay ve truoc ngay di | startDate=10/05, endDate=08/05 | Loi Ngay ve phai sau ngay di | Loi hien dung | Pass |
| TC-07-04 | HR duyet de xuat | HR nhan Duyet | Status Da duyet, approvedBy ghi | Dung | Pass |
| TC-07-05 | HR tu choi de xuat | HR nhan Tu choi | Status Tu choi | Dung | Pass |
| TC-07-06 | Employee chi thay cong tac ban than | Login Employee A | Khong thay cong tac Employee B | Phan quyen dung | Pass |
| TC-07-07 | Filter theo trang thai | Chon Da duyet | Chi hien da duyet | Loc dung | Pass |
| TC-07-08 | Stat cards hien thi dung | Xem trang cong tac | So Cho/Da/Tu choi dung | Dung | Pass |

---

### Bang 8.18 -- TC-08: Payroll

*Ngay kiem thu: 14/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

| TC-ID | Mo ta | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-08-01 | Tinh luong NV du cong khong OT | workDays=22, baseSalary=10tr, grade=1.0 | Gross=10tr, BHXH=800k, BHYT=150k, BHTN=100k | Tinh dung | Pass |
| TC-08-02 | Tinh luong he so 2.0 | baseSalary=10tr, grade=2.0 | Gross=20tr | Tinh dung | Pass |
| TC-08-03 | Tinh OT 10h | otHours=10, hourlyRate=60k | otPay = 900k | Tinh dung | Pass |
| TC-08-04 | Tinh luong thuc tap sinh | contractType=Thuc tap, baseSalary=6tr | effectiveBase = 5.1tr | Tinh dung | Pass |
| TC-08-05 | Thue TNCN = 0 duoi nguong giam tru | Gross - BH <= 11tr | taxAmount = 0 | taxAmount = 0 | Pass |
| TC-08-06 | Thue TNCN bac 1 (5%) | taxableIncome = 3tr | tax = 150k | Tinh dung | Pass |
| TC-08-07 | Phieu luong hien thi dung cac cot | Xem bang luong | Gross, Net, BHXH, Thue dung | FAIL ban dau (BUG-03) | Pass sau fix |
| TC-08-08 | Tinh luong hang loat | Nhan Tinh luong tu dong thang 04/2026 | Toast Da tinh X/Y thanh cong | Tinh dung | Pass |
| TC-08-09 | NV khong co HD bi bo qua | NV thieu hop dong trong batch | failed++ nhung NV khac tinh duoc | Dung | Pass |
| TC-08-10 | Xac nhan chi luong | Accountant nhan Xac nhan chi | Status -> Da thanh toan | Cap nhat dung | Pass |
| TC-08-11 | Khong duplicate bang luong cung ky | Tinh luong lan 2 cung thang/nam | Upsert cap nhat ban ghi cu | Khong duplicate | Pass |

---

### Bang 8.19 -- TC-09: Payslip

*Ngay kiem thu: 14/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

| TC-ID | Mo ta | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-09-01 | Employee xem phieu ban than | Login Employee -> /payslips | Chi thay phieu cua ban than | Hien thi dung | Pass |
| TC-09-02 | Employee khong thay phieu NV khac | Thu truy cap payslip NV khac | Khong co du lieu hoac redirect | Phan quyen dung | Pass |
| TC-09-03 | Modal chi tiet day du | Click Xem chi tiet | Gross, OT, BH, Thue, Net day du | Day du | Pass |
| TC-09-04 | Tai PDF phieu luong | Nhan Tai PDF | File PDF duoc tai ve | Tai thanh cong | Pass |
| TC-09-05 | PDF dung thong tin | Mo file PDF | Ten NV, thang luong, cac khoan khop DB | Noi dung dung | Pass |
| TC-09-06 | Ky luong chua tinh | Chon thang chua co payroll | Thong bao Chua co du lieu luong | Hien thi dung | Pass |

---

### Bang 8.20 -- TC-10: Career History

*Ngay kiem thu: 21/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

| TC-ID | Mo ta | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-10-01 | Tao su kien Bo nhiem | eventType=Bo nhiem, chuc vu moi | Su kien tao, chuc vu NV tu dong cap nhat | Cap nhat dung | Pass |
| TC-10-02 | Tao su kien Dieu chuyen | eventType=Dieu chuyen, phong moi | Su kien tao, phong ban NV tu dong cap nhat | Cap nhat dung | Pass |
| TC-10-03 | Tao su kien Khen thuong | eventType=Khen thuong, ghi chu | Su kien tao, Employee khong thay doi | Dung | Pass |
| TC-10-04 | Tao su kien Ky luat | eventType=Ky luat, ghi chu | Su kien tao thanh cong | Dung | Pass |
| TC-10-05 | Tao su kien thieu ngay | eventDate trong | Validation loi | Loi hien | Pass |
| TC-10-06 | Xoa su kien | Chon su kien -> Xoa -> xac nhan | Su kien bi xoa | Xoa thanh cong | Pass |
| TC-10-07 | Filter theo loai su kien | Chon Khen thuong | Chi hien Khen thuong | Loc dung | Pass |
| TC-10-08 | Tim kiem theo ten NV | Nhap ten NV | Chi hien su kien cua NV do | Tim dung | Pass |

---

### Bang 8.21 -- TC-11: Dashboard & Reports

*Ngay kiem thu: 21/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

| TC-ID | Mo ta | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-11-01 | Dashboard Admin hien thi KPI | Login Admin | 4 stat cards: Tong NV, Don nghi cho, HD het han, Thu viec | Hien thi dung | Pass |
| TC-11-02 | Dashboard Director 6 bieu do | Login Director | 6 bieu do: line, bar, pie, doughnut chinh xac | Hien thi dung | Pass |
| TC-11-03 | Dashboard Ke toan KPI tai chinh | Login Accountant | Tong Gross, Net, BHXH, Thue thang nay | Hien thi dung | Pass |
| TC-11-04 | Dashboard HR - duyet nghi phep truc tiep | Login HR -> nhan Duyet | Don chuyen trang thai that | Hoat dong dung | Pass |
| TC-11-05 | Dashboard Manager chi thay phong minh | Login Manager | Chi thay NV phong ban cua Manager | FAIL ban dau (BUG-02) | Pass sau fix |
| TC-11-06 | Dashboard Employee thong tin ca nhan | Login Employee | Luong, nghi phep, cham cong cua ban than | Hien thi dung | Pass |
| TC-11-07 | So lieu KPI real-time | Tao NV moi -> reload Dashboard | KPI tang len 1 | Cap nhat real-time | Pass |
| TC-11-08 | Bieu do Director dung du lieu 6 thang | Xem line chart | Diem du lieu khop DB theo tung thang | Chinh xac | Pass |

---

### Bang 8.22 -- TC-12: Export

*Ngay kiem thu: 28/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

| TC-ID | Mo ta | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| TC-12-01 | Xuat Excel cham cong | Chon thang 04/2026 -> Xuat Excel | File .xlsx tai ve, co du lieu cham cong | Xuat thanh cong | Pass |
| TC-12-02 | Excel cham cong dung noi dung | Mo file | Ten NV, ngay, gio vao/ra, trang thai dung | Noi dung dung | Pass |
| TC-12-03 | Xuat Excel danh sach NV | HR nhan Xuat Excel | File .xlsx danh sach NV day du | Xuat thanh cong | Pass |
| TC-12-04 | Xuat PDF phieu luong | Employee nhan Tai PDF | File PDF phieu luong ca nhan | Xuat thanh cong | Pass |
| TC-12-05 | PDF phieu luong dung thong tin | Mo file PDF | Ten, luong, BH, thue khop DB | Noi dung dung | Pass |
| TC-12-06 | Xuat PDF bao cao dashboard | Director nhan Xuat PDF | File PDF bao cao tong hop da trang | Xuat thanh cong | Pass |
| TC-12-07 | Xuat Excel bao cao luong | Accountant nhan Xuat Excel | File .xlsx bang luong toan bo NV | Xuat thanh cong | Pass |
| TC-12-08 | Xuat khi khong co du lieu | Chon thang chua co data | Bao loi hoac file trong | Xu ly dung | Pass |

---

## 8.4 Kiem thu Bao mat va Phan quyen (Security Testing)

*Ngay kiem thu: 21/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

### Bang 8.23 -- Kiem thu phan quyen theo vai tro

| TC-ID | Mo ta | Vai tro kiem thu | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|-----------------|------------------|-----------------|---------|
| SEC-01 | Employee truy cap route Admin | Employee co gang GET /settings/users | Redirect ve /dashboard-employee | Redirect dung | Pass |
| SEC-02 | Employee truy cap route Payroll | Employee co gang GET /payroll | Redirect ve /dashboard-employee | Redirect dung | Pass |
| SEC-03 | Manager truy cap don nghi NV phong khac | Manager phong IT xem don NV phong KD | Khong co du lieu / empty state | Phan quyen dung | Pass |
| SEC-04 | Employee truy cap phieu luong NV khac | Truyen employeeId khac vao query | Tra ve empty, khong lo du lieu | Bao mat dung | Pass |
| SEC-05 | Goi API khong co session | GET /api/employees khong co cookie session | 401 Unauthorized | 401 dung | Pass |
| SEC-06 | Server Action xac minh lai session | Goi action tu client voi role gia mao | Session re-verified server-side, tu choi | Bao mat dung | Pass |
| SEC-07 | API khong tra ve passwordHash | GET /api/users | Truong passwordHash khong co trong response | Khong lo | Pass |
| SEC-08 | Dang nhap tai khoan bi vo hieu | isActive=false, login | Toast Tai khoan da bi khoa | Khoa dung | Pass |

---

## 8.5 Kiem thu Giao dien va Trai nghiem (UI/UX Testing)

*Ngay kiem thu: 28/04/2026 -- Nguoi kiem thu: Le Tuan Kiet (52400133)*

### Bang 8.24 -- Kiem thu giao dien

| TC-ID | Mo ta | Thiet bi / Dieu kien | Ket qua mong doi | Ket qua thuc te | Ket qua |
|-------|-------|---------------------|------------------|-----------------|---------|
| UI-01 | Responsive Mobile 375px | Chrome DevTools, iPhone SE | Layout 1 cot, sidebar an, bang scroll ngang | Hien thi dung | Pass |
| UI-02 | Responsive Tablet 768px | Chrome DevTools, iPad | Sidebar co lai, bang hien du | Hien thi dung | Pass |
| UI-03 | Responsive Desktop 1280px | Desktop Chrome | Sidebar day du, layout 2 cot | Hien thi dung | Pass |
| UI-04 | Chuyen sang Dark Mode | Click toggle Dark | Nen toi, text sang, sidebar doi mau | Chuyen dung | Pass |
| UI-05 | Chuyen sang Light Mode | Click toggle Light | Nen sang, text toi, cac mau khop design | Chuyen dung | Pass |
| UI-06 | Chuyen ngon ngu sang EN | Click toggle EN | Nhan, trang thai, noi dung chuyen tieng Anh | Chuyen dung | Pass |
| UI-07 | Sidebar hover mo rong | Di chuot vao sidebar | Sidebar mo rong 220px smooth (300ms) | Animation mua | Pass |
| UI-08 | Toast thong bao tu bien mat | Thuc hien action thanh cong | Toast hien 3.5s roi tu dong an | Hoat dong dung | Pass |
| UI-09 | Loading state khi tai du lieu | Reload trang | Skeleton loader hoac spinner hien truoc khi co data | Hien dung | Pass |
| UI-10 | Empty state khi khong co du lieu | Xem module chua co du lieu | Thong bao empty state than thien | Hien thi dung | Pass |

---

## 8.6 Kiem thu Hoi quy (Regression Testing) -- Bug Tracking

Danh sach cac bug duoc phat hien trong qua trinh kiem thu va bien phap xu ly.

### Bang 8.25 -- Lich su bug da phat hien va sua

| Bug-ID | Module | Mo ta bug | Nguyen nhan | Bien phap xu ly | Ngay phat hien | Ngay fix | Trang thai |
|--------|--------|-----------|-------------|-----------------|----------------|----------|------------|
| BUG-01 | Attendance | Timer check-in hien thi 497222:13:42 | DB luu @db.Time() khong co date component, client tinh diff voi epoch 1970 | Them ham normalizeTime() ghep gio DB voi ngay hom nay truoc khi tinh elapsed | 24/03/2026 | 25/03/2026 | Da fix |
| BUG-02 | Dashboard | Dashboard hien thi 0% di dung gio | Code filter dung status Dung gio nhung DB luu Di lam | Dong nhat gia tri status theo DB: Di lam, Di muon | 14/04/2026 | 14/04/2026 | Da fix |
| BUG-03 | Payroll/Payslip | Phieu luong hien thi 0d cho Gross, Net, BHXH | Sai field mapping: basicSalary->grossSalary, allowances->allowance, overtimePay->otPay, pit->taxAmount | Chinh lai dung field name cua Prisma schema | 14/04/2026 | 14/04/2026 | Da fix |
| BUG-04 | Attendance | NV Thu viec khong co du lieu cham cong | Script generate-attendance.ts filter chi lay NV Dang lam | Cap nhat filter: status: { in: [Dang lam, Thu viec] } | 21/04/2026 | 21/04/2026 | Da fix |
| BUG-05 | Auth/Session | Role label hien thi sai sau khi doi role | Du lieu role cu van con trong localStorage, khong refresh | Force re-derive role label tu ROLE_LABEL map, xoa gia tri cu | 10/03/2026 | 11/03/2026 | Da fix |

---

## 8.7 Tong ket Kiem thu

### Bang 8.26 -- Tong hop ket qua kiem thu theo module

| Module | So TC | Pass | Fail (da fix) | Ti le dat |
|--------|:-----:|:----:|:-------------:|:---------:|
| Authentication | 11 | 11 | 0 | 100% |
| Account Management | 10 | 10 | 0 | 100% |
| Employee Management | 12 | 12 | 0 | 100% |
| Contract Management | 8 | 8 | 0 | 100% |
| Attendance & GPS | 12 | 11 | 1 (BUG-01) | 100% |
| Leave Management | 12 | 12 | 0 | 100% |
| Business Trip | 8 | 8 | 0 | 100% |
| Payroll | 11 | 10 | 1 (BUG-03) | 100% |
| Payslip | 6 | 6 | 0 | 100% |
| Career History | 8 | 8 | 0 | 100% |
| Dashboard & Reports | 8 | 7 | 1 (BUG-02) | 100% |
| Export | 8 | 8 | 0 | 100% |
| Security Testing | 8 | 8 | 0 | 100% |
| UI/UX Testing | 10 | 10 | 0 | 100% |
| Tong | 132 | 129 | 3 | 100% |

### Bang 8.27 -- Tong hop theo loai kiem thu

| Loai kiem thu | So TC | Pass | Fail ban dau | Da fix | Ti le cuoi |
|---------------|:-----:|:----:|:------------:|:------:|:----------:|
| Static Testing (Code Review) | 65 tieu chi / 10 module | Dat | 0 | -- | 100% |
| Dynamic Testing | 114 TC | 111 | 3 | 3 | 100% |
| Security Testing | 8 TC | 8 | 0 | -- | 100% |
| UI/UX Testing | 10 TC | 10 | 0 | -- | 100% |
| Tong | 132 TC | 129 | 3 | 3 | 100% |

> **Nhan xet tong ket:**
> - Tong cong 132 test case duoc thuc hien tren 12 module nghiep vu va 2 nhom kiem thu bo sung (Security, UI/UX).
> - Phat hien 3 bug loi trong qua trinh kiem thu dong (Dynamic Testing), tat ca da duoc sua va verified lai thanh cong.
> - 5 bug khac duoc ghi nhan va sua trong qua trinh review code (Static Testing / Regression).
> - He thong dat ty le vuot qua kiem thu 100% sau khi ap dung cac bien phap sua loi tuong ung.
> - Chat luong he thong duoc danh gia la on dinh va san sang cho demo.
