# CHƯƠNG 3. QUẢN LÝ DỰ ÁN

## 3.1 Thông tin nhóm

| Thông tin | Chi tiết |
|-----------|---------|
| **Tên nhóm** | Nhóm 3 |
| **Môn học** | Công nghệ Phần mềm |
| **Giảng viên hướng dẫn** | *(Tên giảng viên)* |
| **Học kỳ** | HK2 — Năm học 2025-2026 |

### Bảng 3.1 — Thành viên nhóm

| STT | Họ và tên | MSSV | Vai trò | Email |
|-----|-----------|------|---------|-------|
| 1 | Thành viên 1 | 52400017 | Trưởng nhóm | *(email)* |
| 2 | Thành viên 2 | 52400133 | Thành viên | *(email)* |
| 3 | Thành viên 3 | 52400004 | Thành viên | *(email)* |

---

## 3.2 Phương pháp phát triển

Nhóm áp dụng phương pháp phát triển **Agile - Scrum** với các sprint 1 tuần. Mỗi sprint bao gồm các hoạt động: lập kế hoạch (Sprint Planning), phát triển, kiểm thử nội bộ và đánh giá (Sprint Review).

### Lý do chọn Agile

- Yêu cầu có thể thay đổi trong quá trình phát triển.
- Phản hồi nhanh và điều chỉnh kịp thời.
- Phù hợp với quy mô nhóm nhỏ 3 người.
- Dễ phân chia công việc và theo dõi tiến độ.

---

## 3.3 Phân công nhiệm vụ

### Bảng 3.2 — Phân công công việc

#### Tổng quan phân công

| Thành viên | MSSV | Số task | Tỷ lệ | Vai trò chính |
|------------|------|:---:|:---:|---------------|
| **TV1** | 52400017 | 38 | ~50% | Backend core, Auth, Payroll, RBAC, Dashboard logic, Security, i18n |
| **TV2** | 52400133 | 20 | ~25% | Frontend UI, Employee pages, Contract, Attendance, Positions, Profile, Layout |
| **TV3** | 52400004 | 20 | ~25% | Leave, Business Trip, Career History, Export (PDF/Excel), Setup Email |

#### Phân công theo mô-đun

| Mô-đun | Thành viên | MSSV | Chức năng chính |
|--------|-----------|------|-----------------|
| **Authentication & Bảo mật** | TV1 | 52400017 | NextAuth v5 Credentials, bcrypt hash, JWT session, Edge Middleware, forgot-password API, setup-email flow |
| **Quản lý tài khoản (Admin)** | TV1 | 52400017 | Tạo/xóa user, reset mật khẩu, toggle active, đổi role có ràng buộc, getAllUsers |
| **Phân quyền RBAC** | TV1 | 52400017 | 6 vai trò (Admin/Director/HRManager/Accountant/Manager/Employee), sidebar động, redirect theo role, data-level filter |
| **Quản lý nhân viên** | TV1 + TV2 | 52400017 + 52400133 | Backend: CRUD Employee (Zod validation, soft/hard delete, reinstate). Frontend: bảng danh sách, filter, form modal |
| **Quản lý hợp đồng** | TV1 + TV2 | 52400017 + 52400133 | Backend: tạo/chấm dứt hợp đồng, cảnh báo hết hạn 30 ngày. Frontend: bảng danh sách, filter trạng thái |
| **Hồ sơ cá nhân & Avatar** | TV2 | 52400133 | Trang Profile: tab thông tin/đổi mật khẩu/avatar crop. Canvas drag-to-pan, zoom, export base64 |
| **Chấm công** | TV1 + TV2 | 52400017 + 52400133 | Backend: check-in/out timestamp, upsert, getByMonth. Frontend: UI nút check-in/out, bảng tháng, filter phòng ban |
| **Nghỉ phép** | TV1 + TV3 | 52400017 + 52400004 | Backend filter phân quyền (TV1). Frontend: tạo đơn, duyệt/từ chối, quỹ phép, progress bar (TV3) |
| **Công tác** | TV3 | 52400004 | Tạo đề xuất, duyệt/từ chối, danh sách filter — toàn bộ module |
| **Lịch sử công tác** | TV3 | 52400004 | Tạo/xóa sự kiện (thăng chức, khen thưởng, kỷ luật, tăng lương), timeline view, stat cards |
| **Tính lương (Payroll)** | TV1 | 52400017 | `payrollService.calculate()`: Gross/Net, BHXH/BHYT/BHTN, thuế TNCN lũy tiến 7 bậc, batch tính hàng loạt |
| **Phiếu lương & Cấu hình** | TV1 + TV2 | 52400017 + 52400133 | Backend: createOrUpdate payslip, confirmPayment. Frontend: bảng lương, modal chi tiết, config page |
| **Dashboard & Analytics** | TV1 + TV2 | 52400017 + 52400133 | Backend: 5 Promise.allSettled cho Director dashboard, KPI kế toán, stats tổng hợp (TV1). Frontend: 6 biểu đồ, stat cards (TV2) |
| **Xuất báo cáo PDF/Excel** | TV3 | 52400004 | API routes: dashboard-pdf, payslip-pdf, report-excel, excel danh sách nhân viên |
| **Phòng ban & Chức vụ** | TV2 | 52400133 | Trang positions: bảng chức vụ, cấp bậc, khung lương. API departments |
| **Đa ngôn ngữ VI/EN** | TV1 | 52400017 | i18n maps: `tLeaveType()`, `tDept()`, `tLeaveReason()` toàn hệ thống |
| **Dark/Light mode & Responsive** | TV2 | 52400133 | `dashboard-context.tsx`, `useBreakpoint()`, mobile sidebar, table scroll, CSS variables |
| **Trang đăng nhập** | TV1 | 52400017 | Canvas star particles, floating cards animation, gradient sweep button, bilingual toggle |
| **Database & Prisma** | TV1 | 52400017 | Schema design, migrations, seed data (30 nhân viên demo) |
| **Tài liệu & Báo cáo** | TV3 | 52400004 | SRS, báo cáo đồ án, SETUP.md, tài khoản demo |


