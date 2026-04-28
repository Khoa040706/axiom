# CHƯƠNG 9. TÀI LIỆU HƯỚNG DẪN SỬ DỤNG

## 9.1 Một số điều cơ bản cần biết

### Yêu cầu hệ thống

| Thành phần | Yêu cầu tối thiểu |
|-----------|------------------|
| **Trình duyệt** | Chrome 90+, Edge 90+, Firefox 88+, Safari 14+ |
| **Kết nối** | Internet hoặc mạng LAN nội bộ |
| **GPS (Check-in)** | Thiết bị có GPS, trình duyệt trên HTTPS |
| **Màn hình** | Tối thiểu 320px (hỗ trợ mobile) |

### Đăng nhập hệ thống

1. Mở trình duyệt và truy cập địa chỉ hệ thống
2. Nhập **tên đăng nhập** và **mật khẩu**
3. Nhấn nút **Đăng nhập** hoặc Enter
4. Hệ thống tự động chuyển đến Dashboard phù hợp với vai trò

> **[HÌNH 9.1]** Màn hình đăng nhập — Nhập thông tin và nhấn nút Đăng nhập

### Thay đổi ngôn ngữ và giao diện

- **Ngôn ngữ:** Nhấn cờ 🇻🇳 / 🇺🇸 trên thanh header để chuyển Tiếng Việt / Tiếng Anh
- **Dark Mode:** Nhấn icon 🌙 / ☀️ để chuyển chế độ tối / sáng

---

## 9.2 Hướng dẫn theo vai trò

---

### 👑 9.2.1 Admin — Quản trị viên

**Tài khoản:** `admin` / `admin`  
**Dashboard:** `/dashboard`

#### Quản lý nhân viên

1. Vào menu **Quản lý nhân sự** → `/employees`
2. **Thêm nhân viên:** Nhấn nút **+ Thêm mới** → Điền đầy đủ thông tin → **Lưu**
3. **Sửa thông tin:** Nhấn icon ✏️ bên cạnh nhân viên → Chỉnh sửa → **Cập nhật**
4. **Xóa nhân viên:** Nhấn icon 🗑️ → Xác nhận xóa

> **[HÌNH 9.2]** Danh sách nhân viên với các nút thao tác

#### Quản lý tài khoản & Phân quyền

1. Vào menu **Phân quyền (RBAC)** → `/settings/users`
2. **Tạo tài khoản:** Nhấn **+ Tạo tài khoản** → Nhập username, mật khẩu, chọn role, liên kết nhân viên
3. **Đổi role:** Nhấn nút role bên cạnh tài khoản → Chọn role mới
4. **Vô hiệu hóa:** Toggle **Kích hoạt** sang OFF

> **[HÌNH 9.3]** Trang quản lý tài khoản và phân quyền

#### Xem thống kê tổng hợp

1. Vào menu **Thống kê** → `/dashboard-director`
2. Xem các biểu đồ: xu hướng lương, phân bổ nhân lực, chấm công 6 tháng
3. Nhấn **Xuất Excel** để tải báo cáo

---

### 🏛️ 9.2.2 Director — Giám đốc / Phó Giám đốc

**Tài khoản:** `giamdoc` / `giamdoc`  
**Dashboard:** `/dashboard-director`

#### Xem KPI tổng quan

Trang dashboard hiển thị tự động các chỉ số:
- **Tổng nhân sự** đang làm việc
- **Quỹ lương Net** tháng hiện tại
- **Đơn nghỉ chờ** duyệt toàn công ty
- **Hợp đồng** sắp hết hạn

> **[HÌNH 9.4]** Dashboard Director — 4 thẻ KPI và biểu đồ xu hướng lương

#### Xuất báo cáo

1. Nhấn nút **Xuất Excel** ở góc phải trên
2. File `.xlsx` tự động tải về với dữ liệu tổng hợp tháng hiện tại

---

### 👨‍💼 9.2.3 HRManager — Trưởng phòng Nhân sự

**Tài khoản:** `tp_nhansu` / `123456`  
**Dashboard:** `/dashboard-hr`

#### Quản lý hồ sơ nhân viên

Tương tự Admin — xem mục 9.2.1

#### Quản lý hợp đồng lao động

1. Vào **Hợp đồng** → `/contracts`
2. Xem danh sách hợp đồng, cảnh báo màu cam cho HĐ sắp hết hạn
3. **Tạo hợp đồng:** Nhấn **+ Tạo hợp đồng** → Chọn nhân viên, loại HĐ, lương, phụ cấp → **Lưu**
4. **Gia hạn:** Nhấn **Gia hạn** → Điền ngày kết thúc mới

> **[HÌNH 9.5]** Trang quản lý hợp đồng lao động

