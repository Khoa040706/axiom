# CHƯƠNG 6. THIẾT KẾ XỬ LÝ

Chương này trình bày thiết kế xử lý của hệ thống Axiom HRM thông qua 3 loại sơ đồ hành vi:

- **Activity Diagram (Sơ đồ hoạt động):** Mô tả luồng thực hiện nghiệp vụ từ đầu đến cuối, bao gồm các nhánh điều kiện và điểm phân luồng.
- **Sequence Diagram (Sơ đồ tuần tự):** Mô tả thứ tự tương tác giữa các thành phần hệ thống (client, server action, service, database) theo trục thời gian.
- **State Diagram (Sơ đồ trạng thái):** Mô tả vòng đời của một đối tượng — các trạng thái mà đối tượng có thể tồn tại và các sự kiện gây chuyển trạng thái.

---

## 6.1 Activity Diagram

Activity Diagram mô tả luồng hoạt động của các nghiệp vụ chính trong hệ thống. Mỗi sơ đồ thể hiện rõ điểm bắt đầu, điểm kết thúc, các hoạt động tuần tự và các nhánh quyết định (decision node).

### 6.1.1 Activity Diagram — Đăng nhập

> **[Hình 6.1]** Activity Diagram — Luồng đăng nhập hệ thống

**Giải thích:** Người dùng truy cập trang `/login` và nhập mã đăng nhập cùng mật khẩu. Hệ thống gửi thông tin đến NextAuth để xác thực thông qua Credentials Provider. NextAuth truy vấn database lấy bản ghi User, sau đó dùng `bcrypt.compare()` để kiểm tra mật khẩu. Nếu đúng, JWT session được tạo với thông tin role và `dashboardPath`; trình duyệt được redirect về dashboard tương ứng với vai trò. Nếu sai, hiển thị thông báo lỗi và yêu cầu nhập lại — không có cơ chế khóa tài khoản sau N lần sai.

### 6.1.2 Activity Diagram — Đăng xuất

> **[Hình 6.2]** Activity Diagram — Luồng đăng xuất hệ thống

**Giải thích:** Người dùng nhấn nút Đăng xuất từ menu avatar. Hệ thống hiển thị modal xác nhận để tránh đăng xuất nhầm. Sau khi xác nhận, `signOut()` của NextAuth được gọi, JWT session bị hủy phía server. Trình duyệt được redirect về `/login`. Middleware sẽ chặn mọi request tiếp theo từ client này cho đến khi đăng nhập lại.

### 6.1.3 Activity Diagram — Chấm công Check-in GPS

> **[Hình 6.3]** Activity Diagram — Luồng chấm công Check-in GPS

**Giải thích:** Đây là luồng phức tạp nhất trong module chấm công. Khi nhân viên mở trang check-in, trình duyệt gọi `navigator.geolocation.getCurrentPosition()` để lấy tọa độ GPS. Nếu người dùng từ chối quyền GPS, nút check-in bị khóa vĩnh viễn và hiển thị thông báo lỗi. Nếu cho phép, hệ thống dùng công thức Haversine để tính khoảng cách (mét) từ vị trí hiện tại đến tọa độ văn phòng. Nếu khoảng cách vượt quá 500m, nút check-in bị vô hiệu hóa và badge "Ngoài khu vực" được hiển thị. Khi đủ điều kiện và nhân viên nhấn Check-in, Server Action ghi timestamp hiện tại vào trường `checkIn`, tính `lateMinutes = max(0, checkInTime - 07:30)`, cập nhật `status` thành "Đi làm" hoặc "Đi muộn", và khởi động bộ đếm thời gian trên giao diện.

### 6.1.4 Activity Diagram — Check-out

> **[Hình 6.4]** Activity Diagram — Luồng chấm công Check-out

