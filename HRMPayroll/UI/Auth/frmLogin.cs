using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using HRMPayroll.BLL;
using HRMPayroll.Utils;

namespace HRMPayroll.UI.Auth
{
    public partial class frmLogin : Form
    {
        // ── Palette ──────────────────────────────────────────────
        private static readonly Color PrimaryRed  = Color.FromArgb(211, 47,  47);
        private static readonly Color DarkRed     = Color.FromArgb(154,  0,   7);
        private static readonly Color LightRed    = Color.FromArgb(255, 102, 89);
        private static readonly Color BgLightTop  = Color.FromArgb(255, 138, 128);
        private static readonly Color BgMidRed    = Color.FromArgb(229,  57,  53);

        // ── State ─────────────────────────────────────────────────
        private bool _isDark          = false;
        private bool _isEnglish       = false;
        private bool _passwordVisible = false;
        private readonly AuthService _authService;

        // ── Strings (VI / EN) ─────────────────────────────────────
        private static readonly Dictionary<string, string[]> Strings = new()
        {
            // key → [VI, EN]
            ["title"]       = ["Chào mừng trở lại!", "Welcome Back!"],
            ["subtitle"]    = ["Đăng nhập vào Hệ thống HRM & Payroll", "Sign in to HRM & Payroll System"],
            ["lblUser"]     = ["TÊN ĐĂNG NHẬP", "USERNAME"],
            ["phUser"]      = ["Nhập tên đăng nhập", "Enter username"],
            ["errUser"]     = ["⚠  Vui lòng nhập tên đăng nhập.", "⚠  Please enter your username."],
            ["lblPwd"]      = ["MẬT KHẨU", "PASSWORD"],
            ["phPwd"]       = ["Nhập mật khẩu", "Enter password"],
            ["errPwd"]      = ["⚠  Vui lòng nhập mật khẩu.", "⚠  Please enter your password."],
            ["remember"]    = ["Ghi nhớ đăng nhập", "Remember me"],
            ["forgot"]      = ["Quên mật khẩu?", "Forgot password?"],
            ["btnLogin"]    = ["Đăng nhập  →", "Sign In  →"],
            ["btnLoading"]  = ["Đang xác thực...", "Authenticating..."],
            ["errWrong"]    = ["⚠  Sai tên đăng nhập hoặc mật khẩu.", "⚠  Incorrect username or password."],
            ["errSystem"]   = ["⚠  Lỗi hệ thống: ", "⚠  System error: "],
            ["forgotDlg"]   = ["Vui lòng liên hệ bộ phận HR hoặc Admin để được cấp lại mật khẩu.",
                               "Please contact HR or Admin department to reset your password."],
            ["forgotTitle"] = ["Quên mật khẩu", "Forgot Password"],
            ["formTitle"]   = ["HRM & Payroll – Đăng Nhập", "HRM & Payroll – Sign In"],
        };

        private string T(string key) => Strings[key][_isEnglish ? 1 : 0];

        // ─────────────────────────────────────────────────────────
        public frmLogin()
        {
            InitializeComponent();
            _authService = new AuthService();
            ApplyLoginButtonGradient();
            RoundCard();
            ApplyTheme();   // set initial light theme
        }

        // ─────────────────────────────────────────────────────────
        //  FORM BACKGROUND – gradient đỏ sáng
        // ─────────────────────────────────────────────────────────
        private void frmLogin_Paint(object? sender, PaintEventArgs e)
        {
            using var bgBrush = new LinearGradientBrush(ClientRectangle, BgLightTop, BgMidRed, 145f);
            e.Graphics.FillRectangle(bgBrush, ClientRectangle);

            DrawDecoCircle(e.Graphics, -140, -140, 480, Color.FromArgb(30, 255, 255, 255));
            DrawDecoCircle(e.Graphics, Width - 200, Height - 200, 380, Color.FromArgb(20, 0, 0, 0));
            DrawDecoCircle(e.Graphics, Width / 2 - 60, -100, 260, Color.FromArgb(12, 255, 255, 255));
        }

        private static void DrawDecoCircle(Graphics g, int x, int y, int size, Color color)
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            using var pen   = new Pen(color, 1.5f);
            g.DrawEllipse(pen, x, y, size, size);
            int inset = 30;
            using var pen2  = new Pen(Color.FromArgb(color.A / 2, color.R, color.G, color.B), 1f);
            g.DrawEllipse(pen2, x + inset, y + inset, size - inset * 2, size - inset * 2);
        }

