# 🔐 DANH SÁCH TÀI KHOẢN DEMO — AXIOM HRM

> **Cập nhật:** 24/04/2026  
> **Tổng:** 64 tài khoản (1 Admin + 63 Nhân viên)  
> **Mật khẩu mặc định:** `123456` (trừ admin và giamdoc)

---

## 🎭 6 TÁC NHÂN (ACTOR) VÀ CHỨC NĂNG TƯƠNG ỨNG

Mỗi vai trò có menu sidebar riêng, dashboard riêng, và chỉ truy cập được những chức năng thuộc phạm vi của mình.

---

### 👑 Actor 1 — Admin (Quản trị viên)
**Tài khoản:** `admin` / `admin` &nbsp;·&nbsp; **Dashboard:** `/dashboard`

Admin có toàn quyền hệ thống. Đây là vai trò duy nhất quản lý tài khoản và phân quyền.

| # | Chức năng | Route | Mô tả |
|---|-----------|-------|-------|
| 1 | 🏠 Trang chủ | `/dashboard` | KPI tổng hợp, truy cập nhanh, sự kiện công ty, biểu đồ phòng ban, **xuất báo cáo Excel** |
| 2 | 👥 Quản lý nhân sự | `/employees` | Xem, thêm, sửa, xóa hồ sơ nhân viên; tìm kiếm, lọc, xuất Excel |
| 3 | 📋 Hợp đồng lao động | `/contracts` | Tạo, gia hạn, theo dõi hợp đồng; cảnh báo hết hạn |
| 4 | 🚀 Quá trình công tác | `/career-history` | Ghi nhận thăng chức, khen thưởng, kỷ luật, điều chuyển |
| 5 | 💰 Cấu hình lương | `/payroll` | Thiết lập bảng lương, tính lương tự động Gross→Net |
| 6 | 🔐 Phân quyền (RBAC) | `/settings/users` | Quản lý tài khoản, đổi vai trò, kích hoạt/vô hiệu hóa |
| 7 | 📊 Thống kê | `/dashboard-director` | Xem KPI tài chính, biểu đồ lương & chấm công toàn công ty, **xuất báo cáo Excel tổng hợp** |

---

### 🏛️ Actor 2 — Director (Giám đốc / Phó Giám đốc)
**Tài khoản:** `giamdoc` / `giamdoc` &nbsp;·&nbsp; **Dashboard:** `/dashboard-director`

Director chỉ có 1 trang duy nhất — dashboard tổng hợp để theo dõi KPI vĩ mô, không thao tác trực tiếp dữ liệu.

| # | Chức năng | Route | Mô tả |
|---|-----------|-------|-------|
| 1 | 📈 Thống kê tổng quan | `/dashboard-director` | KPI: tổng NV, quỹ lương Net, đơn nghỉ chờ, HĐ hết hạn |
| — | — | — | Biểu đồ đường xu hướng lương theo tháng |
| — | — | — | Biểu đồ tròn phân bổ nhân lực theo phòng ban |
| — | — | — | Biểu đồ cột xu hướng chấm công 6 tháng gần nhất |
| — | — | — | Xuất báo cáo Excel tổng hợp |

---

### 👨‍💼 Actor 3 — HRManager (Trưởng phòng Nhân sự)
**Tài khoản:** `tp_nhansu` / `123456` &nbsp;·&nbsp; **Dashboard:** `/dashboard-hr`

HRManager quản lý toàn bộ nghiệp vụ nhân sự: hồ sơ, hợp đồng, chấm công, nghỉ phép, công tác.

