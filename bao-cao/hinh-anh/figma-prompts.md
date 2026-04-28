# Figma AI Prompts — Thiết kế giao diện Axiom HRM

> **Hướng dẫn:** Copy từng prompt bên dưới → paste vào Figma AI (Make Design) → chỉnh sửa thêm nếu cần.
> 
> **Design System chung cho tất cả:**
> - Font: Inter
> - Primary: #D0211C | Success: #10B981 | Warning: #F59E0B | Error: #EF4444 | Info: #3B82F6
> - Light bg: #F8FAFC | Dark bg: #0F172A
> - Border radius: 8px cards, 20px badges
> - Desktop: 1440×900

---

## Hình 7.1 — Màn hình Đăng nhập

```
Design a modern login page for "Axiom HRM" system.

Layout: Centered card on a dark gradient background (#0F172A to #1E293B).

Card content (white, rounded 12px, shadow-xl):
- Top: Red logo/icon with text "AXIOM" in bold (#D0211C)
- Title: "Đăng nhập hệ thống" in gray
- Input 1: Username field with user icon, placeholder "Tên đăng nhập"
- Input 2: Password field with lock icon, placeholder "Mật khẩu", eye toggle button
- Button: Full-width red button (#D0211C) with text "Đăng nhập", rounded 8px
- Link below: "Quên mật khẩu?" in blue (#3B82F6)

Style: Clean, minimal, professional. Font: Inter. Desktop 1440×900.
```

---

## Hình 7.2 — Dashboard Admin

```
Design an admin dashboard for "Axiom HRM" system.

Left sidebar (dark #0F172A, 260px wide):
- Logo "AXIOM" in red (#D0211C) at top
- Menu items with icons: Dashboard (active, red bg), Nhân viên, Hợp đồng, Chấm công, Nghỉ phép, Lương, Phiếu lương, Công tác phí, Quá trình CT, Cài đặt
- Bottom: avatar + user name

Top header bar (white bg):
- Left: "Chào buổi sáng, Admin 👋"
- Right: real-time clock, language toggle (VI/EN), dark mode toggle, notification bell, avatar

Main content (light gray bg #F8FAFC):
- Row of 4 KPI cards with gradient backgrounds:
  Card 1: "Tổng nhân sự" → 45 (blue gradient)
  Card 2: "Đơn nghỉ chờ duyệt" → 3 (amber gradient)
  Card 3: "HĐ sắp hết hạn" → 2 (red gradient)
  Card 4: "Thử việc" → 5 (green gradient)
- 6 quick-access tiles (2 rows × 3) with icons: Quản lý NV, Chấm công, Nghỉ phép, Tính lương, Hợp đồng, Tài khoản
- Bottom: Pie chart "Phân bổ nhân lực theo phòng ban" using Recharts style

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.3 — Dashboard Director

```
Design a director/executive dashboard for "Axiom HRM".

Same sidebar and header as admin dashboard.

Main content:
- 4 KPI cards: Tổng NV (45), Quỹ lương Net (850M VND), Đơn nghỉ chờ (3), HĐ hết hạn (2)
- Large line chart: "Xu hướng quỹ lương" showing 6-month trend (Gross vs Net lines, red and green)
- Row with 2 charts:
  Left: Pie chart "Nhân lực theo phòng ban" (5 departments, colorful)
  Right: Stacked bar chart "Chấm công 6 tháng" (Đi làm green, Đi muộn amber, Vắng red)
- Bottom row: 5 small stat cards (Nhân viên mới tháng, Tổng OT, Tỉ lệ chấm công, Tổng thuế TNCN, BHXH)
- Top right buttons: "Xuất PDF" red, "Tải lại" outline

Font: Inter. Desktop 1440×900. Clean data visualization style.
```

---

## Hình 7.4 — Dashboard HR Manager

```
Design an HR Manager dashboard for "Axiom HRM".

Same sidebar (current: Dashboard HR active).

Main content:
- 4 KPI cards: Tổng NV (45), NV mới tháng (3), Đơn nghỉ chờ (5), HĐ sắp hết hạn (2)
- Bar chart: "Nhân lực theo phòng ban" horizontal bars
- 6 quick action tiles: Thêm NV, Duyệt nghỉ phép, Tạo HĐ, Chấm công, Công tác phí, Quá trình CT
- Table: "Đơn nghỉ phép chờ duyệt" with columns: NV, Loại, Từ ngày, Đến ngày, Số ngày, and action buttons (green Duyệt, red Từ chối)

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.5 — Dashboard Accountant

