# CHƯƠNG 2. YÊU CẦU ĐỒ ÁN

## 2.1 Tài liệu SRS (Software Requirement Specification)



### Bảng 2.3 Mức độ ưu tiên

| Mức | Ý nghĩa |
|-----|---------|
| **Cao** | Tính năng bắt buộc, hệ thống không hoạt động nếu thiếu |
| **Trung** | Quan trọng nhưng có thể tạm thời thiếu |
| **Thấp** | Cải tiến trải nghiệm, phát triển sau |

---

## 2.1.1 Mô tả chung

### Quan điểm về sản phẩm

Axiom HRM là một hệ thống phần mềm mới, được phát triển như một giải pháp web-based toàn diện, không kế thừa từ bất kỳ sản phẩm có sẵn nào. Hệ thống được thiết kế để thay thế quy trình quản lý nhân sự thủ công hoặc bằng các bảng tính Excel rời rạc, mang lại sự tập trung hóa dữ liệu và tự động hóa toàn bộ quy trình từ quản lý hồ sơ đến tính lương.

### Chức năng của sản phẩm

- Quản lý hồ sơ nhân viên và phân quyền theo vai trò (RBAC).
- Quản lý hợp đồng lao động và lịch sử công tác.
- Chấm công tích hợp định vị GPS.
- Đăng ký và phê duyệt nghỉ phép theo luồng.
- Quản lý công tác phí và lệnh công tác.
- Tính lương tự động (Gross → Net) theo quy định pháp luật.
- Phát hành và quản lý phiếu lương PDF.
- Dashboard phân tích dữ liệu và xuất báo cáo.

### Các lớp người dùng và đặc điểm

| Vai trò | Tần suất sử dụng | Chức năng chính |
|---------|----------------|----------------|
| **Admin** | Thỉnh thoảng | Quản lý tài khoản, phân quyền toàn hệ thống |
| **Director** | Hàng tuần | Xem dashboard KPI, xuất báo cáo tổng hợp |
| **HRManager** | Hàng ngày | Quản lý hồ sơ, hợp đồng, duyệt nghỉ phép, chấm công |
| **Manager** | Hàng ngày | Duyệt đơn nghỉ phép và công tác của phòng |
| **Accountant** | Hàng tháng | Tính lương, phát hành phiếu lương, cấu hình tham số |
| **Employee** | Hàng ngày | Check-in/out, xem phiếu lương, đăng ký nghỉ phép |

**Lớp người dùng quan trọng nhất:** HRManager, Accountant, Employee.

### Môi trường hoạt động

- Nền tảng: Web Browser (Chrome, Firefox, Edge, Safari phiên bản mới nhất).
- Thiết bị: PC, Laptop, Tablet, Smartphone (Responsive).
- Kết nối: Internet hoặc mạng nội bộ LAN.
- Yêu cầu GPS: Tính năng Check-in yêu cầu thiết bị có module định vị GPS và trình duyệt hỗ trợ Geolocation API (HTTPS bắt buộc).

### Ràng buộc thiết kế và triển khai

- Ngôn ngữ lập trình: TypeScript.
- Framework: Next.js 15 App Router.
- Cơ sở dữ liệu: PostgreSQL.
- Giao thức bảo mật: HTTPS.
- Đa ngôn ngữ: Tiếng Việt (mặc định) và Tiếng Anh.
- Quy tắc lương: Tuân thủ Luật BHXH và Thuế TNCN Việt Nam hiện hành.

---

## 2.1.2 Yêu cầu chức năng

### Bảng 2.4 — Tính năng hệ thống