        // ─────────────────────────────────────────────────────────
        //  CARD – bo góc
        // ─────────────────────────────────────────────────────────
        private void RoundCard()
        {
            int radius = 20;
            var path   = new GraphicsPath();
            var r      = pnlCard.ClientRectangle;
            path.AddArc(r.X, r.Y, radius * 2, radius * 2, 180, 90);
            path.AddArc(r.Right - radius * 2, r.Y, radius * 2, radius * 2, 270, 90);
            path.AddArc(r.Right - radius * 2, r.Bottom - radius * 2, radius * 2, radius * 2, 0, 90);
            path.AddArc(r.X, r.Bottom - radius * 2, radius * 2, radius * 2, 90, 90);
            path.CloseFigure();
            pnlCard.Region = new Region(path);
        }

        private void pnlCard_Paint(object? sender, PaintEventArgs e)
        {
            using var pen = new Pen(Color.FromArgb(20, 0, 0, 0), 1f);
            e.Graphics.DrawRectangle(pen, 0, 0, pnlCard.Width - 1, pnlCard.Height - 1);
        }

        // ─────────────────────────────────────────────────────────
        //  INPUT WRAP borders
        // ─────────────────────────────────────────────────────────
        private void InputWrap_Paint(object? sender, PaintEventArgs e)
        {
            if (sender is not Panel p) return;
            var borderColor = _isDark ? Color.FromArgb(70, 70, 90) : Color.FromArgb(224, 224, 224);
            using var pen   = new Pen(borderColor, 1.5f);
            e.Graphics.DrawRectangle(pen, 0, 0, p.Width - 1, p.Height - 1);
        }

        private void FocusedWrap_Paint(object? sender, PaintEventArgs e)
        {
            if (sender is not Panel p) return;
            using var pen = new Pen(PrimaryRed, 1.5f);
            e.Graphics.DrawRectangle(pen, 0, 0, p.Width - 1, p.Height - 1);
        }

        // ─────────────────────────────────────────────────────────
        //  LOGIN BUTTON gradient
        // ─────────────────────────────────────────────────────────
        private void ApplyLoginButtonGradient()
        {
            btnLogin.Paint += (s, e) =>
            {
                var rect = new Rectangle(0, 0, btnLogin.Width, btnLogin.Height);
                using var brush = new LinearGradientBrush(rect, LightRed, DarkRed, 135f);
                e.Graphics.FillRectangle(brush, rect);
                e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
                using var sf  = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
                using var fnt = new Font("Segoe UI", 11f, FontStyle.Bold);
                e.Graphics.DrawString(btnLogin.Text, fnt, Brushes.White, rect, sf);
            };
        }

        // ─────────────────────────────────────────────────────────
        //  THEME TOGGLE  (light ↔ dark)
        // ─────────────────────────────────────────────────────────
        private void btnTheme_Click(object? sender, EventArgs e)
        {
            _isDark = !_isDark;
            ApplyTheme();
        }

        private void ApplyTheme()
        {
            // Colors
            var cardBg      = _isDark ? Color.FromArgb(28, 28, 40)   : Color.White;
            var inputBg     = _isDark ? Color.FromArgb(40, 40, 58)   : Color.FromArgb(250, 250, 250);
            var textMain    = _isDark ? Color.FromArgb(220, 220, 230) : Color.FromArgb(51, 51, 51);
            var textMuted   = _isDark ? Color.FromArgb(150, 150, 165) : Color.FromArgb(136, 136, 136);
            var chkFore     = _isDark ? Color.FromArgb(150, 150, 165) : Color.FromArgb(136, 136, 136);
            var btnToolBg   = Color.Transparent;

            // Card
            pnlCard.BackColor   = cardBg;

            // Buttons (theme + lang)
            btnTheme.BackColor  = btnToolBg;
            btnTheme.ForeColor  = _isDark ? Color.FromArgb(255, 220, 80) : Color.FromArgb(80, 80, 80);
            btnTheme.Text       = _isDark ? "🌙" : "☀";
            btnLang.BackColor   = btnToolBg;
            btnLang.ForeColor   = PrimaryRed;
            btnLang.FlatAppearance.BorderColor = PrimaryRed;

            // Title
            lblTitle.ForeColor   = PrimaryRed;         // luôn đỏ
            lblSubtitle.ForeColor = textMuted;

            // Labels
            lblUsername.ForeColor = textMuted;
            lblPassword.ForeColor = textMuted;
            chkRemember.ForeColor = chkFore;
            chkRemember.BackColor = cardBg;

            // Input wraps
            pnlUserWrap.BackColor = inputBg;
            pnlPwdWrap.BackColor  = inputBg;
            txtUsername.BackColor = inputBg;
            txtUsername.ForeColor = textMain;
            txtPassword.BackColor = inputBg;
            txtPassword.ForeColor = textMain;
            btnEye.BackColor      = inputBg;
            btnEye.ForeColor      = textMuted;

            // Error labels – luôn đỏ, bg card
            lblErrUser.BackColor  = cardBg;
            lblErrPwd.BackColor   = cardBg;
            lblError.BackColor    = cardBg;

            // Invalidate để repaint borders
            pnlUserWrap.Invalidate();
            pnlPwdWrap.Invalidate();
            pnlCard.Invalidate();
            this.Invalidate();
        }

