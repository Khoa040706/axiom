using System;

namespace HRMPayroll.Models
{
    public class Contract
    {
        public int      ContractId   { get; set; }
        public int      EmployeeId   { get; set; }
        public string   ContractType { get; set; } = string.Empty;  // Thử việc / Chính thức / Thời vụ
        public DateTime StartDate    { get; set; }
        public DateTime? EndDate     { get; set; }
        public decimal  BaseSalary   { get; set; }
        public decimal  SalaryGrade  { get; set; } = 1.0m;
        public decimal  Allowance    { get; set; }
        public string   Status       { get; set; } = "Hiệu lực";
        public string?  Notes        { get; set; }
        public DateTime CreatedAt    { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName { get; set; }
    }
}
