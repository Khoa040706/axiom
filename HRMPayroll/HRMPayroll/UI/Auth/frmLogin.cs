using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using HRMPayroll.BLL;
using HRMPayroll.Utils;

namespace HRMPayroll.UI.Auth
{
    /// <summary>
    /// Form đăng nhập hệ thống HRM & Payroll.
    /// Sau khi xác thực, AppSession lưu thông tin và
    /// Program.cs điều hướng đến đúng Dashboard theo role.
    /// </summary>
    public partial class frmLogin : Form
    {
        // ── Màu theo color-palette.md ──────────────────────
        private static readonly Color PrimaryRed  = Color.FromArgb(211, 47,  47);   // #D32F2F
        private static readonly Color DarkRed     = Color.FromArgb(154,  0,   7);   // #9A0007
        private static readonly Color LightRed    = Color.FromArgb(255, 102, 89);   // #FF6659
        private static readonly Color BgColor     = Color.FromArgb(253, 243, 244);  // #FDF3F4
        private static readonly Color TextMain    = Color.FromArgb( 51,  51,  51);  // #333333
        private static readonly Color TextMuted   = Color.FromArgb(136, 136, 136);  // #888888
        private static readonly Color BorderColor = Color.FromArgb(224, 224, 224);  // #E0E0E0

        private bool _passwordVisible = false;
        private string _selectedRole  = "Admin";

        // ── Dịch vụ ───────────────────────────────────────
        private readonly AuthService _authService;

        public frmLogin()
        {
            InitializeComponent();
            _authService = new AuthService();
            ApplyStyles();
        }

        // ──────────────────────────────────────────────────
        //  Áp dụng style màu sắc sau InitializeComponent
        // ──────────────────────────────────────────────────
        private void ApplyStyles()
        {
            // Form
            this.BackColor = BgColor;

            // Left gradient panel (vẽ thủ công trong OnPaint)
            pnlBranding.BackColor = PrimaryRed;

            // Tiêu đề form
            lblTitle.ForeColor  = PrimaryRed;
            lblSubtitle.ForeColor = TextMuted;

            // Labels
            lblUsername.ForeColor = TextMuted;
            lblPassword.ForeColor = TextMuted;

            // Inputs
            StyleTextBox(txtUsername);
            StyleTextBox(txtPassword);

            // Button
            btnLogin.BackColor   = PrimaryRed;
            btnLogin.ForeColor   = Color.White;
            btnLogin.FlatAppearance.BorderSize        = 0;
            btnLogin.FlatAppearance.MouseOverBackColor = DarkRed;
            btnLogin.FlatStyle   = FlatStyle.Flat;
            btnLogin.Cursor      = Cursors.Hand;

            // Link quên mật khẩu
            lnkForgot.LinkColor         = PrimaryRed;
            lnkForgot.ActiveLinkColor   = DarkRed;
            lnkForgot.DisabledLinkColor = TextMuted;

            // Role radio buttons
            foreach (RadioButton rb in new[] { rbAdmin, rbHR, rbEmployee })
            {
                rb.ForeColor = TextMuted;
                rb.Cursor    = Cursors.Hand;
            }

            // Dot trạng thái hệ thống
            pnlStatusDot.BackColor = Color.FromArgb(76, 175, 80); // green
        }

        private static void StyleTextBox(TextBox tb)
        {
            tb.BackColor   = Color.White;
            tb.ForeColor   = Color.FromArgb(51, 51, 51);
            tb.BorderStyle = BorderStyle.FixedSingle;
            tb.Font        = new Font("Segoe UI", 10f);
        }

        // ──────────────────────────────────────────────────
        //  EVENTS – Role selection
        // ──────────────────────────────────────────────────
        private void rbAdmin_CheckedChanged(object sender, EventArgs e)
        {
            if (!rbAdmin.Checked) return;
            _selectedRole = "Admin";
            txtUsername.PlaceholderText = "Email Admin hệ thống";
        }

        private void rbHR_CheckedChanged(object sender, EventArgs e)
        {
            if (!rbHR.Checked) return;
            _selectedRole = "HRManager";
            txtUsername.PlaceholderText = "Email HR Manager";
        }

        private void rbEmployee_CheckedChanged(object sender, EventArgs e)
        {
            if (!rbEmployee.Checked) return;
            _selectedRole = "Employee";
            txtUsername.PlaceholderText = "Mã số nhân viên (VD: NV001)";
        }