**Giải thích:** Nhân viên đã check-in trong ngày nhấn nút Check-out. Hệ thống ghi timestamp vào trường `checkOut`, sau đó tính tổng thời gian làm việc thực tế: nếu ca làm việc vượt qua khung nghỉ trưa 11:30–13:00, trừ đi 90 phút. Kết quả `otHours` được tính nếu tổng giờ làm vượt 8 tiếng. Bộ đếm thời gian trên giao diện dừng lại và hiển thị tổng giờ đã làm.

### 6.1.5 Activity Diagram — Đăng ký nghỉ phép

> **[Hình 6.5]** Activity Diagram — Luồng đăng ký đơn nghỉ phép

**Giải thích:** Nhân viên chọn loại nghỉ phép (6 loại: năm, bệnh, việc riêng, thai sản, tang, không lương), chọn ngày bắt đầu và kết thúc, nhập lý do. Hệ thống tự động tính số ngày làm việc thực tế (loại trừ thứ Bảy, Chủ Nhật). Sau khi validation thành công (ngày hợp lệ, không phải cuối tuần), đơn được tạo với trạng thái "Chờ duyệt" và lưu vào database. Nhân viên nhận thông báo xác nhận; Manager/HR nhận task duyệt đơn.

### 6.1.6 Activity Diagram — Duyệt nghỉ phép

> **[Hình 6.6]** Activity Diagram — Luồng duyệt đơn nghỉ phép

**Giải thích:** Manager hoặc HRManager vào trang `/leave` để xem danh sách đơn đang chờ duyệt. Sau khi xem chi tiết, người duyệt chọn "Duyệt" hoặc "Từ chối". Hệ thống gọi `approveLeave(requestId, approverId, approved)`, cập nhật trường `status` và `approverId` trong database. Trạng thái đơn chuyển sang "Đã duyệt" hoặc "Từ chối"; người duyệt nhận toast thông báo thành công.

### 6.1.7 Activity Diagram — Tính lương tự động

> **[Hình 6.7]** Activity Diagram — Luồng tính lương tự động hàng tháng

**Giải thích:** Kế toán chọn tháng/năm và nhấn "Tính lương tự động". Hệ thống lấy toàn bộ nhân viên đang làm (status "Đang làm" hoặc "Thử việc"). Với mỗi nhân viên, `payrollService.calculate()` được gọi tuần tự: lấy hợp đồng đang hiệu lực, tổng hợp số ngày công từ bảng Attendance, tính OT, tính Gross, tính các khoản khấu trừ bảo hiểm và thuế TNCN lũy tiến 7 bậc, tính Net. Kết quả được upsert vào bảng Payroll (tránh duplicate) và `payslipService.createOrUpdate()` được gọi để tạo phiếu lương. Bất kỳ lỗi nào cho một nhân viên sẽ được ghi log riêng và không ảnh hưởng đến các nhân viên còn lại.

---

## 6.2 Sequence Diagram

Sequence Diagram mô tả chi tiết thứ tự các lời gọi giữa các thành phần theo trục thời gian từ trên xuống dưới. Các thành phần bao gồm: người dùng (Actor), giao diện (Page/Component), Server Action, Service layer, Prisma ORM và PostgreSQL Database.

### 6.2.1 Sequence Diagram — Đăng nhập

> **[Hình 6.8]** Sequence Diagram — Luồng xác thực đăng nhập

**Các thành phần:** Browser → LoginPage → NextAuth Credentials → Prisma → PostgreSQL

**Giải thích:** Người dùng gửi form đăng nhập, `signIn("credentials", { username, password })` được gọi. NextAuth kích hoạt hàm `authorize()` trong `auth.ts` — đây là file chạy trên Node.js runtime (có bcrypt). Hàm này dùng Prisma truy vấn User theo username; nếu tồn tại, `bcrypt.compare()` kiểm tra mật khẩu. Nếu đúng, hàm trả về object user với `role`, `employeeId`, `dashboardPath`; NextAuth mã hóa thông tin này vào JWT cookie. Middleware (`auth.config.ts` — Edge Runtime, không có bcrypt) đọc JWT để kiểm tra quyền truy cập tất cả các request tiếp theo.

