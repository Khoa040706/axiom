using System;

namespace HRMPayroll.Models
{
    public class LeaveRequest
    {
        public int      RequestId    { get; set; }
        public int      EmployeeId   { get; set; }
        public string   LeaveType    { get; set; } = string.Empty;  // Nghỉ năm / Nghỉ ốm / Việc riêng
        public DateTime StartDate    { get; set; }
        public DateTime EndDate      { get; set; }
        public decimal  TotalDays    { get; set; }
        public string?  Reason       { get; set; }
        public string   Status       { get; set; } = "Chờ duyệt";  // Chờ duyệt / Đã duyệt / Từ chối
        public int?     ApprovedBy   { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public DateTime CreatedAt    { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName { get; set; }
        public string? ApproverName { get; set; }
    }

    public class LeaveBalance
    {
        public int     BalanceId     { get; set; }
        public int     EmployeeId   { get; set; }
        public int     Year         { get; set; }
        public decimal TotalDays    { get; set; } = 12;
        public decimal UsedDays     { get; set; }
        public decimal RemainingDays => TotalDays - UsedDays;

        // Navigation
        public string? EmployeeName { get; set; }
    }
}
