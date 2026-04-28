/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Eye, Pencil, Trash2, Search, X, Loader2,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Check,
} from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, hardDeleteEmployee, reinstateEmployee } from "@/lib/actions/employee.actions"
import { getDepartments, getPositions } from "@/lib/actions/department.actions"
import { createContract } from "@/lib/actions/contract.actions"
import { matchAny } from "@/lib/utils/search"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { tDept, tPos, tContractType } from "@/lib/i18n-maps"
import { DateInput } from "@/components/ui/date-input"
import { AvatarImg } from "@/components/ui/avatar-img"

// ── Position classification for optgroup + intern logic ────────
const EXEC_POSITIONS = new Set(["Giám đốc", "Phó Giám đốc"])
const MGR_POSITIONS = new Set([
  "Trưởng phòng CNTT", "Trưởng phòng Nhân sự", "Trưởng phòng Kế toán",
  "Trưởng phòng Kinh doanh", "Trưởng phòng Marketing", "Trưởng phòng",
])
const INTERN_POS_NAMES = new Set(["Thực tập sinh"])

function posGroup(name: string): "exec" | "mgr" | "staff" {
  if (EXEC_POSITIONS.has(name)) return "exec"
  if (MGR_POSITIONS.has(name)) return "mgr"
  return "staff"
}
function isInternPos(posId: string, positions: { id: number; name: string }[]): boolean {
  if (!posId) return false
  const p = positions.find(x => x.id === Number(posId))
  return p ? INTERN_POS_NAMES.has(p.name) : false
}

// ── UI types ──────────────────────────────────────────────────
type Employee = {
  dbId: number; id: string; name: string; email: string; phone: string
  deptId: number | null; dept: string
  posId: number | null; pos: string
  type: string; st: string; date: string; rawDate: Date | null
  avatarPath: string | null
}
type Opt = { id: number; name: string }
type FormData = {
  name: string; email: string; phone: string
  deptId: string; posId: string; type: string; date: string
}
type SortField = "id" | "name" | "date" | null
type SortDir = "asc" | "desc"

const EMPTY_FORM: FormData = { name: "", email: "", phone: "", deptId: "", posId: "", type: "Chính thức", date: "" }
const PAGE_SIZE = 10

// ── Mapper DB → UI ────────────────────────────────────────────
function mapEmp(e: any): Employee {
  const contract = e.contracts?.[0]
  const hireDate = e.hireDate ? new Date(e.hireDate) : null
  return {
    dbId: e.id,
    id: e.code,
    name: e.fullName,
    email: e.email ?? "",
    phone: e.phone ?? "",
    deptId: e.departmentId ?? null,
    dept: e.department?.name ?? "",
    posId: e.positionId ?? null,
    pos: e.position?.name ?? "",
    type: contract?.contractType ?? "Chính thức",
    st: e.status === "Đang làm" ? "active" : e.status === "Thử việc" ? "trial" : "resigned",
    date: hireDate
      ? `${String(hireDate.getDate()).padStart(2, "0")}/${String(hireDate.getMonth() + 1).padStart(2, "0")}/${hireDate.getFullYear()}`
      : "",
    rawDate: hireDate,
    avatarPath: e.avatarPath ?? null,
  }
}


function EmpAvatar({ name, avatarPath, size = 32 }: { name: string; avatarPath: string | null; size?: number }) {
  return <AvatarImg src={avatarPath} name={name} alt={name} size={size} />
}

