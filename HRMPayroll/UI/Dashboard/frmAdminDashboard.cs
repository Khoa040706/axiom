using System.Drawing;
using System.Windows.Forms;
using HRMPayroll.Utils;

namespace HRMPayroll.UI.Dashboard
{
    public class frmAdminDashboard : Form
    {
        public frmAdminDashboard()
        {
            this.Text = "HRM & Payroll – Admin Dashboard";
            this.Size = new Size(1024, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(253, 243, 244);

            var lbl = new Label
            {
                Text      = $"Xin chào, {AppSession.CurrentUser?.FullName ?? "Admin"}!\nĐây là trang Admin Dashboard.",
                Font      = new Font("Segoe UI", 16f, FontStyle.Bold),
                ForeColor = Color.FromArgb(211, 47, 47),
                AutoSize  = true,
                Location  = new Point(40, 40)
            };
            this.Controls.Add(lbl);
        }
    }
}
