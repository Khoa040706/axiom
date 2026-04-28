# CHƯƠNG 6. THIẾT KẾ XỬ LÝ

## 6.1 Các loại sơ đồ

Chương này trình bày thiết kế xử lý của hệ thống Axiom HRM thông qua 3 loại sơ đồ:
- **Activity Diagram:** Mô tả luồng hoạt động nghiệp vụ
- **Sequence Diagram:** Mô tả luồng tương tác giữa các thành phần
- **State Diagram:** Mô tả các trạng thái và chuyển trạng thái của đối tượng

---

## 6.1 Activity Diagram

### 6.1.1 Activity Diagram — Đăng nhập

> **[HÌNH 6.1]** Activity Diagram — Đăng nhập
> 
> Luồng: Người dùng nhập thông tin → Hệ thống xác thực → [Đúng] Tạo session, chuyển dashboard theo role / [Sai] Hiển thị lỗi, yêu cầu nhập lại

```
[Start]
   ↓
[Người dùng nhập username + password]
   ↓
[Hệ thống kiểm tra thông tin]
   ↓
 ┌─ Đúng ──────────────────────────────┐
 │  [Tạo session với role tương ứng]    │
 │  [Chuyển đến Dashboard theo role]    │
 │  [End]                               │
 └──────────────────────────────────────┘
 ┌─ Sai ────────────────────────────────┐
 │  [Hiển thị thông báo lỗi]            │
 │  [Quay lại form đăng nhập]           │
 └──────────────────────────────────────┘
```

### 6.1.2 Activity Diagram — Đăng xuất

> **[HÌNH 6.2]** Activity Diagram — Đăng xuất
>
> Luồng: Người dùng chọn Đăng xuất → Xác nhận → Hủy session → Chuyển về trang Login

### 6.1.3 Activity Diagram — Chấm công Check-in GPS

> **[HÌNH 6.3]** Activity Diagram — Check-in GPS (Quan trọng)
>
> Luồng: Nhân viên mở trang → Browser xin quyền GPS → [Từ chối] Hiển thị lỗi / [Chấp nhận] Tính khoảng cách Haversine → [>500m] Khóa nút / [≤500m] Mở nút Check-in → Nhân viên nhấn Check-in → Lưu timestamp, tính lateMinutes → Timer bắt đầu

```
[Start]
   ↓
[Nhân viên mở trang /attendance/check-in]
   ↓
[Browser.geolocation.getCurrentPosition()]
   ↓
 ┌─ Từ chối GPS ─────────────────────────┐
 │  [Hiển thị lỗi "Đã từ chối quyền GPS"] │
 │  [Khóa nút Check-in]                   │
 └────────────────────────────────────────┘
 ┌─ Chấp nhận GPS ───────────────────────┐
 │  [Tính dist = haversineM(lat, lng,     │
 │     OFFICE_LAT, OFFICE_LNG)]           │
 │  ↓                                     │
 │  ┌─ dist > 500m ─────────────────┐     │
 │  │  Badge: "Ngoài khu vực (~Xm)" │     │
 │  │  Nút Check-in bị khóa        │     │
 │  └───────────────────────────────┘     │
 │  ┌─ dist ≤ 500m ─────────────────┐     │
 │  │  Badge: "Trong khu vực (~Xm)" │     │
 │  │  [Nhân viên nhấn Check-in]    │     │
 │  │  [Ghi checkIn = NOW()]        │     │
 │  │  [lateMinutes = max(0, NOW - 07:30)] │
 │  │  [status = "Đi muộn" nếu muộn]│     │
 │  │  [Timer bắt đầu chạy]         │     │
 │  └───────────────────────────────┘     │
 └────────────────────────────────────────┘
   ↓
[End]
```

### 6.1.4 Activity Diagram — Check-out

> **[HÌNH 6.4]** Activity Diagram — Check-out
>
> Luồng: Nhân viên đã check-in → Nhấn Check-out → Ghi checkOut timestamp → Tính tổng giờ làm (trừ nghỉ trưa 90 phút) → Timer dừng

