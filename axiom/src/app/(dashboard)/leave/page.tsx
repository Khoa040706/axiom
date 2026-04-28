/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Check, X, Clock, CheckCircle, XCircle, Calendar,
  Plus, Eye, FileText,
  User, AlignLeft, CalendarDays, AlertCircle, Loader2,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { DateInput } from "@/components/ui/date-input"
import { getLeaveRequests, approveLeave, createLeaveRequest, getAllLeaveBalances } from "@/lib/actions/leave.actions"
import { getDepartments } from "@/lib/actions/department.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useCurrentUser, useEmployeeId, useUserId } from "@/hooks/use-current-user"
import { AvatarImg } from "@/components/ui/avatar-img"
import { useSession } from "next-auth/react"
import { tLeaveType, tDept, tLeaveReason } from "@/lib/i18n-maps"

// ─── Types ────────────────────────────────────────────────
type LeaveStatus = "pending" | "approved" | "rejected"
interface LeaveRequest {
  id: number
  name: string
  userId: string
  department: string
  avatarPath?: string | null
  type: string
  from: string   // dd/MM/yyyy
  to: string
  days: number
  reason: string
  note: string
  status: LeaveStatus
  approver: string | null
  approvedAt: string | null
  createdAt: string  // dd/MM/yyyy HH:mm
}

// Internal VI values used for form state & DB
const LEAVE_TYPES_FORM = [
  { vi: "Nghỉ phép năm",  en: "Annual Leave",    bg: "#DBEAFE", c: "#1E40AF" },
  { vi: "Nghỉ lễ",        en: "Public Holiday",  bg: "#D1FAE5", c: "#065F46" },
  { vi: "Việc riêng",     en: "Personal Leave",  bg: "#FEF3C7", c: "#92400E" },
  { vi: "Nghỉ bệnh",      en: "Sick Leave",      bg: "#FCE7F3", c: "#9D174D" },
  { vi: "Nghỉ thai sản",  en: "Maternity Leave", bg: "#EDE9FE", c: "#5B21B6" },
  { vi: "Nghỉ không lương",en: "Unpaid Leave",   bg: "#F3F4F6", c: "#374151" },
]

