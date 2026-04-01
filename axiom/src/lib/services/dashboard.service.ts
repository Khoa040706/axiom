import { prisma } from "@/lib/prisma"

export const dashboardService = {
  /** KPI: Tổng nhân viên, theo loại */
  async getEmployeeStats() {
    const [total, active, trial] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "Đang làm" } }),
      prisma.employee.count({ where: { status: "Thử việc" } }),
    ])
    return { total, active, trial }
  },

  /** Phân bố nhân sự theo phòng ban */
  async getHeadcountByDepartment() {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { employees: true } },
      },
    })
    return departments.map((d) => ({
      name: d.name,
      value: d._count.employees,
    }))
  },

  /** Quỹ lương N tháng gần nhất */
  async getPayrollTrend(months = 6) {
    const records = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const month = d.getMonth() + 1
      const year = d.getFullYear()

      const agg = await prisma.payroll.aggregate({
        where: { payMonth: month, payYear: year },
        _sum: { netSalary: true },
        _count: true,
      })

      records.push({
        month: `T${month}`,
        salary: Number(agg._sum.netSalary ?? 0) / 1_000_000, // convert sang triệu
      })
    }
    return records
  },

  /** Đơn nghỉ phép chờ duyệt */
  async getPendingLeaveCount() {
    return prisma.leaveRequest.count({ where: { status: "Chờ duyệt" } })
  },

  /** Hợp đồng sắp hết hạn (30 ngày) */
  async getExpiringContracts(withinDays = 30) {
    const now = new Date()
    const limit = new Date()
    limit.setDate(limit.getDate() + withinDays)

    return prisma.contract.count({
      where: {
        status: "Hiệu lực",
        endDate: { gte: now, lte: limit },
      },
    })
  },

  /** Xu hướng chấm công N tháng gần nhất — thống kê đi làm / đi muộn / vắng */
  async getAttendanceTrend(months = 6) {
    const records = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const month = d.getMonth() + 1
      const year  = d.getFullYear()
      const start = new Date(year, month - 1, 1)
      const end   = new Date(year, month, 1)

      const [diLam, diMuon, vangMat] = await Promise.all([
        prisma.attendance.count({ where: { workDate: { gte: start, lt: end }, status: "Đi làm", lateMinutes: { lte: 0 } } }),
        prisma.attendance.count({ where: { workDate: { gte: start, lt: end }, lateMinutes: { gt: 0 } } }),
        prisma.attendance.count({ where: { workDate: { gte: start, lt: end }, status: { not: "Đi làm" } } }),
      ])

      records.push({
        month: `T${month}`,
        dayDu:   diLam,
        diMuon:  diMuon,
        vangMat: vangMat,
      })
    }
    return records
  },


  /** Hoạt động gần đây (audit trail đơn giản) */
  async getRecentActivity(limit = 10) {
    const [leaves, contracts] = await Promise.all([
      prisma.leaveRequest.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { employee: { select: { fullName: true } } },
      }),
      prisma.contract.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { employee: { select: { fullName: true } } },
      }),
    ])

    const activities = [
      ...leaves.map((l) => ({
        type: "leave" as const,
        message: `${l.employee.fullName} đăng ký nghỉ phép (${l.leaveType})`,
        status: l.status,
        time: l.createdAt,
      })),
      ...contracts.map((c) => ({
        type: "contract" as const,
        message: `Hợp đồng ${c.contractType} — ${c.employee.fullName}`,
        status: c.status,
        time: c.createdAt,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit)

    return activities
  },
}
