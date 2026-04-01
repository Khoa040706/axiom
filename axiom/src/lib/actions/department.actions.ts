"use server"

import { prisma } from "@/lib/prisma"
import { serialize } from "@/lib/helpers/serialize"

export async function getDepartments() {
  try {
    const data = await prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getDepartments]", error)
    return { success: false, error: "Không thể tải danh sách phòng ban" }
  }
}

export async function getPositions() {
  try {
    const data = await prisma.position.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getPositions]", error)
    return { success: false, error: "Không thể tải danh sách chức vụ" }
  }
}
