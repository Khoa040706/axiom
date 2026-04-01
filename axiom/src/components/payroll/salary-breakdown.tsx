"use client"

import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface SalaryLine {
  label: string
  value: number
  type: "normal" | "bonus" | "deduct" | "total" | "net"
}

interface SalaryBreakdownProps {
  employeeName: string
  items: SalaryLine[]
  net: number
}

function fmt(v: number) {
  return Math.abs(v).toLocaleString("vi-VN") + " đ"
}

export function SalaryBreakdown({ employeeName, items, net }: SalaryBreakdownProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"

  return (
    <div style={{
      background: th.cardBg, borderRadius: 12,
      border: `1px solid ${th.cardBorder}`,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${th.tableBorder}`,
        fontWeight: 700, color: th.text1, fontSize: 14,
      }}>
        {vi ? `Chi tiết lương — ${employeeName}` : `Payslip Detail — ${employeeName}`}
      </div>

      <div style={{ padding: "12px 18px" }}>
        {items.map(row => (
          <div key={row.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 0",
            borderBottom: row.type === "total"
              ? `2px solid ${th.tableBorder}`
              : `1px solid ${th.tableBorder}`,
          }}>
            <span style={{
              fontSize: 13,
              color: row.type === "total" ? th.text1 : th.text2,
              fontWeight: row.type === "total" ? 700 : 400,
            }}>
              {row.label}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: row.type === "bonus" ? "#10B981"
                : row.type === "deduct" ? "#EF4444"
                : row.type === "total" ? "#111827"
                : th.text1,
            }}>
              {row.value < 0 ? `-${fmt(row.value)}` : fmt(row.value)}
            </span>
          </div>
        ))}

        {/* Net row */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "14px 0 4px",
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: th.text1 }}>
            {vi ? "Lương thực lĩnh (Net)" : "Take-home (Net)"}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
            {fmt(net)}
          </span>
        </div>
      </div>
    </div>
  )
}
