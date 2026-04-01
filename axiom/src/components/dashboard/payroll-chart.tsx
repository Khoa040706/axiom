"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

const DEFAULT_DATA = [
  { month: "T10", salary: 765.6 },
  { month: "T11", salary: 772.0 },
  { month: "T12", salary: 781.0 },
  { month: "T1",  salary: 775.0 },
  { month: "T2",  salary: 782.0 },
  { month: "T3",  salary: 785.6 },
]

interface PayrollChartProps {
  data?: { month: string; salary: number }[]
}

export function PayrollChart({ data = DEFAULT_DATA }: PayrollChartProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)

  return (
    <div style={{
      background: th.cardBg, borderRadius: 14,
      padding: "20px 20px 16px",
      border: `1px solid ${th.cardBorder}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: th.text1, marginBottom: 16 }}>
        {lang === "vi" ? "Biến động quỹ lương 6 tháng" : "6-Month Payroll Trend"}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={th.tableBorder} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: th.text2 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(0)}M`}
            tick={{ fontSize: 10, fill: th.text2 }}
            axisLine={false} tickLine={false} width={52}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12, borderRadius: 8,
              border: `1px solid ${th.cardBorder}`,
              background: th.cardBg, color: th.text1,
            }}
            formatter={(v) => [`${Number(v).toFixed(1)}M VND`, lang === "vi" ? "Quỹ lương" : "Payroll"]}
          />
          <Line
            type="monotone" dataKey="salary"
            stroke="#D0211C" strokeWidth={2.5}
            dot={{ r: 4, fill: "#D0211C", strokeWidth: 2, stroke: th.cardBg }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