| # | Chức năng | Route | Mô tả |
|---|-----------|-------|-------|
| 1 | 📊 Tổng quan HR | `/dashboard-hr` | KPI nhân sự, biểu đồ phòng ban, duyệt nghỉ phép trực tiếp |
| 2 | 👥 Quản lý nhân sự | `/employees` | Xem, thêm, sửa hồ sơ nhân viên; tìm kiếm, lọc, xuất Excel |
| 3 | 📋 Hợp đồng | `/contracts` | Tạo, gia hạn, theo dõi hợp đồng lao động |
| 4 | 🚀 Quá trình công tác | `/career-history` | Ghi nhận thăng chức, điều chuyển, khen thưởng, kỷ luật |
| 5 | ⏰ Quản lý chấm công | `/attendance` | Xem bảng chấm công toàn công ty theo tháng, xuất PDF |
| 6 | 🗓️ Duyệt nghỉ phép | `/leave` | Xem và duyệt / từ chối tất cả đơn nghỉ phép toàn công ty |
| 7 | ✈️ Công tác phí | `/business-trips` | Quản lý đề nghị thanh toán công tác phí nhân viên |

---

### 💰 Actor 4 — Accountant (Kế toán)
**Tài khoản:** `tp_ketoan` / `123456` &nbsp;·&nbsp; **Dashboard:** `/dashboard-accountant`

Accountant tập trung vào nghiệp vụ lương, bảo hiểm và thuế. Không có quyền chỉnh sửa hồ sơ nhân viên.

| # | Chức năng | Route | Mô tả |
|---|-----------|-------|-------|
| 1 | 💰 Tổng quan Kế toán | `/dashboard-accountant` | KPI lương Gross/Net, BH công ty, thuế TNCN; biểu đồ xu hướng |
| 2 | 📑 Bảng lương | `/payroll` | Thiết lập lương cơ bản, phụ cấp; tính lương tự động Gross→Net; tính BH, thuế theo VN 2026 |
| 3 | 🧾 Phiếu lương | `/payslips` | Xem và xuất phiếu lương của tất cả nhân viên mọi tháng |

---

### 🏢 Actor 5 — Manager (Trưởng phòng ban)
**Tài khoản:** `tp_cntt`, `tp_kinhdoanh`, `tp_marketing` / `123456` &nbsp;·&nbsp; **Dashboard:** `/dashboard-manager`

Manager quản lý phạm vi phòng ban của mình: theo dõi chấm công và duyệt nghỉ phép.

| # | Chức năng | Route | Mô tả |
|---|-----------|-------|-------|
| 1 | 🏢 Tổng quan phòng ban | `/dashboard-manager` | KPI phòng: tổng NV, đơn nghỉ, đúng giờ, muộn; biểu đồ chấm công; duyệt đơn nghỉ nhanh |
| 2 | ⏰ Chấm công phòng | `/attendance` | Xem bảng chấm công toàn bộ nhân viên theo tháng, xuất PDF |
| 3 | 🗓️ Duyệt nghỉ phép | `/leave` | Duyệt / từ chối đơn nghỉ phép của nhân viên trong phòng |

---

### 👤 Actor 6 — Employee (Nhân viên)
**Tài khoản:** `nv009` → `nv063` / `123456` &nbsp;·&nbsp; **Dashboard:** `/dashboard-employee`

Nhân viên chỉ xem và thao tác trên dữ liệu cá nhân của mình. Không xem được thông tin người khác.

| # | Chức năng | Route | Mô tả |
|---|-----------|-------|-------|
| 1 | ⏰ Chấm công | `/attendance/check-in` | Check-in / Check-out hàng ngày; xem lịch sử chấm công cá nhân tháng này |
| 2 | 🗓️ Đơn nghỉ phép | `/leave` | Tạo đơn xin nghỉ phép; xem trạng thái đơn (chờ / duyệt / từ chối) |
| 3 | 🧾 Phiếu lương | `/payslips` | Xem phiếu lương cá nhân theo tháng: Gross, phụ cấp, BH, thuế, Net |
| 4 | ✈️ Công tác phí | `/business-trips` | Tạo đề nghị thanh toán công tác phí cho chuyến công tác của mình |
| 5 | 👤 Hồ sơ cá nhân | `/profile` | Xem và cập nhật thông tin: avatar, email, số điện thoại, đổi mật khẩu |

---


