using System;

namespace HRMPayroll.Models
{
    public class SalaryConfig
    {
        public int      ConfigId    { get; set; }
        public string   ConfigKey   { get; set; } = string.Empty;
        public decimal  ConfigValue { get; set; }
        public string?  Description { get; set; }
        public DateTime UpdatedAt   { get; set; } = DateTime.Now;
    }

    public class PayrollRecord
    {
        public int      PayrollId   { get; set; }
        public int      EmployeeId  { get; set; }
        public int      PayMonth    { get; set; }
        public int      PayYear     { get; set; }
        public decimal  WorkDays    { get; set; }
        public decimal  OtHours     { get; set; }
        public decimal  BaseSalary  { get; set; }
        public decimal  Allowance   { get; set; }
        public decimal  OtPay       { get; set; }
        public decimal  GrossSalary { get; set; }
        public decimal  Bhxh        { get; set; }
        public decimal  Bhyt        { get; set; }
        public decimal  Bhtn        { get; set; }
        public decimal  TaxIncome   { get; set; }
        public decimal  TaxAmount   { get; set; }
        public decimal  Deductions  { get; set; }
        public decimal  NetSalary   { get; set; }
        public string   Status      { get; set; } = "Nháp";  // Nháp / Đã duyệt / Đã trả
        public DateTime CreatedAt   { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName { get; set; }
    }

    public class Payslip
    {
        public int      PayslipId   { get; set; }
        public int      PayrollId   { get; set; }
        public int      EmployeeId  { get; set; }
        public DateTime IssuedDate  { get; set; } = DateTime.Now;
        public string?  PdfPath     { get; set; }
        public bool     IsViewed    { get; set; }
        public DateTime CreatedAt   { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName { get; set; }
    }
}
