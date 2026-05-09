# CHƯƠNG 6. THIẾT KẾ XỬ LÝ

Chương này trình bày thiết kế xử lý của hệ thống Axiom HRM thông qua 3 loại sơ đồ hành vi:

- **Activity Diagram (Sơ đồ hoạt động):** Mô tả luồng thực hiện nghiệp vụ từ đầu đến cuối, bao gồm các nhánh điều kiện và điểm phân luồng.
- **Sequence Diagram (Sơ đồ tuần tự):** Mô tả thứ tự tương tác giữa các thành phần hệ thống (client, server action, service, database) theo trục thời gian.
- **State Diagram (Sơ đồ trạng thái):** Mô tả vòng đời của một đối tượng — các trạng thái mà đối tượng có thể tồn tại và các sự kiện gây chuyển trạng thái.

---

## 6.1 Activity Diagram

Activity Diagram mô tả luồng hoạt động của các nghiệp vụ chính trong hệ thống. Mỗi sơ đồ thể hiện rõ điểm bắt đầu, điểm kết thúc, các hoạt động tuần tự và các nhánh quyết định (decision node). Kèm theo mỗi sơ đồ là **bảng điểm quyết định** liệt kê tất cả các nhánh rẽ trong luồng.

### 6.1.1 Activity Diagram — Đăng nhập

> **[Hình 6.1]** Activity Diagram — Luồng đăng nhập hệ thống

**Mô tả luồng:** Người dùng truy cập `/login`, nhập username và password. NextAuth xác thực bằng `bcrypt.compare()`. Nếu hợp lệ và tài khoản không bị khóa, JWT session được tạo. Hệ thống kiểm tra `personalEmail` — nếu chưa có thì bắt buộc thiết lập Gmail trước khi vào dashboard. Cuối cùng, redirect về dashboard tương ứng với role.

#### Bảng 6.1 — Điểm quyết định: Đăng nhập

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Thông tin hợp lệ? (bcrypt compare) | Tiếp tục kiểm tra D2 | Hiển thị thông báo lỗi → Kết thúc |
| D2 | Tài khoản bị khóa? (isActive=false) | Báo lỗi "Tài khoản bị khóa" → Kết thúc | Tạo JWT session → Tiếp tục D3 |
| D3 | Có personalEmail? | Redirect theo role (D4) | Redirect `/setup-email` → Nhập Gmail → Lưu → D4 |
| D4 | Role = ? (switch 5 nhánh) | Admin/Director → `/dashboard`; HRManager → `/dashboard-hr`; Manager → `/dashboard-manager`; Accountant → `/dashboard-accountant`; Employee → `/dashboard-employee` | — |

---

### 6.1.2 Activity Diagram — Đăng xuất

> **[Hình 6.2]** Activity Diagram — Luồng đăng xuất hệ thống

**Mô tả luồng:** Người dùng nhấn avatar → chọn "Đăng xuất" → modal xác nhận hiện ra. Nếu xác nhận, `signOut()` của NextAuth được gọi để hủy JWT session, xóa localStorage và redirect về `/login`. Nếu hủy, modal đóng lại.

#### Bảng 6.2 — Điểm quyết định: Đăng xuất

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Xác nhận đăng xuất? | NextAuth `signOut()` → Xóa localStorage → Redirect `/login` | Đóng modal → Quay lại trang hiện tại |

---

### 6.1.3 Activity Diagram — Chấm công Check-in GPS

> **[Hình 6.3]** Activity Diagram — Luồng chấm công Check-in GPS

**Mô tả luồng:** Nhân viên mở trang check-in, trình duyệt xin quyền GPS. Nếu được phép, hệ thống tính khoảng cách đến văn phòng bằng Haversine. Chỉ khi ≤ 500m và chưa check-in hôm nay thì nút Check-in mới được mở. Sau khi check-in, hệ thống tính `lateMinutes` so với 07:30 và bắt đầu timer đếm giờ.

