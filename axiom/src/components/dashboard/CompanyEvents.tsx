/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useState } from "react"
import { CalendarDays, Megaphone, Bell } from "lucide-react"
import { getTheme } from "@/lib/dashboard-context"

/* ── Types ─────────────────────────────────────────── */
type EventStatus = "past" | "ongoing" | "upcoming"
export type EventData = {
  emoji: string
  title: string
  date: string
  status: EventStatus
  desc: string
}

/* ── Status meta ───────────────────────────────────── */
const STATUS_VI: Record<EventStatus, { label: string; color: string; bg: string; bgDark: string }> = {
  past:     { label: "Đã xong",       color: "#6B7280", bg: "#F3F4F6", bgDark: "rgba(107,114,128,0.2)" },
  ongoing:  { label: "Đang diễn ra",  color: "#10B981", bg: "#D1FAE5", bgDark: "rgba(16,185,129,0.2)"  },
  upcoming: { label: "Sắp tới",       color: "#7C3AED", bg: "#EDE9FE", bgDark: "rgba(124,58,237,0.2)"  },
}
const STATUS_EN: Record<EventStatus, { label: string; color: string; bg: string; bgDark: string }> = {
  past:     { label: "Completed", color: "#6B7280", bg: "#F3F4F6", bgDark: "rgba(107,114,128,0.2)" },
  ongoing:  { label: "Ongoing",   color: "#10B981", bg: "#D1FAE5", bgDark: "rgba(16,185,129,0.2)"  },
  upcoming: { label: "Upcoming",  color: "#7C3AED", bg: "#EDE9FE", bgDark: "rgba(124,58,237,0.2)"  },
}

/* ── Shared events data ────────────────────────────── */
export const COMPANY_EVENTS_VI: EventData[] = [
  { emoji: "🏖️", title: "Nghỉ lễ Giỗ Tổ Hùng Vương",        desc: "Toàn thể nhân viên được nghỉ theo lịch nhà nước",          date: "26/04/2026",       status: "past" },
  { emoji: "🎆", title: "Nghỉ lễ 30/4 – Giải phóng miền Nam", desc: "Nghỉ lễ Ngày Giải phóng miền Nam, thống nhất đất nước",  date: "30/04/2026",       status: "upcoming" },
  { emoji: "🌸", title: "Nghỉ lễ Quốc tế Lao động 1/5",       desc: "Nghỉ lễ Ngày Quốc tế Lao động – toàn công ty nghỉ",      date: "01/05/2026",       status: "upcoming" },
  { emoji: "🎉", title: "Ngày thành lập công ty",               desc: "Kỷ niệm 5 năm thành lập AXIOM Corporation",              date: "20/06/2026",       status: "upcoming" },
  { emoji: "📊", title: "Họp tổng kết Q1 2026",                desc: "Báo cáo kết quả kinh doanh quý 1 tại hội trường",        date: "10/04/2026",       status: "past" },
  { emoji: "🎓", title: "Đào tạo kỹ năng mềm",                 desc: "Khóa đào tạo cho nhân viên mới Q1",                      date: "20/03 – 25/03/2026", status: "past" },
  { emoji: "💼", title: "Đánh giá hiệu suất Q4 2025",          desc: "Kỳ đánh giá KPI toàn công ty đã hoàn tất",              date: "15/01/2026",       status: "past" },
]
export const COMPANY_EVENTS_EN: EventData[] = [
  { emoji: "🏖️", title: "Hung Kings Commemoration",         desc: "Public holiday – Hung Kings Commemoration Day",            date: "Apr 26, 2026",    status: "past" },
  { emoji: "🎆", title: "Liberation Day – Apr 30",           desc: "National holiday – Reunification of Vietnam",              date: "Apr 30, 2026",    status: "upcoming" },
  { emoji: "🌸", title: "International Labour Day – May 1", desc: "Public holiday – International Workers' Day",              date: "May 01, 2026",    status: "upcoming" },
  { emoji: "🎉", title: "Company Anniversary",               desc: "5th anniversary of AXIOM Corporation",                    date: "Jun 20, 2026",    status: "upcoming" },
  { emoji: "📊", title: "Q1 2026 Review Meeting",            desc: "Quarterly business review at conference room",             date: "Apr 10, 2026",    status: "past" },
  { emoji: "🎓", title: "Soft Skills Training",              desc: "Training program for new Q1 employees",                   date: "Mar 20–25, 2026", status: "past" },
  { emoji: "💼", title: "Q4 2025 Performance Review",        desc: "Company-wide KPI evaluation completed",                   date: "Jan 15, 2026",    status: "past" },
]