// Color badge lookup — accent-insensitive via normStr
function normStr(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

const LEAVE_COLOR: Array<{ norm: string; bg: string; c: string }> = LEAVE_TYPES_FORM.map(t => ({
  norm: normStr(t.vi), bg: t.bg, c: t.c,
}))

function getLeaveColor(typeVi: string): { bg: string; c: string } {
  return LEAVE_COLOR.find(x => x.norm === normStr(typeVi))
    ?? LEAVE_COLOR.find(x => normStr(typeVi).includes(x.norm.split(" ")[1] ?? ""))
    ?? { bg: "#F3F4F6", c: "#374151" }
}

function EmpAvatar({ name, avatarPath, size = 34 }: { name: string; avatarPath?: string | null; size?: number }) {
  return <AvatarImg src={avatarPath} name={name} alt={name} size={size} />
}

// ─── Utilities ────────────────────────────────────────────
function toDateObj(s: string): Date {
  const [d, m, y] = s.split("/").map(Number)
  return new Date(y, m - 1, d)
}
function countWeekdays(from: string, to: string): number {
  const start = toDateObj(from), end = toDateObj(to)
  let count = 0, cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return Math.max(count, 1)
}
function nowStr(): string {
  const now = new Date()
  const d = String(now.getDate()).padStart(2,"0")
  const m = String(now.getMonth()+1).padStart(2,"0")
  const y = now.getFullYear()
  const hh = String(now.getHours()).padStart(2,"0")
  const mm = String(now.getMinutes()).padStart(2,"0")
  return `${d}/${m}/${y} ${hh}:${mm}`
}
function toInputDate(ddMMyyyy: string): string {
  const [d,m,y] = ddMMyyyy.split("/")
  return `${y}-${m}-${d}`
}
function fromInputDate(yyyyMMdd: string): string {
  const [y,m,d] = yyyyMMdd.split("-")
  return `${d}/${m}/${y}`
}

// ─── Status Badge ─────────────────────────────────────────
function StatusBadge({ status, vi }: { status: LeaveStatus; vi: boolean }) {
  const MAP = {
    pending:  { bg:"#FEF3C7", c:"#92400E", lv:"Chờ duyệt", le:"Pending"  },
    approved: { bg:"#D1FAE5", c:"#065F46", lv:"Đã duyệt",  le:"Approved" },
    rejected: { bg:"#FEE2E2", c:"#991B1B", lv:"Từ chối",   le:"Rejected" },
  }
  const s = MAP[status]
  return (
    <span style={{ background:s.bg, color:s.c, borderRadius:12, padding:"3px 10px", fontSize:12, fontWeight:600 }}>
      {vi ? s.lv : s.le}
    </span>
  )
}

// ─── Main ─────────────────────────────────────────────────
export default function LeavePage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()
  const { data: session } = useSession()
  const currentUser = useCurrentUser()
  const sessionEmployeeId = useEmployeeId()
  const sessionUserId = useUserId()
  const userRole = session?.user?.role ?? "Employee"
  const isManager = ["Admin", "HRManager", "Manager", "Director"].includes(userRole)

  const [leaves, setLeaves]       = useState<LeaveRequest[]>([])
  const [quota, setQuota]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState("all")
  const [showCreate, setShowCreate] = useState(false)
  const [viewItem, setViewItem]   = useState<LeaveRequest | null>(null)
  const [toast, setToast]         = useState<{type:"success"|"error"; msg:string}|null>(null)
  const [quotaPage, setQuotaPage] = useState(0)
  const QUOTA_PER_PAGE = 6

  // Create form state
  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0]
  const [form, setForm] = useState({
    type:    LEAVE_TYPES_FORM[0].vi,
    from:    today,
    to:      tomorrow,
    reason:  "",
    note:    "",
  })
  const [submitting, setSubmitting] = useState(false)

  // ── Load từ DB ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    const currentYear = new Date().getFullYear()
    const [leavesRes, quotaRes] = await Promise.all([
      getLeaveRequests({ year: currentYear }),
      getAllLeaveBalances(currentYear),
    ])
    if (leavesRes.success && leavesRes.data) {
      let allLeaves = (leavesRes.data as any[]).map(l => ({
        id:         l.id,
        name:       l.employee?.fullName ?? "—",
        userId:     l.employee?.code ?? "",
        department: l.employee?.department?.name ?? "—",
        avatarPath: l.employee?.avatarPath ?? null,
        type:       l.leaveType,
        from:       new Date(l.startDate).toLocaleDateString("vi-VN"),
        to:         new Date(l.endDate).toLocaleDateString("vi-VN"),
        days:       l.totalDays,
        reason:     l.reason ?? "",
        note:       l.note ?? "",
        status:     l.status === "Đã duyệt" ? "approved" : l.status === "Từ chối" ? "rejected" : "pending",
        approver:   null,
        approvedAt: null,
        createdAt:  new Date(l.createdAt).toLocaleDateString("vi-VN"),
        employeeId: l.employeeId,
      } as LeaveRequest & { employeeId: number }))
      // Nhân viên thường chỉ thấy đơn của bản thân
      if (!isManager && sessionEmployeeId) {
        allLeaves = allLeaves.filter((l: any) => l.employeeId === sessionEmployeeId)
      }
      setLeaves(allLeaves)
    }
    if (quotaRes.success && quotaRes.data) {
      let allQuota = (quotaRes.data as any[]).map(q => ({
        name:  q.employee?.fullName ?? "—",
        total: q.totalDays,
        used:  q.usedDays,
        left:  q.totalDays - q.usedDays,
        employeeId: q.employeeId,
      }))
      // Nhân viên chỉ thấy quota của bản thân
      if (!isManager && sessionEmployeeId) {
        allQuota = allQuota.filter((q: any) => q.employeeId === sessionEmployeeId)
      }
      setQuota(allQuota)
    }
    setLoading(false)
  }, [isManager, sessionEmployeeId])

  useEffect(() => { loadData() }, [loadData])

  const showToast = useCallback((type:"success"|"error", msg:string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Computed days
  const computedDays = countWeekdays(
    fromInputDate(form.from),
    fromInputDate(form.to)
  )

  // Derived stats
  const pending  = leaves.filter(l => l.status==="pending").length
  const approved = leaves.filter(l => l.status==="approved").length
  const rejected = leaves.filter(l => l.status==="rejected").length
  const totalDays = leaves.filter(l => l.status==="approved").reduce((s,l) => s + Number(l.days), 0)

  const filtered = leaves.filter(l =>
    tab==="all" ? true : l.status===tab
  )

  // ── Handlers ─────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.from || !form.to) { showToast("error", vi?"Chọn ngày bắt đầu và kết thúc":"Select date range"); return }
    if (form.from > form.to)   { showToast("error", vi?"Ngày bắt đầu phải trước ngày kết thúc":"Start must be before end"); return }
    if (!form.reason.trim())   { showToast("error", vi?"Nhập lý do nghỉ phép":"Enter leave reason"); return }

    setSubmitting(true)
    const empId = sessionEmployeeId ?? 1
    const res = await createLeaveRequest({
      employeeId: empId,
      leaveType:  form.type,
      startDate:  form.from,
      endDate:    form.to,
      totalDays:  computedDays,
      reason:     form.reason.trim(),
      note:       form.note.trim(),
    })
    if (res.success) {
      showToast("success", vi?"Tạo đơn nghỉ phép thành công!":"Leave request submitted!")
      setShowCreate(false)
      setForm({ type: LEAVE_TYPES_FORM[0].vi, from: today, to: tomorrow, reason: "", note: "" })
      loadData()
    } else {
      showToast("error", vi?"Có lỗi xảy ra, vui lòng thử lại":"An error occurred")
    }
    setSubmitting(false)
  }

  const handleApprove = async (id: number) => {
    const approverId = sessionUserId ?? 1
    const approverName = currentUser?.name ?? "Admin"
    await approveLeave(id, approverId, true)
    setLeaves(prev => prev.map(l => l.id===id ? { ...l, status:"approved" as const, approver: approverName, approvedAt: nowStr() } : l))
    showToast("success", vi?"Đã duyệt đơn nghỉ phép":"Leave request approved")
    if (viewItem?.id===id) setViewItem(v => v ? { ...v, status:"approved" as const } : v)
  }

  const handleReject = async (id: number) => {
    const approverId = sessionUserId ?? 1
    const approverName = currentUser?.name ?? "Admin"
    await approveLeave(id, approverId, false)
    setLeaves(prev => prev.map(l => l.id===id ? { ...l, status:"rejected" as const, approver: approverName, approvedAt: nowStr() } : l))
    showToast("success", vi?"Đã từ chối đơn nghỉ phép":"Leave request rejected")
    if (viewItem?.id===id) setViewItem(v => v ? { ...v, status:"rejected" as const } : v)
  }

  // ── Styles ───────────────────────────────────────────────
  const hd: React.CSSProperties = {
    padding:"10px 14px", fontSize:12, fontWeight:600,
    color:th.tableHeadText, background:th.tableHead,
    borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left", whiteSpace:"nowrap"
  }
  const td: React.CSSProperties = {
    padding:"12px 14px", fontSize:13, color:th.text1,
    borderBottom:`1px solid ${th.tableBorder}`, verticalAlign:"middle"
  }
  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"9px 13px", borderRadius:9,
    border:`1.5px solid ${th.inputBorder}`, background:th.inputBg,
    color:th.text1, fontSize:13.5, outline:"none", fontFamily:"inherit",
    transition:"border-color .15s", boxSizing:"border-box",
  }
  const labelStyle: React.CSSProperties = {
    fontSize:11.5, fontWeight:700, color:th.text2,
    letterSpacing:"0.02em",
    marginBottom:6, display:"block",
  }

  const TABS = [
    { k:"all",      l:vi?"Tất cả":"All",        count: leaves.length },
    { k:"pending",  l:vi?"Chờ duyệt":"Pending", count: pending  },
    { k:"approved", l:vi?"Đã duyệt":"Approved", count: approved },
    { k:"rejected", l:vi?"Từ chối":"Rejected",  count: rejected },
  ]

  const statCards = [
    { icon:<Clock size={20} color="#F59E0B"/>,       label:vi?"Chờ duyệt":"Pending",    value:pending,  accent:"#F59E0B" },
    { icon:<CheckCircle size={20} color="#10B981"/>, label:vi?"Đã duyệt":"Approved",   value:approved, accent:"#10B981" },
    { icon:<XCircle size={20} color="#EF4444"/>,     label:vi?"Từ chối":"Rejected",     value:rejected, accent:"#EF4444" },
    { icon:<Calendar size={20} color="#3B82F6"/>,    label:vi?"Tổng ngày đã duyệt":"Approved Days", value:totalDays, accent:"#3B82F6" },
  ]

  return (
    <div className="page-pad">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 22, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Quản lý nghỉ phép":"Leave Management"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi?"Tạo và quản lý đơn xin nghỉ phép.":"Create and manage leave requests."}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background:"linear-gradient(135deg, #D0211C, #991414)",
            color:"#fff", border:"none", borderRadius:10,
            padding:"10px 18px", fontSize:13.5, fontWeight:700,
            cursor:"pointer", fontFamily:"inherit",
            boxShadow:"0 4px 14px rgba(208,33,28,0.32)",
            display:"flex", alignItems:"center", gap:8,
            transition:"transform .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform="translateY(-1px)")}
          onMouseLeave={e => (e.currentTarget.style.transform="none")}
        >
          <Plus size={16}/>
          {vi?"Tạo đơn nghỉ phép":"Create Leave Request"}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="rg-4" style={{ marginBottom: 20 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background:th.cardBg, borderRadius:14, padding:"16px 18px",
            borderTop:`1px solid ${th.cardBorder}`, borderRight:`1px solid ${th.cardBorder}`, borderBottom:`1px solid ${th.cardBorder}`, borderLeft:`4px solid ${s.accent}`,
            display:"flex", alignItems:"center", gap:14,
            boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:`${s.accent}15`, pointerEvents:"none" }}/>
            <div style={{ width:42, height:42, borderRadius:10, background:dark?`${s.accent}22`:`${s.accent}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize:12, color:th.text2 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:s.accent }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="tabs-row">
        {TABS.map(({k,l,count}) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding:"7px 16px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:13, fontWeight: tab===k ? 700 : 400, fontFamily:"inherit",
            background: tab===k ? "#D0211C" : th.cardBg,
            color:       tab===k ? "#fff"    : th.text2,
            boxShadow:   tab===k ? "0 2px 8px rgba(208,33,28,0.25)" : "none",
            transition:"all .15s",
            display:"flex", alignItems:"center", gap:6,
          }}>
            {l}
            <span style={{
              background: tab===k ? "rgba(255,255,255,0.25)" : th.tableHead,
              color:       tab===k ? "#fff" : th.text2,
              borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:700,
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background:th.cardBg, borderRadius:14,
        border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", marginBottom:20 }}>
        <div className="table-scroll">
        <table style={{ width:"100%", minWidth: 700, borderCollapse:"collapse" }}>
          <thead><tr>
            {[vi?"Nhân viên":"Employee", vi?"Loại nghỉ":"Type", vi?"Từ ngày":"From", vi?"Đến ngày":"To",
              vi?"Số ngày":"Days", vi?"Lý do":"Reason", vi?"Nộp lúc":"Submitted", vi?"Trạng thái":"Status", vi?"Thao tác":"Actions"
            ].map(c => <th key={c} style={hd}>{c}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ ...td, textAlign:"center", padding:"40px", color:th.text2 }}>
                <FileText size={36} style={{ opacity:.3, marginBottom:8, display:"block", margin:"0 auto 8px" }}/>
                {vi?"Không có đơn nghỉ phép nào":"No leave requests found"}
              </td></tr>
            )}
            {filtered.map(l => (
              <tr key={l.id} style={{ transition:"background .12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={td}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <EmpAvatar name={l.name} avatarPath={l.avatarPath} size={34}/>
                    <div>
                      <div style={{ fontWeight:600 }}>{l.name}</div>
                      <div style={{ fontSize:11.5, color:th.text2 }}>{tDept(l.department, vi)}</div>
                    </div>
                  </div>
                </td>
                <td style={td}>
                  {(() => {
                    const col = getLeaveColor(l.type)
                    return (
                      <span style={{ background: col.bg, color: col.c, borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {tLeaveType(l.type, vi)}
                      </span>
                    )
                  })()}
                </td>
                <td style={td}><span style={{ fontSize:13 }}>{l.from}</span></td>
                <td style={td}><span style={{ fontSize:13 }}>{l.to}</span></td>
                <td style={td}>
                  <span style={{ fontWeight:700, color:"#D0211C", fontSize:15 }}>{l.days}</span>
                  <span style={{ fontSize:11, color:th.text2 }}> {vi ? "ngày" : (Number(l.days) === 1 ? "day" : "days")}</span>
                </td>
                <td style={{ ...td, maxWidth:160 }}>
                  <span style={{ color:th.text2, fontSize:12.5, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {tLeaveReason(l.reason, vi)}
                  </span>
                </td>
                <td style={td}><span style={{ fontSize:12, color:th.text2 }}>{l.createdAt}</span></td>
                <td style={td}><StatusBadge status={l.status} vi={vi}/></td>
                <td style={td}>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    {isManager && l.status==="pending" && <>
                      <button
                        onClick={() => handleApprove(l.id)}
                        title={vi?"Duyệt":"Approve"}
                        style={{ width:30, height:30, borderRadius:7, border:"none", background:"#D1FAE5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .1s" }}
                        onMouseEnter={e => (e.currentTarget.style.transform="scale(1.1)")}
                        onMouseLeave={e => (e.currentTarget.style.transform="none")}
                      >
                        <Check size={14} color="#065F46"/>
                      </button>
                      <button
                        onClick={() => handleReject(l.id)}
                        title={vi?"Từ chối":"Reject"}
                        style={{ width:30, height:30, borderRadius:7, border:"none", background:"#FEE2E2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .1s" }}
                        onMouseEnter={e => (e.currentTarget.style.transform="scale(1.1)")}
                        onMouseLeave={e => (e.currentTarget.style.transform="none")}
                      >
                        <X size={14} color="#DC2626"/>
                      </button>
                    </>}
                    <button
                      onClick={() => setViewItem(l)}
                      style={{ display:"flex", alignItems:"center", gap:4, fontSize:12.5, color:"#3B82F6", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:"4px 8px", borderRadius:6, transition:"background .12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background="#EFF6FF")}
                      onMouseLeave={e => (e.currentTarget.style.background="none")}
                    >
                      <Eye size={13}/>{vi?"Chi tiết":"Details"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── Leave quota ── */}
      <div style={{ background:th.cardBg, borderRadius:14, border:`1px solid ${th.cardBorder}`, padding:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:700, color:th.text1, fontSize:15, display:"flex", alignItems:"center", gap:8 }}>
            <CalendarDays size={18} color="#D0211C"/>
            {vi ? "Quỹ phép còn lại" : "Remaining Leave Quota"}
            <span style={{ fontSize:12, fontWeight:500, color:th.text2 }}>({quota.length} {vi ? "nhân viên" : "employees"})</span>
          </div>
          {/* Pagination controls */}
          {quota.length > QUOTA_PER_PAGE && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button
                onClick={() => setQuotaPage(p => Math.max(0, p - 1))}
                disabled={quotaPage === 0}
                style={{
                  width:30, height:30, borderRadius:8, border:`1px solid ${th.cardBorder}`,
                  background: quotaPage === 0 ? th.tableHead : th.cardBg,
                  color: quotaPage === 0 ? th.text3 : th.text1,
                  cursor: quotaPage === 0 ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s",
                }}
              >
                &#8249;
              </button>
              <span style={{ fontSize:12.5, color:th.text2, fontWeight:600, minWidth:60, textAlign:"center" }}>
                {quotaPage + 1} / {Math.ceil(quota.length / QUOTA_PER_PAGE)}
              </span>
              <button
                onClick={() => setQuotaPage(p => Math.min(Math.ceil(quota.length / QUOTA_PER_PAGE) - 1, p + 1))}
                disabled={quotaPage >= Math.ceil(quota.length / QUOTA_PER_PAGE) - 1}
                style={{
                  width:30, height:30, borderRadius:8, border:`1px solid ${th.cardBorder}`,
                  background: quotaPage >= Math.ceil(quota.length / QUOTA_PER_PAGE) - 1 ? th.tableHead : th.cardBg,
                  color: quotaPage >= Math.ceil(quota.length / QUOTA_PER_PAGE) - 1 ? th.text3 : th.text1,
                  cursor: quotaPage >= Math.ceil(quota.length / QUOTA_PER_PAGE) - 1 ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s",
                }}
              >
                &#8250;
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:24, color:th.text2 }}>
            <Loader2 size={20} style={{ animation:"spin 1s linear infinite" }}/>
          </div>
        ) : quota.length === 0 ? (
          <div style={{ textAlign:"center", padding:32, color:th.text2, fontSize:13 }}>
            {vi ? "Chưa có dữ liệu" : "No data available"}
          </div>
        ) : (
          <>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:14 }}>
              {quota
                .slice(quotaPage * QUOTA_PER_PAGE, (quotaPage + 1) * QUOTA_PER_PAGE)
                .map(q => (
                  <div key={q.name} style={{ background:th.tableHead, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ fontWeight:600, color:th.text1, fontSize:13, marginBottom:8 }}>{q.name}</div>
                    <div style={{ display:"flex", gap:16, fontSize:12, color:th.text2, marginBottom:8 }}>
                      <span>{vi?"Tổng phép":"Total"} <b style={{ color:th.text1 }}>{q.total}</b></span>
                      <span>{vi?"Đã dùng":"Used"} <b style={{ color:"#F59E0B" }}>{q.used}</b></span>
                      <span>{vi?"Còn lại":"Left"} <b style={{ color:"#10B981" }}>{q.left}</b></span>
                    </div>
                    <div style={{ background:th.tableBorder, borderRadius:4, height:6, overflow:"hidden" }}>
                      <div style={{ width:`${Math.min((q.used/q.total)*100, 100)}%`, background:q.left<=3?"#EF4444":"#10B981", height:"100%", borderRadius:4, transition:"width .5s" }}/>
                    </div>
                  </div>
                ))}
            </div>

            {/* Dot indicators */}
            {quota.length > QUOTA_PER_PAGE && (
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
                {Array.from({ length: Math.ceil(quota.length / QUOTA_PER_PAGE) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuotaPage(i)}
                    style={{
                      width: i === quotaPage ? 20 : 8, height:8, borderRadius:4, border:"none",
                      background: i === quotaPage ? "#D0211C" : th.cardBorder,
                      cursor:"pointer", padding:0, transition:"all .2s",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════ MODAL: Tạo đơn nghỉ phép ══════════ */}
      {showCreate && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:9000 }} onClick={() => setShowCreate(false)} />
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:9001 }}>
            <div style={{
              background:th.cardBg, borderRadius:22, width:"min(560px,95vw)",
              boxShadow:"0 24px 60px rgba(0,0,0,0.35)", overflow:"hidden",
              animation:"fadeDown .2s ease",
            }} onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div style={{
                background:"linear-gradient(135deg, rgba(208,33,28,0.1), rgba(153,20,20,0.05))",
                borderBottom:`1px solid ${th.tableBorder}`,
                padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#D0211C,#991414)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                    <FileText size={18}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:th.text1 }}>{vi?"Tạo đơn nghỉ phép":"New Leave Request"}</div>
                    <div style={{ fontSize:12, color:th.text2, marginTop:1 }}>Admin · AXIOM HRM</div>
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${th.cardBorder}`, background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:th.text2 }}>
                  <X size={16}/>
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding:"24px", display:"grid", gap:18 }}>

                {/* Loại nghỉ phép */}
                <div>
                  <label style={labelStyle}><AlignLeft size={12} style={{ display:"inline", marginRight:4 }}/>{vi?"Loại nghỉ phép":"Leave Type"} <span style={{ color:"#EF4444" }}>*</span></label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {LEAVE_TYPES_FORM.map(t => (
                      <button key={t.vi} onClick={() => setForm(f => ({ ...f, type:t.vi }))} style={{
                        padding:"8px 10px", borderRadius:9, border:`2px solid ${form.type===t.vi ? t.c : th.inputBorder}`,
                        background: form.type===t.vi ? t.bg : th.inputBg,
                        color: form.type===t.vi ? t.c : th.text2,
                        cursor:"pointer", fontSize:12.5, fontWeight: form.type===t.vi ? 700 : 400,
                        fontFamily:"inherit", transition:"all .15s", textAlign:"center",
                      }}>
                        {vi ? t.vi : t.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Từ ngày — Đến ngày */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <label style={labelStyle}><CalendarDays size={12} style={{ display:"inline", marginRight:4 }}/>{vi?"Từ ngày":"From Date"} <span style={{ color:"#EF4444" }}>*</span></label>
                    <DateInput
                      style={inputStyle}
                      value={form.from}
                      min={today}
                      onChange={e => {
                        const v = e.target.value
                        setForm(f => ({ ...f, from:v, to: f.to < v ? v : f.to }))
                      }}
                      onFocus={e => ((e.target as HTMLInputElement).style.borderColor="#D0211C")}
                      onBlur={e => ((e.target as HTMLInputElement).style.borderColor=th.inputBorder)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}><CalendarDays size={12} style={{ display:"inline", marginRight:4 }}/>{vi?"Đến ngày":"To Date"} <span style={{ color:"#EF4444" }}>*</span></label>
                    <DateInput
                      style={inputStyle}
                      value={form.to}
                      min={form.from}
                      onChange={e => setForm(f => ({ ...f, to:e.target.value }))}
                      onFocus={e => ((e.target as HTMLInputElement).style.borderColor="#D0211C")}
                      onBlur={e => ((e.target as HTMLInputElement).style.borderColor=th.inputBorder)}
                    />
                  </div>
                </div>

                {/* Số ngày computed */}
                <div style={{ background:dark?"rgba(208,33,28,0.1)":"#FEF2F2", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                  <Calendar size={16} color="#D0211C"/>
                  <span style={{ fontSize:13, color:th.text1 }}>
                    {vi?"Số ngày nghỉ (ngày làm việc):":"Working days off:"}
                    <strong style={{ fontSize:18, color:"#D0211C", marginLeft:8 }}>{computedDays}</strong>
                    <span style={{ fontSize:12, color:th.text2, marginLeft:4 }}>{vi?"ngày":"days"}</span>
                  </span>
                </div>

                {/* Lý do */}
                <div>
                  <label style={labelStyle}><AlignLeft size={12} style={{ display:"inline", marginRight:4 }}/>{vi?"Lý do":"Reason"} <span style={{ color:"#EF4444" }}>*</span></label>
                  <input
                    type="text" style={inputStyle}
                    placeholder={vi?"Nhập lý do nghỉ phép...":"Enter reason for leave..."}
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason:e.target.value }))}
                    onFocus={e => (e.target.style.borderColor="#D0211C")}
                    onBlur={e => (e.target.style.borderColor=th.inputBorder)}
                  />
                </div>

                {/* Ghi chú */}
                <div>
                  <label style={labelStyle}><AlignLeft size={12} style={{ display:"inline", marginRight:4 }}/>{vi?"Ghi chú (tuỳ chọn)":"Notes (optional)"}</label>
                  <textarea
                    rows={3} style={{ ...inputStyle, resize:"vertical", lineHeight:1.5 }}
                    placeholder={vi?"Thêm thông tin bổ sung nếu cần...":"Additional information if needed..."}
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note:e.target.value }))}
                    onFocus={e => (e.target.style.borderColor="#D0211C")}
                    onBlur={e => (e.target.style.borderColor=th.inputBorder)}
                  />
                </div>

                {/* Info box */}
                <div style={{ background:dark?"rgba(59,130,246,0.1)":"#EFF6FF", borderRadius:10, padding:"11px 14px", fontSize:12.5, color:dark?"#93C5FD":"#1D4ED8", display:"flex", gap:8 }}>
                  <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }}/>
                  <span>{vi?"Đơn sẽ được gửi đến quản lý để xét duyệt. Bạn có thể theo dõi trạng thái trong danh sách.":"The request will be sent to your manager for approval. Track status in the list below."}</span>
                </div>

                {/* Buttons */}
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
                  <button onClick={() => setShowCreate(false)} style={{ padding:"10px 20px", borderRadius:10, border:`1.5px solid ${th.cardBorder}`, background:"none", cursor:"pointer", color:th.text2, fontSize:13.5, fontWeight:600, fontFamily:"inherit" }}>
                    {vi?"Huỷ":"Cancel"}
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={submitting}
                    style={{
                      padding:"10px 24px", borderRadius:10, border:"none",
                      background: submitting ? "#e05050" : "linear-gradient(135deg,#D0211C,#991414)",
                      color:"#fff", cursor: submitting ? "not-allowed" : "pointer",
                      fontSize:13.5, fontWeight:700, fontFamily:"inherit",
                      boxShadow:"0 4px 14px rgba(208,33,28,0.3)",
                      display:"flex", alignItems:"center", gap:8,
                      transition:"all .15s",
                    }}
                    onMouseEnter={e => { if(!submitting) (e.currentTarget as HTMLElement).style.transform="translateY(-1px)" }}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform="none")}
                  >
                    {submitting ? (
                      <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>{vi?"Đang gửi...":"Submitting..."}</>
                    ) : (
                      <><FileText size={15}/>{vi?"Nộp đơn":"Submit Request"}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════ MODAL: Chi tiết đơn ══════════ */}
      {viewItem && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:9000 }} onClick={() => setViewItem(null)} />
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:9001 }}>
            <div style={{
              background:th.cardBg, borderRadius:22, width:"min(500px,95vw)",
              boxShadow:"0 24px 60px rgba(0,0,0,0.35)", overflow:"hidden",
              animation:"fadeDown .2s ease",
            }} onClick={e => e.stopPropagation()}>

              {/* Detail header */}
              <div style={{ background:"linear-gradient(135deg,#991414,#D0211C)", padding:"22px 24px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:4 }}>{vi?"Chi tiết đơn #":"Request #"}{viewItem.id}</div>
                    <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>{tLeaveType(viewItem.type, vi)}</div>
                    <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginTop:4 }}>
                      {viewItem.from} → {viewItem.to} · <b style={{ color:"#fff" }}>{viewItem.days}</b> {vi?"ngày":"days"}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                    <button onClick={() => setViewItem(null)} style={{ width:32, height:32, borderRadius:8, border:"1px solid rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                      <X size={16}/>
                    </button>
                    <StatusBadge status={viewItem.status} vi={vi}/>
                  </div>
                </div>
              </div>

              {/* Detail body */}
              <div style={{ padding:"20px 24px", display:"grid", gap:14 }}>
                {/* Row: employee */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div style={{ background:th.tableHead, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:11, color:th.text2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4, display:"flex", gap:5, alignItems:"center" }}>
                      <User size={11}/>{vi?"Người nộp":"Requester"}
                    </div>
                    <div style={{ fontWeight:700, color:th.text1, fontSize:14 }}>{viewItem.name}</div>
                    <div style={{ fontSize:12, color:th.text2 }}>{tDept(viewItem.department, vi)}</div>
                  </div>
                  <div style={{ background:th.tableHead, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:11, color:th.text2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4, display:"flex", gap:5, alignItems:"center" }}>
                      <Clock size={11}/>{vi?"Ngày nộp":"Submitted"}
                    </div>
                    <div style={{ fontWeight:600, color:th.text1, fontSize:13 }}>{viewItem.createdAt}</div>
                  </div>
                </div>

                {/* Reason */}
                <div style={{ background:th.tableHead, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:11, color:th.text2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6, display:"flex", gap:5, alignItems:"center" }}>
                    <AlignLeft size={11}/>{vi?"Lý do":"Reason"}
                  </div>
                  <div style={{ color:th.text1, fontSize:14, lineHeight:1.6 }}>{tLeaveReason(viewItem.reason, vi)}</div>
                </div>

                {/* Note */}
                {viewItem.note && (
                  <div style={{ background:th.tableHead, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:11, color:th.text2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{vi?"Ghi chú":"Notes"}</div>
                    <div style={{ color:th.text2, fontSize:13.5, lineHeight:1.6 }}>{viewItem.note}</div>
                  </div>
                )}

                {/* Approver */}
                {viewItem.approver && (
                  <div style={{ background: viewItem.status==="approved" ? "#F0FDF4" : "#FEF2F2", borderRadius:10, padding:"12px 14px", border:`1px solid ${viewItem.status==="approved"?"#A7F3D0":"#FECACA"}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {viewItem.status==="approved" ? <CheckCircle size={17} color="#10B981"/> : <XCircle size={17} color="#EF4444"/>}
                      <div>
                        <div style={{ fontWeight:700, fontSize:13.5, color: viewItem.status==="approved"?"#065F46":"#991B1B" }}>
                          {vi ? (viewItem.status==="approved"?"Đã duyệt bởi:":"Từ chối bởi:") : (viewItem.status==="approved"?"Approved by:":"Rejected by:")} {viewItem.approver}
                        </div>
                        <div style={{ fontSize:12, color:th.text2, marginTop:2 }}>{viewItem.approvedAt}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons for manager */}
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  {isManager && viewItem.status==="pending" && (
                    <>
                      <button
                        onClick={() => handleReject(viewItem.id)}
                        style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:10, border:"none", background:"#FEE2E2", color:"#991B1B", cursor:"pointer", fontSize:13.5, fontWeight:700, fontFamily:"inherit" }}
                      >
                        <X size={15}/>{vi?"Từ chối":"Reject"}
                      </button>
                      <button
                        onClick={() => handleApprove(viewItem.id)}
                        style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#10B981,#059669)", color:"#fff", cursor:"pointer", fontSize:13.5, fontWeight:700, fontFamily:"inherit", boxShadow:"0 4px 12px rgba(16,185,129,0.3)" }}
                      >
                        <Check size={15}/>{vi?"Duyệt đơn":"Approve"}
                      </button>
                    </>
                  )}
                  {!(isManager && viewItem.status==="pending") && (
                    <button onClick={() => setViewItem(null)} style={{ padding:"10px 20px", borderRadius:10, border:`1.5px solid ${th.cardBorder}`, background:"none", cursor:"pointer", color:th.text2, fontSize:13.5, fontWeight:600, fontFamily:"inherit" }}>
                      {vi?"Đóng":"Close"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:32, right:32, zIndex:9999,
          background: toast.type==="success" ? "#10B981" : "#EF4444",
          color:"#fff", padding:"13px 20px", borderRadius:14,
          display:"flex", alignItems:"center", gap:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.2)",
          animation:"fadeDown .2s ease", fontSize:14, fontWeight:600, maxWidth:340,
        }}>
          {toast.type==="success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  )
}
