/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import {
  Clock, MapPin, Wifi, CheckCircle, LogIn, LogOut,
  AlertCircle, Calendar, User, TrendingUp, Activity,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useCurrentUser, useEmployeeId } from "@/hooks/use-current-user"
import {
  checkIn as doCheckIn, checkOut as doCheckOut,
  getAttendanceByMonth,
} from "@/lib/actions/attendance.actions"

const STATUS_MAP = {
  "Đúng giờ": { vi: "Đúng giờ",  en: "On Time",   bg: "#D1FAE5", c: "#065F46" },
  "Đi muộn":  { vi: "Đi muộn",   en: "Late",       bg: "#FEF3C7", c: "#92400E" },
  "Ra sớm":   { vi: "Ra sớm",    en: "Early",      bg: "#DBEAFE", c: "#1E40AF" },
  "Nửa ngày": { vi: "Nửa ngày",  en: "Half Day",   bg: "#EDE9FE", c: "#5B21B6" },
  "Vắng mặt": { vi: "Vắng mặt",  en: "Absent",     bg: "#FEE2E2", c: "#991B1B" },
}

function padZ(n: number) { return String(n).padStart(2, "0") }
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${padZ(h)}:${padZ(m)}:${padZ(s)}`
}

export default function CheckInPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const currentUser = useCurrentUser()
  const employeeId = useEmployeeId()

  const [now, setNow]                   = useState(new Date())
  const [checkedIn, setCheckedIn]       = useState(false)
  const [checkedOut, setCheckedOut]     = useState(false)
  const [checkInTime, setCheckInTime]   = useState<Date | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null)
  const [attendanceId, setAttendanceId] = useState<number | null>(null)
  const [elapsed, setElapsed]           = useState(0)
  const [loading, setLoading]           = useState(false)
  const [locationOk, setLocationOk]     = useState<boolean | null>(null)
  const [toast, setToast]               = useState<{ type: "success"|"error"|"info"; msg: string } | null>(null)
  const [history, setHistory]           = useState<any[]>([])
  const [monthStats, setMonthStats]     = useState({ total: 0, ontime: 0, late: 0 })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Đồng hồ
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Giả lập kiểm tra vị trí
  useEffect(() => { setTimeout(() => setLocationOk(true), 1200) }, [])

  // Load attendance history tháng này
  useEffect(() => {
    if (!employeeId) return
    const now = new Date()
    getAttendanceByMonth(now.getMonth() + 1, now.getFullYear()).then(res => {
      if (!res.success || !res.data) return
      const myRecs = (res.data as any[]).filter((r: any) => r.employeeId === employeeId)
      setHistory(myRecs.slice(0, 7))
      const ontime = myRecs.filter((r: any) => r.status === "Đúng giờ" || r.status === "Ra sớm").length
      const late   = myRecs.filter((r: any) => r.status === "Đi muộn").length
      setMonthStats({ total: myRecs.length, ontime, late })
    })
  }, [employeeId])

  // Timer khi đang làm
  useEffect(() => {
    if (checkedIn && !checkedOut) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [checkedIn, checkedOut])

  const isLate   = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 5)
  const dayStr   = now.toLocaleDateString(vi ? "vi-VN" : "en-US", { weekday: "long" })
  const dateStr  = now.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
  const timeStr  = `${padZ(now.getHours())}:${padZ(now.getMinutes())}:${padZ(now.getSeconds())}`

  const showToast = (type: "success"|"error"|"info", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCheckIn = async () => {
    if (checkedIn || !employeeId) return
    setLoading(true)
    const res = await doCheckIn(employeeId)
    if (res.success && res.data) {
      const t = new Date((res.data as any).checkIn ?? new Date())
      setCheckInTime(t)
      setAttendanceId((res.data as any).id)
      setCheckedIn(true)
      showToast("success", vi ? `✅ Check-in lúc ${padZ(t.getHours())}:${padZ(t.getMinutes())}!` : `✅ Checked in at ${padZ(t.getHours())}:${padZ(t.getMinutes())}!`)
    } else {
      showToast("error", vi ? "Không thể check-in. Vui lòng thử lại." : "Cannot check-in. Please try again.")
    }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    if (!checkedIn || checkedOut || !attendanceId) return
    setLoading(true)
    const res = await doCheckOut(attendanceId)
    if (res.success && res.data) {
      const t = new Date((res.data as any).checkOut ?? new Date())
      setCheckOutTime(t)
      setCheckedOut(true)
      showToast("info", vi ? `👋 Check-out lúc ${padZ(t.getHours())}:${padZ(t.getMinutes())}. Hẹn gặp lại!` : `👋 Checked out at ${padZ(t.getHours())}:${padZ(t.getMinutes())}!`)
    } else {
      showToast("error", vi ? "Không thể check-out." : "Cannot check-out.")
    }
    setLoading(false)
  }

  const hd: React.CSSProperties = {
    padding: "9px 14px", fontSize: 11.5, fontWeight: 700,
    color: th.tableHeadText, background: th.tableHead,
    borderBottom: `1px solid ${th.tableBorder}`, textAlign: "left",
    whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em",
  }
  const tdS: React.CSSProperties = { padding: "11px 14px", fontSize: 13, color: th.text1, borderBottom: `1px solid ${th.tableBorder}` }

  return (
    <div style={{ padding: "28px 28px 40px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: th.text1, margin: 0 }}>Check-in / Check-out</h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
            {vi ? "Ghi nhận giờ làm việc hàng ngày của bạn." : "Record your daily working hours."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10,
          border: `1px solid ${locationOk === null ? th.cardBorder : locationOk ? "#A7F3D0" : "#FECACA"}`,
          background: locationOk === null ? th.cardBg : locationOk ? (dark ? "rgba(16,185,129,0.1)" : "#F0FDF4") : "#FEF2F2",
        }}>
          {locationOk === null
            ? <><Wifi size={14} color={th.text2}/><span style={{ fontSize: 12, color: th.text2 }}>{vi ? "Đang xác định..." : "Checking..."}</span></>
            : locationOk
              ? <><MapPin size={14} color="#10B981"/><span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>{vi ? "Vị trí hợp lệ" : "Location OK"}</span></>
              : <><AlertCircle size={14} color="#EF4444"/><span style={{ fontSize: 12, color: "#991B1B", fontWeight: 600 }}>{vi ? "Ngoài khu vực" : "Out of range"}</span></>
          }
        </div>
      </div>

      {/* Main 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

        {/* Clock card */}
        <div style={{
          background: `linear-gradient(135deg, ${dark ? "#1e1a2e" : "#0f0c29"}, ${dark ? "#111827" : "#302b63"}, ${dark ? "#1e293b" : "#24243e"})`,
          borderRadius: 20, padding: "32px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          position: "relative", overflow: "hidden", minHeight: 220,
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(208,33,28,0.12)", pointerEvents: "none" }}/>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            {dayStr} · {dateStr}
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: 2, lineHeight: 1.1 }}>
            {timeStr}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5 }}>
            <Calendar size={12}/> {vi ? "Ngày làm việc" : "Working day"}
          </div>
          <div style={{ marginTop: 18, padding: "5px 16px", borderRadius: 20,
            background: checkedIn && !checkedOut ? "rgba(16,185,129,0.25)" : checkedOut ? "rgba(59,130,246,0.25)" : isLate ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)",
            border: `1px solid ${checkedIn && !checkedOut ? "rgba(16,185,129,0.5)" : checkedOut ? "rgba(59,130,246,0.5)" : isLate ? "rgba(245,158,11,0.5)" : "rgba(16,185,129,0.5)"}`,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: checkedIn && !checkedOut ? "#6EE7B7" : checkedOut ? "#93C5FD" : isLate ? "#FCD34D" : "#6EE7B7" }}>
              {checkedIn && !checkedOut
                ? (vi ? "🟢 Đang làm việc" : "🟢 Working")
                : checkedOut ? (vi ? "🔵 Đã kết thúc ca" : "🔵 Shift ended")
                : isLate ? (vi ? "⚠️ Quá giờ vào" : "⚠️ Past check-in") : (vi ? "🟢 Trong giờ vào" : "🟢 On time")}
            </span>
          </div>
        </div>

        {/* Action card */}
        <div style={{ background: th.cardBg, borderRadius: 20, padding: "28px", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>

          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#D0211C,#991414)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
              {currentUser?.name?.charAt(0) ?? "U"}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: th.text1, fontSize: 15 }}>{currentUser?.name ?? (vi?"Đang tải...":"Loading...")}</div>
              <div style={{ fontSize: 12, color: th.text2 }}>{currentUser?.department ?? "N/A"}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 11, color: th.text2 }}>{vi ? "Mã NV" : "ID"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#D0211C" }}>{currentUser?.id?.toUpperCase() ?? "—"}</div>
            </div>
          </div>

          {/* Times */}
          {checkedIn && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              <div style={{ background: dark ? "rgba(16,185,129,0.1)" : "#F0FDF4", borderRadius: 12, padding: "12px 14px", border: "1px solid #A7F3D0" }}>
                <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginBottom: 4 }}>{vi ? "⏰ Giờ vào" : "⏰ Check-in"}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#065F46" }}>
                  {checkInTime ? `${padZ(checkInTime.getHours())}:${padZ(checkInTime.getMinutes())}` : "—"}
                </div>
              </div>
              <div style={{ background: dark ? "rgba(59,130,246,0.1)" : "#EFF6FF", borderRadius: 12, padding: "12px 14px", border: "1px solid #BFDBFE" }}>
                <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600, marginBottom: 4 }}>{vi ? "🚪 Giờ ra" : "🚪 Check-out"}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1D4ED8" }}>
                  {checkOutTime ? `${padZ(checkOutTime.getHours())}:${padZ(checkOutTime.getMinutes())}` : "—"}
                </div>
              </div>
            </div>
          )}

          {/* Elapsed */}
          {checkedIn && !checkedOut && (
            <div style={{ background: dark ? "rgba(208,33,28,0.1)" : "#FEF2F2", borderRadius: 14, padding: "14px 20px", border: "1px solid rgba(208,33,28,0.2)", width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#D0211C", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <Activity size={12}/>{vi ? "Thời gian đã làm" : "Time elapsed"}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#D0211C", fontVariantNumeric: "tabular-nums" }}>
                {formatDuration(elapsed)}
              </div>
            </div>
          )}

          {/* Done */}
          {checkedOut && (
            <div style={{ background: dark ? "rgba(16,185,129,0.1)" : "#F0FDF4", borderRadius: 14, padding: "14px 20px", border: "1px solid #A7F3D0", width: "100%", textAlign: "center" }}>
              <CheckCircle size={28} color="#10B981" style={{ marginBottom: 6 }}/>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46" }}>{vi ? "Đã hoàn thành ca làm việc!" : "Shift completed!"}</div>
              <div style={{ fontSize: 12, color: "#10B981", marginTop: 4 }}>{vi ? `Tổng: ${formatDuration(elapsed)}` : `Total: ${formatDuration(elapsed)}`}</div>
            </div>
          )}

          {/* Buttons */}
          {!checkedOut && (
            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <button onClick={handleCheckIn} disabled={checkedIn || loading || !employeeId} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: checkedIn ? "not-allowed" : "pointer",
                background: checkedIn ? (dark ? "#1e293b" : "#F3F4F6") : "linear-gradient(135deg, #059669, #047857)",
                color: checkedIn ? th.text2 : "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                boxShadow: checkedIn ? "none" : "0 6px 20px rgba(5,150,105,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s",
              }}>
                {loading && !checkedIn
                  ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/>
                  : <LogIn size={16}/>}
                {checkedIn ? (vi ? "Đã check-in" : "Checked in") : "Check-in"}
              </button>
              <button onClick={handleCheckOut} disabled={!checkedIn || checkedOut || loading} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: !checkedIn ? "not-allowed" : "pointer",
                background: !checkedIn ? (dark ? "#1e293b" : "#F3F4F6") : "linear-gradient(135deg, #D0211C, #991414)",
                color: !checkedIn ? th.text2 : "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                boxShadow: !checkedIn ? "none" : "0 6px 20px rgba(208,33,28,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s",
              }}>
                {loading && checkedIn && !checkedOut
                  ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/>
                  : <LogOut size={16}/>}
                Check-out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        {[
          { icon: <Clock size={18} color="#D0211C"/>,       label: vi ? "Ngày công tháng này" : "This month", value: `${monthStats.total} ${vi?"ngày":"days"}`,  accent: "#D0211C" },
          { icon: <CheckCircle size={18} color="#10B981"/>, label: vi ? "Đúng giờ" : "On-time",               value: `${monthStats.ontime}`,        accent: "#10B981" },
          { icon: <AlertCircle size={18} color="#F59E0B"/>, label: vi ? "Đi muộn" : "Late",                   value: `${monthStats.late} ${vi?"lần":"times"}`,      accent: "#F59E0B" },
          { icon: <TrendingUp size={18} color="#3B82F6"/>,  label: vi ? "Hôm nay" : "Today",                  value: checkedIn ? (vi ? "Có mặt" : "Present") : (vi ? "Chưa vào" : "Not in"), accent: "#3B82F6" },
        ].map(s => (
          <div key={s.label} style={{ background: th.cardBg, borderRadius: 14, padding: "16px 18px", border: `1px solid ${th.cardBorder}`, borderLeft: `4px solid ${s.accent}`, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${s.accent}15`, pointerEvents: "none" }}/>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11.5, color: th.text2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.accent }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* History table */}
      <div style={{ background: th.cardBg, borderRadius: 14, overflow: "hidden", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${th.tableBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D0211C" }}/>
          <span style={{ fontWeight: 700, color: th.text1, fontSize: 14 }}>{vi ? "Lịch sử điểm danh gần đây" : "Recent Attendance History"}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: th.text2 }}>{history.length} {vi ? "bản ghi" : "records"}</span>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: th.text2, fontSize: 14 }}>
            {vi ? "Chưa có dữ liệu chấm công tháng này" : "No attendance data this month"}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {[vi?"Ngày":"Date", vi?"Giờ vào":"Check-in", vi?"Giờ ra":"Check-out", vi?"Tổng giờ":"Hours", vi?"Trạng thái":"Status"].map(c => (
                <th key={c} style={hd}>{c}</th>
              ))}
            </tr></thead>
            <tbody>
              {history.map((h: any, i: number) => {
                const st = STATUS_MAP[h.status as keyof typeof STATUS_MAP] ?? { vi: h.status, en: h.status, bg: "#F3F4F6", c: "#374151" }
                const ci = h.checkIn ? new Date(h.checkIn) : null
                const co = h.checkOut ? new Date(h.checkOut) : null
                const hours = ci && co ? `${Math.floor((co.getTime()-ci.getTime())/3600000)}h${Math.floor(((co.getTime()-ci.getTime())%3600000)/60000)}m` : "—"
                const dateStr2 = new Date(h.workDate).toLocaleDateString(vi?"vi-VN":"en-US", { day:"2-digit", month:"2-digit" })
                return (
                  <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")} style={{ transition: "background .1s" }}>
                    <td style={tdS}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Calendar size={13} color={th.text2}/><span style={{ fontWeight: 600 }}>{dateStr2}</span></div></td>
                    <td style={tdS}><span style={{ fontWeight: 600, color: "#10B981" }}>{ci ? `${padZ(ci.getHours())}:${padZ(ci.getMinutes())}` : "—"}</span></td>
                    <td style={tdS}><span style={{ color: "#3B82F6" }}>{co ? `${padZ(co.getHours())}:${padZ(co.getMinutes())}` : "—"}</span></td>
                    <td style={tdS}><span style={{ fontWeight: 600 }}>{hours}</span></td>
                    <td style={tdS}><span style={{ background: st.bg, color: st.c, borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{vi ? st.vi : st.en}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info note */}
      <div style={{ marginTop: 14, background: dark ? "rgba(59,130,246,0.08)" : "#EFF6FF", borderRadius: 12, padding: "12px 16px", border: "1px solid #BFDBFE", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <User size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }}/>
        <p style={{ fontSize: 12.5, color: dark ? "#93C5FD" : "#1D4ED8", margin: 0, lineHeight: 1.6 }}>
          {vi ? "Giờ làm việc chuẩn: 08:00 – 17:30. Đi muộn sau 08:05 sẽ bị ghi nhận. Dữ liệu tự động đồng bộ về hệ thống." : "Standard hours: 08:00 – 17:30. Arrivals after 08:05 are marked late. Data syncs automatically."}
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : "#3B82F6", color: "#fff", padding: "13px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeDown .2s ease", fontSize: 14, fontWeight: 600, maxWidth: 360 }}>
          {toast.type === "success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
