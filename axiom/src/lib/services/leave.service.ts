import { prisma } from "@/lib/prisma"

export const leaveService = {
  /** Lấy danh sách đơn nghỉ phép */
  async findMany(params?: { employeeId?: number; status?: string; year?: number }) {
    const { employeeId, status, year } = params ?? {}
    return prisma.leaveRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(status ? { status } : {}),
        ...(year
          ? {
              startDate: {
                gte: new Date(year, 0, 1),
                lt: new Date(year + 1, 0, 1),
              },
            }
          : {}),
      },
      include: {
        employee: { select: { id: true, code: true, fullName: true, department: { select: { name: true } } } },
        approver: { select: { id: true, username: true, employee: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })
  },

  /** Tạo đơn nghỉ phép */
  async create(data: {
    employeeId: number
    leaveType: string
    startDate: Date
    endDate: Date
    totalDays: number
    reason?: string
  }) {
    return prisma.leaveRequest.create({ data })
  },

  /** Duyệt / Từ chối đơn — sử dụng transaction để tránh race condition */
  async approve(requestId: number, approvedBy: number, status: "Đã duyệt" | "Từ chối") {
    return prisma.$transaction(async (tx) => {
      const leaveRequest = await tx.leaveRequest.findUnique({ where: { id: requestId } })
      if (!leaveRequest) throw new Error("Không tìm thấy đơn nghỉ phép")

      // Nếu duyệt → kiểm tra quỹ phép còn đủ không (theo từng loại nghỉ)
      if (status === "Đã duyệt") {
        const year = leaveRequest.startDate.getFullYear()
        const balance = await tx.leaveBalance.findFirst({
          where: { employeeId: leaveRequest.employeeId, year, leaveType: leaveRequest.leaveType },
        })
        const totalDays   = balance ? Number(balance.totalDays) : 12
        const usedDays    = balance ? Number(balance.usedDays)  : 0
        const requestDays = Number(leaveRequest.totalDays)

        if (usedDays + requestDays > totalDays) {
          throw new Error(
            `Quỹ phép không đủ. Còn lại: ${totalDays - usedDays} ngày, yêu cầu: ${requestDays} ngày`
          )
        }
      }

      // Cập nhật trạng thái đơn
      const request = await tx.leaveRequest.update({
        where: { id: requestId },
        data: { status, approvedBy, approvedDate: new Date() },
      })

      // Nếu duyệt → trừ quỹ phép theo loại nghỉ
      if (status === "Đã duyệt") {
        const year = request.startDate.getFullYear()
        const existingBalance = await tx.leaveBalance.findFirst({
          where: { employeeId: request.employeeId, year, leaveType: request.leaveType },
        })
        if (existingBalance) {
          await tx.leaveBalance.update({
            where: { id: existingBalance.id },
            data: { usedDays: { increment: Number(request.totalDays) } },
          })
        } else {
          await tx.leaveBalance.create({
            data: {
              employeeId: request.employeeId,
              year,
              leaveType: request.leaveType,
              totalDays: 12,
              usedDays: Number(request.totalDays),
            },
          })
        }
      }

      return request
    })
  },

  /** Lấy quỹ phép của nhân viên (theo loại nghỉ hoặc tất cả) */
  async getBalance(employeeId: number, year: number, leaveType?: string) {
    if (leaveType) {
      return prisma.leaveBalance.findFirst({
        where: { employeeId, year, leaveType },
      })
    }
    return prisma.leaveBalance.findMany({
      where: { employeeId, year },
    })
  },

  /** Lấy quỹ phép tất cả nhân viên */
  async getAllBalances(year: number) {
    return prisma.leaveBalance.findMany({
      where: { year },
      include: {
        employee: { select: { id: true, code: true, fullName: true, department: { select: { name: true } } } },
      },
      orderBy: { employee: { fullName: "asc" } },
    })
  },
}
