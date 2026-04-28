# CHƯƠNG 8. TÀI LIỆU KIỂM THỬ PHẦN MỀM

## 8.1 Static Testing

Static Testing là phương pháp kiểm thử không cần thực thi chương trình, tập trung vào việc rà soát mã nguồn, cấu trúc và tài liệu thiết kế để phát hiện lỗi sớm trong quá trình phát triển.

### 8.1.1 Code Review

Nhóm thực hiện code review theo checklist sau:

#### Bảng 8.1 — Static Testing: Đăng nhập

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------|
| 1 | Form có validation trường bắt buộc | ✅ Đạt | Username và password đều required |
| 2 | Mật khẩu không hiển thị dạng plaintext | ✅ Đạt | Input type="password" |
| 3 | Xử lý lỗi đăng nhập sai | ✅ Đạt | Toast thông báo "Sai tên đăng nhập hoặc mật khẩu" |
| 4 | Session được tạo đúng role | ✅ Đạt | NextAuth session chứa role từ DB |
| 5 | Redirect đúng dashboard theo role | ✅ Đạt | Admin→/dashboard, Director→/dashboard-director... |
| 6 | Middleware bảo vệ route | ✅ Đạt | middleware.ts kiểm tra session trên mọi route |

#### Bảng 8.2 — Static Testing: Chấm công GPS

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------|
| 1 | Gọi Geolocation API đúng cách | ✅ Đạt | navigator.geolocation.getCurrentPosition() |
| 2 | Haversine formula đúng | ✅ Đạt | Kết quả tính khoảng cách đường thẳng |
| 3 | Xử lý từ chối quyền GPS | ✅ Đạt | err.PERMISSION_DENIED → hiển thị lỗi |
| 4 | Khóa nút check-in khi ngoài khu vực | ✅ Đạt | locationOk === false → return sớm |
| 5 | Timer persist sau reload | ✅ Đạt | Tính từ checkInTime trong DB, không dùng localStorage |
| 6 | Bản ghi duy nhất mỗi nhân viên mỗi ngày | ✅ Đạt | UNIQUE constraint (employeeId, workDate) |

#### Bảng 8.3 — Static Testing: Tính lương

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------|
| 1 | Công thức BHXH/BHYT/BHTN đúng | ✅ Đạt | 8% / 1.5% / 1% trên lương cơ bản |
| 2 | Biểu thuế TNCN lũy tiến 7 bậc | ✅ Đạt | calculateSalary() theo đúng biểu thuế |
| 3 | Đếm ngày công gồm cả "Đi muộn" | ✅ Đạt | status: { in: ["Đi làm", "Đi muộn"] } |
| 4 | Thực tập sinh: 85% lương cơ bản | ✅ Đạt | isIntern check trong payroll.service.ts |
| 5 | OT tính với hệ số 1.5× | ✅ Đạt | otPay = hourlyRate × 1.5 × otHours |
| 6 | UNIQUE constraint bảng lương | ✅ Đạt | (employeeId, payMonth, payYear) |

#### Bảng 8.4 — Static Testing: Phân quyền

| # | Tiêu chí kiểm tra | Kết quả | Ghi chú |
|---|------------------|---------|---------|
| 1 | Employee không truy cập route Admin | ✅ Đạt | middleware.ts redirect về dashboard |
| 2 | Đơn nghỉ phép: chỉ thấy của bản thân | ✅ Đạt | Filter theo sessionEmployeeId |
| 3 | Nút Duyệt/Từ chối: chỉ Manager/HR | ✅ Đạt | isManager check trước khi render |
| 4 | Phiếu lương: chỉ thấy của bản thân | ✅ Đạt | getPayslipsByEmployee(employeeId) |

---

## 8.2 Dynamic Testing — Unit Testing

Dynamic Testing thực thi chương trình và kiểm tra hành vi thực tế so với kết quả mong đợi.

### 8.2.1 Phương pháp

- **Black-box testing:** Kiểm tra từ góc độ người dùng, không quan tâm cài đặt bên trong.
- **Equivalence Partitioning:** Phân chia dữ liệu đầu vào thành các nhóm tương đương để giảm số lượng test case.
- **Boundary Value Analysis:** Kiểm tra các giá trị biên (đặc biệt quan trọng với GPS radius, thời gian, tiền lương).

---

## 8.3 Bảng Test Case

### Bảng 8.5 — Test Case: Đăng nhập

| TC-ID | Mô tả | Input | Expected | Actual | Kết quả |
|-------|-------|-------|----------|--------|---------|
| TC-01-01 | Đăng nhập đúng tài khoản Admin | username=admin, password=admin | Chuyển đến /dashboard | Chuyển đến /dashboard | ✅ Pass |
| TC-01-02 | Đăng nhập đúng tài khoản Employee | username=nv001, password=123456 | Chuyển đến /dashboard-employee | Chuyển đến /dashboard-employee | ✅ Pass |
| TC-01-03 | Sai mật khẩu | username=admin, password=wrong | Toast lỗi "Sai thông tin đăng nhập" | Toast lỗi hiện | ✅ Pass |
| TC-01-04 | Để trống username | username=, password=123456 | Thông báo "Vui lòng nhập tên đăng nhập" | Validation hiện | ✅ Pass |
| TC-01-05 | Để trống password | username=admin, password= | Thông báo "Vui lòng nhập mật khẩu" | Validation hiện | ✅ Pass |
| TC-01-06 | Đăng nhập tài khoản bị vô hiệu hóa | username=disabled_user | Toast lỗi | Toast lỗi hiện | ✅ Pass |

