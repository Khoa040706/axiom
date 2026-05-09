# CHƯƠNG 10. TỔNG KẾT DỰ ÁN

## 10.1 Tổng quan kết quả đạt được

Sau 9 tuần thực hiện, nhóm đã hoàn thành hệ thống **AXIOM HRM** — một nền tảng quản lý nhân sự doanh nghiệp toàn diện, đáp ứng đầy đủ yêu cầu đề ra và vượt kỳ vọng ban đầu ở một số khía cạnh.

### Bảng 10.1 — Tổng hợp kết quả dự án

| Hạng mục | Kế hoạch ban đầu | Thực tế đạt được |
|----------|-----------------|-----------------|
| Số module nghiệp vụ | 10 module | **12 module** (vượt kế hoạch) |
| Số bảng cơ sở dữ liệu | 10 bảng | **13 bảng** |
| Số vai trò người dùng | 4 vai trò | **6 vai trò** (thêm Accountant, Director) |
| Số chức năng (Use Case) | ~60 | **78 chức năng** |
| Dữ liệu demo | 20 nhân viên | **63 nhân viên + 6 tháng lịch sử** |
| Kiểm thử | Kiểm thử cơ bản | **132 test case**, 5 bug đã fix |
| Ước lượng dòng code | ~20,000 dòng | **~50,000 dòng** |
| Xuất báo cáo | Không có kế hoạch | **Excel + PDF** (bonus feature) |

### Bảng 10.2 — Đánh giá mức độ hoàn thành theo module

| Module | Mức độ hoàn thành | Ghi chú |
|--------|:----------------:|---------|
| Authentication & RBAC | ✅ 100% | 6 vai trò, JWT, middleware bảo vệ route |
| Account Management | ✅ 100% | CRUD đầy đủ, ràng buộc role |
| Employee Management | ✅ 100% | Bao gồm avatar crop, soft-delete, reinstate |
| Contract Management | ✅ 100% | Cảnh báo hết hạn 30 ngày |
| Attendance (GPS) | ✅ 100% | Check-in GPS Haversine, timer realtime |
| Leave Management | ✅ 100% | 6 loại nghỉ, quỹ phép, phân quyền |
| Business Trip | ✅ 100% | Tạo, duyệt, từ chối, thống kê |
| Payroll Engine | ✅ 100% | BHXH/BHYT/BHTN + thuế TNCN 7 bậc |
| Payslip | ✅ 100% | Tự động tạo, xuất PDF |
| Career History | ✅ 100% | 9 loại sự kiện, auto-update Employee |
| Dashboard (6 loại) | ✅ 100% | Recharts, data phân quyền theo role |
| Export PDF/Excel | ✅ 100% | Bonus — không có trong kế hoạch ban đầu |

---

## 10.2 Nhật ký làm việc 9 tuần

Nhật ký ghi lại quá trình làm việc thực tế của nhóm qua từng sprint, bao gồm công việc đã thực hiện, khó khăn gặp phải và cách vượt qua.

---

#### Tuần 1 (01/03 – 07/03/2026) — Khởi động & Phân tích

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev — Hoàng Thái Đăng Khoa** | Khởi tạo dự án Next.js 16, cấu hình Prisma ORM + PostgreSQL, thiết kế ERD sơ bộ (13 bảng), tạo repo GitHub |
| **BA — Lê Minh Gia Bảo** | Thu thập yêu cầu, phân tích nghiệp vụ HRM, viết SRS v1, xác định 6 actor và use case tổng quan |
| **Tester — Lê Tuấn Kiệt** | Nghiên cứu hệ thống, thiết lập môi trường kiểm thử, lập kế hoạch kiểm thử tổng thể |

**Kết quả:** Môi trường dev hoạt động, DB schema v1 hoàn chỉnh, SRS v1 được duyệt nội bộ.

**Khó khăn:** Cả nhóm chưa quen với Prisma ORM và NextAuth v5 — phải dành thêm 2 ngày tự học tài liệu chính thức trước khi bắt đầu code.

---

#### Tuần 2 (08/03 – 14/03/2026) — Authentication & Account

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | Cài đặt NextAuth v5 Credentials provider, bcrypt hash (salt=10), JWT session, Edge Middleware bảo vệ route, quên mật khẩu qua Nodemailer/Gmail SMTP, trang đăng nhập premium (Canvas particles) |
| **BA** | Viết Use Case chi tiết UC-01 (Xác thực), UC-10 (Quản lý tài khoản), vẽ Activity Diagram luồng đăng nhập |
| **Tester** | Viết 11 test case TC-01 (Authentication), 10 test case TC-02 (Account); kiểm thử thủ công luồng login/logout/forgot-password |

