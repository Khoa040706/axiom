"use client"

import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface PayslipData {
  employeeName: string
  employeeCode: string
  department: string
  position: string
  period: string
  baseSalary: number
  allowance: number
  otPay: number
  grossSalary: number
  bhxh: number
  bhyt: number
  bhtn: number
  taxAmount: number
  netSalary: number
}

function fmt(v: number) {
  return Math.abs(v).toLocaleString("vi-VN") + " đ"
}

interface PayslipTemplateProps {
  data: PayslipData
  onPrint?: () => void
}

export function PayslipTemplate({ data, onPrint }: PayslipTemplateProps) {
  const { dark } = useDashboard()
  const th = getTheme(dark)

  const rows = [
    { label: "1. Lương cơ bản",           value: data.baseSalary,  type: "income" },
    { label: "2. Phụ cấp",                 value: data.allowance,   type: "income" },
    { label: "3. Lương làm thêm giờ",      value: data.otPay,       type: "income" },
    { label: "4. Tổng thu nhập (Gross)",    value: data.grossSalary, type: "subtotal" },
    { label: "5. BHXH nhân viên (8%)",     value: -data.bhxh,       type: "deduct" },
    { label: "6. BHYT nhân viên (1.5%)",   value: -data.bhyt,       type: "deduct" },
    { label: "7. BHTN nhân viên (1%)",     value: -data.bhtn,       type: "deduct" },
    { label: "8. Thuế thu nhập cá nhân",   value: -data.taxAmount,  type: "deduct" },
  ]

  return (
    <div style={{
      background: th.cardBg, borderRadius: 14, padding: "28px",
      border: `1px solid ${th.cardBorder}`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      maxWidth: 600, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid #D0211C" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#D0211C", letterSpacing: 2 }}>⬡ AXIOM</div>
          <div style={{ fontSize: 11, color: th.text3, marginTop: 2 }}>HRM & Payroll Management System</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: th.text1 }}>PHIẾU LƯƠNG</div>
          <div style={{ fontSize: 13, color: th.text2, marginTop: 4 }}>{data.period}</div>
        </div>
      </div>

      {/* Employee info */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        background: th.tableHead, borderRadius: 10, padding: "16px", marginBottom: 20,
      }}>
        {[
          { label: "Họ tên", value: data.employeeName },
          { label: "Mã NV", value: data.employeeCode },
          { label: "Phòng ban", value: data.department },
          { label: "Chức vụ", value: data.position },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: 11, color: th.text3, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: th.text1 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Salary rows */}
      {rows.map(row => (
        <div key={row.label} style={{
          display: "flex", justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: `1px solid ${th.tableBorder}`,
          borderTop: row.type === "subtotal" ? `2px solid ${th.tableBorder}` : undefined,
        }}>
          <span style={{
            fontSize: 13,
            color: row.type === "subtotal" ? th.text1 : th.text2,
            fontWeight: row.type === "subtotal" ? 700 : 400,
          }}>{row.label}</span>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: row.type === "deduct" ? "#EF4444"
              : row.type === "subtotal" ? "#111827"
              : "#10B981",
          }}>
            {row.value < 0 ? "-" : ""}{fmt(row.value)}
          </span>
        </div>
      ))}

      {/* Net */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "18px 20px", marginTop: 14,
        background: "linear-gradient(135deg,#D0211C,#F97316)",
        borderRadius: 12,
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>LƯƠNG THỰC LĨNH (NET)</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{fmt(data.netSalary)}</span>
      </div>

      {/* Print button */}
      {onPrint && (
        <button
          onClick={onPrint}
          style={{
            marginTop: 20, width: "100%", padding: "10px",
            background: "transparent",
            border: `1.5px solid ${th.inputBorder}`,
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            color: th.text1, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          🖨️ In / Xuất PDF
        </button>
      )}
    </div>
  )
}
