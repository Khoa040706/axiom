# CHƯƠNG 7. THIẾT KẾ GIAO DIỆN

## 7.1 Tài liệu thiết kế

### 7.1.1 Design System

| Thành phần | Giá trị |
|-----------|---------|
| **Màu chủ đạo** | #D0211C (đỏ Axiom) |
| **Font chữ** | Inter, system-ui, sans-serif |
| **Border radius** | 8px (card), 20px (badge) |
| **Chế độ** | Light Mode + Dark Mode |
| **Ngôn ngữ** | Tiếng Việt (mặc định) + Tiếng Anh |
| **Responsive** | Mobile (320px+), Tablet, Desktop |

### Bảng 7.1 — Bảng màu hệ thống

| Màu | Hex | Sử dụng |
|-----|-----|---------|
| Primary Red | #D0211C | Sidebar, nút chính, accent |
| Success Green | #10B981 | Trạng thái thành công, lương Net |
| Warning Amber | #F59E0B | Trạng thái chờ duyệt, cảnh báo |
| Error Red | #EF4444 | Lỗi, từ chối |
| Info Blue | #3B82F6 | Thông tin, link |
| Dark bg | #0F172A | Nền dark mode |
| Light bg | #F8FAFC | Nền light mode |

### Bảng 7.2 — Quy ước giao diện

| Thành phần | Mô tả |
|-----------|-------|
| **Sidebar** | Cố định bên trái, co lại trên mobile |
| **Header** | Đồng hồ thời gian thực, toggle ngôn ngữ, dark mode, avatar |
| **Toast** | Thông báo góc phải dưới, tự biến mất sau 3.5s |
| **Table** | Phân trang (Pagination), mỗi trang 10-20 dòng |
| **Modal** | Overlay bán trong suốt, close bằng nút X hoặc click ngoài |
| **Badge** | Bo tròn, màu theo trạng thái |

---

## 7.2 Màn hình Đăng nhập

> **[HÌNH 7.1]** Màn hình Đăng nhập — Route: `/login`
>
> Mô tả: Nền gradient tối, card trung tâm với logo Axiom, form username/password, nút đăng nhập màu đỏ, thông báo lỗi toast khi sai thông tin. Hỗ trợ Enter để submit.

### Bảng 7.3 — Mô tả giao diện Đăng nhập

| Thành phần | Mô tả |
|-----------|-------|
| Logo Axiom | Góc trên card, màu đỏ chủ đạo |
| Tiêu đề | "Đăng nhập hệ thống Axiom HRM" |
| Input username | Placeholder "Tên đăng nhập", icon User |
| Input password | Placeholder "Mật khẩu", icon Lock, nút toggle hiện/ẩn |
| Nút Đăng nhập | Màu primary, full width, loading spinner khi đang xử lý |
| Toast lỗi | Xuất hiện khi sai thông tin |

---

## 7.3 Dashboard Admin

> **[HÌNH 7.2]** Dashboard Admin — Route: `/dashboard`
>
> Mô tả: Lời chào theo thời gian (Chào buổi sáng/chiều/tối), 4 thẻ KPI (Tổng nhân sự / Đơn nghỉ chờ / Hợp đồng sắp hết hạn / Thử việc), 6 quick-access tiles, danh sách sự kiện công ty, biểu đồ tròn phân bổ nhân lực.

### Bảng 7.4 — Mô tả giao diện Dashboard Admin

| Thành phần | Mô tả |
|-----------|-------|
| KPI Row | 4 thẻ màu gradient, số liệu thật từ DB, click để chuyển trang |
| Quick Access | 6 tile icon với animation hover |
| Sự kiện công ty | Danh sách badge màu theo trạng thái |
| Biểu đồ tròn | Recharts PieChart phân bổ nhân lực theo phòng ban |
| Nút Xuất Excel | Xuất báo cáo .xlsx |

---

## 7.4 Dashboard Director

> **[HÌNH 7.3]** Dashboard Director — Route: `/dashboard-director`
>
> Mô tả: 4 thẻ KPI (Tổng NV / Quỹ lương Net / Đơn nghỉ chờ / HĐ hết hạn), biểu đồ đường xu hướng lương 6 tháng, biểu đồ tròn nhân lực, biểu đồ cột chấm công 6 tháng, 5 quick stats hàng dưới.

