using System;

namespace HRMPayroll.Models
{
    public class CareerHistory
    {
        public int      HistoryId     { get; set; }
        public int      EmployeeId    { get; set; }
        public string   EventType     { get; set; } = string.Empty;  // Thăng chức / Điều chuyển / Khen thưởng / Kỷ luật
        public DateTime EventDate     { get; set; } = DateTime.Now;
        public string?  Description   { get; set; }
        public string?  OldDepartment { get; set; }
        public string?  NewDepartment { get; set; }
        public string?  OldPosition   { get; set; }
        public string?  NewPosition   { get; set; }
        public DateTime CreatedAt     { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName  { get; set; }
    }
}
