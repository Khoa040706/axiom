namespace HRMPayroll.UI.Auth
{
    partial class frmLogin
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null)) components.Dispose();
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        private void InitializeComponent()
        {
            // ── Controls ────────────────────────────────
            pnlBranding   = new System.Windows.Forms.Panel();
            lblAppName    = new System.Windows.Forms.Label();
            lblTagline    = new System.Windows.Forms.Label();
            lblFeatures   = new System.Windows.Forms.Label();
            lblCopyright  = new System.Windows.Forms.Label();

            pnlForm       = new System.Windows.Forms.Panel();
            lblTitle      = new System.Windows.Forms.Label();
            lblSubtitle   = new System.Windows.Forms.Label();

            lblRoleGroup  = new System.Windows.Forms.Label();
            rbAdmin       = new System.Windows.Forms.RadioButton();
            rbHR          = new System.Windows.Forms.RadioButton();
            rbEmployee    = new System.Windows.Forms.RadioButton();

            lblUsername   = new System.Windows.Forms.Label();
            txtUsername   = new System.Windows.Forms.TextBox();

            lblPassword   = new System.Windows.Forms.Label();
            txtPassword   = new System.Windows.Forms.TextBox();
            btnTogglePwd  = new System.Windows.Forms.Button();

            chkRemember   = new System.Windows.Forms.CheckBox();
            lnkForgot     = new System.Windows.Forms.LinkLabel();

            btnLogin      = new System.Windows.Forms.Button();
            lblError      = new System.Windows.Forms.Label();

            lblStatusText = new System.Windows.Forms.Label();
            pnlStatusDot  = new System.Windows.Forms.Panel();
            lblVersion    = new System.Windows.Forms.Label();

            // ── FORM ────────────────────────────────────
            this.SuspendLayout();
            this.Text            = "HRM & Payroll – Đăng Nhập";
            this.Size            = new System.Drawing.Size(900, 560);
            this.StartPosition   = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.MaximizeBox     = false;
            this.Font            = new System.Drawing.Font("Segoe UI", 9f);
            this.Controls.Add(pnlBranding);
            this.Controls.Add(pnlForm);

            // ── PANEL BRANDING (trái, 400px) ─────────────
            pnlBranding.Location  = new System.Drawing.Point(0, 0);
            pnlBranding.Size      = new System.Drawing.Size(400, 560);
            pnlBranding.Controls.AddRange(new System.Windows.Forms.Control[]
                { lblAppName, lblTagline, lblFeatures, lblCopyright });
            pnlBranding.Paint    += pnlBranding_Paint;

            // Tên app
            lblAppName.Text      = "HRM & Payroll";
            lblAppName.Font      = new System.Drawing.Font("Segoe UI", 22f, System.Drawing.FontStyle.Bold);
            lblAppName.ForeColor = System.Drawing.Color.White;
            lblAppName.Location  = new System.Drawing.Point(40, 60);
            lblAppName.Size      = new System.Drawing.Size(320, 45);

            // Tagline
            lblTagline.Text      = "Hệ thống Quản lý Nhân sự\nvà Tiền lương Doanh nghiệp";
            lblTagline.Font      = new System.Drawing.Font("Segoe UI", 11f);
            lblTagline.ForeColor = System.Drawing.Color.FromArgb(230, 230, 230);
            lblTagline.Location  = new System.Drawing.Point(40, 115);
            lblTagline.Size      = new System.Drawing.Size(320, 55);

            // Features
            lblFeatures.Text =
                "✔  Quản lý hồ sơ & hợp đồng nhân viên\r\n" +
                "✔  Chấm công, OT, nghỉ phép tự động\r\n" +
                "✔  Tính lương Gross/Net + BHXH + Thuế TNCN\r\n" +
                "✔  Dashboard báo cáo trực quan\r\n" +
                "✔  Phân quyền RBAC (Admin / HR / Nhân viên)";
            lblFeatures.Font      = new System.Drawing.Font("Segoe UI", 10f);
            lblFeatures.ForeColor = System.Drawing.Color.FromArgb(245, 220, 220);
            lblFeatures.Location  = new System.Drawing.Point(40, 220);
            lblFeatures.Size      = new System.Drawing.Size(330, 160);

            // Copyright
            lblCopyright.Text      = "© 2026  Nhóm 52400017 · 52400133 · 52400004\nĐồ án Công nghệ Phần mềm";
            lblCopyright.Font      = new System.Drawing.Font("Segoe UI", 8.5f);
            lblCopyright.ForeColor = System.Drawing.Color.FromArgb(180, 160, 160);
            lblCopyright.Location  = new System.Drawing.Point(40, 490);
            lblCopyright.Size      = new System.Drawing.Size(320, 40);

            // ── PANEL FORM (phải, 500px) ──────────────────
            pnlForm.Location  = new System.Drawing.Point(400, 0);
            pnlForm.Size      = new System.Drawing.Size(500, 560);
            pnlForm.BackColor = System.Drawing.Color.White;
            pnlForm.Controls.AddRange(new System.Windows.Forms.Control[]
            {
                lblTitle, lblSubtitle,
                lblRoleGroup, rbAdmin, rbHR, rbEmployee,
                lblUsername, txtUsername,
                lblPassword, txtPassword, btnTogglePwd,
                chkRemember, lnkForgot,
                btnLogin, lblError,
                pnlStatusDot, lblStatusText, lblVersion
            });

            // Tiêu đề
            lblTitle.Text     = "Chào mừng trở lại!";
            lblTitle.Font     = new System.Drawing.Font("Segoe UI", 18f, System.Drawing.FontStyle.Bold);
            lblTitle.Location = new System.Drawing.Point(50, 48);
            lblTitle.Size     = new System.Drawing.Size(400, 36);

            lblSubtitle.Text     = "Đăng nhập vào Hệ thống HRM & Payroll";
            lblSubtitle.Font     = new System.Drawing.Font("Segoe UI", 9.5f);
            lblSubtitle.Location = new System.Drawing.Point(50, 88);
            lblSubtitle.Size     = new System.Drawing.Size(400, 22);

            // Role group
            lblRoleGroup.Text     = "VAI TRÒ ĐĂNG NHẬP";
            lblRoleGroup.Font     = new System.Drawing.Font("Segoe UI", 8f, System.Drawing.FontStyle.Bold);
            lblRoleGroup.Location = new System.Drawing.Point(50, 128);
            lblRoleGroup.Size     = new System.Drawing.Size(200, 18);

            rbAdmin.Text     = "Admin";
            rbAdmin.Checked  = true;
            rbAdmin.Location = new System.Drawing.Point(50, 150);
            rbAdmin.Size     = new System.Drawing.Size(110, 24);
            rbAdmin.Font     = new System.Drawing.Font("Segoe UI", 9.5f);
            rbAdmin.CheckedChanged += rbAdmin_CheckedChanged;

            rbHR.Text     = "HR Manager";
            rbHR.Location = new System.Drawing.Point(165, 150);
            rbHR.Size     = new System.Drawing.Size(120, 24);
            rbHR.Font     = new System.Drawing.Font("Segoe UI", 9.5f);
            rbHR.CheckedChanged += rbHR_CheckedChanged;

            rbEmployee.Text     = "Nhân viên";
            rbEmployee.Location = new System.Drawing.Point(290, 150);
            rbEmployee.Size     = new System.Drawing.Size(110, 24);
            rbEmployee.Font     = new System.Drawing.Font("Segoe UI", 9.5f);
            rbEmployee.CheckedChanged += rbEmployee_CheckedChanged;

            // Username
            lblUsername.Text     = "TÊN ĐĂNG NHẬP";
            lblUsername.Font     = new System.Drawing.Font("Segoe UI", 8f, System.Drawing.FontStyle.Bold);
            lblUsername.Location = new System.Drawing.Point(50, 196);
            lblUsername.Size     = new System.Drawing.Size(200, 18);

            txtUsername.PlaceholderText = "Email Admin hệ thống";
            txtUsername.Location        = new System.Drawing.Point(50, 218);
            txtUsername.Size            = new System.Drawing.Size(400, 32);
            txtUsername.Enter          += Input_Enter;
            txtUsername.Leave          += Input_Leave;

            // Password
            lblPassword.Text     = "MẬT KHẨU";
            lblPassword.Font     = new System.Drawing.Font("Segoe UI", 8f, System.Drawing.FontStyle.Bold);
            lblPassword.Location = new System.Drawing.Point(50, 268);
            lblPassword.Size     = new System.Drawing.Size(200, 18);

            txtPassword.UseSystemPasswordChar = true;
            txtPassword.Location = new System.Drawing.Point(50, 290);
            txtPassword.Size     = new System.Drawing.Size(364, 32);
            txtPassword.Enter   += Input_Enter;
            txtPassword.Leave   += Input_Leave;

            btnTogglePwd.Text      = "👁";
            btnTogglePwd.Location  = new System.Drawing.Point(418, 290);
            btnTogglePwd.Size      = new System.Drawing.Size(32, 32);
            btnTogglePwd.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            btnTogglePwd.FlatAppearance.BorderColor = System.Drawing.Color.FromArgb(224, 224, 224);
            btnTogglePwd.Cursor    = System.Windows.Forms.Cursors.Hand;
            btnTogglePwd.Click    += btnTogglePwd_Click;

            // Remember & Forgot
            chkRemember.Text     = "Ghi nhớ đăng nhập";
            chkRemember.Location = new System.Drawing.Point(50, 336);
            chkRemember.Size     = new System.Drawing.Size(160, 22);
            chkRemember.Font     = new System.Drawing.Font("Segoe UI", 9f);

            lnkForgot.Text      = "Quên mật khẩu?";
            lnkForgot.Location  = new System.Drawing.Point(334, 336);
            lnkForgot.Size      = new System.Drawing.Size(116, 22);
            lnkForgot.Font      = new System.Drawing.Font("Segoe UI", 9f, System.Drawing.FontStyle.Bold);
            lnkForgot.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            lnkForgot.LinkClicked += lnkForgot_LinkClicked;

            // Error label
            lblError.Text      = "";
            lblError.ForeColor = System.Drawing.Color.FromArgb(211, 47, 47);
            lblError.Font      = new System.Drawing.Font("Segoe UI", 9f);
            lblError.Location  = new System.Drawing.Point(50, 364);
            lblError.Size      = new System.Drawing.Size(400, 20);
            lblError.Visible   = false;

            // Login button
            btnLogin.Text      = "Đăng nhập";
            btnLogin.Location  = new System.Drawing.Point(50, 390);
            btnLogin.Size      = new System.Drawing.Size(400, 42);
            btnLogin.Font      = new System.Drawing.Font("Segoe UI", 11f, System.Drawing.FontStyle.Bold);
            btnLogin.Click    += btnLogin_Click;

            // Status bar
            pnlStatusDot.Size      = new System.Drawing.Size(9, 9);
            pnlStatusDot.Location  = new System.Drawing.Point(50, 500);
            pnlStatusDot.BackColor = System.Drawing.Color.FromArgb(76, 175, 80);

            // Vẽ hình tròn cho dot
            pnlStatusDot.Paint += (s, e) =>
            {
                e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                e.Graphics.FillEllipse(
                    new System.Drawing.SolidBrush(System.Drawing.Color.FromArgb(76, 175, 80)),
                    0, 0, 9, 9);
            };

            lblStatusText.Text     = "Hệ thống đang hoạt động bình thường";
            lblStatusText.Font     = new System.Drawing.Font("Segoe UI", 8.5f);
            lblStatusText.Location = new System.Drawing.Point(65, 496);
            lblStatusText.Size     = new System.Drawing.Size(280, 18);

            lblVersion.Text      = "v1.0.0";
            lblVersion.Font      = new System.Drawing.Font("Segoe UI", 8.5f, System.Drawing.FontStyle.Bold);
            lblVersion.Location  = new System.Drawing.Point(400, 496);
            lblVersion.Size      = new System.Drawing.Size(50, 18);
            lblVersion.TextAlign = System.Drawing.ContentAlignment.MiddleRight;

            this.ResumeLayout(false);
        }

        #endregion

        // ── Fields ─────────────────────────────────────────
        private System.Windows.Forms.Panel      pnlBranding;
        private System.Windows.Forms.Label      lblAppName;
        private System.Windows.Forms.Label      lblTagline;
        private System.Windows.Forms.Label      lblFeatures;
        private System.Windows.Forms.Label      lblCopyright;

        private System.Windows.Forms.Panel      pnlForm;
        private System.Windows.Forms.Label      lblTitle;
        private System.Windows.Forms.Label      lblSubtitle;

        private System.Windows.Forms.Label      lblRoleGroup;
        private System.Windows.Forms.RadioButton rbAdmin;
        private System.Windows.Forms.RadioButton rbHR;
        private System.Windows.Forms.RadioButton rbEmployee;

        private System.Windows.Forms.Label      lblUsername;
        private System.Windows.Forms.TextBox    txtUsername;
        private System.Windows.Forms.Label      lblPassword;
        private System.Windows.Forms.TextBox    txtPassword;
        private System.Windows.Forms.Button     btnTogglePwd;

        private System.Windows.Forms.CheckBox   chkRemember;
        private System.Windows.Forms.LinkLabel  lnkForgot;

        private System.Windows.Forms.Button     btnLogin;
        private System.Windows.Forms.Label      lblError;

        private System.Windows.Forms.Panel      pnlStatusDot;
        private System.Windows.Forms.Label      lblStatusText;
        private System.Windows.Forms.Label      lblVersion;
    }
}
