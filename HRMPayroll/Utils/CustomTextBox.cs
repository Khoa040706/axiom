using System.Drawing;
using System.Windows.Forms;

namespace HRMPayroll.Utils
{
    /// <summary>
    /// TextBox tùy chỉnh: vẽ placeholder text với màu sắc có thể cấu hình.
    /// Tắt built-in PlaceholderText của WinForms để tránh vẽ trùng.
    /// </summary>
    public class CustomTextBox : TextBox
    {
        private string _placeholder = "";

        /// <summary>Màu chữ placeholder khi ô trống và không focus.</summary>
        public Color PlaceholderColor { get; set; } = Color.FromArgb(165, 148, 148);

        /// <summary>Shadow lại PlaceholderText: tắt built-in, tự vẽ.</summary>
        public new string PlaceholderText
        {
            get => _placeholder;
            set
            {
                _placeholder = value ?? "";
                base.PlaceholderText = "";  // Xóa built-in để tránh vẽ đôi
                Invalidate();
            }
        }

        protected override void WndProc(ref Message m)
        {
            base.WndProc(ref m);

            // WM_PAINT = 0x000F
            if (m.Msg == 0x000F
                && string.IsNullOrEmpty(Text)
                && !Focused
                && !string.IsNullOrEmpty(_placeholder))
            {
                using var g     = Graphics.FromHwnd(Handle);
                using var brush = new SolidBrush(PlaceholderColor);
                g.DrawString(_placeholder, Font, brush, new PointF(1, 3));
            }
        }
    }
}
