/**
 * API Route: /api/sync-today-attendance
 *
 * Mục đích: Được gọi mỗi 1 tiếng từ dashboard layout
 * để cập nhật chấm công hôm nay cho 57 NV ảo.
 *
 * ⚠️ CHỈ DÙNG CHO DEMO — Không sử dụng trong production
 */

import { NextResponse } from "next/server"
import { ensureTodayAttendance } from "@/lib/services/today-attendance-sync.service"

export const runtime = "nodejs"

// Tránh nhiều request chạy đồng thời
let isRunning = false

export async function GET() {
  if (isRunning) {
    return NextResponse.json({ synced: false, message: "Already running" })
  }

  try {
    isRunning = true
    const result = await ensureTodayAttendance()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[sync-today-attendance]", error)
    return NextResponse.json({ synced: false, error: "Sync failed" }, { status: 500 })
  } finally {
    isRunning = false
  }
}