#### Quản lý chấm công

1. Vào **Quản lý chấm công** → `/attendance`
2. Chọn **tháng/năm** muốn xem
3. (Tùy chọn) Lọc theo **phòng ban**
4. Nhấn **Xuất PDF** để tải báo cáo chấm công

> **[HÌNH 9.6]** Bảng chấm công tổng hợp tháng

#### Duyệt đơn nghỉ phép

1. Vào **Duyệt nghỉ phép** → `/leave`
2. Xem danh sách đơn **Chờ duyệt**
3. Nhấn **✅ Duyệt** để phê duyệt hoặc **❌ Từ chối** để từ chối
4. Hệ thống cập nhật trạng thái ngay lập tức

> **[HÌNH 9.7]** Danh sách đơn nghỉ phép chờ duyệt với nút Duyệt/Từ chối

---

### 💰 9.2.4 Accountant — Kế toán

**Tài khoản:** `tp_ketoan` / `123456`  
**Dashboard:** `/dashboard-accountant`

#### Tính lương tự động

1. Vào **Bảng lương** → `/payroll`
2. Chọn **tháng** và **năm** cần tính
3. Nhấn nút **Tính lương tự động**
4. Hệ thống sẽ:
   - Tổng hợp ngày công từ bảng chấm công
   - Tính Gross = Lương cơ bản × Hệ số + Phụ cấp + OT
   - Tính BHXH (8%), BHYT (1.5%), BHTN (1%)
   - Tính Thuế TNCN theo biểu lũy tiến
   - Tính Net = Gross - các khoản khấu trừ
5. Kết quả hiển thị ngay trong bảng, nhấn **Xuất Excel** để lưu

> **[HÌNH 9.8]** Bảng lương sau khi tính, hiển thị đầy đủ Gross/Net/Khấu trừ

#### Phát hành phiếu lương

1. Sau khi tính lương, vào **Phiếu lương** → `/payslips`
2. Chọn tháng muốn xem
3. Mỗi nhân viên có 1 phiếu lương — nhấn **👁️ Xem** để xem chi tiết
4. Nhấn **⬇️ Tải PDF** để xuất phiếu lương về máy

> **[HÌNH 9.9]** Modal chi tiết phiếu lương với đầy đủ thông tin lương và khấu trừ

#### Cấu hình tham số lương

1. Vào **Cấu hình lương** (trang Payroll)
2. Điều chỉnh: Mức lương cơ bản, hệ số, phụ cấp theo hợp đồng từng nhân viên
3. Điều chỉnh tỷ lệ BHXH/BHYT/BHTN nếu có thay đổi

---

### 🏢 9.2.5 Manager — Trưởng phòng ban

**Tài khoản:** `tp_cntt` / `123456` (hoặc `tp_kinhdoanh`, `tp_marketing`)  
**Dashboard:** `/dashboard-manager`

#### Xem chấm công phòng ban

1. Vào **Chấm công** → `/attendance`
2. Xem bảng chấm công nhân viên trong phòng theo tháng
3. Nhấn **Xuất PDF** để tải báo cáo

> **[HÌNH 9.10]** Dashboard Manager — Biểu đồ chấm công phòng ban

#### Duyệt nghỉ phép nhân viên trong phòng

1. Vào **Duyệt nghỉ phép** → `/leave`
2. Chỉ thấy đơn của nhân viên trong phòng mình
3. Nhấn **✅ Duyệt** hoặc **❌ Từ chối**

---

### 👤 9.2.6 Employee — Nhân viên

**Tài khoản ví dụ:** `nv009` / `123456`  
**Trang chính:** `/attendance/check-in`

#### Check-in buổi sáng

1. Vào **Chấm công** → `/attendance/check-in`
2. Hệ thống tự động xác minh vị trí GPS:
   - **Badge xanh** "Trong khu vực" → nút Check-in sáng lên
   - **Badge đỏ** "Ngoài khu vực" → nút Check-in bị khóa
3. Nhấn nút **CHECK IN**
4. Xác nhận thành công: Toast "Check-in thành công lúc HH:MM", timer bắt đầu

> ⚠️ **Lưu ý:** Cho phép trình duyệt truy cập vị trí khi được hỏi. Check-in chỉ thành công khi ở trong phạm vi 500m tính từ văn phòng.

> **[HÌNH 9.11]** Trang Check-in với badge GPS xanh và nút Check-in

#### Check-out cuối ca

1. Vào lại trang **Chấm công** → `/attendance/check-in`
2. Nhấn nút **CHECK OUT**
3. Hệ thống ghi nhận giờ ra và tính tổng giờ làm (tự động trừ 90 phút nghỉ trưa)

