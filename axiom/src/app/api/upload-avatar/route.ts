// API route: upload avatar — lưu base64 vào DB (tương thích Vercel/serverless)
// Không dùng fs.writeFile vì Vercel filesystem read-only

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    // Auth check: chỉ user đã đăng nhập mới được upload avatar
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { employeeId, imageData } = body as {
      employeeId: number
      imageData: string // base64 data URI
    }

    if (!employeeId || !imageData) {
      return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 })
    }

    // Validate base64 data URI format
    const match = imageData.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/)
    if (!match) {
      return NextResponse.json({ success: false, error: "Invalid image format" }, { status: 400 })
    }

    // Limit: 5MB (check base64 size — base64 ~33% larger than raw)
    const base64Data = match[2]
    const estimatedBytes = (base64Data.length * 3) / 4
    if (estimatedBytes > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Image too large (max 5MB)" }, { status: 400 })
    }

    // Lưu base64 data URI trực tiếp vào avatarPath trong DB
    // Ưu điểm: hoạt động trên mọi nền tảng (Vercel, Docker, etc.)
    // AvatarImg component đã hỗ trợ hiển thị base64 data URI
    const { prisma } = await import("@/lib/prisma")
    await prisma.employee.update({
      where: { id: employeeId },
      data: { avatarPath: imageData },
    })

    return NextResponse.json({ success: true, avatarPath: imageData })
  } catch (err) {
    console.error("[upload-avatar]", err)
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    )
  }
}

// ── DELETE: Xóa avatar → về mặc định ──
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { employeeId } = body as { employeeId: number }

    if (!employeeId) {
      return NextResponse.json({ success: false, error: "Missing employeeId" }, { status: 400 })
    }

    // Xóa avatarPath trong DB → component AvatarImg sẽ tự hiển thị avatar mặc định
    const { prisma } = await import("@/lib/prisma")
    await prisma.employee.update({
      where: { id: employeeId },
      data: { avatarPath: null },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[delete-avatar]", err)
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    )
  }
}
