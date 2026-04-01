-- CreateTable
CREATE TABLE "departments" (
    "department_id" SERIAL NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "positions" (
    "position_id" SERIAL NOT NULL,
    "position_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" SERIAL NOT NULL,
    "employee_code" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(10),
    "date_of_birth" DATE,
    "id_number" VARCHAR(20),
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "address" VARCHAR(255),
    "avatar_path" VARCHAR(255),
    "department_id" INTEGER,
    "position_id" INTEGER,
    "hire_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Đang làm',
    "tax_code" VARCHAR(20),
    "num_dependents" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "contract_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_type" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "base_salary" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "salary_grade" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "allowance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Hiệu lực',
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("contract_id")
);

-- CreateTable
CREATE TABLE "career_history" (
    "history_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "event_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" VARCHAR(500),
    "old_department" VARCHAR(100),
    "new_department" VARCHAR(100),
    "old_position" VARCHAR(100),
    "new_position" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "employee_id" INTEGER,
    "role" VARCHAR(20) NOT NULL DEFAULT 'Employee',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "attendance_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "work_date" DATE NOT NULL,
    "check_in" TIME,
    "check_out" TIME,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Đi làm',
    "ot_hours" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "late_minutes" INTEGER NOT NULL DEFAULT 0,
    "early_minutes" INTEGER NOT NULL DEFAULT 0,
    "notes" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "request_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" DECIMAL(4,1) NOT NULL,
    "reason" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'Chờ duyệt',
    "approved_by" INTEGER,
    "approved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "leave_balance" (
    "balance_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL DEFAULT 'Nghỉ năm',
    "total_days" DECIMAL(4,1) NOT NULL DEFAULT 12,
    "used_days" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_balance_pkey" PRIMARY KEY ("balance_id")
);

-- CreateTable
CREATE TABLE "business_trips" (
    "trip_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "destination" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "purpose" VARCHAR(500),
    "allowance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Chờ duyệt',
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_trips_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "salary_config" (
    "config_id" SERIAL NOT NULL,
    "config_key" VARCHAR(50) NOT NULL,
    "config_value" DECIMAL(18,4) NOT NULL,
    "description" VARCHAR(200),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_config_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "payroll" (
    "payroll_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "pay_month" INTEGER NOT NULL,
    "pay_year" INTEGER NOT NULL,
    "work_days" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "ot_hours" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "base_salary" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "allowance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "ot_pay" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "gross_salary" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bhxh" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bhyt" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bhtn" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_income" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "net_salary" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Nháp',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_pkey" PRIMARY KEY ("payroll_id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "payslip_id" SERIAL NOT NULL,
    "payroll_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "issued_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf_path" VARCHAR(255),
    "is_viewed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("payslip_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_employee_id_work_date_key" ON "attendance"("employee_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balance_employee_id_year_leave_type_key" ON "leave_balance"("employee_id", "year", "leave_type");

-- CreateIndex
CREATE UNIQUE INDEX "salary_config_config_key_key" ON "salary_config"("config_key");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_employee_id_pay_month_pay_year_key" ON "payroll"("employee_id", "pay_month", "pay_year");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("position_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_history" ADD CONSTRAINT "career_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_trips" ADD CONSTRAINT "business_trips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_trips" ADD CONSTRAINT "business_trips_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payroll"("payroll_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;
