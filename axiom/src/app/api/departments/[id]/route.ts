import { NextResponse } from "next/server"
import { departmentService } from "@/lib/services/department.service"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const dept = await departmentService.update(Number(id), { name: body.name, description: body.description })
    return NextResponse.json(dept)
  } catch (error) {
    console.error("[PATCH /api/departments/:id]", error)
    return NextResponse.json({ error: "Không thể cập nhật phòng ban" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await departmentService.delete(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/departments/:id]", error)
    return NextResponse.json({ error: "Không thể xóa phòng ban" }, { status: 500 })
  }
}