#### Bảng 6.3 — Điểm quyết định: Check-in GPS

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Cho phép GPS? | Lấy tọa độ (lat, lng) → Tiếp tục D2 | Hiển thị "Bạn đã từ chối quyền GPS" → Khóa nút → Kết thúc |
| D2 | Khoảng cách ≤ 500m? | Badge xanh "Trong khu vực" → Mở nút → Tiếp tục D3 | Badge đỏ "Ngoài khu vực (~Xm)" → Khóa nút → Kết thúc |
| D3 | Đã check-in hôm nay? | Hiển thị timer đang làm → Kết thúc | Cho phép nhấn Check-in → Ghi timestamp → D4 |
| D4 | lateMinutes > 0? | status = "Đi muộn" | status = "Đúng giờ" |

---

### 6.1.4 Activity Diagram — Check-out

> **[Hình 6.4]** Activity Diagram — Luồng chấm công Check-out

**Mô tả luồng:** Nhân viên nhấn Check-out. Hệ thống ghi `checkOut` timestamp, tính `netHours = (checkOut − checkIn) − 90 phút nghỉ trưa`. Nếu giờ làm > 8h thì tính OT. Cập nhật bản ghi Attendance và hiển thị tổng giờ.

#### Bảng 6.4 — Điểm quyết định: Check-out

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Đã check-in hôm nay? | Cho phép Check-out → Tiếp tục D2 | Hiển thị lỗi → Kết thúc |
| D2 | netHours > 8 giờ? | otHours = netHours − 8 | otHours = 0 |

---

### 6.1.5 Activity Diagram — Đăng ký nghỉ phép

> **[Hình 6.5]** Activity Diagram — Luồng đăng ký đơn nghỉ phép

**Mô tả luồng:** Nhân viên chọn loại nghỉ phép, ngày bắt đầu/kết thúc, nhập lý do. Hệ thống validate ngày và tự động tính `totalDays` (trừ T7, CN). Kiểm tra quỹ phép — nếu đủ thì tạo đơn với status "Chờ duyệt".

#### Bảng 6.5 — Điểm quyết định: Đăng ký nghỉ phép

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Ngày hợp lệ? (startDate ≤ endDate, không quá khứ) | Tính totalDays → Tiếp tục D2 | Hiển thị lỗi ngày → Kết thúc |
| D2 | Đủ quỹ phép? (LeaveBalance.remaining ≥ totalDays) | Lưu DB: status = "Chờ duyệt" → Thông báo thành công | Cảnh báo "Không đủ quỹ phép" → Kết thúc |

---

### 6.1.6 Activity Diagram — Duyệt nghỉ phép

> **[Hình 6.6]** Activity Diagram — Luồng duyệt đơn nghỉ phép

**Mô tả luồng:** HR/Manager xem danh sách đơn "Chờ duyệt". Nếu từ chối → cập nhật status. Nếu duyệt → kiểm tra quỹ phép, nếu đủ thì dùng transaction để cập nhật status + trừ `usedDays` trong LeaveBalance.

#### Bảng 6.6 — Điểm quyết định: Duyệt nghỉ phép

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Quyết định duyệt hay từ chối? | Duyệt → Tiếp tục D2 | Từ chối → Cập nhật status = "Từ chối" → Kết thúc |
| D2 | Quỹ phép đủ? | BEGIN TRANSACTION → status = "Đã duyệt" + trừ usedDays → COMMIT | Trả lỗi "Không thể duyệt" → Kết thúc |

---

### 6.1.7 Activity Diagram — Tính lương tự động

> **[Hình 6.7]** Activity Diagram — Luồng tính lương tự động hàng tháng

**Mô tả luồng:** Kế toán chọn tháng/năm → nhấn "Tính lương tự động". Hệ thống lấy danh sách NV active, lặp qua từng người: kiểm tra hợp đồng, tổng hợp chấm công, tính Gross → BH → Thuế TNCN → Net. Kết quả upsert vào Payroll + tạo Payslip. Lỗi từng NV được log riêng, không dừng batch.

#### Bảng 6.7 — Điểm quyết định: Tính lương tự động