// ── i18n ──────────────────────────────────────────────────────
const T: any = {
  vi: {
    title: "Quản lý nhân sự", sub: "Quản lý hồ sơ và thông tin nhân viên.", add: "+ Thêm nhân viên",
    ph: "Tìm kiếm mã NV, tên, phòng ban, chức vụ, loại HĐ, ngày vào làm...",
    cols: ["Mã NV", "Họ tên", "Phòng ban", "Chức vụ", "Loại HĐ", "Trạng thái", "Ngày vào làm", "Thao tác"],
    active: "Đang làm việc", trial: "Thử việc", resigned: "Nghỉ việc",
    prev: "Trước", next: "Sau",
    modalAdd: "Thêm nhân viên mới", modalEdit: "Chỉnh sửa nhân viên",
    save: "Lưu", saving: "Đang lưu...", cancel: "Hủy",
    fName: "Họ và tên *", fEmail: "Email *", fPhone: "Số điện thoại",
    fDept: "Phòng ban", fPos: "Chức vụ", fType: "Loại hợp đồng", fDate: "Ngày vào làm *",
    delTitle: "Xác nhận xóa", delMsg: "Bạn có chắc chắn muốn xóa nhân viên",
    delConfirm: "Xóa", delCancel: "Hủy",
    errName: "Vui lòng nhập họ tên", errEmail: "Email không hợp lệ", errDate: "Vui lòng chọn ngày vào làm",
    viewBtn: "Xem", editBtn: "Sửa", delBtn: "Xóa",
    loading: "Đang tải...", empty: "Không tìm thấy nhân viên nào.",
    selectDept: "-- Chọn phòng ban --", selectPos: "-- Chọn chức vụ --",
    types: ["Chính thức", "Thử việc", "Thời vụ", "Thực tập"],
    errServer: "Có lỗi xảy ra, vui lòng thử lại",
    showing: "Hiển thị", of: "trong", employees: "nhân viên",
    sortNone: "Mặc định", sortAsc: "Tăng dần (A→Z)", sortDesc: "Giảm dần (Z→A)",
    sortAscNum: "Tăng dần (nhỏ→lớn)", sortDescNum: "Giảm dần (lớn→nhỏ)",
    sortAscDate: "Cũ nhất trước", sortDescDate: "Mới nhất trước",
    allDepts: "Phòng ban", allPos: "Chức vụ", allTypes: "Loại HĐ", allStatus: "Trạng thái",
    clearFilter: "Bỏ chọn",
  },
  en: {
    title: "Employee Management", sub: "Manage employee profiles and information.", add: "+ Add Employee",
    ph: "Search by ID, name, department, position, contract type, join date...",
    cols: ["ID", "Full Name", "Department", "Position", "Contract", "Status", "Join Date", "Actions"],
    active: "Active", trial: "Probation", resigned: "Resigned",
    prev: "Prev", next: "Next",
    modalAdd: "Add New Employee", modalEdit: "Edit Employee",
    save: "Save", saving: "Saving...", cancel: "Cancel",
    fName: "Full Name *", fEmail: "Email *", fPhone: "Phone Number",
    fDept: "Department", fPos: "Position", fType: "Contract Type", fDate: "Join Date *",
    delTitle: "Confirm Delete", delMsg: "Are you sure you want to delete",
    delConfirm: "Delete", delCancel: "Cancel",
    errName: "Please enter full name", errEmail: "Invalid email address", errDate: "Please select join date",
    viewBtn: "View", editBtn: "Edit", delBtn: "Delete",
    loading: "Loading...", empty: "No employees found.",
    selectDept: "-- Select department --", selectPos: "-- Select position --",
    types: ["Full-time", "Probation", "Contract", "Internship Agreement"],
    errServer: "An error occurred, please try again",
    showing: "Showing", of: "of", employees: "employees",
    sortNone: "Default", sortAsc: "A → Z", sortDesc: "Z → A",
    sortAscNum: "Smallest first", sortDescNum: "Largest first",
    sortAscDate: "Oldest first", sortDescDate: "Newest first",
    allDepts: "Department", allPos: "Position", allTypes: "Contract", allStatus: "Status",
    clearFilter: "Clear",
  },
}

function nextCode(emps: Employee[]) {
  const max = emps.reduce((m, e) => Math.max(m, parseInt(e.id.replace("NV", "")) || 0), 0)
  return `NV${String(max + 1).padStart(3, "0")}`
}

function Field({ label, error, th, children }: { label: string; error?: string; th: any; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: th.text2 }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 11, color: "#EF4444" }}>{error}</span>}
    </div>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  )
}