### 6.1.5 Activity Diagram — Đăng ký nghỉ phép

> **[HÌNH 6.5]** Activity Diagram — Đăng ký nghỉ phép
>
> Luồng: Nhân viên chọn loại nghỉ, ngày và lý do → Hệ thống tính số ngày (trừ cuối tuần) → Validation → [Hợp lệ] Tạo đơn status="Chờ duyệt" / [Không hợp lệ] Hiển thị lỗi

### 6.1.6 Activity Diagram — Duyệt nghỉ phép

> **[HÌNH 6.6]** Activity Diagram — Duyệt nghỉ phép
>
> Luồng: Manager/HR xem danh sách đơn chờ → Xem chi tiết → [Duyệt] Status→"Đã duyệt" / [Từ chối] Status→"Từ chối"

### 6.1.7 Activity Diagram — Tính lương

> **[HÌNH 6.7]** Activity Diagram — Tính lương tự động
>
> Luồng: Accountant chọn tháng/năm → Hệ thống lấy danh sách nhân viên có HĐ hiệu lực → Với mỗi nhân viên: lấy chấm công, tính ngày công, OT → Tính Gross → Tính BHXH/thuế → Tính Net → Upsert Payroll → Tạo Payslip

---

## 6.2 Sequence Diagram

### 6.2.1 Sequence Diagram — Đăng nhập

> **[HÌNH 6.8]** Sequence Diagram — Đăng nhập
>
> Các thành phần: Browser ↔ LoginPage ↔ NextAuth ↔ Prisma ↔ PostgreSQL

```
Browser → LoginPage: POST credentials
LoginPage → NextAuth: signIn(username, password)
NextAuth → Prisma: user.findUnique({ username })
Prisma → PostgreSQL: SELECT * FROM User WHERE username=?
PostgreSQL → Prisma: User record
Prisma → NextAuth: User { id, role, employeeId }
NextAuth → NextAuth: bcrypt.compare(password, hash)
  [Đúng] NextAuth → Browser: Set session cookie
         Browser → Dashboard: Redirect theo role
  [Sai]  NextAuth → Browser: Error "Sai thông tin đăng nhập"
```

### 6.2.2 Sequence Diagram — Check-in GPS

> **[HÌNH 6.9]** Sequence Diagram — Check-in GPS
>
> Các thành phần: Employee ↔ Browser ↔ GeolocationAPI ↔ CheckInPage ↔ Server Action ↔ Prisma ↔ Database

```
Employee → Browser: Mở /attendance/check-in
Browser → GeolocationAPI: getCurrentPosition()
GeolocationAPI → Browser: { lat, lng }
Browser → CheckInPage: Tính haversineM(lat, lng, OFFICE_LAT, OFFICE_LNG)
  [dist > 500m] CheckInPage → Employee: Badge "Ngoài khu vực"
  [dist ≤ 500m] CheckInPage → Employee: Badge "Trong khu vực"
Employee → CheckInPage: Click "Check-in"
CheckInPage → ServerAction: doCheckIn(employeeId)
ServerAction → Prisma: attendance.upsert({ checkIn: NOW() })
Prisma → Database: INSERT/UPDATE attendance
Database → Prisma: Updated record
Prisma → ServerAction: { id, checkIn, lateMinutes }
ServerAction → CheckInPage: { success, data }
CheckInPage → Employee: Toast "Check-in thành công lúc HH:MM"
CheckInPage → Employee: Timer bắt đầu đếm
```

### 6.2.3 Sequence Diagram — Tính lương

> **[HÌNH 6.10]** Sequence Diagram — Tính lương tự động
>
> Các thành phần: Accountant ↔ PayrollPage ↔ ServerAction ↔ PayrollService ↔ Prisma ↔ Database

