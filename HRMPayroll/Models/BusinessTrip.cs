using System;

namespace HRMPayroll.Models
{
    public class BusinessTrip
    {
        public int      TripId       { get; set; }
        public int      EmployeeId   { get; set; }
        public string   Destination  { get; set; } = string.Empty;
        public DateTime StartDate    { get; set; }
        public DateTime EndDate      { get; set; }
        public string?  Purpose      { get; set; }
        public decimal  Allowance    { get; set; }
        public string   Status       { get; set; } = "Chờ duyệt";
        public int?     ApprovedBy   { get; set; }
        public DateTime CreatedAt    { get; set; } = DateTime.Now;

        // Navigation
        public string? EmployeeName { get; set; }
    }
}