### Bảng 7.5 — Mô tả giao diện Dashboard Director

| Thành phần | Mô tả |
|-----------|-------|
| Biểu đồ đường | Xu hướng quỹ lương Net theo tháng (LineChart) |
| Biểu đồ tròn | Phân bổ nhân lực theo phòng ban (PieChart) |
| Biểu đồ cột | Chấm công 6 tháng: Đi làm / Đi muộn / Vắng (BarChart) |
| Nút Xuất Excel | Xuất báo cáo tổng hợp |
| Nút Tải lại | Refresh dữ liệu từ DB |

---

## 7.5 Dashboard HR Manager

> **[HÌNH 7.4]** Dashboard HR Manager — Route: `/dashboard-hr`
>
> Mô tả: 4 thẻ KPI nhân sự, biểu đồ cột nhân lực theo phòng ban, 6 quick action tiles, bảng đơn nghỉ phép chờ duyệt với nút Duyệt/Từ chối tác động thật.

---

## 7.6 Dashboard Accountant

> **[HÌNH 7.5]** Dashboard Accountant — Route: `/dashboard-accountant`
>
> Mô tả: 4 thẻ KPI tài chính (Gross / Net / BHXH / Thuế), biểu đồ đường lương Net, bảng chi tiết các khoản khấu trừ bắt buộc (BHXH/BHYT/BHTN/Thuế), 3 quick action tiles.

---

## 7.7 Dashboard Manager

> **[HÌNH 7.6]** Dashboard Manager (Trưởng phòng) — Route: `/dashboard-manager`
>
> Mô tả: 4 thẻ KPI phòng ban, biểu đồ cột chấm công tháng này, danh sách đơn nghỉ phép phòng chờ duyệt.

---

## 7.8 Trang Quản lý nhân viên

> **[HÌNH 7.7]** Danh sách nhân viên — Route: `/employees`
>
> Mô tả: Bảng danh sách với cột: Avatar, Mã NV, Họ tên, Phòng ban, Vị trí, Trạng thái (badge), Ngày vào. Có thanh tìm kiếm, filter phòng ban, phân trang. Nút Thêm mới, Sửa, Xóa.

> **[HÌNH 7.8]** Chi tiết nhân viên — Route: `/employees/[id]`
>
> Mô tả: Layout 2 cột: trái là ảnh đại diện và thông tin cơ bản; phải là tabs (Thông tin cá nhân / Hợp đồng / Lịch sử công tác / Chấm công).

### Bảng 7.6 — Mô tả giao diện Quản lý nhân viên

| Thành phần | Mô tả |
|-----------|-------|
| Bảng danh sách | Phân trang 20 NV/trang, sortable |
| Thanh tìm kiếm | Tìm theo tên, mã NV |
| Filter phòng ban | Dropdown chọn phòng |
| Nút Thêm mới | Mở modal form thêm nhân viên |
| Nút Sửa | Chỉnh sửa inline hoặc modal |
| Nút Xóa | Xác nhận trước khi xóa |

---

## 7.9 Trang Chấm công (Check-in GPS)

> **[HÌNH 7.9]** Trang Check-in — Route: `/attendance/check-in`
>
> Mô tả: Card trung tâm với đồng hồ thời gian thực, badge GPS (xanh "Trong khu vực" / đỏ "Ngoài khu vực ~Xm"), nút Check-in/Check-out lớn, timer hiển thị thời gian làm việc, bảng lịch sử 7 bản ghi gần nhất (ngày, giờ vào, giờ ra, tổng giờ, trạng thái).

### Bảng 7.7 — Mô tả giao diện Check-in GPS

| Thành phần | Mô tả |
|-----------|-------|
| Đồng hồ | Hiển thị giờ thực tế, cập nhật mỗi giây |
| Badge GPS | Màu xanh nếu trong 500m, đỏ nếu ngoài |
| Nút Check-in | Lớn, màu xanh, disabled khi ngoài khu vực |
| Timer | Đếm thời gian làm việc sau check-in |
| Bảng lịch sử | 7 bản ghi mới nhất, trạng thái badge màu |

