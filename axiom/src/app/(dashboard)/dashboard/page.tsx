/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  Users, FileText, DollarSign, History, UserCog, BarChart2,
  Download, Bell, AlertTriangle, CheckCircle, ArrowUpRight,
  Clock, Sparkles, TrendingUp, Award, Building2,
  CalendarDays, Megaphone, Star, ChevronRight,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getDashboardStats, getDashboardCharts } from "@/lib/actions/dashboard.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { tDept } from "@/lib/i18n-maps"
import { buildEvents, type EventData } from "@/components/dashboard/CompanyEvents"

/* ─── Animated counter ─────────────────────────────── */
function Counter({ to }: { to: string }) {
  const [val, setVal] = useState("—")
  useEffect(() => {
    const n = parseInt(to)
    if (isNaN(n)) { setVal(to); return }
    let cur = 0
    const step = Math.max(1, Math.ceil(n / 20))
    const t = setInterval(() => {
      cur = Math.min(cur + step, n)
      setVal(String(cur))
      if (cur >= n) clearInterval(t)
    }, 40)
    return () => clearInterval(t)
  }, [to])
  return <>{val}</>
}

/* ─── Pie label ─────────────────────────────────────── */
const RADIAN = Math.PI / 180
function PieLabel({ cx, cy, midAngle, outerRadius, name, value, textColor }: any) {
  const r = outerRadius + 26
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill={textColor} fontSize={10.5} fontWeight={500}
      textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {name}: <tspan fontWeight={700}>{value}</tspan>
    </text>
  )
}

const DEPT_COLORS = ["#C41210","#DC2626","#E57373","#F28B82","#FBBF24","#F59E0B","#8B1010","#B91C1C"]

