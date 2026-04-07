import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
  let pw = ""
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

function buildEmailHtml(name: string, code: string, dept: string, tempPw: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td>
      <table width="520" align="center" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#C41210,#8B0707);padding:32px;text-align:center;">
            <div style="color:#fff;font-size:26px;font-weight:900;letter-spacing:4px;">AXIOM</div>
            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px;">HRM &amp; Payroll Management</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:15px;color:#374151;">Xin chào, <strong>${name}</strong></p>
            <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.6;">
              Dưới đây là mật khẩu tạm thời của bạn:
            </p>
            <div style="background:#FEF2F2;border:2px dashed #FECACA;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <div style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Mật khẩu tạm thời</div>
              <div style="font-size:28px;font-weight:900;color:#C41210;letter-spacing:6px;font-family:monospace;">${tempPw}</div>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;"><span style="font-size:12px;color:#9CA3AF;">Mã nhân viên</span></td>
                <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;text-align:right;"><strong style="font-size:13px;color:#111827;">${code}</strong></td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><span style="font-size:12px;color:#9CA3AF;">Phòng ban</span></td>
                <td style="padding:8px 0;text-align:right;"><strong style="font-size:13px;color:#111827;">${dept}</strong></td>
              </tr>
            </table>
            <div style="background:#FFFBEB;border-left:3px solid #F59E0B;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
              <p style="margin:0;font-size:12.5px;color:#92400E;line-height:1.6;">
                ⚠️ Mật khẩu này <strong>có hiệu lực trong 24 giờ</strong>. Vui lòng đổi mật khẩu sau khi đăng nhập.
              </p>
            </div>
            <div style="text-align:center;">
              <a href="${appUrl}/login"
                style="display:inline-block;background:#C41210;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:700;font-size:14px;">
                Đăng nhập ngay
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #F3F4F6;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;">Email tự động từ hệ thống AXIOM HRM. Bỏ qua nếu bạn không yêu cầu.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string }
    if (!email) {
      return NextResponse.json({ error: "Gmail là bắt buộc" }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Tìm user theo personalEmail (Gmail cá nhân đã đăng ký)
    const user = await prisma.user.findFirst({
      where: { personalEmail: trimmedEmail },
      include: {
        employee: {
          include: { department: { select: { name: true } } },
        },
      },
    })

    if (!user) {
      // Trả về success để tránh lộ thông tin (security best practice)
      return NextResponse.json({ success: true })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Tài khoản đã bị khoá. Liên hệ Admin." }, { status: 403 })
    }

    // Generate và hash temp password
    const tempPw       = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPw, 10)

    // Cập nhật password trong DB
    await prisma.user.update({
      where: { id: user.id },
      data:  { passwordHash },
    })

    const emp      = user.employee
    const deptName = emp?.department?.name ?? "Không rõ"
    const html     = buildEmailHtml(
      emp?.fullName ?? user.username,
      emp?.code ?? "N/A",
      deptName,
      tempPw,
    )

    // Gửi email đến Gmail cá nhân đã đăng ký
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        })
        await transporter.sendMail({
          from:    `"AXIOM HRM" <${gmailUser}>`,
          to:      user.personalEmail!,   // luôn gửi về Gmail cá nhân
          subject: "🔑 Mật khẩu tạm thời — AXIOM HRM",
          html,
        })
        console.log(`[forgot-password] Email sent to ${user.personalEmail}`)
      } catch (mailErr) {
        console.error(`[forgot-password][smtp-error]`, mailErr)
        // Vẫn tiếp tục — không fail request vì mail lỗi
      }
    } else {
      console.log(`[forgot-password][demo] personalEmail=${user.personalEmail} tempPw=${tempPw}`)
    }

    // Production: chỉ trả success, KHÔNG trả tempPw
    // Dev/Demo: trả tempPw để hiển thị trên màn hình
    const isDev = process.env.NODE_ENV !== "production"
    return NextResponse.json({
      success: true,
      ...(isDev ? { tempPw } : {}),
      email: user.personalEmail,
    })

  } catch (err) {
    console.error("[forgot-password]", err)
    return NextResponse.json({ error: "Lỗi máy chủ. Vui lòng thử lại." }, { status: 500 })
  }
}