| Mã | Tính năng | Vai trò | Ưu tiên |
|----|----------|---------|---------| 
| FR-01 | Đăng nhập / Đăng xuất | Tất cả | Cao |
| FR-02 | Quản lý hồ sơ nhân viên (CRUD) | Admin, HR | Cao |
| FR-03 | Quản lý hợp đồng lao động | Admin, HR | Cao |
| FR-04 | Quản lý lịch sử công tác | Admin, HR | Trung |
| FR-05 | Check-in / Check-out GPS | Employee | Cao |
| FR-06 | Xem bảng chấm công tháng | HR, Manager, Employee | Cao |
| FR-07 | Đăng ký nghỉ phép | Employee | Cao |
| FR-08 | Duyệt / Từ chối đơn nghỉ phép | HR, Manager | Cao |
| FR-09 | Quản lý quỹ phép năm | HR | Trung |
| FR-10 | Đăng ký công tác phí | Employee | Trung |
| FR-11 | Duyệt công tác phí | HR, Manager | Trung |
| FR-12 | Cấu hình tham số lương | Accountant, Admin | Cao |
| FR-13 | Tính lương tự động | Accountant | Cao |
| FR-14 | Xem / Tải phiếu lương PDF | Employee, Accountant | Cao |
| FR-15 | Dashboard Director | Director | Cao |
| FR-16 | Dashboard HR | HR | Cao |
| FR-17 | Dashboard Accountant | Accountant | Trung |
| FR-18 | Quản lý tài khoản & phân quyền | Admin | Cao |
| FR-19 | Xuất báo cáo Excel/PDF | Director, HR, Accountant | Trung |
| FR-20 | Hồ sơ cá nhân | Tất cả | Thấp |

---

## 2.1.3 Đặc tả Use Case

#### Bảng 2.5 — Đặc tả các Use Case chức năng

