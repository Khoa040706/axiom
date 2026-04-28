/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText, Calendar, AlignLeft, AlertCircle, CheckCircle,
  Clock, ChevronLeft, Info, CalendarDays, User, Layers,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { DateInput } from "@/components/ui/date-input"
import { useCurrentUser, useEmployeeId } from "@/hooks/use-current-user"
import { createLeaveRequest, getLeaveBalance, getLeaveRequests } from "@/lib/actions/leave.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"

const LEAVE_TYPES = [
  { vi: "Nghỉ năm",      en: "Annual Leave",    bg: "#DBEAFE", c: "#1E40AF", icon: "🏖️" },
  { vi: "Nghỉ lễ",       en: "Public Holiday",  bg: "#D1FAE5", c: "#065F46", icon: "🎌" },
  { vi: "Việc riêng",    en: "Personal Leave",  bg: "#FEF3C7", c: "#92400E", icon: "👤" },
  { vi: "Nghỉ ốm",       en: "Sick Leave",      bg: "#FCE7F3", c: "#9D174D", icon: "🏥" },
  { vi: "Thai sản",      en: "Maternity Leave", bg: "#EDE9FE", c: "#5B21B6", icon: "👶" },
  { vi: "Không lương",   en: "Unpaid Leave",    bg: "#F3F4F6", c: "#374151", icon: "📋" },
]

const STATUS_BADGE: Record<string, { vi: string; en: string; bg: string; c: string }> = {
  "Chờ duyệt": { vi: "Chờ duyệt", en: "Pending",  bg: "#FEF3C7", c: "#92400E" },
  "Đã duyệt":  { vi: "Đã duyệt",  en: "Approved", bg: "#D1FAE5", c: "#065F46" },
  "Từ chối":   { vi: "Từ chối",   en: "Rejected", bg: "#FEE2E2", c: "#991B1B" },
}

function countWeekdays(fromISO: string, toISO: string): number {
  if (!fromISO || !toISO || fromISO > toISO) return 0
  const start = new Date(fromISO), end = new Date(toISO)
  // eslint-disable-next-line prefer-const
  let count = 0, cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return Math.max(count, 1)
}

function nowStr() {
  const n = new Date()
  return `${String(n.getDate()).padStart(2,"0")}/${String(n.getMonth()+1).padStart(2,"0")}/${n.getFullYear()} ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`
}

