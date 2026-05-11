/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"

import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react"
import { calculateIncomeTax, calculateOTPay } from "@/lib/helpers/payroll-calculator"
import {
  Eye, Send, RefreshCw, X, Calculator,
  CheckCircle, AlertCircle, Zap,
  TrendingUp, Shield, Banknote, Users, Info,
  ChevronLeft, ChevronRight, Check,
  ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getPayrollByPeriod, calculatePayrollBatch, confirmPayment } from "@/lib/actions/payroll.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { tDept } from "@/lib/i18n-maps"
import { AvatarImg } from "@/components/ui/avatar-img"

// ─── Types ─────────────────────────────────────────────────────────────
interface Employee {
  id:                  string
  name:                string
  dept:                string
  position:            string
  grossSalary:         number   // Lương Gross theo HĐ
  taxableAllowance:    number   // Phụ cấp chịu thuế (tính vào TNTT)
  taxExemptAllowance:  number   // Phụ cấp miễn thuế (ăn trưa, đi lại, điện thoại...)
  dependents:          number   // Số người phụ thuộc
  workDays:            number   // Ngày công thực tế tháng này
  standardDays:        number   // Ngày chuẩn tháng (thường 24-26)
  otWeekday:           number   // Giờ OT ngày thường (×150%)
  otWeekend:           number   // Giờ OT cuối tuần (×200%)
  otHoliday:           number   // Giờ OT ngày lễ  (×300%)
  bonus:               number   // Thưởng tháng
  status:              "paid" | "pending" | "draft"
  // Giá trị đã tính sẵn từ DB (optional, dùng khi cần hiển thị chính xác)
  _dbGross?:           number
  _dbNet?:             number
  _dbWorkDays?:        number
  _dbOtPay?:           number
  _dbInsurance?:       number
  _dbTaxAmount?:       number
}

interface PayrollConfig {
  bhxh:          number   // 8% (mặc định)
  bhyt:          number   // 1.5%
  bhtn:          number   // 1%
  selfDeduction: number   // Giảm trừ bản thân: 15,500,000 VND/tháng
  depDeduction:  number   // Giảm trừ người phụ thuộc: 6,200,000/người/tháng
}

const DEFAULT_CONFIG: PayrollConfig = {
  bhxh: 8, bhyt: 1.5, bhtn: 1,
  selfDeduction: 15_500_000,   // Nghị quyết 107/2023/QH15 (VN 2026)
  depDeduction:   6_200_000,   // 6.2 triệu/người phụ thuộc
}

// ═══════════════════════════════════════════════════════════════════════
//  CORE CALCULATION ENGINE  (Theo Luật Lao động VN 2026)
//  ⚡ Dùng calculateIncomeTax + calculateOTPay từ payroll-calculator.ts
//     (Single source of truth — cùng engine với backend DB)
// ═══════════════════════════════════════════════════════════════════════
function calcPayroll(emp: Employee, cfg: PayrollConfig) {
  // ── 1. Lương thực tế theo ngày công ──────────────────────
  const earnedSalary = (emp.grossSalary / emp.standardDays) * emp.workDays

  // ── 2. Lương tăng ca OT (3 loại) — shared engine ─────────
  //    calculateOTPay từ payroll-calculator.ts (×150%/200%/300%)
  const otResult = calculateOTPay({
    basePay:         earnedSalary,
    standardDays:    emp.standardDays,
    otWeekdayHours:  emp.otWeekday,
    otWeekendHours:  emp.otWeekend,
    otHolidayHours:  emp.otHoliday,
  })
  const { otWeekdayPay, otWeekendPay, otHolidayPay } = otResult
  const totalOT = otResult.total

  // ── 3. Tổng Gross (ngày công + OT + thưởng) ─────────────
  const totalGross = earnedSalary + totalOT + emp.bonus

  // ── 4. Bảo hiểm bắt buộc (NLĐ đóng) theo cfg ────────────
  //    Tính trên earned salary (TT 59/2015 — không tính OT/thưởng)
  const totalInsuranceRate = cfg.bhxh + cfg.bhyt + cfg.bhtn   // mặc định 10.5%
  const bhxhAmt  = Math.round(earnedSalary * cfg.bhxh / 100)
  const bhytAmt  = Math.round(earnedSalary * cfg.bhyt / 100)
  const bhtnAmt  = Math.round(earnedSalary * cfg.bhtn / 100)
  const insurance = bhxhAmt + bhytAmt + bhtnAmt

  // ── 5. Thu nhập tính thuế (TNTT) ─────────────────────────
  //    TNTT = (Gross + Phụ cấp chịu thuế) − BH − Giảm trừ gia cảnh
  const totalTaxableIncome = totalGross + emp.taxableAllowance - insurance
  const familyDeduction    = cfg.selfDeduction + emp.dependents * cfg.depDeduction
  const taxableIncome      = Math.max(0, totalTaxableIncome - familyDeduction)

  // ── 6. Thuế TNCN — calculateIncomeTax (shared, 5 bậc VN 2026) ───
  //    ✅ Cùng engine với backend — không còn 2 hàm riêng biệt
  const pit = calculateIncomeTax(taxableIncome)

  // ── 7. Net = (Gross + Tổng phụ cấp) − BH − Thuế ─────────
  const totalAllowance = emp.taxableAllowance + emp.taxExemptAllowance
  const net = Math.round((totalGross + totalAllowance) - insurance - pit)

  return {
    earnedSalary, totalOT, otWeekdayPay, otWeekendPay, otHolidayPay,
    totalGross, totalAllowance,
    bhxhAmt, bhytAmt, bhtnAmt, insurance, totalInsuranceRate,
    totalTaxableIncome, familyDeduction, taxableIncome,
    pit, net,
  }
}

// ─── Formatters ─────────────────────────────────────────────────────────
function _fmt(v: number, vi = true): string {
  return Math.round(Math.abs(v)).toLocaleString("vi-VN") + (vi ? " đ" : " VND")
}
function fmtShort(v: number, vi = true): string {
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + (vi ? "tr" : "M")
  return v.toLocaleString("vi-VN")
}

// ─── EmpAvatar ──────────────────────────────────────────────────────────
const EmpAvatar = memo(function EmpAvatar({
  name, avatarPath, size = 32,
}: { name: string; avatarPath?: string | null; size?: number }) {
  return <AvatarImg src={avatarPath} name={name} alt={name} size={size} />
})