| **Mã luồng** | **Tên luồng UC** | **Actor** | **Mô tả** | **Tiền điều kiện** | **Hậu điều kiện** | **Luồng chính** | **Luồng ngoại lệ** |
|---|---|---|---|---|---|---|---|
| UC-01 | Đăng nhập tài khoản | Tất cả người dùng | Người dùng nhập thông tin đăng nhập để truy cập hệ thống | Người dùng chưa đăng nhập | Người dùng đăng nhập thành công, chuyển đến dashboard tương ứng theo role | 1. Truy cập `/login` → 2. Nhập username & password → 3. Hệ thống xác thực qua NextAuth.js → 4. Tạo session JWT → 5. Chuyển đến dashboard theo role | Sai thông tin đăng nhập → hiển thị thông báo lỗi, yêu cầu nhập lại |
| UC-02 | Đăng xuất | Tất cả người dùng (đã đăng nhập) | Người dùng kết thúc phiên làm việc an toàn | Người dùng đang đăng nhập | Session bị hủy, người dùng được chuyển về trang đăng nhập | 1. Click avatar → chọn "Đăng xuất" → 2. Hiện modal xác nhận → 3. Xác nhận → 4. Hệ thống xóa session → 5. Chuyển về `/login` | Không có |
| UC-03 | Quản lý hồ sơ nhân viên | Admin, HRManager | Thêm, sửa, xóa và tìm kiếm hồ sơ nhân viên | Đăng nhập với role Admin hoặc HRManager | Dữ liệu nhân viên được cập nhật trong CSDL | 1. Vào `/employees` → 2. Chọn Thêm/Sửa/Xóa → 3. Điền form thông tin → 4. Xác nhận → 5. Hệ thống lưu và thông báo thành công | Dữ liệu không hợp lệ (thiếu trường bắt buộc, mã nhân viên trùng) → hiển thị lỗi validation |
| UC-04 | Chấm công Check-in / Check-out | Employee | Nhân viên ghi nhận giờ vào/ra tại vị trí văn phòng bằng GPS | Nhân viên đã đăng nhập; chưa check-in trong ngày (hoặc đã check-in nhưng chưa check-out) | Bản ghi chấm công (giờ vào/ra, lateMinutes, OT) được lưu vào CSDL | 1. Vào `/attendance/check-in` → 2. Trình duyệt xin quyền GPS → 3. Tính khoảng cách đến văn phòng (Haversine) → 4. Nếu ≤ 500m: cho phép check-in → 5. Nhấn Check-in → 6. Ghi nhận giờ, tính lateMinutes so với 07:30 → 7. Timer bắt đầu đếm | Khoảng cách > 500m → khóa nút, hiển thị "Ngoài khu vực văn phòng (~Xm)"; Từ chối GPS → hiển thị lỗi "Bạn đã từ chối quyền GPS" |
| UC-05 | Đăng ký nghỉ phép | Employee | Nhân viên gửi đơn xin nghỉ phép | Nhân viên đã đăng nhập; còn quỹ phép hoặc loại phép không giới hạn | Đơn nghỉ phép ở trạng thái "Chờ duyệt" được lưu vào CSDL | 1. Vào `/leave` → 2. Nhấn "Tạo đơn nghỉ phép" → 3. Chọn loại nghỉ, ngày bắt đầu/kết thúc, lý do → 4. Hệ thống tính số ngày (trừ cuối tuần) → 5. Gửi đơn → 6. Đơn chuyển trạng thái "Chờ duyệt" | Ngày kết thúc < ngày bắt đầu → hiển thị lỗi; Quỹ phép không đủ → cảnh báo và chặn gửi |
| UC-06 | Duyệt / Từ chối đơn nghỉ phép | HRManager, Manager | Người quản lý phê duyệt hoặc từ chối đơn nghỉ phép của nhân viên | Có đơn nghỉ phép ở trạng thái "Chờ duyệt" | Đơn chuyển sang "Đã duyệt" hoặc "Từ chối"; quỹ phép của nhân viên được trừ nếu duyệt | 1. Vào `/leave` → 2. Xem danh sách đơn chờ duyệt → 3. Nhấn Duyệt hoặc Từ chối → 4. Hệ thống kiểm tra quỹ phép → 5. Cập nhật trạng thái và ghi nhận người duyệt | Quỹ phép không đủ khi duyệt → hệ thống trả lỗi, không cập nhật trạng thái |
| UC-07 | Tính lương tự động | Accountant | Tổng hợp dữ liệu chấm công và tính lương Gross → Net cho toàn bộ nhân viên | Có dữ liệu chấm công tháng; cấu hình tham số BHXH/thuế đã thiết lập | Bảng lương tháng được tạo/cập nhật trong CSDL; phiếu lương sẵn sàng phát hành | 1. Vào `/payroll` → 2. Chọn tháng/năm → 3. Nhấn "Tính lương" → 4. Lấy hợp đồng hiệu lực → 5. Tổng hợp ngày công + OT → 6. Tính Gross = Lương cơ bản × Hệ số + OT → 7. Tính BH (BHXH 8% + BHYT 1.5% + BHTN 1%) → 8. Tính thuế TNCN lũy tiến → 9. Net = Gross − BH − Thuế → 10. Lưu Payroll | Nhân viên không có hợp đồng hiệu lực → bỏ qua, ghi log lỗi |
| UC-08 | Xem và tải phiếu lương PDF | Employee, Accountant | Nhân viên xem chi tiết phiếu lương và tải về dạng PDF | Kế toán đã tính lương và phát hành phiếu lương tháng đó | Nhân viên có file PDF phiếu lương trên thiết bị | 1. Vào `/payslips` → 2. Chọn kỳ lương → 3. Nhấn "Xem" để xem chi tiết → 4. Nhấn "Tải PDF" → 5. Hệ thống tạo PDF và trình duyệt tải về | Kỳ lương chưa được tính → hiển thị "Chưa có dữ liệu lương kỳ này" |

---

## 2.1.4 Yêu cầu phi chức năng

#### Bảng 2.6 — Yêu cầu hiệu năng

| Mã | Yêu cầu | Chỉ tiêu |
|----|---------|---------|
| NFR-01 | Thời gian phản hồi trang | < 2 giây với kết nối Internet bình thường |
| NFR-02 | Tính toán lương | Hoàn thành trong < 30 giây cho 100 nhân viên |
| NFR-03 | Xuất PDF phiếu lương | < 5 giây mỗi phiếu |

#### Bảng 2.7 — Yêu cầu bảo mật

| Mã | Yêu cầu |
|----|---------|
| NFR-04 | Xác thực session-based qua NextAuth.js; session hết hạn sau 24 giờ |
| NFR-05 | Phân quyền RBAC: mỗi route được bảo vệ theo role tương ứng |
| NFR-06 | Mật khẩu được hash bằng bcrypt trước khi lưu vào CSDL |
| NFR-07 | Giao tiếp qua HTTPS; chặn truy cập trái phép bằng middleware |
| NFR-08 | Nhân viên chỉ xem được dữ liệu của bản thân |

