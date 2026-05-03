# THANG ĐIỂM ĐÁNH GIÁ ĐỒ ÁN MÔN LẬP TRÌNH WEB & ỨNG DỤNG

> **Dự án:** AXIOM — Hệ thống Quản lý Nhân sự & Tiền lương  
> **Nhóm:** 52400017 – 52400133 – 52400004

---

## Quy ước cột điểm

| Mức | Mô tả |
|-----|-------|
| **0 PT** | Chức năng không có hoặc không hoạt động hoàn toàn |
| **1/2 PT** | Chức năng đã được triển khai nhưng vẫn còn lỗi nghiêm trọng hoặc chưa hoạt động đúng |
| **FULL POINT** | Chức năng hoạt động đúng yêu cầu, không có lỗi hoặc chỉ có lỗi không đáng kể |

---

## I. QUẢN LÝ TÀI KHOẢN (Account Management) — 1.75 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 1 | Tạo tài khoản cho nhân viên (Admin tạo user + employee record) | 0.25 | Create a student account (Registration) | | | | |
| 2 | Gửi email tự động khi quên mật khẩu (Nodemailer + Gmail SMTP) | 0.25 | Send activation email automatically after account creation | | | | |
| 3 | Mật khẩu tạm thời có hiệu lực 24 giờ | 0.25 | The login link is only valid for 1 minute | | | | |
| 4 | Nhân viên mới phải thiết lập Gmail cá nhân trước khi vào hệ thống (setup-email) | 0.25 | New employees must log in via the link in the email | | | | |
| 5 | Đăng nhập bằng mã nhân viên + mật khẩu (NextAuth v5 Credentials) | 0.25 | Login Feature (username/email + password) | | | | |
| 6 | Quên mật khẩu — hệ thống gửi mật khẩu tạm qua Gmail cá nhân | 0.25 | Force creating a new password on first login | | | | |
| 7 | Nhân viên phải thiết lập Gmail cá nhân trước khi truy cập hệ thống (bắt buộc) | 0.25 | Students can only access system functions after changing password | | | | |
| | **Tổng** | **1.75** | | | | | |

---

## II. QUẢN LÝ NGƯỜI DÙNG (User Management) — 1.75 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 8 | Admin: Xem danh sách tất cả tài khoản (Settings → Users) | 0.25 | Admin: View staff list | | | | |
| 9 | Admin: Xem chi tiết thông tin nhân viên (modal chi tiết) | 0.25 | Admin: View details of an employee | | | | |
| 10 | Admin: Reset mật khẩu cho nhân viên | 0.25 | Admin: Resend 1-minute login email | | | | |
| 11 | Admin: Kích hoạt / Vô hiệu hóa tài khoản (toggle active) | 0.25 | Admin: Lock/Unlock account | | | | |
| 12 | Admin: Đổi vai trò người dùng (có ràng buộc thăng/giáng chức) | 0.25 | Admin: Change user role | | | | |
| 13 | Admin: Xóa tài khoản (soft-delete employee liên kết) | 0.25 | Admin: Delete user account | | | | |
| 14 | Nhân viên: Xem và cập nhật hồ sơ cá nhân (Profile page) | 0.25 | Employee: View/update own profile | | | | |
| | **Tổng** | **1.75** | | | | | |

---

## III. QUẢN LÝ NHÂN VIÊN (Employee Management) — 2.0 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 15 | Xem danh sách nhân viên (filter theo phòng ban, trạng thái, tìm kiếm) | 0.25 | View list with search & filter | | | | |
| 16 | Thêm nhân viên mới (form validation với Zod schema) | 0.25 | Create new record | | | | |
| 17 | Sửa thông tin nhân viên (update employee) | 0.25 | Edit record | | | | |
| 18 | Xóa nhân viên (soft-delete + hard-delete) | 0.25 | Delete record | | | | |
| 19 | Khôi phục nhân viên đã nghỉ (reinstate) | 0.25 | Restore deleted record | | | | |
| 20 | Tìm nhân viên theo mã nhân viên (getEmployeeByCode) | 0.25 | Search by specific field | | | | |
| 21 | Upload & crop avatar nhân viên (canvas drag-to-pan, zoom) | 0.25 | Upload profile image | | | | |
| 22 | Đổi mật khẩu cá nhân (xác minh mật khẩu cũ) | 0.25 | Change own password | | | | |
| | **Tổng** | **2.0** | | | | | |

---

## IV. QUẢN LÝ PHÒNG BAN & CHỨC VỤ (Department & Position) — 1.0 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 23 | Xem danh sách phòng ban (API departments) | 0.25 | View department list | | | | |
| 24 | Xem danh sách chức vụ (bảng positions với search, filter cấp bậc) | 0.25 | View position list | | | | |
| 25 | Phân bổ nhân viên theo phòng ban (headcount) | 0.25 | Assign employees to departments | | | | |
| 26 | Khung lương theo chức vụ (hiển thị salary range) | 0.25 | Salary range by position | | | | |
| | **Tổng** | **1.0** | | | | | |

