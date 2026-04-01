/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Users, UserPlus, Clock, CalendarDays, ClipboardCheck, Check, X, RefreshCw,
  Download, ArrowRight, FileText, Briefcase, History,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getDashboardStats, getDashboardCharts, getDashboardAttendanceTrend } from "@/lib/actions/dashboard.actions"
import { getLeaveRequests, approveLeave } from "@/lib/actions/leave.actions"
import { useSession } from "next-auth/react"
import { useBreakpoint } from "@/hooks/use-breakpoint"

/* ── Reusable Components ─────────────────────────────── */
function StatCard({ label, value, accent, icon, sub }: any) {
  return (
    <div style={{ flex:1, background:accent, color:"#fff", borderRadius:14, padding:"16px 18px",
      position:"relative", overflow:"hidden", boxShadow:"0 4px 14px rgba(0,0,0,0.12)", minWidth:0 }}>
      <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", opacity:0.15 }}>{icon}</div>
      <div style={{ fontSize:12, opacity:0.88, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, opacity:0.72, marginTop:5 }}>{sub}</div>}
    </div>
  )
}

function QuickAction({ icon, label, sub, href, accent, dark }: any) {
  const th = getTheme(dark)
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: th.cardBg, borderRadius: 12, padding: "14px 16px",
        border: `1.5px solid ${th.cardBorder}`,
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "all .2s",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}22` }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)" }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${accent}15`, border: `1.5px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text1 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: th.text2 }}>{sub}</div>
        </div>
        <ArrowRight size={14} color={th.text2} style={{ flexShrink: 0 }} />
      </div>
    </Link>
  )
}

export default function HRDashboard() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { data: session } = useSession()
  const { isMobile } = useBreakpoint()

  const [kpi, setKpi]           = useState({ total: "—", newHires: "—", pendingLeave: "—", expiring: "—" })
  const [headcount, setHeadcount] = useState<any[]>([])
  const [pendingLeaves, setPending] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [statsRes, chartsRes, leavesRes] = await Promise.all([
      getDashboardStats(),
      getDashboardCharts(),
      getLeaveRequests({ status: "Chờ duyệt" }),
    ])
    if (statsRes.success && statsRes.data) {
      const { empStats, pendingLeave, expiringContracts } = statsRes.data
      setKpi({
        total:       String(empStats.total),
        newHires:    String(empStats.trial),
        pendingLeave: String(pendingLeave),
        expiring:    String(expiringContracts),
      })
    }
    if (chartsRes.success && chartsRes.data) {
      setHeadcount(chartsRes.data.headcount ?? [])
    }
    if (leavesRes.success) {
      setPending((leavesRes.data as any[]).map((l: any) => ({
        id:   l.id,
        name: l.employee?.fullName ?? "—",
        dept: l.employee?.department?.name ?? "—",
        type: l.leaveType,
        from: new Date(l.startDate).toLocaleDateString("vi-VN"),
        to:   new Date(l.endDate).toLocaleDateString("vi-VN"),
        days: Number(l.totalDays),
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: number, approved: boolean) => {
    const approverId = (session?.user as any)?.id
    if (!approverId) return
    setActionLoading(true)
    await approveLeave(id, Number(approverId), approved)
    setPending(p => p.filter(x => x.id !== id))
    setToast(approved ? (vi ? "✅ Đã duyệt đơn nghỉ" : "✅ Leave approved") : (vi ? "❌ Đã từ chối" : "❌ Leave rejected"))
    setTimeout(() => setToast(null), 3000)
    setActionLoading(false)
  }

  /* Excel export */
  async function handleExportExcel() {
    try {
      const res = await fetch("/api/export/excel?type=employees")
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AXIOM_NhanSu_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { alert(vi ? "Không thể xuất Excel." : "Excel export failed.") }
  }

  const hd: React.CSSProperties = { padding:"9px 12px", fontSize:11.5, fontWeight:700, color:th.tableHeadText, background:th.tableHead, borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left", whiteSpace:"nowrap" }
  const td: React.CSSProperties = { padding:"10px 12px", fontSize:12.5, color:th.text1, borderBottom:`1px solid ${th.tableBorder}` }
  const card: React.CSSProperties = { background:th.cardBg, borderRadius:14, border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }

  return (
    <div className="page-pad">
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Dashboard — Trưởng phòng Nhân sự":"HR Manager Dashboard"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi?"Quản lý nhân sự toàn công ty":"Company-wide HR management"}
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={load} disabled={loading}
            style={{ padding:"7px 14px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:th.cardBg, color:th.text2, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontFamily:"inherit" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }}/>{vi?"Tải lại":"Refresh"}
          </button>
          <button onClick={handleExportExcel}
            style={{ padding:"7px 14px", borderRadius:9, background:"#10B981", color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit", boxShadow:"0 2px 8px rgba(16,185,129,0.3)" }}>
            <Download size={13}/>{vi?"Xuất Excel":"Export Excel"}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="stat-row" style={{ marginBottom: 22 }}>
        <StatCard label={vi?"Tổng nhân viên":"Total Staff"} value={kpi.total} accent="linear-gradient(135deg,#D0211C,#991414)" icon={<Users size={52}/>} sub={vi?"Đang làm việc":"Active employees"}/>
        <StatCard label={vi?"Đang thử việc":"Probation"} value={kpi.newHires} accent="linear-gradient(135deg,#059669,#047857)" icon={<UserPlus size={52}/>} sub={vi?"Chưa ký chính thức":"Probation period"}/>
        <StatCard label={vi?"Đơn nghỉ chờ duyệt":"Pending Leaves"} value={kpi.pendingLeave} accent="linear-gradient(135deg,#D97706,#B45309)" icon={<CalendarDays size={52}/>} sub={vi?"Cần xử lý":"Need action"}/>
        <StatCard label={vi?"Hợp đồng hết hạn":"Expiring Contracts"} value={kpi.expiring} accent="linear-gradient(135deg,#7C3AED,#6D28D9)" icon={<ClipboardCheck size={52}/>} sub={vi?"Trong 30 ngày":"Within 30 days"}/>
      </div>

      <div className="rg-2" style={{ marginBottom: 22 }}>
        {/* Headcount chart */}
        <div style={{ ...card, padding:"18px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>👥 {vi?"Nhân lực theo phòng ban":"Headcount by Department"}</div>
          {headcount.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
              <BarChart data={headcount} barSize={24} margin={{ left:-10, right:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={th.tableBorder} vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize:10, fill:th.text2 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:th.text2 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:dark?"#1e293b":"#fff", border:`1px solid ${th.cardBorder}`, borderRadius:8, fontSize:12 }}/>
                <Bar dataKey="value" name={vi?"Nhân viên":"Employees"} fill="#D0211C" radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading ? <span style={{ animation:"spin .7s linear infinite", display:"inline-block" }}>⟳</span> : vi?"Chưa có dữ liệu":"No data yet"}
            </div>
          )}
        </div>

        {/* Quick Actions — UC linked */}
        <div style={{ ...card, padding:"18px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>⚡ {vi?"Chức năng theo Use Case":"Use Case Actions"}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <QuickAction icon={<Users size={18} color="#D0211C"/>} label={vi?"Quản lý thông tin nhân viên":"Employee Management"} sub="UC-01" href="/employees" accent="#D0211C" dark={dark}/>
            <QuickAction icon={<FileText size={18} color="#7C3AED"/>} label={vi?"Quản lý hợp đồng lao động":"Contract Management"} sub="UC-02" href="/contracts" accent="#7C3AED" dark={dark}/>
            <QuickAction icon={<Clock size={18} color="#059669"/>} label={vi?"Quản lý chấm công":"Attendance Management"} sub="UC-06" href="/attendance" accent="#059669" dark={dark}/>
            <QuickAction icon={<CalendarDays size={18} color="#D97706"/>} label={vi?"Duyệt yêu cầu nghỉ phép":"Approve Leave Requests"} sub="UC-05" href="/leave" accent="#D97706" dark={dark}/>
            <QuickAction icon={<History size={18} color="#F59E0B"/>} label={vi?"Quản lý quá trình công tác":"Career History"} sub="UC-03" href="/career-history" accent="#F59E0B" dark={dark}/>
            <QuickAction icon={<Briefcase size={18} color="#3B82F6"/>} label={vi?"Quản lý công tác phí":"Business Trip Expenses"} sub="UC-07" href="/business-trips" accent="#3B82F6" dark={dark}/>
          </div>
        </div>
      </div>

      {/* Pending leave table + approve */}
      <div style={{ ...card, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${th.tableBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, fontSize:14, color:th.text1 }}>📅 {vi?"Đơn nghỉ phép chờ duyệt":"Pending Leave Requests"}</span>
          <span style={{ fontSize:12, color:th.text2 }}>{pendingLeaves.length} {vi?"đơn":"requests"}</span>
        </div>
        {pendingLeaves.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:th.text2, fontSize:13 }}>
            ✅ {loading ? (vi?"Đang tải...":"Loading...") : (vi?"Không có đơn nào chờ duyệt":"No pending requests")}
          </div>
        ) : isMobile ? (
          <div className="mobile-card-list" style={{ padding: "12px" }}>
            {pendingLeaves.map(l => (
              <div key={l.id} style={{ background: th.tableHead, borderRadius: 10, padding: "12px", border: `1px solid ${th.tableBorder}` }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: th.text1, marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: 11.5, color: th.text2, marginBottom: 8 }}>
                  <span style={{ background: "#DBEAFE", color: "#1E40AF", borderRadius: 8, padding: "1px 7px", fontSize: 11, fontWeight: 600, marginRight: 6 }}>{l.type}</span>
                  {l.from} → {l.to} · <b style={{ color: "#D0211C" }}>{l.days}</b> {vi?"ngày":"days"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleApprove(l.id, true)} disabled={actionLoading}
                    style={{ flex: 1, padding: "6px", borderRadius: 7, border: "none", background: "#D1FAE5", color: "#065F46", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <Check size={12}/>{vi?"Duyệt":"Approve"}
                  </button>
                  <button onClick={() => handleApprove(l.id, false)} disabled={actionLoading}
                    style={{ flex: 1, padding: "6px", borderRadius: 7, border: "none", background: "#FEE2E2", color: "#991B1B", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <X size={12}/>{vi?"Từ chối":"Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>
              {[vi?"Nhân viên":"Employee",vi?"Phòng ban":"Dept",vi?"Loại nghỉ":"Type",vi?"Từ":"From",vi?"Đến":"To",vi?"Ngày":"Days",vi?"Thao tác":"Actions"].map(c => <th key={c} style={hd}>{c}</th>)}
            </tr></thead>
            <tbody>
              {pendingLeaves.map(l => (
                <tr key={l.id} style={{ transition:"background .1s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=dark?"rgba(255,255,255,0.03)":"#FAFAFA"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}>
                  <td style={{ ...td, fontWeight:600 }}>{l.name}</td>
                  <td style={td}><span style={{ fontSize:11, background:th.tableHead, borderRadius:8, padding:"2px 8px" }}>{l.dept}</span></td>
                  <td style={td}><span style={{ background:"#DBEAFE", color:"#1E40AF", borderRadius:10, padding:"2px 8px", fontSize:11.5, fontWeight:600 }}>{l.type}</span></td>
                  <td style={td}>{l.from}</td>
                  <td style={td}>{l.to}</td>
                  <td style={td}><b style={{ color:"#D0211C" }}>{l.days}</b></td>
                  <td style={td}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => handleApprove(l.id, true)} disabled={actionLoading}
                        style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:7, border:"none", background:"#D1FAE5", color:"#065F46", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                        <Check size={12}/>{vi?"Duyệt":"Approve"}
                      </button>
                      <button onClick={() => handleApprove(l.id, false)} disabled={actionLoading}
                        style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:7, border:"none", background:"#FEE2E2", color:"#991B1B", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                        <X size={12}/>{vi?"Từ chối":"Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div style={{ position:"fixed", bottom:32, right:32, zIndex:9999, background:"#111827", color:"#fff", padding:"12px 18px", borderRadius:12, fontSize:14, boxShadow:"0 8px 24px rgba(0,0,0,0.25)", fontWeight:600 }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
