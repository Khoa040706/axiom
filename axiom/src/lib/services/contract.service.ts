import { prisma } from "@/lib/prisma"

export const contractService = {
  /** Lấy tất cả hợp đồng (cho trang quản lý hợp đồng) */
  async findAll(params?: {
    search?: string
    status?: string
    skip?: number
    take?: number
  }) {
    const { search, status, skip = 0, take = 500 } = params ?? {}
    return prisma.contract.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { employee: { fullName: { contains: search, mode: "insensitive" } } },
                { employee: { code:     { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        employee: {
          select: {
            id: true, code: true, fullName: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startDate: "desc" },
      skip,
      take,
    })
  },

  async findByEmployee(employeeId: number) {
    return prisma.contract.findMany({
      where: { employeeId },
      orderBy: { startDate: "desc" },
    })
  },

  async findActive(employeeId: number) {
    return prisma.contract.findFirst({
      where: { employeeId, status: "Hiệu lực" },
      orderBy: { startDate: "desc" },
    })
  },

  /** Hợp đồng sắp hết hạn trong withinDays ngày */
  async findExpiringSoon(withinDays = 30) {
    const now = new Date()
    const limit = new Date()
    limit.setDate(limit.getDate() + withinDays)

    return prisma.contract.findMany({
      where: {
        status: "Hiệu lực",
        endDate: { gte: now, lte: limit },
      },
      include: {
        employee: { select: { id: true, code: true, fullName: true, department: { select: { name: true } } } },
      },
      orderBy: { endDate: "asc" },
    })
  },

  async create(data: {
    employeeId: number
    contractType: string
    startDate: Date
    endDate?: Date
    baseSalary: number
    salaryGrade?: number
    allowance?: number
    notes?: string
  }) {
    return prisma.contract.create({ data })
  },

  async update(id: number, data: Partial<{
    employeeId: number
    contractType: string
    startDate: Date
    endDate?: Date | null
    baseSalary: number
    salaryGrade?: number
    allowance?: number
    status?: string
    notes?: string
  }>) {
    return prisma.contract.update({ where: { id }, data })
  },

  async terminate(id: number) {
    return prisma.contract.update({
      where: { id },
      data: { status: "Chấm dứt", endDate: new Date() },
    })
  },
}