#### Bảng 2.8 — Yêu cầu khả năng sử dụng

| Mã | Yêu cầu |
|----|---------|
| NFR-09 | Giao diện responsive: hoạt động trên màn hình từ 320px trở lên |
| NFR-10 | Hỗ trợ Dark Mode và Light Mode |
| NFR-11 | Đa ngôn ngữ: Tiếng Việt và Tiếng Anh, chuyển đổi không cần tải lại trang |
| NFR-12 | Các thông báo lỗi phải rõ ràng, dễ hiểu cho người dùng cuối |

#### Bảng 2.9 — Quy tắc nghiệp vụ

| Mã | Quy tắc |
|----|---------|
| BR-01 | Giờ làm việc chuẩn: 07:30–11:30 và 13:00–17:00 (trừ 90 phút nghỉ trưa) |
| BR-02 | Check-in sau 07:30 được tính là đi muộn; số phút muộn = check-in - 07:30 |
| BR-03 | Check-in chỉ được phép khi khoảng cách đến văn phòng ≤ 500m (GPS) |
| BR-04 | Tổng giờ làm thực = (check-out - check-in) - 90 phút (nếu làm qua 11:30–13:00) |
| BR-05 | BHXH người lao động đóng: 8% lương cơ bản; BHYT: 1.5%; BHTN: 1% |
| BR-06 | Thuế TNCN tính theo biểu lũy tiến 7 bậc (Điều 22, Luật Thuế TNCN) |
| BR-07 | Giảm trừ bản thân: 11.000.000 đ/tháng; giảm trừ người phụ thuộc: 4.400.000 đ/người/tháng |
| BR-08 | OT được tính với hệ số 1.5× lương giờ |
| BR-09 | Nhân viên chỉ xem được phiếu lương và dữ liệu chấm công của bản thân |
| BR-10 | Đơn nghỉ phép cần ít nhất 1 ngày và ngày bắt đầu không được là ngày cuối tuần |

## 2.2 Tài liệu BRD (Business Requirement Document)

### Quy trình nghiệp vụ chính

#### Quy trình tính lương hàng tháng

```
[Kế toán] Chọn tháng/năm
    ↓
[Hệ thống] Lấy danh sách nhân viên có hợp đồng hiệu lực
    ↓
[Hệ thống] Tổng hợp ngày công từ bảng Attendance
            (đếm status: "Đi làm" + "Đi muộn")
    ↓
[Hệ thống] Tính OT = Σ otHours × hourlyRate × 1.5
    ↓
[Hệ thống] Tính Gross = baseSalary × salaryGrade + allowance + otPay
    ↓
[Hệ thống] Tính khấu trừ = BHXH(8%) + BHYT(1.5%) + BHTN(1%) + Thuế TNCN
    ↓
[Hệ thống] Net = Gross - khấu trừ
    ↓
[Hệ thống] Lưu Payroll → tạo Payslip
    ↓
[Nhân viên] Xem và tải phiếu lương PDF
```

#### Quy trình duyệt nghỉ phép

```
[Employee] Tạo đơn nghỉ phép (type, from, to, reason)
    ↓
Đơn → trạng thái "Chờ duyệt"
    ↓
[HRManager / Manager] Xem danh sách đơn chờ
    ↓
[Duyệt] → trạng thái "Đã duyệt"
[Từ chối] → trạng thái "Từ chối"
```

#### Quy trình chấm công GPS

```
[Employee] Mở trang Check-in
    ↓
[Browser] Xin quyền Geolocation
    ↓ Cho phép
[Hệ thống] Tính khoảng cách đến văn phòng (Haversine)
    ↓
≤ 500m → Hiển thị badge "Trong khu vực" → Cho phép check-in
> 500m → Hiển thị badge "Ngoài khu vực (~Xm)" → Khóa nút check-in
    ↓ (nếu được phép)
[Employee] Nhấn Check-in
    ↓
[Hệ thống] Ghi checkIn timestamp, tính lateMinutes
[Hệ thống] Status = "Đi làm" (nếu đúng giờ) hoặc "Đi muộn" (nếu trễ)
```