### 🏠 Dashboard 1 — Trang chủ Admin (`/dashboard`)
**Actor:** `Admin` (Quản trị viên)  
**Tài khoản:** `admin` / `admin`

Đây là trung tâm điều khiển toàn hệ thống. Giao diện chào hỏi theo thời gian thực (sáng/chiều/tối) kèm tên người dùng.

| Khu vực | Chức năng |
|---------|-----------|
| **KPI Row (4 thẻ)** | Tổng nhân sự đang làm việc • Đơn nghỉ phép chờ duyệt • Hợp đồng sắp hết hạn (30 ngày) • Số nhân viên đang thử việc — tất cả có thể click để chuyển đến trang tương ứng |
| **Quick Access (6 tile)** | Truy cập nhanh: Nhân sự → Hợp đồng → Quá trình công tác → Lương → Phân quyền → Thống kê — mỗi tile có animation hover, icon, mô tả ngắn |
| **Sự kiện công ty** | Danh sách sự kiện (nghỉ lễ, họp tổng kết, đào tạo…) với trạng thái Đang diễn ra / Sắp tới / Đã xong — click để xem modal chi tiết |
| **Biểu đồ tròn** | Phân bổ nhân lực theo phòng ban (dữ liệu thật từ DB, hỗ trợ song ngữ) |
| **Trạng thái hệ thống** | System OK / Data Sync / Security status |
| **Gợi ý** | Tips công việc theo ngữ cảnh |
| **Xuất Excel** | Xuất báo cáo tổng hợp toàn hệ thống (.xlsx) |

---

### 📈 Dashboard 2 — Thống kê tổng quan (`/dashboard-director`)
**Actor:** `Admin` (menu Thống kê) + `Director` (Giám đốc / Phó Giám đốc)  
**Tài khoản:** `admin` / `admin` · `giamdoc` / `giamdoc` · `pgd1`, `pgd2` / `123456`

Dashboard tổng hợp báo cáo tài chính và nhân sự ở cấp công ty. Dành cho ban lãnh đạo theo dõi KPI vĩ mô.

| Khu vực | Chức năng |
|---------|-----------|
| **KPI Row (4 thẻ màu)** | Tổng nhân sự · Quỹ lương Net tháng hiện tại (triệu đồng) · Đơn nghỉ chờ duyệt · Hợp đồng sắp hết hạn |
| **Biểu đồ đường — Xu hướng quỹ lương Net** | Hiển thị lịch sử lương Net theo tháng (dữ liệu thật từ DB Payroll), trục Y đơn vị triệu đồng |
| **Biểu đồ tròn — Phân bổ nhân lực** | Số lượng nhân viên theo phòng ban với nhãn tên và số liệu, hỗ trợ dark mode và song ngữ |
| **Biểu đồ cột nhóm — Xu hướng chấm công 6 tháng** | Thống kê 3 cột: Đi làm đầy đủ / Đi muộn / Vắng mặt theo từng tháng |
| **Quick Stats hàng dưới (5 thẻ nhỏ)** | Tóm tắt: Đơn nghỉ · HĐ hết hạn · Thử việc · Tổng NV · Quỹ lương |
| **Nút Tải lại** | Refresh dữ liệu từ DB theo thời gian thực |
| **Xuất Excel** | Xuất báo cáo tổng hợp dashboard |

---

### 👨‍💼 Dashboard 3 — HR Manager (`/dashboard-hr`)
**Actor:** `HRManager` (Trưởng phòng Nhân sự)  
**Tài khoản:** `tp_nhansu` / `123456`

Dashboard tập trung vào quản lý con người: tuyển dụng, hợp đồng, phúc lợi. Tích hợp duyệt đơn nghỉ phép trực tiếp.

