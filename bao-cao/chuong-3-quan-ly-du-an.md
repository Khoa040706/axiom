# CHƯƠNG 3. QUẢN LÝ DỰ ÁN

## 3.1 Thông tin nhóm

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | AXIOM HRM — Hệ thống Quản lý Nhân sự Doanh nghiệp |
| **Môn học** | Công nghệ Phần mềm |
| **Học kỳ** | HK2 — Năm học 2025–2026 |
| **Thời gian thực hiện** | 9 tuần |
| **Quy mô hệ thống** | 12 module nghiệp vụ, 13 bảng dữ liệu, 6 vai trò người dùng |

### Bảng 3.1 — Thành viên nhóm và vai trò

| STT | MSSV | Vai trò trong dự án | Trách nhiệm chính |
|-----|------|---------------------|-------------------|
| 1 | **52400017** | **Dev chính + PM (Project Manager)** | Toàn bộ source code hệ thống (Next.js, Prisma, Auth, Payroll Engine, API routes, RBAC, Dashboard...); quản lý tiến độ, phân công và điều phối nhóm |
| 2 | **52400004** | **BA (Business Analyst)** | Phân tích nghiệp vụ, viết đặc tả yêu cầu (SRS), thiết kế Use Case, Activity Diagram, Class Diagram; soạn báo cáo đồ án và slide thuyết trình |
| 3 | **52400133** | **Tester** | Lập kế hoạch kiểm thử, viết test case, kiểm thử chức năng thủ công, báo cáo bug, regression test trước khi demo |

---

## 3.2 Phương pháp phát triển

Nhóm áp dụng phương pháp **Agile** kết hợp mô hình **Scrum** với chu kỳ sprint 1 tuần. Mỗi sprint được chia thành các giai đoạn: lập kế hoạch → phát triển → kiểm thử → đánh giá và điều chỉnh.

### 3.2.1 Lý do chọn Agile–Scrum

| Tiêu chí | Lý do |
|----------|-------|
| **Quy mô nhóm nhỏ** | 3 thành viên với vai trò chuyên biệt (Dev/BA/Tester) phù hợp với Scrum |
| **Yêu cầu thay đổi linh hoạt** | Hệ thống HRM phức tạp, yêu cầu có thể được bổ sung và điều chỉnh trong quá trình phát triển |
| **Phản hồi nhanh** | Mỗi sprint 1 tuần cho phép phát hiện lỗi sớm, tránh tích lũy nợ kỹ thuật |
| **Phân công rõ ràng** | Dev tập trung code, BA cung cấp tài liệu nghiệp vụ, Tester phản hồi chất lượng liên tục |
| **Kiểm soát tiến độ** | Sprint Review cuối mỗi tuần giúp PM đánh giá và điều phối kịp thời |

### 3.2.2 Quy trình làm việc trong sprint

```
┌─────────────────────────────────────────────────────────┐
│                    SPRINT (1 tuần)                       │
│                                                          │
│  Thứ 2          Thứ 3–5            Thứ 6–7              │
│  ─────────      ──────────────     ──────────────        │
│  Sprint         Dev: code          Tester: kiểm          │
│  Planning       BA: tài liệu       thử sprint            │
│  (cả nhóm)      Tester: viết TC    Review + Retro        │
└─────────────────────────────────────────────────────────┘
```

---

## 3.3 Phân công nhiệm vụ theo vai trò

### 3.3.1 Dev chính + PM — MSSV 52400017

Chịu trách nhiệm **toàn bộ source code** của hệ thống AXIOM HRM và quản lý tiến độ dự án.

#### Bảng 3.2 — Danh sách module Dev phụ trách

