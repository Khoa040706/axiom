/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from "recharts"
import {
  Users, TrendingUp, DollarSign, FileText, Clock, AlertTriangle,
  RefreshCw, Download, UserCheck, Briefcase, Calendar, Activity,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import {
  getDashboardStats, getDashboardCharts, getDashboardAttendanceTrend,
  getDashboardExtended, getDashboardActivity,
} from "@/lib/actions/dashboard.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { tDept, tEmpStatus, tLeaveType, tContractType, tStatus } from "@/lib/i18n-maps"
import { CompanyEventsWidget } from "@/components/dashboard/CompanyEvents"

const RED = "#D0211C", GREEN = "#059669", PURPLE = "#7C3AED", AMBER = "#D97706", BLUE = "#3B82F6"
const PIE_COLORS = ["#D0211C","#059669","#7C3AED","#D97706","#3B82F6","#EC4899","#14B8A6"]
const RADIAN = Math.PI / 180

function tip(dark: boolean) {
  return { background: dark?"#1e293b":"#fff", border:`1px solid ${dark?"#334155":"#e5e7eb"}`, borderRadius:8, fontSize:12, boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }
}

function KpiCard({ label, value, sub, bg, icon }: any) {
  return (
    <div style={{ flex:1, background:bg, color:"#fff", borderRadius:16, padding:"18px 20px",
      position:"relative", overflow:"hidden", boxShadow:"0 4px 18px rgba(0,0,0,0.16)", minWidth:0 }}>
      <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", opacity:0.15 }}>{icon}</div>
      <div style={{ fontSize:11.5, opacity:0.88, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:800, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, opacity:0.75, marginTop:5 }}>{sub}</div>
    </div>
  )
}

function ChartCard({ title, children, style }: any) {
  return (
    <div style={{ background:"var(--cBg)", borderRadius:14, padding:"18px 20px",
      border:"1px solid var(--cBorder)", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", overflow:"visible", ...style }}>
      <div style={{ fontSize:13.5, fontWeight:700, color:"var(--cText)", marginBottom:14 }}>{title}</div>
      {children}
    </div>
  )
}

function PieLbl({ cx, cy, midAngle, outerRadius, name, value, textColor, isMobile }: any) {
  const r = outerRadius+(isMobile?16:24), x = cx+r*Math.cos(-midAngle*RADIAN), y = cy+r*Math.sin(-midAngle*RADIAN)
  return <text x={x} y={y} fill={textColor} fontSize={isMobile?8.5:9.5} textAnchor={x>cx?"start":"end"} dominantBaseline="central">{name}: <tspan fontWeight={700}>{value}</tspan></text>
}

function ActivityFeed({ items, vi, th }: any) {
  const iconMap: any = { leave: "📋", contract: "📄" }
  const colorMap: any = {
    "Đã duyệt":"#059669","Chờ duyệt":"#D97706","Từ chối":"#EF4444","Hiệu lực":"#3B82F6",
    "Approved":"#059669","Pending":"#D97706","Rejected":"#EF4444","Active":"#3B82F6",
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {items.length === 0 && (
        <div style={{ color:th.text2, fontSize:13, textAlign:"center", padding:32 }}>
          {vi?"Chưa có hoạt động":"No recent activity"}
        </div>
      )}
      {items.map((a: any, i: number) => {
        const displayStatus = tStatus(a.status, vi)
        // Dựng message theo ngôn ngữ
        const subLabel = a.type === "leave"
          ? tLeaveType(a.subType ?? "", vi)
          : tContractType(a.subType ?? "", vi)
        const message = a.type === "leave"
          ? (vi
              ? `${a.name} đăng ký nghỉ phép (${subLabel})`
              : `${a.name} submitted leave request (${subLabel})`)
          : (vi
              ? `Hợp đồng ${subLabel} — ${a.name}`
              : `${subLabel} contract — ${a.name}`)
        return (
          <div key={i} style={{ display:"flex", gap:10, padding:"8px 10px", borderRadius:10,
            background: th.dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)", alignItems:"flex-start" }}>
            <div style={{ fontSize:18, flexShrink:0 }}>{iconMap[a.type] ?? "📌"}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:th.text1, lineHeight:1.4 }}>{message}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
                <span style={{ fontSize:10, padding:"1px 7px", borderRadius:20,
                  background:`${colorMap[displayStatus]??th.cardBorder}22`,
                  color:colorMap[displayStatus]??"#888", fontWeight:600 }}>{displayStatus}</span>
                <span style={{ fontSize:10, color:th.text3 }}>
                  {new Date(a.time).toLocaleDateString(vi?"vi-VN":"en-US")}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const STATIC_ATTEND = [
  { month:"T10", dayDu:95, diMuon:2, vangMat:2 }, { month:"T11", dayDu:88, diMuon:5, vangMat:3 },
  { month:"T12", dayDu:92, diMuon:3, vangMat:1 }, { month:"T1",  dayDu:96, diMuon:1, vangMat:0 },
  { month:"T2",  dayDu:91, diMuon:4, vangMat:2 }, { month:"T3",  dayDu:94, diMuon:2, vangMat:1 },
]

export default function DirectorDashboard() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const tf = dark ? "#e2e8f0" : th.text2, gs = th.tableBorder
  const { isMobile } = useBreakpoint()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role ?? ""
  const H = isMobile ? 160 : 200

  const [kpi, setKpi] = useState({ total:"—", trial:"—", pendingLeave:"—", expiring:"—", payroll:"—", avgNet:"—" })
  const [payrollTrend, setPayrollTrend] = useState<any[]>([])
  const [headcount, setHeadcount]       = useState<any[]>([])
  const [attendTrend, setAttendTrend]   = useState<any[]>([])
  const [grossNet, setGrossNet]         = useState<any[]>([])
  const [empStatus, setEmpStatus]       = useState<any[]>([])
  const [contractTypes, setContractTypes] = useState<any[]>([])
  const [leaveTypes, setLeaveTypes]     = useState<any[]>([])
  const [newHires, setNewHires]         = useState<any[]>([])
  const [activity, setActivity]         = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadingPdf, setLoadingPdf]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [s, c, a, ex, act] = await Promise.all([
      getDashboardStats(), getDashboardCharts(),
      getDashboardAttendanceTrend(), getDashboardExtended(), getDashboardActivity(),
    ])
    if (s.success && s.data) {
      const { empStats, pendingLeave, expiringContracts } = s.data
      setKpi(prev => ({ ...prev, total:String(empStats.total), trial:String(empStats.trial),
        pendingLeave:String(pendingLeave), expiring:String(expiringContracts) }))
    }
    if (c.success && c.data) {
      const trend = c.data.payrollTrend ?? []
      setPayrollTrend(trend)
      setHeadcount((c.data.headcount ?? []).map((d:any,i:number) => ({ ...d, color:PIE_COLORS[i%PIE_COLORS.length] })))
      if (trend.length > 0) {
        const last = trend[trend.length-1]
        setKpi(prev => ({ ...prev, payroll:`${last.salary.toFixed(1)}M` }))
      }
    }
    if (a.success && a.data) setAttendTrend(a.data as any[])
    if (ex.success && ex.data) {
      const d = ex.data
      setGrossNet(d.grossNet ?? [])
      // Store raw data — translation applied at render time via useMemo
      setEmpStatus((d.empStatus ?? []).map((r:any,i:number) => ({ ...r, fill:PIE_COLORS[i%PIE_COLORS.length] })))
      setContractTypes((d.contractTypes ?? []).map((r:any,i:number) => ({ ...r, color:PIE_COLORS[i%PIE_COLORS.length] })))
      setLeaveTypes(d.leaveTypes ?? [])
      setNewHires(d.newHires ?? [])
      if ((d.grossNet ?? []).length > 0) {
        const last = d.grossNet[d.grossNet.length-1]
        setKpi(prev => ({ ...prev, avgNet:`${last.avgNet}M` }))
      }
    }
    if (act.success && act.data) setActivity(act.data as any[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleExportExcel() {
    try {
      const res = await fetch("/api/export/excel?type=dashboard")
      if (!res.ok) throw new Error()
      const buffer = await res.arrayBuffer()
      const blob = new Blob([buffer], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const today = new Date()
      const tag = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`
      const url = URL.createObjectURL(blob), a = document.createElement("a")
      a.style.display="none"; a.href=url; a.download=`AXIOM_BaoCao_${tag}.xlsx`
      document.body.appendChild(a); a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 10_000)
    } catch { alert(vi?"Không thể xuất Excel.":"Export failed.") }
  }

  async function handleExportPdf() {
    try {
      setLoadingPdf(true)
      const res = await fetch(`/api/export/dashboard-pdf?lang=${lang}`)
      if (!res.ok) throw new Error()
      const buffer = await res.arrayBuffer()
      const blob = new Blob([buffer], { type:"application/pdf" })
      const today = new Date()
      const tag = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`
      const url = URL.createObjectURL(blob), a = document.createElement("a")
      a.style.display="none"; a.href=url; a.download=`AXIOM_BaoCao_${tag}.pdf`
      document.body.appendChild(a); a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 10_000)
    } catch { alert(vi?"Không thể xuất PDF.":"Export failed.") }
    finally { setLoadingPdf(false) }
  }

  const translatedHC       = useMemo(() => headcount.map(d     => ({ ...d, name: tDept(d.name, vi) })),          [headcount, vi])
  const translatedEmpStatus = useMemo(() => empStatus.map(d     => ({ ...d, name: tEmpStatus(d.name, vi) })),    [empStatus, vi])
  const translatedContracts = useMemo(() => contractTypes.map(d => ({ ...d, name: tContractType(d.name, vi) })),[contractTypes, vi])
  const translatedLeaveTypes= useMemo(() => leaveTypes.map(d    => ({ ...d, type: tLeaveType(d.type, vi) })),    [leaveTypes, vi])
  const attendData = attendTrend.length > 0 ? attendTrend : STATIC_ATTEND

  const cBg = th.cardBg, cBorder = th.cardBorder, cText = th.text1

  return (
    <div className="page-pad" style={{ ["--cBg" as any]:cBg, ["--cBorder" as any]:cBorder, ["--cText" as any]:cText }}>
      {/* ── HEADER ── */}
      <div className="page-header" style={{ marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:th.text1, margin:0 }}>
            {userRole === "Admin"
              ? (vi ? "Thống kê tổng quan" : "Statistics Overview")
              : (vi ? "Dashboard Giám đốc" : "Director Dashboard")}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {userRole === "Admin"
              ? (vi ? "Biểu đồ KPI & phân tích nhân sự toàn công ty" : "Company-wide KPI charts & HR analytics")
              : (vi ? "Tổng quan toàn diện về nhân sự, tài chính & vận hành công ty" : "Full company HR, finance & operations overview")}
          </p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={load} disabled={loading}
            style={{ padding:"8px 14px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:th.cardBg, color:th.text2, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontFamily:"inherit" }}>
            <RefreshCw size={13} style={{ animation:loading?"spin .7s linear infinite":"none" }}/>{vi?"Tải lại":"Refresh"}
          </button>
          <button onClick={handleExportExcel}
            style={{ padding:"8px 14px", borderRadius:9, background:"#10B981", color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
            <Download size={13}/>{vi?"Xuất Excel":"Excel"}
          </button>
          <button onClick={handleExportPdf} disabled={loadingPdf}
            style={{ padding:"8px 14px", borderRadius:9, background:`linear-gradient(135deg,${RED},#991414)`, color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:loadingPdf?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit", opacity:loadingPdf?0.8:1 }}>
            {loadingPdf
              ? <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>{vi?"Đang xuất...":"Exporting..."}</>
              : <><Download size={13}/>{vi?"Xuất PDF":"PDF"}</>}
          </button>
        </div>
      </div>

      {/* ── KPI CARDS (6 thẻ) ── */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${isMobile?2:6},1fr)`, gap:12, marginBottom:24 }}>
        <KpiCard label={vi?"Tổng nhân sự":"Total Staff"}     value={kpi.total}       sub={vi?"Đang làm việc":"Active"}         bg={`linear-gradient(135deg,${RED},#991414)`}     icon={<Users size={52}/>}/>
        <KpiCard label={vi?"Thử việc":"Probation"}           value={kpi.trial}       sub={vi?"Nhân viên mới":"New hires"}       bg={`linear-gradient(135deg,${PURPLE},#6D28D9)`}  icon={<UserCheck size={52}/>}/>
        <KpiCard label={vi?"Quỹ lương net":"Net Payroll"}    value={kpi.payroll}     sub={vi?"Tháng hiện tại":"Current month"}  bg={`linear-gradient(135deg,${GREEN},#047857)`}   icon={<DollarSign size={52}/>}/>
        <KpiCard label={vi?"Lương tb/người":"Avg Net/Person"}value={kpi.avgNet}      sub={vi?"Triệu đồng/tháng":"M VND/month"} bg={`linear-gradient(135deg,#0EA5E9,#0284C7)`}   icon={<TrendingUp size={52}/>}/>
        <KpiCard label={vi?"Đơn nghỉ chờ":"Pending Leaves"}  value={kpi.pendingLeave}sub={vi?"Cần phê duyệt":"Need approval"}   bg={`linear-gradient(135deg,${AMBER},#B45309)`}   icon={<Clock size={52}/>}/>
        <KpiCard label={vi?"HĐ sắp hết hạn":"Expiring"}      value={kpi.expiring}    sub={vi?"Trong 30 ngày":"Within 30d"}      bg={`linear-gradient(135deg,#EF4444,#B91C1C)`}   icon={<AlertTriangle size={52}/>}/>
      </div>

      {/* ── ROW 1: Gross/Net trend (2/3) + Employee Status (1/3) ── */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"2fr 1fr", gap:16, marginBottom:16 }}>
        <ChartCard title={`💰 ${vi?"Quỹ lương Gross vs Net 6 tháng (triệu đ)":"Gross vs Net Payroll 6-month Trend (MVND)"}`}>
          {grossNet.length > 0 ? (
            <ResponsiveContainer width="100%" height={H}>
              <AreaChart data={grossNet} margin={{ left:-10, right:10, top:4 }}>
                <defs>
                  <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AMBER} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={AMBER} stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RED} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={RED} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gs} vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:tf }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:tf }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip contentStyle={tip(dark)} formatter={(v:any)=>[`${v}M`]}/>
                <Legend iconType="circle" iconSize={8} formatter={(v:string)=><span style={{ fontSize:11, color:tf }}>{v==="gross"?"Gross":"Net"}</span>}/>
                <Area type="monotone" dataKey="gross" name="Gross" stroke={AMBER} strokeWidth={2} fill="url(#gGross)" dot={{ r:3 }}/>
                <Area type="monotone" dataKey="net"   name="Net"   stroke={RED}   strokeWidth={2} fill="url(#gNet)"   dot={{ r:3 }}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:H, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading ? <span style={{ width:28,height:28,border:`3px solid ${th.cardBorder}`,borderTopColor:RED,borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite" }}/> : vi?"Chưa có dữ liệu lương":"No payroll data"}
            </div>
          )}
        </ChartCard>

        <ChartCard title={`👤 ${vi?"Tình trạng nhân viên":"Employee Status"}`}>
          {translatedEmpStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? H+40 : H}>
              <PieChart>
                <Pie data={translatedEmpStatus} cx="50%" cy="45%" innerRadius={isMobile?35:45} outerRadius={isMobile?58:70}
                  dataKey="value" paddingAngle={3}>
                  {translatedEmpStatus.map((d:any,i:number) => <Cell key={i} fill={d.fill}/>)}
                </Pie>
                <Tooltip contentStyle={tip(dark)}/>
                <Legend iconType="circle" iconSize={8} formatter={(v:string)=><span style={{ fontSize:10, color:tf }}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:H, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading?vi?"Đang tải...":"Loading...":vi?"Chưa có dữ liệu":"No data"}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── ROW 2: Headcount pie + Contract types ── */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:16, marginBottom:16 }}>
        <ChartCard title={`🏢 ${vi?"Phân bổ nhân lực theo phòng ban":"Workforce by Department"}`}>
          {translatedHC.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? H+60 : H+20}>
              <PieChart margin={{ top:10, right:isMobile?50:32, left:isMobile?50:32, bottom:10 }}>
                <Pie data={translatedHC} cx="50%" cy="50%" outerRadius={isMobile?55:68} dataKey="value"
                  label={(p:any)=><PieLbl {...p} textColor={th.text1} isMobile={isMobile}/>}
                  labelLine={{ stroke:dark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)", strokeWidth:1 }}>
                  {translatedHC.map((d:any,i:number)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip contentStyle={tip(dark)} formatter={(v:any,n:any)=>[`${v} ${vi?"người":"staff"}`,n]}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:H, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading?vi?"Đang tải...":"Loading...":vi?"Chưa có dữ liệu":"No data"}
            </div>
          )}
        </ChartCard>

        <ChartCard title={`📋 ${vi?"Phân loại hợp đồng":"Contract Type Breakdown"}`}>
          {translatedContracts.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? H+60 : H+20}>
              <PieChart margin={{ top:10, right:isMobile?50:32, left:isMobile?50:32, bottom:10 }}>
                <Pie data={translatedContracts} cx="50%" cy="50%" outerRadius={isMobile?55:68} dataKey="value"
                  label={(p:any)=><PieLbl {...p} textColor={th.text1} isMobile={isMobile}/>}
                  labelLine={{ stroke:dark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)", strokeWidth:1 }}>
                  {translatedContracts.map((d:any,i:number)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip contentStyle={tip(dark)}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:H, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading?vi?"Đang tải...":"Loading...":vi?"Chưa có dữ liệu":"No data"}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── ROW 3: Attendance trend (full width) ── */}
      <ChartCard title={`📊 ${vi?"Xu hướng chấm công 6 tháng gần đây":"6-Month Attendance Trend"}`} style={{ marginBottom:16 }}>
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={attendData} barSize={13} barGap={3} margin={{ top:4, right:10, left:-10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gs} vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize:11, fill:tf }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:tf }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tip(dark)}/>
            <Legend iconType="square" iconSize={8} formatter={(v:string)=><span style={{ fontSize:11, color:tf }}>
              {v==="dayDu"?(vi?"Đi làm đầy đủ":"Full Attendance"):v==="diMuon"?(vi?"Đi muộn":"Late"):vi?"Vắng mặt":"Absent"}
            </span>}/>
            <Bar dataKey="dayDu"   name={vi?"Đi làm đầy đủ":"Full Attendance"} fill={dark?"#9b2335":RED}     radius={[3,3,0,0]}/>
            <Bar dataKey="diMuon"  name={vi?"Đi muộn":"Late"}                  fill={dark?"#b07a30":AMBER}   radius={[3,3,0,0]}/>
            <Bar dataKey="vangMat" name={vi?"Vắng mặt":"Absent"}               fill={dark?"#4b5563":"#6B7280"} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── ROW 4: Leave types + New hire trend + Activity ── */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:16 }}>
        {/* Leave types */}
        <ChartCard title={`🏖️ ${vi?"Loại nghỉ phép":"Leave Type Distribution"}`}>
          {translatedLeaveTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={translatedLeaveTypes} layout="vertical" margin={{ left:4, right:16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gs} horizontal={false}/>
                <XAxis type="number" tick={{ fontSize:10, fill:tf }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="type" width={90} tick={{ fontSize:10, fill:tf }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tip(dark)}/>
                <Bar dataKey="count" name={vi?"Số đơn":"Requests"} fill={PURPLE} radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:H, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading?vi?"Đang tải...":"Loading...":vi?"Chưa có dữ liệu":"No data"}
            </div>
          )}
        </ChartCard>

        {/* New hire trend */}
        <ChartCard title={`🚀 ${vi?"Tuyển dụng mới theo tháng":"New Hire Trend"}`}>
          <ResponsiveContainer width="100%" height={H}>
            <BarChart data={newHires} margin={{ top:4, right:10, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gs} vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:tf }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:tf }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={tip(dark)}/>
              <Bar dataKey="count" name={vi?"Nhân viên mới":"New hires"} radius={[4,4,0,0]}>
                {newHires.map((_:any,i:number)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent activity */}
        <ChartCard title={`⚡ ${vi?"Hoạt động gần đây":"Recent Activity"}`}>
          <div style={{ maxHeight:H+20, overflowY:"auto" }}>
            <ActivityFeed items={activity} vi={vi} th={{ ...th, dark }}/>
          </div>
        </ChartCard>
      </div>

      {/* ── Company Events ── */}
      <div style={{ marginTop: 16 }}>
        <CompanyEventsWidget dark={dark} vi={vi} maxHeight={360}/>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
