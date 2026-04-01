"use client"

import { Eye, Send } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

export interface PayrollRow {
  id: string | number
  name: string
  period: string
  base: number
  allowance: number
  ot: number
  bonus: number
  gross: number
  deduct: number
  net: number
  status: "paid" | "pending" | "draft"
}

interface PayrollTableProps {
  rows: PayrollRow[]
  selectedId?: string | number
  onSelect?: (row: PayrollRow) => void
  onView?: (row: PayrollRow) => void
  onSend?: (row: PayrollRow) => void
}

function fmt(v: number) {
  return Math.abs(v).toLocaleString("vi-VN") + " đ"
}

export function PayrollTable({
  rows, selectedId, onSelect, onView, onSend,
}: PayrollTableProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"

  const hd: React.CSSProperties = {
    padding: "10px 12px", fontSize: 12, fontWeight: 600,
    color: th.tableHeadText, background: th.tableHead,
    borderBottom: `1px solid ${th.tableBorder}`,
    textAlign: "left", whiteSpace: "nowrap",
  }
  const td: React.CSSProperties = {
    padding: "11px 12px", fontSize: 13, color: th.text1,
    borderBottom: `1px solid ${th.tableBorder}`,
  }

  const cols = vi
    ? ["Nhân viên","Lương CB","Phụ cấp","Tăng ca","Thưởng","Gross","Khấu trừ","Net","Trạng thái","Thao tác"]
    : ["Employee","Base","Allowance","OT","Bonus","Gross","Deduction","Net","Status","Actions"]

  return (
    <div style={{
      background: th.cardBg, borderRadius: 12, overflow: "hidden",
      border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{cols.map(c => <th key={c} style={hd}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.id}
              onClick={() => onSelect?.(row)}
              style={{
                cursor: onSelect ? "pointer" : "default",
                background: selectedId === row.id
                  ? (dark ? "#1e3a5f" : "#FEF2F2")
                  : th.cardBg,
              }}
            >
              <td style={td}>
                <div style={{ fontWeight: 600 }}>{row.name}</div>
                <div style={{ fontSize: 11.5, color: th.text3 }}>{row.period}</div>
              </td>
              <td style={td}>{fmt(row.base)}</td>
              <td style={td}>{fmt(row.allowance)}</td>
              <td style={td}>
                <span style={{ color: row.ot > 0 ? "#3B82F6" : th.text3, fontWeight: row.ot > 0 ? 700 : 400 }}>
                  {row.ot > 0 ? `+${fmt(row.ot)}` : "0"}
                </span>
              </td>
              <td style={td}>
                <span style={{ color: row.bonus > 0 ? "#10B981" : th.text3, fontWeight: row.bonus > 0 ? 700 : 400 }}>
                  {row.bonus > 0 ? `+${fmt(row.bonus)}` : "0"}
                </span>
              </td>
              <td style={td}><b>{fmt(row.gross)}</b></td>
              <td style={td}><span style={{ color: "#EF4444" }}>{fmt(row.deduct)}</span></td>
              <td style={td}><b style={{ color: "#059669" }}>{fmt(row.net)}</b></td>
              <td style={td}>
                <span style={{
                  borderRadius: 12, padding: "3px 10px", fontSize: 11.5, fontWeight: 600,
                  background: row.status === "paid" ? "#D1FAE5" : row.status === "pending" ? "#FEF3C7" : "#F3F4F6",
                  color:       row.status === "paid" ? "#065F46" : row.status === "pending" ? "#92400E" : "#374151",
                }}>
                  {row.status === "paid" ? (vi ? "Đã tính" : "Paid") : row.status === "pending" ? (vi ? "Chờ" : "Pending") : (vi ? "Nháp" : "Draft")}
                </span>
              </td>
              <td style={td}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={e => { e.stopPropagation(); onView?.(row) }}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#EFF6FF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Eye size={13} color="#1D4ED8" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onSend?.(row) }}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#D1FAE5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Send size={13} color="#065F46" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