---

## V. QUẢN LÝ HỢP ĐỒNG (Contract Management) — 1.25 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 27 | Xem danh sách hợp đồng (search, filter trạng thái) | 0.25 | View contract list | | | | |
| 28 | Tạo hợp đồng mới (form validation với Zod) | 0.25 | Create new contract | | | | |
| 29 | Chấm dứt hợp đồng (terminate) | 0.25 | Terminate contract | | | | |
| 30 | Cảnh báo hợp đồng sắp hết hạn (trong 30 ngày) | 0.25 | Expiring contract alerts | | | | |
| 31 | Xem hợp đồng theo nhân viên | 0.25 | View contracts by employee | | | | |
| | **Tổng** | **1.25** | | | | | |

---

## VI. CHẤM CÔNG (Attendance Management) — 1.25 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 32 | Check-in / Check-out realtime (ghi nhận thời gian) | 0.25 | Clock in / Clock out | | | | |
| 33 | Xem bảng chấm công theo tháng (filter phòng ban) | 0.25 | View monthly attendance | | | | |
| 34 | Xem chấm công hôm nay (getTodayAttendance) | 0.25 | View today's attendance | | | | |
| 35 | Chỉnh sửa / bổ sung chấm công (upsert) | 0.25 | Edit attendance records | | | | |
| 36 | Xuất báo cáo chấm công ra Excel | 0.25 | Export attendance to Excel | | | | |
| | **Tổng** | **1.25** | | | | | |

---

## VII. NGHỈ PHÉP (Leave Management) — 1.5 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 37 | Tạo đơn nghỉ phép (6 loại, tính ngày làm việc tự động) | 0.25 | Create leave request | | | | |
| 38 | Duyệt / Từ chối đơn nghỉ phép (Manager+) | 0.25 | Approve / Reject leave | | | | |
| 39 | Xem danh sách đơn nghỉ phép (filter theo trạng thái) | 0.25 | View leave requests | | | | |
| 40 | Xem chi tiết đơn nghỉ phép (modal chi tiết) | 0.25 | View leave details | | | | |
| 41 | Quản lý quỹ phép (tổng/đã dùng/còn lại — thanh progress) | 0.25 | Leave balance tracking | | | | |
| 42 | Phân quyền: Nhân viên chỉ thấy đơn của bản thân | 0.25 | Role-based data filtering | | | | |
| | **Tổng** | **1.5** | | | | | |

---

## VIII. TIỀN LƯƠNG (Payroll Management) — 2.0 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 43 | Tính lương tự động cho 1 nhân viên (lương cơ bản + phụ cấp + OT − bảo hiểm − thuế TNCN) | 0.50 | Auto payroll calculation | | | | |
| 44 | Tính lương hàng loạt cho tất cả nhân viên (batch) | 0.25 | Batch payroll processing | | | | |
| 45 | Xem bảng lương theo kỳ (tháng/năm) | 0.25 | View payroll by period | | | | |
| 46 | Xác nhận chi lương (confirm payment — đổi trạng thái) | 0.25 | Confirm payment | | | | |
| 47 | Cấu hình lương (payroll config page) | 0.25 | Payroll configuration | | | | |
| 48 | Tổng quỹ lương (getPayrollSummary) | 0.25 | Payroll summary / fund overview | | | | |
| 49 | Xuất phiếu lương PDF (payslip-pdf API) | 0.25 | Export payslip to PDF | | | | |
| | **Tổng** | **2.0** | | | | | |

---

## IX. PHIẾU LƯƠNG (Payslip) — 0.5 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 50 | Xem phiếu lương theo nhân viên (modal chi tiết) | 0.25 | View individual payslip | | | | |
| 51 | Tự động tạo phiếu lương khi tính xong (createOrUpdate) | 0.25 | Auto-generate payslip | | | | |
| | **Tổng** | **0.5** | | | | | |

---

## X. CÔNG TÁC (Business Trip Management) — 0.75 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 52 | Tạo đề xuất công tác (destination, ngày, phụ cấp) | 0.25 | Create business trip request | | | | |
| 53 | Duyệt / Từ chối công tác (Manager+) | 0.25 | Approve / Reject trip | | | | |
| 54 | Xem danh sách công tác (filter trạng thái, nhân viên) | 0.25 | View business trip list | | | | |
| | **Tổng** | **0.75** | | | | | |

---

