# CHƯƠNG 7. THIẾT KẾ GIAO DIỆN

## 7.1 Tài liệu thiết kế

### 7.1.1 Design System

Axiom HRM được xây dựng trên một hệ thống thiết kế (Design System) thống nhất nhằm đảm bảo tính nhất quán về màu sắc, typography, spacing và các thành phần UI trên toàn bộ ứng dụng. Design System bao gồm hai phần chính: **Bảng màu (Color Palette)** và **Bộ thành phần UI (UI Components)**.

| Thành phần | Giá trị |
|-----------|---------|
| **Phiên bản** | Axiom HRM v2.0 |
| **Màu chủ đạo** | #D9211C (Primary Red) |
| **Font chữ** | Inter, system-ui, sans-serif |
| **Border radius** | 8px (card, input), 20px (badge, pill) |
| **Chế độ** | Light Mode + Dark Mode (toggle real-time) |
| **Ngôn ngữ** | Tiếng Việt (mặc định) + Tiếng Anh |
| **Responsive** | Mobile (320px+), Tablet (768px+), Desktop (1280px+) |

---

### Bảng 7.1 — Bảng màu hệ thống (Color Palette)

> **[HÌNH 7.1]** Color Palette — Axiom HRM Design System v1.0
>
> Mô tả: Bảng màu chính thức gồm 7 màu nền tảng với hex code và hướng dẫn sử dụng, kèm thang màu tint 5 mức (100%→20%) cho màu Primary Red.

| Token | Màu | Hex | Ứng dụng |
|-------|-----|-----|-----------|
| **Primary Red** | 🔴 | `#D9211C` | Sidebar, nút chính (Filled·Primary), logo Axiom, accent toàn hệ thống |
| **Success** | 🟢 | `#168961` | Nút duyệt (Filled·Success), badge "Đang làm", badge "Đã duyệt", lương Net |
| **Warning** | 🟡 | `#F59E0B` | Badge "Chờ duyệt", cảnh báo hợp đồng sắp hết hạn, trạng thái Pending |
| **Error** | 🔴 | `#EF4444` | Nút từ chối (Outline·Danger), badge "Từ chối", thông báo lỗi |
| **Info** | 🔵 | `#3B82F6` | Link, nút chỉnh sửa, thông tin bổ sung |
| **Dark** | ⚫ | `#0F172A` | Nền dark mode, text heading H1 |
| **Light** | ⚪ | `#F8FAFC` | Nền light mode, background card |

**Thang màu Primary Red (Tint Scale):**

| Mức | Hex tương đương | Ứng dụng |
|-----|----------------|----------|
| 100% | `#D9211C` | Màu gốc — sidebar, nút chính |
| 80% | ~`#E04D4A` | Hover state của nút primary |
| 60% | ~`#E87876` | Active state, highlight |
| 40% | ~`#F0A4A2` | Nền badge trạng thái nhạt |
| 20% | ~`#F8D1D1` | Nền highlight row, tooltip |

---

### Bảng 7.2 — Bộ thành phần UI (UI Components)

> **[HÌNH 7.2]** Design System — Axiom HRM UI Components Reference
>
> Mô tả: Tài liệu tham chiếu thành phần UI gồm 4 nhóm: Typography (H1/H2/Body/Caption), Buttons (Filled/Outline/Ghost), Status Badges (6 trạng thái), và Inputs (Text Input/Dropdown/Toggle).

#### Typography

| Cấp | Kích thước | Độ đậm | Màu | Ứng dụng |
|-----|-----------|--------|-----|----------|
| **H1** | 24px | Bold | `#0F172A` | Tiêu đề trang (Dashboard Nhân sự) |
| **H2** | 18px | SemiBold | `#1E3B5B` | Tiêu đề section (Quản lý nhân viên) |
| **Body** | 14px | Regular | `#4738BB` | Nội dung chính (Dữ liệu cập nhật theo thời gian thực) |
| **Caption** | 12px | Regular | `#94A3BB` | Ghi chú, metadata, ngày tháng |

#### Buttons

| Variant | Màu nền | Ví dụ | Ứng dụng |
|---------|---------|-------|----------|
| **Filled · Primary** | `#D9211C` | Đăng nhập | Hành động chính, submit form |
| **Filled · Success** | `#168961` | Phê duyệt | Xác nhận, duyệt đơn |
| **Outline · Danger** | Viền `#EF4444` | Từ chối | Hủy, từ chối, xóa |
| **Ghost · Text link** | Trong suốt | Xem chi tiết | Điều hướng phụ, link |

*Mỗi button có 4 state: Default · Hover · Active · Disabled*

#### Status Badges