**Kết quả:** Đăng nhập/đăng xuất hoạt động, phân quyền 6 vai trò, quên mật khẩu gửi email thực.

**Khó khăn:** NextAuth v5 thay đổi API so với v4 — tài liệu chưa đầy đủ, phải tự debug callback `authorize()` mất gần 1 ngày.

---

#### Tuần 3 (15/03 – 21/03/2026) — Employee & Department

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | CRUD nhân viên (Zod validation, soft-delete, reinstate), upload & crop avatar (Canvas API drag-to-pan), quản lý phòng ban, RBAC sidebar động |
| **BA** | Viết Use Case UC-02 (Nhân viên), UC-03 (Phòng ban), vẽ Class Diagram 13 bảng |
| **Tester** | Viết 12 test case TC-03 (Employee); kiểm thử thêm/sửa/xóa, avatar, filter |

**Kết quả:** Trang quản lý nhân viên hoàn chỉnh, avatar crop hoạt động mượt mà.

**Khó khăn:** Canvas API phức tạp khi tích hợp drag-to-pan + zoom + crop trong cùng 1 component — mất 1.5 ngày để hoàn thiện.

---

#### Tuần 4 (22/03 – 28/03/2026) — Contract & Attendance

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | Quản lý hợp đồng (tạo, chấm dứt, cảnh báo hết hạn), check-in/check-out GPS realtime (Haversine formula), upsert chấm công thủ công |
| **BA** | Viết Use Case UC-04 (Hợp đồng), UC-05 (Chấm công); phân tích quy trình nghỉ phép |
| **Tester** | Kiểm thử hợp đồng (8 TC), chấm công (12 TC); phát hiện **BUG-01** timer check-in |

**Kết quả:** Module hợp đồng và chấm công GPS hoàn chỉnh.

**Khó khăn:** **BUG-01** — Timer hiển thị "497222:13:42" do Prisma lưu `@db.Time()` không có date component; fix bằng hàm `normalizeTime()`. Đây là bug khó nhất tuần này, mất gần 1 ngày để debug.

---

#### Tuần 5 (29/03 – 04/04/2026) — Leave & Business Trip

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | Đơn nghỉ phép (6 loại, tính ngày làm việc bỏ T7/CN, quỹ phép), công tác (tạo đề xuất, duyệt/từ chối), phân quyền dữ liệu cấp hàng |
| **BA** | Viết Use Case UC-06 (Nghỉ phép), UC-08 (Công tác), vẽ Activity Diagram quy trình duyệt đơn |
| **Tester** | Kiểm thử nghỉ phép (12 TC), công tác (8 TC); kiểm tra phân quyền dữ liệu |

**Kết quả:** Leave Management và Business Trip hoàn chỉnh.

**Khó khăn:** BA và Dev không thống nhất về cách tính `totalDays` — BA muốn tính cả T7, Dev muốn bỏ T7/CN theo đúng nghiệp vụ. Sau 1 buổi họp nhóm, quyết định **bỏ T7/CN** theo quy định lao động Việt Nam.

---

#### Tuần 6 (05/04 – 11/04/2026) — Payroll Engine

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | Engine tính lương: lương cơ bản + phụ cấp + OT − BHXH(8%) − BHYT(1.5%) − BHTN(1%) − thuế TNCN lũy tiến 7 bậc; tính hàng loạt; xác nhận chi lương; tự động tạo phiếu lương |
| **BA** | Phân tích nghiệp vụ tính lương theo quy định VN (Nghị quyết 107/2023), viết tài liệu công thức, Activity Diagram tính lương |
| **Tester** | Kiểm thử 11 test case Payroll; phát hiện **BUG-03** phiếu lương hiển thị 0đ |

**Kết quả:** Payroll engine chính xác, phiếu lương tự động tạo sau khi tính.

**Khó khăn:** **BUG-03** — Phiếu lương hiển thị 0đ cho Gross, Net, BHXH do sai field mapping (4 field). Thêm vào đó, đây là module phức tạp nhất — thuế TNCN lũy tiến 7 bậc phải đối chiếu kỹ với văn bản pháp luật.

---

#### Tuần 7 (12/04 – 18/04/2026) — Dashboard & Career History

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | 6 dashboard theo vai trò (Admin/Director/HR/Accountant/Manager/Employee), Recharts (line/bar/pie/doughnut), lịch sử công tác (9 loại sự kiện, auto-update Employee) |
| **BA** | Viết Use Case UC-11 (Dashboard), UC-09 (Career History); phân tích KPI từng dashboard |
| **Tester** | Kiểm thử 8 TC Dashboard, 8 TC Career History; phát hiện **BUG-02** dashboard Manager |

