using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Runtime.InteropServices;
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
        private static readonly Color BgLightTop  = Color.FromArgb(225, 100, 90);
        private static readonly Color BgMidRed    = Color.FromArgb(195,  42,  38);

        // ── Win32: placeholder hoạt động với password fields ─────
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr SendMessage(IntPtr hWnd, uint msg, IntPtr w, string l);
        private const uint EM_SETCUEBANNER = 0x1501;
        private static void SetCueBanner(TextBox tb, string text)
            => SendMessage(tb.Handle, EM_SETCUEBANNER, (IntPtr)1, text);

        // ── State ─────────────────────────────────────────────────
        private bool _isDark          = false;
        private bool _isEnglish       = false;
        private bool _passwordVisible = false;
        private readonly AuthService _authService;

        // ── Flag images ───────────────────────────────────────────
        private Image? _imgVI;
        private Image? _imgEN;

        // ── Shared tooltip ──────────────────────────────────────
        private readonly ToolTip _tips = new ToolTip();

        // ── Strings (VI / EN) ─────────────────────────────────────
        private static readonly Dictionary<string, string[]> Strings = new()
        {
            // key → [VI, EN]
            ["title"]       = ["", ""],
            ["subtitle"]    = ["Đăng nhập vào Hệ thống HRM & Payroll", "Sign in to HRM & Payroll System"],
            ["lblUser"]     = ["TÊN ĐĂNG NHẬP", "USERNAME"],
            ["phUser"]      = ["Nhập tên đăng nhập", "Enter username"],
            ["errUser"]     = ["⚠  Vui lòng nhập tên đăng nhập.", "⚠  Please enter your username."],
            ["lblPwd"]      = ["MẬT KHẨU", "PASSWORD"],
            ["phPwd"]       = ["Nhập mật khẩu", "Enter password"],
            ["errPwd"]      = ["⚠  Vui lòng nhập mật khẩu.", "⚠  Please enter your password."],

            ["forgot"]      = ["Quên mật khẩu?", "Forgot password?"],
            ["btnLogin"]    = ["Đăng nhập", "Sign In"],
            ["btnLoading"]  = ["Đang xác thực...", "Authenticating..."],
            ["errWrong"]    = ["⚠  Sai tên đăng nhập hoặc mật khẩu.", "⚠  Incorrect username or password."],
            ["errSystem"]   = ["⚠  Lỗi hệ thống: ", "⚠  System error: "],
            ["forgotDlg"]   = ["Vui lòng liên hệ bộ phận HR hoặc Admin để được cấp lại mật khẩu.",
                               "Please contact HR or Admin department to reset your password."],
            ["forgotTitle"] = ["Quên mật khẩu", "Forgot Password"],
            ["formTitle"]   = ["AXIOM – Đăng Nhập", "AXIOM – Sign In"],
        };

        private string T(string key) => Strings[key][_isEnglish ? 1 : 0];

        // ─────────────────────────────────────────────────────────
        public frmLogin()
        {
            InitializeComponent();
            _authService = new AuthService();
            LoadFlagImages();
            ApplyLoginButtonGradient();
            RoundLoginButton();
            RoundInputWraps();
            RoundCard();
            ApplyRoundRegion(pnlLogoBox, 18);   // bo tròn logo box kiểu iOS
            ApplyTheme();

            // Gọi SetCueBanner sau khi Handle tạo xong
            this.Shown += (_, _) => SetCueBanner(txtPassword, T("phPwd"));
        }

        // ── Load flag images from images folder ───────────────────
        private void LoadFlagImages()
        {
            try
            {
                // Tìm thư mục images tương đối với thư mục chạy exe
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                // Đi lên để tìm thư mục gốc project (chứa folder images)
                string? dir = baseDir;
                string? imagesDir = null;
                for (int i = 0; i < 8; i++)
                {
                    string candidate = Path.Combine(dir!, "images");
                    if (Directory.Exists(candidate)) { imagesDir = candidate; break; }
                    dir = Directory.GetParent(dir!)?.FullName;
                    if (dir == null) break;
                }
                if (imagesDir != null)
                {
                    string viPath   = Path.Combine(imagesDir, "covietnam.png");
                    string enPath   = Path.Combine(imagesDir, "coanh.png");
                    string logoPath = Path.Combine(imagesDir, "logoAXIOM.png");
                    if (File.Exists(viPath))   _imgVI = Image.FromFile(viPath);
                    if (File.Exists(enPath))   _imgEN = Image.FromFile(enPath);
                    if (File.Exists(logoPath))
                    {
                        var bmp = new Bitmap(logoPath);
                        // Xóa nền: lấy màu pixel góc trên-trái làm transparent
                        bmp.MakeTransparent(bmp.GetPixel(0, 0));
                        picLogo.Image = bmp;
                    }
                }
            }
            catch { /* nếu không load được, giữ nguyên text */ }

            // Gán ảnh ban đầu (VI)
            SetLangButton();
        }

        private void SetLangButton()
        {
            if (_imgVI != null && _imgEN != null)
            {
                btnLang.Text       = string.Empty;
                // Scale rồi bo tròn góc ảnh cờ
                var scaled = ScaleImage(_isEnglish ? _imgEN : _imgVI,
                                        btnLang.Width  - 4,
                                        btnLang.Height - 4);
                btnLang.Image      = RoundImage(scaled, 5);
                btnLang.ImageAlign = ContentAlignment.MiddleCenter;
                btnLang.FlatAppearance.BorderSize = 0;
                _tips.SetToolTip(btnLang, _isEnglish ? "Switch to Vietnamese" : "Chuyển sang tiếng Việt");
            }
            else
            {
                btnLang.Text  = _isEnglish ? "EN" : "VI";
                btnLang.Image = null;
            }
        }

        /// <summary>Bo tròn góc ảnh với radius cho trước.</summary>
        private static Image RoundImage(Image src, int radius)
        {
            var bmp = new Bitmap(src.Width, src.Height,
                                 System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            using var g = Graphics.FromImage(bmp);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.Clear(Color.Transparent);
            int w = bmp.Width, h = bmp.Height, d = radius * 2;
            using var path = new GraphicsPath();
            path.AddArc(0,     0,     d, d, 180, 90);
            path.AddArc(w - d, 0,     d, d, 270, 90);
            path.AddArc(w - d, h - d, d, d,   0, 90);
            path.AddArc(0,     h - d, d, d,  90, 90);
            path.CloseFigure();
            g.SetClip(path);
            g.DrawImage(src, 0, 0, w, h);
            return bmp;
        }

        /// <summary>Scale ảnh về đúng kích thước w×h bằng InterpolationMode cao cấp.</summary>
        private static Image ScaleImage(Image src, int w, int h)
        {
            w = Math.Max(1, w);
            h = Math.Max(1, h);
            var bmp = new Bitmap(w, h);
            using var g = Graphics.FromImage(bmp);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.DrawImage(src, 0, 0, w, h);
            return bmp;
        }

        // ── Bo tròn nút đăng nhập ─────────────────────────────────
        private void RoundLoginButton()
        {
            btnLogin.SizeChanged += (_, __) => ApplyRoundRegion(btnLogin, 10);
            ApplyRoundRegion(btnLogin, 10);
        }

        // ── Bo tròn input wrap panels ─────────────────────────────
        private void RoundInputWraps()
        {
            pnlUserWrap.SizeChanged += (_, __) => ApplyRoundRegion(pnlUserWrap, 8);
            pnlPwdWrap.SizeChanged  += (_, __) => ApplyRoundRegion(pnlPwdWrap,  8);
            ApplyRoundRegion(pnlUserWrap, 8);
            ApplyRoundRegion(pnlPwdWrap,  8);
        }

        private static void ApplyRoundRegion(Control ctrl, int radius)
        {
            var gp = new GraphicsPath();
            var r  = ctrl.ClientRectangle;
            int d  = radius * 2;
            gp.AddArc(r.X,              r.Y,               d, d, 180, 90);
            gp.AddArc(r.Right - d,      r.Y,               d, d, 270, 90);
            gp.AddArc(r.Right - d,      r.Bottom - d,      d, d,   0, 90);
            gp.AddArc(r.X,              r.Bottom - d,      d, d,  90, 90);
            gp.CloseFigure();
            ctrl.Region = new Region(gp);
        }

        // ─────────────────────────────────────────────────────────
        //  FORM BACKGROUND – gradient đỏ sáng
        // ─────────────────────────────────────────────────────────
        private void frmLogin_Paint(object? sender, PaintEventArgs e)
        {
            Color top, bot;
            if (_isDark)
            {
                top = Color.FromArgb(28, 22, 22);   // gần đen ấm, không đỏ
                bot = Color.FromArgb(14, 10, 10);   // đen sâu
            }
            else
            {
                top = BgLightTop;
                bot = BgMidRed;
            }
            using var bgBrush = new LinearGradientBrush(ClientRectangle, top, bot, 145f);
            e.Graphics.FillRectangle(bgBrush, ClientRectangle);

            DrawDecoCircle(e.Graphics, -140, -140, 480, Color.FromArgb(30, 255, 255, 255));
            DrawDecoCircle(e.Graphics, Width - 200, Height - 200, 380, Color.FromArgb(20, 0, 0, 0));
            DrawDecoCircle(e.Graphics, Width / 2 - 60, -100, 260, Color.FromArgb(12, 255, 255, 255));

            // ── Soft shadow bị card ──────────────────────────────────────
            DrawCardShadow(e.Graphics, pnlCard.Bounds);
        }

        private static void DrawCardShadow(Graphics g, Rectangle cardBounds)
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            const int layers = 8;
            const int spread = 12;
            for (int i = 0; i < layers; i++)
            {
                int inset  = spread - (int)(spread * i / (float)layers);
                float t    = i / (float)(layers - 1);
                int alpha  = (int)(3 + t * 12);   // 3 → 15 (rất nhẹ)
                var r      = Rectangle.Inflate(cardBounds, inset, inset);
                int radius = 20 + inset;
                using var path  = RoundedRect(r, radius);
                using var brush = new SolidBrush(Color.FromArgb(alpha, 0, 0, 0));
                g.FillPath(brush, path);
            }
        }

        private static GraphicsPath RoundedRect(Rectangle r, int radius)
        {
            int d = radius * 2;
            var gp = new GraphicsPath();
            gp.AddArc(r.X,              r.Y,               d, d, 180, 90);
            gp.AddArc(r.Right - d,      r.Y,               d, d, 270, 90);
            gp.AddArc(r.Right - d,      r.Bottom - d,      d, d,   0, 90);
            gp.AddArc(r.X,              r.Bottom - d,      d, d,  90, 90);
            gp.CloseFigure();
            return gp;
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

        // ── Logo Box – nền giống background app nhưng sáng hơn, cố định ──
        private void pnlLogoBox_Paint(object? sender, PaintEventArgs e)
        {
            if (sender is not Panel p) return;
            var rect = p.ClientRectangle;
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;

            // Cố định: gradient đỏ hồng sáng (giống BG nhưng lighter)
            // Giữ nguyên cả light mode và dark mode
            Color top = Color.FromArgb(240, 130, 130);  // đỏ hồng sáng
            Color bot = Color.FromArgb(200, 60, 60);    // đỏ đậm vừa
            using var brush = new LinearGradientBrush(rect, top, bot, 145f);

            int r = 18, d = r * 2;
            using var gp = new GraphicsPath();
            gp.AddArc(0,              0,               d, d, 180, 90);
            gp.AddArc(rect.Width - d, 0,               d, d, 270, 90);
            gp.AddArc(rect.Width - d, rect.Height - d, d, d,   0, 90);
            gp.AddArc(0,              rect.Height - d, d, d,  90, 90);
            gp.CloseFigure();
            e.Graphics.FillPath(brush, gp);
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
            // Viền rất mờ – để giữ tính trong sạch, shadow đã được vẽ ngoài form
            using var pen = new Pen(Color.FromArgb(10, 0, 0, 0), 1f);
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
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            DrawRoundRect(e.Graphics, pen, 0, 0, p.Width - 1, p.Height - 1, 8);
        }

        private void FocusedWrap_Paint(object? sender, PaintEventArgs e)
        {
            if (sender is not Panel p) return;
            using var pen = new Pen(PrimaryRed, 2f);
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            DrawRoundRect(e.Graphics, pen, 0, 0, p.Width - 1, p.Height - 1, 8);
        }

        private static void DrawRoundRect(Graphics g, Pen pen, float x, float y, float w, float h, float r)
        {
            float d = r * 2;
            using var gp = new GraphicsPath();
            gp.AddArc(x,         y,         d, d, 180, 90);
            gp.AddArc(x + w - d, y,         d, d, 270, 90);
            gp.AddArc(x + w - d, y + h - d, d, d,   0, 90);
            gp.AddArc(x,         y + h - d, d, d,  90, 90);
            gp.CloseFigure();
            g.DrawPath(pen, gp);
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
            // ── Màu sắc dark/light ─────────────────────────────────
            // Dark mode chuẩn: nền tối trung tính, card dark surface, text sáng
            var cardBg    = _isDark ? Color.FromArgb(38, 32, 32)    : Color.White;
            var inputBg   = _isDark ? Color.FromArgb(52, 44, 44)    : Color.FromArgb(250, 250, 250);
            var textMain  = _isDark ? Color.FromArgb(240, 235, 235) : Color.FromArgb(51, 51, 51);
            var textMuted = _isDark ? Color.FromArgb(168, 155, 155) : Color.FromArgb(136, 136, 136);
            var chkFore   = textMuted;
            var btnToolBg = Color.Transparent;

            // Card
            pnlCard.BackColor  = cardBg;
            picLogo.BackColor  = Color.Transparent;
            pnlLogoBox.Invalidate();                 // repaint frosted glass

            // AXIOM label – màu của background form (PrimaryRed)
            lblAppName.ForeColor = PrimaryRed;

            // Buttons toolbar – dùng Segoe UI Emoji để render icon đúng
            btnTheme.BackColor = btnToolBg;
            btnTheme.Font      = new Font("Segoe UI Emoji", 12f);
            btnTheme.ForeColor = _isDark ? Color.FromArgb(220, 210, 210) : Color.FromArgb(90, 90, 90);
            btnTheme.Text      = _isDark ? "🌙" : "🌞";
            // Tắt highlight trắng khi hover/click
            btnTheme.FlatAppearance.MouseDownBackColor = Color.FromArgb(50, 128, 128, 128);
            btnTheme.FlatAppearance.MouseOverBackColor = Color.FromArgb(25, 128, 128, 128);
            btnTheme.FlatAppearance.BorderSize         = 0;
            // Tooltip cho nút chế độ
            _tips.SetToolTip(btnTheme, _isDark ? "Chuyển chế độ sáng" : "Chuyển chế độ tối");
            btnLang.BackColor  = btnToolBg;
            btnLang.ForeColor  = PrimaryRed;
            btnLang.FlatAppearance.BorderColor         = PrimaryRed;
            // Tắt highlight trắng khi hover/click cho btnLang
            btnLang.FlatAppearance.MouseDownBackColor  = Color.FromArgb(50, 128, 128, 128);
            btnLang.FlatAppearance.MouseOverBackColor  = Color.FromArgb(25, 128, 128, 128);

            // Title – nhỏ hơn AXIOM, màu textMuted
            lblTitle.ForeColor = textMuted;

            // Labels
            lblUsername.ForeColor = textMuted;
            lblPassword.ForeColor = textMuted;


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
            // Toggle button – dùng hình cờ
            SetLangButton();

            // Form + labels
            this.Text               = T("formTitle");
            lblTitle.Text           = T("title");
            lblUsername.Text        = T("lblUser");
            txtUsername.PlaceholderText = T("phUser");
            lblErrUser.Text         = T("errUser");
            lblPassword.Text        = T("lblPwd");
            SetCueBanner(txtPassword, T("phPwd"));  // Win32 API – hoạt động với password char
            lblErrPwd.Text          = T("errPwd");

            lnkForgot.Text          = T("forgot");
            btnLogin.Text           = T("btnLogin");
            btnLogin.Invalidate();  // repaint gradient with new text
        }

        // ─────────────────────────────────────────────────────────
        //  INPUT FOCUS
        // ─────────────────────────────────────────────────────────
        private void Input_Enter(object? sender, EventArgs e)
        {
            var txt  = sender as TextBox;
            var wrap = txt?.Parent as Panel;
            if (wrap == null) return;
            var focusBg = _isDark ? Color.FromArgb(62, 52, 52) : Color.White;
            wrap.BackColor = focusBg;
            if (txt != null) txt.BackColor = focusBg;
            wrap.Paint    -= InputWrap_Paint;
            wrap.Paint    += FocusedWrap_Paint;
            wrap.Invalidate();
        }

        private void Input_Leave(object? sender, EventArgs e)
        {
            var txt  = sender as TextBox;
            var wrap = txt?.Parent as Panel;
            if (wrap == null) return;
            var inputBg = _isDark ? Color.FromArgb(52, 44, 44) : Color.FromArgb(250, 250, 250);
            wrap.BackColor = inputBg;
            if (txt != null) txt.BackColor = inputBg;
            wrap.Paint    -= FocusedWrap_Paint;
            wrap.Paint    += InputWrap_Paint;
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
