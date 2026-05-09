/**
 * today-attendance-sync.service.ts — Sync chấm công hôm nay (real-time)
 *
 * Mỗi 1 tiếng, service này tạo/cập nhật dữ liệu chấm công ngày hôm nay
 * cho 57 NV ảo (trừ 6 TK demo). Mỗi NV có lịch trình cá nhân bằng seeded random.
 *
 * Logic:
 * - Mỗi NV được gán sẵn: giờ checkIn, giờ checkOut, trạng thái (đi làm/vắng/nghỉ)
 * - Đi trễ và OT hoàn toàn độc lập (trễ = bị trừ phút, OT = được thưởng thêm)
 * - NV đi trễ vẫn ra 17:00, OT random cho 12% NV bất kể đúng giờ hay trễ
 * - checkOut = null nếu chưa tới giờ ra (đang làm)
 * - Cuối ngày (≥ 21h): ghi notes "Không check-out" nếu thiếu
 *
 * ⚠️ CHỈ DÙNG CHO DEMO — Không sử dụng trong production
 */

import { prisma } from "@/lib/prisma"

// 6 username demo — không tạo data ảo
const DEMO_USERNAMES = ["admin", "giamdoc", "nhansu", "ketoan", "quanly", "nhanvien"]

/** Seeded random (giống fake-data-sync) — nhất quán giữa các lần gọi */
function seeded(empId: number, day: number, month: number, year: number, salt: number): number {
  const h = ((empId * 31 + day * 13 + month * 17 + year * 7 + salt * 11) * 2654435761) >>> 0
  return h / 0xFFFFFFFF
}

function seededInt(empId: number, day: number, month: number, year: number, salt: number, min: number, max: number): number {
  return min + Math.floor(seeded(empId, day, month, year, salt) * (max - min + 1))
}

/** Lịch trình cá nhân 1 NV cho ngày hôm nay */
interface DaySchedule {
  status: "Đi làm" | "Đi muộn" | "Vắng" | "Nghỉ phép"
  checkInHour: number
  checkInMin: number
  checkOutHour: number
  checkOutMin: number
  lateMinutes: number
  otHours: number
  hasCheckout: boolean // false = NV "quên" checkout
}

/**
 * Tính lịch trình cá nhân cho 1 NV dựa trên seeded random.
 * Kết quả nhất quán — gọi bao nhiêu lần cũng giống nhau cho cùng (empId, ngày).
 */
function getSchedule(empId: number, date: Date): DaySchedule {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  // 1. Trạng thái ngày: 85% đi làm, 5% vắng, 5% nghỉ phép, 5% đi muộn nặng
  const statusRand = seeded(empId, day, month, year, 1000)
  if (statusRand < 0.05) {
    return { status: "Vắng", checkInHour: 0, checkInMin: 0, checkOutHour: 0, checkOutMin: 0, lateMinutes: 0, otHours: 0, hasCheckout: false }
  }
  if (statusRand < 0.10) {
    return { status: "Nghỉ phép", checkInHour: 0, checkInMin: 0, checkOutHour: 0, checkOutMin: 0, lateMinutes: 0, otHours: 0, hasCheckout: false }
  }

  // 2. Giờ check-in (độc lập)
  const ciRand = seeded(empId, day, month, year, 2000)
  let checkInHour: number, checkInMin: number, lateMinutes: number
  
  if (ciRand < 0.70) {
    // 70% đúng giờ: 7:15 – 7:45
    checkInMin = seededInt(empId, day, month, year, 2100, 15, 45)
    checkInHour = 7
    lateMinutes = 0
  } else if (ciRand < 0.90) {
    // 20% muộn nhẹ: 7:50 – 8:30
    const totalMin = seededInt(empId, day, month, year, 2200, 50, 90)
    checkInHour = 7 + Math.floor(totalMin / 60)
    checkInMin = totalMin % 60
    // Muộn = phút sau 7:30
    lateMinutes = totalMin - 30
  } else {
    // 10% trễ nặng: 8:30 – 10:00
    const totalMin = seededInt(empId, day, month, year, 2300, 90, 150)
    checkInHour = 7 + Math.floor(totalMin / 60)
    checkInMin = totalMin % 60
    lateMinutes = totalMin - 30
  }

  const status = lateMinutes > 0 ? "Đi muộn" as const : "Đi làm" as const

  // 3. OT (hoàn toàn độc lập với đi trễ): 12% NV có OT
  const otRand = seeded(empId, day, month, year, 3000)
  const hasOT = otRand < 0.12
  const otHours = hasOT ? seededInt(empId, day, month, year, 3100, 1, 3) : 0

  // 4. Giờ check-out
  // - NV bình thường (không OT): 17:00 – 17:15
  // - NV có OT: 17:00 + otHours (17:xx – 20:xx)
  // - 3% NV: không checkout (quên)
  const coRand = seeded(empId, day, month, year, 4000)
  const hasCheckout = coRand >= 0.03 // 97% có checkout, 3% quên

  let checkOutHour: number, checkOutMin: number
  if (hasOT) {
    // OT: ra lúc 17:00 + otHours, thêm random 0-30 phút
    checkOutHour = 17 + otHours
    checkOutMin = seededInt(empId, day, month, year, 4100, 0, 30)
  } else {
    // Bình thường: 17:00 – 17:15
    checkOutHour = 17
    checkOutMin = seededInt(empId, day, month, year, 4200, 0, 15)
  }

  return {
    status, checkInHour, checkInMin, checkOutHour, checkOutMin,
    lateMinutes, otHours, hasCheckout,
  }
}

