/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  FileText, Search, Plus, Eye, X, AlertTriangle,
  ChevronLeft, ChevronRight, Loader2, Check,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { DateInput } from "@/components/ui/date-input"
import { matchAny } from "@/lib/utils/search"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { getAllContracts, createContract } from "@/lib/actions/contract.actions"
import { getDepartments } from "@/lib/actions/department.actions"
import { getEmployees } from "@/lib/actions/employee.actions"
import { tDept } from "@/lib/i18n-maps"

// ── Types ──────────────────────────────────────────────────────
type Contract = {
  id: number
  contractType: string
  startDate: string
  endDate: string | null
  rawEnd: Date | null
  baseSalary: number
  allowance: number
  status: string     // DB status
  uiStatus: "active"|"expiring"|"expired"|"terminated"
  empCode: string
  empName: string
  dept: string
  deptId: number | null
  daysLeft: number | null
}
type Opt = { id: number; name: string }
type SortField = "id"|"empName"|"startDate"|"salary"|null
type SortDir   = "asc"|"desc"

const PAGE_SIZE = 10

// ── Helpers ────────────────────────────────────────────────────
function fmt(d: string | Date | null): string {
  if (!d) return ""
  const dt = typeof d === "string" ? new Date(d) : d
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`
}
function daysUntil(d: string | Date | null): number | null {
  if (!d) return null
  const dt = typeof d === "string" ? new Date(d) : d
  return Math.ceil((dt.getTime() - Date.now()) / 86400000)
}
function fmtSalary(n: number | string) {
  // Dùng Number() để tránh cộng string (serialize từ DB trả về string)
  return Number(n).toLocaleString("vi-VN") + "đ"
}
function getUiStatus(c: any): "active"|"expiring"|"expired"|"terminated" {
  if (c.status === "Chấm dứt") return "terminated"
  const dl = daysUntil(c.endDate)
  if (dl !== null && dl < 0)  return "expired"
  if (dl !== null && dl <= 30) return "expiring"
  return "active"
}
function mapContract(c: any): Contract {
  return {
    id:           c.id,
    contractType: c.contractType,
    startDate:    fmt(c.startDate),
    endDate:      c.endDate ? fmt(c.endDate) : null,
    rawEnd:       c.endDate ? new Date(c.endDate) : null,
    baseSalary:   Number(c.baseSalary),   // đảm bảo là number
    allowance:    Number(c.allowance ?? 0),
    status:       c.status,
    uiStatus:     getUiStatus(c),
    empCode:      c.employee?.code     ?? "",
    empName:      c.employee?.fullName ?? "",
    dept:         c.employee?.department?.name ?? "",
    deptId:       c.employee?.department?.id   ?? null,
    daysLeft:     daysUntil(c.endDate),
  }
}
function statusBadge(s: "active"|"expiring"|"expired"|"terminated", vi: boolean) {
  switch(s) {
    case "active":     return { text: vi?"Hiệu lực":"Active",    bg:"#D1FAE5", color:"#065F46" }
    case "expiring":   return { text: vi?"⚠️ Sắp hết":"⚠️ Expiring", bg:"#FEF3C7", color:"#92400E" }
    case "expired":    return { text: vi?"Hết hạn":"Expired",    bg:"#FEE2E2", color:"#991B1B" }
    case "terminated": return { text: vi?"Chấm dứt":"Terminated",bg:"#F1F5F9", color:"#64748B" }
  }
}

// ── FilterPopup ────────────────────────────────────────────────
function FilterPopup({ label, value, options, onChange, onClear, th }: {
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
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  const selectedLabel = options.find(o => o.value === value)?.label

  return (
    <div ref={ref} style={{ position:"relative", flexShrink:0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"inline-flex", alignItems:"center", gap:6,
        padding:"8px 13px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
        fontSize:13, fontWeight:active?700:500, whiteSpace:"nowrap",
        border: active?"1.5px solid #D0211C":`1px solid ${th.inputBorder}`,
        background: active?"rgba(208,33,28,0.07)":th.cardBg,
        color: active?"#D0211C":th.text2,
        transition:"all .15s",
        boxShadow: active?"0 0 0 3px rgba(208,33,28,0.1)":"none",
      }}>
        {active ? selectedLabel : label}
        {active
          ? <X size={13} onClick={e => { e.stopPropagation(); onClear(); setOpen(false) }}
              style={{ cursor:"pointer", opacity:0.7 }}/>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        }
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:300,
          background:th.cardBg, border:`1px solid ${th.cardBorder}`,
          borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.14)",
          minWidth:180, overflow:"hidden",
        }}>
          {options.map(opt => {
            const sel = value === opt.value
            return (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }} style={{
                width:"100%", padding:"9px 14px",
                background:sel?"rgba(208,33,28,0.08)":"none",
                border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                fontSize:13, color:sel?"#D0211C":th.text1,
                fontWeight:sel?700:400, fontFamily:"inherit", textAlign:"left",
                borderBottom:`1px solid ${th.tableBorder}`,
              }}>
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

// ── DateSortTh ─────────────────────────────────────────────────
// Column header that has both sort options AND a date picker
function DateSortTh({ label, field, sortField, sortDir, onSort, onClear,
  dateValue, onDateChange, th, style, vi }: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: SortDir
  onSort: (f: SortField, d: SortDir) => void
  onClear: () => void
  dateValue: string
  onDateChange: (v: string) => void
  th: any
  style?: React.CSSProperties
  vi: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTableCellElement>(null)
  const sortActive = field !== null && sortField === field
  const dateActive = dateValue !== ""
  const anyActive  = sortActive || dateActive

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  // Format yyyy-mm-dd → dd/mm/yyyy for display
  const fmtLabel = (v: string) => {
    if (!v) return ""
    const [y,m,d] = v.split("-")
    return `${d}/${m}/${y}`
  }

  return (
    <th ref={ref} style={{ padding:"10px 13px", fontSize:12, fontWeight:600,
      textAlign:"left", position:"relative", color:th.tableHeadText, whiteSpace:"nowrap", ...style }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"inline-flex", alignItems:"center", gap:5,
        background:"none", border:"none", cursor:"pointer",
        color:anyActive?"#D0211C":th.tableHeadText,
        fontWeight:anyActive?700:600, fontSize:12, fontFamily:"inherit", padding:0,
      }}>
        {dateActive ? `${label}: ${fmtLabel(dateValue)}` : label}
        {sortActive
          ? sortDir==="asc" ? <ArrowUp size={12} color="#D0211C"/> : <ArrowDown size={12} color="#D0211C"/>
          : <ArrowUpDown size={11} style={{ opacity:dateActive?1:0.4 }}/>}
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:200,
          background:th.cardBg, border:`1px solid ${th.cardBorder}`,
          borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          minWidth:200, overflow:"hidden",
        }}>
          {/* Clear all */}
          <button onClick={() => { onClear(); onDateChange(""); setOpen(false) }} style={{
            width:"100%", padding:"9px 14px", background:"none", border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:8,
            fontSize:12.5, color:th.text2, fontFamily:"inherit", textAlign:"left",
            borderBottom:`1px solid ${th.tableBorder}`,
          }}>
            <X size={13}/> {vi ? "Mặc định" : "Default"}
          </button>
          {/* Sort options */}
          {[{ dir:"asc" as SortDir, label: vi?"Cũ nhất trước":"Oldest first" },
            { dir:"desc" as SortDir, label: vi?"Mới nhất trước":"Newest first" }].map(opt => {
            const sel = sortActive && sortDir === opt.dir
            return (
              <button key={opt.dir} onClick={() => { onSort(field, opt.dir); setOpen(false) }} style={{
                width:"100%", padding:"9px 14px",
                background:sel?"rgba(208,33,28,0.08)":"none",
                border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                fontSize:12.5, color:sel?"#D0211C":th.text1,
                fontWeight:sel?700:400, fontFamily:"inherit", textAlign:"left",
                borderBottom:`1px solid ${th.tableBorder}`,
              }}>
                {sel ? <Check size={13} color="#D0211C"/> : <div style={{ width:13 }}/>}
                {opt.label}
              </button>
            )
          })}
          {/* Date picker section */}
          <div style={{ padding:"10px 14px", borderTop:`1px solid ${th.tableBorder}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8,
              fontSize:12, color:th.text2, fontWeight:600 }}>
              <Calendar size={13}/> {vi ? "Chọn ngày cụ thể" : "Specific date"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <DateInput
                value={dateValue}
                onChange={e => onDateChange(e.target.value)}
                style={{ flex:1, padding:"6px 10px", borderRadius:7,
                  border:`1.5px solid ${dateActive?"#D0211C":th.inputBorder}`,
                  fontSize:12.5, background:th.inputBg, color:th.text1,
                  outline:"none", fontFamily:"inherit",
                }}
              />
              {dateActive && (
                <button onClick={() => onDateChange("")} style={{
                  padding:"5px", borderRadius:6, border:"none", background:"#FEE2E2",
                  cursor:"pointer", display:"flex", alignItems:"center",
                }}><X size={12} color="#991B1B"/></button>
              )}
            </div>
          </div>
        </div>
      )}
    </th>
  )
}