```
Accountant → PayrollPage: Chọn tháng/năm, nhấn "Tính lương"
PayrollPage → ServerAction: calculatePayrollBatch(month, year)
ServerAction → Prisma: employee.findMany({ status: "Đang làm" })
Prisma → Database: SELECT employees
  loop for each employee:
    ServerAction → PayrollService: calculate(empId, month, year)
    PayrollService → Prisma: contract.findFirst({ status: "Hiệu lực" })
    PayrollService → Prisma: attendance.findMany({ status: in [Đi làm, Đi muộn] })
    PayrollService → PayrollService: calculateSalary(gross, bhxh, tax)
    PayrollService → Prisma: payroll.upsert(result)
    PayrollService → Prisma: payslip.upsert(payrollId)
ServerAction → PayrollPage: { success, count }
PayrollPage → Accountant: Toast "Đã tính lương cho X nhân viên"
```

### 6.2.4 Sequence Diagram — Duyệt đơn nghỉ phép

> **[HÌNH 6.11]** Sequence Diagram — Duyệt nghỉ phép
>
> Các thành phần: Manager ↔ LeavePage ↔ ServerAction ↔ Prisma ↔ Database

```
Manager → LeavePage: Xem danh sách đơn chờ duyệt
LeavePage → ServerAction: getLeaveRequests({ year })
ServerAction → Prisma: leaveRequest.findMany({ status: "Chờ duyệt" })
Prisma → LeavePage: Danh sách đơn
Manager → LeavePage: Nhấn "Duyệt" cho đơn ID=X
LeavePage → ServerAction: approveLeave(id, "Đã duyệt")
ServerAction → Prisma: leaveRequest.update({ status: "Đã duyệt" })
Prisma → Database: UPDATE leaveRequest SET status=...
Database → ServerAction: Updated record
ServerAction → LeavePage: { success }
LeavePage → Manager: Toast "Đã duyệt đơn nghỉ phép"
```

### 6.2.5 Sequence Diagram — Xuất phiếu lương PDF

> **[HÌNH 6.12]** Sequence Diagram — Xuất PDF phiếu lương
>
> Các thành phần: Employee ↔ PayslipPage ↔ API Route ↔ Prisma ↔ jsPDF

```
Employee → PayslipPage: Nhấn "Tải PDF" (payslipId=X)
PayslipPage → APIRoute: GET /api/export/payslip-pdf/X?lang=vi
APIRoute → Prisma: payslip.findUnique({ id: X, include: payroll, employee })
Prisma → APIRoute: Payslip data đầy đủ
APIRoute → jsPDF: new jsPDF()
APIRoute → jsPDF: Điền thông tin nhân viên, lương, khấu trừ
APIRoute → Employee: Response blob PDF
Employee → Browser: Download file "PhieuLuong_X.pdf"
```

---

## 6.3 State Diagram

### 6.3.1 State Diagram — Đơn nghỉ phép

> **[HÌNH 6.13]** State Diagram — Trạng thái đơn nghỉ phép

```
         [Tạo đơn]
             ↓
        ┌─────────┐
        │ Chờ duyệt│
        └─────────┘
         /         \
    [Duyệt]      [Từ chối]
       ↓               ↓
  ┌──────────┐    ┌──────────┐
  │ Đã duyệt │    │ Từ chối  │
  └──────────┘    └──────────┘
```

### 6.3.2 State Diagram — Hợp đồng lao động

> **[HÌNH 6.14]** State Diagram — Trạng thái hợp đồng lao động

```
    [Ký hợp đồng]
         ↓
    ┌──────────┐
    │ Hiệu lực │ ←─── [Gia hạn]
    └──────────┘
     /          \
[Hết hạn]    [Thanh lý trước hạn]
     ↓               ↓
┌──────────┐   ┌──────────┐
│ Hết hạn  │   │ Thanh lý │
└──────────┘   └──────────┘
```

### 6.3.3 State Diagram — Chấm công trong ngày

