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

# TÀI LIỆU THAM KHẢO

**Tiếng Việt**

Quốc hội nước CHXHCN Việt Nam (2019). *Bộ luật Lao động số 45/2019/QH14*, ban hành 20/11/2019.

Quốc hội nước CHXHCN Việt Nam (2007). *Luật Thuế Thu nhập cá nhân số 04/2007/QH12 và các văn bản sửa đổi, bổ sung*, ban hành 21/11/2007.

Chính phủ nước CHXHCN Việt Nam (2022). *Nghị định 38/2022/NĐ-CP quy định mức lương tối thiểu đối với người lao động làm việc theo hợp đồng lao động*, ban hành 12/06/2022.

Bộ Lao động — Thương binh và Xã hội (2015). *Thông tư 59/2015/TT-BLĐTBXH quy định chi tiết và hướng dẫn thi hành một số điều của Luật BHXH*, ban hành 29/12/2015.

**Tiếng Anh**

IEEE Standards Association (1998). IEEE 830-1998 — Recommended Practice for Software Requirements Specifications.

Pressman, R. S. (2019). *Software Engineering: A Practitioner's Approach*, 9th Edition. McGraw-Hill.

Vercel Inc. (2026). Next.js 16 Documentation. https://nextjs.org/docs

Prisma Data Inc. (2026). Prisma ORM v7 Documentation. https://www.prisma.io/docs

The PostgreSQL Global Development Group (2026). PostgreSQL 17 Documentation. https://www.postgresql.org/docs/17

NextAuth.js Contributors (2026). Auth.js v5 Documentation. https://authjs.dev

Tailwind Labs (2026). Tailwind CSS v4 Documentation. https://tailwindcss.com/docs

Recharts Contributors (2026). Recharts — Composable charting library for React. https://recharts.org

Muracciole, D. (2026). @react-pdf/renderer — React renderer for creating PDF files. https://react-pdf.org
