"use client"

import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface AttendanceSummaryProps {
  workDays: number
  totalDays: number
  otHours: number
  lateMinutes: number
  onTimeRate: number
}

export function AttendanceSummary({
  workDays, totalDays, otHours, lateMinutes, onTimeRate,
}: AttendanceSummaryProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"

  const stats = [
    { label: vi ? "Ngày công" : "Work Days",       value: `${workDays}/${totalDays}`, accent: "#10B981" },
    { label: vi ? "Làm thêm giờ" : "Overtime",      value: `${otHours}h`,             accent: "#3B82F6" },
    { label: vi ? "Phút đi muộn" : "Late Minutes",  value: `${lateMinutes}p`,         accent: "#F59E0B" },
    { label: vi ? "Tỷ lệ đúng giờ" : "On-time Rate", value: `${onTimeRate}%`,         accent: "#10B981" },
  ]

  return (
    <div style={{ display: "flex", gap: 14 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          flex: 1, background: th.cardBg, borderRadius: 12, padding: "18px 20px",
          borderTop: `1px solid ${th.cardBorder}`, borderRight: `1px solid ${th.cardBorder}`, borderBottom: `1px solid ${th.cardBorder}`, borderLeft: `4px solid ${s.accent}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -18, right: -18, width: 72, height: 72, borderRadius: "50%",
            background: `${s.accent}22`, border: `2px solid ${s.accent}40`,
          }} />
          <div style={{ fontSize: 12, color: th.text2, marginBottom: 8, position: "relative" }}>{s.label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: s.accent, position: "relative" }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
