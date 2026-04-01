import { prisma } from "@/lib/prisma"
import type { EmployeeWithRelations } from "@/types/employee.types"

export const employeeService = {
  /** Lấy danh sách nhân viên kèm phòng ban & chức vụ */
  async findMany(params?: {
    departmentId?: number
    status?: string
    search?: string
    skip?: number
    take?: number
  }) {
    const { departmentId, status, search, skip = 0, take = 20 } = params ?? {}

    return prisma.employee.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        contracts: {
          where: { status: "Hiệu lực" },
          orderBy: { startDate: "desc" },
          take: 1,
          select: { contractType: true, baseSalary: true, allowance: true },
        },
      },
      orderBy: { fullName: "asc" },
      skip,
      take,
    })
  },

  /** Lấy 1 nhân viên theo ID */
  async findById(id: number) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        contracts: { orderBy: { startDate: "desc" } },
        careerHistory: { orderBy: { eventDate: "desc" } },
      },
    })
  },

  /** Lấy 1 nhân viên theo mã */
  async findByCode(code: string) {
    return prisma.employee.findUnique({
      where: { code },
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
      },
    })
  },

  /** Tổng số nhân viên */
  async count(params?: { departmentId?: number; status?: string }) {
    return prisma.employee.count({
      where: {
        ...(params?.departmentId ? { departmentId: params.departmentId } : {}),
        ...(params?.status ? { status: params.status } : {}),
      },
    })
  },

  /** Tạo nhân viên mới */
  async create(data: {
    code: string
    fullName: string
    gender?: string
    dateOfBirth?: Date
    idNumber?: string
    phone?: string
    email?: string
    address?: string
    departmentId?: number
    positionId?: number
    hireDate: Date
    status?: string
    taxCode?: string
    numDependents?: number
  }) {
    return prisma.employee.create({ data })
  },

  /** Cập nhật nhân viên */
  async update(id: number, data: Partial<{
    code: string
    fullName: string
    gender?: string
    dateOfBirth?: Date
    idNumber?: string
    phone?: string
    email?: string
    address?: string
    departmentId?: number
    positionId?: number
    hireDate: Date
    status?: string
    taxCode?: string
    numDependents?: number
  }>) {
    return prisma.employee.update({ where: { id }, data })
  },

  /** Xóa nhân viên (soft delete bằng status) */
  async softDelete(id: number) {
    return prisma.employee.update({
      where: { id },
      data: { status: "Nghỉ việc" },
    })
  },
}
