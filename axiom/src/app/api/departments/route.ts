import { NextResponse } from "next/server"
import { departmentService } from "@/lib/services/department.service"

export async function GET() {
  try {
    const depts = await departmentService.findAll()
    const result = depts.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      headcount: d._count.employees,
    }))
    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/departments]", error)
    return NextResponse.json({ error: "Không thể tải phòng ban" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const dept = await departmentService.create({ name: body.name, description: body.description })
    return NextResponse.json(dept, { status: 201 })
  } catch (error) {
    console.error("[POST /api/departments]", error)
    return NextResponse.json({ error: "Không thể tạo phòng ban" }, { status: 500 })
  }
}