```
Browser     → LoginPage    : Nhập username + password, Submit
LoginPage   → NextAuth     : signIn("credentials", { username, password })
NextAuth    → Prisma       : user.findUnique({ where: { username } })
Prisma      → PostgreSQL   : SELECT * FROM "User" WHERE username = ?
PostgreSQL  → Prisma       : User record (id, passwordHash, role, ...)
Prisma      → NextAuth     : User object
NextAuth    → NextAuth     : bcrypt.compare(password, passwordHash)
alt Đúng
  NextAuth  → Browser      : Set-Cookie: next-auth.session-token (JWT)
  Browser   → Dashboard    : Redirect đến dashboardPath theo role
else Sai
  NextAuth  → LoginPage    : Error "Sai thông tin đăng nhập"
  LoginPage → Browser      : Hiển thị thông báo lỗi
end
```

### 6.2.2 Sequence Diagram — Check-in GPS

> **[Hình 6.9]** Sequence Diagram — Luồng chấm công Check-in GPS

**Các thành phần:** Employee → Browser → GeolocationAPI → CheckInPage → Server Action → Prisma → PostgreSQL

**Giải thích:** Sau khi trang check-in tải xong, `useEffect` kích hoạt việc gọi `navigator.geolocation.getCurrentPosition()`. Tọa độ trả về được xử lý client-side bằng hàm `haversineM()` để tính khoảng cách đến văn phòng. Chỉ khi khoảng cách ≤ 500m và nhân viên nhấn nút, Server Action `doCheckIn()` được gọi. Prisma thực hiện `upsert` để tránh duplicate record cùng ngày (UNIQUE constraint trên `employeeId + workDate`). Kết quả trả về bao gồm thời gian check-in và số phút đi muộn để hiển thị trên giao diện.

```
Employee    → Browser         : Mở /attendance/check-in
Browser     → GeolocationAPI  : getCurrentPosition()
alt Từ chối GPS
  GeolocationAPI → Browser   : Error PermissionDenied
  Browser   → Employee       : "Bạn đã từ chối quyền GPS" + Khóa nút
else Chấp nhận GPS
  GeolocationAPI → Browser   : { latitude, longitude }
  Browser   → Browser        : haversineM(lat, lng, OFFICE_LAT, OFFICE_LNG) → dist
  alt dist > 500m
    Browser → Employee       : Badge "Ngoài khu vực (~Xm)" + Khóa nút
  else dist ≤ 500m
    Browser → Employee       : Badge "Trong khu vực (~Xm)" + Mở nút
    Employee → CheckInPage   : Click "Check-in"
    CheckInPage → ServerAction : doCheckIn(employeeId)
    ServerAction → Prisma    : attendance.upsert({ checkIn: now(), lateMinutes })
    Prisma → PostgreSQL      : INSERT/UPDATE attendance
    PostgreSQL → Prisma      : Updated record
    Prisma → ServerAction    : { id, checkIn, status, lateMinutes }
    ServerAction → CheckInPage : { success: true, data }
    CheckInPage → Employee   : Toast "Check-in thành công lúc HH:MM"
    CheckInPage → Employee   : Khởi động timer đếm giờ
  end
end
```

### 6.2.3 Sequence Diagram — Tính lương tự động

> **[Hình 6.10]** Sequence Diagram — Luồng tính lương hàng loạt

**Các thành phần:** Accountant → PayrollPage → ServerAction → PayrollService → Prisma → PostgreSQL

**Giải thích:** `calculatePayrollBatch()` được thiết kế để tính lương cho tất cả nhân viên active trong một lần gọi. Hệ thống dùng vòng lặp `for...of` (không phải `Promise.all`) để tránh quá tải database. Với mỗi nhân viên, `payrollService.calculate()` truy vấn hợp đồng hiệu lực, tổng hợp attendance tháng đó, thực hiện toàn bộ phép tính lương và upsert kết quả. Lỗi từng nhân viên được bắt bằng `try/catch` riêng, không làm dừng batch. Kết quả cuối trả về số lượng thành công/thất bại.

