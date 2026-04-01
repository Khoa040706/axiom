/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useCallback } from "react"
import { Calendar, Clock, DollarSign, FileText, CheckCircle, AlertCircle, Briefcase, ChevronRight } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useCurrentUser, useEmployeeId } from "@/hooks/use-current-user"
import { getAttendanceByMonth } from "@/lib/actions/attendance.actions"
import { getLeaveBalance, getLeaveRequests } from "@/lib/actions/leave.actions"
import { getEmployeePayroll } from "@/lib/actions/payroll.actions"
import { createLeaveRequest } from "@/lib/actions/leave.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export default function EmployeeDashboard() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const user = useCurrentUser()
  const employeeId = useEmployeeId()
  const { isMobile } = useBreakpoint()

  // State dữ liệu từ DB
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaveBalance, setLeaveBalance] = useState<any[]>([])
  const [payroll, setPayroll] = useState<any | null>(null)
  const [recentLeaves, setRecentLeaves] = useState<any[]>([])

  // State form nghỉ phép
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveType, setLeaveType] = useState("Nghỉ phép năm")
  const [leaveFrom, setLeaveFrom] = useState("")
  const [leaveTo, setLeaveTo] = useState("")
  const [leaveReason, setLeaveReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const now = new Date()

  // Load dữ liệu từ DB
  useEffect(() => {
    if (!employeeId) return
    const y = now.getFullYear()
    const m = now.getMonth() + 1

    // Attendance tháng này
    getAttendanceByMonth(m, y).then(res => {
      if (res.success) {
        const mine = (res.data as any[]).filter((r: any) => r.employeeId === employeeId)
        setAttendance(mine.slice(0, 5))
      }
    })

    // Leave balance
    getLeaveBalance(employeeId, y).then(res => {
      if (res.success) setLeaveBalance(res.data as any[])
    })

    // Payroll tháng này
    getEmployeePayroll(employeeId, m, y).then(res => {
      if (res.success) setPayroll(res.data)
    })

    // Recent leave requests
    getLeaveRequests({ employeeId, year: y }).then(res => {
      if (res.success) setRecentLeaves((res.data as any[]).slice(0, 3))
    })
  }, [employeeId])

  const card: React.CSSProperties = {
    background: th.cardBg, borderRadius: 14,
    border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
  }

  const handleSubmitLeave = useCallback(async () => {
    if (!leaveFrom || !leaveTo || !leaveReason.trim() || !employeeId) return
    setSubmitting(true)
    const res = await createLeaveRequest({
      employeeId,
      leaveType,
      startDate: leaveFrom,
      endDate: leaveTo,
      reason: leaveReason,
      requestDate: today,
    })
    setSubmitting(false)
    if (res.success) {
      setSubmitted(true)
      setShowLeaveForm(false)
      setTimeout(() => setSubmitted(false), 4000)
      // Refresh leave data
      const y = now.getFullYear()
      getLeaveRequests({ employeeId, year: y }).then(r => {
        if (r.success) setRecentLeaves((r.data as any[]).slice(0, 3))
      })
    }
  }, [employeeId, leaveFrom, leaveTo, leaveReason, leaveType, today])

  // Tính stats chấm công
  const ontimeCount = attendance.filter(a => a.status === "Đúng giờ" || a.status === "Ra sớm").length
  const ontimeRate  = attendance.length ? Math.round((ontimeCount / attendance.length) * 100) : 0
  const totalLeaveLeft = leaveBalance.reduce((s, b) => s + (b.remaining ?? 0), 0)
  const netSalary = payroll ? Number(payroll.netSalary ?? 0) : 0

  return (
    <div className="page-pad">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: th.text1, margin: 0 }}>
          👋 {vi ? `Xin chào, ${user?.name ?? "Nhân viên"}!` : `Hello, ${user?.name ?? "Employee"}!`}
        </h1>
        <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
          {user?.roleLabel || user?.department} · {vi ? `Tháng ${now.getMonth()+1}/${now.getFullYear()}` : `${now.toLocaleString("en-US",{month:"long"})} ${now.getFullYear()}`}
        </p>
      </div>

      {/* Quick summary cards */}
      <div className="stat-row" style={{ marginBottom: 18 }}>
        {[
          { icon: <Clock size={22} color="#D0211C"/>,      label: vi?"Ngày công tháng này":"Days Worked",   value: `${attendance.length} ngày`, sub: vi?"Hôm nay":"This month", bg:"#FEF2F2", bgd:"rgba(208,33,28,0.08)" },
          { icon: <CheckCircle size={22} color="#10B981"/>, label: vi?"Tỷ lệ đúng giờ":"On-time Rate",      value: `${ontimeRate}%`,   sub: vi?"Đúng giờ":"On-time",         bg:"#F0FDF4", bgd:"rgba(16,185,129,0.08)" },
          { icon: <Calendar size={22} color="#8B5CF6"/>,    label: vi?"Phép còn lại":"Leave Left",          value: `${totalLeaveLeft} ngày`, sub: vi?"Tổng hợp":"Total",     bg:"#EDE9FE", bgd:"rgba(139,92,246,0.08)" },
          { icon: <DollarSign size={22} color="#059669"/>,  label: vi?`Lương Net tháng ${now.getMonth()+1}`:`Month ${now.getMonth()+1} Net`, value: netSalary ? `${(netSalary/1_000_000).toFixed(1)}M` : "—", sub: vi?"Sau khấu trừ":"After deduct", bg:"#F0FDF4", bgd:"rgba(5,150,105,0.08)" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: dark?s.bgd:s.bg, borderRadius: 14, padding: "16px 18px", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 12, color: th.text2 }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: th.text1 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: th.text2, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="rg-2" style={{ marginBottom: 16 }}>
        {/* Attendance this week */}
        <div style={{ ...card, padding: "18px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 14 }}>📅 {vi ? "Chấm công gần đây" : "Recent Attendance"}</div>
          {attendance.length === 0 ? (
            <div style={{ textAlign: "center", color: th.text2, fontSize: 13, padding: "20px 0" }}>
              {vi ? "Chưa có dữ liệu" : "No data yet"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attendance.map((a: any, i: number) => {
                const ci = a.checkIn ? new Date(a.checkIn) : null
                const co = a.checkOut ? new Date(a.checkOut) : null
                const dateLabel = new Date(a.workDate).toLocaleDateString(vi?"vi-VN":"en-US",{day:"2-digit",month:"2-digit"})
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: th.tableHead }}>
                    <div style={{ width: 40, textAlign: "center", fontSize: 12.5, fontWeight: 700, color: th.text1 }}>{dateLabel}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, color: th.text2 }}>
                        {vi?"Vào:":"In:"} <b style={{ color: th.text1 }}>{ci ? `${String(ci.getHours()).padStart(2,"0")}:${String(ci.getMinutes()).padStart(2,"0")}` : "—"}</b>
                        {" — "}{vi?"Ra:":"Out:"} <b style={{ color: th.text1 }}>{co ? `${String(co.getHours()).padStart(2,"0")}:${String(co.getMinutes()).padStart(2,"0")}` : "—"}</b>
                      </span>
                    </div>
                    <span style={{ background: a.status==="Đúng giờ"?"#D1FAE5":"#FEF3C7", color: a.status==="Đúng giờ"?"#065F46":"#92400E", borderRadius: 8, padding: "2px 10px", fontSize: 11.5, fontWeight: 700 }}>
                      {a.status === "Đúng giờ" ? (vi?"Đúng giờ":"On time") : (vi?"Muộn":"Late")}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Leave balance + request form */}
        <div style={{ ...card, padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: th.text1 }}>🏖️ {vi ? "Quỹ nghỉ phép của bạn" : "Your Leave Balance"}</div>
            <button onClick={() => setShowLeaveForm(p => !p)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
              + {vi ? "Tạo đơn" : "Request"}
            </button>
          </div>

          {leaveBalance.length === 0 ? (
            <div style={{ textAlign: "center", color: th.text2, fontSize: 13, padding: "16px 0" }}>
              {vi ? "Chưa có dữ liệu quỹ phép" : "No leave balance data"}
            </div>
          ) : (
            leaveBalance.map((l: any) => (
              <div key={l.leaveType} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: th.text1 }}>{l.leaveType}</span>
                  <span style={{ color: th.text2, fontSize: 12 }}>{vi?"Còn:":"Left:"} <b style={{ color: "#10B981" }}>{l.remaining}</b>/{l.totalDays} {vi?"ngày":"days"}</span>
                </div>
                <div style={{ background: th.tableBorder, borderRadius: 4, height: 7 }}>
                  <div style={{ width: `${l.totalDays ? (l.usedDays/l.totalDays)*100 : 0}%`, background: "#D0211C", height: "100%", borderRadius: 4 }}/>
                </div>
              </div>
            ))
          )}

          {/* Mini leave form */}
          {showLeaveForm && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${th.tableBorder}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)}
                style={{ padding: "7px 10px", border: `1px solid ${th.inputBorder}`, borderRadius: 8, fontSize: 12.5, background: th.inputBg, color: th.text1, fontFamily: "inherit", outline: "none" }}>
                {["Nghỉ phép năm","Nghỉ bệnh","Việc riêng","Không lương"].map(t => <option key={t}>{t}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input type="date" min={today} value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)}
                  style={{ padding: "7px 10px", border: `1px solid ${th.inputBorder}`, borderRadius: 8, fontSize: 12, background: th.inputBg, color: th.text1, fontFamily: "inherit", outline: "none" }}/>
                <input type="date" min={leaveFrom||today} value={leaveTo} onChange={e => setLeaveTo(e.target.value)}
                  style={{ padding: "7px 10px", border: `1px solid ${th.inputBorder}`, borderRadius: 8, fontSize: 12, background: th.inputBg, color: th.text1, fontFamily: "inherit", outline: "none" }}/>
              </div>
              <input placeholder={vi ? "Lý do nghỉ phép..." : "Reason..."} value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                style={{ padding: "7px 10px", border: `1px solid ${th.inputBorder}`, borderRadius: 8, fontSize: 12.5, background: th.inputBg, color: th.text1, fontFamily: "inherit", outline: "none" }}/>
              <button onClick={handleSubmitLeave} disabled={submitting}
                style={{ padding: "8px", borderRadius: 8, border: "none", background: "#D0211C", color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? (vi ? "Đang gửi..." : "Submitting...") : (vi ? "Gửi đơn" : "Submit")}
              </button>
            </div>
          )}
          {submitted && (
            <div style={{ marginTop: 10, background: "#D1FAE5", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, color: "#065F46", fontWeight: 600, display: "flex", gap: 7 }}>
              <CheckCircle size={14}/>{vi ? "Đơn nghỉ phép đã được gửi thành công!" : "Leave request submitted!"}
            </div>
          )}
        </div>
      </div>

      {/* Payslip summary + Notifications */}
      <div className="rg-2" style={{ marginBottom: 16 }}>
        <div style={{ ...card, padding: "18px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 14 }}>
            💰 {vi ? `Phiếu lương tháng ${now.getMonth()+1}/${now.getFullYear()}` : `Payslip ${now.toLocaleString("en-US",{month:"long"})} ${now.getFullYear()}`}
          </div>
          {!payroll ? (
            <div style={{ textAlign: "center", color: th.text2, fontSize: 13, padding: "20px 0" }}>
              {vi ? "Chưa có dữ liệu lương kỳ này" : "No payroll data for this period"}
            </div>
          ) : (
            <>
              {[
                { label: vi?"Lương Gross":"Gross Salary",      val: Number(payroll.basicSalary ?? 0), color: th.text1, sign: "+" },
                { label: vi?"Phụ cấp":"Allowance",             val: Number(payroll.allowances ?? 0),  color: "#10B981", sign: "+" },
                { label: vi?"Tăng ca":"Overtime",              val: Number(payroll.overtimePay ?? 0), color: "#8B5CF6", sign: "+" },
                { label: "BHXH (8%)",                          val: Number(payroll.bhxh ?? 0),         color: "#EF4444", sign: "-" },
                { label: "BHYT (1.5%)",                        val: Number(payroll.bhyt ?? 0),         color: "#EF4444", sign: "-" },
                { label: "BHTN (1%)",                          val: Number(payroll.bhtn ?? 0),         color: "#EF4444", sign: "-" },
                { label: vi?"Thuế TNCN":"PIT",                 val: Number(payroll.pit ?? 0),          color: "#D97706", sign: "-" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${th.tableBorder}`, fontSize: 12.5 }}>
                  <span style={{ color: th.text2 }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: r.color }}>{r.sign === "-" ? `−${r.val.toLocaleString("vi-VN")}đ` : `+${r.val.toLocaleString("vi-VN")}đ`}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, fontWeight: 800 }}>
                <span style={{ fontSize: 14, color: th.text1 }}>💳 {vi ? "Thực lĩnh (Net)" : "Take-home (Net)"}</span>
                <span style={{ fontSize: 17, color: "#059669" }}>{netSalary.toLocaleString("vi-VN")}đ</span>
              </div>
            </>
          )}
        </div>

        {/* Recent leaves */}
        <div style={{ ...card, padding: "18px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 14 }}>🗓️ {vi ? "Đơn nghỉ phép gần đây" : "Recent Leave Requests"}</div>
          {recentLeaves.length === 0 ? (
            <div style={{ textAlign: "center", color: th.text2, fontSize: 13, padding: "20px 0" }}>
              {vi ? "Chưa có đơn nghỉ phép nào" : "No leave requests yet"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentLeaves.map((r: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: th.tableHead, border: `1px solid ${th.cardBorder}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: th.text1, fontWeight: 600 }}>{r.leaveType}</div>
                    <div style={{ fontSize: 11.5, color: th.text2, marginTop: 2 }}>
                      {new Date(r.startDate).toLocaleDateString("vi-VN")} → {new Date(r.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <span style={{
                    padding: "2px 10px", borderRadius: 10, fontSize: 11.5, fontWeight: 700, alignSelf: "flex-start",
                    background: r.status === "Đã duyệt" ? "#D1FAE5" : r.status === "Từ chối" ? "#FEE2E2" : "#FEF3C7",
                    color: r.status === "Đã duyệt" ? "#065F46" : r.status === "Từ chối" ? "#991B1B" : "#92400E",
                  }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${th.tableBorder}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: th.text1, marginBottom: 8 }}>{vi ? "⚡ Truy cập nhanh" : "⚡ Quick Actions"}</div>
            {[
              { label: vi?"Xem phiếu lương":"View Payslip",     href: "/payslips",  icon: <DollarSign size={13}/> },
              { label: vi?"Tạo đơn nghỉ phép":"Request Leave",  href: "/leave",     icon: <Calendar size={13}/>  },
              { label: vi?"Hồ sơ cá nhân":"My Profile",         href: "/profile",   icon: <Briefcase size={13}/> },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${th.tableBorder}`, textDecoration: "none", color: th.text1, fontSize: 12.5, transition: "color .1s" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>{l.icon}{l.label}</span>
                <ChevronRight size={13} color={th.text2}/>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
