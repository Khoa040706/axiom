import { prisma } from "@/lib/prisma"

export const payslipService = {
  /** Tạo phiếu lương sau khi tính lương xong */
  async create(payrollId: number, employeeId: number) {
    return prisma.payslip.create({
      data: {
        payrollId,
        employeeId,
        issuedDate: new Date(),
      },
    })
  },

  /** Tạo phiếu lương nếu chưa tồn tại, cập nhật ngày phát nếu đã có (chống duplicate) */
  async createOrUpdate(payrollId: number, employeeId: number) {
    const existing = await prisma.payslip.findFirst({
      where: { payrollId, employeeId },
    })
    if (existing) {
      return prisma.payslip.update({
        where: { id: existing.id },
        data: { issuedDate: new Date() },
      })
    }
    return prisma.payslip.create({
      data: {
        payrollId,
        employeeId,
        issuedDate: new Date(),
      },
    })
  },

  /** Lấy phiếu lương theo nhân viên */
  async findByEmployee(employeeId: number, limit = 12) {
    return prisma.payslip.findMany({
      where: { employeeId },
      include: {
        payroll: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },

  /** Lấy phiếu lương theo kỳ */
  async findByPeriod(month: number, year: number) {
    return prisma.payslip.findMany({
      where: {
        payroll: { payMonth: month, payYear: year },
      },
      include: {
        employee: { select: { id: true, code: true, fullName: true } },
        payroll: true,
      },
    })
  },

  /** Đánh dấu đã xem */
  async markViewed(id: number) {
    return prisma.payslip.update({
      where: { id },
      data: { isViewed: true },
    })
  },

  /** Cập nhật đường dẫn PDF */
  async updatePdfPath(id: number, pdfPath: string) {
    return prisma.payslip.update({
      where: { id },
      data: { pdfPath },
    })
  },
}
