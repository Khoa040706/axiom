// API route: fix emails @axiom.vn → @gmail.com
// Gọi: GET /api/fix-emails

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Tìm tất cả nhân viên có email @axiom.vn
    const employees = await prisma.employee.findMany({
      where: { email: { contains: "@axiom.vn" } },
      select: { id: true, code: true, email: true },
    })

    let count = 0
    for (const emp of employees) {
      if (!emp.email) continue
      const newEmail = emp.email.replace("@axiom.vn", "@gmail.com")
      await prisma.employee.update({
        where: { id: emp.id },
        data: { email: newEmail },
      })
      count++
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${count}/${employees.length} email từ @axiom.vn → @gmail.com`,
      count,
    })
  } catch (err) {
    console.error("[fix-emails]", err)
    return NextResponse.json(
      { success: false, error: "Lỗi cập nhật email" },
      { status: 500 }
    )
  }
}