| Khu vực | Chức năng |
|---------|-----------|
| **KPI Row (4 thẻ)** | Tổng nhân viên đang làm · Số người đang thử việc · Đơn nghỉ chờ duyệt · Hợp đồng hết hạn trong 30 ngày |
| **Biểu đồ cột — Nhân lực theo phòng ban** | Bar chart so sánh số nhân viên từng phòng (dữ liệu thật từ DB) |
| **Quick Actions — Use Case** | UC-01 Quản lý NV → UC-02 Hợp đồng → UC-06 Chấm công → UC-05 Duyệt nghỉ phép → UC-03 Quá trình công tác → UC-07 Công tác phí |
| **Bảng đơn nghỉ phép chờ duyệt** | Hiển thị toàn bộ đơn đang chờ: Tên NV · Phòng ban · Loại nghỉ · Từ-Đến · Số ngày — có nút **Duyệt ✅ / Từ chối ❌** tác động thật lên DB |
| **Xuất Excel nhân sự** | Xuất danh sách toàn bộ nhân viên định dạng .xlsx |
| **Toast notification** | Thông báo kết quả duyệt/từ chối hiện ngay sau khi thao tác |

---

### 💰 Dashboard 4 — Kế toán (`/dashboard-accountant`)
**Actor:** `Accountant` (Kế toán trưởng)  
**Tài khoản:** `tp_ketoan` / `123456`

Dashboard chuyên về tài chính lương thưởng, bảo hiểm và thuế thu nhập cá nhân.

| Khu vực | Chức năng |
|---------|-----------|
| **KPI Row (4 thẻ)** | Tổng Gross tháng này · Tổng Net chi trả · BHXH công ty đóng (21.5%) · Tổng thuế TNCN phải nộp |
| **Biểu đồ đường — Xu hướng lương Net** | Lịch sử quỹ lương Net theo từng tháng (đơn vị triệu đồng), tự động tính từ dữ liệu Payroll DB |
| **Bảng khấu trừ bắt buộc** | Chi tiết các khoản: BHXH 8% · BHYT 1.5% · BHTN 1% · Thuế TNCN lũy tiến 5 bậc · Phụ cấp — kèm thông tin nộp cho cơ quan nào |
| **Cảnh báo BHXH** | Nhắc nhở tỷ lệ BHXH NLĐ (10.5%) và NSDLĐ (21.5%) theo TT 59/2015 |
| **Quick Actions — Use Case** | UC-08 Thiết lập công thức lương → UC-09 Tính lương tự động Gross→Net → UC-10 Xuất phiếu lương |
| **Xuất Excel bảng lương** | Xuất bảng lương tháng định dạng .xlsx |

---

### 🏢 Dashboard 5 — Trưởng phòng (`/dashboard-manager`)
**Actor:** `Manager` (Trưởng phòng CNTT / Kinh doanh / Marketing)  
**Tài khoản:** `tp_cntt`, `tp_kinhdoanh`, `tp_marketing` / `123456`

Dashboard cấp phòng ban, tập trung quản lý chấm công và nghỉ phép của nhân viên trong phòng.

| Khu vực | Chức năng |
|---------|-----------|
| **KPI Row (4 thẻ)** | Tổng nhân viên phòng · Đơn nghỉ chờ duyệt · Số ngày đúng giờ tháng này · Số lần đi muộn tháng này |
| **Biểu đồ cột — Chấm công tháng này** | So sánh 3 cột: Đúng giờ / Đi muộn / Tổng ngày (dữ liệu thật từ DB chấm công tháng hiện tại) |
| **Tóm tắt đơn nghỉ chờ duyệt** | Preview 4 đơn nghỉ đầu tiên với nút Duyệt / Từ chối mini |
| **Bảng đơn nghỉ đầy đủ** | Khi có đơn: hiện bảng chi tiết Tên · Loại nghỉ · Từ-Đến · Số ngày · Duyệt/Từ chối (tác động thật lên DB) |
| **Quick Actions — Use Case** | UC-05 Duyệt nghỉ phép → UC-06 Quản lý chấm công → UC-11 Xem Dashboard thống kê |
| **Toast notification** | Thông báo sau khi duyệt / từ chối đơn |

---

