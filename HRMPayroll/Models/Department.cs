using System;

namespace HRMPayroll.Models
{
    public class Department
    {
        public int    DepartmentId   { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? Description   { get; set; }
        public bool   IsActive       { get; set; } = true;
        public DateTime CreatedAt    { get; set; } = DateTime.Now;
    }
}
