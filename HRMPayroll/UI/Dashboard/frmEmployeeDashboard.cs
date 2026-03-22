using System.Drawing;
using System.Windows.Forms;
using HRMPayroll.Utils;

namespace HRMPayroll.UI.Dashboard
{
    public class frmEmployeeDashboard : Form
    {
        public frmEmployeeDashboard()
        {
            this.Text = "HRM & Payroll – Nhân viên Dashboard";
            this.Size = new Size(1024, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(253, 243, 244);

            var lbl = new Label
            {
                Text      = $"Xin chào, {AppSession.CurrentUser?.FullName ?? "Nhân viên"}!\nĐây là trang Nhân viên Dashboard.",
                Font      = new Font("Segoe UI", 16f, FontStyle.Bold),
                ForeColor = Color.FromArgb(211, 47, 47),
                AutoSize  = true,
                Location  = new Point(40, 40)
            };
            this.Controls.Add(lbl);
        }
    }
}
