import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/export/payslip-pdf?payrollId=123
 * Trả về HTML phiếu lương để in/xuất PDF từ browser
 * (dùng window.print() hoặc Puppeteer bên ngoài)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const payrollId = parseInt(searchParams.get("payrollId") ?? "0")

    if (!payrollId) {
      return NextResponse.json({ error: "payrollId là bắt buộc" }, { status: 400 })
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    })

    if (!payroll) {
      return NextResponse.json({ error: "Không tìm thấy bản lương" }, { status: 404 })
    }

    const fmt = (v: number) => Math.abs(v).toLocaleString("vi-VN") + " đ"
    const e = payroll.employee

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phiếu lương — ${e.fullName} — T${payroll.payMonth}/${payroll.payYear}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 3px solid #C41210; margin-bottom: 20px; }
    .brand { color: #C41210; font-size: 24px; font-weight: 900; letter-spacing: 3px; }
    .brand-sub { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
    .title { text-align: right; }
    .title h1 { font-size: 18px; font-weight: 800; }
    .title p { color: #6B7280; font-size: 12px; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; background: #F9FAFB; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .info-item label { font-size: 10px; color: #9CA3AF; }
    .info-item span { display: block; font-weight: 600; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { padding: 9px 12px; text-align: left; border-bottom: 1px solid #F3F4F6; font-size: 13px; }
    th { background: #F3F4F6; font-weight: 700; }
    .income { color: #059669; font-weight: 700; }
    .deduct { color: #DC2626; font-weight: 700; }
    .subtotal td { font-weight: 700; border-top: 2px solid #E5E7EB; background: #F9FAFB; }
    .net-row { background: #C41210; color: white; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .net-label { font-size: 14px; font-weight: 800; }
    .net-value { font-size: 22px; font-weight: 900; }
    .footer { margin-top: 32px; display: flex; justify-content: space-around; text-align: center; }
    .sign-box { font-size: 12px; color: #6B7280; }
    .sign-box p { margin-top: 60px; font-weight: 700; color: #111; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">⬡ AXIOM</div>
      <div class="brand-sub">HRM & Payroll Management System</div>
    </div>
    <div class="title">
      <h1>PHIẾU LƯƠNG</h1>
      <p>Tháng ${payroll.payMonth}/${payroll.payYear}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Họ và tên</label><span>${e.fullName}</span></div>
    <div class="info-item"><label>Mã nhân viên</label><span>${e.code}</span></div>
    <div class="info-item"><label>Phòng ban</label><span>${e.department?.name ?? "—"}</span></div>
    <div class="info-item"><label>Chức vụ</label><span>${e.position?.name ?? "—"}</span></div>
    <div class="info-item"><label>Ngày công</label><span>${payroll.workDays} ngày</span></div>
    <div class="info-item"><label>Giờ tăng ca</label><span>${payroll.otHours} giờ</span></div>
  </div>

  <table>
    <thead><tr><th>Khoản mục</th><th style="text-align:right">Số tiền</th></tr></thead>
    <tbody>
      <tr><td>1. Lương cơ bản</td><td class="income" style="text-align:right">${fmt(Number(payroll.baseSalary))}</td></tr>
      <tr><td>2. Phụ cấp</td><td class="income" style="text-align:right">${fmt(Number(payroll.allowance))}</td></tr>
      <tr><td>3. Lương tăng ca</td><td class="income" style="text-align:right">${fmt(Number(payroll.otPay))}</td></tr>
      <tr class="subtotal"><td>4. Tổng thu nhập (Gross)</td><td style="text-align:right">${fmt(Number(payroll.grossSalary))}</td></tr>
      <tr><td>5. BHXH nhân viên (8%)</td><td class="deduct" style="text-align:right">-${fmt(Number(payroll.bhxh))}</td></tr>
      <tr><td>6. BHYT nhân viên (1.5%)</td><td class="deduct" style="text-align:right">-${fmt(Number(payroll.bhyt))}</td></tr>
      <tr><td>7. BHTN nhân viên (1%)</td><td class="deduct" style="text-align:right">-${fmt(Number(payroll.bhtn))}</td></tr>
      <tr><td>8. Thuế thu nhập cá nhân</td><td class="deduct" style="text-align:right">-${fmt(Number(payroll.taxAmount))}</td></tr>
    </tbody>
  </table>

  <div class="net-row">
    <span class="net-label">LƯƠNG THỰC LĨNH (NET)</span>
    <span class="net-value">${fmt(Number(payroll.netSalary))}</span>
  </div>

  <div class="footer">
    <div class="sign-box">Người nhận lương<p>${e.fullName}</p></div>
    <div class="sign-box">Kế toán trưởng<p>.............................</p></div>
    <div class="sign-box">Giám đốc<p>.............................</p></div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (err) {
    console.error("[payslip-pdf]", err)
    return NextResponse.json({ error: "Không thể tạo phiếu lương" }, { status: 500 })
  }
}
