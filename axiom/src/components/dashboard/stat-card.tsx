"use client"

import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  bg: string
  icon: React.ReactNode
}

export function StatCard({ label, value, sub, bg, icon }: StatCardProps) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, padding: "18px 20px",
      background: bg, color: "#fff",
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: 14, top: "50%",
        transform: "translateY(-50%)", opacity: 0.18,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.88 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, opacity: 0.78 }}>{sub}</div>}
    </div>
  )
}

interface MiniStatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
}

export function MiniStatCard({ icon, label, value, accent }: MiniStatCardProps) {
  const { dark } = useDashboard()
  const th = getTheme(dark)

  return (
    <div style={{
      flex: 1, background: th.cardBg, borderRadius: 12, padding: "16px 20px",
      border: `1px solid ${th.cardBorder}`,
      borderLeft: `4px solid ${accent}`,
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `${accent}22`,
        border: `2px solid ${accent}40`,
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: dark ? "rgba(255,255,255,0.06)" : "#fff",
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: th.text2, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: th.text1 }}>{value}</div>
      </div>
    </div>
  )
}