---

## 3.4 Kế hoạch dự án (Timeline)

### Bảng 3.3 — Kế hoạch theo tuần

| Tuần | Thời gian | Nội dung công việc | Người thực hiện | Kết quả |
|------|----------|--------------------|----------------|---------|
| 1 | 01/03 – 07/03 | Phân tích yêu cầu, thiết kế ERD, Prisma schema, docker-compose, khởi tạo Next.js project | Cả nhóm | Schema DB hoàn chỉnh, môi trường dev chạy được |
| 2 | 08/03 – 14/03 | Authentication (NextAuth v5, bcrypt, JWT), Edge Middleware, setup-email flow, trang đăng nhập premium | TV1 (52400017) | Đăng nhập/đăng xuất, forgot-password, bảo vệ route |
| 3 | 15/03 – 21/03 | RBAC 6 vai trò, sidebar động, CRUD nhân viên (backend + frontend), quản lý tài khoản Admin | TV1 + TV2 (52400017 + 52400133) | Phân quyền hoàn chỉnh, trang nhân viên hoạt động |
| 4 | 22/03 – 28/03 | Quản lý hợp đồng, lịch sử công tác, chấm công (check-in/out backend), profile & avatar crop | TV1 + TV2 (52400017 + 52400133) | Hợp đồng, career history, check-in/out lưu DB |
| 5 | 29/03 – 04/04 | UI chấm công tháng, nghỉ phép (toàn bộ module: tạo đơn, duyệt, quỹ phép), công tác phí | TV2 + TV3 (52400133 + 52400004) | Bảng chấm công, leave management hoạt động |
| 6 | 05/04 – 11/04 | Payroll engine (Gross→Net, BHXH, thuế TNCN lũy tiến), batch tính lương, phiếu lương | TV1 (52400017) | Tính lương tự động chính xác, payslip PDF |
| 7 | 12/04 – 18/04 | Dashboard Director (6 biểu đồ), HR, Accountant, Manager, Employee; xuất báo cáo PDF/Excel | TV1 + TV2 + TV3 | Tất cả 6 dashboard hoạt động, export PDF/Excel |
| 8 | 19/04 – 25/04 | i18n VI/EN toàn hệ thống, dark/light mode, responsive mobile, UI polish, seed data 30 NV | Cả nhóm | Giao diện hoàn thiện, song ngữ, mobile-ready |
| 9 | 26/04 – 30/04 | Kiểm thử toàn hệ thống, fix bug console warnings, hoàn thiện báo cáo, chuẩn bị bảo vệ | Cả nhóm | Hệ thống ổn định, tài liệu đầy đủ |

*(Xem Hình 3.1 — Gantt Chart tổng quan dự án)*

> **[HÌNH 3.1]** Gantt Chart dự án — Biểu đồ thể hiện timeline 9 tuần, phân chia milestone và người phụ trách từng giai đoạn.


---

## 3.5 Công cụ sử dụng

### Bảng 3.4 — Công cụ và môi trường phát triển

| Loại | Công cụ |
|------|---------|
| **IDE** | Visual Studio Code |
| **Quản lý source code** | Git + GitHub |
| **Quản lý dự án** | GitHub Issues / Trello |
| **Database GUI** | Prisma Studio / DBeaver |
| **Design** | draw.io (diagram), Figma (UI mockup) |
| **API Test** | Thunder Client (VS Code extension) |
| **Môi trường chạy** | Node.js v20+, npm |
| **Trình duyệt test** | Google Chrome, Microsoft Edge |

---

## 3.6 Rủi ro và biện pháp

### Bảng 3.5 — Quản lý rủi ro

| # | Rủi ro | Xác suất | Mức ảnh hưởng | Biện pháp |
|---|--------|---------|--------------|----------|
| 1 | Thành viên bận, không hoàn thành đúng hạn | Trung | Cao | Họp nhóm hàng tuần, điều phối lại công việc |
| 2 | Yêu cầu thay đổi đột ngột | Thấp | Trung | Agile cho phép điều chỉnh linh hoạt |
| 3 | Lỗi tính lương sai công thức | Thấp | Cao | Viết test case, đối chiếu với quy định pháp luật |
| 4 | GPS không hoạt động trên localhost | Cao | Trung | Dùng HTTPS, mock GPS cho môi trường dev |
| 5 | Xung đột merge code trên GitHub | Trung | Thấp | Quy ước branch: feature/*, fix/* |