| # | Điều kiện | Nhánh Đúng | Nhánh Sai |
|---|-----------|------------|-----------|
| D1 | Còn nhân viên trong danh sách? (loop) | Tiếp tục xử lý NV tiếp theo → D2 | Kết thúc loop → Báo cáo "Đã tính X/Y nhân viên" |
| D2 | NV có hợp đồng hiệu lực? | Lấy chấm công → Tính Gross/BH/Thuế/Net → Upsert Payroll + Payslip | Bỏ qua, ghi log lỗi → Quay lại D1 |

---

## 6.2 Sequence Diagram

Sequence Diagram mô tả chi tiết thứ tự các lời gọi giữa các thành phần theo trục thời gian. Kèm theo mỗi sơ đồ là **bảng thành phần tham gia** và **bảng nhánh xử lý** (alt/opt/loop).

### 6.2.1 Sequence Diagram — Đăng nhập

> **[Hình 6.8]** Sequence Diagram — Luồng xác thực đăng nhập

#### Bảng 6.8 — Thành phần tham gia: Đăng nhập

| Thành phần | Loại | Vai trò |
|-----------|------|---------|
| Người dùng | Actor | Nhập username & password |
| Browser | Client | Gửi form, nhận JWT cookie |
| Middleware | Edge Runtime | Kiểm tra session + phân quyền route |
| NextAuth | Server (Node.js) | Xác thực credentials, tạo JWT |
| PostgreSQL | Database | Lưu trữ User records |

**Mô tả luồng:** Người dùng gửi form → `signIn("credentials")` gọi `authorize()` trong `auth.ts`. Prisma truy vấn User theo username → `bcrypt.compare()` kiểm tra mật khẩu → nếu đúng, tạo JWT cookie chứa `role`, `employeeId`, `dashboardPath`. Middleware đọc JWT để phân quyền.

#### Bảng 6.9 — Nhánh xử lý: Đăng nhập

| # | Loại | Điều kiện | Xử lý |
|---|------|-----------|-------|
| A1 | alt | Sai thông tin (bcrypt mismatch) | NextAuth trả Error → Browser hiển thị lỗi |
| A2 | alt | Tài khoản bị khóa (isActive=false) | NextAuth trả Error → Browser hiển thị "Tài khoản bị khóa" |
| A3 | alt | Hợp lệ | Tạo JWT → Set-Cookie → Redirect theo `dashboardPath` |

---

### 6.2.2 Sequence Diagram — Check-in GPS

> **[Hình 6.9]** Sequence Diagram — Luồng chấm công Check-in GPS

#### Bảng 6.10 — Thành phần tham gia: Check-in GPS

| Thành phần | Loại | Vai trò |
|-----------|------|---------|
| Employee | Actor | Mở trang check-in, nhấn nút |
| Browser | Client | Xin quyền GPS, tính Haversine |
| Geolocation API | Web API | Cung cấp tọa độ GPS thiết bị |
| Next.js API | Server Action | Xử lý `doCheckIn()`, ghi DB |
| PostgreSQL | Database | Lưu bản ghi Attendance |

**Mô tả luồng:** Trang check-in gọi `getCurrentPosition()`. Browser tính khoảng cách bằng Haversine. Chỉ khi ≤ 500m, Server Action `doCheckIn()` được gọi → Prisma `upsert` Attendance (tránh duplicate cùng ngày) → tính `lateMinutes` → trả kết quả về UI.

#### Bảng 6.11 — Nhánh xử lý: Check-in GPS

| # | Loại | Điều kiện | Xử lý |
|---|------|-----------|-------|
| A1 | alt | Từ chối quyền GPS | Error PermissionDenied → Khóa nút check-in |
| A2 | alt (nested) | Khoảng cách > 500m | Badge đỏ "Ngoài khu vực" → Khóa nút |
| A3 | alt (nested) | Khoảng cách ≤ 500m | Badge xanh → Mở nút → Cho phép check-in → Ghi DB → Timer |

---

### 6.2.3 Sequence Diagram — Tính lương tự động

> **[Hình 6.10]** Sequence Diagram — Luồng tính lương hàng loạt

#### Bảng 6.12 — Thành phần tham gia: Tính lương