> **[HÌNH 9.12]** Trang Check-in sau khi đã check-in — hiển thị timer và nút Check-out

#### Đăng ký nghỉ phép

1. Vào **Đơn nghỉ phép** → `/leave`
2. Nhấn **+ Tạo đơn nghỉ phép**
3. Điền thông tin:
   - **Loại nghỉ:** Nghỉ phép năm / Nghỉ bệnh / Việc riêng / ...
   - **Ngày bắt đầu** và **Ngày kết thúc**
   - **Lý do** nghỉ
4. Nhấn **Gửi đơn**
5. Đơn sẽ có trạng thái **Chờ duyệt** cho đến khi Manager/HR xử lý

> **[HÌNH 9.13]** Form tạo đơn nghỉ phép với đầy đủ thông tin

#### Xem phiếu lương

1. Vào **Phiếu lương** → `/payslips`
2. Danh sách các kỳ lương hiển thị theo tháng
3. Nhấn **👁️ Xem** để xem chi tiết: Gross, Phụ cấp, BHXH, Thuế, Net
4. Nhấn **⬇️ Tải PDF** để lưu phiếu lương về máy

> **[HÌNH 9.14]** Trang phiếu lương với danh sách các kỳ và nút tải PDF

#### Đăng ký công tác phí

1. Vào **Công tác phí** → `/business-trips`
2. Nhấn **+ Tạo đề nghị**
3. Điền: Địa điểm, Mục đích, Ngày đi/về, Chi phí ước tính, Ghi chú
4. Gửi đề nghị để HR/Manager duyệt

> **[HÌNH 9.15]** Form đăng ký công tác phí

#### Cập nhật hồ sơ cá nhân

1. Vào **Hồ sơ cá nhân** → `/profile`
2. Cập nhật: Ảnh đại diện, Email, Số điện thoại, Địa chỉ
3. Đổi mật khẩu: Nhập mật khẩu cũ → Mật khẩu mới → Xác nhận

> **[HÌNH 9.16]** Trang hồ sơ cá nhân

---

## 9.3 Danh sách tài khoản demo

### Bảng 9.1 — Tài khoản thử nhanh (1 tài khoản / role)

| Role | Username | Mật khẩu | Dashboard | Chức năng chính |
|------|----------|----------|-----------|----------------|
| **Admin** | `admin` | `admin` | `/dashboard` | Toàn quyền hệ thống |
| **Director** | `giamdoc` | `giamdoc` | `/dashboard-director` | KPI tổng hợp, báo cáo |
| **HRManager** | `tp_nhansu` | `123456` | `/dashboard-hr` | Nhân sự, hợp đồng, duyệt nghỉ |
| **Accountant** | `tp_ketoan` | `123456` | `/dashboard-accountant` | Lương, phiếu lương |
| **Manager** | `tp_cntt` | `123456` | `/dashboard-manager` | Quản lý phòng CNTT |
| **Employee** | `nv009` | `123456` | `/attendance/check-in` | Check-in, xem lương, nghỉ phép |

### Bảng 9.2 — Tài khoản nhân viên theo phòng ban

| Phòng ban | Username | Vai trò |
|-----------|---------|---------|
| Ban Giám đốc | `pgd1`, `pgd2` | Phó Giám đốc |
| Kinh doanh | `tp_kinhdoanh`, `nv039`–`nv048` | Manager + NV |
| Marketing | `tp_marketing`, `nv049`–`nv058` | Manager + NV |
| CNTT | `nv009`–`nv018` | Lập trình viên, DevOps, Tester |
| Nhân sự | `nv019`–`nv028` | Chuyên viên nhân sự |
| Kế toán | `nv029`–`nv038` | Kế toán viên |
| Thử việc | `nv059`–`nv063` | Thực tập sinh (mỗi phòng 1) |

> **Mật khẩu mặc định:** `123456` (trừ admin/admin và giamdoc/giamdoc)

---

## 9.4 Xử lý sự cố thường gặp

| Sự cố | Nguyên nhân | Giải pháp |
|-------|------------|----------|
| Không check-in được | GPS bị từ chối hoặc tắt | Cấp quyền vị trí cho trình duyệt trong Settings |
| Badge "Ngoài khu vực" dù đang ở văn phòng | GPS chưa lock / indoor GPS kém | Đợi 5-10 giây hoặc ra gần cửa sổ |
| Phiếu lương hiện 0 ngày công | Chưa tính lại lương sau seed | Kế toán vào `/payroll` → Tính lương lại |
| Đăng nhập không được | Sai username/password | Liên hệ Admin để reset mật khẩu |
| Trang trắng / lỗi | Session hết hạn | Đăng xuất và đăng nhập lại |