### 👤 Dashboard Nhân viên (`/dashboard-employee`)
**Actor:** `Employee` (Nhân viên — tất cả phòng ban)  
**Tài khoản:** `nv009` → `nv063` / `123456`

> ℹ️ Nhân viên không hiển thị dashboard này trong menu sidebar. Trang chính mặc định là Check-in (`/attendance/check-in`). Dashboard `/dashboard-employee` là trang tổng hợp cá nhân có thể truy cập trực tiếp.

| Khu vực | Chức năng |
|---------|-----------|
| **Header cá nhân** | Lời chào tên nhân viên · Chức danh · Tháng hiện tại |
| **KPI Row (4 thẻ)** | Ngày công tháng này · Tỷ lệ đúng giờ (%) · Số ngày phép còn lại · Lương Net tháng này |
| **Chấm công gần đây** | 5 bản ghi chấm công mới nhất: ngày · giờ vào · giờ ra · trạng thái (Đúng giờ / Muộn) |
| **Quỹ nghỉ phép** | Thanh progress bar cho từng loại phép: Nghỉ năm · Nghỉ ốm · Việc riêng… (Còn lại / Tổng) |
| **Form tạo đơn nghỉ** | Chọn loại nghỉ → Ngày bắt đầu → Ngày kết thúc → Lý do → Gửi — tạo đơn thật vào DB, cập nhật danh sách ngay |
| **Chi tiết phiếu lương** | Gross · Phụ cấp · OT · BHXH · BHYT · BHTN · Thuế TNCN → Net thực lĩnh (dữ liệu thật từ Payroll DB) |
| **Đơn nghỉ phép gần đây** | 3 đơn gần nhất với trạng thái: Chờ duyệt / Đã duyệt / Từ chối |
| **Quick Links** | Xem phiếu lương → Tạo đơn nghỉ → Hồ sơ cá nhân |

---

## 👑 ADMIN (1)

| # | Username | Mật khẩu | Role | Dashboard | Ghi chú |
|---|----------|----------|------|-----------|---------| 
| 1 | `admin` | `admin` | Admin | `/dashboard` | Quản trị hệ thống, không gắn nhân viên |

---

## 🏛️ BAN GIÁM ĐỐC (3)

| # | Username | Mật khẩu | Role | Họ tên | Chức vụ | Phòng ban |
|---|----------|----------|------|--------|---------|-----------| 
| 1 | `giamdoc` | `giamdoc` | Director | Nguyễn Văn An (NV001) | Giám đốc | CNTT |
| 2 | `pgd1` | `123456` | Director | Trần Đức Bình (NV002) | Phó Giám đốc | Nhân sự |
| 3 | `pgd2` | `123456` | Director | Lê Thị Chi (NV003) | Phó Giám đốc | Kế toán - TC |

> **Dashboard:** `/dashboard-director` — Thống kê tổng quan toàn công ty

---

## 👨‍💼 TRƯỞNG PHÒNG (5)

| # | Username | Mật khẩu | Role | Họ tên | Chức vụ | Phòng ban |
|---|----------|----------|------|--------|---------|-----------| 
| 1 | `tp_cntt` | `123456` | Manager | NV004 | Trưởng phòng CNTT | Công nghệ TT |
| 2 | `tp_nhansu` | `123456` | HRManager | NV005 | Trưởng phòng Nhân sự | Nhân sự |
| 3 | `tp_ketoan` | `123456` | Accountant | NV006 | Trưởng phòng Kế toán | Kế toán - TC |
| 4 | `tp_kinhdoanh` | `123456` | Manager | NV007 | Trưởng phòng Kinh doanh | Kinh doanh |
| 5 | `tp_marketing` | `123456` | Manager | NV008 | Trưởng phòng Marketing | Marketing |

> **Dashboard:** Manager → `/dashboard-manager` · HRManager → `/dashboard-hr` · Accountant → `/dashboard-accountant`

---

## 👥 NHÂN VIÊN CHÍNH THỨC — Phòng CNTT (10)

