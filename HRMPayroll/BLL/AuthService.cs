using HRMPayroll.Utils;

namespace HRMPayroll.BLL
{
    /// <summary>
    /// Dịch vụ xác thực người dùng.
    /// Đây là stub tạm – sau này sẽ kết nối DB thật.
    /// </summary>
    public class AuthService
    {
        /// <summary>
        /// Xác thực đăng nhập. Trả về UserInfo nếu hợp lệ, null nếu sai.
        /// Demo: admin/admin123 | hr/hr123 | nv001/nv123
        /// </summary>
        public UserInfo? Login(string username, string password)
        {
            // ── Tài khoản demo để test giao diện ──
            if (username == "admin" && password == "admin123")
            {
                return new UserInfo
                {
                    Id       = 1,
                    Username = "admin",
                    FullName = "Quản trị viên Hệ thống",
                    Email    = "admin@hrmpayroll.vn",
                    Role     = "Admin"
                };
            }

            if (username == "hr" && password == "hr123")
            {
                return new UserInfo
                {
                    Id       = 2,
                    Username = "hr",
                    FullName = "Nguyễn Văn HR",
                    Email    = "hr@hrmpayroll.vn",
                    Role     = "HRManager"
                };
            }

            if (username == "nv001" && password == "nv123")
            {
                return new UserInfo
                {
                    Id       = 100,
                    Username = "nv001",
                    FullName = "Trần Thị Nhân Viên",
                    Email    = "nv001@hrmpayroll.vn",
                    Role     = "Employee"
                };
            }

            return null; // Sai thông tin
        }
    }
}
