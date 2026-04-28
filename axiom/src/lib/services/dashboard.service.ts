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

  /** Gross + Net payroll trend */
  async getGrossNetTrend(months = 6) {
    const records = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const month = d.getMonth() + 1
      const year  = d.getFullYear()
      const agg = await prisma.payroll.aggregate({
        where: { payMonth: month, payYear: year },
        _sum: { netSalary: true, grossSalary: true },
        _count: { _all: true },
      })
      const empCount = agg._count._all || 1
      records.push({
        month: `T${month}`,
        net:   Math.round(Number(agg._sum.netSalary   ?? 0) / 1_000_000),
        gross: Math.round(Number(agg._sum.grossSalary ?? 0) / 1_000_000),
        avgNet: empCount > 0 ? Math.round(Number(agg._sum.netSalary ?? 0) / empCount / 1_000_000) : 0,
      })
    }
    return records
  },

  /** Tình trạng nhân viên (nhóm theo status) */
  async getEmployeeStatusBreakdown() {
    const rows = await prisma.employee.groupBy({ by: ["status"], _count: { status: true } })
    return rows.map(r => ({ name: r.status, value: r._count.status }))
  },

  /** Phân loại hợp đồng theo loại */
  async getContractTypeBreakdown() {
    const rows = await prisma.contract.groupBy({ by: ["contractType"], _count: { contractType: true } })
    return rows.map(r => ({ name: r.contractType, value: r._count.contractType }))
  },

  /** Phân loại đơn nghỉ phép theo loại */
  async getLeaveTypeBreakdown() {
    const rows = await prisma.leaveRequest.groupBy({ by: ["leaveType"], _count: { leaveType: true } })
    return rows.map(r => ({ type: r.leaveType, count: r._count.leaveType }))
  },

  /** Xu hướng tuyển dụng mới theo tháng */
  async getNewHireTrend(months = 6) {
    const records = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const count = await prisma.employee.count({ where: { hireDate: { gte: start, lt: end } } })
      records.push({ month: `T${d.getMonth() + 1}`, count })
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
        type:    "leave"    as const,
        name:    l.employee.fullName,   // tên riêng — không dịch
        subType: l.leaveType,           // raw VI value — sẽ dịch client-side
        status:  l.status,
        time:    l.createdAt,
      })),
      ...contracts.map((c) => ({
        type:    "contract" as const,
        name:    c.employee.fullName,
        subType: c.contractType,
        status:  c.status,
        time:    c.createdAt,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit)

    return activities
  },

  /** KPI tháng hiện tại dành cho kế toán: BHXH công ty, thuế TNCN */
  async getAccountantStats() {
    const now   = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()

    const agg = await prisma.payroll.aggregate({
      where: { payMonth: month, payYear: year },
      _sum: { grossSalary: true, netSalary: true, taxAmount: true, bhxh: true, bhyt: true, bhtn: true },
    })

    const gross   = Number(agg._sum.grossSalary ?? 0)
    const net     = Number(agg._sum.netSalary   ?? 0)
    const tax     = Number(agg._sum.taxAmount   ?? 0)
    // BHXH công ty đóng = 21.5% × gross (NLĐ 10.5% đã khấu trong gross)
    const bhxhCompany = gross * 0.215

    return { gross, net, tax, bhxhCompany, month, year }
  },
}