function StepBar({ step, vi }: { step: number; vi: boolean }) {
  const steps = vi
    ? ["Loại nghỉ", "Chọn ngày", "Lý do", "Xác nhận"]
    : ["Leave Type", "Date Range", "Reason", "Confirm"]
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
              background: step > i ? "#D0211C" : step === i ? "linear-gradient(135deg,#D0211C,#991414)" : "transparent",
              color: step >= i ? "#fff" : "#9CA3AF",
              border: step >= i ? "none" : "2px solid #E5E7EB",
              boxShadow: step === i ? "0 4px 12px rgba(208,33,28,0.35)" : "none",
            }}>
              {step > i ? <CheckCircle size={16}/> : i + 1}
            </div>
            <span style={{ fontSize: 11, color: step >= i ? "#D0211C" : "#9CA3AF", fontWeight: step === i ? 700 : 400, whiteSpace: "nowrap" }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: step > i ? "#D0211C" : "#E5E7EB", marginBottom: 18, marginLeft: 4, marginRight: 4, transition: "background .3s" }}/>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LeaveRequestPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const currentUser = useCurrentUser()
  const employeeId = useEmployeeId()
  const today = new Date().toISOString().split("T")[0]
  const { isMobile } = useBreakpoint()

  const [step, setStep]           = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]         = useState<{ type: "success"|"error"; msg: string } | null>(null)
  const [quotaData, setQuotaData] = useState<any[]>([])
  const [recentData, setRecentData] = useState<any[]>([])

  const [form, setForm] = useState({
    type: LEAVE_TYPES[0].vi,
    from: today, to: today,
    reason: "", note: "", urgent: false,
  })

  // Load leave balance + recent từ DB
  useEffect(() => {
    if (!employeeId) return
    const y = new Date().getFullYear()
    getLeaveBalance(employeeId, y).then(r => { if (r.success) setQuotaData(r.data as any[]) })
    getLeaveRequests({ employeeId, year: y }).then(r => { if (r.success) setRecentData((r.data as any[]).slice(0, 3)) })
  }, [employeeId])

  const showToast = useCallback((type: "success"|"error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const computedDays  = countWeekdays(form.from, form.to)
  const selectedType  = LEAVE_TYPES.find(t => t.vi === form.type) ?? LEAVE_TYPES[0]
  const quota         = quotaData.find((q: any) => q.leaveType === form.type)

  const canNext = () => {
    if (step === 0) return true
    if (step === 1) return !!form.from && !!form.to && form.from <= form.to
    if (step === 2) return form.reason.trim().length >= 5
    return true
  }

  const handleNext = () => {
    if (!canNext()) { showToast("error", vi ? "Vui lòng điền đầy đủ thông tin" : "Please fill in all required fields"); return }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!employeeId) { showToast("error", vi ? "Vui lòng đăng nhập lại" : "Please login again"); return }
    setSubmitting(true)
    const res = await createLeaveRequest({
      employeeId,
      leaveType: form.type,
      startDate: form.from,
      endDate:   form.to,
      reason:    form.reason,
      requestDate: today,
    })
    setSubmitting(false)
    if (res.success) {
      setSubmitted(true)
      // Refresh recent
      const y = new Date().getFullYear()
      getLeaveRequests({ employeeId, year: y }).then(r => { if (r.success) setRecentData((r.data as any[]).slice(0, 3)) })
    } else {
      showToast("error", vi ? "Không thể gửi đơn. Vui lòng thử lại." : "Cannot submit. Please try again.")
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${th.inputBorder}`, background: th.inputBg,
    color: th.text1, fontSize: 13.5, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", transition: "border-color .15s",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: th.text2,
    textTransform: "uppercase", letterSpacing: "0.05em",
    marginBottom: 7, display: "flex", alignItems: "center", gap: 5,
  }
  const hd: React.CSSProperties = {
    padding: "9px 14px", fontSize: 11.5, fontWeight: 700,
    color: th.tableHeadText, background: th.tableHead,
    borderBottom: `1px solid ${th.tableBorder}`, textAlign: "left",
    whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em",
  }
  const tdS: React.CSSProperties = { padding: "11px 14px", fontSize: 13, color: th.text1, borderBottom: `1px solid ${th.tableBorder}` }

  if (submitted) {
    return (
      <div style={{ padding: "28px 28px 40px" }}>
        <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle size={40} color="#10B981"/>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: th.text1, margin: "0 0 8px" }}>
            {vi ? "Đã gửi đơn nghỉ phép!" : "Leave Request Submitted!"}
          </h2>
          <p style={{ fontSize: 14, color: th.text2, lineHeight: 1.7, margin: "0 0 24px" }}>
            {vi
              ? `Đơn ${selectedType.vi} từ ${form.from.split("-").reverse().join("/")} đến ${form.to.split("-").reverse().join("/")} (${computedDays} ngày làm việc) đã được gửi.`
              : `Your ${selectedType.en} request from ${form.from} to ${form.to} (${computedDays} working days) has been submitted.`}
          </p>
          <div style={{ background: dark ? "rgba(16,185,129,0.1)" : "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 14, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
            {[
              { label: vi?"Người nộp":"Submitted by", value: currentUser?.name ?? "N/A" },
              { label: vi?"Nộp lúc":"Submitted at",   value: nowStr() },
              { label: vi?"Trạng thái":"Status",       value: vi?"Chờ duyệt":"Pending" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${th.tableBorder}`, fontSize: 13 }}>
                <span style={{ color: th.text2 }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: th.text1 }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm({ type: LEAVE_TYPES[0].vi, from: today, to: today, reason: "", note: "", urgent: false }) }}
              style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
              {vi ? "+ Tạo đơn mới" : "+ New Request"}
            </button>
            <a href="/leave" style={{ padding: "11px 24px", borderRadius: 12, border: `1.5px solid ${th.cardBorder}`, background: "none", color: th.text2, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              {vi ? "Xem danh sách" : "View all requests"}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: isMobile ? "16px 16px 32px" : "28px 28px 40px" }}>

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start", gap: isMobile ? 12 : 0, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <a href="/leave" style={{ color: th.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, textDecoration: "none" }}>
              <ChevronLeft size={14}/>{vi ? "Quản lý nghỉ phép" : "Leave Management"}
            </a>
          </div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: th.text1, margin: 0 }}>
            {vi ? "Tạo đơn xin nghỉ phép" : "Create Leave Request"}
          </h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
            {vi ? "Điền thông tin và gửi đơn đến quản lý xét duyệt." : "Fill in the details and submit for manager approval."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
          <User size={14} color="#D0211C"/>
          <div>
            <div style={{ fontSize: 12, color: th.text2 }}>{vi ? "Người nộp đơn" : "Requester"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: th.text1 }}>{currentUser?.name ?? "N/A"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: 20 }}>

        {/* Wizard */}
        <div style={{ background: th.cardBg, borderRadius: 18, padding: "28px", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <StepBar step={step} vi={vi}/>

          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: th.text1, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Layers size={18} color="#D0211C"/>{vi ? "Chọn loại nghỉ phép" : "Select Leave Type"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 10 }}>
                {LEAVE_TYPES.map(t => (
                  <button key={t.vi} onClick={() => setForm(f => ({ ...f, type: t.vi }))} style={{
                    padding: "14px 12px", borderRadius: 14,
                    border: `2px solid ${form.type === t.vi ? t.c : th.inputBorder}`,
                    background: form.type === t.vi ? t.bg : th.inputBg,
                    cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: form.type === t.vi ? 700 : 500, color: form.type === t.vi ? t.c : th.text1 }}>
                      {vi ? t.vi : t.en}
                    </span>
                  </button>
                ))}
              </div>
              {quota && (
                <div style={{ marginTop: 18, background: dark ? "rgba(208,33,28,0.08)" : "#FEF2F2", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(208,33,28,0.2)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: th.text1, marginBottom: 10 }}>
                    {vi ? `📊 Quỹ phép "${form.type}"` : `📊 Quota: "${selectedType.en}"`}
                  </div>
                  <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                    {[
                      { label: vi?"Tổng":"Total",    value: quota.totalDays, color: th.text1 },
                      { label: vi?"Đã dùng":"Used",  value: quota.usedDays,  color: "#F59E0B" },
                      { label: vi?"Còn lại":"Left",  value: quota.remaining, color: "#10B981" },
                    ].map(q => (
                      <div key={q.label}>
                        <span style={{ color: th.text2 }}>{q.label}: </span>
                        <strong style={{ color: q.color, fontSize: 16 }}>{q.value}</strong>
                        <span style={{ fontSize: 11, color: th.text2 }}> {vi?"ngày":"days"}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: th.tableBorder, borderRadius: 4, height: 6, marginTop: 10, overflow: "hidden" }}>
                    <div style={{ width: `${quota.totalDays ? (quota.usedDays/quota.totalDays)*100 : 0}%`, background: quota.remaining <= 2 ? "#EF4444" : "#10B981", height: "100%", borderRadius: 4 }}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gap: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: th.text1, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarDays size={18} color="#D0211C"/>{vi ? "Chọn thời gian nghỉ" : "Select Date Range"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}><Calendar size={12}/> {vi?"Từ ngày":"From Date"} <span style={{ color: "#EF4444" }}>*</span></label>
                  <DateInput style={inputStyle} value={form.from} min={today}
                    onChange={e => { const v = e.target.value; setForm(f => ({ ...f, from: v, to: f.to < v ? v : f.to })) }}/>
                </div>
                <div>
                  <label style={labelStyle}><Calendar size={12}/> {vi?"Đến ngày":"To Date"} <span style={{ color: "#EF4444" }}>*</span></label>
                  <DateInput style={inputStyle} value={form.to} min={form.from}
                    onChange={e => setForm(f => ({ ...f, to: e.target.value }))}/>
                </div>
              </div>
              <div style={{ background: dark ? "rgba(208,33,28,0.1)" : "#FEF2F2", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(208,33,28,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
                <Clock size={20} color="#D0211C"/>
                <div>
                  <div style={{ fontSize: 12, color: th.text2 }}>{vi?"Số ngày làm việc (không tính T7, CN)":"Working days (excl. weekends)"}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#D0211C", lineHeight: 1.2 }}>
                    {computedDays} <span style={{ fontSize: 14, fontWeight: 500, color: th.text2 }}>{vi?"ngày":"days"}</span>
                  </div>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, color: th.text1 }}>
                <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#D0211C" }}/>
                {vi ? "Đây là trường hợp khẩn cấp / cần duyệt gấp" : "This is urgent / needs immediate approval"}
              </label>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "grid", gap: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: th.text1, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <AlignLeft size={18} color="#D0211C"/>{vi ? "Lý do và ghi chú" : "Reason & Notes"}
              </h3>
              <div>
                <label style={labelStyle}><AlignLeft size={12}/> {vi?"Lý do nghỉ phép":"Reason for leave"} <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="text" style={inputStyle}
                  placeholder={vi ? "Nhập lý do cụ thể (tối thiểu 5 ký tự)..." : "Enter specific reason (min. 5 chars)..."}
                  value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}/>
                <div style={{ fontSize: 11.5, color: form.reason.length < 5 ? "#EF4444" : "#10B981", marginTop: 5 }}>
                  {form.reason.length}/5 {vi?"ký tự tối thiểu":"chars minimum"}
                </div>
              </div>
              <div>
                <label style={labelStyle}>{vi?"Ghi chú thêm (tuỳ chọn)":"Additional notes (optional)"}</label>
                <textarea rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 } as React.CSSProperties}
                  placeholder={vi ? "Thông tin bổ sung..." : "Additional info..."}
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}/>
              </div>
              <div style={{ background: dark ? "rgba(59,130,246,0.1)" : "#EFF6FF", borderRadius: 12, padding: "11px 14px", fontSize: 12.5, color: dark ? "#93C5FD" : "#1D4ED8", display: "flex", gap: 8 }}>
                <Info size={15} style={{ flexShrink: 0, marginTop: 1 }}/>
                <span>{vi ? "Đơn sẽ gửi đến quản lý trực tiếp để duyệt." : "Your request will be sent to your direct manager."}</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "grid", gap: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: th.text1, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={18} color="#D0211C"/>{vi ? "Xác nhận thông tin" : "Confirm Details"}
              </h3>
              <div style={{ background: th.tableHead, borderRadius: 14, overflow: "hidden", border: `1px solid ${th.tableBorder}` }}>
                {[
                  { label: vi?"Người nộp":"Requester",   value: currentUser?.name ?? "N/A",             icon: <User size={13}/> },
                  { label: vi?"Loại nghỉ":"Leave Type",  value: vi ? form.type : selectedType.en,       icon: <span style={{ fontSize: 14 }}>{selectedType.icon}</span> },
                  { label: vi?"Từ ngày":"From",           value: form.from.split("-").reverse().join("/"), icon: <Calendar size={13}/> },
                  { label: vi?"Đến ngày":"To",            value: form.to.split("-").reverse().join("/"),   icon: <Calendar size={13}/> },
                  { label: vi?"Số ngày":"Working days",  value: `${computedDays} ${vi?"ngày":"days"}`,   icon: <Clock size={13}/> },
                  { label: vi?"Lý do":"Reason",           value: form.reason,                             icon: <AlignLeft size={13}/> },
                  ...(form.urgent ? [{ label: vi?"Ưu tiên":"Priority", value: vi?"🚨 Khẩn cấp":"🚨 Urgent", icon: <AlertCircle size={13}/> }] : []),
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${th.tableBorder}`, fontSize: 13 }}>
                    <div style={{ color: "#D0211C", flexShrink: 0, marginTop: 1 }}>{r.icon}</div>
                    <div style={{ color: th.text2, flexShrink: 0, width: 130 }}>{r.label}</div>
                    <div style={{ color: th.text1, fontWeight: 600, flex: 1 }}>{r.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: dark ? "rgba(16,185,129,0.1)" : "#F0FDF4", borderRadius: 12, padding: "11px 14px", fontSize: 12.5, color: dark ? "#6EE7B7" : "#065F46", display: "flex", gap: 8, border: "1px solid #A7F3D0" }}>
                <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }}/>
                <span>{vi ? "Vui lòng kiểm tra lại thông tin trước khi gửi." : "Please review all details before submitting."}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${th.tableBorder}` }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${th.cardBorder}`, background: "none", cursor: step === 0 ? "not-allowed" : "pointer", color: step === 0 ? th.text2 : th.text1, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
              <ChevronLeft size={15}/>{vi ? "Quay lại" : "Back"}
            </button>
            {step < 3 ? (
              <button onClick={handleNext}
                style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(208,33,28,0.3)" }}>
                {vi ? "Tiếp theo →" : "Next →"}
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                {submitting
                  ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/>{vi ? "Đang gửi..." : "Submitting..."}</>
                  : <><FileText size={15}/>{vi ? "Nộp đơn" : "Submit"}</>}
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quota */}
          <div style={{ background: th.cardBg, borderRadius: 16, padding: "18px", border: `1px solid ${th.cardBorder}` }}>
            <div style={{ fontWeight: 700, color: th.text1, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
              <CalendarDays size={16} color="#D0211C"/>{vi ? "Quỹ phép của bạn" : "Your Leave Quota"}
            </div>
            {quotaData.length === 0 ? (
              <div style={{ fontSize: 13, color: th.text2 }}>{vi ? "Chưa có dữ liệu" : "No data"}</div>
            ) : quotaData.map((q: any) => (
              <div key={q.leaveType} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: th.text1, fontWeight: 600 }}>{q.leaveType}</span>
                  <span style={{ color: q.remaining <= 2 ? "#EF4444" : "#10B981", fontWeight: 700 }}>{q.remaining}/{q.totalDays}</span>
                </div>
                <div style={{ background: th.tableBorder, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${q.totalDays ? (q.usedDays/q.totalDays)*100 : 0}%`, background: q.remaining <= 2 ? "#EF4444" : "#10B981", height: "100%", borderRadius: 4 }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={{ background: th.cardBg, borderRadius: 16, padding: "18px", border: `1px solid ${th.cardBorder}` }}>
            <div style={{ fontWeight: 700, color: th.text1, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
              <Clock size={16} color="#D0211C"/>{vi ? "Đơn gần đây" : "Recent Requests"}
            </div>
            {recentData.length === 0 ? (
              <div style={{ fontSize: 13, color: th.text2 }}>{vi ? "Chưa có đơn nào" : "No requests yet"}</div>
            ) : recentData.map((r: any, i: number) => {
              const st = STATUS_BADGE[r.status] ?? { vi: r.status, en: r.status, bg: "#F3F4F6", c: "#374151" }
              return (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < recentData.length - 1 ? `1px solid ${th.tableBorder}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: th.text1 }}>{r.leaveType}</div>
                    <span style={{ background: st.bg, color: st.c, borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{vi ? st.vi : st.en}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: th.text2, marginTop: 3 }}>
                    {new Date(r.startDate).toLocaleDateString("vi-VN")} → {new Date(r.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Policy */}
          <div style={{ background: dark ? "rgba(59,130,246,0.08)" : "#EFF6FF", borderRadius: 14, padding: "14px 16px", border: "1px solid #BFDBFE" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: dark ? "#93C5FD" : "#1D4ED8", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={13}/>{vi ? "Quy định nghỉ phép" : "Leave Policy"}
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: dark ? "#93C5FD" : "#1E40AF", lineHeight: 1.8 }}>
              <li>{vi ? "Đơn phải nộp trước 3 ngày làm việc" : "Submit at least 3 working days prior"}</li>
              <li>{vi ? "Nghỉ năm: tối đa 15 ngày/năm" : "Annual leave: max 15 days/year"}</li>
              <li>{vi ? "Quản lý duyệt trong vòng 24 giờ" : "Manager approves within 24 hours"}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent table */}
      {recentData.length > 0 && (
        <div style={{ marginTop: 24, background: th.cardBg, borderRadius: 14, overflow: "hidden", border: `1px solid ${th.cardBorder}` }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${th.tableBorder}`, fontWeight: 700, color: th.text1, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D0211C" }}/>
            {vi ? "Lịch sử đơn nghỉ phép của tôi" : "My Leave Request History"}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {[vi?"Loại nghỉ":"Type", vi?"Từ ngày":"From", vi?"Đến ngày":"To", vi?"Ngày nộp":"Submitted", vi?"Trạng thái":"Status"].map(c => (
                <th key={c} style={hd}>{c}</th>
              ))}
            </tr></thead>
            <tbody>
              {recentData.map((r: any, i: number) => {
                const st = STATUS_BADGE[r.status] ?? { vi: r.status, en: r.status, bg: "#F3F4F6", c: "#374151" }
                const lt = LEAVE_TYPES.find(t => t.vi === r.leaveType)
                return (
                  <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")} style={{ transition: "background .1s" }}>
                    <td style={tdS}><div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 16 }}>{lt?.icon}</span><span style={{ fontWeight: 600 }}>{r.leaveType}</span></div></td>
                    <td style={tdS}>{new Date(r.startDate).toLocaleDateString("vi-VN")}</td>
                    <td style={tdS}>{new Date(r.endDate).toLocaleDateString("vi-VN")}</td>
                    <td style={tdS}>{new Date(r.requestDate).toLocaleDateString("vi-VN")}</td>
                    <td style={tdS}><span style={{ background: st.bg, color: st.c, borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{vi ? st.vi : st.en}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "13px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeDown .2s ease", fontSize: 14, fontWeight: 600, maxWidth: 360 }}>
          {toast.type === "success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/> }{toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