```
Accountant  → PayrollPage    : Chọn tháng/năm, nhấn "Tính lương tự động"
PayrollPage → ServerAction   : calculatePayrollBatch(month, year)
ServerAction → Prisma        : employee.findMany({ status: in ["Đang làm","Thử việc"] })
Prisma → PostgreSQL          : SELECT employees
PostgreSQL → Prisma          : [emp1, emp2, ...]
loop Với mỗi nhân viên
  ServerAction → PayrollService : calculate(empId, month, year)
  PayrollService → Prisma    : contract.findFirst({ status: "Hiệu lực" })
  PayrollService → Prisma    : attendance.findMany({ month, year, empId })
  PayrollService → PayrollService : tính Gross, BHXH, thuế TNCN, Net
  PayrollService → Prisma    : payroll.upsert(result)
  PayrollService → Prisma    : payslip.upsert({ payrollId })
end
ServerAction → PayrollPage   : { success: true, message: "Đã tính X/Y nhân viên" }
PayrollPage → Accountant     : Toast thông báo kết quả
```

### 6.2.4 Sequence Diagram — Duyệt đơn nghỉ phép

> **[Hình 6.11]** Sequence Diagram — Luồng duyệt đơn nghỉ phép

**Các thành phần:** Manager → LeavePage → ServerAction → Prisma → PostgreSQL

**Giải thích:** Manager truy cập trang `/leave` và xem danh sách đơn ở tab "Chờ duyệt". Sau khi nhấn Duyệt hoặc Từ chối cho một đơn, `approveLeave(requestId, approverId, approved)` được gọi. Server Action cập nhật `status` và `approverId` trong database. Phân quyền được đảm bảo ở cả frontend (chỉ hiển thị nút cho Manager+) và backend (Server Action kiểm tra session role).

```
Manager     → LeavePage      : Mở /leave, tab "Chờ duyệt"
LeavePage   → ServerAction   : getLeaveRequests({ status: "Chờ duyệt" })
ServerAction → Prisma        : leaveRequest.findMany(filter)
Prisma → LeavePage           : Danh sách đơn nghỉ phép
Manager     → LeavePage      : Click "Duyệt" / "Từ chối" cho đơn ID=X
LeavePage   → ServerAction   : approveLeave(X, managerId, approved=true/false)
ServerAction → Prisma        : leaveRequest.update({ status, approverId })
Prisma → PostgreSQL          : UPDATE leaveRequest SET status=... WHERE id=X
PostgreSQL → Prisma          : Updated record
Prisma → ServerAction        : Updated leaveRequest
ServerAction → LeavePage     : { success: true }
LeavePage → Manager          : Toast "Đã duyệt / Từ chối đơn nghỉ phép"
```

### 6.2.5 Sequence Diagram — Xuất phiếu lương PDF

> **[Hình 6.12]** Sequence Diagram — Luồng xuất phiếu lương PDF

**Các thành phần:** Employee → PayslipPage → API Route → Prisma → jsPDF → Browser

**Giải thích:** Nhân viên nhấn nút "Tải PDF" trên trang phiếu lương. Client gọi `fetch()` đến API route `/api/export/payslip-pdf/[id]`. Server truy vấn đầy đủ thông tin payslip kèm payroll và employee. jsPDF tạo file PDF với layout chuyên nghiệp (thông tin nhân viên, bảng lương chi tiết, chữ ký). Response trả về blob PDF với header `Content-Disposition: attachment`, trình duyệt tự động tải file về.

