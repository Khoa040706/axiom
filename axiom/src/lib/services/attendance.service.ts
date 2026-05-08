import { prisma } from "@/lib/prisma"

export const attendanceService = {
  /** Lấy bảng chấm công theo tháng/năm */
  async findByMonth(month: number, year: number, departmentId?: number) {
    return prisma.attendance.findMany({
      where: {
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
        ...(departmentId
          ? { employee: { departmentId } }
          : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            code: true,
            fullName: true,
            department: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
      },
      orderBy: [{ workDate: "asc" }, { employee: { fullName: "asc" } }],
    })
  },

  /** Lấy chấm công hôm nay */
  async findToday(employeeId?: number) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return prisma.attendance.findMany({
      where: {
        workDate: { gte: today, lt: tomorrow },
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        employee: { select: { id: true, code: true, fullName: true, department: { select: { name: true } } } },
      },
    })
  },

  /** Check-in */
  async checkIn(employeeId: number, checkIn: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Giờ chuẩn: 7:30 (giờ hành chính), trễ nếu sau 8:05
    const standardStart = new Date(today)
    standardStart.setHours(7, 30, 0, 0)
    const lateThreshold = new Date(today)
    lateThreshold.setHours(8, 5, 0, 0)
    const lateMinutes = Math.max(
      0,
      Math.floor((checkIn.getTime() - standardStart.getTime()) / 60000)
    )
    const isLate = checkIn.getTime() > lateThreshold.getTime()

    return prisma.attendance.upsert({
      where: { employeeId_workDate: { employeeId, workDate: today } },
      create: {
        employeeId,
        workDate: today,
        checkIn,
        status: isLate ? "Đi muộn" : "Đi làm",
        lateMinutes,
      },
      // ⚠️ Quan trọng: xóa checkOut cũ (từ seed/sync) + reset OT/early
      update: {
        checkIn,
        checkOut: null,
        lateMinutes,
        status: isLate ? "Đi muộn" : "Đi làm",
        otHours: 0,
        earlyMinutes: 0,
      },
    })
  },

  /** Check-out */
  async checkOut(attendanceId: number, checkOut: Date) {
    const record = await prisma.attendance.findUnique({ where: { id: attendanceId } })
    if (!record || !record.checkIn) throw new Error("Chưa có dữ liệu check-in")

    // Giờ chuẩn: 17:00 (8 tiếng) — dùng ngày của checkOut để tránh timezone issue với @db.Date
    const standardEnd = new Date(checkOut)
    standardEnd.setHours(17, 0, 0, 0)

    // Tính OT (checkout sau 17:00)
    const otHours = Math.max(
      0,
      (checkOut.getTime() - standardEnd.getTime()) / (1000 * 3600)
    )

    // Tính về sớm (checkout trước 17:00)
    const earlyMinutes = Math.max(
      0,
      Math.floor((standardEnd.getTime() - checkOut.getTime()) / 60000)
    )

    return prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOut,
        otHours: Math.round(otHours * 2) / 2, // làm tròn 0.5h
        earlyMinutes,
      },
    })
  },

  /** Tạo/cập nhật bản ghi chấm công thủ công */
  async upsert(data: {
    employeeId: number
    workDate: Date
    checkIn?: Date
    checkOut?: Date
    status?: string
    otHours?: number
    lateMinutes?: number
    notes?: string
  }) {
    const { employeeId, workDate, ...updateFields } = data
    return prisma.attendance.upsert({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
      create: data,
      update: updateFields,
    })
  },
}
