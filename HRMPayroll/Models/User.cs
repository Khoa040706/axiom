using System;

namespace HRMPayroll.Models
{
    public class User
    {
        public int      UserId       { get; set; }
        public string   Username     { get; set; } = string.Empty;
        public string   PasswordHash { get; set; } = string.Empty;
        public int?     EmployeeId   { get; set; }
        public string   Role         { get; set; } = "Employee";  // Admin / HRManager / Employee
        public bool     IsActive     { get; set; } = true;
        public DateTime? LastLogin   { get; set; }
        public DateTime CreatedAt    { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName { get; set; }
    }
}
