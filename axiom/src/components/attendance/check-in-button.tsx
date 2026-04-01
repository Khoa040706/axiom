"use client"

import { useState } from "react"
import { Clock, LogIn, LogOut } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface CheckInButtonProps {
  employeeId: number | string
  status?: "not-started" | "checked-in" | "checked-out"
  checkInTime?: string
  checkOutTime?: string
  onCheckIn?: () => void
  onCheckOut?: () => void
}

export function CheckInButton({
  status = "not-started",
  checkInTime,
  checkOutTime,
  onCheckIn,
  onCheckOut,
}: CheckInButtonProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const [loading, setLoading] = useState(false)

  const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  async function handleCheckIn() {
    setLoading(true)
    try { await onCheckIn?.() } finally { setLoading(false) }
  }

  async function handleCheckOut() {
    setLoading(true)
    try { await onCheckOut?.() } finally { setLoading(false) }
  }

  return (
    <div style={{
      background: th.cardBg, borderRadius: 16, padding: "24px",
      border: `1px solid ${th.cardBorder}`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    }}>
      {/* Clock */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: th.text2 }}>
        <Clock size={16} />
        <span>{vi ? "Hiện tại:" : "Current time:"} <b style={{ color: th.text1 }}>{now}</b></span>
      </div>

      {/* Status indicator */}
      {checkInTime && (
        <div style={{ fontSize: 13, color: th.text2, textAlign: "center" }}>
          <span>{vi ? "Vào:" : "In:"} <b style={{ color: "#10B981" }}>{checkInTime}</b></span>
          {checkOutTime && (
            <span style={{ marginLeft: 16 }}>
              {vi ? "Ra:" : "Out:"} <b style={{ color: "#D0211C" }}>{checkOutTime}</b>
            </span>
          )}
        </div>
      )}

      {/* Button */}
      {status === "not-started" && (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            fontFamily: "inherit", opacity: loading ? 0.7 : 1,
          }}
        >
          <LogIn size={20} />
          {loading ? "..." : (vi ? "Chấm công vào" : "Check In")}
        </button>
      )}

      {status === "checked-in" && (
        <button
          onClick={handleCheckOut}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#D0211C,#F97316)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(208,33,28,0.35)",
            fontFamily: "inherit", opacity: loading ? 0.7 : 1,
          }}
        >
          <LogOut size={20} />
          {loading ? "..." : (vi ? "Chấm công ra" : "Check Out")}
        </button>
      )}

      {status === "checked-out" && (
        <div style={{
          padding: "14px 32px", borderRadius: 12,
          background: "#F3F4F6", color: "#6B7280",
          fontSize: 15, fontWeight: 600,
        }}>
          ✅ {vi ? "Đã hoàn tất ca làm hôm nay" : "Shift completed for today"}
        </div>
      )}
    </div>
  )
}
