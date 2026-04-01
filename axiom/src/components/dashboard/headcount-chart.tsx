"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

const DEFAULT_DATA = [
  { name: "Công nghệ", value: 15 },
  { name: "Kinh doanh", value: 12 },
  { name: "Kế toán", value: 8 },
  { name: "Marketing", value: 5 },
  { name: "Nhân sự", value: 5 },
]

interface HeadcountChartProps {
  data?: { name: string; value: number }[]
}

export function HeadcountChart({ data = DEFAULT_DATA }: HeadcountChartProps) {
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
        {lang === "vi" ? "Nhân sự theo phòng ban" : "Headcount by Department"}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={24} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={th.tableBorder} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: th.text2 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: th.text2 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              fontSize: 12, borderRadius: 8,
              border: `1px solid ${th.cardBorder}`,
              background: th.cardBg, color: th.text1,
            }}
          />
          <Bar dataKey="value" fill="#D0211C" radius={[4, 4, 0, 0]} name={lang === "vi" ? "Nhân viên" : "Employees"} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
