"use client"

import { User, Mail, Phone, Building2, Briefcase, Calendar } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface EmployeeCardProps {
  employee: {
    id: string | number
    name: string
    email?: string
    phone?: string
    dept?: string
    pos?: string
    status?: string
    date?: string
    avatarText?: string
  }
  onClick?: () => void
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  const { dark } = useDashboard()
  const th = getTheme(dark)

  const avatarText = employee.avatarText ??
    employee.name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase()

  return (
    <div
      onClick={onClick}
      style={{
        background: th.cardBg, borderRadius: 14,
        border: `1px solid ${th.cardBorder}`,
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow .15s, transform .15s",
      }}
      onMouseEnter={e => {
        if (!onClick) return
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"
        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"
        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "linear-gradient(135deg, #D0211C, #F97316)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
        }}>
          {avatarText}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1 }}>{employee.name}</div>
          <div style={{ fontSize: 11.5, color: "#D0211C", fontWeight: 600 }}>#{employee.id}</div>
        </div>
        {employee.status && (
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 600,
            padding: "3px 10px", borderRadius: 20,
            background: employee.status === "Đang làm" ? "#D1FAE5" : "#FEF3C7",
            color: employee.status === "Đang làm" ? "#065F46" : "#92400E",
          }}>
            {employee.status}
          </span>
        )}
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {employee.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: th.text2 }}>
            <Mail size={13} color={th.text3} />
            {employee.email}
          </div>
        )}
        {employee.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: th.text2 }}>
            <Phone size={13} color={th.text3} />
            {employee.phone}
          </div>
        )}
        {employee.dept && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: th.text2 }}>
            <Building2 size={13} color={th.text3} />
            {employee.dept}
          </div>
        )}
        {employee.pos && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: th.text2 }}>
            <Briefcase size={13} color={th.text3} />
            {employee.pos}
          </div>
        )}
        {employee.date && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: th.text2 }}>
            <Calendar size={13} color={th.text3} />
            Ngày vào làm: {employee.date}
          </div>
        )}
      </div>
    </div>
  )
}
