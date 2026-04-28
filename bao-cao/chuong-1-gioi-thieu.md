# CHƯƠNG 1. GIỚI THIỆU ĐỒ ÁN (NGỮ CẢNH)

Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ tại các doanh nghiệp Việt Nam, việc quản lý nhân sự và tiền lương theo phương pháp truyền thống (sử dụng giấy tờ, bảng tính Excel rời rạc) ngày càng bộc lộ nhiều hạn chế: dữ liệu phân tán, dễ sai sót, thiếu minh bạch và tốn nhiều thời gian xử lý thủ công. Các bộ phận Nhân sự và Kế toán phải đối mặt với khối lượng công việc lặp đi lặp lại mỗi tháng — từ tổng hợp chấm công, xử lý đơn nghỉ phép, đến tính lương và phát hành phiếu lương cho từng nhân viên.

Nhận thức rõ những thách thức đó, nhóm chúng em đã phát triển **Axiom HRM** — một hệ thống Quản lý Nhân sự và Tiền lương toàn diện, hoạt động trên nền tảng web. Axiom HRM không chỉ là phần mềm quản lý đơn thuần, mà còn là một nền tảng tích hợp được thiết kế để xử lý xuyên suốt vòng đời nhân viên: từ khi ký hợp đồng, chấm công hàng ngày, quản lý nghỉ phép và công tác phí, cho đến tính toán lương thưởng tự động và xuất báo cáo tài chính cho ban lãnh đạo.

## 1.1 Mục tiêu đồ án

Mục tiêu chính của đồ án là xây dựng một hệ thống HRM có:

- **Kiến trúc phân quyền đa vai trò (RBAC):** 6 vai trò độc lập với giao diện, dữ liệu và quyền hạn riêng biệt (Admin, Director, HR Manager, Manager, Accountant, Employee).
- **Tự động hóa nghiệp vụ cốt lõi:**
  - Tính lương Gross → Net tự động theo công thức BHXH/BHYT/BHTN và Thuế TNCN theo biểu lũy tiến hiện hành.
  - Chấm công tích hợp GPS: xác minh vị trí nhân viên trước khi cho phép check-in.
  - Duyệt nghỉ phép theo luồng phê duyệt (Employee → Manager/HR → Approved/Rejected).
- **Hỗ trợ ra quyết định:** Dashboard thống kê trực quan với biểu đồ xu hướng lương, cơ cấu nhân lực, chấm công 6 tháng; xuất báo cáo PDF/Excel.
- **Trải nghiệm người dùng:** Giao diện hiện đại, hỗ trợ Dark Mode, đa ngôn ngữ (Tiếng Việt / English), responsive trên mobile và desktop.

## 1.2 Phạm vi đồ án

Hệ thống Axiom HRM bao gồm các phân hệ chức năng sau:

| Phân hệ | Mô tả |
|---------|-------|
| **Core HR** | Quản lý hồ sơ nhân viên, hợp đồng lao động, quá trình công tác |
| **Time & Attendance** | Chấm công GPS, tổng hợp ngày công, giờ OT, phút đi muộn |
| **Leave Management** | Đăng ký và duyệt nghỉ phép, quản lý quỹ phép năm |
| **Business Trip** | Quản lý lệnh công tác và phụ cấp công tác phí |
| **Payroll** | Tính lương tự động, phát hành phiếu lương, cấu hình tham số |
| **Reporting & Analytics** | Dashboard đa vai trò, xuất báo cáo PDF/Excel |
| **System Administration** | Quản lý tài khoản, phân quyền RBAC |

**Ngoài phạm vi:** Tích hợp máy chấm công vật lý, module tuyển dụng, đào tạo và đánh giá hiệu suất (KPI) — có thể mở rộng trong phiên bản tiếp theo.

## 1.3 Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Vanilla CSS |
| **Backend** | Next.js Server Actions (Server-side logic) |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 |
| **Authentication** | NextAuth.js v5 (Session-based) |
| **Biểu đồ** | Recharts |
| **Xuất PDF** | jsPDF + jsPDF-AutoTable |
| **Icons** | Lucide React |
| **Triển khai** | Localhost (môi trường demo) |

## 1.4 Đối tượng sử dụng

Hệ thống phục vụ các đối tượng người dùng sau trong một doanh nghiệp:

- **Ban lãnh đạo (Director):** Theo dõi KPI tổng thể, xu hướng nhân sự và quỹ lương.
- **Phòng Nhân sự (HR Manager):** Quản lý toàn bộ hồ sơ, hợp đồng, chấm công, nghỉ phép.
- **Trưởng phòng (Manager):** Duyệt đơn nghỉ phép và công tác của nhân viên trong phòng.
- **Kế toán (Accountant):** Tính lương, phát hành phiếu lương, quản lý cấu hình tham số tài chính.
- **Nhân viên (Employee):** Check-in/out GPS, xem phiếu lương, đăng ký nghỉ phép và công tác phí.
- **Quản trị viên (Admin):** Quản lý tài khoản và phân quyền toàn hệ thống.

## 1.5 Tài liệu tham khảo

[1]. Next.js Documentation, Vercel Inc., https://nextjs.org/docs  
[2]. Prisma ORM Documentation, Prisma Data Inc., https://www.prisma.io/docs  
[3]. NextAuth.js Documentation, https://next-auth.js.org  
[4]. IEEE 830-1998 Standard for Software Requirement Specifications, IEEE Standards Association  
[5]. Bộ luật Lao động Việt Nam 2019, Quốc hội nước CHXHCN Việt Nam  
[6]. Luật Thuế Thu nhập cá nhân và các văn bản hướng dẫn hiện hành  
[7]. Nghị định 38/2022/NĐ-CP về mức lương tối thiểu vùng