**Kết quả:** Toàn bộ 6 dashboard hoạt động, Career History hoàn chỉnh.

**Khó khăn:** Dashboard Director dùng `Promise.allSettled` với 5 query song song — debugging khi 1 query fail mà không crash toàn bộ tốn nhiều công sức. **BUG-02** phát hiện và fix trong cùng ngày.

---

#### Tuần 8 (19/04 – 25/04/2026) — Export & UI/UX

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | Export Excel (SheetJS) và PDF (jsPDF) cho chấm công, phiếu lương, báo cáo; song ngữ VI/EN (i18n maps); dark/light mode (React Context + CSS variables); floating sidebar hover-expand |
| **BA** | Viết tài liệu hướng dẫn sử dụng (Chương 9); chuẩn bị nội dung báo cáo đồ án |
| **Tester** | Regression test toàn hệ thống; kiểm thử 8 TC Export, 10 TC UI/UX; kiểm tra responsive |

**Kết quả:** Giao diện hoàn thiện, export hoạt động, dark mode mượt mà.

**Khó khăn:** Tuần này cả nhóm đều bận với các đồ án và bài thi môn khác — khó sắp xếp thời gian gặp nhau. Giải quyết bằng cách chia task nhỏ và làm việc async qua GitHub.

---

#### Tuần 9 (26/04 – 02/05/2026) — Hoàn thiện & Demo

| Vai trò | Công việc thực hiện |
|---------|---------------------|
| **Dev** | Fix bug cuối, seed data 63 nhân viên + 6 tháng dữ liệu lịch sử (T12/2025→T5/2026), auto-sync service cập nhật chấm công hàng ngày, chuẩn bị tài khoản demo |
| **BA** | Hoàn thiện báo cáo đồ án (Chương 1–9), kiểm tra UML diagrams, chuẩn bị slide thuyết trình |
| **Tester** | Final testing toàn hệ thống, viết báo cáo kiểm thử (Chương 8), chuẩn bị kịch bản demo |

**Kết quả:** Hệ thống ổn định, tài liệu đầy đủ, sẵn sàng bảo vệ đồ án.

**Khó khăn:** Cân bằng giữa việc thêm tính năng mới và đảm bảo hệ thống ổn định — nhóm quyết định **đóng băng tính năng** từ 28/04, chỉ fix bug và viết tài liệu.


---

## 10.3 Tự đánh giá từng thành viên

### 10.3.1 Hoàng Thái Đăng Khoa — MSSV 52400017 (Dev chính + PM)

#### Công việc đã hoàn thành
- Thiết kế và xây dựng toàn bộ kiến trúc hệ thống (Next.js 16, Prisma, PostgreSQL)
- Cài đặt 12 module nghiệp vụ với ~50,000 dòng code
- Xây dựng Payroll Engine tính lương theo đúng quy định pháp luật Việt Nam
- Thiết kế hệ thống RBAC 6 vai trò với phân quyền dữ liệu cấp hàng
- Quản lý tiến độ nhóm, phân công task và giải quyết xung đột kỹ thuật

#### Kỹ năng học được / cải thiện

| Kỹ năng | Trước dự án | Sau dự án |
|---------|------------|----------|
| Next.js App Router | Cơ bản | Thành thạo (Server Actions, Middleware, Route Handlers) |
| Prisma ORM | Chưa biết | Thành thạo (Relations, Transactions, Upsert) |
| NextAuth v5 | Chưa biết | Nắm vững (JWT, Credentials, Callbacks) |
| Thiết kế DB | Trung bình | Khá (13 bảng, constraints, indexes) |
| Quản lý dự án | Ít kinh nghiệm | Cải thiện rõ rệt (sprint planning, task breakdown) |

#### Khó khăn và cách giải quyết
- **Áp lực thời gian:** Phải cân bằng giữa AXIOM HRM và 3 môn học khác. Giải pháp: lập lịch cố định mỗi ngày 3–4 tiếng cho dự án.
- **Module Payroll phức tạp:** Thuế TNCN lũy tiến 7 bậc cần đọc kỹ văn bản pháp luật. Giải pháp: BA cung cấp tài liệu nghiệp vụ chi tiết, Dev chỉ cần implement đúng công thức.
- **Debug một mình:** Nhiều bug phức tạp (BUG-01, BUG-03) không có ai review. Giải pháp: dùng AI (Gemini, Claude) để brainstorm nguyên nhân.

#### Tự đánh giá

