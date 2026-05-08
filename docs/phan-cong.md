# BẢNG PHÂN CÔNG CÔNG VIỆC — AXIOM HRM

> **Môn học:** Công nghệ Phần mềm  
> **Nhóm:** 52400017 – 52400133 – 52400004  
> **Hệ thống:** AXIOM HRM — Quản lý Nhân sự Doanh nghiệp  
> **Thời gian thực hiện:** 9 tuần (Tuần 1 → Tuần 9)

---

## PHẦN 1 — THÔNG TIN NHÓM & VAI TRÒ

| MSSV | Họ và tên | Vai trò | Trách nhiệm chính |
|------|-----------|---------|-------------------|
| **52400017** | *(TV1)* | **Dev chính + PM** | Toàn bộ source code (Next.js, Prisma, Auth, Payroll, API...) + quản lý tiến độ nhóm |
| **52400004** | *(TV3)* | **BA (Business Analyst)** | Phân tích nghiệp vụ, viết SRS, thiết kế Use Case, tài liệu hệ thống |
| **52400133** | *(TV2)* | **Tester** | Viết test case, kiểm thử chức năng, báo cáo bug, regression test |

---

## PHẦN 2 — BẢNG PHÂN CÔNG THEO 9 TUẦN

| Tuần | Giai đoạn | Dev — 52400017 | BA — 52400004 | Tester — 52400133 |
|------|-----------|----------------|---------------|-------------------|
| **Tuần 1** | Khởi động & Phân tích | Khởi tạo dự án Next.js, cấu hình Prisma + PostgreSQL, thiết kế DB schema (13 bảng) | Phân tích yêu cầu nghiệp vụ, viết SRS v1, xác định các actor và use case tổng quan | Nghiên cứu hệ thống, thiết lập môi trường test, lập kế hoạch kiểm thử tổng thể |
| **Tuần 2** | Auth & Account | Cài đặt NextAuth v5, hệ thống 6 vai trò (RBAC), middleware phân quyền, quên mật khẩu qua Gmail SMTP | Viết Use Case chi tiết cho Account Management, User Management; vẽ sơ đồ Activity Diagram đăng nhập | Viết test case cho luồng đăng nhập, đăng xuất, quên mật khẩu; kiểm thử thủ công |
| **Tuần 3** | Employee & Department | Cài đặt CRUD nhân viên (Zod validation, soft-delete, reinstate), quản lý phòng ban, upload & crop avatar | Phân tích nghiệp vụ quản lý nhân viên, viết Use Case Employee/Department, vẽ Class Diagram | Kiểm thử thêm/sửa/xóa nhân viên, upload avatar, filter phòng ban; báo cáo bug |
| **Tuần 4** | Contract & Attendance | Cài đặt hợp đồng (tạo, chấm dứt, cảnh báo hết hạn), chấm công (check-in/out realtime, upsert) | Viết Use Case Contract Management và Attendance; phân tích quy trình nghỉ phép | Kiểm thử hợp đồng, chấm công; test edge case trùng ngày, hợp đồng hết hạn |
| **Tuần 5** | Leave & Business Trip | Cài đặt đơn nghỉ phép (tính ngày làm việc, quỹ phép), công tác (tạo đề xuất, duyệt) | Viết Use Case Leave Management, Business Trip; vẽ Activity Diagram quy trình duyệt đơn | Kiểm thử tạo/duyệt/từ chối đơn nghỉ phép và công tác; test phân quyền dữ liệu |
| **Tuần 6** | Payroll & Payslip | Cài đặt engine tính lương (BHXH/BHYT/BHTN/thuế TNCN lũy tiến 7 bậc), tính hàng loạt, phiếu lương | Phân tích nghiệp vụ tính lương theo quy định Việt Nam, viết tài liệu công thức và Use Case Payroll | Kiểm thử tính lương từng trường hợp (có OT, có người phụ thuộc, nhiều bậc thuế); báo cáo bug |
| **Tuần 7** | Dashboard & Career | Cài đặt 6 dashboard theo vai trò (Admin/Giám đốc/Kế toán/HR/Manager/Nhân viên), lịch sử công tác | Viết Use Case Dashboard, Career History; phân tích KPI cho từng dashboard; cập nhật SRS | Kiểm thử toàn bộ dashboard, biểu đồ; test Career History; kiểm tra dữ liệu hiển thị đúng |
| **Tuần 8** | Export & UI/UX | Cài đặt export Excel/PDF (chấm công, phiếu lương, báo cáo), hoàn thiện song ngữ VI/EN, dark/light mode | Viết tài liệu hướng dẫn sử dụng, cập nhật Use Case export; chuẩn bị nội dung báo cáo đồ án | Regression test toàn bộ hệ thống, kiểm thử export file, test responsive trên các thiết bị |
| **Tuần 9** | Hoàn thiện & Demo | Fix bug cuối, chuẩn bị seed data demo (63 nhân viên, dữ liệu 6 tháng), auto-sync service | Hoàn thiện báo cáo đồ án (Chương 1–9), kiểm tra UML diagrams, chuẩn bị slide thuyết trình | Kiểm thử lần cuối (final testing), viết báo cáo kiểm thử, chuẩn bị kịch bản demo |