| STT | Module | Nội dung triển khai | Công nghệ |
|-----|--------|---------------------|-----------|
| 1 | **Cơ sở hạ tầng** | Khởi tạo Next.js 16, cấu hình Prisma ORM + PostgreSQL, thiết kế 13 bảng DB, seed data 63 nhân viên demo | Next.js, Prisma, PostgreSQL |
| 2 | **Authentication** | NextAuth v5 Credentials provider, JWT session, bcrypt hash (salt=10), forgot-password qua Nodemailer/Gmail SMTP, trang đăng nhập (Canvas particles, animation) | NextAuth v5, bcrypt, Nodemailer |
| 3 | **RBAC & Bảo mật** | 6 vai trò (Admin/Director/HRManager/Accountant/Manager/Employee), Edge Middleware bảo vệ route, sidebar động theo role, redirect tự động, data-level filter | Next.js Middleware |
| 4 | **Account & User** | CRUD tài khoản (tạo, reset password, toggle active, đổi role, xóa), thiết lập Gmail cá nhân, đổi mật khẩu | Prisma, Server Actions |
| 5 | **Employee Management** | CRUD nhân viên (Zod validation, soft-delete, reinstate), upload & crop avatar (Canvas API), quản lý phòng ban | Prisma, Zod, Canvas API |
| 6 | **Contract Management** | Tạo hợp đồng, chấm dứt, cảnh báo hết hạn 30 ngày | Prisma, Server Actions |
| 7 | **Attendance** | Check-in/check-out realtime, bảng chấm công theo tháng, upsert thủ công, xử lý `@db.Time()` | Prisma, Next.js API |
| 8 | **Leave Management** | Tạo đơn nghỉ phép (6 loại, tính ngày làm việc bỏ T7/CN), duyệt/từ chối, quỹ phép, phân quyền dữ liệu | Prisma, Server Actions |
| 9 | **Business Trip** | Tạo đề xuất công tác, duyệt/từ chối, danh sách công tác | Prisma, Server Actions |
| 10 | **Career History** | CRUD 9 loại sự kiện (thăng chức, điều chuyển, khen thưởng, kỷ luật, điều chỉnh lương...) | Prisma, Server Actions |
| 11 | **Payroll Engine** | Tính lương: lương cơ bản + phụ cấp + OT − BHXH(8%) − BHYT(1.5%) − BHTN(1%) − thuế TNCN lũy tiến 7 bậc; tính hàng loạt; xác nhận chi lương | TypeScript, Prisma |
| 12 | **Payslip** | Tự động tạo phiếu lương sau khi tính, chống duplicate | Prisma |
| 13 | **Dashboard** | 6 dashboard theo vai trò: Admin (stat cards + pie chart), Giám đốc (6 biểu đồ: line/bar/pie/doughnut), Kế toán (KPI tài chính), HR (headcount), Manager (team overview), Nhân viên (self-service) | Recharts, Prisma |
| 14 | **Export** | Xuất Excel (chấm công, danh sách NV, báo cáo), xuất PDF (phiếu lương, báo cáo tổng hợp) | SheetJS, jsPDF |
| 15 | **UI/UX** | Song ngữ VI/EN (i18n maps), dark/light mode (React Context + CSS vars), responsive layout, floating sidebar với hover-expand animation | React Context, CSS |
| 16 | **Demo Data** | Script generate 63 NV + dữ liệu 6 tháng (T12/2025→T5/2026), auto-sync service cập nhật chấm công hàng ngày | Prisma, tsx scripts |

**Tỷ lệ đóng góp: ~60% tổng khối lượng dự án**

---

### 3.3.2 BA (Business Analyst) — MSSV 52400004

Chịu trách nhiệm **toàn bộ tài liệu nghiệp vụ** và báo cáo đồ án.

#### Bảng 3.3 — Danh sách tài liệu BA phụ trách

| STT | Tài liệu / Sản phẩm | Nội dung | Tuần hoàn thành |
|-----|---------------------|----------|-----------------|
| 1 | **SRS v1** | Đặc tả yêu cầu chức năng và phi chức năng, danh sách 78 use case | Tuần 1–2 |
| 2 | **Use Case tổng quan** | Sơ đồ tổng quan 6 actor × 12 module nghiệp vụ | Tuần 1 |
| 3 | **Use Case chi tiết — Account & User** | Đăng nhập, quên mật khẩu, quản lý tài khoản Admin | Tuần 2 |
| 4 | **Activity Diagram — Đăng nhập** | Luồng đăng nhập → xác thực → redirect theo vai trò | Tuần 2 |
| 5 | **Use Case chi tiết — Employee & Department** | Thêm/sửa/xóa nhân viên, upload avatar, quản lý phòng ban | Tuần 3 |
| 6 | **Class Diagram** | Sơ đồ lớp 13 bảng: Employee, User, Contract, Attendance, Payroll, Leave, BusinessTrip, CareerHistory... | Tuần 3 |
| 7 | **Use Case chi tiết — Contract & Attendance** | Tạo hợp đồng, check-in/out, bảng chấm công | Tuần 4 |
| 8 | **Use Case chi tiết — Leave & Business Trip** | Tạo đơn, duyệt, từ chối, quỹ phép, công tác | Tuần 5 |
| 9 | **Activity Diagram — Duyệt nghỉ phép** | Luồng tạo đơn → manager duyệt → cập nhật quỹ phép | Tuần 5 |
| 10 | **Use Case chi tiết — Payroll** | Tính lương, xác nhận chi lương, xem phiếu lương | Tuần 6 |
| 11 | **Activity Diagram — Tính lương** | Chấm công → tính Gross → trừ bảo hiểm → trừ thuế → Net | Tuần 6 |
| 12 | **Use Case chi tiết — Dashboard & Export** | 6 loại dashboard, quyền xem dữ liệu theo vai trò, xuất file | Tuần 7 |
| 13 | **Tài liệu hướng dẫn sử dụng** | Hướng dẫn cho từng vai trò (Admin/HR/Manager/Employee) | Tuần 8 |
| 14 | **Báo cáo đồ án (Chương 1–9)** | Giới thiệu, phân tích, thiết kế, cài đặt, kiểm thử, đánh giá | Tuần 9 |
| 15 | **Slide thuyết trình** | Tóm tắt dự án, demo flow, kết quả đạt được | Tuần 9 |

