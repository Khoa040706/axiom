# PHỤ LỤC

## Phụ lục A — Biên bản họp nhóm

### Biên bản họp số 1

| Thông tin | Chi tiết |
|-----------|---------|
| **Ngày họp** | 01/03/2026 |
| **Hình thức** | Trực tiếp |
| **Thành phần** | Thành viên 1, Thành viên 2, Thành viên 3 |
| **Nội dung** | Phân tích yêu cầu đề tài, phân chia module, lựa chọn công nghệ |

**Kết quả thống nhất:**
- Tên đề tài: Hệ thống Quản lý Nhân sự và Tiền lương (Axiom HRM)
- Công nghệ: Next.js 15 + TypeScript + PostgreSQL + Prisma
- Phân chia: Thành viên 1 (Auth/HR), Thành viên 2 (Chấm công/Leave), Thành viên 3 (Payroll/Dashboard)

*(Ký tên)*

| Thành viên 1 | Thành viên 2 | Thành viên 3 |
|:---:|:---:|:---:|
| *(ký)* | *(ký)* | *(ký)* |

---

### Biên bản họp số 2

| Thông tin | Chi tiết |
|-----------|---------|
| **Ngày họp** | 15/03/2026 |
| **Hình thức** | Trực tiếp |
| **Thành phần** | Thành viên 1, Thành viên 2, Thành viên 3 |
| **Nội dung** | Review tiến độ tuần 2-3, demo tính năng CRUD nhân viên và xác thực đăng nhập |

**Kết quả:**
- Authentication và RBAC hoàn thành, 6 role hoạt động đúng
- CRUD nhân viên, hợp đồng hoàn thành
- Tuần tới: triển khai chấm công GPS và nghỉ phép

*(Ký tên)*

| Thành viên 1 | Thành viên 2 | Thành viên 3 |
|:---:|:---:|:---:|
| *(ký)* | *(ký)* | *(ký)* |

---

### Biên bản họp số 3

| Thông tin | Chi tiết |
|-----------|---------|
| **Ngày họp** | 05/04/2026 |
| **Hình thức** | Trực tiếp |
| **Thành phần** | Thành viên 1, Thành viên 2, Thành viên 3 |
| **Nội dung** | Review toàn hệ thống, kiểm thử tích hợp, phát hiện và sửa lỗi GPS check-in, lỗi tính lương 0 ngày công |

**Kết quả:**
- Fix lỗi: seed status "Đi muộn" không được đếm ngày công → sửa query `status: { in: ["Đi làm", "Đi muộn"] }`
- Fix lỗi: history hiển thị 7 bản ghi cũ nhất → sửa thành `slice(-7).reverse()`
- Fix phân quyền trang nghỉ phép: Employee không thấy đơn của người khác

*(Ký tên)*

| Thành viên 1 | Thành viên 2 | Thành viên 3 |
|:---:|:---:|:---:|
| *(ký)* | *(ký)* | *(ký)* |

---

### Biên bản họp số 4

| Thông tin | Chi tiết |
|-----------|---------|
| **Ngày họp** | 26/04/2026 |
| **Hình thức** | Trực tiếp |
| **Thành phần** | Thành viên 1, Thành viên 2, Thành viên 3 |
| **Nội dung** | Hoàn thiện báo cáo đồ án, phân chia viết các chương, kiểm tra lại toàn bộ hệ thống |

**Kết quả:**
- Hệ thống hoàn chỉnh 100%, tất cả test case Pass
- Báo cáo hoàn thành đầy đủ 9 chương
- Chuẩn bị slide thuyết trình

*(Ký tên)*

| Thành viên 1 | Thành viên 2 | Thành viên 3 |
|:---:|:---:|:---:|
| *(ký)* | *(ký)* | *(ký)* |

---

## Phụ lục B — Biên bản bàn giao sản phẩm

| Thông tin | Chi tiết |
|-----------|---------|
| **Ngày bàn giao** | *(ngày bảo vệ)* |
| **Bên giao** | Nhóm 3 (Thành viên 1, 2, 3) |
| **Bên nhận** | *(Tên giảng viên)* |
| **Môn học** | Công nghệ Phần mềm |

### Danh mục sản phẩm bàn giao

| STT | Sản phẩm | Định dạng | Ghi chú |
|-----|---------|-----------|---------|
| 1 | Source code hệ thống Axiom HRM | GitHub repository | Next.js 15 + PostgreSQL |
| 2 | Báo cáo đồ án | PDF | 9 chương đầy đủ |
| 3 | Slide thuyết trình | PDF/PPTX | |
| 4 | Hướng dẫn cài đặt | SETUP.md | Trong thư mục docs/ |
| 5 | Tài khoản demo | tai-khoan-demo.md | 64 tài khoản |
| 6 | Script seed dữ liệu | scripts/ | Generate attendance + payroll |
| 7 | Video demo (nếu có) | MP4 | |

**Xác nhận bàn giao:**

| Bên giao | Bên nhận |
|:--------:|:--------:|
| Thành viên 1 *(ký)* | *(Giảng viên ký)* |

---

## Phụ lục C — Tài liệu tham khảo

[1] Next.js Documentation, Vercel Inc., truy cập 04/2026, https://nextjs.org/docs

[2] Prisma ORM Documentation, Prisma Data Inc., truy cập 04/2026, https://www.prisma.io/docs

[3] NextAuth.js v5 Documentation, truy cập 04/2026, https://next-auth.js.org

[4] Recharts Documentation, truy cập 04/2026, https://recharts.org

[5] jsPDF Documentation, truy cập 04/2026, https://artskydj.github.io/jsPDF

[6] IEEE 830-1998 Standard for Software Requirement Specifications, IEEE Standards Association, 1998

[7] Bộ luật Lao động số 45/2019/QH14, Quốc hội nước CHXHCN Việt Nam, 2019

[8] Luật Thuế Thu nhập cá nhân số 04/2007/QH12 và các văn bản sửa đổi, bổ sung

[9] Nghị định 38/2022/NĐ-CP về mức lương tối thiểu vùng

[10] Thông tư 59/2015/TT-BLĐTBXH hướng dẫn thực hiện Luật BHXH

[11] Howard Podeswa, *Business Analyst's Handbook*, Cengage Learning, 2009, ISBN: 978-1598635652
