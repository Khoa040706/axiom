using System;

namespace HRMPayroll.Models
{
    public class Position
    {
        public int    PositionId   { get; set; }
        public string PositionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool   IsActive     { get; set; } = true;
        public DateTime CreatedAt  { get; set; } = DateTime.Now;
    }
}