| # | Username | Mật khẩu | Mã NV | Chức vụ |
|---|----------|----------|-------|---------|
| 1 | `nv009` | `123456` | NV009 | Lập trình viên |
| 2 | `nv010` | `123456` | NV010 | Lập trình viên |
| 3 | `nv011` | `123456` | NV011 | Lập trình viên |
| 4 | `nv012` | `123456` | NV012 | Lập trình viên |
| 5 | `nv013` | `123456` | NV013 | Kỹ sư DevOps |
| 6 | `nv014` | `123456` | NV014 | Kỹ sư DevOps |
| 7 | `nv015` | `123456` | NV015 | Tester / QA |
| 8 | `nv016` | `123456` | NV016 | Tester / QA |
| 9 | `nv017` | `123456` | NV017 | Lập trình viên |
| 10 | `nv018` | `123456` | NV018 | Lập trình viên |

---

## 👥 NHÂN VIÊN CHÍNH THỨC — Phòng Nhân sự (10)

| # | Username | Mật khẩu | Mã NV | Chức vụ |
|---|----------|----------|-------|---------|
| 1 | `nv019` | `123456` | NV019 | Chuyên viên nhân sự |
| 2 | `nv020` | `123456` | NV020 | Chuyên viên nhân sự |
| 3 | `nv021` | `123456` | NV021 | Chuyên viên nhân sự |
| 4 | `nv022` | `123456` | NV022 | Chuyên viên tuyển dụng |
| 5 | `nv023` | `123456` | NV023 | Chuyên viên tuyển dụng |
| 6 | `nv024` | `123456` | NV024 | Chuyên viên nhân sự |
| 7 | `nv025` | `123456` | NV025 | Chuyên viên nhân sự |
| 8 | `nv026` | `123456` | NV026 | Chuyên viên tuyển dụng |
| 9 | `nv027` | `123456` | NV027 | Chuyên viên nhân sự |
| 10 | `nv028` | `123456` | NV028 | Chuyên viên nhân sự |

---

## 👥 NHÂN VIÊN CHÍNH THỨC — Phòng Kế toán - Tài chính (10)

| # | Username | Mật khẩu | Mã NV | Chức vụ |
|---|----------|----------|-------|---------|
| 1 | `nv029` | `123456` | NV029 | Kế toán viên |
| 2 | `nv030` | `123456` | NV030 | Kế toán viên |
| 3 | `nv031` | `123456` | NV031 | Kế toán viên |
| 4 | `nv032` | `123456` | NV032 | Kế toán viên |
| 5 | `nv033` | `123456` | NV033 | Chuyên viên thuế |
| 6 | `nv034` | `123456` | NV034 | Chuyên viên thuế |
| 7 | `nv035` | `123456` | NV035 | Kế toán viên |
| 8 | `nv036` | `123456` | NV036 | Kế toán viên |
| 9 | `nv037` | `123456` | NV037 | Chuyên viên thuế |
| 10 | `nv038` | `123456` | NV038 | Kế toán viên |

---

## 👥 NHÂN VIÊN CHÍNH THỨC — Phòng Kinh doanh (10)

| # | Username | Mật khẩu | Mã NV | Chức vụ |
|---|----------|----------|-------|---------|
| 1 | `nv039` | `123456` | NV039 | Nhân viên kinh doanh |
| 2 | `nv040` | `123456` | NV040 | Nhân viên kinh doanh |
| 3 | `nv041` | `123456` | NV041 | Nhân viên kinh doanh |
| 4 | `nv042` | `123456` | NV042 | Nhân viên kinh doanh |
| 5 | `nv043` | `123456` | NV043 | Nhân viên kinh doanh |
| 6 | `nv044` | `123456` | NV044 | Chuyên viên CSKH |
| 7 | `nv045` | `123456` | NV045 | Chuyên viên CSKH |
| 8 | `nv046` | `123456` | NV046 | Nhân viên kinh doanh |
| 9 | `nv047` | `123456` | NV047 | Nhân viên kinh doanh |
| 10 | `nv048` | `123456` | NV048 | Chuyên viên CSKH |