---

## 7.10 Trang Bảng chấm công tổng hợp

> **[HÌNH 7.10]** Bảng chấm công — Route: `/attendance`
>
> Mô tả: Bộ lọc tháng/năm, filter phòng ban (HR), bảng tổng hợp với cột: Nhân viên, Phòng ban, Giờ vào, Giờ ra, Tổng giờ, Trạng thái (badge màu). Nút xuất PDF báo cáo chấm công.

---

## 7.11 Trang Đơn nghỉ phép

> **[HÌNH 7.11]** Trang nghỉ phép (Employee) — Route: `/leave`
>
> Mô tả (Employee): 4 thẻ thống kê (Tổng / Chờ duyệt / Đã duyệt / Từ chối), nút "Tạo đơn nghỉ phép" mở modal form (loại nghỉ, ngày, lý do), danh sách đơn cá nhân với badge trạng thái.

> **[HÌNH 7.12]** Trang nghỉ phép (HR/Manager) — Route: `/leave`
>
> Mô tả (HR/Manager): Tương tự nhưng hiển thị tất cả đơn toàn công ty/phòng ban, có nút Duyệt/Từ chối trên từng dòng.

---

## 7.12 Trang Bảng lương

> **[HÌNH 7.13]** Bảng lương — Route: `/payroll`
>
> Mô tả: Chọn tháng/năm, bảng hiển thị lương từng nhân viên (Họ tên / Ngày công / OT / Gross / BHXH / Thuế / Net), nút "Tính lương tự động", nút xuất Excel.

### Bảng 7.8 — Mô tả giao diện Bảng lương

| Thành phần | Mô tả |
|-----------|-------|
| Bộ chọn tháng/năm | Dropdown hoặc date picker |
| Bảng lương | Sortable, highlight Net bằng màu xanh |
| Nút Tính lương | Trigger tính lại toàn bộ cho tháng chọn |
| Nút Xuất Excel | Export .xlsx bảng lương |

---

## 7.13 Trang Phiếu lương

> **[HÌNH 7.14]** Phiếu lương (Employee) — Route: `/payslips`
>
> Mô tả: Danh sách các kỳ lương (Tháng / Ngày phát / Gross / Net / Ngày công), nút "Xem" mở modal chi tiết, nút tải PDF.

> **[HÌNH 7.15]** Modal chi tiết phiếu lương
>
> Mô tả: Header tên nhân viên + tháng lương, bảng chi tiết đầy đủ (Lương cơ bản, Hệ số, Phụ cấp, OT, Gross; BHXH, BHYT, BHTN, Thuế TNCN; Net thực lĩnh), nút tải PDF.

---

## 7.14 Trang Công tác phí

> **[HÌNH 7.16]** Công tác phí — Route: `/business-trips`
>
> Mô tả: Danh sách đề nghị công tác, nút "Tạo đề nghị" mở form (địa điểm, mục đích, ngày đi/về, chi phí ước tính). HR/Manager có nút Duyệt/Từ chối.

---

## 7.15 Trang Hồ sơ cá nhân

> **[HÌNH 7.17]** Hồ sơ cá nhân — Route: `/profile`
>
> Mô tả: Ảnh đại diện (upload được), thông tin cơ bản (tên, email, SĐT, địa chỉ), tab đổi mật khẩu.

---

## 7.16 Trang Quản lý tài khoản (Admin)

> **[HÌNH 7.18]** Quản lý tài khoản — Route: `/settings/users`
>
> Mô tả: Bảng danh sách tài khoản (Username / Role / Nhân viên liên kết / Trạng thái), nút Tạo tài khoản, Đổi role, Kích hoạt/Vô hiệu hóa.

---

## 7.17 Trang Quản lý hợp đồng

> **[HÌNH 7.19]** Quản lý hợp đồng — Route: `/contracts`
>
> Mô tả: Bảng hợp đồng (Nhân viên / Loại HĐ / Ngày bắt đầu / Ngày kết thúc / Lương cơ bản / Trạng thái). Cảnh báo màu cam cho HĐ sắp hết hạn trong 30 ngày. Nút Gia hạn, Thanh lý.
