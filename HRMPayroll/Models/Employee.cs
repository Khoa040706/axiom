using System;

namespace HRMPayroll.Models
{
    public class Employee
    {
        public int      EmployeeId    { get; set; }
        public string   EmployeeCode  { get; set; } = string.Empty;
        public string   FullName      { get; set; } = string.Empty;
        public string?  Gender        { get; set; }
        public DateTime? DateOfBirth  { get; set; }
        public string?  IdNumber      { get; set; }
        public string?  Phone         { get; set; }
        public string?  Email         { get; set; }
        public string?  Address       { get; set; }
        public string?  AvatarPath    { get; set; }

        public int?     DepartmentId  { get; set; }
        public int?     PositionId    { get; set; }

        public DateTime HireDate      { get; set; } = DateTime.Now;
        public string   Status        { get; set; } = "Đang làm";
        public string?  TaxCode       { get; set; }
        public int      NumDependents { get; set; } = 0;

        public DateTime CreatedAt     { get; set; } = DateTime.Now;
        public DateTime UpdatedAt     { get; set; } = DateTime.Now;

        // Navigation (populated by BLL when needed)
        public string? DepartmentName { get; set; }
        public string? PositionName   { get; set; }
    }
}
