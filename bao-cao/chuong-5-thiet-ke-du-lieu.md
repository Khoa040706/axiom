# CHƯƠNG 5. THIẾT KẾ DỮ LIỆU

## 5.1 Mô hình dữ liệu tổng quan (ERD)

*(Xem sơ đồ ERD tại Hình 5.1 — hinh-anh/erd.png)*

Hệ thống Axiom HRM sử dụng cơ sở dữ liệu quan hệ PostgreSQL với 14 bảng chính, được quản lý thông qua Prisma ORM. Các bảng được thiết kế theo nguyên tắc chuẩn hóa 3NF (Third Normal Form) để đảm bảo tính toàn vẹn dữ liệu và tránh trùng lặp.

## 5.2 Mô tả các bảng chính

### Bảng 5.1 — User (Tài khoản hệ thống)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | String | PK, CUID | Khóa chính |
| username | String | UNIQUE, NOT NULL | Tên đăng nhập |
| password | String | NOT NULL | Mật khẩu (bcrypt hash) |
| role | Enum | NOT NULL | Admin / Director / HRManager / Manager / Accountant / Employee |
| employeeId | Int | FK → Employee, UNIQUE, NULL | Liên kết với hồ sơ nhân viên |
| isActive | Boolean | DEFAULT true | Trạng thái kích hoạt |
| createdAt | DateTime | DEFAULT now() | Thời điểm tạo |

### Bảng 5.2 — Employee (Hồ sơ nhân viên)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| code | String | UNIQUE, NOT NULL | Mã nhân viên (NV001...) |
| fullName | String | NOT NULL | Họ và tên |
| gender | String | NULL | Giới tính |
| dateOfBirth | DateTime | NULL | Ngày sinh |
| idNumber | String | NULL | CCCD/CMND |
| phone | String | NULL | Số điện thoại |
| email | String | NULL | Email |
| address | String | NULL | Địa chỉ |
| avatarPath | String | NULL | Đường dẫn ảnh đại diện |
| departmentId | Int | FK → Department, NULL | Phòng ban |
| positionId | Int | FK → Position, NULL | Vị trí |
| hireDate | DateTime | NOT NULL | Ngày vào làm |
| status | String | DEFAULT "Đang làm" | Trạng thái làm việc |
| taxCode | String | NULL | Mã số thuế cá nhân |
| numDependents | Int | DEFAULT 0 | Số người phụ thuộc |

### Bảng 5.3 — Department (Phòng ban)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| name | String | UNIQUE, NOT NULL | Tên phòng ban |
| code | String | UNIQUE, NULL | Mã phòng ban |
| managerId | Int | FK → Employee, NULL | Trưởng phòng |

### Bảng 5.4 — Contract (Hợp đồng lao động)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| employeeId | Int | FK → Employee, NOT NULL | Nhân viên |
| contractType | String | NOT NULL | Loại: Thử việc / Chính thức / Thực tập |
| startDate | DateTime | NOT NULL | Ngày bắt đầu |
| endDate | DateTime | NULL | Ngày kết thúc (null = vô hạn) |
| baseSalary | Decimal | NOT NULL | Lương cơ bản |
| salaryGrade | Decimal | DEFAULT 1.0 | Hệ số lương |
| allowance | Decimal | DEFAULT 0 | Phụ cấp |
| status | String | NOT NULL | Hiệu lực / Hết hạn / Thanh lý |

### Bảng 5.5 — Attendance (Chấm công)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| employeeId | Int | FK → Employee, NOT NULL | Nhân viên |
| workDate | DateTime | NOT NULL | Ngày làm việc |
| checkIn | DateTime | NULL | Thời gian vào |
| checkOut | DateTime | NULL | Thời gian ra |
| status | String | NOT NULL | Đi làm / Đi muộn / Vắng / Nghỉ phép |
| lateMinutes | Int | DEFAULT 0 | Số phút đi muộn |
| otHours | Decimal | DEFAULT 0 | Giờ làm thêm |
| notes | String | NULL | Ghi chú |
| **UNIQUE** | | (employeeId, workDate) | Mỗi nhân viên 1 bản ghi/ngày |

### Bảng 5.6 — LeaveRequest (Đơn nghỉ phép)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| employeeId | Int | FK → Employee, NOT NULL | Nhân viên xin nghỉ |
| leaveType | String | NOT NULL | Nghỉ phép năm / Nghỉ bệnh / Việc riêng / ... |
| startDate | DateTime | NOT NULL | Ngày bắt đầu nghỉ |
| endDate | DateTime | NOT NULL | Ngày kết thúc nghỉ |
| totalDays | Int | NOT NULL | Tổng số ngày nghỉ (trừ cuối tuần) |
| reason | String | NULL | Lý do |
| note | String | NULL | Ghi chú thêm |
| status | String | DEFAULT "Chờ duyệt" | Chờ duyệt / Đã duyệt / Từ chối |
| approverId | Int | FK → Employee, NULL | Người duyệt |

