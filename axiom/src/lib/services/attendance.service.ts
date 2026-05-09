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

    // T7/CN: cho phép check-in nhưng không tính đi muộn (không phải giờ hành chính)
    const dow = today.getDay()
    const isWeekend = dow === 0 || dow === 6

    // Giờ chuẩn: 7:30 (giờ hành chính), trễ nếu sau 8:05
    // Cuối tuần: không tính trễ (vì không phải giờ hành chính)
    const standardStart = new Date(today)
    standardStart.setHours(7, 30, 0, 0)
    const lateThreshold = new Date(today)
    lateThreshold.setHours(8, 5, 0, 0)
    const lateMinutes = isWeekend ? 0 : Math.max(
      0,
      Math.floor((checkIn.getTime() - standardStart.getTime()) / 60000)
    )
    const isLate = isWeekend ? false : checkIn.getTime() > lateThreshold.getTime()

    return prisma.attendance.upsert({
      where: { employeeId_workDate: { employeeId, workDate: today } },
      create: {
        employeeId,
        workDate: today,
        checkIn,
        status: isLate ? "Đi muộn" : "Đi làm",
        lateMinutes,
        notes: isWeekend ? "Làm thêm cuối tuần" : undefined,
      },
      // ⚠️ Quan trọng: xóa checkOut cũ (từ seed/sync) + reset OT/early
      update: {
        checkIn,
        checkOut: null,
        lateMinutes,
        status: isLate ? "Đi muộn" : "Đi làm",
        otHours: 0,
        earlyMinutes: 0,
        notes: isWeekend ? "Làm thêm cuối tuần" : undefined,
      },
    })
  },

  /** Check-out */
  async checkOut(attendanceId: number, checkOut: Date) {
    const record = await prisma.attendance.findUnique({ where: { id: attendanceId } })
    if (!record || !record.checkIn) throw new Error("Chưa có dữ liệu check-in")

    const dow = record.workDate.getDay()
    const isWeekend = dow === 0 || dow === 6

    // Cuối tuần: toàn bộ giờ làm = OT (không có giờ hành chính)
    // Ngày thường: OT = phần sau 17:00
    let otHours: number
    let earlyMinutes: number

    if (isWeekend) {
      // T7/CN: tổng giờ từ checkIn → checkOut = OT
      const checkInTime = new Date(record.checkIn)
      const totalMs = checkOut.getTime() - checkInTime.getTime()
      // Trừ 1h nghỉ trưa nếu làm > 5h
      const lunchMs = totalMs > 5 * 3600000 ? 3600000 : 0
      otHours = Math.max(0, (totalMs - lunchMs) / 3600000)
      earlyMinutes = 0 // Cuối tuần không có "về sớm"
    } else {
      // Giờ chuẩn: 17:00 (8 tiếng)
      const standardEnd = new Date(checkOut)
      standardEnd.setHours(17, 0, 0, 0)

      // Tính OT (checkout sau 17:00)
      otHours = Math.max(
        0,
        (checkOut.getTime() - standardEnd.getTime()) / (1000 * 3600)
      )

      // Tính về sớm (checkout trước 17:00)
      earlyMinutes = Math.max(
        0,
        Math.floor((standardEnd.getTime() - checkOut.getTime()) / 60000)
      )
    }

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
