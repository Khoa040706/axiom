using System;

namespace HRMPayroll.Models
{
    public class Attendance
    {
        public int      AttendanceId  { get; set; }
        public int      EmployeeId    { get; set; }
        public DateTime WorkDate      { get; set; }
        public TimeSpan? CheckIn      { get; set; }
        public TimeSpan? CheckOut     { get; set; }
        public string   Status        { get; set; } = "Đi làm";  // Đi làm / Vắng / Nghỉ phép / Công tác
        public decimal  OtHours       { get; set; }
        public int      LateMinutes   { get; set; }
        public int      EarlyMinutes  { get; set; }
        public string?  Notes         { get; set; }
        public DateTime CreatedAt     { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName  { get; set; }
    }
}