**Tỷ lệ đóng góp: ~25% tổng khối lượng dự án**

---

### 3.3.3 Tester — MSSV 52400133

Chịu trách nhiệm **đảm bảo chất lượng** hệ thống xuyên suốt quá trình phát triển.

#### Bảng 3.4 — Kế hoạch kiểm thử theo module

| STT | Module | Loại kiểm thử | Nội dung kiểm thử chính | Tuần |
|-----|--------|--------------|-------------------------|------|
| 1 | **Authentication** | Functional, Security | Đăng nhập đúng/sai credentials, quên mật khẩu, hết hạn session, redirect theo role | Tuần 2 |
| 2 | **Account & User** | Functional | Tạo tài khoản, reset password, kích hoạt/vô hiệu hóa, đổi role, xóa tài khoản | Tuần 2–3 |
| 3 | **Employee Management** | Functional, UI | Thêm/sửa/xóa nhân viên, upload avatar (crop, zoom), filter phòng ban, search, phân trang | Tuần 3 |
| 4 | **Contract Management** | Functional, Edge Case | Tạo hợp đồng, chấm dứt, cảnh báo hết hạn, hợp đồng trùng lặp | Tuần 4 |
| 5 | **Attendance** | Functional, Edge Case | Check-in/out, trùng ngày, bảng chấm công theo tháng, chỉnh sửa thủ công | Tuần 4 |
| 6 | **Leave Management** | Functional, Access Control | Tạo đơn, duyệt, từ chối, quỹ phép; phân quyền (NV chỉ thấy đơn bản thân) | Tuần 5 |
| 7 | **Business Trip** | Functional | Tạo/duyệt/từ chối công tác, filter trạng thái, hiển thị stat cards | Tuần 5 |
| 8 | **Payroll** | Functional, Calculation | Tính lương có/không OT, có người phụ thuộc, nhiều bậc thuế TNCN, xác nhận chi | Tuần 6 |
| 9 | **Dashboard** | Functional, Data Accuracy | Số liệu KPI đúng theo vai trò, biểu đồ hiển thị chính xác, dữ liệu không bị lẫn giữa roles | Tuần 7 |
| 10 | **Career History** | Functional | Tạo/xóa sự kiện, 9 loại sự kiện, filter, timeline view, stat cards | Tuần 7 |
| 11 | **Export** | Functional | Xuất Excel/PDF chấm công, phiếu lương, báo cáo; kiểm tra format và nội dung file | Tuần 8 |
| 12 | **UI/UX & Responsive** | UI, Compatibility | Dark/light mode, chuyển đổi VI/EN, responsive desktop/tablet/mobile, sidebar animation | Tuần 8 |
| 13 | **Regression Test** | Full System | Kiểm thử lại toàn bộ hệ thống sau khi fix bug, xác nhận không có lỗi hồi quy | Tuần 9 |
| 14 | **Báo cáo kiểm thử** | Documentation | Tổng hợp kết quả test, danh sách bug đã fix, kết luận chất lượng hệ thống | Tuần 9 |

**Tỷ lệ đóng góp: ~15% tổng khối lượng dự án**

---