| Tiêu chí | Điểm tự đánh giá |
|----------|:----------------:|
| Hoàn thành khối lượng công việc | 9/10 |
| Chất lượng code | 8/10 |
| Tinh thần teamwork | 8/10 |
| Quản lý thời gian | 7/10 |
| **Tổng thể** | **8/10** |

---

### 10.3.2 Lê Minh Gia Bảo — MSSV 52400004 (BA — Business Analyst)

#### Công việc đã hoàn thành
- Phân tích nghiệp vụ và viết SRS đầy đủ cho 12 module
- Thiết kế 11+ Use Case diagram, 3 Activity Diagram, 1 Class Diagram
- Viết báo cáo đồ án (Chương 1–10), tài liệu hướng dẫn sử dụng
- Chuẩn bị slide thuyết trình và kịch bản demo
- Nghiên cứu quy định pháp luật (thuế TNCN, bảo hiểm) để cung cấp cho Dev

#### Kỹ năng học được / cải thiện

| Kỹ năng | Trước dự án | Sau dự án |
|---------|------------|----------|
| Viết SRS | Cơ bản (lý thuyết) | Thực hành được trên dự án thực |
| Vẽ Use Case / Activity Diagram | Trung bình | Thành thạo công cụ draw.io |
| Phân tích nghiệp vụ HRM | Chưa biết | Hiểu quy trình HR thực tế |
| Viết tài liệu kỹ thuật | Trung bình | Cải thiện đáng kể |
| Làm việc với Dev | Ít kinh nghiệm | Học được cách diễn đạt yêu cầu rõ ràng hơn |

#### Khó khăn và cách giải quyết
- **Xung đột quan điểm BA ↔ Dev:** Ví dụ: cách tính ngày nghỉ phép (có/không tính Thứ 7/Chủ nhật). Giải pháp: tổ chức họp nhóm, tham khảo quy định pháp luật lao động VN làm cơ sở quyết định.
- **Tài liệu BA phải đi trước Dev:** Áp lực phải hoàn thành Use Case trước khi Dev bắt đầu module mới. Giải pháp: làm việc song song — BA viết Use Case module tiếp theo trong khi Dev đang code module hiện tại.
- **Kiến thức pháp luật lao động:** Phải tự nghiên cứu về BHXH, thuế TNCN. Dùng Gemini để tóm tắt văn bản pháp luật dài.

#### Tự đánh giá

| Tiêu chí | Điểm tự đánh giá |
|----------|:----------------:|
| Hoàn thành khối lượng công việc | 8/10 |
| Chất lượng tài liệu | 8/10 |
| Tinh thần teamwork | 9/10 |
| Quản lý thời gian | 7/10 |
| **Tổng thể** | **8/10** |

---

### 10.3.3 Lê Tuấn Kiệt — MSSV 52400133 (Tester)

#### Công việc đã hoàn thành
- Lập kế hoạch kiểm thử và viết 132 test case cho 12 module + Security + UI/UX
- Thực hiện kiểm thử thủ công (Black-box, Boundary Value, Equivalence Partitioning)
- Phát hiện và báo cáo 5 bug (BUG-01 → BUG-05), theo dõi đến khi fix xong
- Thực hiện regression test sau mỗi lần fix bug
- Viết báo cáo kiểm thử (Chương 8)

#### Kỹ năng học được / cải thiện

| Kỹ năng | Trước dự án | Sau dự án |
|---------|------------|----------|
| Viết test case | Cơ bản (lý thuyết) | Thực hành với 132 TC thực tế |
| Kiểm thử phân quyền | Chưa biết | Hiểu security testing cơ bản |
| Chrome DevTools | Ít dùng | Thành thạo Network tab, Console, Responsive |
| Boundary Value Analysis | Lý thuyết | Áp dụng thực tế (GPS 500m, bậc thuế) |
| Bug reporting | Chưa biết | Viết bug report đầy đủ (mô tả, nguyên nhân, cách fix) |

#### Khó khăn và cách giải quyết
- **Kiểm thử tính năng phức tạp:** GPS check-in và tính lương đòi hỏi hiểu sâu nghiệp vụ. Giải pháp: đọc kỹ tài liệu BA trước khi viết test case; dùng Claude để sinh thêm edge case tiềm ẩn.
- **Không có môi trường test riêng:** Tester và Dev dùng chung DB dev — dữ liệu hay bị xung đột. Giải pháp: thống nhất quy ước tên tài khoản test và thời gian test riêng biệt.

#### Tự đánh giá

