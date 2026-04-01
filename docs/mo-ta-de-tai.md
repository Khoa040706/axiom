# 📋 Mô Tả Đề Tài

## Tên đề tài

**XÂY DỰNG HỆ THỐNG QUẢN LÝ NHÂN SỰ VÀ TIỀN LƯƠNG DOANH NGHIỆP**
*(HRM & Payroll System)*

---

## 1. Mô tả chung

Dự án "Hệ thống Quản lý Nhân sự và Tiền lương" được xây dựng nhằm mục đích cung cấp một giải pháp phần mềm **toàn diện, tập trung hóa dữ liệu** (Centralized Data).

Hệ thống không chỉ giải quyết bài toán đơn lẻ về quản lý nghỉ phép mà còn mở rộng sang việc quản lý **xuyên suốt vòng đời nhân viên**: từ khi bắt đầu ký hợp đồng, quá trình chấm công hàng ngày, quản lý chế độ phúc lợi, cho đến công đoạn phức tạp nhất là **tính toán lương thưởng tự động**.

**Mục tiêu:** Xây dựng một hệ thống có kiến trúc chặt chẽ, đảm bảo tính toàn vẹn dữ liệu, phân quyền bảo mật cao và hỗ trợ ra quyết định cho ban lãnh đạo thông qua các báo cáo thống kê trực quan.

---

## 2. Mô tả nghiệp vụ (4 phân hệ chức năng)

Hệ thống được chia thành **4 phân hệ nghiệp vụ cốt lõi** có sự liên kết dữ liệu chặt chẽ:

### a. Phân hệ Quản lý Hồ sơ Nhân sự (Core HR)

- **Quản lý thông tin định danh:** Lưu trữ chi tiết thông tin cá nhân, liên hệ, người phụ thuộc (giảm trừ gia cảnh).
- **Quản lý Hợp đồng lao động:** Theo dõi loại hợp đồng (thử việc, chính thức), bậc lương, phụ cấp trách nhiệm và **cảnh báo tự động** khi hợp đồng sắp hết hạn.
- **Quản lý Quá trình công tác:** Ghi nhận lịch sử thăng chức, điều chuyển phòng ban, khen thưởng và kỷ luật.

### b. Phân hệ Quản lý Thời gian (Time & Attendance) & Nghỉ phép

- **Đăng ký & Duyệt nghỉ phép:** Cho phép nhân viên gửi yêu cầu (nghỉ ốm, nghỉ năm, việc riêng); Trưởng phòng phê duyệt theo quy trình. Hệ thống **tự động trừ quỹ phép năm**.
- **Quản lý Chấm công:** Ghi nhận dữ liệu vào/ra (Check-in/Check-out), tự động tổng hợp số ngày công thực tế, số giờ làm thêm (OT), số phút đi muộn/về sớm.
- **Công tác phí:** Quản lý lệnh điều động công tác và tính toán phụ cấp công tác.

### c. Phân hệ Quản lý Tiền lương (Payroll)

- **Thiết lập công thức lương:** Cấu hình các tham số lương cơ bản, hệ số lương, định mức bảo hiểm (BHXH, BHYT, BHTN) và Thuế TNCN theo quy định pháp luật hiện hành.
- **Tính lương tự động:** Hệ thống tổng hợp dữ liệu từ Phân hệ Chấm công và Nghỉ phép để tính ra bảng lương chi tiết (Gross/Net) cho từng nhân viên.
- **Xuất phiếu lương (Payslip):** Tạo và gửi phiếu lương chi tiết cho nhân viên.

### d. Phân hệ Báo cáo & Quản trị hệ thống

- **Dashboard:** Biểu đồ thống kê biến động nhân sự, tỷ lệ nghỉ việc, tổng quỹ lương theo tháng/quý.
- **Phân quyền (RBAC):** Cơ chế phân quyền chi tiết theo vai trò (Admin, HR Manager, Nhân viên) để đảm bảo bảo mật thông tin lương thưởng.

---

## 3. Lợi ích của hệ thống

### Đối với Ban Lãnh đạo và Doanh nghiệp
- **Minh bạch hóa chi phí:** Nắm bắt chính xác biến động quỹ lương và nhân sự theo thời gian thực (Real-time) để có chiến lược điều chỉnh phù hợp.
- **Tăng cường kỷ luật:** Giám sát chặt chẽ giờ giấc làm việc và hiệu quả tuân thủ quy định của nhân viên.

### Đối với Bộ phận Nhân sự (HR) & Kế toán
- **Tự động hóa quy trình:** Giảm thiểu tới 90% thao tác thủ công trong việc tổng hợp công và tính lương, loại bỏ sai sót số học.
- **Quản lý tập trung:** Dễ dàng tra cứu hồ sơ, lịch sử công tác chỉ với vài thao tác chuột thay vì tìm kiếm trong đống hồ sơ giấy tờ.

### Đối với Nhân viên
- **Sự chủ động:** Dễ dàng theo dõi quỹ phép còn lại, tự kiểm tra bảng chấm công và phiếu lương của mình để đảm bảo quyền lợi.
- **Tiện lợi:** Quy trình xin nghỉ phép, giải trình công nhanh chóng, không cần dùng đơn từ giấy rườm rà.

---