```
Employee    → PayslipPage    : Click "Tải PDF" (payslipId=X, lang="vi")
PayslipPage → APIRoute       : GET /api/export/payslip-pdf/X?lang=vi
APIRoute    → Prisma         : payslip.findUnique({ id: X, include: [payroll, employee] })
Prisma → PostgreSQL          : SELECT payslip JOIN payroll JOIN employee
PostgreSQL → Prisma          : Dữ liệu đầy đủ
Prisma → APIRoute            : Payslip object
APIRoute    → jsPDF          : new jsPDF() → build layout
APIRoute    → APIRoute       : Điền thông tin NV, bảng lương, khấu trừ, Net
APIRoute    → Employee       : Response blob PDF (Content-Disposition: attachment)
Employee    → Browser        : Download "PhieuLuong_[code]_[month]-[year].pdf"
```

---

## 6.3 State Diagram

State Diagram mô tả vòng đời của các đối tượng nghiệp vụ chính trong hệ thống — các trạng thái mà đối tượng có thể ở và các sự kiện/điều kiện gây ra sự chuyển đổi giữa các trạng thái đó.

### 6.3.1 State Diagram — Đơn nghỉ phép

> **[Hình 6.13]** State Diagram — Vòng đời đơn nghỉ phép (LeaveRequest)

**Giải thích:** Khi nhân viên tạo đơn, LeaveRequest được khởi tạo ở trạng thái **Chờ duyệt**. Đây là trạng thái duy nhất mà đơn có thể bị thay đổi bởi người duyệt. Manager hoặc HRManager duyệt đơn → chuyển sang **Đã duyệt** (không thể hoàn tác). Nếu từ chối → chuyển sang **Từ chối** (không thể hoàn tác). Hai trạng thái Đã duyệt và Từ chối là trạng thái cuối (terminal state).

```
[*] → Chờ duyệt : Nhân viên tạo đơn
Chờ duyệt → Đã duyệt : Manager/HR duyệt
Chờ duyệt → Từ chối : Manager/HR từ chối
Đã duyệt → [*]
Từ chối → [*]
```

### 6.3.2 State Diagram — Hợp đồng lao động

> **[Hình 6.14]** State Diagram — Vòng đời hợp đồng lao động (Contract)

**Giải thích:** Hợp đồng được tạo ở trạng thái **Hiệu lực** kể từ ngày ký. Trạng thái Hiệu lực cho phép gia hạn (tạo hợp đồng mới thay thế). Khi đến ngày kết thúc (`endDate`) mà không gia hạn, hệ thống chuyển sang **Hết hạn**. Nếu chấm dứt trước hạn theo thỏa thuận hai bên → chuyển sang **Thanh lý**. Hết hạn và Thanh lý là trạng thái cuối — không thể kích hoạt lại hợp đồng cũ, chỉ có thể tạo hợp đồng mới.

```
[*] → Hiệu lực : Ký hợp đồng
Hiệu lực → Hiệu lực : Gia hạn
Hiệu lực → Hết hạn : Đến ngày endDate
Hiệu lực → Thanh lý : Chấm dứt trước hạn
Hết hạn → [*]
Thanh lý → [*]
```

### 6.3.3 State Diagram — Chấm công trong ngày

> **[Hình 6.15]** State Diagram — Vòng đời bản ghi chấm công (Attendance)

**Giải thích:** Mỗi ngày làm việc, hệ thống khởi tạo bản ghi chấm công ở trạng thái mặc định **Vắng mặt**. Khi nhân viên check-in thành công, trạng thái chuyển sang **Đang làm** (nếu đúng giờ) hoặc **Đi muộn** (nếu sau 07:30). Khi check-out, trạng thái được cập nhật thành **Đã kết thúc ca** và tổng giờ làm được tính toán. Nếu nhân viên có đơn nghỉ phép được duyệt trong ngày, trạng thái được gắn là **Nghỉ phép** và không yêu cầu check-in.

```
[*] → Vắng mặt : Đầu ngày làm việc
Vắng mặt → Đang làm : Check-in trước 07:30
Vắng mặt → Đi muộn : Check-in sau 07:30
Vắng mặt → Nghỉ phép : Có đơn nghỉ được duyệt
Đang làm → Đã kết thúc ca : Check-out
Đi muộn → Đã kết thúc ca : Check-out
Đã kết thúc ca → [*]
Nghỉ phép → [*]
```