## 3.4 Kế hoạch dự án theo tuần

### Bảng 3.5 — Lịch triển khai 9 tuần

| Tuần | Giai đoạn | Dev — 52400017 | BA — 52400004 | Tester — 52400133 | Kết quả sprint |
|------|-----------|----------------|---------------|-------------------|----------------|
| **1** | Khởi động & Phân tích | Khởi tạo Next.js, cấu hình Prisma + PostgreSQL, thiết kế DB schema (13 bảng) | Phân tích yêu cầu, viết SRS v1, vẽ Use Case tổng quan, xác định actor | Nghiên cứu hệ thống, thiết lập môi trường test, lập kế hoạch kiểm thử | Môi trường dev hoạt động, schema DB hoàn chỉnh, SRS v1 |
| **2** | Auth & Account | Cài đặt NextAuth v5, RBAC, middleware, forgot-password qua Gmail SMTP, trang login premium | Viết Use Case chi tiết Account/User Management, Activity Diagram đăng nhập | Viết test case đăng nhập, quên mật khẩu; kiểm thử luồng auth | Đăng nhập/đăng xuất hoạt động, phân quyền 6 vai trò |
| **3** | Employee & Department | CRUD nhân viên (Zod, soft-delete, reinstate), phòng ban, upload & crop avatar | Viết Use Case Employee/Department, vẽ Class Diagram 13 bảng | Kiểm thử thêm/sửa/xóa NV, upload avatar, filter, search | Quản lý nhân viên hoàn chỉnh, avatar crop hoạt động |
| **4** | Contract & Attendance | Hợp đồng (tạo, chấm dứt, cảnh báo hết hạn), check-in/out realtime, upsert chấm công | Viết Use Case Contract & Attendance, phân tích quy trình nghỉ phép | Kiểm thử hợp đồng, chấm công, edge case trùng ngày | Module hợp đồng và chấm công hoạt động |
| **5** | Leave & Business Trip | Đơn nghỉ phép (6 loại, tính ngày, quỹ phép), công tác (tạo, duyệt) | Viết Use Case Leave/Business Trip, Activity Diagram quy trình duyệt đơn | Kiểm thử tạo/duyệt/từ chối đơn, test phân quyền dữ liệu | Leave & Business Trip hoàn chỉnh |
| **6** | Payroll & Payslip | Engine tính lương (BHXH/BHYT/BHTN/thuế TNCN 7 bậc), tính hàng loạt, phiếu lương | Phân tích nghiệp vụ tính lương theo pháp luật VN, viết tài liệu công thức | Kiểm thử tính lương: có OT, người phụ thuộc, nhiều bậc thuế | Payroll engine chính xác, phiếu lương tự động |
| **7** | Dashboard & Career | 6 dashboard theo vai trò, 6 biểu đồ Director, lịch sử công tác | Viết Use Case Dashboard/Career History, phân tích KPI từng dashboard | Kiểm thử dashboard, độ chính xác số liệu, Career History | Toàn bộ dashboard hoạt động, dữ liệu chính xác |
| **8** | Export & UI/UX | Export Excel/PDF, song ngữ VI/EN toàn hệ thống, dark/light mode | Viết tài liệu hướng dẫn sử dụng, chuẩn bị nội dung báo cáo | Regression test, kiểm thử export file, test responsive | Giao diện hoàn thiện, export hoạt động |
| **9** | Hoàn thiện & Demo | Fix bug cuối, seed data 63 NV + 6 tháng, auto-sync service | Hoàn thiện báo cáo Chương 1–9, kiểm tra UML, chuẩn bị slide | Final testing, viết báo cáo kiểm thử, chuẩn bị kịch bản demo | Hệ thống ổn định, tài liệu đầy đủ |

![Hình 3.1 — Gantt Chart AXIOM HRM 9 tuần](hinh-anh/hinh-3-1-gantt-chart.png)

*Hình 3.1 — Gantt Chart dự án AXIOM HRM: timeline 9 tuần theo 3 vai trò Dev (đỏ) / BA (xanh dương) / Tester (xanh lá), kèm các milestone bàn giao cuối sprint.*


---

## 3.5 Công cụ và môi trường

### Bảng 3.6 — Công cụ sử dụng theo vai trò

