import { prisma } from "@/lib/prisma"

export const departmentService = {
  async findAll() {
    return prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: "asc" },
    })
  },

  async findById(id: number) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        employees: {
          select: { id: true, code: true, fullName: true, status: true },
          orderBy: { fullName: "asc" },
        },
      },
    })
  },

  async create(data: { name: string; description?: string }) {
    return prisma.department.create({ data })
  },

  async update(id: number, data: { name?: string; description?: string; isActive?: boolean }) {
    return prisma.department.update({ where: { id }, data })
  },

  async delete(id: number) {
    return prisma.department.update({
      where: { id },
      data: { isActive: false },
    })
  },
}
