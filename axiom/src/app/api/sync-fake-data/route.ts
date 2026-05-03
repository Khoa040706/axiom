/**
 * API Route: /api/sync-fake-data
 *
 * Mục đích: Được gọi tự động khi dashboard load (fire-and-forget)
 * để đảm bảo data ảo của 57 NV được cập nhật đến ngày hôm qua.
 *
 * ⚠️ CHỈ DÙNG CHO DEMO — Không sử dụng trong production
 */

import { NextResponse } from "next/server"
import { ensureFakeDataUpToDate } from "@/lib/services/fake-data-sync.service"

export const runtime = "nodejs"

// Tránh nhiều request chạy đồng thời
let isRunning = false

export async function GET() {
  if (isRunning) {
    return NextResponse.json({ synced: false, message: "Already running" })
  }

  try {
    isRunning = true
    const result = await ensureFakeDataUpToDate()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[sync-fake-data]", error)
    return NextResponse.json({ synced: false, error: "Sync failed" }, { status: 500 })
  } finally {
    isRunning = false
  }
}
