-- ============================================================
-- HRM & Payroll System – Database Schema
-- SQL Server (LocalDB) – UTF-8
-- Tạo: 2026-03-23
-- ============================================================

-- ── 1. PHÒNG BAN & CHỨC VỤ ──────────────────────────────────

CREATE TABLE departments (
    department_id   INT IDENTITY(1,1) PRIMARY KEY,
    department_name NVARCHAR(100) NOT NULL,
    description     NVARCHAR(255) NULL,
    is_active       BIT NOT NULL DEFAULT 1,
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE positions (
    position_id   INT IDENTITY(1,1) PRIMARY KEY,
    position_name NVARCHAR(100) NOT NULL,
    description   NVARCHAR(255) NULL,
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 2. NHÂN VIÊN ────────────────────────────────────────────

CREATE TABLE employees (
    employee_id     INT IDENTITY(1,1) PRIMARY KEY,
    employee_code   NVARCHAR(20) NOT NULL UNIQUE,         -- Mã NV: NV001, NV002...
    full_name       NVARCHAR(100) NOT NULL,
    gender          NVARCHAR(10) NULL,                     -- Nam / Nữ / Khác
    date_of_birth   DATE NULL,
    id_number       NVARCHAR(20) NULL,                     -- CCCD / CMND
    phone           NVARCHAR(20) NULL,
    email           NVARCHAR(100) NULL,
    address         NVARCHAR(255) NULL,
    avatar_path     NVARCHAR(255) NULL,                    -- Đường dẫn ảnh đại diện

    department_id   INT NULL REFERENCES departments(department_id),
    position_id     INT NULL REFERENCES positions(position_id),

    hire_date       DATE NOT NULL DEFAULT GETDATE(),
    status          NVARCHAR(20) NOT NULL DEFAULT N'Đang làm',  -- Đang làm / Nghỉ việc / Thử việc
    tax_code        NVARCHAR(20) NULL,                     -- Mã số thuế cá nhân
    num_dependents  INT NOT NULL DEFAULT 0,                -- Số người phụ thuộc (giảm trừ gia cảnh)

    created_at      DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 3. HỢP ĐỒNG LAO ĐỘNG ───────────────────────────────────

CREATE TABLE contracts (
    contract_id     INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    contract_type   NVARCHAR(50) NOT NULL,                 -- Thử việc / Chính thức / Thời vụ
    start_date      DATE NOT NULL,
    end_date        DATE NULL,                             -- NULL = vô thời hạn
    base_salary     DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Lương cơ bản
    salary_grade    DECIMAL(5,2) NOT NULL DEFAULT 1.0,     -- Hệ số lương
    allowance       DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Phụ cấp trách nhiệm
    status          NVARCHAR(20) NOT NULL DEFAULT N'Hiệu lực', -- Hiệu lực / Hết hạn / Chấm dứt
    notes           NVARCHAR(500) NULL,
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 4. LỊCH SỬ CÔNG TÁC ────────────────────────────────────

CREATE TABLE career_history (
    history_id      INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    event_type      NVARCHAR(50) NOT NULL,                 -- Thăng chức / Điều chuyển / Khen thưởng / Kỷ luật
    event_date      DATE NOT NULL DEFAULT GETDATE(),
    description     NVARCHAR(500) NULL,
    old_department  NVARCHAR(100) NULL,
    new_department  NVARCHAR(100) NULL,
    old_position    NVARCHAR(100) NULL,
    new_position    NVARCHAR(100) NULL,
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 5. TÀI KHOẢN & PHÂN QUYỀN (RBAC) ──────────────────────

CREATE TABLE users (
    user_id         INT IDENTITY(1,1) PRIMARY KEY,
    username        NVARCHAR(50) NOT NULL UNIQUE,
    password_hash   NVARCHAR(255) NOT NULL,                -- SHA256 hash
    employee_id     INT NULL REFERENCES employees(employee_id),
    role            NVARCHAR(20) NOT NULL DEFAULT 'Employee', -- Admin / HRManager / Employee
    is_active       BIT NOT NULL DEFAULT 1,
    last_login      DATETIME2 NULL,
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 6. CHẤM CÔNG ────────────────────────────────────────────

CREATE TABLE attendance (
    attendance_id   INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    work_date       DATE NOT NULL,
    check_in        TIME NULL,
    check_out       TIME NULL,
    status          NVARCHAR(20) NOT NULL DEFAULT N'Đi làm',  -- Đi làm / Vắng / Nghỉ phép / Công tác
    ot_hours        DECIMAL(4,1) NOT NULL DEFAULT 0,       -- Giờ làm thêm
    late_minutes    INT NOT NULL DEFAULT 0,                 -- Phút đi muộn
    early_minutes   INT NOT NULL DEFAULT 0,                 -- Phút về sớm
    notes           NVARCHAR(255) NULL,
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_attendance UNIQUE (employee_id, work_date)
);

-- ── 7. NGHỈ PHÉP ────────────────────────────────────────────

CREATE TABLE leave_requests (
    request_id      INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    leave_type      NVARCHAR(50) NOT NULL,                 -- Nghỉ năm / Nghỉ ốm / Việc riêng / Khác
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    total_days      DECIMAL(4,1) NOT NULL,                 -- Số ngày nghỉ
    reason          NVARCHAR(500) NULL,
    status          NVARCHAR(20) NOT NULL DEFAULT N'Chờ duyệt', -- Chờ duyệt / Đã duyệt / Từ chối
    approved_by     INT NULL REFERENCES users(user_id),
    approved_date   DATETIME2 NULL,
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE leave_balance (
    balance_id      INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    year            INT NOT NULL,
    total_days      DECIMAL(4,1) NOT NULL DEFAULT 12,      -- Tổng phép năm (mặc định 12 ngày)
    used_days       DECIMAL(4,1) NOT NULL DEFAULT 0,
    remaining_days  AS (total_days - used_days),            -- Computed column

    CONSTRAINT UQ_leave_balance UNIQUE (employee_id, year)
);

-- ── 8. CÔNG TÁC PHÍ ─────────────────────────────────────────

CREATE TABLE business_trips (
    trip_id         INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    destination     NVARCHAR(200) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    purpose         NVARCHAR(500) NULL,
    allowance       DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Phụ cấp công tác
    status          NVARCHAR(20) NOT NULL DEFAULT N'Chờ duyệt', -- Chờ duyệt / Đã duyệt / Hoàn thành / Từ chối
    approved_by     INT NULL REFERENCES users(user_id),
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 9. CẤU HÌNH LƯƠNG ───────────────────────────────────────

CREATE TABLE salary_config (
    config_id       INT IDENTITY(1,1) PRIMARY KEY,
    config_key      NVARCHAR(50) NOT NULL UNIQUE,
    config_value    DECIMAL(18,4) NOT NULL,
    description     NVARCHAR(200) NULL,
    updated_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── 10. BẢNG LƯƠNG ──────────────────────────────────────────

CREATE TABLE payroll (
    payroll_id      INT IDENTITY(1,1) PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    pay_month       INT NOT NULL,                          -- Tháng (1-12)
    pay_year        INT NOT NULL,
    work_days       DECIMAL(4,1) NOT NULL DEFAULT 0,       -- Số ngày công thực tế
    ot_hours        DECIMAL(5,1) NOT NULL DEFAULT 0,       -- Tổng giờ OT
    base_salary     DECIMAL(18,2) NOT NULL DEFAULT 0,
    allowance       DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Tổng phụ cấp
    ot_pay          DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Tiền OT
    gross_salary    DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Lương Gross
    bhxh            DECIMAL(18,2) NOT NULL DEFAULT 0,      -- BHXH (8%)
    bhyt            DECIMAL(18,2) NOT NULL DEFAULT 0,      -- BHYT (1.5%)
    bhtn            DECIMAL(18,2) NOT NULL DEFAULT 0,      -- BHTN (1%)
    tax_income      DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Thu nhập chịu thuế
    tax_amount      DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Thuế TNCN
    deductions      DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Các khoản khấu trừ khác
    net_salary      DECIMAL(18,2) NOT NULL DEFAULT 0,      -- Lương Net thực nhận
    status          NVARCHAR(20) NOT NULL DEFAULT N'Nháp', -- Nháp / Đã duyệt / Đã trả
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_payroll UNIQUE (employee_id, pay_month, pay_year)
);

-- ── 11. PHIẾU LƯƠNG ─────────────────────────────────────────

CREATE TABLE payslips (
    payslip_id      INT IDENTITY(1,1) PRIMARY KEY,
    payroll_id      INT NOT NULL REFERENCES payroll(payroll_id),
    employee_id     INT NOT NULL REFERENCES employees(employee_id),
    issued_date     DATE NOT NULL DEFAULT GETDATE(),
    pdf_path        NVARCHAR(255) NULL,                    -- Đường dẫn file PDF
    is_viewed       BIT NOT NULL DEFAULT 0,                -- NV đã xem chưa
    created_at      DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- ── INDEXES ──────────────────────────────────────────────────

CREATE INDEX IX_employees_dept ON employees(department_id);
CREATE INDEX IX_employees_pos ON employees(position_id);
CREATE INDEX IX_contracts_emp ON contracts(employee_id);
CREATE INDEX IX_attendance_emp_date ON attendance(employee_id, work_date);
CREATE INDEX IX_leave_requests_emp ON leave_requests(employee_id);
CREATE INDEX IX_payroll_emp_period ON payroll(employee_id, pay_year, pay_month);

PRINT N'✅ Schema created successfully.';