| Thành phần | Loại | Vai trò |
|-----------|------|---------|
| Accountant | Actor | Chọn tháng/năm, nhấn "Tính lương" |
| UI /payroll | Client | Giao diện quản lý lương |
| PayrollService | Service | Tính Gross/BH/Thuế/Net cho từng NV |
| PostgreSQL | Database | Lưu Payroll + Payslip |

**Mô tả luồng:** `calculatePayrollBatch()` dùng `for...of` (tuần tự, không `Promise.all`) lặp qua từng NV active. Với mỗi NV: lấy hợp đồng → lấy chấm công → tính toàn bộ → `upsert` Payroll + Payslip. Lỗi từng NV được `try/catch` riêng.

#### Bảng 6.13 — Nhánh xử lý: Tính lương

| # | Loại | Điều kiện | Xử lý |
|---|------|-----------|-------|
| L1 | loop | Từng nhân viên trong danh sách | Gọi `calculate()` tuần tự |
| A1 | alt (trong loop) | NV không có hợp đồng hiệu lực | Ghi log lỗi → Bỏ qua, tiếp tục NV kế |
| A2 | alt (trong loop) | NV có hợp đồng | Tính Gross → BH → Thuế TNCN → Net → Upsert Payroll + Payslip |

---

### 6.2.4 Sequence Diagram — Duyệt đơn nghỉ phép

> **[Hình 6.11]** Sequence Diagram — Luồng duyệt đơn nghỉ phép

#### Bảng 6.14 — Thành phần tham gia: Duyệt nghỉ phép

| Thành phần | Loại | Vai trò |
|-----------|------|---------|
| HR/Manager | Actor | Xem đơn, nhấn Duyệt/Từ chối |
| UI /leave | Client | Giao diện quản lý nghỉ phép |
| LeaveService | Service | Xử lý `approveLeave()` + kiểm tra quỹ phép |
| PostgreSQL | Database | Cập nhật LeaveRequest + LeaveBalance |

**Mô tả luồng:** Manager xem danh sách đơn "Chờ duyệt" → nhấn Duyệt → Server kiểm tra `LeaveBalance` → nếu đủ quỹ phép: `BEGIN TRANSACTION` → cập nhật status + trừ `usedDays` → `COMMIT`. Phân quyền được kiểm tra cả frontend lẫn backend.

#### Bảng 6.15 — Nhánh xử lý: Duyệt nghỉ phép

| # | Loại | Điều kiện | Xử lý |
|---|------|-----------|-------|
| A1 | alt | Không đủ quỹ phép | Error → Hiển thị lỗi "Không đủ quỹ phép" |
| A2 | alt | Đủ quỹ phép | Transaction: UPDATE status='Đã duyệt' + UPDATE usedDays → COMMIT |

---

### 6.2.5 Sequence Diagram — Xuất phiếu lương PDF

> **[Hình 6.12]** Sequence Diagram — Luồng xuất phiếu lương PDF

#### Bảng 6.16 — Thành phần tham gia: Xuất PDF

| Thành phần | Loại | Vai trò |
|-----------|------|---------|
| Employee | Actor | Xem phiếu lương, nhấn "Tải PDF" |
| UI /payslips | Client | Hiển thị chi tiết phiếu lương |
| API Route | Server | Endpoint `/api/export/payslip-pdf` |
| PayslipService | Service | Truy vấn dữ liệu + tạo PDF |
| PostgreSQL | Database | Lưu Payslip + Payroll + Employee |

**Mô tả luồng:** Nhân viên nhấn "Tải PDF" → `fetch()` gọi API Route → Server truy vấn Payslip + Payroll + Employee → jsPDF tạo PDF (header, bảng lương, chữ ký) → Response blob PDF (`Content-Disposition: attachment`) → Browser tải file.

#### Bảng 6.17 — Nhánh xử lý: Xuất PDF

| # | Loại | Điều kiện | Xử lý |
|---|------|-----------|-------|
| A1 | opt | Payslip không tồn tại | Trả Error 404 → Hiển thị "Chưa có dữ liệu lương" |
| A2 | opt | markViewed | Khi mở phiếu lương → UPDATE `isViewed = true` |



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
  const personalDeduction   = 15_500_000
  const dependentDeduction  = params.numDependents * 6_200_000
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