### 6.3.4 State Diagram — Đơn công tác

> **[Hình 6.16]** State Diagram — Vòng đời đơn công tác (BusinessTrip)

**Giải thích:** Nhân viên tạo đề xuất công tác, đơn ở trạng thái **Chờ duyệt**. Manager hoặc HRManager duyệt → chuyển sang **Đã duyệt**; từ chối → chuyển sang **Từ chối**. Khác với đơn nghỉ phép, sau khi được duyệt và nhân viên hoàn thành chuyến công tác, kế toán có thể cập nhật chi phí thực tế, đơn chuyển sang trạng thái **Hoàn thành**. Đây là trạng thái cuối duy nhất của luồng duyệt.

```
[*] → Chờ duyệt : Nhân viên tạo đề xuất
Chờ duyệt → Đã duyệt : Manager/HR duyệt
Chờ duyệt → Từ chối : Manager/HR từ chối
Đã duyệt → Hoàn thành : Cập nhật chi phí thực tế
Từ chối → [*]
Hoàn thành → [*]
```

---

## 6.4 Tài liệu Coding (Code snippets quan trọng)

Mục này trình bày các đoạn code quan trọng nhất trong hệ thống — những thuật toán nghiệp vụ cốt lõi mà không thể mô tả đầy đủ chỉ bằng sơ đồ.

### 6.4.1 Thuật toán GPS Haversine

**Mô tả:** Tính khoảng cách chính xác (tính bằng mét) giữa hai điểm trên mặt cầu Trái Đất dựa trên tọa độ GPS. Được dùng để xác định nhân viên có đang trong phạm vi 500m của văn phòng hay không trước khi cho phép check-in.

```typescript
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

**Mô tả:** Hàm core của payroll engine, thực hiện toàn bộ phép tính từ lương Gross đến Net theo đúng quy định pháp luật Việt Nam: khấu trừ BHXH/BHYT/BHTN, tính thu nhập chịu thuế (sau giảm trừ bản thân và người phụ thuộc), áp dụng biểu thuế TNCN lũy tiến 7 bậc.

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

  // Khấu trừ bảo hiểm (tính trên lương cơ bản)
  const bhxh = params.baseSalary * 0.08   // 8%
  const bhyt = params.baseSalary * 0.015  // 1.5%
  const bhtn = params.baseSalary * 0.01   // 1%
  const totalInsurance = bhxh + bhyt + bhtn

  // Thu nhập chịu thuế = Gross - BH - giảm trừ bản thân - giảm trừ người phụ thuộc
  const personalDeduction   = 11_000_000
  const dependentDeduction  = params.numDependents * 4_400_000
  const taxableIncome = Math.max(0,
    gross - totalInsurance - personalDeduction - dependentDeduction
  )

  // Biểu thuế lũy tiến 7 bậc (Điều 22, Luật Thuế TNCN)
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

**Mô tả:** Tính tổng thời gian làm việc thực tế trong ngày. Nếu ca làm việc kéo dài qua khung nghỉ trưa 11:30–13:00, tự động trừ 90 phút để tránh tính sai giờ OT cho nhân viên ăn trưa.

```typescript
function calcNetWorkMs(ci: Date, co: Date): number {
  const rawMs = co.getTime() - ci.getTime()
  const lunchStart = new Date(ci); lunchStart.setHours(11, 30, 0, 0)
  const lunchEnd   = new Date(ci); lunchEnd.setHours(13, 0, 0, 0)
  // Trừ 90 phút nếu check-in trước 11:30 VÀ check-out sau 13:00
  const lunchMs = (co > lunchEnd && ci < lunchStart)
    ? 90 * 60 * 1000 : 0
  return Math.max(0, rawMs - lunchMs)
}
```