| Tiêu chí | Điểm tự đánh giá |
|----------|:----------------:|
| Hoàn thành khối lượng công việc | 8/10 |
| Chất lượng test case | 8/10 |
| Tinh thần teamwork | 9/10 |
| Quản lý thời gian | 7/10 |
| **Tổng thể** | **8/10** |

---

## 10.4 Ứng dụng Trí tuệ Nhân tạo (AI) trong Dự án

### 10.4.1 Tổng quan

Nhóm sử dụng AI như một **công cụ hỗ trợ có chọn lọc** — không phải để thay thế quá trình tư duy và lập trình, mà để tăng tốc một số bước cụ thể trong quy trình phát triển. Toàn bộ mã nguồn hệ thống được nhóm tự viết và kiểm soát; AI được dùng chủ yếu cho giai đoạn **lập kế hoạch, thiết kế UI, và kiểm thử**.

### 10.4.2 Danh sách công cụ AI sử dụng

| Công cụ | Người dùng chủ yếu | Mục đích sử dụng |
|---------|-------------------|-----------------|
| **Google Gemini** | BA (52400004), Dev (52400017) | Tóm tắt văn bản pháp luật (BHXH, thuế TNCN), hỏi về kiến trúc hệ thống, giải thích lỗi |
| **Claude (Anthropic)** | Dev (52400017), Tester (52400133) | Brainstorm nguyên nhân bug khó, sinh test case edge case, review logic nghiệp vụ |
| **Figma AI** | BA (52400004) | Gợi ý layout UI, tạo wireframe nhanh trước khi Dev cài đặt |

### 10.4.3 Chi tiết từng trường hợp sử dụng AI

#### Trường hợp 1 — Nghiên cứu thuế TNCN (BA + Gemini)

**Vấn đề:** Nghị quyết 107/2023/QH15 về thuế TNCN dài và phức tạp. BA cần tóm tắt đúng biểu thuế 7 bậc để cung cấp cho Dev.

**Cách dùng:** BA dùng Gemini tóm tắt nội dung pháp lý, trích xuất mức thuế suất và ngưỡng chịu thuế. Sau đó tự đối chiếu lại với văn bản gốc trước khi đưa cho Dev.

**Kết quả:** Tiết kiệm ~2 giờ đọc văn bản pháp luật. Công thức thuế TNCN trong Payroll Engine chính xác 100%.

---

#### Trường hợp 2 — Debug BUG-01 (Dev + Claude)

**Vấn đề:** Timer check-in hiển thị "497222:13:42" — lỗi kỳ lạ không rõ nguyên nhân.

**Cách dùng:** Dev mô tả triệu chứng và đoạn code cho Claude. AI gợi ý khả năng liên quan đến epoch time (01/01/1970) khi trường thời gian DB không có date component.

**Kết quả:** AI đưa ra đúng hướng debug. Dev tự viết hàm normalizeTime() để fix. **Thời gian debug giảm từ ~1 ngày xuống ~3 tiếng.**

---

#### Trường hợp 3 — Sinh test case edge case (Tester + Claude)

**Vấn đề:** Tester cần đảm bảo không bỏ sót test case quan trọng với các module phức tạp như Payroll và GPS.

**Cách dùng:** Tester cung cấp đặc tả Use Case cho Claude và yêu cầu liệt kê edge case tiềm ẩn. AI gợi ý thêm ~15 TC ngoài danh sách ban đầu.

**Kết quả:** Phát hiện thêm test case quan trọng như: "NV không có hợp đồng trong batch tính lương", "Check-in đúng mốc 07:30 (boundary value)". Một số TC dẫn đến phát hiện bug mới.

---

#### Trường hợp 4 — Thiết kế UI wireframe (BA + Figma AI)

**Vấn đề:** BA cần cung cấp wireframe cho Dev trước mỗi module UI để tránh hiểu sai yêu cầu giao diện.

**Cách dùng:** Dùng Figma AI tạo wireframe nhanh cho Dashboard, Employee List, Leave Request. Dev dùng wireframe làm tham khảo, tự cài đặt theo Design System của nhóm.

**Kết quả:** Giảm xung đột do hiểu sai yêu cầu giao diện; rút ngắn thời gian trao đổi giữa BA và Dev.

---

### 10.4.4 Đánh giá hiệu quả và hạn chế

| Khía cạnh | Đánh giá |
|-----------|----------|
| **Hiệu quả** | Tăng tốc nghiên cứu pháp luật, rút ngắn thời gian debug, mở rộng độ phủ test case |
| **Tỷ lệ sử dụng** | Thấp (~5–10% tổng effort) — AI chỉ hỗ trợ giai đoạn phân tích và debug, không tham gia lập trình |
| **Hạn chế** | AI đôi khi đưa ra hướng gợi ý sai hoặc không phù hợp context cụ thể — luôn cần verify lại |
| **Nguyên tắc** | Không copy-paste code từ AI; luôn hiểu rõ gợi ý trước khi áp dụng; AI là "đồng nghiệp tư vấn", không phải "người thay thế" |