---

## 👥 NHÂN VIÊN CHÍNH THỨC — Phòng Marketing (10)

| # | Username | Mật khẩu | Mã NV | Chức vụ |
|---|----------|----------|-------|---------|
| 1 | `nv049` | `123456` | NV049 | Chuyên viên Marketing |
| 2 | `nv050` | `123456` | NV050 | Chuyên viên Marketing |
| 3 | `nv051` | `123456` | NV051 | Chuyên viên Marketing |
| 4 | `nv052` | `123456` | NV052 | Thiết kế đồ họa |
| 5 | `nv053` | `123456` | NV053 | Thiết kế đồ họa |
| 6 | `nv054` | `123456` | NV054 | Chuyên viên Marketing |
| 7 | `nv055` | `123456` | NV055 | Chuyên viên Marketing |
| 8 | `nv056` | `123456` | NV056 | Thiết kế đồ họa |
| 9 | `nv057` | `123456` | NV057 | Chuyên viên Marketing |
| 10 | `nv058` | `123456` | NV058 | Chuyên viên Marketing |

---

## 🧑‍🎓 NHÂN VIÊN THỬ VIỆC (5 — mỗi phòng 1 người)

| # | Username | Mật khẩu | Mã NV | Phòng ban | Chức vụ |
|---|----------|----------|-------|-----------|---------|
| 1 | `nv059` | `123456` | NV059 | Công nghệ TT | Thực tập sinh |
| 2 | `nv060` | `123456` | NV060 | Nhân sự | Thực tập sinh |
| 3 | `nv061` | `123456` | NV061 | Kế toán - TC | Thực tập sinh |
| 4 | `nv062` | `123456` | NV062 | Kinh doanh | Thực tập sinh |
| 5 | `nv063` | `123456` | NV063 | Marketing | Thực tập sinh |

> **Dashboard:** `/dashboard-employee`  
> **Trạng thái:** Thử việc · Hợp đồng kết thúc 31/05/2026

---

## 📊 TỔNG KẾT

| Nhóm | Số lượng | Username | Mật khẩu |
|------|----------|----------|----------|
| Admin | 1 | `admin` | `admin` |
| Giám đốc | 1 | `giamdoc` | `giamdoc` |
| Phó Giám đốc | 2 | `pgd1`, `pgd2` | `123456` |
| Trưởng phòng | 5 | `tp_cntt`, `tp_nhansu`, `tp_ketoan`, `tp_kinhdoanh`, `tp_marketing` | `123456` |
| NV chính thức | 50 | `nv009` → `nv058` | `123456` |
| NV thử việc | 5 | `nv059` → `nv063` | `123456` |
| **Tổng** | **64** | | |

---

## 🔑 6 TÀI KHOẢN THỬ NHANH (1 / role)

> Copy-paste nhanh để test từng role:

| Role | Username | Mật khẩu | Dashboard | Mô tả nhanh |
|------|----------|----------|-----------| ------------|
| **Admin** | `admin` | `admin` | `/dashboard` | Trang chủ + điều phối toàn hệ thống |
| **Director** | `giamdoc` | `giamdoc` | `/dashboard-director` | Thống kê KPI, lương, chấm công toàn công ty |
| **HRManager** | `nhansu` | `nhansu` | `/dashboard-hr` | Quản lý nhân sự, duyệt nghỉ phép, biểu đồ phòng ban |
| **Accountant** | `ketoan` | `ketoan` | `/dashboard-accountant` | Quỹ lương, BH, thuế TNCN, xuất Excel |
| **Manager** | `quanly` | `quanly` | `/dashboard-manager` | Chấm công phòng, duyệt nghỉ phép phòng |
| **Employee** | `nhanvien` | `nhanvien` | `/dashboard-employee` | Phiếu lương, phép, chấm công cá nhân |