### Bảng 8.6 — Test Case: Check-in GPS

| TC-ID | Mô tả | Input | Expected | Actual | Kết quả |
|-------|-------|-------|----------|--------|---------|
| TC-04-01 | Check-in trong khu vực (≤500m) | GPS: 10.7318, 106.6991 | Badge "Trong khu vực", check-in thành công | ✅ Đúng | ✅ Pass |
| TC-04-02 | Check-in ngoài khu vực (>500m) | GPS: 10.7700, 106.6900 | Badge "Ngoài khu vực (~Xm)", nút bị khóa | ✅ Đúng | ✅ Pass |
| TC-04-03 | Từ chối quyền GPS | Deny permission | Hiển thị "Bạn đã từ chối quyền GPS" | ✅ Đúng | ✅ Pass |
| TC-04-04 | Check-in đúng giờ (trước 07:30) | checkIn = 07:28 | lateMinutes=0, status="Đi làm" | ✅ Đúng | ✅ Pass |
| TC-04-05 | Check-in muộn (sau 07:30) | checkIn = 07:45 | lateMinutes=15, status="Đi muộn" | ✅ Đúng | ✅ Pass |
| TC-04-06 | Check-in 2 lần trong ngày | Đã check-in → nhấn lại | Nút disabled, không tạo bản ghi mới | ✅ Đúng | ✅ Pass |
| TC-04-07 | Reload sau check-in | F5 sau khi check-in | Timer tiếp tục từ checkInTime DB | ✅ Đúng | ✅ Pass |

### Bảng 8.7 — Test Case: Tính lương

| TC-ID | Mô tả | Input | Expected | Actual | Kết quả |
|-------|-------|-------|----------|--------|---------|
| TC-07-01 | Tính lương nhân viên đúng giờ đầy đủ | workDays=22, baseSalary=10tr, grade=2.0 | Gross=20tr, BHXH=1.6tr | Gross=20tr | ✅ Pass |
| TC-07-02 | Tính lương nhân viên có OT 10h | otHours=10, hourlyRate=... | otPay = hourlyRate × 1.5 × 10 | ✅ Đúng | ✅ Pass |
| TC-07-03 | Tính lương thực tập sinh | contractType=Thực tập, baseSalary=6tr | effectiveBase = 6tr × 85% = 5.1tr | ✅ Đúng | ✅ Pass |
| TC-07-04 | Thuế TNCN = 0 khi thu nhập dưới giảm trừ | taxableIncome ≤ 0 | taxAmount = 0 | taxAmount = 0 | ✅ Pass |
| TC-07-05 | Nhân viên 0 ngày công | workDays=0 | Vẫn có lương cơ bản (lương theo tháng) | ✅ Đúng | ✅ Pass |
| TC-07-06 | Tính lại lương sau khi cập nhật chấm công | seed lại → recalc | workDays cập nhật đúng | ✅ Đúng | ✅ Pass |

### Bảng 8.8 — Test Case: Đơn nghỉ phép

| TC-ID | Mô tả | Input | Expected | Actual | Kết quả |
|-------|-------|-------|----------|--------|---------|
| TC-05-01 | Tạo đơn nghỉ phép hợp lệ | from=01/05, to=03/05, reason=... | Đơn tạo thành công, status="Chờ duyệt" | ✅ Đúng | ✅ Pass |
| TC-05-02 | Ngày bắt đầu > ngày kết thúc | from=05/05, to=03/05 | Lỗi "Ngày bắt đầu phải trước ngày kết thúc" | ✅ Đúng | ✅ Pass |
| TC-05-03 | Không nhập lý do | reason="" | Lỗi "Nhập lý do nghỉ phép" | ✅ Đúng | ✅ Pass |
| TC-05-04 | Duyệt đơn | Manager nhấn Duyệt | Status → "Đã duyệt" | ✅ Đúng | ✅ Pass |
| TC-05-05 | Từ chối đơn | Manager nhấn Từ chối | Status → "Từ chối" | ✅ Đúng | ✅ Pass |
| TC-05-06 | Employee thấy đơn của người khác | login Employee A | Không thấy đơn của Employee B | ✅ Đúng | ✅ Pass |

### Bảng 8.9 — Test Case: Phiếu lương

| TC-ID | Mô tả | Input | Expected | Actual | Kết quả |
|-------|-------|-------|----------|--------|---------|
| TC-08-01 | Xem danh sách phiếu lương | login Employee | Chỉ thấy phiếu của bản thân | ✅ Đúng | ✅ Pass |
| TC-08-02 | Tải PDF phiếu lương | Nhấn nút tải | File PDF được tải về | ✅ Đúng | ✅ Pass |
| TC-08-03 | PDF đúng thông tin | Mở file PDF | Tên, số tiền, tháng đúng | ✅ Đúng | ✅ Pass |

## 8.4 Tổng kết kiểm thử

| Loại | Tổng TC | Pass | Fail | Tỷ lệ |
|------|---------|------|------|-------|
| Static Testing | 20 | 20 | 0 | 100% |
| Dynamic Testing | 28 | 28 | 0 | 100% |
| **Tổng** | **48** | **48** | **0** | **100%** |

> Toàn bộ 48 test case đều đạt kết quả Pass. Hệ thống hoạt động đúng theo yêu cầu đặc tả.