---

### 10.4.5 Các trường hợp AI mắc lỗi

Trong quá trình sử dụng AI hỗ trợ, nhóm ghi nhận nhiều trường hợp AI đưa ra gợi ý **sai hoặc không phù hợp**. Việc ghi lại các trường hợp này nhằm minh bạch quá trình làm việc và rút kinh nghiệm cho các dự án sau.

---

#### Lỗi 1 — Gợi ý sai số bậc thuế TNCN

| Hạng mục | Chi tiết |
|----------|----------|
| **Công cụ** | Gemini |
| **Người gặp** | BA (52400004) |
| **Mô tả lỗi** | Khi hỏi về biểu thuế TNCN Việt Nam, AI ban đầu trả lời biểu thuế gồm **5 bậc** thay vì đúng **7 bậc** theo Luật Thuế TNCN Điều 22. AI nhầm lẫn với biểu thuế rút gọn dùng trong một số tài liệu tham khảo cũ |
| **Hậu quả** | Nếu không kiểm tra lại, engine tính lương sẽ tính sai thuế cho nhân viên có thu nhập chịu thuế trên 32 triệu/tháng |
| **Cách phát hiện** | BA đối chiếu với văn bản gốc Luật Thuế TNCN và phát hiện thiếu 2 bậc (bậc 6: 30%, bậc 7: 35%) |
| **Bài học** | Luôn đối chiếu output AI với văn bản pháp luật gốc — đặc biệt với dữ liệu có tính pháp lý |

---

#### Lỗi 2 — Gợi ý sai cách lưu trữ thời gian check-in

| Hạng mục | Chi tiết |
|----------|----------|
| **Công cụ** | Claude |
| **Người gặp** | Dev (52400017) |
| **Mô tả lỗi** | Khi hỏi cách lưu giờ check-in/check-out trong PostgreSQL, AI gợi ý dùng kiểu `@db.Time()` (chỉ lưu giờ, không có ngày). Điều này dẫn đến **BUG-01** — khi client tính thời gian elapsed, nó so sánh với epoch 1970-01-01 và ra kết quả `497222:13:42` |
| **Hậu quả** | Timer check-in hiển thị sai hoàn toàn, mất ~1 ngày debug |
| **Cách phát hiện** | Tester phát hiện trong quá trình kiểm thử module Attendance (TC-05-07) |
| **Cách khắc phục** | Dev tự viết hàm `normalizeTime()` ghép giờ từ DB với ngày hôm nay trước khi tính elapsed |
| **Bài học** | AI không nắm được ngữ cảnh frontend-backend đồng thời — cần cân nhắc cách dữ liệu sẽ được sử dụng ở cả hai phía trước khi chọn kiểu dữ liệu |

---

#### Lỗi 3 — Gợi ý sai field name khi mapping Prisma → UI

| Hạng mục | Chi tiết |
|----------|----------|
| **Công cụ** | Claude |
| **Người gặp** | Dev (52400017) |
| **Mô tả lỗi** | Khi được hỏi cách hiển thị phiếu lương từ dữ liệu Prisma, AI sử dụng các field name khác với schema thực tế: `basicSalary` thay vì `grossSalary`, `allowances` thay vì `allowance`, `overtimePay` thay vì `otPay`, `pit` thay vì `taxAmount`. Kết quả: phiếu lương hiển thị `0đ` ở tất cả các cột |
| **Hậu quả** | Tạo ra **BUG-03** — phiếu lương hoàn toàn sai, mất thêm thời gian debug để tìm ra 4 field bị mapping sai |
| **Cách phát hiện** | Tester phát hiện khi kiểm thử TC-08-07 |
| **Bài học** | AI không có quyền truy cập vào schema Prisma thực tế của dự án — luôn cần đối chiếu tên field với `schema.prisma` trước khi dùng |

---

#### Lỗi 4 — Gợi ý code không tương thích NextAuth v5

