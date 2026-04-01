/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import {
  Users, TrendingUp, DollarSign, FileText,
  CheckCircle, Clock, AlertTriangle, Award, Building2, Target, ArrowUpRight, RefreshCw,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getDashboardStats, getDashboardCharts, getDashboardAttendanceTrend } from "@/lib/actions/dashboard.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"

function mkTooltip(dark: boolean) {
  return {
    background: dark ? "#1e293b" : "#fff",
    border: `1px solid ${dark ? "#334155" : "#E5E7EB"}`,
    borderRadius: 8, padding: "10px 14px", fontSize: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  }
}

function StatCard({ label, value, sub, accent, icon, trend }: any) {
  return (
    <div style={{ flex:1, background:accent, color:"#fff", borderRadius:16,
      padding:"18px 20px", position:"relative", overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.14)", minWidth:0 }}>
      <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", opacity:0.15 }}>{icon}</div>
      <div style={{ fontSize:12, opacity:0.88, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:800, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11.5, opacity:0.75, marginTop:6, display:"flex", alignItems:"center", gap:4 }}>
        {trend==="up" && <ArrowUpRight size={12}/>}
        {sub}
      </div>
    </div>
  )
}

const PIE_COLORS = ["#8B1010","#B91C1C","#DC2626","#E57373","#F28B82"]
const RADIAN = Math.PI / 180
function PieLabel(props: any & { textColor: string }) {
  const { cx, cy, midAngle, outerRadius, name, value, textColor } = props
  const r = outerRadius + 26, x = cx + r*Math.cos(-midAngle*RADIAN), y = cy + r*Math.sin(-midAngle*RADIAN)
  return <text x={x} y={y} fill={textColor} fontSize={10} textAnchor={x>cx?"start":"end"} dominantBaseline="central">{name}: <tspan fontWeight={700}>{value}</tspan></text>
}

function getAttendLabels(vi: boolean): Record<string, string> {
  return {
    dayDu:   vi ? "Đi làm đầy đủ" : "Full Attendance",
    diMuon:  vi ? "Đi muộn"     : "Late",
    vangMat: vi ? "Vắng mặt"    : "Absent",
  }
}


export default function DirectorDashboard() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const tf = th.text2, gs = th.tableBorder
  const { isMobile } = useBreakpoint()

  const [payrollTrend, setPayrollTrend] = useState<any[]>([])
  const [headcount, setHeadcount]       = useState<any[]>([])
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([])
  const [kpi, setKpi] = useState({ total:"—", trial:"—", pendingLeave:"—", expiring:"—", payroll:"—" })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [statsRes, chartsRes, attendRes] = await Promise.all([
      getDashboardStats(),
      getDashboardCharts(),
      getDashboardAttendanceTrend(),
    ])
    if (statsRes.success && statsRes.data) {
      const { empStats, pendingLeave, expiringContracts } = statsRes.data
      setKpi(prev => ({
        ...prev,
        total:   String(empStats.total),
        trial:   String(empStats.trial),
        pendingLeave: String(pendingLeave),
        expiring: String(expiringContracts),
      }))
    }
    if (chartsRes.success && chartsRes.data) {
      const trend = chartsRes.data.payrollTrend ?? []
      setPayrollTrend(trend)
      setHeadcount((chartsRes.data.headcount ?? []).map((d:any,i:number) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length] })))
      if (trend.length > 0) {
        const last = trend[trend.length - 1]
        setKpi(prev => ({ ...prev, payroll: `${last.salary.toFixed(1)}M` }))
      }
    }
    if (attendRes.success && attendRes.data) {
      setAttendanceTrend(attendRes.data as any[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* Excel export */
  async function handleExportExcel() {
    try {
      const res = await fetch("/api/export/excel?type=dashboard")
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AXIOM_BaoCao_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("[exportExcel]", err)
      alert(vi ? "Không thể xuất Excel. Vui lòng thử lại." : "Excel export failed.")
    }
  }

  const cardStyle: React.CSSProperties = { background:th.cardBg, borderRadius:14, padding:"20px", border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }
  const titleStyle: React.CSSProperties = { fontSize:14, fontWeight:700, color:th.text1, marginBottom:16 }
  const ATTEND_LABELS = getAttendLabels(vi)

  const STATIC_ATTEND = [
    { month: "T10", dayDu: 95, diMuon: 2, vangMat: 2 }, { month: "T11", dayDu: 88, diMuon: 5, vangMat: 3 },
    { month: "T12", dayDu: 92, diMuon: 3, vangMat: 1 }, { month: "T1",  dayDu: 96, diMuon: 1, vangMat: 0 },
    { month: "T2",  dayDu: 91, diMuon: 4, vangMat: 2 }, { month: "T3",  dayDu: 94, diMuon: 2, vangMat: 1 },
  ]
  const attendanceData = attendanceTrend.length > 0 ? attendanceTrend : STATIC_ATTEND

  return (
    <div className="page-pad">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Dashboard — Ban lãnh đạo":"Director Dashboard"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi?"Tổng quan nhân sự & tài chính toàn công ty":"Company-wide HR & financial overview"}
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={load} disabled={loading}
            style={{ padding:"8px 14px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:th.cardBg, color:th.text2, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontFamily:"inherit" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }}/>{vi?"Tải lại":"Refresh"}
          </button>
        </div>
      </div>

      {/* KPI Cards — Real DB data */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <StatCard label={vi?"Tổng nhân sự":"Total Headcount"} value={kpi.total} sub={vi?"Đang làm việc":"Active employees"} accent="linear-gradient(135deg,#D0211C,#991414)" icon={<Users size={52}/>} trend="up"/>
        <StatCard label={vi?"Quỹ lương net":"Net Payroll"} value={kpi.payroll} sub={vi?"Tháng hiện tại":"Current month"} accent="linear-gradient(135deg,#059669,#047857)" icon={<DollarSign size={52}/>} trend="up"/>
        <StatCard label={vi?"Đơn nghỉ chờ duyệt":"Pending Leaves"} value={kpi.pendingLeave} sub={vi?"Cần phê duyệt":"Need approval"} accent="linear-gradient(135deg,#7C3AED,#6D28D9)" icon={<Target size={52}/>}/>
        <StatCard label={vi?"HĐ sắp hết hạn":"Expiring Contracts"} value={kpi.expiring} sub={vi?"Trong 30 ngày tới":"Within 30 days"} accent="linear-gradient(135deg,#D97706,#B45309)" icon={<FileText size={52}/>} trend={Number(kpi.expiring) > 0 ? "up" : undefined}/>
      </div>

      {/* Charts row 1: Payroll trend + Headcount pie */}
      <div className="rg-2" style={{ marginBottom: 24 }}>
        {/* Payroll trend */}
        <div style={cardStyle}>
          <div style={titleStyle}>💰 {vi?"Xu hướng quỹ lương Net (triệu đ)":"Net Payroll Trend (million VND)"}</div>
          {payrollTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
              <LineChart data={payrollTrend} margin={{ left:-10, right:10, top:4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gs} vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:tf }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:tf }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip contentStyle={mkTooltip(dark)} formatter={(v:any)=>`${v}M`}/>
                <Line type="monotone" dataKey="salary" name="Net" stroke="#D0211C" strokeWidth={2.5} dot={{ r:4, fill:"#D0211C" }}/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, flexDirection:"column", gap:8 }}>
              {loading ? <div style={{ width:28, height:28, border:`3px solid ${th.cardBorder}`, borderTopColor:"#D0211C", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> : <span style={{ fontSize:40 }}>💰</span>}
              <span style={{ fontSize:13 }}>{loading?(vi?"Đang tải...":"Loading..."):(vi?"Chưa có dữ liệu lương":"No payroll data")}</span>
            </div>
          )}
        </div>

        {/* Headcount by dept */}
        <div style={cardStyle}>
          <div style={titleStyle}>🏢 {vi?"Phân bổ nhân lực theo phòng ban":"Workforce by Department"}</div>
          {headcount.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
              <PieChart margin={{ top:10, right:30, left:30, bottom:10 }}>
                <Pie data={headcount} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={(p:any) => <PieLabel {...p} textColor={th.text1}/>}
                  labelLine={{ stroke: dark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)", strokeWidth:1 }}>
                  {headcount.map((d: any, i: number) => <Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip contentStyle={{ ...mkTooltip(dark), color:th.text1 }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading ? (vi?"Đang tải...":"Loading...") : vi?"Chưa có dữ liệu phòng ban":"No department data"}
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2: Attendance trends */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={titleStyle}>📊 {vi?"Xu hướng chấm công 6 tháng gần đây":"6-Month Attendance Trend"}</div>
        <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
          <BarChart data={attendanceData} barSize={13} barGap={3} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gs} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: tf }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tf }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={mkTooltip(dark)} />
            <Legend iconType="square" iconSize={8} formatter={(v: string) => <span style={{ fontSize: 11, color: th.text2 }}>{ATTEND_LABELS[v] ?? v}</span>} />
            <Bar dataKey="dayDu"   fill={dark ? "#9b2335" : "#D0211C"} radius={[3, 3, 0, 0]} />
            <Bar dataKey="diMuon"  fill={dark ? "#b07a30" : "#F59E0B"} radius={[3, 3, 0, 0]} />
            <Bar dataKey="vangMat" fill={dark ? "#4b5563" : "#6B7280"} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick stats bottom */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
        {[
          { icon:<CheckCircle size={22} color="#10B981"/>, label:vi?"Đơn nghỉ chờ duyệt":"Pending Leaves", value:kpi.pendingLeave, bg:"#D1FAE5", c:"#065F46" },
          { icon:<Clock size={22} color="#F59E0B"/>,       label:vi?"Hợp đồng sắp hết hạn":"Expiring Contracts", value:kpi.expiring, bg:"#FEF3C7", c:"#92400E" },
          { icon:<Users size={22} color="#8B5CF6"/>,       label:vi?"Đang thử việc":"On Probation",        value:kpi.trial,   bg:"#EDE9FE", c:"#5B21B6" },
          { icon:<Building2 size={22} color="#3B82F6"/>,   label:vi?"Tổng nhân viên":"Total Employees",    value:kpi.total,   bg:"#EFF6FF", c:"#1D4ED8" },
          { icon:<DollarSign size={22} color="#D0211C"/>,  label:vi?"Quỹ lương":"Payroll Fund", value:kpi.payroll, bg:"#FEE2E2", c:"#991B1B" },
        ].map(s => (
          <div key={s.label} style={{ flex:"1 1 170px", background:th.cardBg, borderRadius:12, border:`1px solid ${th.cardBorder}`, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ width:42, height:42, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:11.5, color:th.text2 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>


      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
