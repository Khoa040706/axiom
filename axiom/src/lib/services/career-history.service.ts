/**
 * career-history.service.ts — Business logic cho module Quá trình công tác
 * Theo dõi vòng đời nhân viên: bổ nhiệm, luân chuyển, lương, khen thưởng, kỷ luật
 * 
 * Khi tạo sự kiện Bổ nhiệm/Thăng chức/Giáng chức → tự động cập nhật position của Employee
 * Khi tạo sự kiện Điều chuyển → tự động cập nhật department của Employee
 */

import { prisma } from "@/lib/prisma"

const INCLUDE_EMPLOYEE = {
  employee: {
    select: {
      id: true, code: true, fullName: true,
      department: { select: { id: true, name: true } },
      position:   { select: { id: true, name: true } },
    },
  },
} as const

// Loại sự kiện cần tự động cập nhật Employee
const POSITION_EVENTS = ["Bổ nhiệm", "Miễn nhiệm", "Thăng chức", "Giáng chức"]
const TRANSFER_EVENTS = ["Điều chuyển"]

export const careerHistoryService = {
  /** Lấy toàn bộ lịch sử, sắp xếp theo ngày giảm dần */
  async findAll(params?: { eventType?: string; search?: string }) {
    const where: Record<string, unknown> = {}

    if (params?.eventType) {
      where.eventType = params.eventType
    }

    if (params?.search) {
      where.employee = {
        OR: [
          { fullName: { contains: params.search, mode: "insensitive" } },
          { code: { contains: params.search, mode: "insensitive" } },
        ],
      }
    }

    return prisma.careerHistory.findMany({
      where,
      orderBy: { eventDate: "desc" },
      include: INCLUDE_EMPLOYEE,
    })
  },

  /** Lấy lịch sử của 1 nhân viên cụ thể */
  async findByEmployee(employeeId: number) {
    return prisma.careerHistory.findMany({
      where: { employeeId },
      orderBy: { eventDate: "desc" },
      include: INCLUDE_EMPLOYEE,
    })
  },

  /** Tạo sự kiện mới + tự động cập nhật Employee nếu là Bổ nhiệm/Điều chuyển */
  async create(data: {
    employeeId: number
    eventType: string
    eventDate: Date
    description?: string
    oldDepartment?: string
    newDepartment?: string
    oldPosition?: string
    newPosition?: string
    oldSalary?: number
    newSalary?: number
    rewardType?: string
    rewardAmount?: number
    penaltyType?: string
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi career history
      const record = await tx.careerHistory.create({
        data: {
          employeeId:     data.employeeId,
          eventType:      data.eventType,
          eventDate:      data.eventDate,
          description:    data.description,
          oldDepartment:  data.oldDepartment,
          newDepartment:  data.newDepartment,
          oldPosition:    data.oldPosition,
          newPosition:    data.newPosition,
          oldSalary:      data.oldSalary,
          newSalary:      data.newSalary,
          rewardType:     data.rewardType,
          rewardAmount:   data.rewardAmount,
          penaltyType:    data.penaltyType,
        },
        include: INCLUDE_EMPLOYEE,
      })

      // 2. Tự động cập nhật Employee nếu cần
      // Bổ nhiệm / Thăng chức / Giáng chức / Miễn nhiệm → cập nhật position
      if (POSITION_EVENTS.includes(data.eventType) && data.newPosition) {
        // Tìm position ID từ tên
        const position = await tx.position.findFirst({
          where: { name: data.newPosition, isActive: true },
        })
        if (position) {
          await tx.employee.update({
            where: { id: data.employeeId },
            data: { positionId: position.id },
          })
        }
      }

      // Điều chuyển → cập nhật department
      if (TRANSFER_EVENTS.includes(data.eventType) && data.newDepartment) {
        const department = await tx.department.findFirst({
          where: { name: data.newDepartment, isActive: true },
        })
        if (department) {
          await tx.employee.update({
            where: { id: data.employeeId },
            data: { departmentId: department.id },
          })
        }
      }

      return record
    })
  },

  /** Xoá sự kiện */
  async delete(id: number) {
    return prisma.careerHistory.delete({ where: { id } })
  },

  /** Thống kê sự kiện theo loại cho 1 nhân viên */
  async getStatsByEmployee(employeeId: number) {
    const records = await prisma.careerHistory.findMany({
      where: { employeeId },
      select: { eventType: true },
    })

    const stats: Record<string, number> = {}
    for (const r of records) {
      stats[r.eventType] = (stats[r.eventType] || 0) + 1
    }
    return stats
  },

  /** Thống kê tổng quan cho toàn bộ công ty */
  async getOverviewStats() {
    const [total, promotions, rewards, penalties] = await Promise.all([
      prisma.careerHistory.count(),
      prisma.careerHistory.count({ where: { eventType: { in: ["Thăng chức", "Bổ nhiệm"] } } }),
      prisma.careerHistory.count({ where: { eventType: "Khen thưởng" } }),
      prisma.careerHistory.count({ where: { eventType: "Kỷ luật" } }),
    ])
    return { total, promotions, rewards, penalties }
  },

  /** Lấy danh sách employees cho dropdown */
  async getEmployeesForSelect() {
    return prisma.employee.findMany({
      where: { status: "Đang làm" },
      select: { id: true, code: true, fullName: true, avatarPath: true },
      orderBy: { fullName: "asc" },
    })
  },

  /** Lấy danh sách departments cho dropdown */
  async getDepartmentsForSelect() {
    return prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  },

  /** Lấy danh sách positions cho dropdown */
  async getPositionsForSelect() {
    return prisma.position.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  },
}
