"use client"

import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface LeaveBalanceItem {
  name: string
  total: number
  used: number
  left: number
}

interface LeaveBalanceProps {
  items: LeaveBalanceItem[]
}

export function LeaveBalance({ items }: LeaveBalanceProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"

  return (
    <div style={{
      background: th.cardBg, borderRadius: 12,
      border: `1px solid ${th.cardBorder}`,
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontWeight: 700, color: th.text1, fontSize: 14, marginBottom: 16 }}>
        {vi ? "Quỹ phép còn lại" : "Remaining Leave Quota"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {items.map(q => {
          const pct = Math.min(100, (q.used / q.total) * 100)
          return (
            <div key={q.name} style={{
              background: th.tableHead, borderRadius: 10, padding: "14px",
            }}>
              <div style={{ fontWeight: 600, color: th.text1, fontSize: 13, marginBottom: 8 }}>{q.name}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: th.text2, marginBottom: 8 }}>
                <span>{vi ? "Tổng" : "Total"} <b style={{ color: th.text1 }}>{q.total}</b></span>
                <span>{vi ? "Đã dùng" : "Used"} <b style={{ color: "#F59E0B" }}>{q.used}</b></span>
                <span>{vi ? "Còn" : "Left"} <b style={{ color: "#10B981" }}>{q.left}</b></span>
              </div>
              {/* Progress bar */}
              <div style={{ background: th.tableBorder, borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`,
                  background: pct >= 80 ? "#EF4444" : pct >= 50 ? "#F59E0B" : "#10B981",
                  height: "100%", borderRadius: 4,
                  transition: "width .3s",
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
