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

| Mô-đun | Thành viên phụ trách | Mô tả |
|--------|---------------------|-------|
| Authentication & RBAC | Thành viên 1 | NextAuth, middleware, phân quyền |
| Quản lý nhân viên & Hợp đồng | Thành viên 1 | CRUD Employee, Contract, CareerHistory |
| Chấm công & GPS | Thành viên 2 | Check-in/out, Haversine, timer |
| Nghỉ phép & Công tác phí | Thành viên 2 | LeaveRequest, BusinessTrip |
| Tính lương & Phiếu lương | Thành viên 3 | Payroll service, PDF export |
| Dashboard & Báo cáo | Thành viên 3 | Director/HR/Accountant dashboard, Recharts |
| Database & Prisma schema | Thành viên 1 | Schema design, migration, seed |
| UI/UX & Responsive | Thành viên 2 | CSS, dark mode, mobile layout |
| Kiểm thử | Cả nhóm | Test case, bug fix |
| Tài liệu & Báo cáo | Cả nhóm | SRS, báo cáo đồ án |

---

## 3.4 Kế hoạch dự án (Timeline)

### Bảng 3.3 — Kế hoạch theo tuần

| Tuần | Thời gian | Nội dung công việc | Người thực hiện |
|------|----------|-------------------|----------------|
| 1 | 01/03 – 07/03 | Phân tích yêu cầu, thiết kế ERD, Prisma schema | Cả nhóm |
| 2 | 08/03 – 14/03 | Authentication, RBAC, quản lý nhân viên (CRUD) | Thành viên 1, 2 |
| 3 | 15/03 – 21/03 | Hợp đồng, lịch sử công tác, phân hệ Leave | Thành viên 1, 2 |
| 4 | 22/03 – 28/03 | Chấm công GPS, timer, công tác phí | Thành viên 2, 3 |
| 5 | 29/03 – 04/04 | Payroll service, tính lương, phiếu lương PDF | Thành viên 3 |
| 6 | 05/04 – 11/04 | Dashboard Director, HR, Accountant, Recharts | Thành viên 1, 3 |
| 7 | 12/04 – 18/04 | Seed data, responsive, dark mode, UI polish | Cả nhóm |
| 8 | 19/04 – 25/04 | Kiểm thử toàn hệ thống, bug fix | Cả nhóm |
| 9 | 26/04 – 30/04 | Hoàn thiện báo cáo, chuẩn bị bảo vệ | Cả nhóm |

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