function SortTh({ label, field, sortField, sortDir, onSort, onClear, th, options, style }: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: SortDir
  onSort: (f: SortField, d: SortDir) => void
  onClear: () => void
  th: any
  options?: { label: string; dir: SortDir }[]
  style?: React.CSSProperties
}) {
  const { lang } = useDashboard()
  const vi = lang === "vi"
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTableCellElement>(null)
  const active = sortField === field

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  if (!field || !options) {
    return <th style={{ padding:"10px 13px", fontSize:12, fontWeight:600,
      textAlign:"left", color:th.tableHeadText, whiteSpace:"nowrap", ...style }}>{label}</th>
  }

  return (
    <th ref={ref} style={{ padding:"10px 13px", fontSize:12, fontWeight:600,
      textAlign:"left", position:"relative", color:th.tableHeadText, whiteSpace:"nowrap", ...style }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"inline-flex", alignItems:"center", gap:5,
        background:"none", border:"none", cursor:"pointer",
        color:active?"#D0211C":th.tableHeadText,
        fontWeight:active?700:600, fontSize:12, fontFamily:"inherit", padding:0,
      }}>
        {label}
        {active
          ? sortDir==="asc" ? <ArrowUp size={12} color="#D0211C"/> : <ArrowDown size={12} color="#D0211C"/>
          : <ArrowUpDown size={11} style={{ opacity:0.4 }}/>}
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:200,
          background:th.cardBg, border:`1px solid ${th.cardBorder}`,
          borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          minWidth:165, overflow:"hidden",
        }}>
          <button onClick={() => { onClear(); setOpen(false) }} style={{
            width:"100%", padding:"9px 14px", background:"none", border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:8,
            fontSize:12.5, color:th.text2, fontFamily:"inherit", textAlign:"left",
            borderBottom:`1px solid ${th.tableBorder}`,
          }}>
            <X size={13}/> {vi ? "Mặc định" : "Default"}
          </button>
          {options.map(opt => {
            const sel = active && sortDir === opt.dir
            return (
              <button key={opt.dir} onClick={() => { onSort(field, opt.dir); setOpen(false) }} style={{
                width:"100%", padding:"9px 14px",
                background:sel?"rgba(208,33,28,0.08)":"none",
                border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                fontSize:12.5, color:sel?"#D0211C":th.text1,
                fontWeight:sel?700:400, fontFamily:"inherit", textAlign:"left",
              }}>
                {sel ? <Check size={13} color="#D0211C"/> : <div style={{ width:13 }}/>}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </th>
  )
}

// ── SalaryFilterTh ────────────────────────────────────────────────
function SalaryFilterTh({ label, sortField, sortDir, onSort, onClear,
  salaryVal, onSalaryChange, th, style, vi }: {
  label: string
  sortField: SortField
  sortDir: SortDir
  onSort: (f: SortField, d: SortDir) => void
  onClear: () => void
  salaryVal: string   // raw number string, empty = no filter
  onSalaryChange: (v: string) => void
  th: any
  style?: React.CSSProperties
  vi: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTableCellElement>(null)
  const sortActive   = sortField === "salary"
  const salaryActive = salaryVal !== ""
  const anyActive    = sortActive || salaryActive

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  const fmtNum = (v: string) =>
    v ? Number(v).toLocaleString("vi-VN") + "đ" : ""

  return (
    <th ref={ref} style={{ padding:"10px 13px", fontSize:12, fontWeight:600,
      textAlign:"left", position:"relative", color:th.tableHeadText, whiteSpace:"nowrap", ...style }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"inline-flex", alignItems:"center", gap:5,
        background:"none", border:"none", cursor:"pointer",
        color:anyActive?"#D0211C":th.tableHeadText,
        fontWeight:anyActive?700:600, fontSize:12, fontFamily:"inherit", padding:0,
      }}>
        {salaryActive ? `${label}: ${fmtNum(salaryVal)}` : label}
        {sortActive
          ? sortDir==="asc" ? <ArrowUp size={12} color="#D0211C"/> : <ArrowDown size={12} color="#D0211C"/>
          : <ArrowUpDown size={11} style={{ opacity:anyActive?1:0.4 }}/>}
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:200,
          background:th.cardBg, border:`1px solid ${th.cardBorder}`,
          borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          minWidth:200, overflow:"hidden",
        }}>
          {/* Clear */}
          <button onClick={() => { onClear(); onSalaryChange(""); setOpen(false) }} style={{
            width:"100%", padding:"9px 14px", background:"none", border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:8,
            fontSize:12.5, color:th.text2, fontFamily:"inherit", textAlign:"left",
            borderBottom:`1px solid ${th.tableBorder}`,
          }}>
            <X size={13}/> {vi ? "Mặc định" : "Default"}
          </button>
          {/* Sort options */}
          {[{ dir:"asc" as SortDir, label: vi?"Thấp → Cao":"Low → High" },
            { dir:"desc" as SortDir, label: vi?"Cao → Thấp":"High → Low" }].map(opt => {
            const sel = sortActive && sortDir === opt.dir
            return (
              <button key={opt.dir} onClick={() => { onSort("salary", opt.dir); setOpen(false) }} style={{
                width:"100%", padding:"9px 14px",
                background:sel?"rgba(208,33,28,0.08)":"none",
                border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                fontSize:12.5, color:sel?"#D0211C":th.text1,
                fontWeight:sel?700:400, fontFamily:"inherit", textAlign:"left",
                borderBottom:`1px solid ${th.tableBorder}`,
              }}>
                {sel ? <Check size={13} color="#D0211C"/> : <div style={{ width:13 }}/>}
                {opt.label}
              </button>
            )
          })}
          {/* Amount input */}
          <div style={{ padding:"10px 14px", borderTop:`1px solid ${th.tableBorder}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8,
              fontSize:12, color:th.text2, fontWeight:600 }}>
              💰 {vi ? "Nhập số tiền cụ thể" : "Exact salary amount"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <input
                type="number"
                min={0}
                step={500000}
                placeholder={vi ? "VD: 15000000" : "e.g. 15000000"}
                value={salaryVal}
                onChange={e => onSalaryChange(e.target.value)}
                style={{ flex:1, padding:"6px 10px", borderRadius:7,
                  border:`1.5px solid ${salaryActive?"#D0211C":th.inputBorder}`,
                  fontSize:12.5, background:th.inputBg, color:th.text1,
                  outline:"none", fontFamily:"inherit",
                }}
              />
              {salaryActive && (
                <button onClick={() => onSalaryChange("")} style={{
                  padding:"5px", borderRadius:6, border:"none", background:"#FEE2E2",
                  cursor:"pointer", display:"flex", alignItems:"center",
                }}><X size={12} color="#991B1B"/></button>
              )}
            </div>
            {salaryActive && (
              <div style={{ fontSize:11, color:"#D0211C", marginTop:4, fontWeight:600 }}>
                = {Number(salaryVal).toLocaleString("vi-VN")}đ
              </div>
            )}
          </div>
        </div>
      )}
    </th>
  )
}

// ══════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════
export default function ContractsPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()

  const [contracts, setContracts] = useState<Contract[]>([])
  const [depts, setDepts]         = useState<Opt[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Contract | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [createErr, setCreateErr]   = useState("")
  const [empList, setEmpList]       = useState<{ id: number; code: string; name: string }[]>([])
  const EMPTY_FORM = { employeeId:"", contractType:"Chính thức", startDate:"", endDate:"", baseSalary:"", allowance:"0", notes:"" }
  const [form, setForm]             = useState(EMPTY_FORM)

  // ── Filter state ────────────────────────────────────────────
  const [q, setQ]                           = useState("")
  const [deptFilter, setDeptFilter]         = useState("")
  const [typeFilter, setTypeFilter]         = useState("")
  const [statusFilter, setStatusFilter]     = useState("")
  const [startDateExact, setStartDateExact] = useState("")  // yyyy-mm-dd
  const [endDateExact, setEndDateExact]     = useState("")  // yyyy-mm-dd
  const [salaryFilter, setSalaryFilter]     = useState("")  // raw number string
  const [sortField, setSortField]           = useState<SortField>(null)
  const [sortDir, setSortDir]               = useState<SortDir>("asc")
  const [page, setPage]                     = useState(1)

  useEffect(() => { setPage(1) }, [q, deptFilter, typeFilter, statusFilter, startDateExact, endDateExact, salaryFilter, sortField, sortDir])

  // ── Load ────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    const [cRes, dRes, eRes] = await Promise.all([getAllContracts(), getDepartments(), getEmployees({ take: 500 })])
    if (cRes.success && cRes.data) setContracts(cRes.data.map(mapContract))
    if (dRes.success && dRes.data) setDepts(dRes.data)
    if (eRes.success && eRes.data) setEmpList(
      (eRes.data as any[]).map(e => ({ id: e.id, code: e.code, name: e.fullName }))
    )
    setLoading(false)
  }, [])
  useEffect(() => { loadAll() }, [loadAll])

  // ── Derived ─────────────────────────────────────────────────
  const expiringCount = useMemo(
    () => contracts.filter(c => c.uiStatus === "expiring").length, [contracts])

  const filtered = useMemo(() => {
    // helper: parse dd/mm/yyyy → yyyy-mm-dd string for comparison
    const toISO = (d: string) => d ? d.split("/").reverse().join("-") : ""
    let result = contracts.filter(c => {
      if (q && !matchAny([c.empName, c.empCode, c.dept, c.contractType], q)) return false
      if (deptFilter    && String(c.deptId) !== deptFilter)   return false
      if (typeFilter    && c.contractType   !== typeFilter)    return false
      if (statusFilter  && c.uiStatus       !== statusFilter)  return false
      if (startDateExact && toISO(c.startDate) !== startDateExact) return false
      if (endDateExact   && c.endDate && toISO(c.endDate) !== endDateExact) return false
      if (salaryFilter   && c.baseSalary !== Number(salaryFilter)) return false
      return true
    })
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        if (sortField === "id")        cmp = a.id - b.id
        if (sortField === "empName")   cmp = a.empName.localeCompare(b.empName, "vi")
        if (sortField === "startDate") cmp = new Date(toISO(a.startDate)).getTime()
                                          - new Date(toISO(b.startDate)).getTime()
        if (sortField === "salary")    cmp = a.baseSalary - b.baseSalary
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  }, [contracts, q, deptFilter, typeFilter, statusFilter, startDateExact, endDateExact, salaryFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows   = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  function handleSort(f: SortField, d: SortDir) { setSortField(f); setSortDir(d) }
  function clearSort() { setSortField(null); setSortDir("asc") }

  // ── Create contract handler ───────────────────────────────
  async function handleCreate() {
    if (!form.employeeId) { setCreateErr(vi ? "Vui lòng chọn nhân viên" : "Please select an employee"); return }
    if (!form.startDate)  { setCreateErr(vi ? "Vui lòng chọn ngày bắt đầu" : "Please enter start date"); return }
    if (!form.baseSalary || Number(form.baseSalary) <= 0) { setCreateErr(vi ? "Vui lòng nhập lương cơ bản" : "Please enter base salary"); return }
    setSaving(true); setCreateErr("")
    const res = await createContract({
      employeeId:   Number(form.employeeId),
      contractType: form.contractType,
      startDate:    form.startDate,
      endDate:      form.endDate || undefined,
      baseSalary:   Number(form.baseSalary),
      allowance:    Number(form.allowance) || 0,
      salaryGrade:  1.0,
      status:       "Hiệu lực",
      notes:        form.notes || undefined,
    })
    setSaving(false)
    if (!res.success) { setCreateErr(vi ? "Tạo hợp đồng thất bại. Vui lòng kiểm tra lại." : "Failed to create contract."); return }
    setShowCreate(false); setForm(EMPTY_FORM); loadAll()
  }

  // ── Styles ──────────────────────────────────────────────────
  const hd: React.CSSProperties = {
    background:th.tableHead, borderBottom:`1px solid ${th.tableBorder}`,
  }
  const td: React.CSSProperties = {
    padding:"11px 13px", fontSize:12.5, color:th.text1,
    borderBottom:`1px solid ${th.tableBorder}`, verticalAlign:"middle",
  }

  // Sort option sets
  const sortById   = [{ label:vi?"Nhỏ → Lớn":"Smallest first",   dir:"asc"  as SortDir },{ label:vi?"Lớn → Nhỏ":"Largest first",   dir:"desc" as SortDir }]
  const sortByName = [{ label:"A → Z",                           dir:"asc"  as SortDir },{ label:"Z → A",                           dir:"desc" as SortDir }]
  const sortByDate = [{ label:vi?"Cũ nhất":"Oldest first",       dir:"asc"  as SortDir },{ label:vi?"Mới nhất":"Newest first",     dir:"desc" as SortDir }]
  const sortBySal  = [{ label:vi?"Thấp → Cao":"Low → High",     dir:"asc"  as SortDir },{ label:vi?"Cao → Thấp":"High → Low",     dir:"desc" as SortDir }]

  // ── Pagination bar ──────────────────────────────────────────
  function PagBar() {
    if (totalPages <= 1) return null
    return (
      <div style={{ padding:"10px 14px", background:th.tableHead,
        borderTop:`1px solid ${th.tableBorder}`,
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:12, color:th.text2 }}>
          {vi
            ? `Hiển thị ${Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–${Math.min(page*PAGE_SIZE,filtered.length)} trong ${filtered.length} hợp đồng`
            : `Showing ${Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–${Math.min(page*PAGE_SIZE,filtered.length)} of ${filtered.length} contracts`}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <button disabled={page<=1} onClick={() => setPage(p=>p-1)} style={{
            display:"flex", alignItems:"center", gap:3, padding:"4px 10px", borderRadius:6,
            border:`1px solid ${th.cardBorder}`,
            background:page>1?"#D0211C":th.cardBg, color:page>1?"#fff":th.text3,
            cursor:page>1?"pointer":"not-allowed", fontSize:12, fontFamily:"inherit",
          }}>
            <ChevronLeft size={13}/> {vi?"Trước":"Prev"}
          </button>
          {Array.from({length:totalPages},(_,i)=>i+1)
            .filter(p => p===1||p===totalPages||Math.abs(p-page)<=1)
            .reduce<(number|"...")[]>((acc,p,idx,arr) => {
              if (idx>0 && p-(arr[idx-1] as number)>1) acc.push("...")
              acc.push(p); return acc
            },[])
            .map((p,i) => p==="..." ? (
              <span key={`d${i}`} style={{ color:th.text3, fontSize:12 }}>…</span>
            ) : (
              <button key={p} onClick={() => setPage(p as number)} style={{
                width:28, height:28, borderRadius:6, border:"none",
                background:page===p?"#D0211C":th.cardBg,
                color:page===p?"#fff":th.text2,
                fontWeight:page===p?700:400, cursor:"pointer", fontSize:12, fontFamily:"inherit",
              }}>{p}</button>
            ))}
          <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} style={{
            display:"flex", alignItems:"center", gap:3, padding:"4px 10px", borderRadius:6,
            border:`1px solid ${th.cardBorder}`,
            background:page<totalPages?"#D0211C":th.cardBg, color:page<totalPages?"#fff":th.text3,
            cursor:page<totalPages?"pointer":"not-allowed", fontSize:12, fontFamily:"inherit",
          }}>
            {vi?"Sau":"Next"} <ChevronRight size={13}/>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-pad">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Quản lý hợp đồng":"Contract Management"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi?"Theo dõi hợp đồng lao động":"Track labor contracts"}
          </p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setCreateErr(""); setShowCreate(true) }} style={{
          display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10,
          background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff",
          border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          boxShadow:"0 4px 12px rgba(208,33,28,0.3)",
        }}>
          <Plus size={14}/>{vi?"Tạo hợp đồng":"New Contract"}
        </button>
      </div>

      {/* ── Alert ── */}
      {expiringCount > 0 && (
        <div style={{ marginBottom:14, background:dark?"rgba(245,158,11,0.1)":"#FFFBEB",
          border:`1px solid ${dark?"rgba(245,158,11,0.3)":"#FDE68A"}`,
          borderRadius:10, padding:"11px 14px", display:"flex", gap:8, alignItems:"center" }}>
          <AlertTriangle size={15} color="#D97706"/>
          <span style={{ fontSize:12.5, color:dark?"#FCD34D":"#92400E" }}>
            {vi
              ? `${expiringCount} hợp đồng sắp hết hạn trong 30 ngày tới`
              : `${expiringCount} contracts expiring within 30 days`}
          </span>
        </div>
      )}

      {/* ── Search + Filter row ── */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>

        {/* Search */}
        <div style={{ position:"relative", flex:"1 1 260px", minWidth:200 }}>
          <Search size={15} color={th.text3}
            style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder={vi?"Tìm tên NV, mã NV, phòng ban, loại HĐ...":"Search..."}
            style={{ width:"100%", padding:"10px 38px 10px 36px",
              border:`1px solid ${th.inputBorder}`, borderRadius:9,
              fontSize:13.5, background:th.cardBg, color:th.text1,
              outline:"none", fontFamily:"inherit", boxSizing:"border-box",
              boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}/>
          {q && (
            <button onClick={() => setQ("")} style={{
              position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", cursor:"pointer", color:th.text3, display:"flex",
            }}>
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Phòng ban */}
        <FilterPopup
          label={vi?"Phòng ban":"Department"}
          value={deptFilter}
          options={depts.map(d => ({ value:String(d.id), label:d.name }))}
          onChange={setDeptFilter}
          onClear={() => setDeptFilter("")}
          th={th}
        />

        {/* Loại HĐ */}
        <FilterPopup
          label={vi?"Loại HĐ":"Contract Type"}
          value={typeFilter}
          options={[
            { value:"Chính thức", label:vi?"Chính thức":"Full-time" },
            { value:"Thử việc",   label:vi?"Thử việc":"Probation" },
            { value:"Thời vụ",    label:vi?"Thời vụ":"Contract" },
            { value:"Thực tập",   label:vi?"Thực tập":"Internship" },
          ]}
          onChange={setTypeFilter}
          onClear={() => setTypeFilter("")}
          th={th}
        />

        {/* Trạng thái */}
        <FilterPopup
          label={vi?"Trạng thái":"Status"}
          value={statusFilter}
          options={[
            { value:"active",     label:vi?"Hiệu lực":"Active" },
            { value:"expiring",   label:vi?"Sắp hết hạn":"Expiring" },
            { value:"expired",    label:vi?"Hết hạn":"Expired" },
            { value:"terminated", label:vi?"Chấm dứt":"Terminated" },
          ]}
          onChange={setStatusFilter}
          onClear={() => setStatusFilter("")}
          th={th}
        />
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center",
          gap:10, padding:56, color:th.text2 }}>
          <Loader2 size={20} style={{ animation:"spin 1s linear infinite" }}/>
          <span style={{ fontSize:13 }}>{vi?"Đang tải...":"Loading..."}</span>
        </div>
      ) : isMobile ? (
        /* Mobile cards */
        <div className="mobile-card-list">
          {pageRows.length === 0 ? (
            <div style={{ textAlign:"center", color:th.text3, padding:32, fontSize:13 }}>
              {vi?"Không tìm thấy hợp đồng nào.":"No contracts found."}
            </div>
          ) : pageRows.map(c => {
            const sb = statusBadge(c.uiStatus, vi)
            return (
              <div key={c.id} style={{ background:th.cardBg, border:`1px solid ${th.cardBorder}`,
                borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:th.text1 }}>{c.empName}</div>
                    <div style={{ fontSize:11.5, color:th.text3 }}>{c.empCode} · {c.dept}</div>
                  </div>
                  <span style={{ fontWeight:700, fontSize:11, color:"#D0211C" }}>
                    {vi?"HĐ":"C"}{String(c.id).padStart(3,"0")}
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                  gap:"4px 12px", fontSize:12.5, marginBottom:10 }}>
                  <div><span style={{ color:th.text2 }}>{vi?"Loại":"Type"}: </span><b>{vi?c.contractType:({"Chính thức":"Full-time","Thử việc":"Probation","Thời vụ":"Seasonal","Thực tập":"Internship"} as Record<string,string>)[c.contractType]??c.contractType}</b></div>
                  <div><span style={{ color:th.text2 }}>{vi?"Lương":"Salary"}: </span><b>{fmtSalary(c.baseSalary)}</b></div>
                  <div><span style={{ color:th.text2 }}>{vi?"Bắt đầu":"Start"}: </span><b>{c.startDate}</b></div>
                  <div><span style={{ color:th.text2 }}>{vi?"Kết thúc":"End"}: </span><b>{c.endDate ?? "—"}</b></div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ background:sb.bg, color:sb.color, borderRadius:12,
                    padding:"3px 10px", fontSize:11.5, fontWeight:700 }}>{sb.text}</span>
                  <button onClick={() => setSelected(c)} style={{
                    padding:"5px 12px", borderRadius:6, border:"none",
                    background:"#EFF6FF", cursor:"pointer", fontSize:11.5,
                    fontWeight:600, color:"#1D4ED8", fontFamily:"inherit",
                  }}>{vi?"Xem":"View"}</button>
                </div>
              </div>
            )
          })}
          <PagBar/>
        </div>
      ) : (
        /* Desktop table */
        <div style={{ background:th.cardBg, borderRadius:12, overflow:"visible",
          border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX:"auto", borderRadius:"12px 12px 0 0" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <SortTh label={vi?"Mã HĐ":"ID"}         field="id"        sortField={sortField} sortDir={sortDir} onSort={handleSort} onClear={clearSort} th={th} options={sortById}   style={hd}/>
                <SortTh label={vi?"Nhân viên":"Employee"} field="empName"   sortField={sortField} sortDir={sortDir} onSort={handleSort} onClear={clearSort} th={th} options={sortByName} style={hd}/>
                <SortTh label={vi?"Phòng ban":"Dept"}     field={null}      sortField={sortField} sortDir={sortDir} onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
                <SortTh label={vi?"Loại HĐ":"Type"}      field={null}      sortField={sortField} sortDir={sortDir} onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
                <DateSortTh
                  label={vi?"Bắt đầu":"Start"}
                  field="startDate"
                  sortField={sortField} sortDir={sortDir}
                  onSort={handleSort} onClear={clearSort}
                  dateValue={startDateExact}
                  onDateChange={setStartDateExact}
                  th={th} style={hd} vi={vi}
                />
                <DateSortTh
                  label={vi?"Kết thúc":"End"}
                  field={null}
                  sortField={sortField} sortDir={sortDir}
                  onSort={handleSort} onClear={clearSort}
                  dateValue={endDateExact}
                  onDateChange={setEndDateExact}
                  th={th} style={hd} vi={vi}
                />
                <SalaryFilterTh
                  label={vi?"Lương CB":"Salary"}
                  sortField={sortField} sortDir={sortDir}
                  onSort={handleSort} onClear={clearSort}
                  salaryVal={salaryFilter}
                  onSalaryChange={setSalaryFilter}
                  th={th} style={hd} vi={vi}
                />
                <SortTh label={vi?"Trạng thái":"Status"} field={null}      sortField={sortField} sortDir={sortDir} onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
                <SortTh label={vi?"Thao tác":"Actions"}  field={null}      sortField={sortField} sortDir={sortDir} onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={9} style={{ ...td, textAlign:"center", color:th.text3, padding:40 }}>
                  {vi?"Không tìm thấy hợp đồng nào.":"No contracts found."}
                </td></tr>
              ) : pageRows.map(c => {
                const sb = statusBadge(c.uiStatus, vi)
                return (
                  <tr key={c.id}
                    onMouseEnter={e => (e.currentTarget.style.background = th.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    style={{ transition:"background .1s" }}>
                    <td style={{ ...td, color:"#D0211C", fontWeight:700, fontSize:12 }}>
                      {vi?"HĐ":"C"}{String(c.id).padStart(3,"0")}
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight:600 }}>{c.empName}</div>
                      <div style={{ fontSize:11, color:th.text3 }}>{c.empCode}</div>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize:11.5, background:th.tableHead,
                        borderRadius:8, padding:"2px 8px" }}>{tDept(c.dept, vi)||"—"}</span>
                    </td>
                    <td style={td}>
                      {(() => {
                        const typeMap: Record<string,string> = {"Chính thức":"Full-time","Thử việc":"Probation","Thời vụ":"Seasonal","Thực tập":"Internship"}
                        return (
                          <span style={{
                            background: c.contractType==="Chính thức"?"#D1FAE5"
                              :c.contractType==="Thử việc"?"#FEF3C7":c.contractType==="Thực tập"?"#E0E7FF":"#E0E7FF",
                            color: c.contractType==="Chính thức"?"#065F46"
                              :c.contractType==="Thử việc"?"#92400E":c.contractType==="Thực tập"?"#3730A3":"#3730A3",
                            borderRadius:10, padding:"2px 10px", fontSize:11.5, fontWeight:600,
                          }}>{vi ? c.contractType : (typeMap[c.contractType] ?? c.contractType)}</span>
                        )
                      })()}
                    </td>
                    <td style={td}>{c.startDate}</td>
                    <td style={td}>{c.endDate ?? <span style={{ color:th.text3 }}>—</span>}</td>
                    <td style={{ ...td, fontWeight:600 }}>{fmtSalary(c.baseSalary)}</td>
                    <td style={td}>
                      <span style={{ background:sb.bg, color:sb.color, borderRadius:12,
                        padding:"3px 10px", fontSize:11.5, fontWeight:700 }}>{sb.text}</span>
                    </td>
                    <td style={td}>
                      <button onClick={() => setSelected(c)}
                        style={{ width:30, height:30, borderRadius:7, border:"none",
                          background:"#EFF6FF", cursor:"pointer", display:"flex",
                          alignItems:"center", justifyContent:"center" }}>
                        <Eye size={13} color="#1D4ED8"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>

          {/* Count + Pagination */}
          <div style={{ padding:"10px 14px", background:th.tableHead,
            borderTop:`1px solid ${th.tableBorder}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:12, color:th.text2 }}>
              {vi
                ? `Hiển thị ${Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–${Math.min(page*PAGE_SIZE,filtered.length)} trong ${filtered.length} hợp đồng`
                : `Showing ${Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–${Math.min(page*PAGE_SIZE,filtered.length)} of ${filtered.length} contracts`}
            </span>
            {totalPages > 1 && (
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <button disabled={page<=1} onClick={() => setPage(p=>p-1)} style={{
                  display:"flex", alignItems:"center", gap:3, padding:"4px 10px", borderRadius:6,
                  border:`1px solid ${th.cardBorder}`,
                  background:page>1?"#D0211C":th.cardBg, color:page>1?"#fff":th.text3,
                  cursor:page>1?"pointer":"not-allowed", fontSize:12, fontFamily:"inherit",
                }}>
                  <ChevronLeft size={13}/> {vi?"Trước":"Prev"}
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1)
                  .filter(p => p===1||p===totalPages||Math.abs(p-page)<=1)
                  .reduce<(number|"...")[]>((acc,p,idx,arr) => {
                    if (idx>0 && p-(arr[idx-1] as number)>1) acc.push("...")
                    acc.push(p); return acc
                  },[])
                  .map((p,i) => p==="..." ? (
                    <span key={`d${i}`} style={{ color:th.text3, fontSize:12 }}>…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p as number)} style={{
                      width:28, height:28, borderRadius:6, border:"none",
                      background:page===p?"#D0211C":th.cardBg, color:page===p?"#fff":th.text2,
                      fontWeight:page===p?700:400, cursor:"pointer", fontSize:12, fontFamily:"inherit",
                      boxShadow:page===p?"0 2px 8px rgba(208,33,28,0.3)":"none",
                    }}>{p}</button>
                  ))}
                <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} style={{
                  display:"flex", alignItems:"center", gap:3, padding:"4px 10px", borderRadius:6,
                  border:`1px solid ${th.cardBorder}`,
                  background:page<totalPages?"#D0211C":th.cardBg, color:page<totalPages?"#fff":th.text3,
                  cursor:page<totalPages?"pointer":"not-allowed", fontSize:12, fontFamily:"inherit",
                }}>
                  {vi?"Sau":"Next"} <ChevronRight size={13}/>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Detail modal ── */}
      {selected && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:9000 }}
            onClick={() => setSelected(null)}/>
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", zIndex:9001, padding:20 }}>
            <div style={{ background:th.cardBg, borderRadius:18, width:"min(520px,95vw)",
              boxShadow:"0 20px 60px rgba(0,0,0,0.35)", overflow:"hidden", animation:"fadeDown .2s ease" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ background:"linear-gradient(135deg,#D0211C,#F97316)",
                padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ color:"#fff" }}>
                  <div style={{ fontWeight:800, fontSize:16, display:"flex", alignItems:"center", gap:8 }}>
                    <FileText size={15}/>{vi?"Chi tiết hợp đồng":"Contract Detail"}
                  </div>
                  <div style={{ fontSize:12, opacity:0.8, marginTop:2 }}>
                    {vi?"HĐ":"C"}{String(selected.id).padStart(3,"0")} · {selected.empCode}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8,
                  width:32, height:32, cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center" }}>
                  <X size={15} color="#fff"/>
                </button>
              </div>
              <div style={{ padding:"20px 22px" }}>
                {[
                  { l:vi?"Nhân viên":"Employee",    v:`${selected.empName} (${selected.empCode})` },
                  { l:vi?"Phòng ban":"Department",  v:tDept(selected.dept, vi)||"—" },
                  { l:vi?"Loại hợp đồng":"Type",   v:vi?selected.contractType:({"Chính thức":"Full-time","Thử việc":"Probation","Thời vụ":"Seasonal","Thực tập":"Internship"} as Record<string,string>)[selected.contractType]??selected.contractType },
                  { l:vi?"Ngày bắt đầu":"Start",   v:selected.startDate },
                  { l:vi?"Ngày kết thúc":"End",     v:selected.endDate??(vi?"Không xác định":"Open-ended") },
                  { l:vi?"Lương cơ bản":"Base",     v:fmtSalary(selected.baseSalary) },
                  { l:vi?"Phụ cấp":"Allowance",     v:fmtSalary(selected.allowance) },
                  { l:vi?"Tổng thu nhập":"Total",  v:fmtSalary(selected.baseSalary+selected.allowance) },
                  { l:vi?"Trạng thái":"Status",    v:statusBadge(selected.uiStatus,vi).text },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between",
                    padding:"9px 0", borderBottom:`1px solid ${th.tableBorder}`, fontSize:13 }}>
                    <span style={{ color:th.text2 }}>{r.l}</span>
                    <span style={{ fontWeight:600, color:th.text1 }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 22px", background:th.tableHead,
                borderTop:`1px solid ${th.tableBorder}`, textAlign:"right" }}>
                <button onClick={() => setSelected(null)} style={{
                  padding:"8px 20px", borderRadius:8, border:"none",
                  background:"#D0211C", color:"#fff", fontSize:13,
                  fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  {vi?"Đóng":"Close"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Create Contract Modal ── */}
      {showCreate && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:9000 }}
            onClick={() => setShowCreate(false)}/>
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", zIndex:9001, padding:20 }}>
            <div style={{ background:th.cardBg, borderRadius:18, width:"min(540px,95vw)",
              boxShadow:"0 20px 60px rgba(0,0,0,0.35)", overflow:"hidden", animation:"fadeDown .2s ease" }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ background:"linear-gradient(135deg,#D0211C,#F97316)",
                padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ color:"#fff" }}>
                  <div style={{ fontWeight:800, fontSize:16, display:"flex", alignItems:"center", gap:8 }}>
                    <Plus size={15}/>{vi?"Tạo hợp đồng mới":"New Contract"}
                  </div>
                  <div style={{ fontSize:12, opacity:0.8, marginTop:2 }}>
                    {vi?"Nhập thông tin hợp đồng lao động":"Fill in the employment contract details"}
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} style={{
                  background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8,
                  width:32, height:32, cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center" }}>
                  <X size={15} color="#fff"/>
                </button>
              </div>

              {/* Body */}
              <div style={{ padding:"22px", display:"flex", flexDirection:"column", gap:14,
                maxHeight:"65vh", overflowY:"auto" }}>

                {createErr && (
                  <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8,
                    padding:"10px 14px", fontSize:13, color:"#DC2626", fontWeight:600 }}>{createErr}</div>
                )}

                {/* Nhân viên */}
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                    {vi?"Nhân viên *":"Employee *"}
                  </label>
                  <select
                    value={form.employeeId}
                    onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                      fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                      fontFamily:"inherit", width:"100%" }}>
                    <option value="">{vi?"-- Chọn nhân viên --":"-- Select employee --"}</option>
                    {empList.map(e => (
                      <option key={e.id} value={e.id}>{e.code} — {e.name}</option>
                    ))}
                  </select>
                </div>

                {/* Loại HĐ */}
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                    {vi?"Loại hợp đồng":"Contract Type"}
                  </label>
                  <select
                    value={form.contractType}
                    onChange={e => setForm(f => ({ ...f, contractType: e.target.value }))}
                    style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                      fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                      fontFamily:"inherit", width:"100%" }}>
                    <option value="Chính thức">{vi?"Chính thức":"Full-time"}</option>
                    <option value="Thử việc">{vi?"Thử việc":"Probation"}</option>
                    <option value="Thời vụ">{vi?"Thời vụ":"Seasonal"}</option>
                  </select>
                </div>

                {/* Ngày */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                      {vi?"Ngày bắt đầu *":"Start Date *"}
                    </label>
                    <DateInput value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                        fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                        fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                      {vi?"Ngày kết thúc":"End Date"}
                      <span style={{ color:th.text3, fontWeight:400 }}> ({vi?"bỏ trống = vô thời hạn":"blank = open-ended"})</span>
                    </label>
                    <DateInput value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                        fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                        fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
                  </div>
                </div>

                {/* Lương */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                      {vi?"Lương cơ bản (VNĐ) *":"Base Salary (VND) *"}
                    </label>
                    <input type="number" min={0} step={500000} placeholder="VD: 15000000"
                      value={form.baseSalary}
                      onChange={e => setForm(f => ({ ...f, baseSalary: e.target.value }))}
                      style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                        fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                        fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                      {vi?"Phụ cấp (VNĐ)":"Allowance (VND)"}
                    </label>
                    <input type="number" min={0} step={100000} placeholder="0"
                      value={form.allowance}
                      onChange={e => setForm(f => ({ ...f, allowance: e.target.value }))}
                      style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                        fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                        fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
                  </div>
                </div>

                {/* Ghi chú */}
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:th.text2 }}>
                    {vi?"Ghi chú":"Notes"}
                  </label>
                  <textarea rows={3} placeholder={vi?"Ghi chú thêm... (tùy chọn)":"Optional notes..."}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ padding:"9px 12px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
                      fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
                      fontFamily:"inherit", width:"100%", boxSizing:"border-box", resize:"vertical" }}/>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding:"14px 22px", background:th.tableHead,
                borderTop:`1px solid ${th.tableBorder}`,
                display:"flex", justifyContent:"flex-end", gap:10 }}>
                <button onClick={() => setShowCreate(false)} style={{
                  padding:"9px 18px", borderRadius:8, border:`1px solid ${th.inputBorder}`,
                  background:th.cardBg, color:th.text1, fontSize:13,
                  fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  {vi?"Hủy":"Cancel"}
                </button>
                <button onClick={handleCreate} disabled={saving} style={{
                  padding:"9px 22px", borderRadius:8, border:"none",
                  background:"linear-gradient(135deg,#D0211C,#F97316)", color:"#fff",
                  fontSize:13, fontWeight:700, cursor:saving?"not-allowed":"pointer",
                  fontFamily:"inherit", opacity:saving?0.75:1,
                  display:"flex", alignItems:"center", gap:6 }}>
                  {saving && <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/>}
                  {saving ? (vi?"Đang lưu...":"Saving...") : (vi?"Tạo hợp đồng":"Create Contract")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