/**
 * Sync chấm công hôm nay cho tất cả NV ảo.
 * Gọi mỗi 1 tiếng từ API endpoint.
 */
export async function ensureTodayAttendance(): Promise<{ synced: boolean; updated: number; message: string }> {
  const now = new Date()
  const dow = now.getDay()

  // Không chạy T7/CN
  if (dow === 0 || dow === 6) {
    return { synced: false, updated: 0, message: "Cuối tuần — bỏ qua" }
  }

  // Chưa tới 7:15 → chưa ai vào
  const currentMinOfDay = now.getHours() * 60 + now.getMinutes()
  if (currentMinOfDay < 7 * 60 + 15) {
    return { synced: false, updated: 0, message: "Chưa tới giờ làm" }
  }

  try {
    // 1. Lấy employeeId của 6 TK demo
    const demoUsers = await prisma.user.findMany({
      where: { username: { in: DEMO_USERNAMES } },
      select: { employeeId: true },
    })
    const demoEmployeeIds = new Set(
      demoUsers.filter(u => u.employeeId != null).map(u => u.employeeId!)
    )

    // 2. Lấy tất cả NV ảo
    const employees = await prisma.employee.findMany({
      where: {
        status: { in: ["Đang làm", "Thử việc"] },
        id: { notIn: [...demoEmployeeIds] },
      },
      select: { id: true, hireDate: true },
    })

    if (employees.length === 0) {
      return { synced: true, updated: 0, message: "Không có NV ảo" }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let updated = 0

    for (const emp of employees) {
      // NV chưa vào làm → skip
      if (emp.hireDate > today) continue

      const schedule = getSchedule(emp.id, today)

      // Vắng / Nghỉ phép → tạo record trạng thái
      if (schedule.status === "Vắng" || schedule.status === "Nghỉ phép") {
        try {
          await prisma.attendance.upsert({
            where: { employeeId_workDate: { employeeId: emp.id, workDate: today } },
            create: { employeeId: emp.id, workDate: today, status: schedule.status, lateMinutes: 0, otHours: 0 },
            update: {},
          })
          updated++
        } catch { /* skip */ }
        continue
      }

      // Tính giờ check-in/check-out dưới dạng phút trong ngày
      const ciMinOfDay = schedule.checkInHour * 60 + schedule.checkInMin
      const coMinOfDay = schedule.checkOutHour * 60 + schedule.checkOutMin

      // Chưa tới giờ vào của NV này → skip
      if (currentMinOfDay < ciMinOfDay) continue

      // Đã tới giờ vào → tạo/cập nhật checkIn
      const checkIn = new Date(1970, 0, 1, schedule.checkInHour, schedule.checkInMin, 0)

      // Xác định checkOut
      let checkOut: Date | null = null
      let otHours = 0
      let earlyMinutes = 0
      let notes: string | null = null

      if (currentMinOfDay >= coMinOfDay && schedule.hasCheckout) {
        // Đã qua giờ ra VÀ NV có checkout → ghi checkOut
        checkOut = new Date(1970, 0, 1, schedule.checkOutHour, schedule.checkOutMin, 0)
        otHours = schedule.otHours

        // Về sớm nếu checkout trước 17:00 (chỉ khi không OT)
        if (schedule.checkOutHour < 17) {
          earlyMinutes = (17 * 60) - coMinOfDay
        }
      } else if (currentMinOfDay >= coMinOfDay && !schedule.hasCheckout) {
        // Đã qua giờ ra NHƯNG NV quên checkout
        // Chỉ ghi notes khi đã >= 21:00 (cuối ngày)
        if (currentMinOfDay >= 21 * 60) {
          notes = "Không check-out"
        }
        // checkOut vẫn = null
      }
      // Nếu chưa tới giờ ra → checkOut = null (đang làm)

      try {
        // Kiểm tra xem NV đã tự check-in thật chưa (qua app)
        const existing = await prisma.attendance.findUnique({
          where: { employeeId_workDate: { employeeId: emp.id, workDate: today } },
        })

        // Nếu NV đã tự check-in (checkIn khác giờ seed) → không ghi đè
        if (existing && existing.checkIn) {
          const existingCI = new Date(existing.checkIn)
          const seedCI = checkIn
          const diffMin = Math.abs(
            (existingCI.getHours() * 60 + existingCI.getMinutes()) -
            (seedCI.getHours() * 60 + seedCI.getMinutes())
          )
          // Nếu giờ check-in khác nhau > 5 phút → NV đã check-in thật, skip
          if (diffMin > 5) continue
        }

        await prisma.attendance.upsert({
          where: { employeeId_workDate: { employeeId: emp.id, workDate: today } },
          create: {
            employeeId: emp.id,
            workDate: today,
            status: schedule.status,
            checkIn,
            checkOut,
            lateMinutes: schedule.lateMinutes,
            otHours,
            earlyMinutes,
            notes,
          },
          update: {
            // Chỉ cập nhật checkOut và notes (không ghi đè checkIn)
            ...(checkOut ? { checkOut, otHours, earlyMinutes } : {}),
            ...(notes ? { notes } : {}),
          },
        })
        updated++
      } catch { /* skip */ }
    }

    console.log(`[today-attendance-sync] ✅ Updated ${updated} records (${now.toLocaleTimeString("vi-VN")})`)
    return { synced: true, updated, message: `Đã cập nhật ${updated} bản ghi` }

  } catch (error) {
    console.error("[today-attendance-sync] ❌ Error:", error)
    return { synced: false, updated: 0, message: "Lỗi sync" }
  }
}