| Hạng mục | Chi tiết |
|----------|----------|
| **Công cụ** | Gemini, Claude |
| **Người gặp** | Dev (52400017) |
| **Mô tả lỗi** | Cả 2 AI đều gợi ý cú pháp của NextAuth **v4** (ví dụ: `import NextAuth from "next-auth"`, `getServerSession(authOptions)`) thay vì v5 (`import { auth } from "@/lib/auth"`, `auth()`). NextAuth v5 thay đổi hoàn toàn API surface so với v4, nhưng AI chưa cập nhật vì tài liệu v5 còn mới |
| **Hậu quả** | Code không compile được, mất gần 1 ngày tự đọc tài liệu NextAuth v5 chính thức để viết lại callback `authorize()` và cấu hình JWT |
| **Cách phát hiện** | Dev thử chạy code do AI gợi ý → lỗi ngay lúc build |
| **Bài học** | AI thường không cập nhật kịp với phiên bản mới nhất của thư viện — cần đọc changelog và tài liệu chính thức khi dùng phiên bản mới |

---

#### Lỗi 5 — Gợi ý test case không phù hợp nghiệp vụ VN

| Hạng mục | Chi tiết |
|----------|----------|
| **Công cụ** | Claude |
| **Người gặp** | Tester (52400133) |
| **Mô tả lỗi** | Khi sinh test case cho module Payroll, AI gợi ý kiểm tra "overtime rate 1.25× cho ngày thường" — đây là hệ số OT theo luật lao động Mỹ (FLSA). Hệ số đúng theo pháp luật Việt Nam là **1.5× ngày thường, 2.0× cuối tuần, 3.0× ngày lễ** |
| **Hậu quả** | Nếu dùng trực tiếp, test case sẽ kiểm tra sai hệ số, dẫn đến kết quả "Pass" giả trên logic sai |
| **Cách phát hiện** | Tester đối chiếu với tài liệu nghiệp vụ do BA cung cấp trước khi sử dụng |
| **Bài học** | AI training data thiên về luật pháp quốc tế (Mỹ, EU) — khi áp dụng cho nghiệp vụ Việt Nam cần luôn kiểm tra lại với quy định trong nước |

---

#### Lỗi 6 — Gợi ý cách tính ngày nghỉ phép sai

| Hạng mục | Chi tiết |
|----------|----------|
| **Công cụ** | Gemini |
| **Người gặp** | BA (52400004) |
| **Mô tả lỗi** | Khi hỏi cách tính `totalDays` cho đơn nghỉ phép, AI gợi ý công thức `endDate - startDate + 1` (tính cả Thứ 7 và Chủ nhật). Tuy nhiên, theo quy định lao động Việt Nam và nghiệp vụ thực tế, phép năm chỉ tính ngày làm việc (bỏ T7/CN) |
| **Hậu quả** | Ban đầu BA và Dev tranh luận về cách tính (vì BA tham khảo gợi ý AI). Mất 1 buổi họp nhóm để thống nhất |
| **Cách phát hiện** | Dev đặt câu hỏi ngược: "Nếu nghỉ từ Thứ 6 đến Thứ 2 tuần sau, nhân viên mất bao nhiêu ngày phép?" — cả nhóm đồng ý là 2 ngày, không phải 4 |
| **Bài học** | Không nên để AI quyết định logic nghiệp vụ — cần thảo luận nhóm và tham khảo quy định pháp luật lao động |

---

### Bảng 10.4 — Tổng hợp lỗi AI

| # | Loại lỗi | Công cụ | Mức độ ảnh hưởng | Phát hiện bởi |
|---|----------|---------|:----------------:|:-------------:|
| 1 | Sai dữ liệu pháp lý (thuế 5 bậc thay vì 7) | Gemini | 🔴 Cao | BA đối chiếu văn bản gốc |
| 2 | Sai kiểu dữ liệu DB (`@db.Time`) | Claude | 🔴 Cao — gây BUG-01 | Tester kiểm thử |
| 3 | Sai field name Prisma (4 field) | Claude | 🔴 Cao — gây BUG-03 | Tester kiểm thử |
| 4 | Code không tương thích NextAuth v5 | Cả hai | 🟡 Trung bình | Dev tự phát hiện khi build |
| 5 | Sai hệ số OT (luật Mỹ thay vì VN) | Claude | 🟡 Trung bình | Tester đối chiếu tài liệu BA |
| 6 | Sai cách tính ngày phép (tính cả T7/CN) | Gemini | 🟡 Trung bình | Thảo luận nhóm |

> **Kết luận:** 6/6 lỗi AI đều được phát hiện **trước khi vào production** nhờ quy trình review chéo (BA ↔ Dev ↔ Tester). Điều này khẳng định rằng AI là công cụ hỗ trợ hữu ích nhưng **không thể thay thế sự kiểm tra của con người**, đặc biệt với dữ liệu pháp lý và nghiệp vụ đặc thù Việt Nam.

---