/* ── Single event item ─────────────────────────────── */
function EventItem({ emoji, title, date, status, desc, dark, onOpen, vi }: EventData & { dark: boolean; onOpen: () => void; vi: boolean }) {
  const th = getTheme(dark)
  const [hov, setHov] = useState(false)
  const s = (vi ? STATUS_VI : STATUS_EN)[status]
  return (
    <div
      role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => e.key === "Enter" && onOpen()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 12,
        padding: "8px 6px 10px",
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
        cursor: "pointer", borderRadius: 8,
        background: hov ? (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)") : "transparent",
        transition: "background .15s", outline: "none",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: dark ? "rgba(255,255,255,0.07)" : "#F0F0F0",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        boxShadow: hov ? `0 2px 8px ${s.color}30` : "none", transition: "box-shadow .15s",
      }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: hov ? s.color : th.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color .15s" }}>{title}</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: dark ? s.bgDark : s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
        </div>
        <div style={{ fontSize: 11, color: th.text2, marginBottom: 3, lineHeight: 1.35 }}>{desc}</div>
        <div style={{ fontSize: 10.5, color: th.text2, display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
          <CalendarDays size={10}/> {date}
        </div>
      </div>
    </div>
  )
}

/* ── Event detail modal ────────────────────────────── */
function EventModal({ ev, dark, onClose, vi }: { ev: EventData; dark: boolean; onClose: () => void; vi: boolean }) {
  const th = getTheme(dark)
  const s = (vi ? STATUS_VI : STATUS_EN)[ev.status]
  const headerBg = ev.status === "ongoing"
    ? "linear-gradient(135deg,#059669,#047857)"
    : ev.status === "upcoming"
    ? "linear-gradient(135deg,#7C3AED,#5B21B6)"
    : "linear-gradient(135deg,#6B7280,#4B5563)"
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 9998 }}/>
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999 }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 18, width: "min(420px,92vw)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)", overflow: "hidden",
          animation: "ceModalDown .2s ease",
        }}>
          <div style={{ background: headerBg, padding: "24px 24px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>{ev.emoji}</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, lineHeight: 1.3 }}>{ev.title}</div>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.2)", color: "#fff" }}>{s.label}</span>
            </div>
          </div>
          <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: dark ? "rgba(255,255,255,0.04)" : "#F9FAFB", border: `1px solid ${th.cardBorder}` }}>
              <CalendarDays size={16} color={s.color} style={{ flexShrink: 0, marginTop: 1 }}/>
              <div>
                <div style={{ fontSize: 11, color: th.text2, marginBottom: 2 }}>{vi ? "Thời gian" : "Date"}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: th.text1 }}>{ev.date}</div>
              </div>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: dark ? "rgba(255,255,255,0.04)" : "#F9FAFB", border: `1px solid ${th.cardBorder}` }}>
              <div style={{ fontSize: 11, color: th.text2, marginBottom: 6 }}>{vi ? "Mô tả sự kiện" : "Event Description"}</div>
              <div style={{ fontSize: 13.5, color: th.text1, lineHeight: 1.6 }}>{ev.desc}</div>
            </div>
            {ev.status === "upcoming" && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1.5px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={14} color="#7C3AED"/>
                <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 500 }}>{vi ? "Sự kiện sắp diễn ra — hãy chuẩn bị sẵn sàng!" : "Upcoming event — be prepared!"}</span>
              </div>
            )}
            {ev.status === "ongoing" && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: "#10B981", fontWeight: 500 }}>{vi ? "Sự kiện đang diễn ra ngay bây giờ!" : "This event is happening right now!"}</span>
              </div>
            )}
            <button onClick={onClose} style={{
              width: "100%", marginTop: 4, padding: "11px 0", borderRadius: 11,
              background: "linear-gradient(135deg,#D0211C,#a81a17)", color: "#fff",
              border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(208,33,28,0.3)", transition: "transform .15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}
            >{vi ? "Đóng" : "Close"}</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes ceModalDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  )
}

/* ── Main exported widget ──────────────────────────── */
export function CompanyEventsWidget({ dark, vi, maxHeight = 400 }: { dark: boolean; vi: boolean; maxHeight?: number }) {
  const th = getTheme(dark)
  const [selected, setSelected] = useState<EventData | null>(null)
  const events = vi ? COMPANY_EVENTS_VI : COMPANY_EVENTS_EN

  return (
    <>
      <div style={{
        background: dark ? "rgba(255,255,255,0.04)" : "#fff",
        border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        borderRadius: 14, padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <Megaphone size={13} color="#D0211C"/>
          <span style={{ color: th.text1 }}>{vi ? "Sự kiện công ty" : "Company Events"}</span>
          <span style={{
            marginLeft: "auto", fontSize: 9.5, fontWeight: 700, padding: "2px 8px",
            borderRadius: 20, background: "rgba(124,58,237,0.12)", color: "#7C3AED",
          }}>
            {events.filter(e => e.status === "upcoming").length} {vi ? "sắp tới" : "upcoming"}
          </span>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", maxHeight, display: "flex", flexDirection: "column", gap: 2 }}>
          {events.map((ev, i) => (
            <EventItem key={i} {...ev} dark={dark} vi={vi} onOpen={() => setSelected(ev)}/>
          ))}
        </div>
      </div>

      {selected && <EventModal ev={selected} dark={dark} vi={vi} onClose={() => setSelected(null)}/>}
    </>
  )
}
