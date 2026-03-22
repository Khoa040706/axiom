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
            // Card
            pnlCard     = new System.Windows.Forms.Panel();

            // Top-right toolbar (theme + language)
            btnTheme    = new System.Windows.Forms.Button();
            btnLang     = new System.Windows.Forms.Button();

            // Header
            lblTitle    = new System.Windows.Forms.Label();
            lblSubtitle = new System.Windows.Forms.Label();

            // Inputs
            lblUsername = new System.Windows.Forms.Label();
            pnlUserWrap = new System.Windows.Forms.Panel();
            txtUsername = new System.Windows.Forms.TextBox();
            lblErrUser  = new System.Windows.Forms.Label();

            lblPassword = new System.Windows.Forms.Label();
            pnlPwdWrap  = new System.Windows.Forms.Panel();
            txtPassword = new System.Windows.Forms.TextBox();
            btnEye      = new System.Windows.Forms.Button();
            lblErrPwd   = new System.Windows.Forms.Label();

            // Options
            chkRemember = new System.Windows.Forms.CheckBox();
            lnkForgot   = new System.Windows.Forms.LinkLabel();

            // Button & Error
            btnLogin    = new System.Windows.Forms.Button();
            lblError    = new System.Windows.Forms.Label();

            // ── FORM ────────────────────────────────────────────────
            this.SuspendLayout();
            this.Text            = "HRM & Payroll – Đăng Nhập";
            this.Size            = new System.Drawing.Size(900, 540);
            this.StartPosition   = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.MaximizeBox     = false;
            this.Font            = new System.Drawing.Font("Segoe UI", 9f);
            this.BackColor       = System.Drawing.Color.FromArgb(154, 0, 7);
            this.Paint          += frmLogin_Paint;
            this.Controls.Add(pnlCard);

            // ── CARD ─────────────────────────────────────────────────
            int cardW = 460, cardH = 420;
            int cardX = (900 - cardW) / 2;
            int cardY = (540 - cardH) / 2;

            pnlCard.Location  = new System.Drawing.Point(cardX, cardY);
            pnlCard.Size      = new System.Drawing.Size(cardW, cardH);
            pnlCard.BackColor = System.Drawing.Color.White;
            pnlCard.Paint    += pnlCard_Paint;
            pnlCard.Controls.AddRange(new System.Windows.Forms.Control[]
            {
                btnTheme, btnLang,
                lblTitle, lblSubtitle,
                lblUsername, pnlUserWrap, lblErrUser,
                lblPassword, pnlPwdWrap, lblErrPwd,
                chkRemember, lnkForgot,
                btnLogin, lblError
            });

            // ── Top-right toolbar ────────────────────────────────────
            // Theme button (sun/moon) – far right
            btnTheme.Text      = "☀";
            btnTheme.Font      = new System.Drawing.Font("Segoe UI", 13f);
            btnTheme.Location  = new System.Drawing.Point(cardW - 46, 10);
            btnTheme.Size      = new System.Drawing.Size(36, 32);
            btnTheme.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            btnTheme.FlatAppearance.BorderSize  = 0;
            btnTheme.BackColor = System.Drawing.Color.Transparent;
            btnTheme.Cursor    = System.Windows.Forms.Cursors.Hand;
            btnTheme.Click    += btnTheme_Click;

            // Language button (EN/VI) – next to theme
            btnLang.Text      = "VI";
            btnLang.Font      = new System.Drawing.Font("Segoe UI", 8f, System.Drawing.FontStyle.Bold);
            btnLang.Location  = new System.Drawing.Point(cardW - 88, 12);
            btnLang.Size      = new System.Drawing.Size(36, 28);
            btnLang.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            btnLang.FlatAppearance.BorderColor = System.Drawing.Color.FromArgb(211, 47, 47);
            btnLang.FlatAppearance.BorderSize  = 1;
            btnLang.BackColor = System.Drawing.Color.Transparent;
            btnLang.ForeColor = System.Drawing.Color.FromArgb(211, 47, 47);
            btnLang.Cursor    = System.Windows.Forms.Cursors.Hand;
            btnLang.Click    += btnLang_Click;

            // ── Header ───────────────────────────────────────────────
            lblTitle.Text      = "Chào mừng trở lại!";
            lblTitle.Font      = new System.Drawing.Font("Segoe UI", 20f, System.Drawing.FontStyle.Bold);
            lblTitle.ForeColor = System.Drawing.Color.FromArgb(211, 47, 47);
            lblTitle.Location  = new System.Drawing.Point(40, 26);
            lblTitle.Size      = new System.Drawing.Size(340, 40);

            lblSubtitle.Text      = "Đăng nhập vào Hệ thống HRM & Payroll";
            lblSubtitle.Font      = new System.Drawing.Font("Segoe UI", 9f);
            lblSubtitle.ForeColor = System.Drawing.Color.FromArgb(136, 136, 136);
            lblSubtitle.Location  = new System.Drawing.Point(40, 68);
            lblSubtitle.Size      = new System.Drawing.Size(380, 20);

            // ── Username ─────────────────────────────────────────────
            lblUsername.Text      = "TÊN ĐĂNG NHẬP";
            lblUsername.Font      = new System.Drawing.Font("Segoe UI", 7.5f, System.Drawing.FontStyle.Bold);
            lblUsername.ForeColor = System.Drawing.Color.FromArgb(136, 136, 136);
            lblUsername.Location  = new System.Drawing.Point(40, 104);
            lblUsername.Size      = new System.Drawing.Size(200, 16);

            pnlUserWrap.Location  = new System.Drawing.Point(40, 122);
            pnlUserWrap.Size      = new System.Drawing.Size(380, 40);
            pnlUserWrap.BackColor = System.Drawing.Color.FromArgb(250, 250, 250);
            pnlUserWrap.Paint    += InputWrap_Paint;

            txtUsername.PlaceholderText = "Nhập tên đăng nhập";
            txtUsername.Location        = new System.Drawing.Point(10, 8);
            txtUsername.Size            = new System.Drawing.Size(360, 24);
            txtUsername.BorderStyle     = System.Windows.Forms.BorderStyle.None;
            txtUsername.Font            = new System.Drawing.Font("Segoe UI", 10f);
            txtUsername.BackColor       = System.Drawing.Color.FromArgb(250, 250, 250);
            txtUsername.Enter          += Input_Enter;
            txtUsername.Leave          += Input_Leave;
            pnlUserWrap.Controls.Add(txtUsername);

            lblErrUser.Text      = "⚠  Vui lòng nhập tên đăng nhập.";
            lblErrUser.Font      = new System.Drawing.Font("Segoe UI", 8.5f);
            lblErrUser.ForeColor = System.Drawing.Color.FromArgb(211, 47, 47);
            lblErrUser.Location  = new System.Drawing.Point(40, 164);
            lblErrUser.Size      = new System.Drawing.Size(380, 16);
            lblErrUser.Visible   = false;

            // ── Password ──────────────────────────────────────────────
            lblPassword.Text      = "MẬT KHẨU";
            lblPassword.Font      = new System.Drawing.Font("Segoe UI", 7.5f, System.Drawing.FontStyle.Bold);
            lblPassword.ForeColor = System.Drawing.Color.FromArgb(136, 136, 136);
            lblPassword.Location  = new System.Drawing.Point(40, 186);
            lblPassword.Size      = new System.Drawing.Size(200, 16);

            pnlPwdWrap.Location  = new System.Drawing.Point(40, 204);
            pnlPwdWrap.Size      = new System.Drawing.Size(380, 40);
            pnlPwdWrap.BackColor = System.Drawing.Color.FromArgb(250, 250, 250);
            pnlPwdWrap.Paint    += InputWrap_Paint;

            txtPassword.UseSystemPasswordChar = true;
            txtPassword.Location  = new System.Drawing.Point(10, 8);
            txtPassword.Size      = new System.Drawing.Size(340, 24);
            txtPassword.BorderStyle = System.Windows.Forms.BorderStyle.None;
            txtPassword.Font      = new System.Drawing.Font("Segoe UI", 10f);
            txtPassword.BackColor = System.Drawing.Color.FromArgb(250, 250, 250);
            txtPassword.Enter    += Input_Enter;
            txtPassword.Leave    += Input_Leave;

            btnEye.Text      = "👁";
            btnEye.Location  = new System.Drawing.Point(348, 6);
            btnEye.Size      = new System.Drawing.Size(28, 28);
            btnEye.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            btnEye.FlatAppearance.BorderSize  = 0;
            btnEye.BackColor = System.Drawing.Color.FromArgb(250, 250, 250);
            btnEye.Cursor    = System.Windows.Forms.Cursors.Hand;
            btnEye.Click    += btnEye_Click;

            pnlPwdWrap.Controls.Add(txtPassword);
            pnlPwdWrap.Controls.Add(btnEye);

            lblErrPwd.Text      = "⚠  Vui lòng nhập mật khẩu.";
            lblErrPwd.Font      = new System.Drawing.Font("Segoe UI", 8.5f);
            lblErrPwd.ForeColor = System.Drawing.Color.FromArgb(211, 47, 47);
            lblErrPwd.Location  = new System.Drawing.Point(40, 246);
            lblErrPwd.Size      = new System.Drawing.Size(380, 16);
            lblErrPwd.Visible   = false;

            // ── Options row ───────────────────────────────────────────
            chkRemember.Text      = "Ghi nhớ đăng nhập";
            chkRemember.Font      = new System.Drawing.Font("Segoe UI", 9f);
            chkRemember.ForeColor = System.Drawing.Color.FromArgb(136, 136, 136);
            chkRemember.Location  = new System.Drawing.Point(40, 268);
            chkRemember.Size      = new System.Drawing.Size(160, 22);

            lnkForgot.Text            = "Quên mật khẩu?";
            lnkForgot.Font            = new System.Drawing.Font("Segoe UI", 9f, System.Drawing.FontStyle.Bold);
            lnkForgot.LinkColor       = System.Drawing.Color.FromArgb(211, 47, 47);
            lnkForgot.ActiveLinkColor = System.Drawing.Color.FromArgb(154, 0, 7);
            lnkForgot.Location        = new System.Drawing.Point(264, 268);
            lnkForgot.Size            = new System.Drawing.Size(156, 22);
            lnkForgot.LinkClicked    += lnkForgot_LinkClicked;

            // ── Error + Login button ──────────────────────────────────
            lblError.Text      = "";
            lblError.ForeColor = System.Drawing.Color.FromArgb(211, 47, 47);
            lblError.Font      = new System.Drawing.Font("Segoe UI", 8.5f);
            lblError.Location  = new System.Drawing.Point(40, 294);
            lblError.Size      = new System.Drawing.Size(380, 16);
            lblError.Visible   = false;

            btnLogin.Text      = "Đăng nhập  →";
            btnLogin.Location  = new System.Drawing.Point(40, 312);
            btnLogin.Size      = new System.Drawing.Size(380, 48);
            btnLogin.Font      = new System.Drawing.Font("Segoe UI", 11f, System.Drawing.FontStyle.Bold);
            btnLogin.ForeColor = System.Drawing.Color.White;
            btnLogin.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            btnLogin.FlatAppearance.BorderSize = 0;
            btnLogin.Cursor    = System.Windows.Forms.Cursors.Hand;
            btnLogin.Click    += btnLogin_Click;

            this.ResumeLayout(false);
        }

        #endregion

        // ── Fields ──────────────────────────────────────────────
        private System.Windows.Forms.Panel  pnlCard;
        private System.Windows.Forms.Button btnTheme, btnLang;

        private System.Windows.Forms.Label  lblTitle, lblSubtitle;

        private System.Windows.Forms.Label   lblUsername;
        private System.Windows.Forms.Panel   pnlUserWrap;
        private System.Windows.Forms.TextBox txtUsername;
        private System.Windows.Forms.Label   lblErrUser;

        private System.Windows.Forms.Label   lblPassword;
        private System.Windows.Forms.Panel   pnlPwdWrap;
        private System.Windows.Forms.TextBox txtPassword;
        private System.Windows.Forms.Button  btnEye;
        private System.Windows.Forms.Label   lblErrPwd;

        private System.Windows.Forms.CheckBox  chkRemember;
        private System.Windows.Forms.LinkLabel lnkForgot;
        private System.Windows.Forms.Button    btnLogin;
        private System.Windows.Forms.Label     lblError;
    }
}
