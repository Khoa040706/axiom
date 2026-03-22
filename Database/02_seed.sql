-- ============================================================
-- HRM & Payroll System – Seed Data
-- Dữ liệu mẫu để test nghiệp vụ
-- ============================================================

-- ── Phòng ban ────────────────────────────────────────────────
SET IDENTITY_INSERT departments ON;
INSERT INTO departments (department_id, department_name, description) VALUES
(1, N'Ban Giám đốc',      N'Quản lý điều hành doanh nghiệp'),
(2, N'Phòng Nhân sự',      N'Quản lý tuyển dụng, hồ sơ nhân viên'),
(3, N'Phòng Kế toán',      N'Quản lý tài chính, kế toán'),
(4, N'Phòng Kỹ thuật',     N'Phát triển sản phẩm, bảo trì hệ thống'),
(5, N'Phòng Kinh doanh',   N'Bán hàng, chăm sóc khách hàng');
SET IDENTITY_INSERT departments OFF;

-- ── Chức vụ ──────────────────────────────────────────────────
SET IDENTITY_INSERT positions ON;
INSERT INTO positions (position_id, position_name, description) VALUES
(1, N'Giám đốc',           N'Giám đốc điều hành'),
(2, N'Phó Giám đốc',       N'Phó Giám đốc'),
(3, N'Trưởng phòng',       N'Trưởng phòng ban'),
(4, N'Phó phòng',          N'Phó phòng ban'),
(5, N'Chuyên viên',        N'Chuyên viên nghiệp vụ'),
(6, N'Nhân viên',          N'Nhân viên'),
(7, N'Thực tập sinh',      N'Thực tập sinh');
SET IDENTITY_INSERT positions OFF;

-- ── Nhân viên ────────────────────────────────────────────────
SET IDENTITY_INSERT employees ON;
INSERT INTO employees (employee_id, employee_code, full_name, gender, date_of_birth, id_number, phone, email, department_id, position_id, hire_date, status, tax_code, num_dependents) VALUES
(1,  N'NV001', N'Nguyễn Văn An',      N'Nam',  '1985-03-15', N'001085012345', N'0901234567', N'an.nv@axiom.vn',      1, 1, '2020-01-01', N'Đang làm', N'8001234567', 2),
(2,  N'NV002', N'Trần Thị Bích',      N'Nữ',   '1990-07-22', N'002090078901', N'0912345678', N'bich.tt@axiom.vn',    2, 3, '2021-03-01', N'Đang làm', N'8002345678', 1),
(3,  N'NV003', N'Lê Hoàng Cường',     N'Nam',  '1992-11-10', N'003092056789', N'0923456789', N'cuong.lh@axiom.vn',   3, 3, '2021-06-15', N'Đang làm', N'8003456789', 0),
(4,  N'NV004', N'Phạm Minh Duy',      N'Nam',  '1995-01-28', N'004095034567', N'0934567890', N'duy.pm@axiom.vn',     4, 3, '2022-01-10', N'Đang làm', N'8004567890', 1),
(5,  N'NV005', N'Hoàng Thị Nga',      N'Nữ',   '1993-05-05', N'005093012345', N'0945678901', N'nga.ht@axiom.vn',     5, 3, '2022-04-01', N'Đang làm', N'8005678901', 0),
(6,  N'NV006', N'Vũ Đức Thắng',       N'Nam',  '1998-09-18', N'006098090123', N'0956789012', N'thang.vd@axiom.vn',   4, 5, '2023-02-01', N'Đang làm', N'8006789012', 0),
(7,  N'NV007', N'Đặng Thùy Linh',     N'Nữ',   '1997-12-03', N'007097067890', N'0967890123', N'linh.dt@axiom.vn',    2, 5, '2023-06-15', N'Đang làm', N'8007890123', 1),
(8,  N'NV008', N'Bùi Quang Huy',      N'Nam',  '1996-04-14', N'008096045678', N'0978901234', N'huy.bq@axiom.vn',     4, 6, '2023-09-01', N'Đang làm', N'8008901234', 0),
(9,  N'NV009', N'Ngô Minh Tâm',       N'Nữ',   '2000-08-25', N'009100023456', N'0989012345', N'tam.nm@axiom.vn',     5, 6, '2024-01-15', N'Đang làm', NULL, 0),
(10, N'NV010', N'Lý Thanh Hằng',      N'Nữ',   '2001-02-07', N'010101001234', N'0990123456', N'hang.lt@axiom.vn',    3, 6, '2024-06-01', N'Đang làm', NULL, 0),
(11, N'NV011', N'Đinh Công Phát',      N'Nam',  '1999-06-30', N'011099089012', N'0861234567', N'phat.dc@axiom.vn',    4, 6, '2024-09-01', N'Thử việc', NULL, 0),
(12, N'NV012', N'Trương Hải Yến',      N'Nữ',   '2002-10-12', N'012102067890', N'0872345678', N'yen.th@axiom.vn',     5, 7, '2025-01-01', N'Thử việc', NULL, 0);
SET IDENTITY_INSERT employees OFF;