### Bảng 5.7 — Payroll (Bảng lương)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| employeeId | Int | FK → Employee, NOT NULL | Nhân viên |
| payMonth | Int | NOT NULL | Tháng lương |
| payYear | Int | NOT NULL | Năm lương |
| workDays | Int | DEFAULT 0 | Số ngày công thực tế |
| otHours | Decimal | DEFAULT 0 | Tổng giờ OT |
| baseSalary | Decimal | NOT NULL | Lương cơ bản × hệ số |
| allowance | Decimal | DEFAULT 0 | Phụ cấp |
| otPay | Decimal | DEFAULT 0 | Phụ cấp OT |
| grossSalary | Decimal | NOT NULL | Tổng thu nhập Gross |
| bhxh | Decimal | DEFAULT 0 | BHXH người lao động (8%) |
| bhyt | Decimal | DEFAULT 0 | BHYT người lao động (1.5%) |
| bhtn | Decimal | DEFAULT 0 | BHTN người lao động (1%) |
| taxIncome | Decimal | DEFAULT 0 | Thu nhập chịu thuế |
| taxAmount | Decimal | DEFAULT 0 | Thuế TNCN |
| deductions | Decimal | DEFAULT 0 | Tổng khấu trừ |
| netSalary | Decimal | NOT NULL | Lương thực nhận (Net) |
| status | String | DEFAULT "Đã tính" | Trạng thái |
| **UNIQUE** | | (employeeId, payMonth, payYear) | 1 bản ghi/nhân viên/tháng |

### Bảng 5.8 — Payslip (Phiếu lương)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| payrollId | Int | FK → Payroll, UNIQUE | Liên kết bảng lương |
| employeeId | Int | FK → Employee, NOT NULL | Nhân viên |
| issuedDate | DateTime | NOT NULL | Ngày phát hành phiếu |
| issuedBy | String | NULL | Người phát hành |

### Bảng 5.9 — BusinessTrip (Công tác phí)

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | Int | PK, AUTO | Khóa chính |
| employeeId | Int | FK → Employee, NOT NULL | Nhân viên |
| destination | String | NOT NULL | Địa điểm công tác |
| purpose | String | NOT NULL | Mục đích |
| startDate | DateTime | NOT NULL | Ngày bắt đầu |
| endDate | DateTime | NOT NULL | Ngày kết thúc |
| estimatedCost | Decimal | DEFAULT 0 | Chi phí ước tính |
| actualCost | Decimal | NULL | Chi phí thực tế |
| status | String | DEFAULT "Chờ duyệt" | Trạng thái |
| notes | String | NULL | Ghi chú |

## 5.3 Quan hệ giữa các bảng

```
User ──────────────── Employee (1:1, optional)
Employee ──────────── Department (N:1)
Employee ──────────── Position (N:1)
Employee ──────────── Contract (1:N)
Employee ──────────── Attendance (1:N)
Employee ──────────── LeaveRequest (1:N)
Employee ──────────── LeaveBalance (1:1 per year)
Employee ──────────── BusinessTrip (1:N)
Employee ──────────── Payroll (1:N)
Payroll ───────────── Payslip (1:1)
```

## 5.4 Công thức tính lương (Logic nghiệp vụ)

### Bước 1: Tính Gross
```
hourlyRate = (baseSalary × salaryGrade) / 26 / 8
otPay = hourlyRate × 1.5 × otHours
grossSalary = baseSalary × salaryGrade + allowance + otPay
```

### Bước 2: Tính khấu trừ bảo hiểm
```
bhxh = baseSalary × 8%      (người lao động đóng)
bhyt = baseSalary × 1.5%
bhtn = baseSalary × 1%
totalInsurance = bhxh + bhyt + bhtn
```

### Bước 3: Tính thuế TNCN
```
taxableIncome = grossSalary - totalInsurance
              - 11.000.000 (giảm trừ bản thân)
              - numDependents × 4.400.000

Biểu thuế lũy tiến:
  Bậc 1: ≤ 5tr         → 5%
  Bậc 2: 5–10tr        → 10%
  Bậc 3: 10–18tr       → 15%
  Bậc 4: 18–32tr       → 20%
  Bậc 5: 32–52tr       → 25%
  Bậc 6: 52–80tr       → 30%
  Bậc 7: > 80tr        → 35%
```

### Bước 4: Tính Net
```
netSalary = grossSalary - totalInsurance - taxAmount
```

## 5.5 Script khởi tạo dữ liệu

Hệ thống sử dụng Prisma để quản lý schema và migration:

```bash
# Tạo/cập nhật schema
npx prisma migrate dev

# Seed dữ liệu demo
npx tsx prisma/seed.ts

# Tạo dữ liệu chấm công
npx tsx scripts/generate-attendance.ts --month=4 --year=2026

# Tính lại lương
npx tsx scripts/recalc-payroll.ts
```
