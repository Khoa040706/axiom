namespace HRMPayroll.Utils
{
    /// <summary>
    /// Lưu thông tin phiên đăng nhập hiện tại (user đang login).
    /// </summary>
    public static class AppSession
    {
        public static UserInfo? CurrentUser { get; set; }

        public static void Clear() => CurrentUser = null;
    }

    /// <summary>
    /// DTO đại diện thông tin người dùng đã đăng nhập.
    /// </summary>
    public class UserInfo
    {
        public int    Id       { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email    { get; set; } = string.Empty;
        public string Role     { get; set; } = string.Empty;   // Admin | HRManager | Employee
    }
}
