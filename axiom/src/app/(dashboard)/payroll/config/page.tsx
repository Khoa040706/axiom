/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback } from "react"
import {
  Calculator, Save, RotateCcw, ChevronLeft,
  CheckCircle, AlertCircle, Info, Shield, TrendingUp,
  Percent, DollarSign, Users, Clock, Zap, BookOpen,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useBreakpoint } from "@/hooks/use-breakpoint"

// ─── Types ────────────────────────────────────────────────────────
interface PayrollConfig {
  // Insurance (employee share)
  bhxh:           number   // 8%
  bhyt:           number   // 1.5%
  bhtn:           number   // 1%
  // Insurance (employer share - for display/reporting)
  bhxhEmployer:   number   // 17.5%
  bhytEmployer:   number   // 3%
  bhtnEmployer:   number   // 1%
  // Tax deductions
  selfDeduction:  number   // 15,500,000
  depDeduction:   number   // 6,200,000
  // Payroll settings
  standardDays:   number   // 24 or 26
  payDay:         number   // day of month (1-31)
  otWeekday:      number   // 1.5
  otWeekend:      number   // 2.0
  otHoliday:      number   // 3.0
  // Min wage
  minWage:        number   // 4,680,000
  minWageRegion1: number   // 4,680,000
  minWageRegion2: number   // 4,160,000
  minWageRegion3: number   // 3,640,000
  minWageRegion4: number   // 3,250,000
}

const DEFAULT_CONFIG: PayrollConfig = {
  bhxh: 8, bhyt: 1.5, bhtn: 1,
  bhxhEmployer: 17.5, bhytEmployer: 3, bhtnEmployer: 1,
  selfDeduction: 15_500_000, depDeduction: 6_200_000,
  standardDays: 24, payDay: 5,
  otWeekday: 1.5, otWeekend: 2.0, otHoliday: 3.0,
  minWage: 4_680_000,
  minWageRegion1: 4_680_000, minWageRegion2: 4_160_000,
  minWageRegion3: 3_640_000, minWageRegion4: 3_250_000,
}

// ─── PIT Bracket reference ────────────────────────────────────────
const PIT_BRACKETS = [
  { bracket: "Bậc 1", bracketEn: "Bracket 1", range: "≤ 5 triệu",      rangeEn: "≤ 5M VND",      rate: "5%",  formula: "0.05 × TNTT",       formulaEn: "0.05 × TI" },
  { bracket: "Bậc 2", bracketEn: "Bracket 2", range: "5 – 10 triệu",   rangeEn: "5 – 10M VND",   rate: "10%", formula: "0.1×TNTT − 250K",    formulaEn: "0.1×TI − 250K" },
  { bracket: "Bậc 3", bracketEn: "Bracket 3", range: "10 – 18 triệu",  rangeEn: "10 – 18M VND",  rate: "15%", formula: "0.15×TNTT − 750K",   formulaEn: "0.15×TI − 750K" },
  { bracket: "Bậc 4", bracketEn: "Bracket 4", range: "18 – 32 triệu",  rangeEn: "18 – 32M VND",  rate: "20%", formula: "0.2×TNTT − 1.65tr",  formulaEn: "0.2×TI − 1.65M" },
  { bracket: "Bậc 5", bracketEn: "Bracket 5", range: "32 – 52 triệu",  rangeEn: "32 – 52M VND",  rate: "25%", formula: "0.25×TNTT − 3.25tr", formulaEn: "0.25×TI − 3.25M" },
  { bracket: "Bậc 6", bracketEn: "Bracket 6", range: "52 – 80 triệu",  rangeEn: "52 – 80M VND",  rate: "30%", formula: "0.3×TNTT − 5.85tr",  formulaEn: "0.3×TI − 5.85M" },
  { bracket: "Bậc 7", bracketEn: "Bracket 7", range: "> 80 triệu",     rangeEn: "> 80M VND",     rate: "35%", formula: "0.35×TNTT − 9.85tr", formulaEn: "0.35×TI − 9.85M" },
]

// ─── Format helpers ────────────────────────────────────────────────
function fmtM(v: number, vi = true) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + (vi ? " triệu" : "M VND")
  return v.toLocaleString("vi-VN") + (vi ? " đ" : " VND")
}

