"use server"

import { prisma } from "@/lib/prisma"
import { serialize } from "@/lib/helpers/serialize"

/** Lấy tất cả chuyến công tác, kèm thông tin nhân viên */
export async function getBusinessTrips(filters?: {
  status?: string
  employeeId?: number
}) {
  try {
    const trips = await prisma.businessTrip.findMany({
      where: {
        ...(filters?.status     ? { status:     filters.status     } : {}),
        ...(filters?.employeeId ? { employeeId: filters.employeeId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { id: true, code: true, fullName: true } },
        approver: { select: { id: true, username: true } },
      },
    })
    return { success: true, data: serialize(trips) }
  } catch (error) {
    console.error("[getBusinessTrips]", error)
    return { success: false, error: "Không thể tải danh sách công tác" }
  }
}

/** Tạo đề xuất công tác mới */
export async function createBusinessTrip(data: {
  employeeId: number
  destination: string
  startDate: string
  endDate: string
  purpose?: string
  allowance?: number
}) {
  try {
    const trip = await prisma.businessTrip.create({
      data: {
        employeeId:  data.employeeId,
        destination: data.destination,
        startDate:   new Date(data.startDate),
        endDate:     new Date(data.endDate),
        purpose:     data.purpose,
        allowance:   data.allowance ?? 0,
        status:      "Chờ duyệt",
      },
    })
    return { success: true, data: serialize(trip) }
  } catch (error) {
    console.error("[createBusinessTrip]", error)
    return { success: false, error: "Không thể tạo đề xuất công tác" }
  }
}

/** Duyệt / Từ chối chuyến công tác */
export async function approveBusinessTrip(
  id: number,
  approverId: number,
  approved: boolean
) {
  try {
    const trip = await prisma.businessTrip.update({
      where: { id },
      data: {
        status:     approved ? "Đã duyệt" : "Từ chối",
        approvedBy: approverId,
      },
    })
    return { success: true, data: serialize(trip) }
  } catch (error) {
    console.error("[approveBusinessTrip]", error)
    return { success: false, error: "Không thể cập nhật trạng thái" }
  }
}
