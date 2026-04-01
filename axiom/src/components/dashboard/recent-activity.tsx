"use client"

import { Clock, CheckCircle, XCircle, FileText, DollarSign } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface Activity {
  type: "leave" | "contract" | "payroll" | "employee"
  message: string
  status: string
  time: Date | string
}

const DEMO_ACTIVITIES: Activity[] = [
  { type: "leave",    message: "Nguyễn Văn An đăng ký nghỉ phép năm",      status: "Chờ duyệt", time: new Date(Date.now() - 1000*60*30) },
  { type: "contract", message: "Hợp đồng chính thức — Trần Thị Bình",       status: "Hiệu lực",  time: new Date(Date.now() - 1000*60*90) },
  { type: "leave",    message: "Hoàng Đức Minh nghỉ phép — Đã duyệt",       status: "Đã duyệt",  time: new Date(Date.now() - 1000*60*120) },
  { type: "payroll",  message: "Tính lương tháng 3/2026 hoàn tất",          status: "Đã tính",   time: new Date(Date.now() - 1000*60*240) },
  { type: "employee", message: "Nhân viên mới: Lê Minh Cường — Thử việc",   status: "Thử việc",  time: new Date(Date.now() - 1000*60*480) },
]

function getIcon(type: Activity["type"]) {
  switch (type) {
    case "leave":    return <Clock size={15} />
    case "contract": return <FileText size={15} />
    case "payroll":  return <DollarSign size={15} />
    case "employee": return <CheckCircle size={15} />
    default:         return <FileText size={15} />
  }
}

function getColor(status: string): string {
  if (status === "Đã duyệt" || status === "Hiệu lực" || status === "Đã tính") return "#10B981"
  if (status === "Chờ duyệt")   return "#F59E0B"
  if (status === "Từ chối")     return "#EF4444"
  return "#6B7280"
}

function timeAgo(time: Date | string): string {
  const d = typeof time === "string" ? new Date(time) : time
  const diff = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diff < 1)  return "Vừa xong"
  if (diff < 60) return `${diff} phút trước`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h} giờ trước`
  return `${Math.floor(h / 24)} ngày trước`
}

interface RecentActivityProps {
  activities?: Activity[]
}

export function RecentActivity({ activities = DEMO_ACTIVITIES }: RecentActivityProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)

  return (
    <div style={{
      background: th.cardBg, borderRadius: 14,
      padding: "20px",
      border: `1px solid ${th.cardBorder}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: th.text1, marginBottom: 16 }}>
        {lang === "vi" ? "Hoạt động gần đây" : "Recent Activity"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {activities.map((act, i) => {
          const color = getColor(act.status)
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: `${color}18`,
                border: `1.5px solid ${color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color,
              }}>
                {getIcon(act.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: th.text1, fontWeight: 500, lineHeight: 1.4 }}>
                  {act.message}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color, background: `${color}15`,
                    padding: "1px 8px", borderRadius: 10,
                  }}>{act.status}</span>
                  <span style={{ fontSize: 11, color: th.text3 }}>{timeAgo(act.time)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