-- ── Hợp đồng lao động ───────────────────────────────────────
INSERT INTO contracts (employee_id, contract_type, start_date, end_date, base_salary, salary_grade, allowance, status) VALUES
(1,  N'Chính thức', '2020-01-01', NULL,         35000000, 3.50, 5000000,  N'Hiệu lực'),
(2,  N'Chính thức', '2021-06-01', '2027-06-01', 18000000, 2.20, 3000000,  N'Hiệu lực'),
(3,  N'Chính thức', '2021-09-15', '2026-09-15', 16000000, 2.00, 2500000,  N'Hiệu lực'),
(4,  N'Chính thức', '2022-04-10', '2026-04-10', 20000000, 2.50, 3000000,  N'Hiệu lực'),  -- sắp hết hạn!
(5,  N'Chính thức', '2022-07-01', '2026-07-01', 17000000, 2.10, 2500000,  N'Hiệu lực'),
(6,  N'Chính thức', '2023-05-01', '2027-05-01', 14000000, 1.80, 1000000,  N'Hiệu lực'),
(7,  N'Chính thức', '2023-09-15', '2027-09-15', 13000000, 1.70, 1000000,  N'Hiệu lực'),
(8,  N'Chính thức', '2024-01-01', '2027-01-01', 12000000, 1.50, 500000,   N'Hiệu lực'),
(9,  N'Chính thức', '2024-04-15', '2027-04-15', 11000000, 1.40, 500000,   N'Hiệu lực'),
(10, N'Chính thức', '2024-09-01', '2026-09-01', 10000000, 1.30, 0,        N'Hiệu lực'),
(11, N'Thử việc',   '2024-09-01', '2025-03-01',  8000000, 1.00, 0,        N'Hiệu lực'),
(12, N'Thử việc',   '2025-01-01', '2025-07-01',  7000000, 1.00, 0,        N'Hiệu lực');

-- ── Tài khoản đăng nhập (khớp với AuthService stub) ─────────
-- Password: SHA256 hash (demo – sau này sẽ hash thật)
INSERT INTO users (username, password_hash, employee_id, role, is_active) VALUES
(N'admin',  N'240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1,  'Admin',     1),   -- admin123
(N'hr',     N'c45a4db28b39e1234f5c7eb0fe3d3b1a7f67e54b3e8c5a092c9e7d4f6b2a1380', 2,  'HRManager', 1),   -- hr123
(N'nv001',  N'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 12, 'Employee',  1);   -- nv123

-- ── Quỹ phép năm 2026 ───────────────────────────────────────
INSERT INTO leave_balance (employee_id, year, total_days, used_days)
SELECT employee_id, 2026, 12.0, 0.0
FROM employees WHERE status != N'Thử việc';

INSERT INTO leave_balance (employee_id, year, total_days, used_days)
SELECT employee_id, 2026, 6.0, 0.0
FROM employees WHERE status = N'Thử việc';

-- ── Cấu hình lương ──────────────────────────────────────────
INSERT INTO salary_config (config_key, config_value, description) VALUES
(N'BHXH_RATE',          0.0800, N'Bảo hiểm xã hội – NV đóng 8%'),
(N'BHYT_RATE',          0.0150, N'Bảo hiểm y tế – NV đóng 1.5%'),
(N'BHTN_RATE',          0.0100, N'Bảo hiểm thất nghiệp – NV đóng 1%'),
(N'TAX_DEDUCTION_SELF', 11000000, N'Giảm trừ bản thân – 11 triệu/tháng'),
(N'TAX_DEDUCTION_DEP',  4400000,  N'Giảm trừ người phụ thuộc – 4.4 triệu/người/tháng'),
(N'STANDARD_WORK_DAYS', 22,       N'Số ngày công chuẩn 1 tháng'),
(N'OT_RATE',            1.5000,   N'Hệ số lương OT ngày thường (x1.5)');

PRINT N'✅ Seed data inserted successfully.';