> **[HÌNH 6.15]** State Diagram — Trạng thái chấm công

```
    [Đầu ngày]
         ↓
    ┌──────────┐
    │  Vắng mặt│
    └──────────┘
         ↓ [Check-in thành công]
    ┌──────────┐
    │ Đang làm │ (timer chạy)
    └──────────┘
         ↓ [Check-out]
    ┌──────────┐
    │Đã kết thúc│
    └──────────┘

* Nếu check-in sau 07:30: status = "Đi muộn"
* Nếu không check-in: status = "Vắng"
```

### 6.3.4 State Diagram — Công tác phí

> **[HÌNH 6.16]** State Diagram — Trạng thái đơn công tác phí

```
[Nhân viên tạo đơn]
         ↓
    ┌──────────┐
    │ Chờ duyệt│
    └──────────┘
     /          \
[Duyệt]      [Từ chối]
     ↓               ↓
┌──────────┐   ┌──────────┐
│ Đã duyệt │   │ Từ chối  │
└──────────┘   └──────────┘
     ↓ [Cập nhật chi phí thực tế]
┌──────────────┐
│ Hoàn thành   │
└──────────────┘
```

---

## 6.4 Tài liệu Coding (Code snippets quan trọng)

### 6.4.1 Thuật toán GPS Haversine

```typescript
// Tính khoảng cách (mét) giữa 2 tọa độ GPS
const OFFICE_LAT  = 10.731805820306546
const OFFICE_LNG  = 106.69911295227274
const MAX_RADIUS_M = 500

function haversineM(lat1: number, lng1: number,
                    lat2: number, lng2: number): number {
  const R = 6371000 // Bán kính Trái Đất (mét)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2
          + Math.cos(lat1*Math.PI/180)
          * Math.cos(lat2*Math.PI/180)
          * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Sử dụng trong useEffect
navigator.geolocation.getCurrentPosition((pos) => {
  const dist = haversineM(
    pos.coords.latitude, pos.coords.longitude,
    OFFICE_LAT, OFFICE_LNG
  )
  setLocationOk(dist <= MAX_RADIUS_M)
  setLocationDist(Math.round(dist))
})
```

### 6.4.2 Thuật toán tính lương Net

```typescript
function calculateSalary(params: {
  baseSalary: number
  salaryGrade: number
  allowance: number
  otPay: number
  numDependents: number
}) {
  const gross = params.baseSalary * params.salaryGrade
              + params.allowance + params.otPay

  const bhxh = params.baseSalary * 0.08
  const bhyt = params.baseSalary * 0.015
  const bhtn = params.baseSalary * 0.01
  const totalInsurance = bhxh + bhyt + bhtn

  // Thu nhập chịu thuế
  const personalDeduction   = 11_000_000
  const dependentDeduction  = params.numDependents * 4_400_000
  const taxableIncome = Math.max(0,
    gross - totalInsurance - personalDeduction - dependentDeduction
  )

  // Biểu thuế lũy tiến 7 bậc
  const taxAmount = calcProgressiveTax(taxableIncome)

  return {
    grossSalary: gross,
    bhxh, bhyt, bhtn,
    totalInsurance,
    taxableIncome,
    taxAmount,
    netSalary: gross - totalInsurance - taxAmount,
  }
}
```

### 6.4.3 Tính giờ làm thực (trừ nghỉ trưa)

```typescript
// Trừ 90 phút nghỉ trưa nếu làm qua khung 11:30–13:00
function calcNetWorkMs(ci: Date, co: Date): number {
  const rawMs = co.getTime() - ci.getTime()
  const lunchStart = new Date(ci); lunchStart.setHours(11, 30, 0, 0)
  const lunchEnd   = new Date(ci); lunchEnd.setHours(13, 0, 0, 0)
  const lunchMs = (co > lunchEnd && ci < lunchStart)
    ? 90 * 60 * 1000 : 0
  return Math.max(0, rawMs - lunchMs)
}
```