        // ──────────────────────────────────────────────────
        //  EVENTS – Toggle hiện/ẩn mật khẩu
        // ──────────────────────────────────────────────────
        private void btnTogglePwd_Click(object sender, EventArgs e)
        {
            _passwordVisible = !_passwordVisible;
            txtPassword.UseSystemPasswordChar = !_passwordVisible;
            btnTogglePwd.Text = _passwordVisible ? "🙈" : "👁";
        }

        // ──────────────────────────────────────────────────
        //  EVENTS – Đăng nhập
        // ──────────────────────────────────────────────────
        private void btnLogin_Click(object sender, EventArgs e)
        {
            // Xoá lỗi cũ
            lblError.Visible = false;

            // Validate
            if (string.IsNullOrWhiteSpace(txtUsername.Text))
            {
                ShowError("Vui lòng nhập tên đăng nhập.");
                txtUsername.Focus();
                return;
            }
            if (string.IsNullOrWhiteSpace(txtPassword.Text))
            {
                ShowError("Vui lòng nhập mật khẩu.");
                txtPassword.Focus();
                return;
            }

            // Loading state
            SetLoading(true);

            try
            {
                // Gọi AuthService xác thực
                var user = _authService.Login(
                    txtUsername.Text.Trim(),
                    txtPassword.Text
                );

                if (user == null)
                {
                    ShowError("Sai tên đăng nhập hoặc mật khẩu.");
                    txtPassword.Clear();
                    txtPassword.Focus();
                    return;
                }

                // Lưu session
                AppSession.CurrentUser = user;

                // Điều hướng theo role
                this.Hide();
                OpenDashboard(user.Role);
                this.Close();
            }
            catch (Exception ex)
            {
                ShowError("Lỗi hệ thống: " + ex.Message);
            }
            finally
            {
                SetLoading(false);
            }
        }

        private void OpenDashboard(string role)
        {
            Form dashboard = role switch
            {
                "Admin"     => new Dashboard.frmAdminDashboard(),
                "HRManager" => new Dashboard.frmHRDashboard(),
                "Employee"  => new Dashboard.frmEmployeeDashboard(),
                _           => throw new InvalidOperationException("Role không hợp lệ: " + role)
            };
            dashboard.Show();
        }

        // ──────────────────────────────────────────────────
        //  Helpers
        // ──────────────────────────────────────────────────
        private void ShowError(string msg)
        {
            lblError.Text    = "⚠  " + msg;
            lblError.Visible = true;
        }

        private void SetLoading(bool loading)
        {
            btnLogin.Enabled = !loading;
            btnLogin.Text    = loading ? "Đang xác thực..." : "Đăng nhập";
            this.UseWaitCursor = loading;
        }

        // ──────────────────────────────────────────────────
        //  Vẽ gradient đỏ cho panel branding
        // ──────────────────────────────────────────────────
        private void pnlBranding_Paint(object sender, PaintEventArgs e)
        {
            using var brush = new LinearGradientBrush(
                pnlBranding.ClientRectangle,
                LightRed,    // #FF6659 – điểm đầu
                DarkRed,     // #9A0007 – điểm cuối
                LinearGradientMode.ForwardDiagonal);

            e.Graphics.FillRectangle(brush, pnlBranding.ClientRectangle);
        }

        // ──────────────────────────────────────────────────
        //  Focus indicator màu đỏ khi input được chọn
        // ──────────────────────────────────────────────────
        private void Input_Enter(object sender, EventArgs e)
        {
            if (sender is TextBox tb)
                tb.BackColor = Color.FromArgb(255, 250, 250);
        }

        private void Input_Leave(object sender, EventArgs e)
        {
            if (sender is TextBox tb)
                tb.BackColor = Color.White;
        }

        // ──────────────────────────────────────────────────
        //  Link quên mật khẩu
        // ──────────────────────────────────────────────────
        private void lnkForgot_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            MessageBox.Show(
                "Vui lòng liên hệ bộ phận HR hoặc Admin để được cấp lại mật khẩu.",
                "Quên mật khẩu",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
        }

        // ──────────────────────────────────────────────────
        //  Enter key → submit
        // ──────────────────────────────────────────────────
        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (keyData == Keys.Enter)
            {
                btnLogin_Click(this, EventArgs.Empty);
                return true;
            }
            return base.ProcessCmdKey(ref msg, keyData);
        }
    }
}