/* ─── KPI Card ──────────────────────────────────────── */
function KpiCard({ label, value, icon, color, bg, note, href, dark }: {
  label: string; value: string; icon: React.ReactNode
  color: string; bg: string; note: string; href: string; dark: boolean
}) {
  const router = useRouter()
  const th = getTheme(dark)
  const [hov, setHov] = useState(false)
  return (
    <div
      role="button" tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={e => e.key === "Enter" && router.push(href)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "#fff",
        border: `1.5px solid ${hov ? color : (dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)")}`,
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? `0 6px 24px ${color}25` : "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex", alignItems: "center", gap: 12,
        transform: hov ? "translateY(-2px)" : "none",
        outline: "none",
        minWidth: 0,
        width: "100%",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: bg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div style={{ fontSize: 10.5, color: th.text2, fontWeight: 500, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.15 }}><Counter to={value}/></div>
        <div style={{ fontSize: 10, color: th.text3, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{note}</div>
      </div>
      <ChevronRight size={13} color={hov ? color : th.text3} style={{ flexShrink: 0, transition: "color .2s" }}/>
    </div>
  )
}

/* ─── Nav Tile ──────────────────────────────────────── */
function NavTile({ icon, label, sub, href, color, tag, dark, emoji }: {
  icon: React.ReactNode; label: string; sub: string
  href: string; color: string; tag?: string; dark: boolean; fill?: boolean; emoji: string
}) {
  const router = useRouter()
  const [hov, setHov] = useState(false)
  const th = getTheme(dark)
  return (
    <div
      role="button" tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={e => e.key === "Enter" && router.push(href)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16,
        padding: "20px 18px 16px",
        cursor: "pointer",
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        outline: "none",
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative", overflow: "hidden",
        background: dark
          ? (hov ? `${color}22` : "rgba(255,255,255,0.05)")
          : (hov ? `${color}12` : "#fff"),
        border: `1.5px solid ${hov ? color : (dark ? "rgba(255,255,255,0.09)" : `${color}30`)}`,
        boxShadow: hov
          ? `0 8px 28px ${color}30, 0 0 0 1px ${color}20`
          : `0 2px 8px rgba(0,0,0,0.06), 0 0 0 0px ${color}00`,
        transform: hov ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
      }}
    >
      {/* Decorative blob */}
      <div style={{
        position:"absolute", right:-16, top:-16, width:72, height:72,
        borderRadius:"50%", background:`${color}18`,
        transition:"transform .22s", transform: hov ? "scale(1.3)" : "scale(1)",
        pointerEvents:"none",
      }}/>

      {/* Top row: icon + tag */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
          border: `1.5px solid ${color}30`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: 22,
          boxShadow: hov ? `0 4px 12px ${color}30` : "none",
          transition:"box-shadow .22s, transform .22s",
          transform: hov ? "scale(1.08) rotate(-4deg)" : "scale(1) rotate(0deg)",
          flexShrink:0,
        }}>{emoji}</div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
          {tag && (
            <span style={{
              fontSize:9, fontWeight:800, padding:"3px 7px", borderRadius:20,
              background:`${color}22`, color, letterSpacing:0.5, border:`1px solid ${color}30`,
            }}>{tag}</span>
          )}
          <div style={{
            width:22, height:22, borderRadius:8,
            background: hov ? color : `${color}15`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background .22s",
          }}>
            <ArrowUpRight size={12} color={hov?"#fff":color}/>
          </div>
        </div>
      </div>

      {/* Label + sub */}
      <div>
        <div style={{
          fontSize: 14, fontWeight: 800, color: hov ? color : th.text1,
          marginBottom: 4, transition:"color .22s", lineHeight:1.2,
        }}>{label}</div>
        <div style={{
          fontSize: 11.5, color: th.text2, lineHeight: 1.45,
        }}>{sub}</div>
      </div>
    </div>
  )
}


/* ─── Event types + data ────────────────────────────── */
type EventStatus = "past" | "ongoing" | "upcoming"

const STATUS_META_VI: Record<EventStatus,{label:string;color:string;bg:string;bgDark:string}> = {
  past:     { label:"Đã xong",      color:"#6B7280", bg:"#F3F4F6", bgDark:"rgba(107,114,128,0.2)" },
  ongoing:  { label:"Đang diễn ra", color:"#10B981", bg:"#D1FAE5", bgDark:"rgba(16,185,129,0.2)"  },
  upcoming: { label:"Sắp tới",      color:"#7C3AED", bg:"#EDE9FE", bgDark:"rgba(124,58,237,0.2)"  },
}
const STATUS_META_EN: Record<EventStatus,{label:string;color:string;bg:string;bgDark:string}> = {
  past:     { label:"Completed",  color:"#6B7280", bg:"#F3F4F6", bgDark:"rgba(107,114,128,0.2)" },
  ongoing:  { label:"Ongoing",    color:"#10B981", bg:"#D1FAE5", bgDark:"rgba(16,185,129,0.2)"  },
  upcoming: { label:"Upcoming",   color:"#7C3AED", bg:"#EDE9FE", bgDark:"rgba(124,58,237,0.2)"  },
}

/* ─── Event item (clickable) ────────────────────────── */
function EventItem({ emoji, title, date, status, desc, dark, onOpen, vi }: EventData & { dark:boolean; onOpen:()=>void; vi:boolean }) {
  const th = getTheme(dark)
  const [hov, setHov] = useState(false)
  const s = (vi ? STATUS_META_VI : STATUS_META_EN)[status]
  return (
    <div
      role="button" tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => e.key === "Enter" && onOpen()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", gap:12,
        padding:"8px 6px 10px",
        borderBottom:`1px solid ${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}`,
        cursor:"pointer", borderRadius:8,
        background: hov ? (dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)") : "transparent",
        transition:"background .15s", outline:"none",
      }}
    >
      <div style={{
        width:36, height:36, borderRadius:10, flexShrink:0,
        background: dark ? "rgba(255,255,255,0.07)" : "#F0F0F0",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
        boxShadow: hov ? `0 2px 8px ${s.color}30` : "none", transition:"box-shadow .15s",
      }}>{emoji}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6, marginBottom:3 }}>
          <span style={{ fontSize:12.5, fontWeight:700, color:hov?s.color:th.text1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", transition:"color .15s" }}>{title}</span>
          <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:20, background:dark?s.bgDark:s.bg, color:s.color, flexShrink:0 }}>{s.label}</span>
        </div>
        <div style={{ fontSize:11, color:th.text2, marginBottom:3, lineHeight:1.35 }}>{desc}</div>
        <div style={{ fontSize:10.5, color:th.text3, display:"flex", alignItems:"center", gap:4 }}>
          <CalendarDays size={10}/> {date}
        </div>
      </div>
    </div>
  )
}