---

## PHẦN 3 — PHÂN CÔNG THEO MODULE CHỨC NĂNG

### 3.1 Phân tích nghiệp vụ (BA — 52400004)

| STT | Tài liệu / Sản phẩm | Nội dung | Tuần hoàn thành |
|-----|---------------------|----------|-----------------|
| 1 | SRS (Software Requirements Specification) | Mô tả đầy đủ yêu cầu chức năng và phi chức năng của AXIOM HRM | Tuần 1–2 |
| 2 | Use Case tổng quan | Sơ đồ tổng quan 6 actor × 12 module nghiệp vụ | Tuần 1 |
| 3 | Use Case chi tiết — Account & User | Đăng nhập, quên mật khẩu, quản lý tài khoản Admin | Tuần 2 |
| 4 | Use Case chi tiết — Employee & Department | Thêm/sửa/xóa nhân viên, quản lý phòng ban | Tuần 3 |
| 5 | Activity Diagram — Đăng nhập | Luồng đăng nhập, xác thực, redirect theo vai trò | Tuần 2 |
| 6 | Activity Diagram — Tính lương | Quy trình tính lương: chấm công → tính gross → trừ bảo hiểm → trừ thuế → net | Tuần 6 |
| 7 | Activity Diagram — Duyệt nghỉ phép | Luồng tạo đơn → manager duyệt → cập nhật quỹ phép | Tuần 5 |
| 8 | Class Diagram | Sơ đồ lớp 13 bảng DB: Employee, User, Contract, Attendance, Payroll, Leave... | Tuần 3 |
| 9 | Use Case chi tiết — Leave & Business Trip | Tạo đơn, duyệt, từ chối, quản lý quỹ phép | Tuần 5 |
| 10 | Use Case chi tiết — Payroll | Tính lương, xác nhận chi lương, phiếu lương | Tuần 6 |
| 11 | Use Case chi tiết — Dashboard | 6 loại dashboard, quyền xem dữ liệu theo vai trò | Tuần 7 |
| 12 | Tài liệu hướng dẫn sử dụng | Hướng dẫn cho từng vai trò người dùng (Admin/HR/Manager/Employee) | Tuần 8 |
| 13 | Báo cáo đồ án (Chương 1–9) | Giới thiệu, phân tích, thiết kế, cài đặt, kiểm thử, đánh giá | Tuần 9 |
| 14 | Slide thuyết trình | Tóm tắt dự án, demo flow, kết quả đạt được | Tuần 9 |

---

### 3.2 Phát triển hệ thống (Dev — 52400017)

| STT | Module | Chức năng cài đặt | Công nghệ sử dụng |
|-----|--------|-------------------|-------------------|
| 1 | **Cơ sở hạ tầng** | Khởi tạo Next.js 16, cấu hình Prisma ORM + PostgreSQL, thiết kế 13 bảng DB, seed data 63 nhân viên | Next.js, Prisma, PostgreSQL |
| 2 | **Authentication** | NextAuth v5 Credentials, JWT session, bcrypt hash (salt=10), forgot password qua Nodemailer/Gmail SMTP, trang đăng nhập premium (Canvas particles, animation) | NextAuth v5, bcrypt, Nodemailer |
| 3 | **RBAC** | 6 vai trò (Admin/Director/HRManager/Accountant/Manager/Employee), middleware bảo vệ route, sidebar động theo role, redirect tự động | Next.js Middleware |
| 4 | **Account & User** | CRUD tài khoản (tạo, reset password, toggle active, đổi role, xóa), thiết lập Gmail cá nhân, đổi mật khẩu | Prisma, Server Actions |
| 5 | **Employee Management** | CRUD nhân viên (Zod validation, soft-delete, reinstate), upload & crop avatar (Canvas), quản lý phòng ban | Prisma, Zod, Canvas API |
| 6 | **Contract Management** | Tạo hợp đồng, chấm dứt, cảnh báo hết hạn 30 ngày, xem theo nhân viên | Prisma, Server Actions |
| 7 | **Attendance** | Check-in/check-out realtime, bảng chấm công theo tháng, upsert thủ công, xử lý `@db.Time()` | Prisma, Next.js API Routes |
| 8 | **Leave Management** | Tạo đơn nghỉ phép (6 loại, tính ngày làm việc bỏ T7/CN), duyệt/từ chối, quỹ phép, phân quyền dữ liệu | Prisma, Server Actions |
| 9 | **Business Trip** | Tạo đề xuất công tác, duyệt/từ chối, danh sách công tác | Prisma, Server Actions |
| 10 | **Career History** | CRUD lịch sử công tác (9 loại sự kiện: thăng chức, điều chuyển, khen thưởng, kỷ luật...), thống kê | Prisma, Server Actions |
| 11 | **Payroll Engine** | Engine tính lương theo pháp luật Việt Nam: lương cơ bản + phụ cấp + OT − BHXH(8%) − BHYT(1.5%) − BHTN(1%) − thuế TNCN lũy tiến 7 bậc; tính hàng loạt; xác nhận chi lương | Prisma, TypeScript |
| 12 | **Payslip** | Tự động tạo phiếu lương sau khi tính, tránh duplicate | Prisma, Server Actions |
| 13 | **Dashboard** | 6 dashboard theo vai trò: Admin (stat cards + pie chart), Giám đốc (6 biểu đồ line/bar/pie/doughnut), Kế toán (KPI tài chính), HR (headcount), Manager (team overview), Nhân viên (self-service) | Recharts, Prisma |
| 14 | **Export** | Xuất Excel (chấm công, danh sách NV, báo cáo), xuất PDF (phiếu lương, báo cáo tổng hợp) | SheetJS/xlsx, jsPDF |
| 15 | **UI/UX** | Song ngữ VI/EN (i18n maps), dark/light mode (context + CSS vars), responsive layout (`useBreakpoint`), floating sidebar với hover animation | React Context, CSS |
| 16 | **Demo Data** | Script generate 63 NV + dữ liệu 6 tháng (T12/2025→T5/2026), auto-sync service cập nhật hàng ngày | Prisma, tsx scripts |

