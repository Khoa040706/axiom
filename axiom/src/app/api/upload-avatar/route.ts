// API route: upload avatar to disk

import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
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

    // Extract base64 data
    const match = imageData.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/)
    if (!match) {
      return NextResponse.json({ success: false, error: "Invalid image format" }, { status: 400 })
    }

    const ext = match[1] === "jpeg" ? "jpg" : match[1]
    const base64Data = match[2]
    const buffer = Buffer.from(base64Data, "base64")

    // Limit: 5MB
    if (buffer.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Image too large (max 5MB)" }, { status: 400 })
    }

    // Save to public/uploads/avatars/
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(uploadsDir, { recursive: true })

    const filename = `avatar_${employeeId}_${Date.now()}.${ext}`
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // URL path for the browser
    const avatarUrl = `/uploads/avatars/${filename}`

    // Update DB
    const { prisma } = await import("@/lib/prisma")
    await prisma.employee.update({
      where: { id: employeeId },
      data: { avatarPath: avatarUrl },
    })

    return NextResponse.json({ success: true, avatarPath: avatarUrl })
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

    // Xóa avatarPath trong DB → component AvatarImg sẽ tự hiển thị avatar mặc định (chữ cái)
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