## 10.5 Hạn chế của dự án

Bên cạnh những kết quả đạt được, nhóm nhìn nhận thắc một số hạn chế cần cải thiện:

### Bảng 10.2 — Hạn chế và hướng khắc phục

| Hạn chế | Mô tả | Hướng khắc phục |
|---------|-------|-------------------|
| **Kiểm thử chỉ thủ công** | Toàn bộ 132 TC được kiểm thử thủ công, chưa có automation test. Khi có thay đổi code phải test lại toàn bộ | Tích hợp Jest + Testing Library để có test suite tự động |
| **Chưa deploy production** | Hệ thống chỉ chạy local (localhost), chưa có domain thực thụ và HTTPS | Deploy lên Vercel (Next.js) + Supabase / Railway (PostgreSQL) |
| **Dữ liệu demo** | Dữ liệu seed có sẵn (63 NV, 6 tháng) — chưa qua quy trình nhập liệu thực tế từ doanh nghiệp | Thu thập dữ liệu thực, xây dựng quy trình import CSV |
| **Thông báo real-time chưa có** | HR/Manager phải tự vào xem có đơn chờ duyệt, không được push notification | Tích hợp WebSocket (Socket.io) hoặc Server-Sent Events |
| **GPS chỉ hoạt động trên HTTPS** | Browser yêu cầu HTTPS để dùng Geolocation API — trên HTTP (localhost) phải vào Setting trình duyệt cho phép thủ công | Deploy HTTPS là đủ khắc phục; hoặc dùng ngrok khi demo local |
| **Chưa có Audit Log** | Hệ thống không ghi lại lịch sử ai đã sửa gì, khó kiểm toán khi có tranh chấp | Thêm bảng `AuditLog` ghi lại mọi hành động CRUD |
| **Thời gian hạn hẹp** | 9 tuần làm song song với nhiều môn học khác — một số tính năng (Audit Log, CI/CD) phải bỏ qua để đảm bảo chất lượng các module cốt lõi | Dành thêm 2–4 tuần sau kỳ thi để hoàn thiện |

---

## 10.6 Hướng phát triển tương lai

Hệ thống AXIOM HRM trong phạm vi đồ án đã hoàn thành đầy đủ các chức năng cơ bản của một HRM doanh nghiệp. Tuy nhiên, có nhiều hướng mở rộng tiềm năng nếu tiếp tục phát triển:

### Bảng 10.3 — Các tính năng đề xuất mở rộng

| STT | Tính năng | Mô tả | Độ ưu tiên |
|-----|-----------|-------|------------|
| 1 | **PWA (Progressive Web App)** | Đóng gói web app hiện tại thành PWA — người dùng có thể cài lên màn hình chính, dùng offline một phần, nhận push notification | Cao |
| 2 | **Nhận diện khuôn mặt** | Tích hợp Face Recognition vào check-in thay thế GPS — chính xác hơn và chống gian lận | Cao |
| 3 | **Notification real-time** | WebSocket (Socket.io) thông báo tức thì khi có đơn chờ duyệt, hợp đồng sắp hết hạn | Trung bình |
| 4 | **Chuyển lương tự động** | Tích hợp API ngân hàng (Vietcombank, Napas) để chuyển lương tự động sau khi xác nhận chi | Cao |
| 5 | **Multi-company** | Hỗ trợ nhiều công ty trên cùng 1 hệ thống (multi-tenant architecture) | Trung bình |
| 6 | **AI Chatbot HR** | Chatbot hỗ trợ nhân viên hỏi về chính sách phép năm, quy định bảo hiểm, lương tháng này | Thấp |
| 7 | **Báo cáo nâng cao** | Thêm biểu đồ phân tích xu hướng nhân sự (turnover rate, headcount forecast) | Trung bình |
| 8 | **Audit Log** | Ghi lại toàn bộ lịch sử thay đổi dữ liệu (ai sửa cái gì, lúc nào) để kiểm toán | Cao |

### Các cải tiến kỹ thuật cần thiết

- **Unit Testing tự động:** Hiện tại chỉ có kiểm thử thủ công. Cần tích hợp Jest + Testing Library để có test suite tự động chạy mỗi lần deploy.
- **CI/CD Pipeline:** Thiết lập GitHub Actions để tự động build, test và deploy khi có code mới push lên main branch.
- **Caching tầng:** Thêm Redis cache cho các query phức tạp của Dashboard Director để cải thiện hiệu năng.
- **Docker:** Đóng gói toàn bộ ứng dụng (Next.js + PostgreSQL + Redis) vào Docker Compose để dễ dàng deploy lên mọi môi trường.

---

