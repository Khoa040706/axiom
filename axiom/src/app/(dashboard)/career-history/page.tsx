/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp, TrendingDown, Award, ArrowRightLeft, RefreshCw,
  Plus, X, Check, Search, DollarSign, AlertTriangle, FileText,
  Filter, Users, Star,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import {
  getCareerHistories, createCareerHistory, deleteCareerHistory,
  getCareerOverviewStats, getEmployeesForCareerSelect,
  getDepartmentsForCareerSelect, getPositionsForCareerSelect,
} from "@/lib/actions/career-history.actions"
import {
  CAREER_EVENT_TYPES, CAREER_EVENT_CATEGORIES, REWARD_TYPES, PENALTY_TYPES,
} from "@/lib/constants"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { matchAny } from "@/lib/utils/search"
import { useState as useStateImg } from "react"

function EmpAvatar({ name, avatarPath, size = 36 }: { name: string; avatarPath?: string | null; size?: number }) {
  const [imgErr, setImgErr] = useStateImg(false)
  const src = (avatarPath && !imgErr) ? avatarPath : "/images/avatarmacdinh.jpg"
  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  )
}

/* ── Icon & Color Maps ── */
const EVENT_ICONS: Record<string, React.ReactNode> = {
  "Bổ nhiệm":       <FileText       size={13} color="#3B82F6"/>,
  "Miễn nhiệm":     <FileText       size={13} color="#6B7280"/>,
  "Thăng chức":      <TrendingUp     size={13} color="#D0211C"/>,
  "Giáng chức":      <TrendingDown   size={13} color="#EF4444"/>,
  "Điều chuyển":     <ArrowRightLeft size={13} color="#7C3AED"/>,
  "Điều chỉnh lương":<DollarSign     size={13} color="#F59E0B"/>,
  "Khen thưởng":     <Award          size={13} color="#F59E0B"/>,
  "Kỷ luật":         <AlertTriangle  size={13} color="#EF4444"/>,
  "Khác":            <Star           size={13} color="#6B7280"/>,
}
const EVENT_COLORS: Record<string, { bg: string; bgDark: string; text: string }> = {
  "Bổ nhiệm":       { bg:"#EFF6FF", bgDark:"rgba(59,130,246,0.12)", text:"#1D4ED8" },
  "Miễn nhiệm":     { bg:"#F3F4F6", bgDark:"rgba(107,114,128,0.12)", text:"#374151" },
  "Thăng chức":      { bg:"#FEF2F2", bgDark:"rgba(208,33,28,0.12)", text:"#D0211C" },
  "Giáng chức":      { bg:"#FEE2E2", bgDark:"rgba(239,68,68,0.12)", text:"#991B1B" },
  "Điều chuyển":     { bg:"#EDE9FE", bgDark:"rgba(124,58,237,0.12)", text:"#5B21B6" },
  "Điều chỉnh lương":{ bg:"#FFFBEB", bgDark:"rgba(245,158,11,0.12)", text:"#92400E" },
  "Khen thưởng":     { bg:"#FFFBEB", bgDark:"rgba(245,158,11,0.12)", text:"#92400E" },
  "Kỷ luật":         { bg:"#FEE2E2", bgDark:"rgba(239,68,68,0.12)", text:"#991B1B" },
  "Khác":            { bg:"#F3F4F6", bgDark:"rgba(107,114,128,0.12)", text:"#374151" },
}

const CATEGORY_KEYS = ["all", ...Object.keys(CAREER_EVENT_CATEGORIES)] as const
type CatKey = (typeof CATEGORY_KEYS)[number]

function fmtMoney(v: number | null | undefined) {
  if (!v) return "—"
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫"
}