| Vai trò | Công cụ | Mục đích |
|---------|---------|----------|
| **Dev** | Visual Studio Code | IDE phát triển chính |
| **Dev** | Git + GitHub | Quản lý source code, branching (main / sidebar-redesign) |
| **Dev** | Prisma Studio | Quản lý và kiểm tra dữ liệu DB trực quan |
| **Dev** | Thunder Client | Kiểm thử API routes trong VS Code |
| **Dev** | Node.js v20+, npm | Môi trường chạy ứng dụng |
| **BA** | draw.io | Vẽ Use Case, Activity Diagram, Class Diagram |
| **BA** | Microsoft Word / Markdown | Soạn thảo SRS, báo cáo đồ án |
| **BA** | Google Slides | Làm slide thuyết trình |
| **Tester** | Google Chrome / Edge | Kiểm thử giao diện người dùng |
| **Tester** | Chrome DevTools | Kiểm tra console log, network, responsive |
| **Tất cả** | Zalo / Messenger | Trao đổi nhanh trong nhóm |
| **Tất cả** | Google Meet | Họp nhóm online cuối sprint |

---

## 3.6 Quản lý rủi ro

### Bảng 3.7 — Nhận dạng và ứng phó rủi ro

| # | Rủi ro | Xác suất | Mức ảnh hưởng | Biện pháp ứng phó |
|---|--------|:--------:|:-------------:|-------------------|
| 1 | Dev không hoàn thành đúng hạn do module phức tạp | Trung | Cao | Chia module lớn thành task nhỏ, ưu tiên core feature trước; PM điều chỉnh scope sprint nếu cần |
| 2 | Công thức tính lương sai so với quy định pháp luật | Thấp | Rất cao | BA cung cấp tài liệu công thức chi tiết; Tester kiểm thử từng bậc thuế, đối chiếu với quy định Nghị quyết 107/2023 |
| 3 | Tài liệu BA không kịp tiến độ Dev | Trung | Trung | BA hoàn thành Use Case trước khi Dev bắt đầu module; sử dụng SRS làm tài liệu tham chiếu liên tục |
| 4 | Phát hiện bug nghiêm trọng sát ngày demo | Trung | Cao | Tester thực hiện regression test từ Tuần 8; Dev duy trì branch `main` ổn định, tính năng mới phát triển trên branch riêng |
| 5 | Xung đột merge code trên GitHub | Trung | Thấp | Quy ước branch: `main` (ổn định), `feature/*` (tính năng mới), `fix/*` (sửa bug); commit thường xuyên |
| 6 | GPS check-in không hoạt động trên localhost | Cao | Trung | Dùng HTTPS cho production; mock GPS trong môi trường dev; cho phép bypass khoảng cách khi demo |
| 7 | Dữ liệu demo không đủ thực tế để thuyết phục | Thấp | Trung | Seed 63 nhân viên + 6 tháng dữ liệu lịch sử; auto-sync service tạo data hàng ngày tự động |

---

## 3.7 Tổng kết phân công và tỷ lệ đóng góp

### Bảng 3.8 — Tổng hợp đóng góp

| Thành viên | MSSV | Vai trò | Số đầu việc | Tỷ lệ | Ghi chú |
|------------|------|---------|:-----------:|:-----:|---------|
| **Hoàng Thái Đăng Khoa** | 52400017 | Dev chính + PM | 16 module | **~58%** | Toàn bộ backend, frontend, DB, auth, payroll engine; quản lý tiến độ |
| **Lê Tuấn Kiệt** | 52400133 | Tester | 14 hạng mục | **~22%** | Lập kế hoạch test, viết 132 test case, kiểm thử thủ công, báo cáo bug |
| **Lê Minh Gia Bảo** | 52400004 | BA | 15 tài liệu | **~20%** | SRS, Use Case, Activity/Class Diagram, báo cáo đồ án, slide |
| **Tổng** | | | **45** | **100%** | |

> **Nhận xét:**
> Tỷ lệ đóng góp phản ánh quá trình phân chia lại công việc để tối ưu hóa hiệu quả nhóm: thành viên Dev vẫn chịu trách nhiệm phần lớn khối lượng kỹ thuật phức tạp (12 module, 50.000+ dòng code). Tester đã gia tăng đáng kể vai trò trong đảm bảo chất lượng với việc xây dựng hệ thống 132 test case và thực hiện regression test nghiêm ngặt. BA tập trung tối ưu hóa tài liệu nghiệp vụ cốt lõi, đảm bảo tính nhất quán từ yêu cầu đến thiết kế hệ thống.
