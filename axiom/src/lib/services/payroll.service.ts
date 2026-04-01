import { prisma } from "@/lib/prisma"
import { calculateSalary } from "@/lib/helpers/payroll-calculator"

export const payrollService = {
  /** Lấy bảng lương theo tháng/năm */
  async findByPeriod(month: number, year: number) {
    return prisma.payroll.findMany({
      where: { payMonth: month, payYear: year },
      include: {
        employee: {
          select: {
            id: true,
            code: true,
            fullName: true,
            numDependents: true,
            department: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { fullName: "asc" } },
    })
  },

  /** Lấy 1 bản lương */
  async findById(id: number) {
    return prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: true,
        payslips: true,
      },
    })
  },

  /**
   * Tính lương tự động cho 1 nhân viên trong kỳ
   * Lấy hợp đồng hiệu lực + dữ liệu chấm công → tính Gross → Net
   */
  async calculate(employeeId: number, month: number, year: number) {
    // 1. Lấy hợp đồng hiệu lực
    const contract = await prisma.contract.findFirst({
      where: {
        employeeId,
        status: "Hiệu lực",
        startDate: { lte: new Date(year, month - 1, 1) },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date(year, month - 1, 1) } },
        ],
      },
      orderBy: { startDate: "desc" },
    })
    if (!contract) throw new Error(`Nhân viên #${employeeId} không có hợp đồng hiệu lực`)

    // 2. Tổng hợp chấm công trong tháng
    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId,
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
        status: "Đi làm",
      },
    })
    const workDays = attendance.length
    const otHours = attendance.reduce((s, r) => s + Number(r.otHours), 0)

    // 3. Lấy thông tin nhân viên (số người phụ thuộc)
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    const numDependents = employee?.numDependents ?? 0

    // 4. Tính lương
    // hourlyRate = (lương cơ bản × hệ số) / 26 ngày / 8 giờ
    const hourlyRate = (Number(contract.baseSalary) * Number(contract.salaryGrade)) / 26 / 8
    const otPay = Math.round(hourlyRate * 1.5 * otHours)
    const result = calculateSalary({
      baseSalary: Number(contract.baseSalary),
      salaryGrade: Number(contract.salaryGrade),
      allowance: Number(contract.allowance),
      otPay,
      numDependents,
    })

    // 5. Upsert bản lương
    return prisma.payroll.upsert({
      where: { employeeId_payMonth_payYear: { employeeId, payMonth: month, payYear: year } },
      create: {
        employeeId,
        payMonth: month,
        payYear: year,
        workDays,
        otHours,
        baseSalary: Number(contract.baseSalary) * Number(contract.salaryGrade),
        allowance: Number(contract.allowance),
        otPay,
        grossSalary: result.grossSalary,
        bhxh: result.bhxh,
        bhyt: result.bhyt,
        bhtn: result.bhtn,
        taxIncome: result.taxableIncome,
        taxAmount: result.taxAmount,
        deductions: result.totalInsurance + result.taxAmount,
        netSalary: result.netSalary,
        status: "Đã tính",
      },
      update: {
        workDays,
        otHours,
        baseSalary: Number(contract.baseSalary) * Number(contract.salaryGrade),
        allowance: Number(contract.allowance),
        otPay,
        grossSalary: result.grossSalary,
        bhxh: result.bhxh,
        bhyt: result.bhyt,
        bhtn: result.bhtn,
        taxIncome: result.taxableIncome,
        taxAmount: result.taxAmount,
        deductions: result.totalInsurance + result.taxAmount,
        netSalary: result.netSalary,
        status: "Đã tính",
      },
    })
  },

  /** Tổng quỹ lương theo tháng */
  async getSummary(month: number, year: number) {
    const records = await prisma.payroll.findMany({
      where: { payMonth: month, payYear: year },
    })
    return {
      totalGross: records.reduce((s, r) => s + Number(r.grossSalary), 0),
      totalNet: records.reduce((s, r) => s + Number(r.netSalary), 0),
      totalTax: records.reduce((s, r) => s + Number(r.taxAmount), 0),
      totalInsurance: records.reduce((s, r) => s + Number(r.bhxh) + Number(r.bhyt) + Number(r.bhtn), 0),
      employeeCount: records.length,
      month,
      year,
    }
  },
}