export default function CareerHistoryPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()

  /* ── State ── */
  const [records, setRecords]       = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]           = useState<string | null>(null)
  const [search, setSearch]         = useState("")
  const [catFilter, setCatFilter]   = useState<CatKey>("all")
  const [stats, setStats]           = useState({ total: 0, promotions: 0, rewards: 0, penalties: 0 })

  /* ── Dropdown data ── */
  const [employees, setEmployees]     = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions]     = useState<any[]>([])

  /* ── Form state ── */
  const [fEmpId,       setFEmpId]       = useState<number | "">("")
  const [fType,        setFType]        = useState<string>("Nhận việc")
  const [fDate,        setFDate]        = useState(new Date().toISOString().split("T")[0])
  const [fDesc,        setFDesc]        = useState("")
  const [fDecision,    setFDecision]    = useState("")
  const [fOldPos,      setFOldPos]      = useState("")
  const [fNewPos,      setFNewPos]      = useState("")
  const [fOldDept,     setFOldDept]     = useState("")
  const [fNewDept,     setFNewDept]     = useState("")
  const [fOldSalary,   setFOldSalary]   = useState("")
  const [fNewSalary,   setFNewSalary]   = useState("")
  const [fRewardType,  setFRewardType]  = useState("")
  const [fRewardAmt,   setFRewardAmt]   = useState("")
  const [fPenaltyType, setFPenaltyType] = useState("")

  /* ── Computed: which fields to show per event type ── */
  const showPositionFields = ["Bổ nhiệm", "Miễn nhiệm", "Thăng chức", "Giáng chức"].includes(fType)
  const showDeptFields     = fType === "Điều chuyển"
  const showSalaryFields   = fType === "Điều chỉnh lương"
  const showRewardFields   = fType === "Khen thưởng"
  const showPenaltyFields  = fType === "Kỷ luật"

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true)
    const [histRes, statRes] = await Promise.all([
      getCareerHistories(),
      getCareerOverviewStats(),
    ])
    if (histRes.success) setRecords(histRes.data as any[])
    if (statRes.success) setStats(statRes.data as any)
    setLoading(false)
  }, [])

  const loadDropdowns = useCallback(async () => {
    const [empRes, deptRes, posRes] = await Promise.all([
      getEmployeesForCareerSelect(),
      getDepartmentsForCareerSelect(),
      getPositionsForCareerSelect(),
    ])
    if (empRes.data) setEmployees(empRes.data as any[])
    if (deptRes.data) setDepartments(deptRes.data as any[])
    if (posRes.data) setPositions(posRes.data as any[])
  }, [])

  useEffect(() => { load(); loadDropdowns() }, [load, loadDropdowns])

  /* ── Helpers ── */
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const resetForm = () => {
    setFDesc(""); setFDecision(""); setFOldPos(""); setFNewPos("")
    setFOldDept(""); setFNewDept(""); setFOldSalary(""); setFNewSalary("")
    setFRewardType(""); setFRewardAmt(""); setFPenaltyType("")
  }

  const handleSubmit = async () => {
    if (!fEmpId || !fDate || !fType) {
      showToast(vi ? "⚠️ Vui lòng chọn nhân viên và ngày" : "⚠️ Please select employee and date")
      return
    }
    setSubmitting(true)
    const res = await createCareerHistory({
      employeeId:     Number(fEmpId),
      eventType:      fType,
      eventDate:      fDate,
      description:    fDesc    || undefined,
      decisionNumber: fDecision || undefined,
      oldPosition:    fOldPos  || undefined,
      newPosition:    fNewPos  || undefined,
      oldDepartment:  fOldDept || undefined,
      newDepartment:  fNewDept || undefined,
      oldSalary:      fOldSalary ? Number(fOldSalary) : undefined,
      newSalary:      fNewSalary ? Number(fNewSalary) : undefined,
      rewardType:     fRewardType  || undefined,
      rewardAmount:   fRewardAmt ? Number(fRewardAmt) : undefined,
      penaltyType:    fPenaltyType || undefined,
    })
    setSubmitting(false)
    if (res.success) {
      setShowForm(false); resetForm()
      showToast(vi ? "✅ Đã thêm sự kiện công tác" : "✅ Career event added")
      load()
    } else {
      showToast(vi ? "❌ Lỗi khi thêm sự kiện" : "❌ Failed to add event")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(vi ? "Xoá sự kiện này?" : "Delete this event?")) return
    const res = await deleteCareerHistory(id)
    if (res.success) { showToast(vi ? "✅ Đã xoá" : "✅ Deleted"); load() }
    else showToast("❌ Error")
  }

  /* ── Filtering ── */
  const getCatTypes = (cat: CatKey): string[] => {
    if (cat === "all") return []
    const c = CAREER_EVENT_CATEGORIES[cat as keyof typeof CAREER_EVENT_CATEGORIES]
    return c ? [...c.types] : []
  }
  const filteredRecords = records.filter(r => {
    const types = getCatTypes(catFilter)
    if (types.length > 0 && !types.includes(r.eventType)) return false
    if (search) {
      if (!matchAny([r.employee?.fullName, r.employee?.code], search)) return false
    }
    return true
  })

  /* ── Group by employee for timeline ── */
  const grouped: Record<number, any> = {}
  for (const r of filteredRecords) {
    const empId = r.employee?.id ?? r.employeeId
    if (!grouped[empId]) {
      grouped[empId] = {
        id: empId,
        code: r.employee?.code ?? "—",
        name: r.employee?.fullName ?? "—",
        dept: r.employee?.department?.name ?? "—",
        pos:  r.employee?.position?.name  ?? "—",
        avatarPath: r.employee?.avatarPath ?? null,
        history: [],
      }
    }
    grouped[empId].history.push(r)
  }
  const groupedList = Object.values(grouped)

  /* ── Styles ── */
  const card: React.CSSProperties = {
    background: th.cardBg, borderRadius: 14,
    border: `1px solid ${th.cardBorder}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden",
  }
  const input: React.CSSProperties = {
    padding: "8px 10px", border: `1.5px solid ${th.inputBorder}`,
    borderRadius: 9, fontSize: 12.5, background: th.inputBg,
    color: th.text1, fontFamily: "inherit", outline: "none", width: "100%",
    boxSizing: "border-box",
  }
  const labelStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 4,
  }
  const labelText: React.CSSProperties = { fontSize: 11.5, color: th.text2, fontWeight: 600 }

  return (
    <div className="page-pad">
      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: th.text1, margin: 0 }}>
            {vi ? "Quá trình công tác" : "Career History"}
          </h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
            {vi
              ? "Theo dõi vòng đời nhân viên: bổ nhiệm, luân chuyển, lương, khen thưởng, kỷ luật"
              : "Track employee lifecycle: appointments, transfers, salary, rewards, discipline"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} disabled={loading}
            style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${th.cardBorder}`, background: th.cardBg, color: th.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: "inherit" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }} />
            {vi ? "Tải lại" : "Refresh"}
          </button>
          <button onClick={() => { setShowForm(p => !p); if (!showForm) loadDropdowns() }}
            style={{ padding: "8px 16px", borderRadius: 9, background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(208,33,28,0.25)" }}>
            <Plus size={14} />{vi ? "Thêm sự kiện" : "Add Event"}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: vi ? "Tổng sự kiện" : "Total Events",    value: stats.total,      icon: <FileText size={18} color="#3B82F6"/>,      accent: "#3B82F6" },
          { label: vi ? "Bổ nhiệm/Thăng chức" : "Promotions", value: stats.promotions, icon: <TrendingUp size={18} color="#D0211C"/>,    accent: "#D0211C" },
          { label: vi ? "Khen thưởng" : "Rewards",           value: stats.rewards,    icon: <Award size={18} color="#F59E0B"/>,          accent: "#F59E0B" },
          { label: vi ? "Kỷ luật" : "Disciplines",           value: stats.penalties,  icon: <AlertTriangle size={18} color="#EF4444"/>,  accent: "#EF4444" },
        ].map((s, i) => (
          <div key={i} style={{
            ...card, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: dark ? `${s.accent}15` : `${s.accent}10`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: th.text1 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: th.text2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 260px" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: th.text3 }} />
          <input
            placeholder={vi ? "Tìm nhân viên..." : "Search employee..."}
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...input, paddingLeft: 30 }}
          />
        </div>
        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {CATEGORY_KEYS.map(key => {
            const isActive = catFilter === key
            const label = key === "all"
              ? (vi ? "Tất cả" : "All")
              : (vi
                ? CAREER_EVENT_CATEGORIES[key as keyof typeof CAREER_EVENT_CATEGORIES].label
                : CAREER_EVENT_CATEGORIES[key as keyof typeof CAREER_EVENT_CATEGORIES].labelEn)
            return (
              <button key={key} onClick={() => setCatFilter(key)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12,
                  fontWeight: isActive ? 700 : 500, fontFamily: "inherit",
                  border: isActive ? "1.5px solid #D0211C" : `1px solid ${th.cardBorder}`,
                  background: isActive ? (dark ? "rgba(208,33,28,0.15)" : "#FEF2F2") : th.cardBg,
                  color: isActive ? "#D0211C" : th.text2,
                  cursor: "pointer", transition: "all .15s",
                }}>{label}</button>
            )
          })}
        </div>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div style={{ ...card, marginBottom: 16, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={15} color="#D0211C"/>
            {vi ? "Thêm sự kiện công tác mới" : "New Career Event"}
          </div>

          {/* Row 1: Employee + Event Type + Date + Decision */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <label style={labelStyle}>
              <span style={labelText}>{vi ? "Nhân viên *" : "Employee *"}</span>
              <select value={fEmpId} onChange={e => setFEmpId(e.target.value ? Number(e.target.value) : "")} style={input}>
                <option value="">{vi ? "— Chọn nhân viên —" : "— Select employee —"}</option>
                {employees.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.code} — {e.fullName}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelText}>{vi ? "Loại sự kiện *" : "Event Type *"}</span>
              <select value={fType} onChange={e => setFType(e.target.value)} style={input}>
                {CAREER_EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelText}>{vi ? "Ngày *" : "Date *"}</span>
              <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} style={input} />
            </label>
            <label style={labelStyle}>
              <span style={labelText}>{vi ? "Số quyết định" : "Decision No."}</span>
              <input value={fDecision} onChange={e => setFDecision(e.target.value)} style={input} placeholder="QĐ-2026/..." />
            </label>
          </div>

          {/* Row 2: Dynamic fields per event type */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            {showPositionFields && (<>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Chức vụ cũ" : "Old Position"}</span>
                <select value={fOldPos} onChange={e => setFOldPos(e.target.value)} style={input}>
                  <option value="">{vi ? "— Chọn —" : "— Select —"}</option>
                  {positions.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Chức vụ mới *" : "New Position *"}</span>
                <select value={fNewPos} onChange={e => setFNewPos(e.target.value)} style={input}>
                  <option value="">{vi ? "— Chọn —" : "— Select —"}</option>
                  {positions.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </label>
            </>)}

            {showDeptFields && (<>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Phòng ban cũ" : "Old Department"}</span>
                <select value={fOldDept} onChange={e => setFOldDept(e.target.value)} style={input}>
                  <option value="">{vi ? "— Chọn —" : "— Select —"}</option>
                  {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Phòng ban mới *" : "New Department *"}</span>
                <select value={fNewDept} onChange={e => setFNewDept(e.target.value)} style={input}>
                  <option value="">{vi ? "— Chọn —" : "— Select —"}</option>
                  {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </label>
            </>)}

            {showSalaryFields && (<>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Mức lương cũ (₫)" : "Old Salary (₫)"}</span>
                <input type="number" value={fOldSalary} onChange={e => setFOldSalary(e.target.value)} style={input} placeholder="0" />
              </label>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Mức lương mới (₫) *" : "New Salary (₫) *"}</span>
                <input type="number" value={fNewSalary} onChange={e => setFNewSalary(e.target.value)} style={input} placeholder="0" />
              </label>
            </>)}

            {showRewardFields && (<>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Loại khen thưởng *" : "Reward Type *"}</span>
                <select value={fRewardType} onChange={e => setFRewardType(e.target.value)} style={input}>
                  <option value="">{vi ? "— Chọn —" : "— Select —"}</option>
                  {REWARD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Số tiền thưởng (₫)" : "Reward Amount (₫)"}</span>
                <input type="number" value={fRewardAmt} onChange={e => setFRewardAmt(e.target.value)} style={input} placeholder="0" />
              </label>
            </>)}

            {showPenaltyFields && (
              <label style={labelStyle}>
                <span style={labelText}>{vi ? "Hình thức kỷ luật *" : "Penalty Type *"}</span>
                <select value={fPenaltyType} onChange={e => setFPenaltyType(e.target.value)} style={input}>
                  <option value="">{vi ? "— Chọn —" : "— Select —"}</option>
                  {PENALTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
            )}

            {/* Description — always shown */}
            <label style={{ ...labelStyle, gridColumn: isMobile ? undefined : showPositionFields || showDeptFields || showSalaryFields || showRewardFields ? undefined : "1 / -1" }}>
              <span style={labelText}>{vi ? "Mô tả / Ghi chú" : "Description"}</span>
              <input value={fDesc} onChange={e => setFDesc(e.target.value)} style={input}
                placeholder={vi ? "Nội dung quyết định, ghi chú..." : "Decision content, notes..."} />
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => { setShowForm(false); resetForm() }}
              style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${th.cardBorder}`, background: th.cardBg, color: th.text2, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit" }}>
              {vi ? "Huỷ" : "Cancel"}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: "7px 18px", borderRadius: 8, background: "#D0211C", color: "#fff", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: submitting ? 0.7 : 1 }}>
              <Check size={13} />{submitting ? (vi ? "Đang lưu..." : "Saving...") : (vi ? "Lưu sự kiện" : "Save Event")}
            </button>
          </div>
        </div>
      )}

      {/* ── Table View ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: th.text2 }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${th.cardBorder}`, borderTopColor: "#D0211C", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ ...card, padding: 48, textAlign: "center", color: th.text2 }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>{vi ? "Chưa có lịch sử công tác" : "No career events yet"}</div>
          <div style={{ fontSize: 12.5, marginTop: 6 }}>{vi ? "Nhấn \"Thêm sự kiện\" để bắt đầu ghi nhận" : "Click \"Add Event\" to start recording"}</div>
        </div>
      ) : (
        <>
          {/* ── Data Table ── */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${th.tableBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: th.text1, display: "flex", alignItems: "center", gap: 6 }}>
                <Filter size={14} color={th.text2}/>
                {vi ? "Bảng chi tiết" : "Detail Table"}
                <span style={{ fontSize: 11.5, color: th.text2, fontWeight: 400 }}>({filteredRecords.length} {vi ? "bản ghi" : "records"})</span>
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: th.tableHead }}>
                    {[
                      vi ? "Nhân viên" : "Employee",
                      vi ? "Loại sự kiện" : "Event Type",
                      vi ? "Ngày" : "Date",
                      vi ? "Số QĐ" : "Decision No.",
                      vi ? "Chi tiết" : "Details",
                      "",
                    ].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", color: th.tableHeadText, fontWeight: 600, whiteSpace: "nowrap", borderBottom: `1px solid ${th.tableBorder}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r: any) => {
                    const col = EVENT_COLORS[r.eventType] ?? EVENT_COLORS["Khác"]
                    const dateStr = new Date(r.eventDate).toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })

                    // Build detail string
                    let detail = ""
                    if (r.oldPosition && r.newPosition) detail += `${r.oldPosition} → ${r.newPosition}`
                    else if (r.newPosition) detail += r.newPosition
                    if (r.oldDepartment && r.newDepartment) detail += `${detail ? " · " : ""}${r.oldDepartment} → ${r.newDepartment}`
                    if (r.oldSalary != null && r.newSalary != null) detail += `${detail ? " · " : ""}${fmtMoney(r.oldSalary)} → ${fmtMoney(r.newSalary)}`
                    else if (r.newSalary != null) detail += `${detail ? " · " : ""}${fmtMoney(r.newSalary)}`
                    if (r.rewardType) detail += `${detail ? " · " : ""}${r.rewardType}${r.rewardAmount ? ` (${fmtMoney(r.rewardAmount)})` : ""}`
                    if (r.penaltyType) detail += `${detail ? " · " : ""}${r.penaltyType}`
                    if (r.description) detail += `${detail ? " — " : ""}${r.description}`

                    return (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${th.tableBorder}`, transition: "background .1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = th.rowHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <EmpAvatar name={r.employee?.fullName ?? ""} avatarPath={r.employee?.avatarPath} size={28} />
                            <div>
                              <div style={{ fontWeight: 600, color: th.text1 }}>{r.employee?.fullName ?? "—"}</div>
                              <div style={{ fontSize: 11, color: th.text3 }}>{r.employee?.code ?? ""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "3px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                            background: dark ? col.bgDark : col.bg, color: col.text,
                          }}>
                            {EVENT_ICONS[r.eventType] ?? <Star size={11} color={col.text}/>}
                            {r.eventType}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", color: th.text2, whiteSpace: "nowrap" }}>{dateStr}</td>
                        <td style={{ padding: "10px 14px", color: th.text2, fontFamily: "monospace", fontSize: 11.5 }}>{r.decisionNumber ?? "—"}</td>
                        <td style={{ padding: "10px 14px", color: th.text2, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {detail || "—"}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <button onClick={() => handleDelete(r.id)}
                            style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: dark ? "rgba(239,68,68,0.15)" : "#FEE2E2", color: "#EF4444", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Timeline View (grouped by employee) ── */}
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={15} color={th.text2}/>
            {vi ? "Timeline theo nhân viên" : "Timeline by Employee"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {groupedList.map((emp: any) => (
              <div key={emp.id} style={card}>
                {/* Employee header */}
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${th.tableBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <EmpAvatar name={emp.name} avatarPath={emp.avatarPath} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: th.text1 }}>{emp.name}</div>
                      <div style={{ fontSize: 11.5, color: th.text2 }}>{emp.code} · {emp.pos} · {emp.dept}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: th.text2, background: dark ? "rgba(255,255,255,0.06)" : "#F3F4F6", padding: "3px 10px", borderRadius: 8 }}>
                    {emp.history.length} {vi ? "sự kiện" : "events"}
                  </span>
                </div>

                {/* Timeline */}
                <div style={{ padding: "16px 18px 16px 36px" }}>
                  {(emp.history as any[]).map((h: any, i: number) => {
                    const col = EVENT_COLORS[h.eventType] ?? EVENT_COLORS["Khác"]
                    const dateStr = new Date(h.eventDate).toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
                    return (
                      <div key={h.id} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i < emp.history.length - 1 ? 20 : 0 }}>
                        {i < emp.history.length - 1 && <div style={{ position: "absolute", left: 7, top: 18, bottom: 0, width: 2, background: th.tableBorder }} />}
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: col.text, border: `2px solid ${th.cardBg}`, flexShrink: 0, marginTop: 2, position: "relative", zIndex: 1 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              {EVENT_ICONS[h.eventType] ?? <Star size={13} color={th.text2}/>}
                              <span style={{ fontWeight: 700, fontSize: 13, color: th.text1 }}>{h.eventType}</span>
                              {h.decisionNumber && (
                                <span style={{ fontSize: 10.5, color: th.text3, fontFamily: "monospace" }}>
                                  {h.decisionNumber}
                                </span>
                              )}
                              {h.newPosition && (
                                <span style={{ background: dark ? col.bgDark : col.bg, color: col.text, borderRadius: 8, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                                  {h.newPosition}
                                </span>
                              )}
                              {h.rewardType && (
                                <span style={{ background: dark ? "rgba(245,158,11,0.12)" : "#FFFBEB", color: "#92400E", borderRadius: 8, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                                  {h.rewardType}{h.rewardAmount ? ` — ${fmtMoney(h.rewardAmount)}` : ""}
                                </span>
                              )}
                              {h.penaltyType && (
                                <span style={{ background: dark ? "rgba(239,68,68,0.12)" : "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                                  {h.penaltyType}
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11.5, color: th.text2 }}>{dateStr}</span>
                              <button onClick={() => handleDelete(h.id)}
                                style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: dark ? "rgba(239,68,68,0.15)" : "#FEE2E2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                          {/* Detail row */}
                          <div style={{ fontSize: 12, color: th.text2, marginTop: 3 }}>
                            {h.oldPosition && h.newPosition && <span>{h.oldPosition} → {h.newPosition} · </span>}
                            {h.oldDepartment && h.newDepartment && <span>{h.oldDepartment} → {h.newDepartment} · </span>}
                            {h.oldSalary != null && h.newSalary != null && <span>{fmtMoney(h.oldSalary)} → {fmtMoney(h.newSalary)} · </span>}
                            {h.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#111827", color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontWeight: 600 }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