// ── Filter popup button ───────────────────────────────────────
function FilterPopup({
  label, value, options, onChange, onClear, th, accent,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  onClear: () => void
  th: any
  accent?: boolean
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
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 13px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
          fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
          border: active ? "1.5px solid #D0211C" : `1px solid ${th.inputBorder}`,
          background: active ? "rgba(208,33,28,0.07)" : th.cardBg,
          color: active ? "#D0211C" : th.text2,
          transition: "all .15s",
          boxShadow: active ? "0 0 0 3px rgba(208,33,28,0.1)" : "none",
        }}
      >
        {active ? selectedLabel : label}
        {active
          ? <X size={13} onClick={e => { e.stopPropagation(); onClear(); setOpen(false) }} style={{ cursor: "pointer", opacity: 0.7 }} />
          : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        }
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 300,
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          minWidth: 180, overflow: "hidden",
        }}>
          {options.map(opt => {
            const selected = value === opt.value
            return (
              <button key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width: "100%", padding: "9px 14px", background: selected ? "rgba(208,33,28,0.08)" : "none",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, color: selected ? "#D0211C" : th.text1,
                  fontWeight: selected ? 700 : 400, fontFamily: "inherit", textAlign: "left",
                  borderBottom: `1px solid ${th.tableBorder}`,
                }}>
                <div style={{ width: 16, display: "flex", justifyContent: "center" }}>
                  {selected && <Check size={13} color="#D0211C" />}
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

// ── Sort popup header cell ─────────────────────────────────────
function SortTh({
  label, field, sortField, sortDir, onSort, onClear, th, options, style,
}: {
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

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  if (!field || !options) {
    return (
      <th style={{
        padding: "10px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        textAlign: "left", color: th.tableHeadText, ...style
      }}>
        {label}
      </th>
    )
  }

  return (
    <th ref={ref} style={{
      padding: "10px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
      textAlign: "left", position: "relative", color: th.tableHeadText, ...style
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none",
          cursor: "pointer", color: active ? "#D0211C" : th.tableHeadText,
          fontWeight: active ? 700 : 600, fontSize: 12, fontFamily: "inherit", padding: 0
        }}
      >
        {label}
        {active
          ? sortDir === "asc"
            ? <ArrowUp size={12} color="#D0211C" />
            : <ArrowDown size={12} color="#D0211C" />
          : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
        }
      </button>

      {/* Popup dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          minWidth: 170, overflow: "hidden",
        }}>
          {/* Clear option */}
          <button
            onClick={() => { onClear(); setOpen(false) }}
            style={{
              width: "100%", padding: "9px 14px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontSize: 12.5, color: th.text2, fontFamily: "inherit", textAlign: "left",
              borderBottom: `1px solid ${th.tableBorder}`,
            }}
          >
            <X size={13} />{" "}{vi ? "Mặc định" : "Default"}
          </button>
          {options.map(opt => {
            const selected = active && sortDir === opt.dir
            return (
              <button
                key={opt.dir}
                onClick={() => { onSort(field, opt.dir); setOpen(false) }}
                style={{
                  width: "100%", padding: "9px 14px", background: selected ? "rgba(208,33,28,0.08)" : "none",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12.5, color: selected ? "#D0211C" : th.text1,
                  fontWeight: selected ? 700 : 400,
                  fontFamily: "inherit", textAlign: "left",
                }}
              >
                {selected ? <Check size={13} color="#D0211C" /> : <div style={{ width: 13 }} />}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </th>
  )
}

export default function EmployeesPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const t = T[lang]
  const vi = lang === "vi"
  const router = useRouter()
  const { isMobile } = useBreakpoint()

  const [emps, setEmps] = useState<Employee[]>([])
  const [depts, setDepts] = useState<Opt[]>([])
  const [positions, setPos] = useState<Opt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<"add" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [delTarget, setDelTarget] = useState<Employee | null>(null)
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")

  // ── Search & sort & filter & page ────────────────────────
  const [q, setQ] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [posFilter, setPosFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  // reset pos when dept changes
  useEffect(() => { setPosFilter("") }, [deptFilter])

  // reset page when anything changes
  useEffect(() => { setPage(1) }, [q, deptFilter, posFilter, typeFilter, statusFilter, sortField, sortDir])

  // ── Load data ─────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    const [empsRes, deptsRes, posRes] = await Promise.all([
      getEmployees({ take: 500 }),
      getDepartments(),
      getPositions(),
    ])
    if (empsRes.success && empsRes.data) setEmps(empsRes.data.map(mapEmp))
    if (deptsRes.success && deptsRes.data) setDepts(deptsRes.data)
    if (posRes.success && posRes.data) setPos(posRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Positions in the currently selected dept (for the Add/Edit form modal)
  const posInForm = useMemo(() => {
    if (!form.deptId) return []
    const ids = new Set(
      emps.filter(e => e.deptId === Number(form.deptId) && e.posId).map(e => e.posId!)
    )
    // Also include the position of the employee being edited
    if (editTarget?.posId) ids.add(editTarget.posId)
    // Fallback: if no employees in dept yet, show all positions
    return ids.size > 0 ? positions.filter(p => ids.has(p.id)) : positions
  }, [form.deptId, emps, positions, editTarget])

  // Positions available in selected dept (for the filter bar cascade)
  const posInDept = useMemo(() => {
    if (!deptFilter) return []
    const ids = new Set(emps.filter(e => e.deptId === Number(deptFilter) && e.posId).map(e => e.posId!))
    return ids.size > 0 ? positions.filter(p => ids.has(p.id)) : positions
  }, [deptFilter, emps, positions])

  // ── Filter + sort ─────────────────────────────────────────
  const rows = useMemo(() => {
    let result = emps.filter(e => {
      if (q && !matchAny([e.id, e.name, e.dept, e.pos, e.type, e.date, e.email], q)) return false
      if (deptFilter && e.deptId !== Number(deptFilter)) return false
      if (posFilter && e.posId !== Number(posFilter)) return false
      if (typeFilter && e.type !== typeFilter) return false
      if (statusFilter && e.st !== statusFilter) return false
      return true
    })
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        if (sortField === "id") {
          cmp = (parseInt(a.id.replace(/\D/g, "")) || 0) - (parseInt(b.id.replace(/\D/g, "")) || 0)
        } else if (sortField === "name") {
          cmp = a.name.localeCompare(b.name, "vi")
        } else if (sortField === "date") {
          cmp = (a.rawDate?.getTime() ?? 0) - (b.rawDate?.getTime() ?? 0)
        }
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  }, [emps, q, deptFilter, posFilter, typeFilter, statusFilter, sortField, sortDir])

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(f: SortField, d: SortDir) { setSortField(f); setSortDir(d) }
  function clearSort() { setSortField(null); setSortDir("asc") }

  // ── Styles ────────────────────────────────────────────────
  const hd: React.CSSProperties = {
    background: th.tableHead, borderBottom: `1px solid ${th.tableBorder}`,
  }
  const td: React.CSSProperties = {
    padding: "12px 14px", fontSize: 13, color: th.text1,
    borderBottom: `1px solid ${th.tableBorder}`, verticalAlign: "middle",
  }
  const inp = (hasErr?: boolean): React.CSSProperties => ({
    padding: "9px 12px", border: `1px solid ${hasErr ? "#EF4444" : th.inputBorder}`, borderRadius: 8,
    fontSize: 13, background: th.inputBg, color: th.text1, outline: "none",
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  })

  // ── Sort options per column ───────────────────────────────
  const sortId = [{ label: vi ? "Nhỏ → Lớn" : "Smallest first", dir: "asc" as SortDir },
  { label: vi ? "Lớn → Nhỏ" : "Largest first", dir: "desc" as SortDir }]
  const sortName = [{ label: vi ? "A → Z" : "A → Z", dir: "asc" as SortDir },
  { label: vi ? "Z → A" : "Z → A", dir: "desc" as SortDir }]
  const sortDate = [{ label: vi ? "Cũ nhất trước" : "Oldest first", dir: "asc" as SortDir },
  { label: vi ? "Mới nhất trước" : "Newest first", dir: "desc" as SortDir }]

  // ── Validate ──────────────────────────────────────────────
  function validate(f: FormData) {
    const e: Record<string, string> = {}
    if (!f.name.trim()) e.name = t.errName
    if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t.errEmail
    if (!f.date) e.date = t.errDate
    return e
  }

  function openAdd() { setForm({ ...EMPTY_FORM }); setErrors({}); setServerError(""); setModal("add") }
  function openEdit(e: Employee) {
    setEditTarget(e)
    const [d, m, y] = e.date.split("/")
    setForm({
      name: e.name, email: e.email, phone: e.phone,
      deptId: e.deptId ? String(e.deptId) : "", posId: e.posId ? String(e.posId) : "",
      type: e.type, date: `${y}-${m}-${d}`
    })
    setErrors({}); setServerError(""); setModal("edit")
  }

  async function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setServerError("")
    const payload = {
      fullName: form.name, email: form.email || undefined, phone: form.phone || undefined,
      departmentId: form.deptId ? Number(form.deptId) : undefined,
      positionId: form.posId ? Number(form.posId) : undefined,
      hireDate: form.date, status: "Đang làm" as const,
    }
    if (modal === "add") {
      const res = await createEmployee({ ...payload, code: nextCode(emps) })
      if (!res.success) { setServerError(t.errServer); setSaving(false); return }
      // Tạo contract record kèm nhân viên mới
      const newEmpId = (res.data as any)?.id
      if (newEmpId) {
        await createContract({
          employeeId: newEmpId,
          contractType: form.type,
          startDate: form.date,
          baseSalary: 0,
          allowance: 0,
          salaryGrade: 1.0,
          status: "Hiệu lực",
        })
      }
    } else if (modal === "edit" && editTarget) {
      const res = await updateEmployee(editTarget.dbId, payload)
      if (!res.success) { setServerError(t.errServer); setSaving(false); return }
    }
    setSaving(false); setModal(null); loadAll()
  }

  async function handleDelete() {
    if (!delTarget) return
    // NV đang làm → soft delete (chuyển nghỉ việc)
    await deleteEmployee(delTarget.dbId)
    setDelTarget(null); loadAll()
  }

  async function handleHardDelete() {
    if (!delTarget) return
    await hardDeleteEmployee(delTarget.dbId)
    setDelTarget(null); loadAll()
  }

  async function handleReinstate() {
    if (!delTarget) return
    await reinstateEmployee(delTarget.dbId)
    setDelTarget(null); loadAll()
  }

  // ── Pagination bar ────────────────────────────────────────
  function PaginationBar() {
    if (rows.length <= PAGE_SIZE && totalPages <= 1) return null
    return (
      <div style={{
        padding: "12px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderTop: `1px solid ${th.tableBorder}`,
        background: th.tableHead, flexWrap: "wrap", gap: 8
      }}>
        <span style={{ fontSize: 12.5, color: th.text2 }}>
          {t.showing} {Math.min((page - 1) * PAGE_SIZE + 1, rows.length)}–{Math.min(page * PAGE_SIZE, rows.length)} {t.of} {rows.length} {t.employees}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{
              display: "flex", alignItems: "center", gap: 3, padding: "5px 11px", borderRadius: 7,
              border: `1px solid ${th.cardBorder}`, background: page > 1 ? "#D0211C" : th.cardBg,
              color: page > 1 ? "#fff" : th.text3, cursor: page > 1 ? "pointer" : "not-allowed",
              fontSize: 12.5, fontWeight: 600, fontFamily: "inherit"
            }}>
            <ChevronLeft size={13} /> {t.prev}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
              acc.push(p); return acc
            }, [])
            .map((p, idx) => p === "..." ? (
              <span key={`dot${idx}`} style={{ padding: "0 2px", color: th.text3, fontSize: 12 }}>…</span>
            ) : (
              <button key={p} onClick={() => setPage(p as number)}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: "none",
                  background: page === p ? "#D0211C" : th.cardBg, color: page === p ? "#fff" : th.text2,
                  fontWeight: page === p ? 700 : 400, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit",
                  boxShadow: page === p ? "0 2px 8px rgba(208,33,28,0.3)" : "none"
                }}>
                {p}
              </button>
            ))}

          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{
              display: "flex", alignItems: "center", gap: 3, padding: "5px 11px", borderRadius: 7,
              border: `1px solid ${th.cardBorder}`, background: page < totalPages ? "#D0211C" : th.cardBg,
              color: page < totalPages ? "#fff" : th.text3, cursor: page < totalPages ? "pointer" : "not-allowed",
              fontSize: 12.5, fontWeight: 600, fontFamily: "inherit"
            }}>
            {t.next} <ChevronRight size={13} />
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: th.text1, margin: 0 }}>{t.title}</h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>{t.sub}</p>
        </div>
        <button onClick={openAdd} style={{
          background: "#D0211C", color: "#fff", border: "none", borderRadius: 8,
          padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(208,33,28,0.3)", fontFamily: "inherit",
        }}>{t.add}</button>
      </div>

      {/* ── Search + Filter row ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>

        {/* Search input */}
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 200 }}>
          <Search size={15} color={th.text3}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder={t.ph}
            style={{
              width: "100%", padding: "10px 38px 10px 36px",
              border: `1px solid ${th.inputBorder}`, borderRadius: 9,
              fontSize: 13.5, background: th.cardBg, color: th.text1,
              outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }} />
          {q && (
            <button onClick={() => setQ("")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: th.text3, display: "flex"
              }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Phòng ban */}
        <FilterPopup
          label={t.allDepts}
          value={deptFilter}
          options={depts.map(d => ({ value: String(d.id), label: tDept(d.name, vi) }))}
          onChange={setDeptFilter}
          onClear={() => setDeptFilter("")}
          th={th}
        />

        {/* Chức vụ — chỉ hiện khi đã chọn phòng ban */}
        {deptFilter && (
          <FilterPopup
            label={t.allPos}
            value={posFilter}
            options={posInDept.map(p => ({ value: String(p.id), label: tPos(p.name, vi) }))}
            onChange={setPosFilter}
            onClear={() => setPosFilter("")}
            th={th}
          />
        )}

        {/* Loại HĐ */}
        <FilterPopup
          label={t.allTypes}
          value={typeFilter}
          options={[
            { value: "Chính thức", label: vi ? "Chính thức" : "Full-time" },
            { value: "Thử việc", label: vi ? "Thử việc" : "Probation" },
            { value: "Thời vụ", label: vi ? "Thời vụ" : "Contract" },
            { value: "Thực tập", label: vi ? "Thực tập" : "Internship Agreement" },
          ]}
          onChange={setTypeFilter}
          onClear={() => setTypeFilter("")}
          th={th}
        />

        {/* Trạng thái */}
        <FilterPopup
          label={t.allStatus}
          value={statusFilter}
          options={[
            { value: "active", label: t.active },
            { value: "trial", label: t.trial },
            { value: "resigned", label: t.resigned },
          ]}
          onChange={setStatusFilter}
          onClear={() => setStatusFilter("")}
          th={th}
        />
      </div>

      {/* ── Table / Cards ── */}
      {isMobile ? (
        /* Mobile cards */
        <div className="mobile-card-list">
          {loading ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: th.text2 }} />
            </div>
          ) : pageRows.length === 0 ? (
            <div style={{ textAlign: "center", color: th.text3, padding: 32, fontSize: 13 }}>{t.empty}</div>
          ) : pageRows.map(e => (
            <div key={e.dbId} style={{
              background: th.cardBg, border: `1px solid ${th.cardBorder}`,
              borderRadius: 12, padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 10
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <EmpAvatar name={e.name} avatarPath={e.avatarPath} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: th.text1, fontSize: 14 }}>{e.name}</div>
                </div>
                <span style={{ fontWeight: 700, color: "#D0211C", fontSize: 12 }}>{e.id}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 12, fontSize: 12.5 }}>
                <div><span style={{ color: th.text2 }}>{vi ? "Phòng ban" : "Dept"}: </span><b style={{ color: th.text1 }}>{tDept(e.dept, vi) || "—"}</b></div>
                <div><span style={{ color: th.text2 }}>{vi ? "Chức vụ" : "Position"}: </span><b style={{ color: th.text1 }}>{tPos(e.pos, vi) || "—"}</b></div>
                <div><span style={{ color: th.text2 }}>{vi ? "Hợp đồng" : "Contract"}: </span><b style={{ color: th.text1 }}>{tContractType(e.type, vi)}</b></div>
                <div><span style={{ color: th.text2 }}>{vi ? "Ngày vào" : "Join"}: </span><b style={{ color: th.text1 }}>{e.date}</b></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                  background: e.st === "active" ? "#D1FAE5" : e.st === "trial" ? "#FEF3C7" : "#FEE2E2", color: e.st === "active" ? "#065F46" : e.st === "trial" ? "#92400E" : "#991B1B"
                }}>
                  {e.st === "active" ? t.active : e.st === "trial" ? t.trial : t.resigned}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => router.push(`/employees/${e.dbId}`)} style={{
                    padding: "5px 10px", borderRadius: 6, border: "none",
                    background: "#EFF6FF", cursor: "pointer", fontSize: 11.5, fontWeight: 600, color: "#1D4ED8", fontFamily: "inherit"
                  }}>{t.viewBtn}</button>
                  <button onClick={() => openEdit(e)} style={{
                    padding: "5px 10px", borderRadius: 6, border: "none",
                    background: "#F0FDF4", cursor: "pointer", fontSize: 11.5, fontWeight: 600, color: "#15803D", fontFamily: "inherit"
                  }}>{t.editBtn}</button>
                  <button onClick={() => setDelTarget(e)} style={{
                    padding: "5px 10px", borderRadius: 6, border: "none",
                    background: "#FEF2F2", cursor: "pointer", fontSize: 11.5, fontWeight: 600, color: "#B91C1C", fontFamily: "inherit"
                  }}>{t.delBtn}</button>
                </div>
              </div>
            </div>
          ))}
          <PaginationBar />
        </div>
      ) : (
        /* Desktop table */
        <div style={{
          background: th.cardBg, borderRadius: 12, overflow: "visible",
          border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <div style={{ overflowX: "auto", borderRadius: "12px 12px 0 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <SortTh label={t.cols[0]} field="id" sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} options={sortId} style={hd} />
                  <SortTh label={t.cols[1]} field="name" sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} options={sortName} style={hd} />
                  <SortTh label={t.cols[2]} field={null} sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} style={hd} />
                  <SortTh label={t.cols[3]} field={null} sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} style={hd} />
                  <SortTh label={t.cols[4]} field={null} sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} style={hd} />
                  <SortTh label={t.cols[5]} field={null} sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} style={hd} />
                  <SortTh label={t.cols[6]} field="date" sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} options={sortDate} style={hd} />
                  <SortTh label={t.cols[7]} field={null} sortField={sortField} sortDir={sortDir}
                    onSort={handleSort} onClear={clearSort} th={th} style={hd} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ ...td, textAlign: "center", padding: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: th.text2 }}>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />{t.loading}
                    </div>
                  </td></tr>
                ) : pageRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: th.text3, padding: 40 }}>{t.empty}</td></tr>
                ) : pageRows.map(e => (
                  <tr key={e.dbId}
                    onMouseEnter={el => (el.currentTarget.style.background = th.rowHover)}
                    onMouseLeave={el => (el.currentTarget.style.background = "transparent")}
                    style={{ transition: "background .1s" }}>
                    <td style={td}><span style={{ fontWeight: 700, color: "#D0211C", fontSize: 12 }}>{e.id}</span></td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <EmpAvatar name={e.name} avatarPath={e.avatarPath} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, color: th.text1, fontSize: 13 }}>{e.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>{tDept(e.dept, vi) || "—"}</td>
                    <td style={td}>{tPos(e.pos, vi) || "—"}</td>
                    <td style={td}>
                      {(() => {
                        const label = tContractType(e.type, vi)
                        return (
                          <span style={{
                            display: "inline-block", padding: "2px 9px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            background: e.type === "Chính thức" ? "rgba(59,130,246,0.1)" : e.type === "Thử việc" ? "rgba(245,158,11,0.1)" : e.type === "Thực tập" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
                            color: e.type === "Chính thức" ? "#1D4ED8" : e.type === "Thử việc" ? "#92400E" : e.type === "Thực tập" ? "#059669" : th.text2
                          }}>
                            {label}
                          </span>
                        )
                      })()}
                    </td>
                    <td style={td}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                        background: e.st === "active" ? "#D1FAE5" : e.st === "trial" ? "#FEF3C7" : "#FEE2E2", color: e.st === "active" ? "#065F46" : e.st === "trial" ? "#92400E" : "#991B1B"
                      }}>
                        {e.st === "active" ? t.active : e.st === "trial" ? t.trial : t.resigned}
                      </span>
                    </td>
                    <td style={td}>{e.date}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button title={t.viewBtn} onClick={() => router.push(`/employees/${e.dbId}`)}
                          style={{
                            width: 30, height: 30, borderRadius: 6, border: "none", display: "flex",
                            alignItems: "center", justifyContent: "center", background: "#EFF6FF", cursor: "pointer"
                          }}>
                          <Eye size={14} color="#1D4ED8" />
                        </button>
                        <button title={t.editBtn} onClick={() => openEdit(e)}
                          style={{
                            width: 30, height: 30, borderRadius: 6, border: "none", display: "flex",
                            alignItems: "center", justifyContent: "center", background: "#F0FDF4", cursor: "pointer"
                          }}>
                          <Pencil size={14} color="#15803D" />
                        </button>
                        <button title={t.delBtn} onClick={() => setDelTarget(e)}
                          style={{
                            width: 30, height: 30, borderRadius: 6, border: "none", display: "flex",
                            alignItems: "center", justifyContent: "center", background: "#FEF2F2", cursor: "pointer"
                          }}>
                          <Trash2 size={14} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar />
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <Overlay onClose={() => setModal(null)}>
          <div style={{
            background: th.cardBg, borderRadius: 16, width: "100%", maxWidth: 560,
            boxShadow: "0 24px 64px rgba(0,0,0,0.3)", overflow: "hidden"
          }}>
            <div style={{
              background: "linear-gradient(135deg,#D0211C,#F97316)", padding: "20px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
                  {modal === "add" ? t.modalAdd : t.modalEdit}
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
                  {modal === "add"
                    ? (vi ? "Điền thông tin nhân viên mới bên dưới" : "Fill in the new employee details below")
                    : (vi ? `Chỉnh sửa hồ sơ ${editTarget?.name}` : `Editing ${editTarget?.name}`)}
                </div>
              </div>
              <button onClick={() => setModal(null)} style={{
                background: "rgba(255,255,255,0.2)", border: "none",
                borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <X size={16} color="#fff" />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto", background: th.cardBg }}>
              {serverError && (
                <div style={{
                  background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
                  padding: "10px 14px", fontSize: 13, color: "#DC2626"
                }}>{serverError}</div>
              )}
              <Field label={t.fName} error={errors.name} th={th}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={vi ? "Nguyễn Văn A..." : "John Doe..."} style={inp(!!errors.name)} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={t.fEmail} error={errors.email} th={th}>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@gmail.com" style={inp(!!errors.email)} />
                </Field>
                <Field label={t.fPhone} th={th}>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0900 000 000" style={inp()} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={t.fDept} th={th}>
                  {modal === "edit" ? (
                    // Chức vụ và phòng ban không được đổi tự do — phải qua Quá trình công tác
                    <div style={{
                      ...inp(), display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: dark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
                      color: th.text2, cursor: "not-allowed",
                    }}>
                      <span style={{ color: th.text1, fontWeight: 500 }}>
                        {tDept(editTarget?.dept ?? "", vi) || editTarget?.dept || "—"}
                      </span>
                      <span style={{ fontSize: 11, color: th.text3, marginLeft: 6 }}>🔒</span>
                    </div>
                  ) : (
                    <select
                      value={form.deptId}
                      onChange={e => setForm(f => ({ ...f, deptId: e.target.value, posId: "" }))}
                      style={inp()}
                    >
                      <option value="">{t.selectDept}</option>
                      {depts.map(d => <option key={d.id} value={d.id}>{tDept(d.name, vi) || d.name}</option>)}
                    </select>
                  )}
                </Field>
                <Field label={t.fPos} th={th}>
                  {modal === "edit" ? (
                    <div style={{
                      ...inp(), display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: dark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
                      color: th.text2, cursor: "not-allowed",
                    }}>
                      <span style={{ color: th.text1, fontWeight: 500 }}>
                        {tPos(editTarget?.pos ?? "", vi) || editTarget?.pos || "—"}
                      </span>
                      <span style={{ fontSize: 11, color: th.text3, marginLeft: 6 }}>🔒</span>
                    </div>
                  ) : (
                    <select
                      value={form.posId}
                      onChange={e => {
                        const newPosId = e.target.value
                        const intern = isInternPos(newPosId, positions)
                        setForm(f => ({
                          ...f,
                          posId: newPosId,
                          type: intern ? "Thực tập" : (f.type === "Thực tập" ? "Chính thức" : f.type),
                        }))
                      }}
                      disabled={!form.deptId}
                      style={{
                        ...inp(),
                        opacity: form.deptId ? 1 : 0.5,
                        cursor: form.deptId ? "auto" : "not-allowed",
                      }}
                    >
                      <option value="">{form.deptId ? t.selectPos : (vi ? "-- Chọn phòng ban trước --" : "-- Select dept first --")}</option>
                      {(() => {
                        const mgr = posInForm.filter(p => posGroup(p.name) === "mgr")
                        const staff = posInForm.filter(p => posGroup(p.name) === "staff")
                        return (
                          <>
                            {mgr.length > 0 && (
                              <optgroup label={vi ? "── Quản lý ──" : "── Management ──"}>
                                {mgr.map(p => <option key={p.id} value={p.id}>{tPos(p.name, vi) || p.name}</option>)}
                              </optgroup>
                            )}
                            {staff.length > 0 && (
                              <optgroup label={vi ? "── Chuyên môn ──" : "── Professional ──"}>
                                {staff.map(p => <option key={p.id} value={p.id}>{tPos(p.name, vi) || p.name}</option>)}
                              </optgroup>
                            )}
                          </>
                        )
                      })()}
                    </select>
                  )}
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={t.fType} th={th}>
                  {(() => {
                    const intern = isInternPos(form.posId, positions)
                    const isFormal = editTarget?.type === "Chính thức"
                    // Nếu đang edit và đã là Chính thức → khóa, không cho hạ xuống
                    if (modal === "edit" && isFormal) {
                      return (
                        <div style={{
                          ...inp(), display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: dark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
                          color: th.text2, cursor: "not-allowed",
                        }}>
                          <span style={{ color: th.text1, fontWeight: 500 }}>
                            {vi ? "Chính thức" : "Full-time"}
                          </span>
                          <span style={{ fontSize: 11, color: th.text3, marginLeft: 6 }}>🔒</span>
                        </div>
                      )
                    }
                    // Intern: chỉ hiện "Thực tập". Non-intern: chỉ hiện 3 loại kia (không cho chọn Thực tập)
                    const visibleTypes = intern ? ["Thực tập"] : ["Chính thức", "Thử việc", "Thời vụ"]
                    const allTypes = ["Chính thức", "Thử việc", "Thời vụ", "Thực tập"]
                    return (
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        disabled={intern}
                        style={{
                          ...inp(),
                          opacity: intern ? 0.5 : 1,
                          cursor: intern ? "not-allowed" : "auto",
                        }}
                      >
                        {visibleTypes.map(tp => {
                          const idx = allTypes.indexOf(tp)
                          return <option key={tp} value={tp}>{t.types[idx]}</option>
                        })}
                      </select>
                    )
                  })()}
                </Field>
                <Field label={t.fDate} error={errors.date} th={th}>
                  {modal === "edit" ? (
                    // Ngày vào làm là dữ liệu lịch sử — chỉ đặt lúc tạo mới, không cho sửa
                    <div style={{
                      ...inp(), display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: dark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
                      color: th.text2, cursor: "not-allowed",
                    }}>
                      <span style={{ color: th.text1, fontWeight: 500 }}>
                        {editTarget?.date || "—"}
                      </span>
                      <span style={{ fontSize: 11, color: th.text3, marginLeft: 6 }}>🔒</span>
                    </div>
                  ) : (
                    <DateInput value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp(!!errors.date)} />
                  )}
                </Field>
              </div>
            </div>

            <div style={{
              padding: "16px 24px", borderTop: `1px solid ${th.cardBorder}`,
              display: "flex", justifyContent: "flex-end", gap: 10, background: th.tableHead
            }}>
              <button onClick={() => setModal(null)} style={{
                padding: "9px 18px", borderRadius: 8,
                border: `1px solid ${th.inputBorder}`, background: th.cardBg, color: th.text1,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
              }}>{t.cancel}</button>
              <button onClick={handleSubmit} disabled={saving} style={{
                padding: "9px 22px", borderRadius: 8,
                border: "none", background: "linear-gradient(135deg,#D0211C,#F97316)", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6
              }}>
                {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                {saving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Delete / Manage Modal ── */}
      {delTarget && (
        <Overlay onClose={() => setDelTarget(null)}>
          <div style={{
            background: th.cardBg, borderRadius: 16, width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.3)", overflow: "hidden"
          }}>
            <div style={{ padding: "24px 24px 20px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: delTarget.st === "resigned"
                  ? (dark ? "rgba(245,158,11,0.15)" : "#FFFBEB")
                  : (dark ? "rgba(220,38,38,0.15)" : "#FEF2F2"),
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
              }}>
                <Trash2 size={24} color={delTarget.st === "resigned" ? "#D97706" : "#DC2626"} />
              </div>
              {delTarget.st === "resigned" ? (
                /* ─── NV đã nghỉ: 2 lựa chọn ─── */
                <>
                  <div style={{ fontSize: 17, fontWeight: 800, color: th.text1, marginBottom: 8 }}>
                    {vi ? "Quản lý nhân viên nghỉ việc" : "Manage Resigned Employee"}
                  </div>
                  <div style={{ fontSize: 13, color: th.text2, lineHeight: 1.6 }}>
                    <b style={{ color: th.text1 }}>{delTarget.name}</b>
                    {vi ? " đang ở trạng thái nghỉ việc. Bạn muốn làm gì?" : " is currently resigned. What would you like to do?"}
                  </div>
                </>
              ) : (
                /* ─── NV đang làm: xác nhận nghỉ việc ─── */
                <>
                  <div style={{ fontSize: 17, fontWeight: 800, color: th.text1, marginBottom: 8 }}>{t.delTitle}</div>
                  <div style={{ fontSize: 13, color: th.text2, lineHeight: 1.6 }}>
                    {vi ? "Chuyển" : "Set"} <b style={{ color: th.text1 }}>{delTarget.name}</b> {vi ? "sang trạng thái nghỉ việc?" : "to resigned status?"}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: "12px 24px 20px", display: "flex", flexDirection: delTarget.st === "resigned" ? "column" : "row", gap: 10 }}>
              {delTarget.st === "resigned" ? (
                /* ─── 2 nút cho NV đã nghỉ ─── */
                <>
                  <button onClick={handleReinstate} style={{
                    width: "100%", padding: "11px", borderRadius: 8,
                    border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff",
                    fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                  }}>
                    ✅ {vi ? "Đi làm lại" : "Reinstate Employee"}
                  </button>
                  <button onClick={handleHardDelete} style={{
                    width: "100%", padding: "11px", borderRadius: 8,
                    border: "none", background: "#DC2626", color: "#fff",
                    fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                  }}>
                    🗑️ {vi ? "Xóa vĩnh viễn" : "Permanently Delete"}
                  </button>
                  <button onClick={() => setDelTarget(null)} style={{
                    width: "100%", padding: "10px", borderRadius: 8,
                    border: `1px solid ${th.inputBorder}`, background: th.cardBg, color: th.text2,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                  }}>
                    {t.delCancel}
                  </button>
                </>
              ) : (
                /* ─── 2 nút cho NV đang làm ─── */
                <>
                  <button onClick={() => setDelTarget(null)} style={{
                    flex: 1, padding: "10px", borderRadius: 8,
                    border: `1px solid ${th.inputBorder}`, background: th.cardBg, color: th.text1,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                  }}>{t.delCancel}</button>
                  <button onClick={handleDelete} style={{
                    flex: 1, padding: "10px", borderRadius: 8,
                    border: "none", background: "#DC2626", color: "#fff",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                  }}>{vi ? "Cho nghỉ việc" : "Set Resigned"}</button>
                </>
              )}
            </div>
          </div>
        </Overlay>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