```
Design an accountant dashboard for "Axiom HRM".

Same sidebar (current: Dashboard Kế toán active).

Main content:
- 4 KPI cards with financial data:
  Gross: 1.2B VND (blue), Net: 850M VND (green), BHXH: 120M VND (amber), Thuế TNCN: 45M VND (red)
- Line chart: "Lương Net theo tháng" 6-month trend
- Table: "Chi tiết khấu trừ bắt buộc" with columns: Khoản, Tỉ lệ, Tổng tiền
  Rows: BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN (lũy tiến)
- 3 quick action tiles: Tính lương, Cấu hình tham số, Xuất bảng lương

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.6 — Dashboard Manager (Trưởng phòng)

```
Design a department manager dashboard for "Axiom HRM".

Same sidebar (current: Dashboard Manager active).

Main content:
- 4 KPI cards: NV phòng ban (12), Đi làm hôm nay (10), Đơn nghỉ chờ (2), Tổng OT tháng (15h)
- Bar chart: "Chấm công tháng này" daily attendance of department employees
- Table: "Đơn nghỉ phép phòng chờ duyệt" with action buttons

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.7 — Danh sách nhân viên

```
Design an employee list page for "Axiom HRM".

Same sidebar (current: Nhân viên active).

Main content:
- Title: "Quản lý nhân viên"
- Top bar: Search input (placeholder "Tìm kiếm theo tên, mã NV..."), dropdown filter "Phòng ban", green button "+ Thêm nhân viên"
- Table with columns: Avatar (circle), Mã NV, Họ tên, Phòng ban, Vị trí, Trạng thái (badge: green "Đang làm", blue "Thử việc", gray "Đã nghỉ"), Ngày vào
- Action column: Edit icon (blue), Delete icon (red)
- Bottom: Pagination (Trang 1/3, Previous/Next buttons)
- Show 8-10 sample rows with Vietnamese names

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.8 — Chi tiết nhân viên

```
Design an employee detail page for "Axiom HRM".

Same sidebar.

Main content - 2 column layout:
- Left column (30%): Large avatar circle, employee name bold, badge "Đang làm" green, department, position
- Right column (70%): Tab navigation (Thông tin cá nhân | Hợp đồng | Lịch sử công tác | Chấm công)
  Active tab "Thông tin cá nhân" shows form fields:
  Mã NV, Họ tên, Giới tính, Ngày sinh, Email, Số điện thoại, Địa chỉ, Mã số thuế, Số người phụ thuộc
  Bottom: blue "Lưu thay đổi" button

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.9 — Trang Check-in GPS

```
Design a GPS check-in page for "Axiom HRM" attendance system.

Same sidebar (current: Chấm công active).

Main content - centered card:
- Large real-time clock display (HH:MM:SS) in bold
- Date below: "Thứ Hai, 27/04/2026"
- GPS status badge: green pill "📍 Trong khu vực" (or red "📍 Ngoài khu vực ~750m")
- Large circular CHECK-IN button (green #10B981, 120px), or CHECK-OUT button (red) if already checked in
- Timer below: "Thời gian làm việc: 04:32:15"
- Table: "Lịch sử gần đây" with 7 rows showing: Ngày, Giờ vào, Giờ ra, Tổng giờ, Trạng thái (badge: green "Đúng giờ", amber "Đi muộn")

Font: Inter. Desktop 1440×900. Clean, centered layout.
```

---

## Hình 7.10 — Bảng chấm công tổng hợp

```
Design an attendance report page for "Axiom HRM".

Same sidebar.

Main content:
- Title: "Bảng chấm công tổng hợp"
- Filter bar: Month/Year dropdown, Department dropdown, "Xuất PDF" red button
- Table with columns: Nhân viên, Phòng ban, Ngày, Giờ vào, Giờ ra, Tổng giờ, Phút muộn, OT, Trạng thái
- Status badges: green "Đúng giờ", amber "Đi muộn", red "Vắng mặt"
- Pagination at bottom

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.11 — Nghỉ phép (Employee view)

```
Design a leave request page for employee in "Axiom HRM".

Same sidebar (current: Nghỉ phép active).

Main content:
- 4 stat cards: Tổng đơn (8), Chờ duyệt (2, amber), Đã duyệt (5, green), Từ chối (1, red)
- Green button "+ Tạo đơn nghỉ phép"
- Table: personal leave requests with columns: Loại nghỉ, Từ ngày, Đến ngày, Số ngày, Lý do, Trạng thái (badge)
- Status badges: amber "Chờ duyệt", green "Đã duyệt", red "Từ chối"

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.12 — Nghỉ phép (HR/Manager view)