---

### 3.3 Kiểm thử (Tester — 52400133)

| STT | Module | Loại kiểm thử | Nội dung kiểm thử | Tuần |
|-----|--------|--------------|-------------------|------|
| 1 | **Authentication** | Functional, Security | Đăng nhập đúng/sai, quên mật khẩu, hết hạn token, redirect theo role | Tuần 2 |
| 2 | **Account & User** | Functional | Tạo tài khoản, reset password, toggle active, đổi role, xóa tài khoản | Tuần 2–3 |
| 3 | **Employee Management** | Functional, UI | Thêm/sửa/xóa nhân viên, upload avatar, filter, search, phân trang | Tuần 3 |
| 4 | **Contract Management** | Functional, Edge Case | Tạo hợp đồng, chấm dứt, cảnh báo hết hạn, hợp đồng trùng | Tuần 4 |
| 5 | **Attendance** | Functional, Edge Case | Check-in/out, chấm công trùng ngày, bảng theo tháng, chỉnh sửa thủ công | Tuần 4 |
| 6 | **Leave Management** | Functional, Access Control | Tạo đơn, duyệt, từ chối, quỹ phép, phân quyền (NV chỉ thấy đơn mình) | Tuần 5 |
| 7 | **Business Trip** | Functional | Tạo/duyệt/từ chối công tác, filter trạng thái | Tuần 5 |
| 8 | **Payroll** | Functional, Calculation | Tính lương với/không OT, người phụ thuộc, nhiều bậc thuế, xác nhận chi | Tuần 6 |
| 9 | **Dashboard** | Functional, Data Accuracy | Kiểm tra số liệu đúng theo từng vai trò, biểu đồ hiển thị đúng | Tuần 7 |
| 10 | **Career History** | Functional | Tạo/xóa sự kiện công tác, filter loại sự kiện, thống kê | Tuần 7 |
| 11 | **Export** | Functional | Xuất Excel/PDF chấm công, phiếu lương, báo cáo; kiểm tra format file | Tuần 8 |
| 12 | **UI/UX & Responsive** | UI, Compatibility | Dark/light mode, song ngữ, responsive trên desktop/tablet/mobile, sidebar animation | Tuần 8 |
| 13 | **Regression Test** | Full System | Kiểm thử lại toàn bộ hệ thống sau khi fix bug, xác nhận không có lỗi hồi quy | Tuần 9 |
| 14 | **Báo cáo kiểm thử** | Documentation | Tổng hợp kết quả test, danh sách bug đã fix, kết luận chất lượng | Tuần 9 |

---

## PHẦN 4 — TỔNG KẾT & TỶ LỆ ĐÓNG GÓP

| Thành viên | MSSV | Vai trò | Số đầu việc | Tỷ lệ đóng góp | Ghi chú |
|------------|------|---------|:-----------:|:--------------:|---------|
| **TV1** | **52400017** | Dev chính + PM | 16 module | **~60%** | Toàn bộ backend, frontend, DB, auth, payroll engine, deployment |
| **TV3** | **52400004** | BA | 14 tài liệu | **~25%** | SRS, Use Case, Activity/Class Diagram, báo cáo, slide |
| **TV2** | **52400133** | Tester | 14 hạng mục | **~15%** | Test case, kiểm thử chức năng, báo cáo bug, regression test |
| **Tổng** | | | **44** | **100%** | |

> **Ghi chú:**  
> - **Dev (52400017)** chịu trách nhiệm toàn bộ source code của hệ thống AXIOM HRM (≈ 50,000+ dòng code).  
> - **BA (52400004)** đảm bảo tài liệu nghiệp vụ đầy đủ, làm nền tảng cho quá trình phát triển và báo cáo.  
> - **Tester (52400133)** phát hiện và theo dõi bug xuyên suốt quá trình, đảm bảo chất lượng trước demo.  
> - Tỷ lệ đóng góp phản ánh đặc thù dự án: Dev đóng vai trò cốt lõi do hệ thống có độ phức tạp kỹ thuật cao.