        // ─────────────────────────────────────────────────────────
        //  LANGUAGE TOGGLE  (VI ↔ EN)
        // ─────────────────────────────────────────────────────────
        private void btnLang_Click(object? sender, EventArgs e)
        {
            _isEnglish = !_isEnglish;
            ApplyLanguage();
        }

        private void ApplyLanguage()
        {
            // Toggle button
            btnLang.Text = _isEnglish ? "EN" : "VI";

            // Form + labels
            this.Text               = T("formTitle");
            lblTitle.Text           = T("title");
            lblSubtitle.Text        = T("subtitle");
            lblUsername.Text        = T("lblUser");
            txtUsername.PlaceholderText = T("phUser");
            lblErrUser.Text         = T("errUser");
            lblPassword.Text        = T("lblPwd");
            txtPassword.PlaceholderText = T("phPwd");
            lblErrPwd.Text          = T("errPwd");
            chkRemember.Text        = T("remember");
            lnkForgot.Text          = T("forgot");
            btnLogin.Text           = T("btnLogin");
            btnLogin.Invalidate();  // repaint gradient with new text
        }

        // ─────────────────────────────────────────────────────────
        //  INPUT FOCUS
        // ─────────────────────────────────────────────────────────
        private void Input_Enter(object? sender, EventArgs e)
        {
            var wrap = (sender as TextBox)?.Parent as Panel;
            if (wrap == null) return;
            wrap.BackColor  = _isDark ? Color.FromArgb(45, 45, 65) : Color.White;
            wrap.Paint     -= InputWrap_Paint;
            wrap.Paint     += FocusedWrap_Paint;
            wrap.Invalidate();
        }

        private void Input_Leave(object? sender, EventArgs e)
        {
            var wrap = (sender as TextBox)?.Parent as Panel;
            if (wrap == null) return;
            var inputBg    = _isDark ? Color.FromArgb(40, 40, 58) : Color.FromArgb(250, 250, 250);
            wrap.BackColor  = inputBg;
            wrap.Paint     -= FocusedWrap_Paint;
            wrap.Paint     += InputWrap_Paint;
            wrap.Invalidate();
        }

        // ─────────────────────────────────────────────────────────
        //  EYE toggle
        // ─────────────────────────────────────────────────────────
        private void btnEye_Click(object? sender, EventArgs e)
        {
            _passwordVisible = !_passwordVisible;
            txtPassword.UseSystemPasswordChar = !_passwordVisible;
            btnEye.Text = _passwordVisible ? "🙈" : "👁";
        }

        // ─────────────────────────────────────────────────────────
        //  LOGIN submit
        // ─────────────────────────────────────────────────────────
        private void btnLogin_Click(object? sender, EventArgs e)
        {
            lblErrUser.Visible = false;
            lblErrPwd.Visible  = false;
            lblError.Visible   = false;

            var uid = txtUsername.Text.Trim();
            var pwd = txtPassword.Text;

            if (string.IsNullOrWhiteSpace(uid))
            {
                lblErrUser.Visible = true;
                txtUsername.Focus();
                return;
            }
            if (string.IsNullOrWhiteSpace(pwd))
            {
                lblErrPwd.Visible = true;
                txtPassword.Focus();
                return;
            }

            SetLoading(true);
            try
            {
                var user = _authService.Login(uid, pwd);
                if (user == null)
                {
                    lblError.Text    = T("errWrong");
                    lblError.Visible = true;
                    txtPassword.Clear();
                    txtPassword.Focus();
                    return;
                }

                AppSession.CurrentUser = user;
                this.Hide();
                OpenDashboard(user.Role);
                this.Close();
            }
            catch (Exception ex)
            {
                lblError.Text    = T("errSystem") + ex.Message;
                lblError.Visible = true;
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
                _           => throw new InvalidOperationException("Invalid role: " + role)
            };
            dashboard.Show();
        }

        private void SetLoading(bool loading)
        {
            btnLogin.Enabled   = !loading;
            btnLogin.Text      = loading ? T("btnLoading") : T("btnLogin");
            btnLogin.Invalidate();
            this.UseWaitCursor = loading;
        }

        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (keyData == Keys.Enter) { btnLogin_Click(this, EventArgs.Empty); return true; }
            return base.ProcessCmdKey(ref msg, keyData);
        }

        private void lnkForgot_LinkClicked(object? sender, LinkLabelLinkClickedEventArgs e)
        {
            MessageBox.Show(T("forgotDlg"), T("forgotTitle"), MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }
}