// ─── Toast ─────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: {type:"success"|"error"|"info"; msg:string}|null }) {
  if (!toast) return null
  const bg = { success:"#10B981", error:"#EF4444", info:"#3B82F6" }[toast.type]
  const Icon = toast.type === "success" ? CheckCircle : AlertCircle
  return (
    <div style={{ position:"fixed", bottom:32, right:32, zIndex:9999,
      background:bg, color:"#fff", padding:"13px 20px", borderRadius:14,
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 24px rgba(0,0,0,0.2)", animation:"fadeDown .2s ease",
      fontSize:14, fontWeight:600, maxWidth:380 }}>
      <Icon size={18}/>{toast.msg}
    </div>
  )
}

// ── SortTh: sortable table header for payroll ────────────────
type PaySortField = "name" | "days" | "gross" | "net" | null
type SortDir = "asc" | "desc"

function SortTh({
  label, field, sortField, sortDir, onSort, onClear, th, options, hdStyle, vi,
}: {
  label: string
  field: PaySortField
  sortField: PaySortField
  sortDir: SortDir
  onSort: (f: PaySortField, d: SortDir) => void
  onClear: () => void
  th: any
  options?: { label: string; dir: SortDir }[]
  hdStyle: React.CSSProperties
  vi?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTableCellElement>(null)
  const active = sortField === field

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  if (!field || !options) {
    return <th style={hdStyle}>{label}</th>
  }

  return (
    <th ref={ref} style={{ ...hdStyle, position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer",
          color: active ? "#D0211C" : th.tableHeadText,
          fontWeight: 700, fontSize: 11, fontFamily: "inherit", padding: 0,
          letterSpacing: "0.02em",
        }}
      >
        {label}
        {active
          ? sortDir === "asc"
            ? <ArrowUp size={10} color="#D0211C" />
            : <ArrowDown size={10} color="#D0211C" />
          : <ArrowUpDown size={9} style={{ opacity: 0.4 }} />
        }
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 300,
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
          minWidth: 160, overflow: "hidden",
        }}>
          <button
            onClick={() => { onClear(); setOpen(false) }}
            style={{
              width: "100%", padding: "8px 12px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontSize: 12, color: th.text2, fontFamily: "inherit", textAlign: "left",
              borderBottom: `1px solid ${th.tableBorder}`,
            }}
          >
            <X size={12} /> {vi ? "Mặc định" : "Default"}
          </button>
          {options.map(opt => {
            const sel = active && sortDir === opt.dir
            return (
              <button
                key={opt.dir}
                onClick={() => { onSort(field, opt.dir); setOpen(false) }}
                style={{
                  width: "100%", padding: "8px 12px",
                  background: sel ? "rgba(208,33,28,0.08)" : "none",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: 12, color: sel ? "#D0211C" : th.text1,
                  fontWeight: sel ? 700 : 400, fontFamily: "inherit", textAlign: "left",
                }}
              >
                {sel ? <Check size={12} color="#D0211C" /> : <div style={{ width: 12 }} />}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </th>
  )
}

// ── FilterPopup ──────────────────────────────────────────────
function FilterPopup({
  label, value, options, onChange, onClear, th,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  onClear: () => void
  th: any
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = value !== ""

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  const selectedLabel = options.find(o => o.value === value)?.label

  return (
    <div ref={ref} style={{ position:"relative", flexShrink:0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"6px 13px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
          fontSize:13, fontWeight: active ? 700 : 500, whiteSpace:"nowrap",
          border: active ? "1.5px solid #D0211C" : `1.5px solid ${th.cardBorder}`,
          background: active ? "rgba(208,33,28,0.07)" : th.tableHead,
          color: active ? "#D0211C" : th.text2,
          transition:"all .15s",
          boxShadow: active ? "0 0 0 3px rgba(208,33,28,0.1)" : "none",
        }}
      >
        {active ? selectedLabel : label}
        {active
          ? <X size={13} onClick={e => { e.stopPropagation(); onClear(); setOpen(false) }} style={{ cursor:"pointer", opacity:0.7 }}/>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        }
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:300,
          background:th.cardBg, border:`1px solid ${th.cardBorder}`,
          borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.14)",
          minWidth:190, overflow:"hidden",
        }}>
          {options.map(opt => {
            const sel = value === opt.value
            return (
              <button key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width:"100%", padding:"9px 14px",
                  background: sel ? "rgba(208,33,28,0.08)" : "none",
                  border:"none", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8,
                  fontSize:13, color: sel ? "#D0211C" : th.text1,
                  fontWeight: sel ? 700 : 400,
                  fontFamily:"inherit", textAlign:"left",
                  borderBottom:`1px solid ${th.tableBorder}`,
                }}
              >
                <div style={{ width:16, display:"flex", justifyContent:"center" }}>
                  {sel && <Check size={13} color="#D0211C"/>}
                </div>
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function PayrollPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()
  // Local fmt wrapper capturing `vi` from context — all 15+ call sites auto-translated
  const fmt = (v: number) => _fmt(v, vi)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [dbPayrolls, setDbPayrolls] = useState<any[]>([])
  const [loadingDB, setLoadingDB] = useState(true)
  const [config, setConfig] = useState<PayrollConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG
    try {
      const raw = localStorage.getItem("axiom_payroll_config")
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_CONFIG
  })
  const [configDraft, setConfigDraft] = useState<PayrollConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG
    try {
      const raw = localStorage.getItem("axiom_payroll_config")
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_CONFIG
  })

  // ── 12 tháng gần nhất (tự động theo thời gian thực) ─────────────────
  const MONTHS = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      return {
        month: m, year: y,
        vi: `Tháng ${m}/${y}`,
        en: d.toLocaleString("en-US", { month: "short" }) + " " + y,
      }
    }).reverse()  // từ cũ → mới
  }, [])
  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date()
    return { month: now.getMonth() + 1, year: now.getFullYear(),
      vi: `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`,
      en: now.toLocaleString("en-US", { month: "short" }) + " " + now.getFullYear() }
  })
  const [selected, setSelected] = useState<Employee | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [toast, setToast] = useState<{type:"success"|"error"|"info"; msg:string}|null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [editBonus, setEditBonus] = useState<{id:string; val:string}|null>(null)

  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [filterDept, setFilterDept] = useState("")
  const [sortField, setSortField]   = useState<PaySortField>(null)
  const [sortDir, setSortDir]       = useState<SortDir>("asc")

  // ── Load từ DB theo tháng được chọn ─────────────────────────
  const loadDB = useCallback(async () => {
    setLoadingDB(true)
    setSelected(null)
    const res = await getPayrollByPeriod(activeMonth.month, activeMonth.year)
    if (res.success && res.data) {
      const mapped: Employee[] = (res.data as any[]).map(p => ({
        id:                  p.employee?.code ?? String(p.employeeId),
        name:                p.employee?.fullName ?? "—",
        dept:                p.employee?.department?.name ?? "—",
        position:            p.employee?.position?.name ?? "—",
        grossSalary:         Number(p.baseSalary),
        taxableAllowance:    0,
        taxExemptAllowance:  Number(p.allowance ?? 0),
        dependents:          p.employee?.numDependents ?? 0,
        workDays:            Number(p.workDays) > 0 ? Number(p.workDays) : 24,
        standardDays:        24,
        otWeekday:           Number(p.otHours ?? 0),
        otWeekend:           0,
        otHoliday:           0,
        bonus:               0,
        status:              p.status === "Đã thanh toán" ? "paid" : p.status === "Đã tính" ? "pending" : "draft",
        // Giá trị đã tính sẵn từ DB (dùng cho hiển thị trong chi tiết phiếu)
        _dbGross:            Number(p.grossSalary ?? 0),
        _dbNet:              Number(p.netSalary ?? 0),
        _dbWorkDays:         Number(p.workDays ?? 0),
        _dbOtPay:            Number(p.otPay ?? 0),
        _dbInsurance:        Number(p.bhxh ?? 0) + Number(p.bhyt ?? 0) + Number(p.bhtn ?? 0),
        _dbTaxAmount:        Number(p.taxAmount ?? 0),
      }))
      setEmployees(mapped)
      setDbPayrolls(res.data as any[])
    } else {
      setEmployees([])
      setDbPayrolls([])
    }
    setLoadingDB(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonth])

  useEffect(() => { loadDB() }, [loadDB])
  useEffect(() => { setPage(1) }, [employees])
  useEffect(() => { setPage(1) }, [filterDept])

  const showToast = useCallback((type:"success"|"error"|"info", msg:string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Tính lương cho tất cả ────────────────────────────────
  const payrollData = useMemo(() =>
    employees.map(e => ({ emp: e, calc: calcPayroll(e, config) })),
    [employees, config]
  )

  // ── Danh sách phòng ban để filter ───────────────────────
  const deptOptions = useMemo(() => {
    const unique = Array.from(new Set(employees.map(e => e.dept).filter(Boolean)))
    return unique.sort().map(d => ({ value: d, label: tDept(d, vi) }))
  }, [employees, vi])

  // ── Lọc theo phòng ban + sort ───────────────────────────
  const filteredPayroll = useMemo(() => {
    let result = filterDept
      ? payrollData.filter(({ emp }) => emp.dept === filterDept)
      : payrollData
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        if (sortField === "name")  cmp = a.emp.name.localeCompare(b.emp.name, "vi")
        if (sortField === "days")  cmp = a.emp.workDays - b.emp.workDays
        if (sortField === "gross") cmp = a.calc.earnedSalary - b.calc.earnedSalary
        if (sortField === "net")   cmp = a.calc.net - b.calc.net
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  }, [payrollData, filterDept, sortField, sortDir])

  function handleSort(f: PaySortField, d: SortDir) { setSortField(f); setSortDir(d) }
  function clearSort() { setSortField(null); setSortDir("asc") }

  const totals = useMemo(() => payrollData.reduce((acc, { calc }) => ({
    gross: acc.gross + calc.totalGross,
    net:   acc.net   + calc.net,
    pit:   acc.pit   + calc.pit,
    ins:   acc.ins   + calc.insurance,
  }), { gross:0, net:0, pit:0, ins:0 }), [payrollData])

  // Pagination dựa trên filteredPayroll
  const totalPages = Math.max(1, Math.ceil(filteredPayroll.length / PAGE_SIZE))
  const pageRows   = filteredPayroll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Nút Tính lương tự động — gọi Server Action thật ────────────────
  const handleAutoCalc = async () => {
    setCalculating(true)
    const res = await calculatePayrollBatch(activeMonth.month, activeMonth.year)
    if (res.success) {
      const d = (res as any).data ?? {}
      const done = d.success ?? "?", total = (d.success ?? 0) + (d.failed ?? 0)
      showToast("success", vi
        ? `Đã tính lương ${done}/${total || done} nhân viên`
        : `Calculated payroll for ${done}/${total || done} employees`)
      await loadDB()   // reload từ DB — hiển thị số chính xác
    } else {
      showToast("error", vi
        ? (res.error ?? "Lỗi khi tính lương")
        : (res.error ?? "Payroll calculation failed"))
    }
    setCalculating(false)
  }

  const handleConfirmPay = async (id: string) => {
    // Tìm payroll record trong dbPayrolls theo employee code
    const dbRecord = dbPayrolls.find((p: any) =>
      (p.employee?.code ?? String(p.employeeId)) === id
    )
    if (!dbRecord) {
      showToast("error", vi ? "Không tìm thấy bản lương" : "Payroll record not found")
      return
    }
    const res = await confirmPayment(dbRecord.id)
    if (res.success) {
      showToast("success", vi ? "Đã xác nhận chi lương!" : "Payment confirmed!")
      await loadDB()   // reload — cập nhật trạng thái từ DB
    } else {
      showToast("error", vi ? (res.error ?? "Lỗi xác nhận") : (res.error ?? "Confirmation failed"))
    }
  }

  const handleSaveConfig = () => {
    setConfig({ ...configDraft })
    try { localStorage.setItem("axiom_payroll_config", JSON.stringify(configDraft)) } catch {}
    setShowConfig(false)
    showToast("info", vi?"Đã lưu cấu hình. Bảng lương đã cập nhật theo công thức mới.":"Config saved. Payroll recalculated.")
  }

  const handleSaveBonus = (id: string, val: string) => {
    const num = (parseFloat(val.replace(/,/g,".")) || 0) * 1_000_000
    setEmployees(prev => prev.map(e => e.id===id ? { ...e, bonus: num } : e))
    setEditBonus(null)
  }

  // ── Styles ───────────────────────────────────────────────
  const hd: React.CSSProperties = {
    padding:"10px 11px", fontSize:11, fontWeight:700,
    color:th.tableHeadText, background:th.tableHead,
    borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left",
    whiteSpace:"nowrap", letterSpacing:"0.03em",
  }

  const sortName  = [{ label: vi ? "A → Z" : "A → Z",          dir: "asc" as SortDir }, { label: vi ? "Z → A" : "Z → A",      dir: "desc" as SortDir }]
  const sortDays  = [{ label: vi ? "Tăng dần" : "Ascending",     dir: "asc" as SortDir }, { label: vi ? "Giảm dần" : "Descending", dir: "desc" as SortDir }]
  const sortMoney = [{ label: vi ? "Thấp → Cao" : "Low → High", dir: "asc" as SortDir }, { label: vi ? "Cao → Thấp" : "High → Low", dir: "desc" as SortDir }]
  const td: React.CSSProperties = {
    padding:"11px 11px", fontSize:12.5, color:th.text1,
    borderBottom:`1px solid ${th.tableBorder}`, verticalAlign:"middle",
  }
  const inputStyle: React.CSSProperties = {
    padding:"8px 11px", border:`1.5px solid ${th.inputBorder}`,
    borderRadius:8, fontSize:13, background:th.inputBg, color:th.text1,
    outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box",
  }

  const paidCount    = employees.filter(e=>e.status==="paid").length
  const pendingCount = employees.filter(e=>e.status==="pending").length
  const draftCount   = employees.filter(e=>e.status==="draft").length
  const selectedCalc = selected ? calcPayroll(selected, config) : null

  const statCards = [
    { icon:<Banknote size={20} color="#D0211C"/>,   label:vi?"Tổng Gross":"Total Gross",   value:fmtShort(totals.gross, vi)+(vi?"đ":" VND"), accent:"#D0211C" },
    { icon:<TrendingUp size={20} color="#059669"/>, label:vi?"Tổng Net về tay":"Total Net", value:fmtShort(totals.net, vi)+(vi?"đ":" VND"),   accent:"#059669" },
    { icon:<Shield size={20} color="#D97706"/>,     label:vi?"Thuế TNCN":"PIT",                    value:fmtShort(totals.pit, vi)+(vi?"đ":" VND"),   accent:"#D97706" },
    { icon:<Users size={20} color="#3B82F6"/>,      label:vi?"Đã thanh toán":"Paid",        value:`${paidCount}/${employees.length}`, accent:"#3B82F6" },
  ]

  // ── Payslip rows helper ──────────────────────────────────
  function payslipRows(emp: Employee, c: ReturnType<typeof calcPayroll>) {
    return [
      { label: vi?"Lương Gross (HĐ)":"Contract Gross",              val: emp.grossSalary,         type:"normal" },
      { label: vi?`Theo ngày công (${emp.workDays}/${emp.standardDays})`:`Work days (${emp.workDays}/${emp.standardDays})`, val: c.earnedSalary, type:"normal" },
      ...(emp.otWeekday  > 0 ? [{ label: vi?`OT ngày thường (${emp.otWeekday}h × 150%)`:`OT weekday (${emp.otWeekday}h × 150%)`, val: c.otWeekdayPay, type:"bonus" as const }] : []),
      ...(emp.otWeekend  > 0 ? [{ label: vi?`OT cuối tuần (${emp.otWeekend}h × 200%)`:`OT weekend (${emp.otWeekend}h × 200%)`, val: c.otWeekendPay, type:"bonus" as const }] : []),
      ...(emp.otHoliday  > 0 ? [{ label: vi?`OT ngày lễ (${emp.otHoliday}h × 300%)`:`OT holiday (${emp.otHoliday}h × 300%)`, val: c.otHolidayPay, type:"bonus" as const }] : []),
      ...(emp.bonus      > 0 ? [{ label: vi?"Thưởng":"Bonus",                                     val: emp.bonus,               type:"bonus" as const }] : []),
      { label: vi?"Phụ cấp miễn thuế":"Tax-exempt allowance",       val: emp.taxExemptAllowance,  type:"bonus" },
      ...(emp.taxableAllowance > 0 ? [{ label: vi?"Phụ cấp chịu thuế":"Taxable allowance",       val: emp.taxableAllowance, type:"bonus" as const }] : []),
      { label: vi?"━━ TỔNG GROSS + PHỤ CẤP":"━━ GROSS + ALLOWANCES", val: c.totalGross + c.totalAllowance, type:"total" },
      { label: vi?`BHXH (${config.bhxh}% × ngày công)`:  `Social Ins. (${config.bhxh}%)`,          val: -c.bhxhAmt,              type:"deduct" },
      { label: vi?`BHYT (${config.bhyt}% × ngày công)`:  `Health Ins. (${config.bhyt}%)`,          val: -c.bhytAmt,              type:"deduct" },
      { label: vi?`BHTN (${config.bhtn}% × ngày công)`:  `Unemp. Ins. (${config.bhtn}%)`,          val: -c.bhtnAmt,              type:"deduct" },
      { label: vi?"Giảm trừ bản thân":"Self deduction",             val: config.selfDeduction,    type:"info"   },
      ...(emp.dependents > 0 ? [{ label: vi?`Giảm trừ ${emp.dependents} người phụ thuộc`:`${emp.dependents} dependents`, val: emp.dependents * config.depDeduction, type:"info" as const }] : []),
      { label: vi?"Thu nhập tính thuế (TNTT)":"Taxable income",      val: c.taxableIncome,        type:"info"   },
      { label: vi?"Thuế TNCN (lũy tiến 5 bậc)":"PIT (5-bracket)",   val: -c.pit,                 type:"deduct" },
    ]
  }

  return (
    <div className="page-pad">

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Quản lý tiền lương":"Payroll Management"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi?"Tính lương tự động — Biểu thuế TNCN 5 bậc · BH 10.5% · Luật LĐ VN 2026":"Auto payroll — VN 2026: 5-bracket PIT · 10.5% Insurance"}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={handleAutoCalc} disabled={calculating} style={{
            display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:10,
            background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", border:"none",
            fontSize:13.5, fontWeight:700, cursor:calculating?"not-allowed":"pointer",
            fontFamily:"inherit", boxShadow:"0 4px 14px rgba(208,33,28,0.32)",
            opacity:calculating?0.85:1, transition:"transform .15s",
          }}
          onMouseEnter={e=>{ if(!calculating)(e.currentTarget as HTMLElement).style.transform="translateY(-1px)" }}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="none"}
          >
            {calculating
              ? <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>{vi?"Đang tính...":"Calculating..."}</>
              : <><Zap size={15}/>{vi?"Tính lương tự động":"Auto Calculate"}</> }
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="rg-4" style={{ marginBottom: 20 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background:th.cardBg, borderRadius:14, padding:"16px 18px",
            borderTop:`1px solid ${th.cardBorder}`, borderRight:`1px solid ${th.cardBorder}`, borderBottom:`1px solid ${th.cardBorder}`, borderLeft:`4px solid ${s.accent}`,
            display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:`${s.accent}15`, pointerEvents:"none" }}/>
            <div style={{ width:44, height:44, borderRadius:11, background:dark?`${s.accent}22`:`${s.accent}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {s.icon}
            </div>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:11.5, color:th.text2 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:s.accent }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Month dropdown + status legend ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        {/* Month selector */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <RefreshCw size={13} color={th.text2}/>
          <select
            value={`${activeMonth.month}-${activeMonth.year}`}
            onChange={e => {
              const found = MONTHS.find(m => `${m.month}-${m.year}` === e.target.value)
              if (found) setActiveMonth(found)
            }}
            disabled={loadingDB}
            style={{
              padding:"6px 32px 6px 12px", borderRadius:9,
              border:`1.5px solid ${th.cardBorder}`,
              background: th.tableHead, color: th.text1,
              fontSize:13, fontWeight:600, cursor: loadingDB ? "not-allowed" : "pointer",
              outline:"none", fontFamily:"inherit",
              appearance:"none",
              backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center",
              opacity: loadingDB ? 0.6 : 1,
              transition:"border-color .15s",
            }}
          >
            {MONTHS.map(m => (
              <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                {vi ? m.vi : m.en}
              </option>
            ))}
          </select>
          {loadingDB && (
            <span style={{ width:14, height:14, border:"2px solid rgba(208,33,28,0.3)",
              borderTopColor:"#D0211C", borderRadius:"50%",
              display:"inline-block", animation:"spin .7s linear infinite" }}/>
          )}
          {/* Phân cách */}
          <span style={{ width:1, height:20, background:th.cardBorder, flexShrink:0 }}/>
          {/* Filter phòng ban */}
          <FilterPopup
            label={vi ? "Phòng ban" : "Department"}
            value={filterDept}
            options={deptOptions}
            onChange={setFilterDept}
            onClear={() => setFilterDept("")}
            th={th}
          />
          {/* Hiển thị số NV đang lọc */}
          {filterDept && (
            <span style={{ fontSize:12, color:th.text2 }}>
              {filteredPayroll.length} {vi ? "nhân viên" : "employees"}
            </span>
          )}
        </div>
        {/* Status legend */}
        <div style={{ display:"flex", gap:14, fontSize:12 }}>
          {[
            { label:vi?"Đã TT":"Paid",    count:paidCount,    bg:"#D1FAE5", c:"#065F46" },
            { label:vi?"Chờ TT":"Pending",count:pendingCount, bg:"#FEF3C7", c:"#92400E" },
            { label:vi?"Nháp":"Draft",    count:draftCount,   bg:"#F3F4F6", c:"#374151" },
          ].map(b => (
            <span key={b.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ background:b.bg, color:b.c, borderRadius:8, padding:"2px 8px", fontWeight:700, fontSize:11.5 }}>{b.count}</span>
              <span style={{ color:th.text2 }}>{b.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Payroll Table ── */}
      <div style={{ background:th.cardBg, borderRadius:14, overflow:"hidden",
        border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", marginBottom:20 }}>
        <div className="table-scroll">
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            <SortTh label={vi?"Nhân viên":"Employee"} field="name" sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} options={sortName} hdStyle={hd} vi={vi}/>
            <SortTh label={vi?"Ngày công":"Days"} field="days" sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} options={sortDays} hdStyle={hd} vi={vi}/>
            <SortTh label={vi?"Gross (HĐ)":"Gross"} field="gross" sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} options={sortMoney} hdStyle={hd} vi={vi}/>
            <SortTh label={vi?"Lương OT":"OT"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} hdStyle={hd}/>
            <SortTh label={vi?"Thưởng":"Bonus"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} hdStyle={hd}/>
            <SortTh label={vi?"BH (10.5%)":"Insurance"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} hdStyle={hd}/>
            <SortTh label={vi?"Thuế TNCN":"PIT"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} hdStyle={hd}/>
            <SortTh label={vi?"Net về tay":"Net"} field="net" sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} options={sortMoney} hdStyle={hd} vi={vi}/>
            <SortTh label={vi?"Trạng thái":"Status"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} hdStyle={hd}/>
            <SortTh label={vi?"Thao tác":"Actions"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} hdStyle={hd}/>
          </tr></thead>
          <tbody>
            {pageRows.map(({ emp, calc }) => (
              <tr key={emp.id}
                style={{ cursor:"pointer", backgroundColor: selected?.id===emp.id ? (dark?"rgba(208,33,28,0.1)":"#FFF5F5") : "transparent", transition:"background-color .1s" }}
                onClick={() => setSelected(emp)}
                onMouseEnter={e => { if(selected?.id!==emp.id)(e.currentTarget as HTMLElement).style.backgroundColor = dark?"rgba(255,255,255,0.03)":"#FAFAFA" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = selected?.id===emp.id ? (dark?"rgba(208,33,28,0.1)":"#FFF5F5") : "transparent" }}
              >
                {/* Employee */}
                <td style={td}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <EmpAvatar name={emp.name} avatarPath={(emp as any).avatarPath} size={32} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{emp.name}</div>
                      <div style={{ fontSize:10.5, color:th.text2 }}>{tDept(emp.dept, vi)}</div>
                    </div>
                  </div>
                </td>
                {/* Days */}
                <td style={td}>
                  <span style={{ fontWeight:700, color: emp.workDays < emp.standardDays ? "#F59E0B":"#10B981" }}>{emp.workDays}</span>
                  <span style={{ fontSize:11, color:th.text2 }}>/{emp.standardDays}</span>
                </td>
                {/* Gross */}
                <td style={td}>
                  <div style={{ fontWeight:700 }}>{fmt(calc.earnedSalary)}</div>
                  <div style={{ fontSize:10.5, color:th.text2 }}>{vi?"HĐ:":"Base:"} {fmt(emp.grossSalary)}</div>
                </td>
                {/* OT */}
                <td style={td}>
                  {calc.totalOT > 0
                    ? <span style={{ color:"#8B5CF6", fontWeight:700 }}>+{fmt(calc.totalOT)}</span>
                    : <span style={{ color:th.text2 }}>—</span>}
                </td>
                {/* Bonus (editable) */}
                <td style={td} onClick={e => e.stopPropagation()}>
                  {editBonus?.id === emp.id ? (
                    <div style={{ display:"flex", gap:5 }}>
                      <input autoFocus style={{ ...inputStyle, width:72, padding:"4px 7px", fontSize:12 }}
                        value={editBonus.val}
                        onChange={e => setEditBonus({ id:emp.id, val:e.target.value })}
                        onKeyDown={e => { if(e.key==="Enter") handleSaveBonus(emp.id, editBonus.val); if(e.key==="Escape") setEditBonus(null) }}
                        placeholder={vi ? "triệu" : "million"}
                      />
                      <button onClick={() => handleSaveBonus(emp.id, editBonus.val)} style={{ padding:"3px 8px", background:"#D0211C", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:11 }}>✓</button>
                    </div>
                  ) : (
                    <span onClick={() => setEditBonus({ id:emp.id, val:String(emp.bonus/1_000_000) })}
                      title={vi?"Nhấn để sửa thưởng":"Click to edit"}
                      style={{ color:emp.bonus>0?"#10B981":th.text2, fontWeight:emp.bonus>0?700:400, cursor:"pointer", fontSize:12.5,
                        padding:"2px 6px", borderRadius:5, border:`1px dashed ${emp.bonus>0?"#A7F3D0":th.tableBorder}` }}>
                      {emp.bonus>0 ? `+${fmt(emp.bonus)}` : (vi?"+ thưởng":"+ bonus")}
                    </span>
                  )}
                </td>
                {/* Insurance */}
                <td style={td}>
                  <span style={{ color:"#EF4444", fontWeight:600 }}>-{fmt(calc.insurance)}</span>
                  <div style={{ fontSize:10.5, color:th.text2 }}>10.5% Gross</div>
                </td>
                {/* PIT */}
                <td style={td}>
                  {calc.pit > 0
                    ? <><span style={{ color:"#D97706", fontWeight:700 }}>-{fmt(calc.pit)}</span><div style={{ fontSize:10.5, color:th.text2 }}>{vi?"TNTT":"TI"}: {fmt(calc.taxableIncome)}</div></>
                    : <span style={{ color:th.text2, fontSize:12 }}>{vi?"Miễn thuế":"Tax-free"}</span>}
                </td>
                {/* Net */}
                <td style={td}><b style={{ fontSize:14, color:"#059669" }}>{fmt(calc.net)}</b></td>
                {/* Status */}
                <td style={td}>
                  {emp.status==="paid"    && <span style={{ background:"#D1FAE5", color:"#065F46", borderRadius:12, padding:"3px 10px", fontSize:11.5, fontWeight:700 }}>{vi?"Đã TT":"Paid"}</span>}
                  {emp.status==="pending" && <span style={{ background:"#FEF3C7", color:"#92400E", borderRadius:12, padding:"3px 10px", fontSize:11.5, fontWeight:700 }}>{vi?"Chờ TT":"Pending"}</span>}
                  {emp.status==="draft"   && <span style={{ background:"#F3F4F6", color:"#374151", borderRadius:12, padding:"3px 10px", fontSize:11.5, fontWeight:600 }}>{vi?"Nháp":"Draft"}</span>}
                </td>
                {/* Actions */}
                <td style={td} onClick={e => e.stopPropagation()}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => { setSelected(emp); setShowDetailModal(true) }} title={vi?"Chi tiết":"Details"}
                      style={{ width:30, height:30, borderRadius:7, border:"none", background:"#EFF6FF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Eye size={13} color="#1D4ED8"/>
                    </button>
                    {emp.status==="pending" && (
                      <button onClick={() => handleConfirmPay(emp.id)} title={vi?"Xác nhận chi":"Confirm"}
                        style={{ width:30, height:30, borderRadius:7, border:"none", background:"#D1FAE5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Send size={13} color="#065F46"/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>{/* end table-scroll */}
        {/* Pagination footer */}
        <div style={{ padding:"10px 14px", background:th.tableHead, borderTop:`1px solid ${th.tableBorder}`,
          display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:"8px 12px" }}>
          <span style={{ fontSize:12, color:th.text2 }}>
            {vi ? `Trang ${page}/${totalPages} · ${payrollData.length} ${"nhân viên"}` : `Page ${page}/${totalPages} · ${payrollData.length} ${"employees"}`}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{
              width:30, height:30, borderRadius:7, border:`1px solid ${th.cardBorder}`,
              background:th.cardBg, cursor:page===1?"not-allowed":"pointer",
              opacity:page===1?0.4:1, display:"flex", alignItems:"center", justifyContent:"center",
              color:th.text1,
            }}><ChevronLeft size={14}/></button>
            {Array.from({length: totalPages}, (_,i) => i+1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number|"...")[]>((acc, n, idx, arr) => {
                if (idx > 0 && (n as number) - (arr[idx-1] as number) > 1) acc.push("...")
                acc.push(n); return acc
              }, [])
              .map((n, i) => n === "..." ? (
                <span key={`e${i}`} style={{ padding:"0 4px", color:th.text3, fontSize:12 }}>...</span>
              ) : (
                <button key={n} onClick={() => setPage(n as number)} style={{
                  minWidth:30, height:30, borderRadius:7,
                  border:`1px solid ${page === n ? "#D0211C" : th.cardBorder}`,
                  background: page === n ? "#D0211C" : th.cardBg,
                  color: page === n ? "#fff" : th.text1,
                  fontSize:13, fontWeight:page===n?700:400, cursor:"pointer",
                  fontFamily:"inherit",
                }}>{n}</button>
              ))
            }
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{
              width:30, height:30, borderRadius:7, border:`1px solid ${th.cardBorder}`,
              background:th.cardBg, cursor:page===totalPages?"not-allowed":"pointer",
              opacity:page===totalPages?0.4:1, display:"flex", alignItems:"center", justifyContent:"center",
              color:th.text1,
            }}><ChevronRight size={14}/></button>
          </div>
          <span style={{ fontSize:12.5, fontWeight:700, color:"#059669", whiteSpace:"nowrap" }}>
            {vi?"Tổng Net:":"Total Net:"} {fmt(totals.net)}
          </span>
        </div>
      </div>

      {/* ── Bottom: Payslip + Formula ── */}
      <div className="rg-2">

        {/* Payslip detail */}
        <div style={{ background:th.cardBg, borderRadius:14, border:`1px solid ${th.cardBorder}`, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding:"13px 18px", borderBottom:`1px solid ${th.tableBorder}`, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#D0211C" }}/>
            <span style={{ fontWeight:700, color:th.text1, fontSize:14 }}>
              {selected ? (vi?`Phiếu lương — ${selected.name}`:`Payslip — ${selected.name}`) : (vi?"Chọn nhân viên để xem":"Select employee")}
            </span>
          </div>
          {selectedCalc && selected ? (
            <div style={{ padding:"12px 18px" }}>
              {payslipRows(selected, selectedCalc).map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"7px 0", borderBottom:`${r.type==="total"?"2px":"1px"} ${r.type==="total"?"double":"solid"} ${th.tableBorder}` }}>
                  <span style={{ fontSize:12, color: r.type==="total"?th.text1 : r.type==="info"?"#3B82F6" : th.text2, fontWeight:r.type==="total"?800:400 }}>{r.label}</span>
                  <span style={{ fontSize:12.5, fontWeight:700,
                    color: r.type==="bonus"?"#10B981" : r.type==="deduct"?"#EF4444" : r.type==="info"?"#3B82F6" : r.type==="total"?"#111827" : th.text1 }}>
                    {r.type==="info" ? fmt(r.val) : r.val < 0 ? `-${fmt(-r.val)}` : `${r.type==="bonus"&&r.val>0?"+":""}${fmt(r.val)}`}
                  </span>
                </div>
              ))}
              {/* Net row */}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 2px" }}>
                <span style={{ fontSize:14, fontWeight:800, color:th.text1 }}>💰 {vi?"Lương Net về tay":"Take-home Net"}</span>
                <span style={{ fontSize:18, fontWeight:900, color:"#059669" }}>{fmt(selectedCalc.net)}</span>
              </div>
            </div>
          ) : (
            <div style={{ padding:40, textAlign:"center", color:th.text2 }}>
              <Calculator size={40} style={{ opacity:.2, display:"block", margin:"0 auto 10px" }}/>
              <p style={{ fontSize:13 }}>{vi?"Nhấn vào hàng nhân viên để xem phiếu lương":"Click a row to view payslip"}</p>
            </div>
          )}
        </div>

        {/* Formula Summary */}
        <div style={{ background:th.cardBg, borderRadius:14, border:`1px solid ${th.cardBorder}`, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding:"13px 18px", borderBottom:`1px solid ${th.tableBorder}`, fontWeight:700, color:th.text1, fontSize:14 }}>
            📐 {vi?"Công thức — Biểu thuế VN 2026":"Formula — VN 2026 Rules"}
          </div>
          <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:8 }}>
            {/* Formula */}
            <div style={{ background:"linear-gradient(135deg,rgba(208,33,28,0.08),rgba(153,20,20,0.04))", borderRadius:10, padding:"11px 14px", fontSize:12.5, color:th.text1, fontWeight:600, lineHeight:1.7, border:`1px solid rgba(208,33,28,0.15)` }}>
              {vi
                ? <>Net = (Gross × Ngày công/Ngày chuẩn + OT + Thưởng + Phụ cấp)<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&minus; <span style={{ color:"#EF4444" }}>BH (10.5%)</span> &minus; <span style={{ color:"#D97706" }}>Thuế TNCN</span></>
                : <>Net = (Gross × Work days/Standard days + OT + Bonus + Allowances)<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&minus; <span style={{ color:"#EF4444" }}>Insurance (10.5%)</span> &minus; <span style={{ color:"#D97706" }}>PIT</span></>}
            </div>

            {/* Insurance */}
            <div style={{ background:th.tableHead, borderRadius:10, padding:"11px 14px" }}>
              <div style={{ fontWeight:700, fontSize:12.5, color:th.text1, marginBottom:7 }}>🛡️ {vi?"Bảo hiểm bắt buộc (NLĐ đóng)":"Mandatory Insurance"}</div>
              {[
                { name:vi?"BHXH":"SI", rate:`${config.bhxh}%`, note:vi?"Hưu trí, Thai sản, Ốm đau":"Pension, Maternity, Sickness" },
                { name:vi?"BHYT":"HI", rate:`${config.bhyt}%`, note:vi?"Khám chữa bệnh":"Medical" },
                { name:vi?"BHTN":"UI", rate:`${config.bhtn}%`, note:vi?"Trợ cấp thất nghiệp":"Unemployment" },
              ].map(b => (
                <div key={b.name} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:th.text2, marginBottom:3 }}>
                  <span><b style={{ color:th.text1 }}>{b.name}</b> — {b.note}</span>
                  <span style={{ color:"#EF4444", fontWeight:700 }}>{b.rate}</span>
                </div>
              ))}
              <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${th.tableBorder}`, display:"flex", justifyContent:"space-between", fontSize:12.5, fontWeight:800 }}>
                <span style={{ color:th.text1 }}>{vi?"TỔNG":"TOTAL"}</span>
                <span style={{ color:"#EF4444" }}>10.5%</span>
              </div>
            </div>

            {/* PIT 5 brackets */}
            <div style={{ background:th.tableHead, borderRadius:10, padding:"11px 14px" }}>
              <div style={{ fontWeight:700, fontSize:12.5, color:th.text1, marginBottom:7 }}>📊 {vi?"Thuế TNCN — 5 Bậc Lũy Tiến 2026":"PIT — 5 Progressive Brackets 2026"}</div>
              {[
                 { bracket:vi?"Bậc 1":"Bracket 1", range:vi?"≤ 10 triệu":"≤ 10M",          rate:"5%",  formula:"0.05 × TNTT",      formulaEn:"0.05 × TI" },
                 { bracket:vi?"Bậc 2":"Bracket 2", range:vi?"10 – 30 triệu":"10 – 30M",       rate:"10%", formula:"0.1×TNTT − 0.5tr", formulaEn:"0.1×TI − 0.5M" },
                 { bracket:vi?"Bậc 3":"Bracket 3", range:vi?"30 – 60 triệu":"30 – 60M",       rate:"20%", formula:"0.2×TNTT − 3.5tr", formulaEn:"0.2×TI − 3.5M" },
                 { bracket:vi?"Bậc 4":"Bracket 4", range:vi?"60 – 100 triệu":"60 – 100M",      rate:"30%", formula:"0.3×TNTT − 9.5tr", formulaEn:"0.3×TI − 9.5M" },
                 { bracket:vi?"Bậc 5":"Bracket 5", range:vi?"> 100 triệu":"> 100M",          rate:"35%", formula:"0.35×TNTT − 14.5tr", formulaEn:"0.35×TI − 14.5M" },
              ].map((b,i) => (
                <div key={i} style={{ display:"flex", gap:8, fontSize:11.5, marginBottom:3, alignItems:"center" }}>
                  <span style={{ background:"#D0211C", color:"#fff", borderRadius:4, padding:"1px 5px", fontSize:10, fontWeight:700, flexShrink:0 }}>{b.rate}</span>
                  <span style={{ color:th.text2, flex:1 }}>{b.range}</span>
                  <span style={{ color:th.text2, fontFamily:"monospace", fontSize:10.5 }}>{vi ? b.formula : b.formulaEn}</span>
                </div>
              ))}
              <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${th.tableBorder}`, fontSize:11.5, color:"#3B82F6" }}>
                <div style={{ display:"flex", gap:4, alignItems:"flex-start" }}>
                  <Info size={11} style={{ flexShrink:0, marginTop:1 }}/>
                  <span>{vi?`Giảm trừ bản thân: ${fmtShort(config.selfDeduction, vi)}đ/tháng · Người phụ thuộc: ${fmtShort(config.depDeduction, vi)}đ/người`:`Self: ${fmtShort(config.selfDeduction, vi)} VND/mo · Dependent: ${fmtShort(config.depDeduction, vi)} VND/person`}</span>
                </div>
              </div>
            </div>

            {/* OT */}
            <div style={{ background:th.tableHead, borderRadius:10, padding:"10px 14px" }}>
              <div style={{ fontWeight:700, fontSize:12.5, color:th.text1, marginBottom:7 }}>⏱️ {vi?"Hệ số tăng ca (OT)":"Overtime Multipliers"}</div>
              {[
                { label:vi?"Ngày thường":"Weekday",   rate:"×150%", c:"#8B5CF6" },
                { label:vi?"Cuối tuần (CN)":"Weekend", rate:"×200%", c:"#3B82F6" },
                { label:vi?"Ngày Lễ/Tết":"Holiday",   rate:"×300%", c:"#D0211C" },
              ].map(o => (
                <div key={o.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:th.text2, marginBottom:3 }}>
                  <span>{o.label}</span>
                  <span style={{ color:o.c, fontWeight:800 }}>{o.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Payslip Detail ── */}
      {showDetailModal && selected && (() => {
        const c = calcPayroll(selected, config)
        const rows = payslipRows(selected, c)
        return (
          <>
            <div onClick={() => setShowDetailModal(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:9000, backdropFilter:"blur(2px)" }}/>
            <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:9001, padding:16, pointerEvents:"none" }}>
              <div onClick={e => e.stopPropagation()}
                style={{ background:th.cardBg, borderRadius:20, width:"min(520px,95vw)", maxHeight:"88vh",
                  overflow:"hidden", display:"flex", flexDirection:"column",
                  boxShadow:"0 24px 60px rgba(0,0,0,0.35)", animation:"fadeDown .2s ease",
                  pointerEvents:"auto" }}>

                {/* Modal header */}
                <div style={{ background:"linear-gradient(135deg,#D0211C,#991414)", padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
                  <div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
                      📄 {vi ? "Phiếu lương chi tiết" : "Payslip Details"}
                    </div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{selected.name}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:3, display:"flex", gap:12 }}>
                      <span>🏢 {selected.dept}</span>
                      <span>🆔 {selected.id}</span>
                      <span>📅 {vi ? `Tháng ${activeMonth.month}/${activeMonth.year}` : `${activeMonth.month}/${activeMonth.year}`}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(false)}
                    style={{ width:34, height:34, borderRadius:9, border:"none", background:"rgba(255,255,255,0.18)",
                      cursor:"pointer", color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    ✕
                  </button>
                </div>

                {/* Scrollable body */}
                <div style={{ overflowY:"auto", padding:"16px 22px 20px", flex:1 }}>
                  {rows.map((r, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"8px 0",
                      borderBottom: r.type==="total"
                        ? `2px double ${th.tableBorder}`
                        : `1px solid ${th.tableBorder}`,
                      background: r.type==="total" ? (dark?"rgba(208,33,28,0.06)":"#FFF5F5") : "transparent",
                      borderRadius: r.type==="total" ? 6 : 0,
                      paddingLeft: r.type==="total" ? 6 : 0,
                      paddingRight: r.type==="total" ? 6 : 0,
                    }}>
                      <span style={{ fontSize:12.5,
                        color: r.type==="total" ? th.text1 : r.type==="info" ? "#3B82F6" : th.text2,
                        fontWeight: r.type==="total" ? 700 : 400 }}>
                        {r.label}
                      </span>
                      <span style={{ fontSize:13, fontWeight:700,
                        color: r.type==="bonus" ? "#10B981"
                             : r.type==="deduct" ? "#EF4444"
                             : r.type==="info"   ? "#3B82F6"
                             : r.type==="total"  ? th.text1
                             : th.text1 }}>
                        {r.type==="info" ? fmt(r.val)
                          : r.val < 0 ? `-${fmt(-r.val)}`
                          : `${r.type==="bonus"&&r.val>0?"+":""}${fmt(r.val)}`}
                      </span>
                    </div>
                  ))}

                  {/* Net total */}
                  <div style={{ marginTop:16, background:"linear-gradient(135deg,rgba(5,150,105,0.1),rgba(5,150,105,0.05))",
                    border:"2px solid rgba(5,150,105,0.25)", borderRadius:12, padding:"14px 16px",
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:11, color:"#059669", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:2 }}>
                        {vi ? "Lương NET về tay" : "Take-home Net Salary"}
                      </div>
                      <div style={{ fontSize:11.5, color:th.text2 }}>
                        {vi
                          ? `Ngày công: ${selected.workDays}/${selected.standardDays} · Phụ thuộc: ${selected.dependents}`
                          : `Work days: ${selected.workDays}/${selected.standardDays} · Dependents: ${selected.dependents}`}
                      </div>
                    </div>
                    <div style={{ fontSize:24, fontWeight:900, color:"#059669" }}>{fmt(c.net)}</div>
                  </div>
                </div>

                {/* Footer actions */}
                <div style={{ padding:"12px 22px", borderTop:`1px solid ${th.tableBorder}`, display:"flex", gap:8, flexShrink:0 }}>
                  {selected.status==="pending" && (
                    <button onClick={() => { handleConfirmPay(selected.id); setShowDetailModal(false) }}
                      style={{ flex:1, padding:"9px", borderRadius:9, border:"none",
                        background:"linear-gradient(135deg,#059669,#047857)", color:"#fff",
                        fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <Send size={13}/> {vi ? "Xác nhận chi lương" : "Confirm Payment"}
                    </button>
                  )}
                  <button onClick={() => setShowDetailModal(false)}
                    style={{ flex:1, padding:"9px", borderRadius:9,
                      border:`1px solid ${th.cardBorder}`, background:"none",
                      color:th.text2, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    {vi ? "Đóng" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      <Toast toast={toast}/>
      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
