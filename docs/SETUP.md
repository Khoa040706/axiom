# 🚀 SETUP – Hướng Dẫn Cài Đặt & Chạy App

> **Dự án:** HRM & Payroll System  
> **Tech Stack:** C# · .NET 6+ · WinForms · SQL Server (LocalDB)  
> **Nhóm:** 52400017 – 52400133 – 52400004

---

## 📋 Yêu cầu hệ thống

| Công cụ | Phiên bản | Link tải |
|---------|-----------|----------|
| **.NET SDK** | 6.0 hoặc mới hơn | https://dotnet.microsoft.com/download |
| **SQL Server** | LocalDB (kèm VS) hoặc Express | https://www.microsoft.com/sql-server |
| **Visual Studio** | 2022 (Community) | https://visualstudio.microsoft.com |
| **Git** | Bất kỳ | https://git-scm.com |

> 💡 Nếu dùng Visual Studio 2022, LocalDB đã được cài sẵn. Không cần cài SQL Server riêng.

---

## ⚙️ Bước 1 – Kiểm tra môi trường

Mở **PowerShell** hoặc **Command Prompt** trên Desktop, gõ từng lệnh:

```powershell
# Kiểm tra .NET SDK
dotnet --version
# Kết quả mong đợi: 6.0.xxx hoặc cao hơn

# Kiểm tra SQL Server LocalDB
sqllocaldb info
# Kết quả mong đợi: MSSQLLocalDB (hoặc tên instance tương tự)

# Kiểm tra Git
git --version
```

---

## 📥 Bước 2 – Clone dự án về máy

```powershell
# Di chuyển vào Desktop (hoặc thư mục bạn muốn)
cd "$env:USERPROFILE\Desktop"

# Clone repository (thay URL bằng link Git nhóm)
git clone https://github.com/<ten-nhom>/HRMPayroll.git

# Vào thư mục dự án
cd HRMPayroll
```

---

## 🗄️ Bước 3 – Tạo CSDL SQL Server

```powershell
# Tạo instance LocalDB (chỉ cần làm 1 lần)
sqllocaldb create "HRMPayrollDB"
sqllocaldb start "HRMPayrollDB"

# Kết nối vào SQL Server LocalDB và chạy script
sqlcmd -S "(LocalDB)\HRMPayrollDB" -i "Database\01_schema.sql"
sqlcmd -S "(LocalDB)\HRMPayrollDB" -i "Database\02_seed.sql"
sqlcmd -S "(LocalDB)\HRMPayrollDB" -i "Database\03_stored_procedures.sql"
```

> ✅ Sau bước này, CSDL đã có đầy đủ bảng và dữ liệu mẫu.

---

## 🔧 Bước 4 – Cấu hình Connection String

Mở file `HRMPayroll\App.config`, tìm dòng:

```xml
<connectionStrings>
  <add name="HRMPayrollDB"
       connectionString="Data Source=(LocalDB)\HRMPayrollDB;Initial Catalog=HRMPayrollDB;Integrated Security=True"
       providerName="System.Data.SqlClient" />
</connectionStrings>
```

> ⚠️ Nếu tên instance LocalDB khác (kiểm tra bằng `sqllocaldb info`), hãy thay `HRMPayrollDB` bằng tên đúng.

---

## ▶️ Bước 5 – Build & Chạy ứng dụng

### Cách 1: Dùng Terminal (dotnet CLI)

```powershell
# Vào thư mục project chính
cd HRMPayroll

# Restore các packages (NuGet)
dotnet restore

# Build dự án
dotnet build

# Chạy ứng dụng
dotnet run
```

### Cách 2: Dùng Visual Studio

```
1. Mở file HRMPayroll.sln bằng Visual Studio 2022
2. Nhấn F5 (hoặc nút ▶ Run) để build và chạy
```

---

## 👤 Tài khoản mẫu (sau khi seed DB)

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|--------------|----------|
| Admin | `admin` | `Admin@123` |
| HR Manager | `hr_manager` | `Hr@123` |
| Nhân viên | `nv001` | `Nv@123` |

> 🔐 Nhớ đổi mật khẩu sau lần đăng nhập đầu tiên khi deploy thật.

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: `A network-related error occurred while establishing a connection`
```
→ SQL Server LocalDB chưa chạy
→ Chạy: sqllocaldb start "HRMPayrollDB"
```

### Lỗi: `The type or namespace name could not be found`
```
→ Thiếu NuGet packages
→ Chạy: dotnet restore
```

### Lỗi: `Database HRMPayrollDB does not exist`
```
→ Chưa chạy script SQL
→ Thực hiện lại Bước 3
```

---

## 🔄 Cập nhật code mới nhất từ Git

```powershell
# Kéo code mới về
git pull origin main

# Build lại
dotnet build

# Chạy lại
dotnet run
```

---

## 📁 Cấu trúc thư mục quan trọng

```
HRMPayroll/
├── HRMPayroll.sln          ← Mở bằng Visual Studio
├── HRMPayroll/
│   ├── App.config          ← Sửa connection string
│   └── Program.cs          ← Entry point
├── Database/
│   ├── 01_schema.sql       ← Chạy trước
│   ├── 02_seed.sql         ← Chạy sau
│   └── 03_stored_procedures.sql
└── SETUP.md                ← File này
```