```
Design a leave approval page for HR/Manager in "Axiom HRM".

Same as employee leave page but:
- Shows ALL employees' leave requests (not just personal)
- Additional columns: Nhân viên, Phòng ban
- Action column: green "Duyệt" button and red "Từ chối" button for pending requests
- Filter: dropdown by department, status filter

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.13 — Bảng lương

```
Design a payroll page for "Axiom HRM".

Same sidebar (current: Lương active).

Main content:
- Title: "Bảng lương"
- Top bar: Month/Year selector, blue button "Tính lương tự động", green button "Xuất Excel"
- Table with columns: Mã NV, Họ tên, Ngày công, OT (giờ), Gross (VND), BHXH, BHYT, BHTN, Thuế TNCN, Net (highlighted green bold)
- Numbers formatted with comma separators (e.g., 15,200,000)
- Pagination at bottom

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.14 — Phiếu lương (Employee)

```
Design a payslip list page for employee in "Axiom HRM".

Same sidebar (current: Phiếu lương active).

Main content:
- Title: "Phiếu lương của tôi"
- Table: Kỳ lương (Tháng 4/2026), Ngày phát, Gross, Net (green bold), Ngày công
- Action: blue "Xem" button, red "Tải PDF" button per row

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.15 — Modal chi tiết phiếu lương

```
Design a payslip detail modal overlay for "Axiom HRM".

Background: semi-transparent dark overlay.

Modal (white, rounded 12px, max-width 600px, centered):
- Header: "Phiếu lương tháng 4/2026" + employee name, close X button
- Section "Thu nhập":
  Lương cơ bản: 15,000,000
  Hệ số lương: 1.2
  Phụ cấp: 2,000,000
  Lương OT: 500,000
  **Tổng Gross: 20,500,000** (bold)
- Section "Khấu trừ" (red accent):
  BHXH (8%): 1,200,000
  BHYT (1.5%): 225,000
  BHTN (1%): 150,000
  Thuế TNCN: 850,000
  **Tổng khấu trừ: 2,425,000**
- Section "Thực lĩnh" (green #10B981, large bold):
  **Net: 18,075,000 VND**
- Bottom: red button "Tải PDF"

Font: Inter. Desktop modal.
```

---

## Hình 7.16 — Công tác phí

```
Design a business trip management page for "Axiom HRM".

Same sidebar (current: Công tác phí active).

Main content:
- Title: "Quản lý công tác phí"
- Green button "+ Tạo đề nghị"
- Table: Địa điểm, Mục đích, Ngày đi, Ngày về, Phụ cấp (VND), Trạng thái (badge)
- HR view: action buttons Duyệt/Từ chối for pending items

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.17 — Hồ sơ cá nhân

```
Design a personal profile page for "Axiom HRM".

Same sidebar (current: Hồ sơ active).

Main content:
- Left: Large avatar (upload button), name, role badge, employee code
- Right: Form fields in card:
  Họ tên, Email, Số điện thoại, Ngày sinh, Giới tính, Địa chỉ
  Blue "Lưu thay đổi" button
- Below: "Đổi mật khẩu" section:
  Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới
  Red "Đổi mật khẩu" button

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.18 — Quản lý tài khoản (Admin)

```
Design a user account management page for admin in "Axiom HRM".

Same sidebar (current: Cài đặt > Tài khoản active).

Main content:
- Title: "Quản lý tài khoản hệ thống"
- Green button "+ Tạo tài khoản"
- Table: Username, Role (badge: red Admin, blue HRManager, green Employee, purple Director, amber Accountant), Nhân viên liên kết, Trạng thái (toggle switch active/inactive)
- Action: Đổi role dropdown, Reset MK button, Delete button

Font: Inter. Desktop 1440×900.
```

---

## Hình 7.19 — Quản lý hợp đồng

```
Design a contract management page for "Axiom HRM".

Same sidebar (current: Hợp đồng active).

Main content:
- Title: "Quản lý hợp đồng lao động"
- Green button "+ Tạo hợp đồng"
- Table: Nhân viên, Loại HĐ (badge), Ngày bắt đầu, Ngày kết thúc, Lương cơ bản (VND), Hệ số, Trạng thái
- Status badges: green "Hiệu lực", gray "Hết hạn", red "Đã thanh lý"
- Warning row highlight (amber bg) for contracts expiring within 30 days
- Action: blue "Gia hạn" button, red "Thanh lý" button

Font: Inter. Desktop 1440×900.
```