// ─── Section wrapper ──────────────────────────────────────────────
function Section({ title, icon, children, th }: { title: string; icon: React.ReactNode; children: React.ReactNode; th: any }) {
  return (
    <div style={{ background: th.cardBg, borderRadius: 16, border: `1px solid ${th.cardBorder}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${th.tableBorder}`, display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#D0211C,#991414)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontWeight: 700, color: th.text1, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  )
}

// ─── Number input field ───────────────────────────────────────────
function NumField({ label, value, onChange, unit, min, max, step, note, th }: {
  label: string; value: number; onChange: (v: number) => void;
  unit?: string; min?: number; max?: number; step?: number;
  note?: string; th: any;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: th.text2, marginBottom: 6, display: "block" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number" value={value} min={min} max={max} step={step ?? 0.1}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          onFocus={e => (e.target.style.borderColor = "#D0211C")}
          onBlur={e => (e.target.style.borderColor = th.inputBorder)}
          style={{
            flex: 1, padding: "9px 12px", border: `1.5px solid ${th.inputBorder}`,
            borderRadius: 9, fontSize: 14, background: th.inputBg, color: th.text1,
            outline: "none", fontFamily: "inherit", transition: "border-color .15s",
          }}
        />
        {unit && <span style={{ fontSize: 13, color: th.text2, flexShrink: 0 }}>{unit}</span>}
      </div>
      {note && <div style={{ fontSize: 11, color: th.text3, marginTop: 4 }}>{note}</div>}
    </div>
  )
}

const STORAGE_KEY = "axiom_payroll_config"

function loadSavedConfig(): PayrollConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_CONFIG
}

// ─── Main ─────────────────────────────────────────────────────────
export default function PayrollConfigPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()

  const [config, setConfig]   = useState<PayrollConfig>(loadSavedConfig)
  const [draft, setDraft]     = useState<PayrollConfig>(loadSavedConfig)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [toast, setToast]     = useState<{ type: "success"|"error"|"info"; msg: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"insurance"|"tax"|"payroll"|"wages">("insurance")

  const isDirty = JSON.stringify(draft) !== JSON.stringify(config)

  const showToast = useCallback((type: "success"|"error"|"info", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setConfig({ ...draft })
    setSaved(true)
    setSaving(false)
    // Persist to localStorage so payroll page picks it up
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)) } catch {}
    showToast("success", vi ? "✅ Đã lưu cấu hình lương! Bảng lương sẽ tính lại theo công thức mới." : "✅ Config saved! Payroll will recalculate with the new formula.")
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setDraft({ ...DEFAULT_CONFIG })
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    showToast("info", vi ? "Đã khôi phục về giá trị mặc định (VN 2026)." : "Reset to VN 2026 defaults.")
  }

  const upd = (key: keyof PayrollConfig) => (v: number) => setDraft(d => ({ ...d, [key]: v }))

  // Summary card data
  const totalInsEmp      = draft.bhxh + draft.bhyt + draft.bhtn
  const totalInsEmployer = draft.bhxhEmployer + draft.bhytEmployer + draft.bhtnEmployer

  const TABS = [
    { id: "insurance", label: vi ? "Bảo hiểm" : "Insurance", icon: <Shield size={13}/> },
    { id: "tax",       label: vi ? "Thuế TNCN" : "Income Tax", icon: <Percent size={13}/> },
    { id: "payroll",   label: vi ? "Cài đặt lương" : "Payroll", icon: <Calculator size={13}/> },
    { id: "wages",     label: vi ? "Lương tối thiểu" : "Min Wage", icon: <DollarSign size={13}/> },
  ]

  return (
    <div style={{ padding: isMobile ? "16px 12px 32px" : "28px 28px 40px", maxWidth: "100%", overflowX: "hidden", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start", gap: isMobile ? 14 : 0, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <a href="/payroll" style={{ color: th.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, textDecoration: "none" }}>
              <ChevronLeft size={14}/>{vi ? "Quản lý tiền lương" : "Payroll Management"}
            </a>
          </div>
          <h1 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 800, color: th.text1, margin: 0 }}>
            {vi ? "Cấu hình công thức tính lương" : "Payroll Formula Configuration"}
          </h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
            {vi ? "Điều chỉnh tỷ lệ bảo hiểm, thuế TNCN và các thông số lương theo Luật Lao động VN 2026." : "Adjust insurance rates, income tax, and payroll parameters per VN Labor Law 2026."}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isDirty && (
            <span style={{ fontSize: 12, color: "#F59E0B", display: "flex", alignItems: "center", gap: 5 }}>
              <AlertCircle size={13}/>{vi ? "Có thay đổi chưa lưu" : "Unsaved changes"}
            </span>
          )}
          <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${th.cardBorder}`, background: th.cardBg, color: th.text1, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            <RotateCcw size={13}/>{vi ? "Mặc định" : "Reset"}
          </button>
          <button onClick={handleSave} disabled={saving || !isDirty} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: !isDirty ? (dark ? "#374151" : "#E5E7EB") : "linear-gradient(135deg,#D0211C,#991414)",
            color: !isDirty ? th.text3 : "#fff", fontSize: 13.5, fontWeight: 700, cursor: !isDirty ? "not-allowed" : "pointer",
            fontFamily: "inherit", boxShadow: isDirty ? "0 4px 14px rgba(208,33,28,0.3)" : "none",
            transition: "all .2s",
          }}>
            {saving
              ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/>{vi ? "Đang lưu..." : "Saving..."}</>
              : saved
              ? <><CheckCircle size={14}/>{vi ? "Đã lưu!" : "Saved!"}</>
              : <><Save size={14}/>{vi ? "Lưu cấu hình" : "Save Config"}</>}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 14, marginBottom: 22 }}>
        {[
          { icon: <Shield size={18}/>,     label: vi ? "BH nhân viên đóng" : "Employee Insurance", value: `${totalInsEmp}%`, accent: "#EF4444",     note: vi ? "BHXH + BHYT + BHTN" : "SI + HI + UI" },
          { icon: <Users size={18}/>,      label: vi ? "BH doanh nghiệp" : "Employer Insurance",  value: `${totalInsEmployer}%`, accent: "#F59E0B", note: vi ? "Tổng chi phí DN" : "Total employer cost" },
          { icon: <TrendingUp size={18}/>, label: vi ? "Giảm trừ bản thân" : "Self deduction", value: fmtM(draft.selfDeduction, vi), accent: "#10B981", note: vi ? "/người/tháng" : "/person/month" },
          { icon: <Clock size={18}/>,      label: vi ? "Ngày công chuẩn" : "Standard work days", value: `${draft.standardDays} ${vi?"ngày":"days"}`, accent: "#3B82F6", note: vi ? "Ngày tính lương" : "Per month base" },
        ].map(s => (
          <div key={s.label} style={{ background: th.cardBg, borderRadius: 14, padding: isMobile ? "12px 10px" : "16px 18px", borderTop: `1px solid ${th.cardBorder}`, borderRight: `1px solid ${th.cardBorder}`, borderBottom: `1px solid ${th.cardBorder}`, borderLeft: `4px solid ${s.accent}`, display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden", minWidth: 0 }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${s.accent}15`, pointerEvents: "none" }}/>
            <div style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: 10, background: `${s.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.accent }}>{s.icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: isMobile ? 10 : 11, color: th.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: s.accent }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: th.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 20 }}>

        {/* Left: Tabbed config */}
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: isMobile ? 2 : 6, marginBottom: 16, background: th.tableHead, borderRadius: 12, padding: isMobile ? 4 : 6, border: `1px solid ${th.cardBorder}`, overflowX: isMobile ? "auto" as const : "visible" as const, WebkitOverflowScrolling: "touch" as any }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: activeTab === t.id ? "#D0211C" : "none",
                color: activeTab === t.id ? "#fff" : th.text2,
                fontSize: 12.5, fontWeight: activeTab === t.id ? 700 : 400, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all .15s",
              }}>
                {t.icon}{isMobile ? null : t.label}
              </button>
            ))}
          </div>

          {/* Insurance tab */}
          {activeTab === "insurance" && (
            <div style={{ display: "grid", gap: 16 }}>
              <Section title={vi ? "Bảo hiểm bắt buộc — Nhân viên đóng" : "Mandatory Insurance — Employee Share"} icon={<Shield size={15}/>} th={th}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                  <NumField label={vi?"BH Xã hội (BHXH)":"Social Ins. (SI)"} value={draft.bhxh} onChange={upd("bhxh")} unit="%" min={0} max={25} step={0.5} note={vi?"Hưu trí, Thai sản, Ốm đau":"Pension, Maternity, Sickness"} th={th}/>
                  <NumField label={vi?"BH Y tế (BHYT)":"Health Ins. (HI)"} value={draft.bhyt} onChange={upd("bhyt")} unit="%" min={0} max={10} step={0.5} note={vi?"Khám chữa bệnh":"Medical insurance"} th={th}/>
                  <NumField label={vi?"BH Thất nghiệp (BHTN)":"Unemp. Ins. (UI)"} value={draft.bhtn} onChange={upd("bhtn")} unit="%" min={0} max={5} step={0.5} note={vi?"Trợ cấp thất nghiệp":"Unemployment benefit"} th={th}/>
                </div>
                <div style={{ marginTop: 14, padding: "12px 16px", background: dark ? "rgba(239,68,68,0.1)" : "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: th.text1, fontWeight: 600 }}>{vi ? "Tổng nhân viên đóng" : "Total employee contribution"}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#EF4444" }}>{totalInsEmp}%</span>
                </div>
              </Section>

              <Section title={vi ? "Bảo hiểm bắt buộc — Doanh nghiệp đóng" : "Mandatory Insurance — Employer Share"} icon={<Users size={15}/>} th={th}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                  <NumField label={vi?"BHXH (DN)":"SI (Employer)"} value={draft.bhxhEmployer} onChange={upd("bhxhEmployer")} unit="%" min={0} max={30} step={0.5} note={vi?"Phần doanh nghiệp đóng":"Employer share"} th={th}/>
                  <NumField label={vi?"BHYT (DN)":"HI (Employer)"} value={draft.bhytEmployer} onChange={upd("bhytEmployer")} unit="%" min={0} max={10} step={0.5} note={vi?"Phần doanh nghiệp đóng":"Employer share"} th={th}/>
                  <NumField label={vi?"BHTN (DN)":"UI (Employer)"} value={draft.bhtnEmployer} onChange={upd("bhtnEmployer")} unit="%" min={0} max={10} step={0.5} note={vi?"Phần doanh nghiệp đóng":"Employer share"} th={th}/>
                </div>
                <div style={{ marginTop: 14, padding: "12px 16px", background: dark ? "rgba(245,158,11,0.1)" : "#FEF3C7", borderRadius: 10, border: "1px solid #FCD34D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: th.text1, fontWeight: 600 }}>{vi ? "Tổng doanh nghiệp đóng" : "Total employer contribution"}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#D97706" }}>{totalInsEmployer}%</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "#3B82F6", display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: 1 }}/>
                  <span>{vi ? "Phần doanh nghiệp đóng không ảnh hưởng đến lương Net của nhân viên, chỉ dùng để báo cáo chi phí nhân sự." : "Employer share does not affect employee net salary; used for HR cost reporting only."}</span>
                </div>
              </Section>
            </div>
          )}

          {/* Tax tab */}
          {activeTab === "tax" && (
            <div style={{ display: "grid", gap: 16 }}>
              <Section title={vi ? "Giảm trừ gia cảnh (GTGC)" : "Personal Income Tax Deductions"} icon={<Percent size={15}/>} th={th}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <NumField
                    label={vi?"Giảm trừ bản thân (VND/tháng)":"Self deduction (VND/month)"}
                    value={draft.selfDeduction} onChange={upd("selfDeduction")}
                    unit="VND" min={0} max={50_000_000} step={500_000}
                    note={fmtM(draft.selfDeduction, vi) + (vi?" /tháng":" /month")} th={th}/>
                  <NumField
                    label={vi?"Giảm trừ người phụ thuộc (VND/người/tháng)":"Dependent deduction"}
                    value={draft.depDeduction} onChange={upd("depDeduction")}
                    unit="VND" min={0} max={20_000_000} step={200_000}
                    note={fmtM(draft.depDeduction, vi) + (vi?" /người/tháng":" /person/month")} th={th}/>
                </div>
                <div style={{ marginTop: 16, background: th.tableHead, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: th.text1, marginBottom: 7 }}>
                    {vi ? "Ví dụ tính giảm trừ:" : "Example:"}
                  </div>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: th.text2, marginBottom: 4 }}>
                      <span>{vi ? `${n} người phụ thuộc` : `${n} dependent(s)`}</span>
                      <span style={{ fontWeight: 700, color: "#10B981" }}>{fmtM(draft.selfDeduction + n * draft.depDeduction, vi)}{vi?"/tháng":"/mo"}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title={vi ? "Biểu thuế TNCN — 7 Bậc Lũy Tiến (Cố định theo Luật)" : "Progressive PIT Brackets (Fixed by Law)"} icon={<BookOpen size={15}/>} th={th}>
                <div style={{ marginBottom: 10, fontSize: 12.5, color: dark ? "#93C5FD" : "#1D4ED8", background: dark ? "rgba(59,130,246,0.1)" : "#EFF6FF", padding: "10px 14px", borderRadius: 10, display: "flex", gap: 7, border: "1px solid #BFDBFE" }}>
                  <Info size={14} style={{ flexShrink: 0 }}/>
                  <span>{vi ? "Biểu thuế lũy tiến 7 bậc là quy định nhà nước, KHÔNG thể chỉnh sửa." : "The 7-bracket progressive PIT is fixed by Vietnamese law and cannot be modified."}</span>
                </div>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any, margin: "0 -4px", padding: "0 4px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 480 : "auto" }}>
                  <thead><tr>
                    {[vi?"Bậc":"Bracket", vi?"Thu nhập tính thuế":"Taxable Income", vi?"Thuế suất":"Rate", vi?"Công thức rút gọn":"Quick Formula"].map(c => (
                      <th key={c} style={{ padding: "8px 12px", fontSize: 11.5, fontWeight: 700, color: th.tableHeadText, background: th.tableHead, borderBottom: `1px solid ${th.tableBorder}`, textAlign: "left" }}>{c}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {PIT_BRACKETS.map((b, i) => (
                      <tr key={i} style={{ transition: "background .1s" }} onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "9px 12px", fontSize: 13, color: th.text1, borderBottom: `1px solid ${th.tableBorder}`, fontWeight: 600 }}>{vi ? b.bracket : b.bracketEn}</td>
                        <td style={{ padding: "9px 12px", fontSize: 13, color: th.text2, borderBottom: `1px solid ${th.tableBorder}` }}>{vi ? b.range : b.rangeEn}</td>
                        <td style={{ padding: "9px 12px", borderBottom: `1px solid ${th.tableBorder}` }}>
                          <span style={{ background: "#D0211C", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{b.rate}</span>
                        </td>
                        <td style={{ padding: "9px 12px", fontSize: 12, color: th.text2, fontFamily: "monospace", borderBottom: `1px solid ${th.tableBorder}` }}>{vi ? b.formula : b.formulaEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </Section>
            </div>
          )}

          {/* Payroll settings tab */}
          {activeTab === "payroll" && (
            <div style={{ display: "grid", gap: 16 }}>
              <Section title={vi ? "Ngày công & Chi trả" : "Work Days & Pay Settings"} icon={<Clock size={15}/>} th={th}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <NumField label={vi?"Ngày công chuẩn/tháng":"Standard days/month"} value={draft.standardDays} onChange={upd("standardDays")} unit={vi?"ngày":"days"} min={20} max={31} step={1} note={vi?"Dùng để tính lương ngày":"Used for daily rate"} th={th}/>
                  <NumField label={vi?"Ngày chi lương (ngày/tháng)":"Pay day (day of month)"} value={draft.payDay} onChange={upd("payDay")} unit={vi?"ngày":"th"} min={1} max={31} step={1} note={vi?"VD: 5 = ngày 5 hàng tháng":"E.g. 5 = 5th of each month"} th={th}/>
                </div>
              </Section>

              <Section title={vi ? "Hệ số tăng ca (OT)" : "Overtime Multipliers"} icon={<Zap size={15}/>} th={th}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                  <NumField label={vi?"OT ngày thường (×)":"OT Weekday (×)"} value={draft.otWeekday} onChange={upd("otWeekday")} unit="×" min={1} max={5} step={0.1} note={vi?"Thường: ×1.5 (150%)":"Typical: ×1.5"} th={th}/>
                  <NumField label={vi?"OT cuối tuần (×)":"OT Weekend (×)"} value={draft.otWeekend} onChange={upd("otWeekend")} unit="×" min={1} max={5} step={0.1} note={vi?"Thường: ×2.0 (200%)":"Typical: ×2.0"} th={th}/>
                  <NumField label={vi?"OT ngày lễ (×)":"OT Holiday (×)"} value={draft.otHoliday} onChange={upd("otHoliday")} unit="×" min={1} max={5} step={0.1} note={vi?"Thường: ×3.0 (300%)":"Typical: ×3.0"} th={th}/>
                </div>
                <div style={{ marginTop: 14, background: th.tableHead, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: th.text1, marginBottom: 8 }}>
                    {vi ? "Công thức tính lương OT:" : "OT Pay Formula:"}
                  </div>
                  <div style={{ fontSize: 12.5, color: th.text2, lineHeight: 1.8, fontFamily: "monospace" }}>
                    {vi ? "Lương giờ = Gross HĐ ÷ (Ngày chuẩn × 8h)" : "Hourly rate = Gross ÷ (Standard days × 8h)"}
                    <br/>
                    {vi ? `OT ngày thường = Lương giờ × ${draft.otWeekday}` : `Weekday OT = Hourly × ${draft.otWeekday}`}
                    <br/>
                    {vi ? `OT cuối tuần = Lương giờ × ${draft.otWeekend}` : `Weekend OT = Hourly × ${draft.otWeekend}`}
                    <br/>
                    {vi ? `OT ngày lễ = Lương giờ × ${draft.otHoliday}` : `Holiday OT = Hourly × ${draft.otHoliday}`}
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* Min wage tab */}
          {activeTab === "wages" && (
            <Section title={vi ? "Lương tối thiểu vùng 2026 (Nghị định 74/2024/NĐ-CP)" : "Regional Minimum Wages 2026"} icon={<DollarSign size={15}/>} th={th}>
              <div style={{ marginBottom: 14, background: dark ? "rgba(59,130,246,0.1)" : "#EFF6FF", borderRadius: 10, padding: "11px 14px", fontSize: 12.5, color: dark ? "#93C5FD" : "#1D4ED8", display: "flex", gap: 7, border: "1px solid #BFDBFE" }}>
                <Info size={14} style={{ flexShrink: 0 }}/>
                <span>{vi ? "AXIOM đặt tại Vùng 1. Lương tối thiểu vùng là cơ sở đóng BHXH tối thiểu." : "AXIOM is in Region 1. Regional minimum wage is the base for minimum social insurance contribution."}</span>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { label: vi ? "Vùng 1 (HCM, HN, nội thành)" : "Region 1 (Ho Chi Minh City, Hanoi inner)", key: "minWageRegion1" as const, accent: "#D0211C", note: vi?"Áp dụng cho AXIOM HCM":"Applied to AXIOM HCMC" },
                  { label: vi ? "Vùng 2 (Các đô thị lớn)" : "Region 2 (Major cities)",   key: "minWageRegion2" as const, accent: "#F59E0B", note: "" },
                  { label: vi ? "Vùng 3 (Các tỉnh còn lại)" : "Region 3 (Provincial areas)", key: "minWageRegion3" as const, accent: "#10B981", note: "" },
                  { label: vi ? "Vùng 4 (Nông thôn, miền núi)" : "Region 4 (Rural, mountainous)", key: "minWageRegion4" as const, accent: "#3B82F6", note: "" },
                ].map(r => (
                  <div key={r.key} style={{ display: "flex", flexDirection: isMobile ? "column" as const : "row" as const, alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 10 : 14, padding: isMobile ? "12px 12px" : "14px 16px", background: th.tableHead, borderRadius: 12, borderTop: `1px solid ${th.cardBorder}`, borderRight: `1px solid ${th.cardBorder}`, borderBottom: `1px solid ${th.cardBorder}`, borderLeft: `4px solid ${r.accent}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: th.text1 }}>{r.label}</div>
                      {r.note && <div style={{ fontSize: 11.5, color: r.accent, marginTop: 2 }}>★ {r.note}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="number" value={draft[r.key]} min={0} max={20_000_000} step={100_000}
                        onChange={e => setDraft(d => ({ ...d, [r.key]: parseFloat(e.target.value)||0 }))}
                        onFocus={e => (e.target.style.borderColor = "#D0211C")}
                        onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                        style={{ width: isMobile ? "100%" : 140, padding: "8px 12px", border: `1.5px solid ${th.inputBorder}`, borderRadius: 9, fontSize: 14, background: th.inputBg, color: th.text1, outline: "none", fontFamily: "inherit", transition: "border-color .15s", boxSizing: "border-box" as const }}/>
                      <span style={{ fontSize: 12.5, color: r.accent, fontWeight: 700 }}>{fmtM(draft[r.key], vi)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right: Info sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Change summary */}
          {isDirty && (
            <div style={{ background: dark ? "rgba(245,158,11,0.1)" : "#FFFBEB", borderRadius: 16, padding: "16px", border: "1px solid #FCD34D" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#D97706", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={14}/>{vi ? "Thay đổi chưa lưu" : "Pending Changes"}
              </div>
              {(Object.keys(draft) as (keyof PayrollConfig)[])
                .filter(k => draft[k] !== config[k])
                .slice(0, 6)
                .map(k => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: th.text2, marginBottom: 4 }}>
                    <span style={{ color: th.text1, fontWeight: 500 }}>{k}</span>
                    <span>
                      <span style={{ color: "#EF4444", textDecoration: "line-through", marginRight: 6 }}>{config[k]}</span>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>→ {draft[k]}</span>
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Effective formula */}
          <div style={{ background: th.cardBg, borderRadius: 16, padding: "18px", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
              <Calculator size={16} color="#D0211C"/>
              {vi ? "Công thức áp dụng" : "Applied Formula"}
            </div>
            <div style={{ background: "linear-gradient(135deg,rgba(208,33,28,0.08),rgba(153,20,20,0.04))", borderRadius: 12, padding: "14px", fontSize: 12.5, color: th.text1, lineHeight: 1.9, border: "1px solid rgba(208,33,28,0.15)", fontFamily: "monospace" }}>
              <span style={{ color: "#10B981", fontWeight: 700 }}>Net</span> = {vi ? "Gross_thực_tế" : "Actual_Gross"}
              <br/>+ {vi ? "OT + Thưởng + Phụ_cấp" : "OT + Bonus + Allowances"}
              <br/>− <span style={{ color: "#EF4444" }}>{vi ? "BH" : "Insurance"} ({totalInsEmp}%)</span>
              <br/>− <span style={{ color: "#D97706" }}>{vi ? "Thuế_TNCN" : "Income_Tax"}</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: th.text2, lineHeight: 1.7 }}>
              <div>• {vi ? `BHXH: ${draft.bhxh}% · BHYT: ${draft.bhyt}% · BHTN: ${draft.bhtn}%` : `SI: ${draft.bhxh}% · HI: ${draft.bhyt}% · UI: ${draft.bhtn}%`}</div>
              <div>• {vi ? `Ngày chuẩn: ${draft.standardDays} ngày` : `Standard: ${draft.standardDays} days`}</div>
              <div>• {vi ? `Chi lương ngày ${draft.payDay} hàng tháng` : `Pay day: ${draft.payDay}th of month`}</div>
              <div>• {vi ? `Giảm trừ bản thân: ${fmtM(draft.selfDeduction, vi)}/tháng` : `Self deduction: ${fmtM(draft.selfDeduction, vi)}/mo`}</div>
            </div>
          </div>

          {/* Legal reference */}
          <div style={{ background: dark ? "rgba(59,130,246,0.08)" : "#EFF6FF", borderRadius: 16, padding: "16px", border: "1px solid #BFDBFE" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: dark ? "#93C5FD" : "#1D4ED8", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={14}/>{vi ? "Căn cứ pháp lý" : "Legal References"}
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: dark ? "#93C5FD" : "#1E40AF", lineHeight: 1.9 }}>
              <li>{vi?"Luật BHXH số 58/2014/QH13":"Law 58/2014/QH13 – Social Insurance"}</li>
              <li>{vi?"TT 59/2015/TT-BLĐTBXH":"Circular 59/2015 – Insurance base"}</li>
              <li>{vi?"Luật Thuế TNCN sửa đổi 2025":"Income Tax Law (amended 2025)"}</li>
              <li>{vi?"NĐ 74/2024/NĐ-CP – Lương tối thiểu":"Decree 74/2024 – Min. wage 2026"}</li>
              <li>{vi?"Bộ luật Lao động 2019 (OT)":"Labor Code 2019 (OT rates)"}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : "#3B82F6", color: "#fff", padding: "13px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeDown .2s ease", fontSize: 14, fontWeight: 600, maxWidth: 420 }}>
          {toast.type === "success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/> }{toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
