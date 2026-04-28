# UML Diagrams — Axiom HRM

> **Tổng: 31 file PlantUML** — Paste vào https://www.plantuml.com/plantuml/uml/ để render

## Cách sử dụng

1. Mở file `.puml` bất kỳ → Copy toàn bộ nội dung
2. Truy cập: **https://www.plantuml.com/plantuml/uml/**
3. Paste → nhấn **"PNG"** hoặc **"SVG"** để tải về

**VS Code:** Cài extension **"PlantUML"** by jebbs → mở `.puml` → `Alt+D` preview

---

## Cấu trúc thư mục

```
UML/
├── README.md
├── usecase/              ← 12 Use Case Diagrams (Chương 4)
│   ├── uc-00-tong-quat.puml      Hình 4.1  — UC Tổng quát
│   ├── uc-01-xac-thuc.puml       Hình 4.2  — Xác thực
│   ├── uc-02-nhan-vien.puml      Hình 4.3  — Quản lý nhân viên
│   ├── uc-03-hop-dong.puml       Hình 4.4  — Quản lý hợp đồng
│   ├── uc-04-cham-cong.puml      Hình 4.5  — Chấm công GPS
│   ├── uc-05-nghi-phep.puml      Hình 4.6  — Nghỉ phép
│   ├── uc-06-tinh-luong.puml     Hình 4.7  — Tính lương
│   ├── uc-07-phieu-luong.puml    Hình 4.8  — Phiếu lương
│   ├── uc-08-cong-tac-phi.puml   Hình 4.9  — Công tác phí
│   ├── uc-09-qua-trinh-ct.puml   Hình 4.10 — Quá trình công tác
│   ├── uc-10-rbac.puml           Hình 4.11 — RBAC
│   └── uc-11-dashboard.puml      Hình 4.12 — Dashboard
│
├── class-erd/            ← Class Diagram + ERD (Chương 4)
│   ├── class-diagram.puml        Hình 4.13 — Class Diagram
│   └── erd.puml                  Hình 4.14 — ERD
│
├── gantt/                ← Gantt Chart (Chương 3)
│   └── gantt.puml                Hình 3.1  — Timeline dự án
│
├── activity/             ← 7 Activity Diagrams (Chương 6)
│   ├── act-dang-nhap.puml        Hình 6.1  — Đăng nhập
│   ├── act-dang-xuat.puml        Hình 6.2  — Đăng xuất
│   ├── act-checkin-gps.puml      Hình 6.3  — Check-in GPS
│   ├── act-checkout.puml         Hình 6.4  — Check-out
│   ├── act-nghi-phep.puml        Hình 6.5  — Đăng ký nghỉ phép
│   ├── act-duyet-phep.puml       Hình 6.6  — Duyệt nghỉ phép
│   └── act-tinh-luong.puml       Hình 6.7  — Tính lương tự động
│
├── sequence/             ← 5 Sequence Diagrams (Chương 6)
│   ├── seq-dang-nhap.puml        Hình 6.8  — Đăng nhập
│   ├── seq-checkin-gps.puml      Hình 6.9  — Check-in GPS
│   ├── seq-tinh-luong.puml       Hình 6.10 — Tính lương
│   ├── seq-duyet-phep.puml       Hình 6.11 — Duyệt nghỉ phép
│   └── seq-xuat-pdf.puml         Hình 6.12 — Xuất PDF phiếu lương
│
└── state/                ← 4 State Diagrams (Chương 6)
    ├── state-nghi-phep.puml      Hình 6.13 — Đơn nghỉ phép
    ├── state-hop-dong.puml       Hình 6.14 — Hợp đồng
    ├── state-cham-cong.puml      Hình 6.15 — Chấm công
    └── state-cong-tac.puml       Hình 6.16 — Công tác phí
```