/* ─── Event detail modal ────────────────────────────── */
function EventModal({ ev, dark, onClose, vi }: { ev: EventData; dark: boolean; onClose: () => void; vi: boolean }) {
  const th = getTheme(dark)
  const s = (vi ? STATUS_META_VI : STATUS_META_EN)[ev.status]
  const headerBg = ev.status === "ongoing"
    ? "linear-gradient(135deg,#059669,#047857)"
    : ev.status === "upcoming"
    ? "linear-gradient(135deg,#7C3AED,#5B21B6)"
    : "linear-gradient(135deg,#6B7280,#4B5563)"
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:9998 }}/>
      <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:9999 }}>
        <div onClick={e=>e.stopPropagation()} style={{
          background:th.cardBg, border:`1px solid ${th.cardBorder}`,
          borderRadius:18, width:"min(420px,92vw)",
          boxShadow:"0 24px 60px rgba(0,0,0,0.35)", overflow:"hidden",
          animation:"mfadeDown .2s ease",
        }}>
          <div style={{ background:headerBg, padding:"24px 24px 20px", textAlign:"center" }}>
            <div style={{ fontSize:42, marginBottom:8 }}>{ev.emoji}</div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:17, lineHeight:1.3 }}>{ev.title}</div>
            <div style={{ marginTop:10 }}>
              <span style={{ fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"rgba(255,255,255,0.2)", color:"#fff" }}>{s.label}</span>
            </div>
          </div>
          <div style={{ padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10, background:dark?"rgba(255,255,255,0.04)":"#F9FAFB", border:`1px solid ${th.cardBorder}` }}>
              <CalendarDays size={16} color={s.color} style={{ flexShrink:0, marginTop:1 }}/>
              <div>
                <div style={{ fontSize:11, color:th.text2, marginBottom:2 }}>{vi?"Thời gian":"Date"}</div>
                <div style={{ fontSize:13.5, fontWeight:700, color:th.text1 }}>{ev.date}</div>
              </div>
            </div>
            <div style={{ padding:"12px 14px", borderRadius:10, background:dark?"rgba(255,255,255,0.04)":"#F9FAFB", border:`1px solid ${th.cardBorder}` }}>
              <div style={{ fontSize:11, color:th.text2, marginBottom:6 }}>{vi?"Mô tả sự kiện":"Event Description"}</div>
              <div style={{ fontSize:13.5, color:th.text1, lineHeight:1.6 }}>{ev.desc}</div>
            </div>
            {ev.status === "upcoming" && (
              <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(124,58,237,0.1)", border:"1.5px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", gap:8 }}>
                <Bell size={14} color="#7C3AED"/>
                <span style={{ fontSize:12, color:"#7C3AED", fontWeight:500 }}>{vi?"Sự kiện sắp diễn ra — hãy chuẩn bị sẵn sàng!":"Upcoming event — be prepared!"}</span>
              </div>
            )}
            {ev.status === "ongoing" && (
              <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(16,185,129,0.1)", border:"1.5px solid rgba(16,185,129,0.2)", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", flexShrink:0 }}/>
                <span style={{ fontSize:12, color:"#10B981", fontWeight:500 }}>{vi?"Sự kiện đang diễn ra ngay bây giờ!":"This event is happening right now!"}</span>
              </div>
            )}
            <button onClick={onClose} style={{
              width:"100%", marginTop:4, padding:"11px 0", borderRadius:11,
              background:"linear-gradient(135deg,#D0211C,#a81a17)", color:"#fff",
              border:"none", cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit",
              boxShadow:"0 4px 14px rgba(208,33,28,0.3)", transition:"transform .15s",
            }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-1px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="none")}
            >{vi?"Đóng":"Close"}</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes mfadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile, isTablet } = useBreakpoint()

  const [kpi, setKpi]        = useState({ total:"—", pending:"—", expiring:"—", trial:"—" })
  const [deptData, setDept]  = useState<any[]>([])
  const [exporting, setExporting]    = useState(false)
  const [selectedEvent, setSelected] = useState<EventData | null>(null)
  const [userName, setUserName]      = useState("")

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getDashboardCharts(),
      import("next-auth/react").then(m => m.getSession()),
    ]).then(([statsRes, chartsRes, session]) => {
      if (statsRes.success && statsRes.data) {
        const { empStats, pendingLeave, expiringContracts } = statsRes.data
        setKpi({ total:String(empStats.total), pending:String(pendingLeave), expiring:String(expiringContracts), trial:String(empStats.trial) })
      }
      if (chartsRes.success && chartsRes.data) {
        setDept((chartsRes.data.headcount ?? []).map((d:any,i:number) => ({ ...d, color: DEPT_COLORS[i % DEPT_COLORS.length] })))
      }
      if (session?.user?.name) setUserName(session.user.name)
    })
  }, [])

  // Translate dept names for pie chart based on current lang
  const translatedDeptData = useMemo(() =>
    deptData.map(d => ({ ...d, name: tDept(d.name, vi) }))
  , [deptData, vi])

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    try {
      const m = new Date().getMonth()+1, y = new Date().getFullYear()
      const res = await fetch(`/api/export/excel?type=dashboard&month=${m}&year=${y}`)
      if (!res.ok) throw new Error()
      const buffer = await res.arrayBuffer()
      const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const a   = document.createElement("a")
      a.style.display = "none"
      a.href     = url
      a.download = `AXIOM_BaoCao_${y}-${String(m).padStart(2,"0")}.xlsx`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 10_000)
    } catch { alert(vi?"Không thể xuất báo cáo.":"Export failed.") }
    finally { setExporting(false) }
  }

  /* Nav tiles */
  const tiles = [
    { emoji:"👥", icon:<Users size={18} color="#D0211C"/>,     label:vi?"Nhân sự":"Employees",    sub:vi?"Quản lý hồ sơ và trạng thái nhân viên":"Manage employee profiles & status",   href:"/employees",          color:"#D0211C" },
    { emoji:"📋", icon:<FileText size={18} color="#7C3AED"/>,   label:vi?"Hợp đồng":"Contracts",   sub:vi?"Ký kết, gia hạn & theo dõi hợp đồng":"Sign, renew & track contracts",         href:"/contracts",          color:"#7C3AED" },
    { emoji:"🚀", icon:<History size={18} color="#F59E0B"/>,    label:vi?"Công tác":"Career",       sub:vi?"Thăng chức, điều chuyển, khen thưởng":"Promotions, transfers & rewards",      href:"/career-history",     color:"#F59E0B", tag:"HOT" },
    { emoji:"💰", icon:<DollarSign size={18} color="#10B981"/>, label:vi?"Lương":"Payroll",         sub:vi?"Cấu hình bảng lương và phụ cấp":"Configure salary & allowances",              href:"/payroll",            color:"#10B981" },
    { emoji:"🔐", icon:<UserCog size={18} color="#3B82F6"/>,    label:vi?"Phân quyền":"Access",     sub:vi?"Quản lý tài khoản & vai trò hệ thống":"Manage accounts & system roles",       href:"/settings/users",     color:"#3B82F6" },
    { emoji:"📊", icon:<BarChart2 size={18} color="#EC4899"/>,  label:vi?"Thống kê":"Statistics",   sub:vi?"Xem biểu đồ KPI & phân tích nhân sự":"View KPI charts & HR analytics",       href:"/dashboard-director", color:"#EC4899", tag:"NEW" },
  ]

  /* Company events — auto-computed status */
  const events = buildEvents(vi)

  const card: React.CSSProperties = {
    background: dark ? "rgba(255,255,255,0.04)" : "#fff",
    border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
    borderRadius: 14, padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  }
  const secLabel: React.CSSProperties = {
    fontSize:12, fontWeight:700, color:th.text2,
    display:"flex", alignItems:"center", gap:6, marginBottom:12,
  }

  return (
    <div className="page-pad">
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes up   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: up .35s both ease }

        /* KPI row: 4 col → 2 col on tablet/mobile */
        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 640px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }

        /* Nav tiles: 3 col → 2 col on tablet/small-laptop → 2 col on mobile */
        .nav-tiles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 1100px) {
          .nav-tiles-grid { grid-template-columns: repeat(2, 1fr); grid-template-rows: unset; gap: 8px; }
        }
        @media (max-width: 640px) {
          .nav-tiles-grid { grid-template-columns: repeat(2, 1fr); grid-template-rows: unset; gap: 8px; }
        }
      `}</style>


      {/* ── GREETING ─────────────────────────────────────── */}
      {(() => {
        const h = new Date().getHours()
        const timeEmoji = h < 6 ? "🌙" : h < 12 ? "☀️" : h < 17 ? "🌤️" : h < 20 ? "🌆" : "🌙"
        const greetVi = h < 6 ? "Chào buổi đêm" : h < 12 ? "Chào buổi sáng" : h < 17 ? "Chào buổi chiều" : h < 20 ? "Chào buổi chiều" : "Chào buổi tối"
        const greetEn = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
        const subVi = h < 12 ? "Bắt đầu ngày làm việc hiệu quả nhé!" : h < 17 ? "Chúc buổi chiều làm việc thật tốt!" : "Hết một ngày rồi, hãy nghỉ ngơi nhé!"
        const subEn = h < 12 ? "Have a productive day ahead!" : h < 17 ? "Keep up the great work!" : "Time to wrap up and rest!"
        const displayName = userName ? userName.split(" ").pop() : null
        const dateStr = new Date().toLocaleDateString(vi ? "vi-VN" : "en-US", {
          weekday:"long", day:"numeric", month:"long", year:"numeric",
        })
        return (
          <div style={{ marginBottom:20, animation:"up .3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{
                width:54, height:54, borderRadius:16, flexShrink:0,
                background: dark ? "rgba(255,255,255,0.07)" : "rgba(208,33,28,0.08)",
                border:`1.5px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(208,33,28,0.18)"}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
              }}>{timeEmoji}</div>
              <div>
                <div style={{ fontSize:11, color:th.text2, marginBottom:5, display:"flex", alignItems:"center", gap:5 }}>
                  <span>📅</span> {dateStr}
                </div>
                <div style={{ fontSize: isMobile ? 19 : 24, fontWeight:900, color:th.text1, lineHeight:1.15, letterSpacing:-0.4 }}>
                  {vi ? greetVi : greetEn}
                  {displayName && <span style={{ color:"#D0211C" }}>, {displayName}</span>}
                  {" "}👋
                </div>
                <div style={{ fontSize:13, color:th.text2, marginTop:5, fontWeight:400 }}>
                  {vi ? subVi : subEn}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── KPI ROW: 4 equal cards — responsive (4→2 col) ─ */}
      <div className="kpi-row" style={{ marginBottom:20, animation:"up .38s ease" }}>
        <KpiCard label={vi?"Tổng nhân sự":"Total Staff"}          value={kpi.total}    icon={<Users size={20} color="#D0211C"/>}       color="#D0211C" bg="#FEE2E2" note={vi?"Đang làm việc":"Active"}          href="/employees"   dark={dark}/>
        <KpiCard label={vi?"Đơn nghỉ chờ duyệt":"Pending Leaves"} value={kpi.pending}  icon={<Bell size={20} color="#7C3AED"/>}        color="#7C3AED" bg="#EDE9FE" note={vi?"Cần xử lý":"Need action"}         href="/leave"       dark={dark}/>
        <KpiCard label={vi?"HĐ sắp hết hạn":"Expiring Contracts"} value={kpi.expiring} icon={<AlertTriangle size={20} color="#D97706"/>} color="#D97706" bg="#FEF3C7" note={vi?"Trong 30 ngày":"Within 30d"}    href="/contracts"   dark={dark}/>
        <KpiCard label={vi?"Đang thử việc":"On Probation"}         value={kpi.trial}    icon={<Clock size={20} color="#10B981"/>}       color="#10B981" bg="#D1FAE5" note={vi?"Nhân viên mới":"New employees"}    href="/employees"   dark={dark}/>
      </div>

      {/* ── ROW 2: Quick access (left) + Events (right) ─ */}
      <div style={{
        display:"grid", gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "1fr minmax(280px, 320px)",
        gap:16, marginBottom:16, animation:"up .42s ease",
      }}>

        {/* Nav tiles: fill height of row via grid-template-rows */}
        <div style={{ display:"flex", flexDirection:"column" }}>
          <div style={secLabel}><Sparkles size={12} color="#D0211C"/>{vi?"Truy cập nhanh":"Quick Access"}</div>
          <div className="nav-tiles-grid" style={{ flex:1 }}>
            {tiles.map((t,i) => (
              <div key={t.href} className="fade-up" style={{ animationDelay:`${i*50}ms`, display:"flex" }}>
                <NavTile {...t} dark={dark} fill/>
              </div>
            ))}
          </div>
        </div>

        {/* Company events */}
        <div style={{ ...card, overflowY:"auto", maxHeight:440 }}>
          <div style={secLabel}><Megaphone size={12} color="#D0211C"/>{vi?"Sự kiện công ty":"Company Events"}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {events.map((ev,i) => (
              <EventItem key={i} {...ev} dark={dark} vi={vi} onOpen={() => setSelected(ev)}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Dept chart + Status & Tips ────────── */}
      <div style={{
        display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap:16, animation:"up .46s ease",
      }}>

        {/* Dept pie chart */}
        <div style={{ ...card, overflow:"visible" }}>
          <div style={secLabel}><Building2 size={12} color="#D0211C"/>{vi?"Phân bổ nhân lực theo phòng ban":"Workforce by Department"}</div>
          {translatedDeptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 240}>
              <PieChart margin={{ top:10, right: isMobile ? 30 : 50, left: isMobile ? 30 : 50, bottom:10 }}>
                <Pie
                  data={translatedDeptData} cx="50%" cy="50%" outerRadius={isMobile ? 65 : (isTablet ? 72 : 82)}
                  dataKey="value" nameKey="name"
                  label={(p:any) => <PieLabel {...p} textColor={th.text1}/>}
                  labelLine={{ stroke:dark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)", strokeWidth:1 }}
                >
                  {translatedDeptData.map((d:any,i:number) => <Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip
                  contentStyle={{ background:th.cardBg, border:`1px solid ${th.cardBorder}`, borderRadius:8, fontSize:12, color:th.text1 }}
                  formatter={(v:any, n:any) => [v+(vi?" người":" staff"), n]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:240, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, fontSize:13, flexDirection:"column", gap:8 }}>
              <div style={{ width:28,height:28,border:`3px solid ${th.cardBorder}`,borderTopColor:"#D0211C",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>
              <span>{vi?"Đang tải dữ liệu...":"Loading..."}</span>
            </div>
          )}
          {/* Legend */}
          {translatedDeptData.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", marginTop:4 }}>
              {translatedDeptData.map((d:any) => (
                <div key={d.name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:th.text2 }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:d.color,flexShrink:0 }}/>
                  {d.name}: <b style={{ color:th.text1 }}>{d.value}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Status + Tips */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Today status */}
          <div style={card}>
            <div style={secLabel}><TrendingUp size={12} color="#D0211C"/>{vi?"Trạng thái hôm nay":"Today's Status"}</div>
            {[
              { icon:<CheckCircle size={14} color="#10B981"/>, label:vi?"Hệ thống hoạt động bình thường":"System operational",  badge:"OK",   c:"#10B981" },
              { icon:<TrendingUp  size={14} color="#3B82F6"/>, label:vi?"Dữ liệu được đồng bộ":"Data is synchronized",          badge:"SYNC", c:"#3B82F6" },
              { icon:<Award       size={14} color="#F59E0B"/>, label:vi?"Bảo mật được đảm bảo":"Security verified",             badge:"SAFE", c:"#F59E0B" },
            ].map(s => (
              <div key={s.label} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"8px 0",
                borderBottom:`1px solid ${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}`,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5, color:th.text1 }}>
                  {s.icon}{s.label}
                </div>
                <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${s.c}18`, color:s.c }}>{s.badge}</span>
              </div>
            ))}
          </div>

          {/* Quick tips */}
          <div style={{
            ...card,
            background: dark
              ? "linear-gradient(135deg,rgba(208,33,28,0.12),rgba(139,0,0,0.06))"
              : "linear-gradient(135deg,#FFF5F5,#FEE2E2)",
            border: "1.5px solid rgba(208,33,28,0.18)",
            flex:1,
          }}>
            <div style={secLabel}><Star size={12} color="#D0211C"/><span style={{ color:"#D0211C" }}>{vi?"Gợi ý":"Tips"}</span></div>
            {(vi ? [
              "Kiểm tra đơn nghỉ phép chờ duyệt",
              "Xem lại hợp đồng sắp hết hạn",
              "Cập nhật thông tin nhân viên mới",
              "Xuất báo cáo lương tháng này",
            ] : [
              "Review pending leave requests",
              "Check contracts expiring soon",
              "Update new employee profiles",
              "Export this month's payroll report",
            ]).map((tip,i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:8,
                padding:"5px 0", fontSize:12,
                color: dark ? "rgba(255,180,180,0.85)" : "#7F1D1D", lineHeight:1.4,
              }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:"#D0211C",marginTop:5,flexShrink:0 }}/>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && <EventModal ev={selectedEvent} dark={dark} vi={vi} onClose={() => setSelected(null)}/>}
    </div>
  )
}
