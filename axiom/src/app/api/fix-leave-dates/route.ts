/**
 * API Route: /api/fix-leave-dates
 *
 * Auto-detect & fix: Kiểm tra nếu có đơn nghỉ phép với ngày tháng 3/2026
 * (data seed cũ lỗi) thì xóa và tạo lại với ngày hợp lý (tháng 4-5).
 * Nếu data đã OK thì skip — an toàn để gọi nhiều lần.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    // 1. Kiểm tra xem có đơn nghỉ phép tháng 3/2026 không (data lỗi)
    const badLeaves = await prisma.leaveRequest.findMany({
      where: {
        startDate: {
          gte: new Date("2026-03-01"),
          lt: new Date("2026-04-01"),
        },
      },
    })

    if (badLeaves.length === 0) {
      // Data đã OK, không cần fix
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Data đã hợp lệ, không cần fix",
      })
    }

    // 2. Có data lỗi → xóa toàn bộ và tạo lại
    const deleted = await prisma.leaveRequest.deleteMany()

    // 3. Lấy danh sách nhân viên
    const employees = await prisma.employee.findMany({
      select: { id: true, code: true },
      orderBy: { code: "asc" },
    })
    const byCode = (code: string) => employees.find(e => e.code === code)

    // 4. Tạo lại đơn nghỉ phép với ngày hợp lý
    const pastLeaves = [
      { code: "NV009", type: "Nghỉ phép năm", from: "2026-04-07", to: "2026-04-08", days: 2, reason: "Đưa gia đình đi du lịch cuối tuần", status: "Đã duyệt", createdAt: "2026-04-02" },
      { code: "NV013", type: "Nghỉ bệnh",     from: "2026-04-14", to: "2026-04-15", days: 2, reason: "Bị sốt virus, cần nghỉ ngơi",       status: "Đã duyệt", createdAt: "2026-04-13" },
      { code: "NV023", type: "Nghỉ phép năm", from: "2026-04-21", to: "2026-04-22", days: 2, reason: "Về quê thăm ông bà",                status: "Đã duyệt", createdAt: "2026-04-17" },
      { code: "NV033", type: "Việc riêng",     from: "2026-04-28", to: "2026-04-29", days: 2, reason: "Dự đám cưới bạn thân",               status: "Từ chối",  createdAt: "2026-04-24" },
    ]
    const recentApproved = [
      { code: "NV018", type: "Nghỉ phép năm", from: "2026-05-05", to: "2026-05-06", days: 2, reason: "Đi khám sức khỏe tổng quát",      status: "Đã duyệt", createdAt: "2026-05-01" },
      { code: "NV043", type: "Nghỉ bệnh",     from: "2026-05-07", to: "2026-05-08", days: 2, reason: "Bị viêm họng, cần nghỉ ngơi",     status: "Đã duyệt", createdAt: "2026-05-06" },
    ]
    const pendingLeaves = [
      { code: "NV010", type: "Nghỉ phép năm", from: "2026-05-12", to: "2026-05-13", days: 2, reason: "Xin nghỉ phép đi khám sức khỏe định kỳ",   status: "Chờ duyệt", createdAt: "2026-05-08" },
      { code: "NV011", type: "Nghỉ bệnh",     from: "2026-05-14", to: "2026-05-15", days: 2, reason: "Bị cảm sốt, cần nghỉ ngơi",                status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV012", type: "Việc riêng",     from: "2026-05-19", to: "2026-05-20", days: 2, reason: "Dự đám cưới người thân ở quê",              status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV019", type: "Nghỉ phép năm", from: "2026-05-13", to: "2026-05-14", days: 2, reason: "Đưa con đi thi học kỳ",                    status: "Chờ duyệt", createdAt: "2026-05-08" },
      { code: "NV020", type: "Nghỉ bệnh",     from: "2026-05-15", to: "2026-05-16", days: 2, reason: "Đau răng, cần đi nha khoa",                 status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV029", type: "Nghỉ phép năm", from: "2026-05-14", to: "2026-05-16", days: 3, reason: "Du lịch gia đình cuối tuần dài",            status: "Chờ duyệt", createdAt: "2026-05-08" },
      { code: "NV030", type: "Nghỉ bệnh",     from: "2026-05-19", to: "2026-05-19", days: 1, reason: "Đi tái khám bệnh viện",                     status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV039", type: "Nghỉ phép năm", from: "2026-05-15", to: "2026-05-16", days: 2, reason: "Về quê thăm gia đình",                      status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV040", type: "Việc riêng",     from: "2026-05-20", to: "2026-05-20", days: 1, reason: "Dọn nhà mới",                                status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV049", type: "Việc riêng",     from: "2026-05-16", to: "2026-05-16", days: 1, reason: "Nộp hồ sơ xin visa du lịch",                status: "Chờ duyệt", createdAt: "2026-05-09" },
      { code: "NV050", type: "Nghỉ phép năm", from: "2026-05-19", to: "2026-05-21", days: 3, reason: "Tham gia hội thảo cá nhân",                  status: "Chờ duyệt", createdAt: "2026-05-08" },
    ]

    const allLeaves = [...pastLeaves, ...recentApproved, ...pendingLeaves]
    let count = 0

    for (const lr of allLeaves) {
      const emp = byCode(lr.code)
      if (!emp) continue

      await prisma.leaveRequest.create({
        data: {
          employeeId: emp.id,
          leaveType: lr.type,
          startDate: new Date(lr.from),
          endDate: new Date(lr.to),
          totalDays: lr.days,
          reason: lr.reason,
          status: lr.status,
          createdAt: new Date(lr.createdAt + "T08:30:00+07:00"),
        },
      })
      count++
    }

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      created: count,
      message: `Đã xóa ${deleted.count} đơn cũ (tháng 3), tạo ${count} đơn mới (tháng 4-5)`,
    })
  } catch (error) {
    console.error("[fix-leave-dates]", error)
    return NextResponse.json({ success: false, error: "Fix failed" }, { status: 500 })
  }
}