| Badge | Màu | Trạng thái tương ứng |
|-------|-----|----------------------|
| 🟢 **Đang làm** | Xanh lá (Success) | Active — Confirmed (nhân viên đang làm việc / đơn đã duyệt) |
| 🔵 **Thử việc** | Xanh dương | Probation — In progress |
| 🟡 **Chờ duyệt** | Vàng (Warning) | Pending — Awaiting review |
| 🟣 **Đã duyệt** | Tím | Approved |
| 🔴 **Từ chối** | Đỏ (Error) | Rejected — Action required |
| ⚫ **Đã nghỉ** | Xám | Inactive |

#### Inputs

| Thành phần | Đặc tả |
|-----------|--------|
| **Text Input** | Border `#E2EBF0`, focus border `#D0211C`, border-radius 8px, placeholder mờ |
| **Dropdown Select** | Custom chevron icon, cùng focus ring với text input, border-radius 8px |
| **Toggle Switch** | ON color `#D0211C`, OFF color `#E2EBF0`, thumb shadow, label trạng thái |

---

### Bảng 7.3 — Quy ước giao diện chung

| Thành phần | Mô tả |
|-----------|-------|
| **Sidebar** | Floating panel bo tròn (20px), mặc định 64px (icon only), hover mở rộng 220px (smooth transition) |
| **Header** | Đồng hồ thời gian thực, logo Axiom dạng pill đỏ, toggle ngôn ngữ, dark mode, avatar người dùng |
| **Toast** | Thông báo góc phải dưới, tự biến mất sau 3.5s, màu theo loại (success/error/warning) |
| **Table** | Phân trang (Pagination), mỗi trang 10–20 dòng, có sort và filter |
| **Modal** | Overlay bán trong suốt, đóng bằng nút X hoặc click ra ngoài, animation slide-in |
| **Badge** | Bo tròn (pill), màu nền nhạt + text đậm theo trạng thái, không viền |

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

### Bảng 7.X1 — Mô tả giao diện Dashboard HR Manager

| Thành phần | Mô tả |
|-----------|-------|
| KPI Row | 4 thẻ: Tổng nhân viên, Đơn nghỉ chờ, HĐ sắp hết hạn, Thử việc |
| Biểu đồ cột | Nhân lực theo phòng ban (BarChart, Recharts) |
| Quick Action | 6 tile: Thêm nhân viên, Duyệt nghỉ phép, Chấm công, HĐ, Phiếu lương, Báo cáo |
| Bảng đơn nghỉ | Danh sách đơn chờ duyệt, nút Duyệt/Từ chối tác động thật vào DB |
| Nút Xuất PDF | Xuất báo cáo chấm công tháng |

---

## 7.6 Dashboard Accountant

> **[HÌNH 7.5]** Dashboard Accountant — Route: `/dashboard-accountant`
>
> Mô tả: 4 thẻ KPI tài chính (Gross / Net / BHXH / Thuế), biểu đồ đường lương Net, bảng chi tiết các khoản khấu trừ bắt buộc (BHXH/BHYT/BHTN/Thuế), 3 quick action tiles.

### Bảng 7.X2 — Mô tả giao diện Dashboard Accountant

| Thành phần | Mô tả |
|-----------|-------|
| KPI Row | 4 thẻ: Tổng Gross, Tổng Net, Tổng BHXH, Tổng Thuế TNCN tháng này |
| Biểu đồ đường | Xu hướng tổng Net 6 tháng gần nhất (LineChart) |
| Bảng khấu trừ | Chi tiết BHXH(8%), BHYT(1.5%), BHTN(1%), Thuế TNCN theo luỹ tiến |
| Quick Action | 3 tile: Tính lương, Xem phiếu lương, Cấu hình tham số |
| Nút Xuất Excel | Xuất báo cáo tài chính tháng |

---

## 7.7 Dashboard Manager

> **[HÌNH 7.6]** Dashboard Manager (Trưởng phòng) — Route: `/dashboard-manager`
>
> Mô tả: 4 thẻ KPI phòng ban, biểu đồ cột chấm công tháng này, danh sách đơn nghỉ phép phòng chờ duyệt.

### Bảng 7.X3 — Mô tả giao diện Dashboard Manager (Trưởng phòng)

| Thành phần | Mô tả |
|-----------|-------|
| KPI Row | 4 thẻ: Nhân viên trong phòng, Đơn nghỉ chờ duyệt, Đi muộn tháng này, HĐ sắp hết hạn |
| Biểu đồ cột | Chấm công phòng ban tháng hiện tại (Đi làm / Đi muộn / Vắng) |
| Bảng đơn nghỉ | Đơn nghỉ phép của nhân viên phòng mình, nút Duyệt/Từ chối |
| Phạm vi dữ liệu | Chỉ hiển thị nhân viên thuộc phòng ban của Manager (data-level filter) |

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
