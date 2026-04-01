/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Users, CheckCircle, CalendarDays, TrendingUp, Check, X, RefreshCw, Star, ArrowRight, Clock, LayoutDashboard } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getDashboardStats } from "@/lib/actions/dashboard.actions"
import { getLeaveRequests, approveLeave } from "@/lib/actions/leave.actions"
import { getAttendanceByMonth } from "@/lib/actions/attendance.actions"
import { useSession } from "next-auth/react"
import { useEmployeeId } from "@/hooks/use-current-user"
import { useBreakpoint } from "@/hooks/use-breakpoint"

function StatCard({ label, value, accent, icon, sub }: any) {
  return (
    <div style={{ flex:1, background:accent, color:"#fff", borderRadius:14, padding:"16px 18px",
      position:"relative", overflow:"hidden", boxShadow:"0 4px 14px rgba(0,0,0,0.12)" }}>
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

export default function ManagerDashboard() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { data: session } = useSession()
  const employeeId = useEmployeeId()
  const { isMobile } = useBreakpoint()

  const [pendingLeaves, setPending] = useState<any[]>([])
  const [deptAttend, setDeptAttend] = useState<any[]>([])
  const [kpi, setKpi] = useState({ deptSize: "—", pendingLeave: "—" })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<string|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const now = new Date()
    const [statsRes, leavesRes, attendRes] = await Promise.all([
      getDashboardStats(),
      getLeaveRequests({ status: "Chờ duyệt" }),
      // getAttendanceByMonth(month, year) — đúng thứ tự tham số
      getAttendanceByMonth(now.getMonth()+1, now.getFullYear()),
    ])
    if (statsRes.success && statsRes.data) {
      setKpi({ deptSize: String(statsRes.data.empStats.total), pendingLeave: String(statsRes.data.pendingLeave) })
    }
    if (leavesRes.success) {
      setPending((leavesRes.data as any[]).map((l: any) => ({
        id:   l.id,
        name: l.employee?.fullName ?? "—",
        type: l.leaveType,
        from: new Date(l.startDate).toLocaleDateString("vi-VN"),
        to:   new Date(l.endDate).toLocaleDateString("vi-VN"),
        days: Number(l.totalDays),
      })))
    }
    if (attendRes.success) {
      // Build attendance chart từ records thực của manager
      const recs = (attendRes.data ?? []) as any[]
      const ontime = recs.filter((r:any) => r.status === "Đúng giờ" || (r.lateMinutes === 0)).length
      const late   = recs.filter((r:any) => r.lateMinutes > 0).length
      setDeptAttend([
        { cat: vi?"Đúng giờ":"On Time",  count: ontime, fill:"#10B981" },
        { cat: vi?"Đi muộn":"Late",      count: late,   fill:"#F59E0B" },
        { cat: vi?"Tổng ngày":"Total",   count: recs.length, fill:"#D0211C" },
      ])
    }
    setLoading(false)
  }, [vi])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: number, approved: boolean) => {
    const approverId = (session?.user as any)?.employeeId
    if (!approverId) return
    setActionLoading(true)
    await approveLeave(id, Number(approverId), approved)
    setPending(p => p.filter(x => x.id !== id))
    setToast(approved ? "✅ Đã duyệt" : "❌ Đã từ chối")
    setTimeout(() => setToast(null), 3000)
    setActionLoading(false)
  }

  const card: React.CSSProperties = { background:th.cardBg, borderRadius:14, border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }
  const hd:   React.CSSProperties = { padding:"9px 12px", fontSize:11.5, fontWeight:700, color:th.tableHeadText, background:th.tableHead, borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left", whiteSpace:"nowrap" }
  const td:   React.CSSProperties = { padding:"10px 12px", fontSize:12.5, color:th.text1, borderBottom:`1px solid ${th.tableBorder}` }

  return (
    <div className="page-pad">
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Dashboard — Trưởng phòng":"Department Manager Dashboard"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>{vi?"Quản lý nhân sự phòng ban của bạn":"Manage your department team"}</p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ padding:"7px 14px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:th.cardBg, color:th.text2, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontFamily:"inherit" }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }}/>{vi?"Tải lại":"Refresh"}
        </button>
      </div>

      {/* KPI */}
      <div className="stat-row" style={{ marginBottom: 18 }}>
        <StatCard label={vi?"Tổng nhân viên":"Total Staff"} value={kpi.deptSize} accent="linear-gradient(135deg,#D0211C,#991414)" icon={<Users size={52}/>} sub={vi?"Đang làm việc":"Active"}/>
        <StatCard label={vi?"Đơn nghỉ chờ duyệt":"Pending Leaves"} value={kpi.pendingLeave} accent="linear-gradient(135deg,#D97706,#B45309)" icon={<CalendarDays size={52}/>} sub={vi?"Cần xử lý":"Need action"}/>
        <StatCard label={vi?"Đúng giờ tháng này":"On-time This Month"} value={deptAttend.find(d=>d.cat===vi?"Đúng giờ":"On Time")?.count ?? "—"} accent="linear-gradient(135deg,#059669,#047857)" icon={<CheckCircle size={52}/>} sub={vi?"Ngày đúng giờ":"On-time days"}/>
        <StatCard label={vi?"Đi muộn":"Late Arrivals"} value={deptAttend.find(d=>d.cat===vi?"Đi muộn":"Late")?.count ?? "—"} accent="linear-gradient(135deg,#7C3AED,#6D28D9)" icon={<TrendingUp size={52}/>} sub={vi?"Tháng này":"This month"}/>
      </div>

      <div className="rg-2" style={{ marginBottom: 16 }}>
        {/* Attendance chart */}
        <div style={{ ...card, padding:"18px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>📅 {vi?"Chấm công của bạn tháng này":"Your Attendance This Month"}</div>
          {deptAttend.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
              <BarChart data={deptAttend} barSize={40} margin={{ left:-10, right:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={th.tableBorder} vertical={false}/>
                <XAxis dataKey="cat" tick={{ fontSize:11, fill:th.text2 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:th.text2 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:dark?"#1e293b":"#fff", border:`1px solid ${th.cardBorder}`, borderRadius:8, fontSize:12 }}/>
                <Bar dataKey="count" name={vi?"Số ngày":"Days"} radius={[5,5,0,0]}>
                  {deptAttend.map((d,i) => (
                    <rect key={i} fill={d.fill}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13 }}>
              {loading ? (vi?"Đang tải...":"Loading...") : vi?"Chưa có dữ liệu chấm công":"No attendance data"}
            </div>
          )}
        </div>

        {/* Leave summary */}
        <div style={{ ...card, padding:"18px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:12 }}>⭐ {vi?"Tổng hợp đơn nghỉ chờ duyệt":"Pending Leave Summary"}</div>
          {pendingLeaves.length === 0 ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:160, color:th.text2, fontSize:13, flexDirection:"column", gap:8 }}>
              <CheckCircle size={32} color="#10B981"/>
              <span>{loading ? (vi?"Đang tải...":"Loading...") : (vi?"Không có đơn nghỉ chờ duyệt":"No pending leave requests")}</span>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {pendingLeaves.slice(0,4).map(l => (
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:th.tableHead, borderRadius:8 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12.5, color:th.text1 }}>{l.name}</div>
                    <div style={{ fontSize:11, color:th.text2 }}>{l.type} · {l.from} → {l.to} ({l.days} ngày)</div>
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleApprove(l.id, true)} disabled={actionLoading}
                      style={{ padding:"3px 8px", borderRadius:5, border:"none", background:"#D1FAE5", color:"#065F46", cursor:"pointer", fontSize:11.5, fontWeight:700, fontFamily:"inherit" }}>
                      <Check size={10}/> {vi?"OK":"OK"}
                    </button>
                    <button onClick={() => handleApprove(l.id, false)} disabled={actionLoading}
                      style={{ padding:"3px 8px", borderRadius:5, border:"none", background:"#FEE2E2", color:"#991B1B", cursor:"pointer", fontSize:11.5, fontWeight:700, fontFamily:"inherit" }}>
                      <X size={10}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All pending leaves table */}
      {pendingLeaves.length > 0 && (
        <div style={{ ...card, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${th.tableBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, fontSize:14, color:th.text1 }}>📅 {vi?"Tất cả đơn nghỉ chờ duyệt":"All Pending Leave Requests"}</span>
            <span style={{ fontSize:12, color:th.text2 }}>{pendingLeaves.length} {vi?"đơn":"requests"}</span>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>
              {[vi?"Nhân viên":"Employee",vi?"Loại nghỉ":"Type",vi?"Từ":"From",vi?"Đến":"To",vi?"Ngày":"Days",vi?"Thao tác":"Action"].map(c=><th key={c} style={hd}>{c}</th>)}
            </tr></thead>
            <tbody>
              {pendingLeaves.map(l => (
                <tr key={l.id}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=dark?"rgba(255,255,255,0.03)":"#FAFAFA"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}>
                  <td style={{ ...td, fontWeight:600 }}>{l.name}</td>
                  <td style={td}><span style={{ background:"#DBEAFE", color:"#1E40AF", borderRadius:10, padding:"2px 8px", fontSize:11.5, fontWeight:600 }}>{l.type}</span></td>
                  <td style={td}>{l.from}</td>
                  <td style={td}>{l.to}</td>
                  <td style={td}><b style={{ color:"#D0211C" }}>{l.days}</b></td>
                  <td style={td}>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => handleApprove(l.id, true)} disabled={actionLoading}
                        style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 9px", borderRadius:6, border:"none", background:"#D1FAE5", color:"#065F46", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                        <Check size={11}/>{vi?"Duyệt":"Approve"}
                      </button>
                      <button onClick={() => handleApprove(l.id, false)} disabled={actionLoading}
                        style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 9px", borderRadius:6, border:"none", background:"#FEE2E2", color:"#991B1B", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                        <X size={11}/>{vi?"Từ chối":"Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions — UC linked */}
      <div style={{ ...card, padding:"18px", marginTop: 16 }}>
        <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>⚡ {vi?"Chức năng theo Use Case":"Use Case Actions"}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <QuickAction icon={<CalendarDays size={18} color="#D97706"/>} label={vi?"Duyệt yêu cầu nghỉ phép":"Approve Leave Requests"} sub="UC-05" href="/leave" accent="#D97706" dark={dark}/>
          <QuickAction icon={<Clock size={18} color="#059669"/>} label={vi?"Quản lý chấm công":"Attendance Management"} sub="UC-06" href="/attendance" accent="#059669" dark={dark}/>
          <QuickAction icon={<LayoutDashboard size={18} color="#7C3AED"/>} label={vi?"Xem Dashboard thống kê":"Statistics Dashboard"} sub="UC-11" href="/dashboard-manager" accent="#7C3AED" dark={dark}/>
        </div>
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
