"use client"

import { useDashboard, getTheme } from "@/lib/dashboard-context"

type DayStatus = "present" | "absent" | "late" | "holiday" | "leave" | "weekend" | "future"

interface CalendarDay {
  date: number
  status: DayStatus
  checkIn?: string
  checkOut?: string
}

interface CalendarViewProps {
  month: number
  year: number
  days: CalendarDay[]
}

const STATUS_STYLE: Record<DayStatus, { bg: string; color: string; label: string }> = {
  present:  { bg: "#D1FAE5", color: "#065F46", label: "Đi làm" },
  late:     { bg: "#FEF3C7", color: "#92400E", label: "Đi muộn" },
  absent:   { bg: "#FEE2E2", color: "#991B1B", label: "Vắng" },
  holiday:  { bg: "#EDE9FE", color: "#5B21B6", label: "Lễ" },
  leave:    { bg: "#DBEAFE", color: "#1E40AF", label: "Nghỉ phép" },
  weekend:  { bg: "transparent", color: "#9CA3AF", label: "" },
  future:   { bg: "transparent", color: "#D1D5DB", label: "" },
}

const WEEKDAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export function CalendarView({ month, year, days }: CalendarViewProps) {
  const { dark } = useDashboard()
  const th = getTheme(dark)

  const firstDay = new Date(year, month - 1, 1).getDay()
  // Adjust: Mon=0, Sun=6
  const offset = firstDay === 0 ? 6 : firstDay - 1

  return (
    <div style={{ background: th.cardBg, borderRadius: 12, padding: "20px", border: `1px solid ${th.cardBorder}` }}>
      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {WEEKDAYS_VI.map(d => (
          <div key={d} style={{
            textAlign: "center", fontSize: 11, fontWeight: 700,
            color: d === "CN" ? "#EF4444" : th.text2, padding: "4px 0",
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e${i}`} />
        ))}

        {days.map(day => {
          const style = STATUS_STYLE[day.status]
          return (
            <div key={day.date} style={{
              textAlign: "center", borderRadius: 8, padding: "6px 2px",
              background: style.bg, cursor: day.status !== "future" && day.status !== "weekend" ? "pointer" : "default",
              position: "relative",
            }}
              title={day.checkIn ? `Vào: ${day.checkIn}${day.checkOut ? ` | Ra: ${day.checkOut}` : ""}` : style.label}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: style.color }}>{day.date}</div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {Object.entries(STATUS_STYLE).filter(([k]) => !["weekend", "future"].includes(k)).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: v.bg, border: "1px solid rgba(0,0,0,0.08)" }} />
            <span style={{ color: th.text2 }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
