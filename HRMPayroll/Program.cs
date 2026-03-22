using System;
using System.Windows.Forms;
using HRMPayroll.UI.Auth;

namespace HRMPayroll
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new frmLogin());
        }
    }
}