## XI. LỊCH SỬ CÔNG TÁC & KHEN THƯỞNG / KỶ LUẬT (Career History) — 1.25 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 55 | Xem lịch sử công tác toàn bộ (filter loại sự kiện, search) | 0.25 | View career history | | | | |
| 56 | Tạo sự kiện công tác (thăng chức, chuyển phòng, khen thưởng, kỷ luật, tăng lương) | 0.25 | Create career event | | | | |
| 57 | Xóa sự kiện công tác | 0.25 | Delete career event | | | | |
| 58 | Thống kê overview (stat cards) | 0.25 | Career overview stats | | | | |
| 59 | Xem lịch sử theo từng nhân viên | 0.25 | View history by employee | | | | |
| | **Tổng** | **1.25** | | | | | |

---

## XII. DASHBOARD & BÁO CÁO (Dashboard & Reports) — 2.5 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 60 | Dashboard Admin: Thống kê tổng quan (nhân viên, nghỉ phép, hợp đồng) | 0.25 | Admin dashboard overview | | | | |
| 61 | Dashboard Giám đốc: Biểu đồ phân tích đa chiều (6 loại chart) | 0.50 | Director analytics dashboard | | | | |
| 62 | Dashboard Kế toán: KPI tài chính (quỹ lương, chi phí) | 0.25 | Accountant financial KPIs | | | | |
| 63 | Dashboard Nhân sự: Quản lý nhân sự tổng hợp | 0.25 | HR manager dashboard | | | | |
| 64 | Dashboard Trưởng phòng: Quản lý team | 0.25 | Manager team dashboard | | | | |
| 65 | Dashboard Nhân viên: Xem thông tin cá nhân | 0.25 | Employee personal dashboard | | | | |
| 66 | Xuất báo cáo tổng hợp PDF (dashboard-pdf API) | 0.25 | Export dashboard report PDF | | | | |
| 67 | Xuất báo cáo Excel (report-excel API) | 0.25 | Export report to Excel | | | | |
| 68 | Xuất danh sách nhân viên Excel (excel API) | 0.25 | Export employee list Excel | | | | |
| | **Tổng** | **2.5** | | | | | |

---

## XIII. PHÂN QUYỀN & BẢO MẬT (RBAC & Security) — 1.5 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 69 | Hệ thống 6 vai trò (Admin, Director, HRManager, Accountant, Manager, Employee) | 0.25 | Role-based access control | | | | |
| 70 | Sidebar động theo vai trò (mỗi role thấy menu khác nhau) | 0.25 | Dynamic sidebar by role | | | | |
| 71 | Redirect tự động theo vai trò sau đăng nhập (dashboardPath) | 0.25 | Auto-redirect by role | | | | |
| 72 | Phân quyền dữ liệu: nhân viên chỉ thấy dữ liệu bản thân | 0.25 | Data-level access control | | | | |
| 73 | Ràng buộc thăng/giáng chức (Employee↔Manager only) | 0.25 | Role transition constraints | | | | |
| 74 | Mã hóa mật khẩu bcrypt + NextAuth v5 JWT session | 0.25 | Password hashing + JWT | | | | |
| | **Tổng** | **1.5** | | | | | |

---

## XIV. UI/UX & TÍNH NĂNG BỔ SUNG — 1.0 điểm

| STT | Chức năng | Điểm | Chức năng tương đương | Đánh giá TV1 | Đánh giá TV2 | Đánh giá TV3 | Đánh giá TV4 |
|-----|-----------|------|-----------------------|:---:|:---:|:---:|:---:|
| 75 | Song ngữ Tiếng Việt / Tiếng Anh toàn hệ thống | 0.25 | Bilingual (i18n) support | | | | |
| 76 | Dark mode / Light mode (toggle realtime) | 0.25 | Dark/Light theme toggle | | | | |
| 77 | Responsive layout (desktop + mobile) | 0.25 | Responsive design | | | | |
| 78 | Trang đăng nhập premium (canvas particles, animations, floating cards) | 0.25 | Premium login page | | | | |
| | **Tổng** | **1.0** | | | | | |

---

## TỔNG KẾT

| Nhóm chức năng | Điểm |
|----------------|------|
| I. Quản lý tài khoản | 1.75 |
| II. Quản lý người dùng | 1.75 |
| III. Quản lý nhân viên | 2.0 |
| IV. Phòng ban & Chức vụ | 1.0 |
| V. Hợp đồng | 1.25 |
| VI. Chấm công | 1.25 |
| VII. Nghỉ phép | 1.5 |
| VIII. Tiền lương | 2.0 |
| IX. Phiếu lương | 0.5 |
| X. Công tác | 0.75 |
| XI. Lịch sử & Khen thưởng | 1.25 |
| XII. Dashboard & Báo cáo | 2.5 |
| XIII. Phân quyền & Bảo mật | 1.5 |
| XIV. UI/UX & Bổ sung | 1.0 |
| **TỔNG CỘNG** | **20.0** |
