/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { AvatarImg } from "@/components/ui/avatar-img"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import {
  Users, Plus, Search, Trash2,
  RefreshCw, UserCheck, UserX, Key, Eye, EyeOff, X,
  CheckCircle, AlertCircle, Building2, Mail, Phone,
  ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Check,
} from "lucide-react"
import {
  getAllUsersFromDB,
  createUserInDB,
  toggleUserActiveInDB,
  deleteUserFromDB,
  adminResetPasswordInDB,
  updateUserRoleInDB,
  getDepartmentsForSelect,
} from "@/lib/actions/user-admin.actions"
import { tDept } from "@/lib/i18n-maps"

// Roles available
const ROLES = [
  { value: "Admin",      vi: "Quản trị viên",         en: "System Admin",       color: "#7C3AED" },
  { value: "HRManager",  vi: "Trưởng phòng Nhân sự",  en: "HR Manager",         color: "#0891B2" },
  { value: "Accountant", vi: "Kế toán",                en: "Accountant",         color: "#059669" },
  { value: "Director",   vi: "Giám đốc",              en: "Director",           color: "#B45309" },
  { value: "Manager",    vi: "Trưởng phòng CNTT",      en: "IT Manager",         color: "#9333EA" },
  { value: "Employee",   vi: "Nhân viên",             en: "Employee",           color: "#64748B" },
]

function roleInfo(role: string) {
  return ROLES.find(r => r.value === role) ?? { value: role, vi: role, en: role, color: "#374151" }
}

// ── SortTh: sortable table header ────────────────────────────
type SortField = "name" | "username" | null
type SortDir   = "asc" | "desc"

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

  const hdBase: React.CSSProperties = {
    padding: "10px 14px", fontSize: 11.5, fontWeight: 700,
    color: th.tableHeadText, background: th.tableHead,
    borderBottom: `1px solid ${th.tableBorder}`, textAlign: "left",
    whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em",
    ...style,
  }

  if (!field || !options) {
    return <th style={hdBase}>{label}</th>
  }

  return (
    <th ref={ref} style={{ ...hdBase, position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "none", border: "none", cursor: "pointer",
          color: active ? "#D0211C" : th.tableHeadText,
          fontWeight: active ? 700 : 700, fontSize: 11.5,
          fontFamily: "inherit", padding: 0,
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}
      >
        {label}
        {active
          ? sortDir === "asc"
            ? <ArrowUp size={11} color="#D0211C" />
            : <ArrowDown size={11} color="#D0211C" />
          : <ArrowUpDown size={10} style={{ opacity: 0.4 }} />
        }
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          minWidth: 170, overflow: "hidden",
        }}>
          <button
            onClick={() => { onClear(); setOpen(false) }}
            style={{
              width: "100%", padding: "9px 14px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontSize: 12.5, color: th.text2, fontFamily: "inherit", textAlign: "left",
              borderBottom: `1px solid ${th.tableBorder}`,
            }}
          >
            <X size={13} /> {lang === "vi" ? "Mặc định" : "Default"}
          </button>
          {options.map(opt => {
            const selected = active && sortDir === opt.dir
            return (
              <button
                key={opt.dir}
                onClick={() => { onSort(field, opt.dir); setOpen(false) }}
                style={{
                  width: "100%", padding: "9px 14px",
                  background: selected ? "rgba(208,33,28,0.08)" : "none",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
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

// ── Role transition rules ────────────────────────────────────
// Trả về danh sách role mà user CÓ THỂ được chuyển sang
function getAllowedTargetRoles(currentRole: string) {
  // Nhân viên chỉ được lên Trưởng phòng
  if (currentRole === "Employee") return ["Employee", "Manager"]
  // Trưởng phòng chỉ có thể giữ nguyên hoặc xuống lại Nhân viên
  if (currentRole === "Manager")  return ["Manager", "Employee"]
  // Các vai trò quản lý cấp cao: không giới hạn
  return ROLES.map(r => r.value)
}

// ── RoleDropdown: inline role change dropdown ────────────────
function RoleDropdown({
  user, vi, onRoleChange, actionLoading, th,
}: {
  user: any; vi: boolean;
  onRoleChange: (id: number, role: string) => void
  actionLoading: boolean; th: any
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const ri = roleInfo(user.role)

  const allowedValues = getAllowedTargetRoles(user.role)
  const allowedRoles  = ROLES.filter(r => allowedValues.includes(r.value))
  const isRestricted  = allowedRoles.length < ROLES.length

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => !actionLoading && setOpen(o => !o)}
        disabled={actionLoading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 8, cursor: actionLoading ? "not-allowed" : "pointer",
          border: `1.5px solid ${ri.color}`,
          background: `${ri.color}22`,
          color: ri.color,
          fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
          transition: "all .15s",
          opacity: actionLoading ? 0.6 : 1,
          filter: "brightness(1.15)",
        }}
      >
        {vi ? ri.vi : ri.en}
        <ChevronDown size={12} style={{ opacity: 0.8, flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 400,
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 10, boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          minWidth: 200, overflow: "hidden",
        }}>
          {allowedRoles.map(r => {
            const isSelected = user.role === r.value
            return (
              <button
                key={r.value}
                onClick={() => { onRoleChange(user.id, r.value); setOpen(false) }}
                style={{
                  width: "100%", padding: "9px 14px",
                  background: isSelected ? `${r.color}12` : "none",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, color: isSelected ? r.color : th.text1,
                  fontWeight: isSelected ? 700 : 400,
                  fontFamily: "inherit", textAlign: "left",
                  borderBottom: `1px solid ${th.tableBorder}`,
                  transition: "background .1s",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{vi ? r.vi : r.en}</span>
                {isSelected && <Check size={13} color={r.color} />}
              </button>
            )
          })}
          {/* Info note khi bị giới hạn */}
          {isRestricted && (
            <div style={{
              padding: "8px 12px",
              fontSize: 11, color: th.text3,
              borderTop: `1px solid ${th.tableBorder}`,
              display: "flex", alignItems: "flex-start", gap: 5, lineHeight: 1.4,
            }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>ℹ️</span>
              <span>{vi
                ? "Nhân viên chỉ có thể được thăng lên Trưởng phòng"
                : "Employee can only be promoted to Manager"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function UsersAdminPage() {
  const router = useRouter()
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { data: session, status } = useSession()
  const { isMobile } = useBreakpoint()

  const [users, setUsers]           = useState<any[]>([])
  const [departments, setDepts]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [toast, setToast]           = useState<{ type: "success"|"error"; msg: string } | null>(null)
  const [sortField, setSortField]   = useState<SortField>(null)
  const [sortDir, setSortDir]       = useState<SortDir>("asc")
  const [page, setPage]             = useState(1)
  const PAGE_SIZE = 10

  // Modals
  const [showCreate, setShowCreate]       = useState(false)
  const [showReset, setShowReset]         = useState<any | null>(null)
  const [showResetPw, setShowResetPw]     = useState("")
  const [showPw, setShowPw]               = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Create form
  const defaultForm = { username: "", password: "", fullName: "", email: "", phone: "", role: "Employee", departmentId: "" }
  const [createForm, setCreateForm] = useState(defaultForm)
  const [showCreatePw, setShowCreatePw] = useState(false)

  const showToast = useCallback((type: "success"|"error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Auth guard
  useEffect(() => {
    if (status === "loading") return
    const role = (session?.user as any)?.role
    if (!session || role !== "Admin") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  // Load users + departments
  const loadData = useCallback(async () => {
    setLoading(true)
    const [usersRes, deptsRes] = await Promise.all([getAllUsersFromDB(), getDepartmentsForSelect()])
    if (usersRes.success) setUsers(usersRes.data ?? [])
    if (deptsRes.success) setDepts(deptsRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Filter + Sort
  const filtered = (() => {
    let result = users.filter(u => {
      const name = (u.employee?.fullName ?? u.username ?? "").toLowerCase()
      const uname = u.username.toLowerCase()
      const q = search.toLowerCase()
      const matchSearch = !q || name.includes(q) || uname.includes(q)
      const matchRole   = roleFilter === "all" || u.role === roleFilter
      return matchSearch && matchRole
    })
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        if (sortField === "name") {
          const aName = a.employee?.fullName ?? a.username ?? ""
          const bName = b.employee?.fullName ?? b.username ?? ""
          cmp = aName.localeCompare(bName, "vi")
        } else if (sortField === "username") {
          cmp = a.username.localeCompare(b.username, "vi")
        }
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  })()

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSort(f: SortField, d: SortDir) { setSortField(f); setSortDir(d); setPage(1) }
  function clearSort() { setSortField(null); setSortDir("asc"); setPage(1) }

  // Reset page when search/filter changes
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleRoleFilter = (v: string) => { setRoleFilter(v); setPage(1) }

  // Toggle active
  const handleToggleActive = async (user: any) => {
    setActionLoading(true)
    const res = await toggleUserActiveInDB(user.id)
    if (res.success) {
      await loadData()
      showToast("success", vi
        ? `${user.isActive ? "Đã khoá" : "Đã mở khoá"} tài khoản ${user.username}`
        : `Account ${user.username} ${user.isActive ? "deactivated" : "activated"}`)
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setActionLoading(false)
  }

  // Delete
  const handleDelete = async (user: any) => {
    if (!confirm(vi ? `Xoá tài khoản "${user.username}"?` : `Delete account "${user.username}"?`)) return
    setActionLoading(true)
    const res = await deleteUserFromDB(user.id)
    if (res.success) {
      await loadData()
      showToast("success", vi ? "Đã xoá tài khoản" : "Account deleted")
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setActionLoading(false)
  }

  // Change role
  const handleRoleChange = async (userId: number, newRole: string) => {
    setActionLoading(true)
    const res = await updateUserRoleInDB(userId, newRole)
    if (res.success) {
      await loadData()
      showToast("success", vi ? "Đã cập nhật quyền" : "Role updated")
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setActionLoading(false)
  }

  // Reset password
  const handleResetPw = async () => {
    if (!showReset || !showResetPw.trim()) return
    if (showResetPw.length < 6) { showToast("error", vi ? "Mật khẩu tối thiểu 6 ký tự" : "Min 6 characters"); return }
    setActionLoading(true)
    const res = await adminResetPasswordInDB(showReset.id, showResetPw)
    if (res.success) {
      setShowReset(null)
      setShowResetPw("")
      showToast("success", vi ? `Đã reset mật khẩu cho ${showReset.username}` : `Password reset for ${showReset.username}`)
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setActionLoading(false)
  }

  // Create user
  const handleCreate = async () => {
    if (!createForm.username.trim()) { showToast("error", vi ? "Cần có username" : "Username required"); return }
    if (!createForm.password || createForm.password.length < 6) { showToast("error", vi ? "Mật khẩu tối thiểu 6 ký tự" : "Min 6 chars"); return }
    if (!createForm.fullName.trim()) { showToast("error", vi ? "Cần có họ tên" : "Full name required"); return }
    setActionLoading(true)
    const res = await createUserInDB({
      username:     createForm.username.trim(),
      password:     createForm.password,
      fullName:     createForm.fullName.trim(),
      email:        createForm.email.trim() || undefined,
      phone:        createForm.phone.trim() || undefined,
      role:         createForm.role,
      departmentId: createForm.departmentId ? Number(createForm.departmentId) : undefined,
    })
    if (res.success) {
      setShowCreate(false)
      setCreateForm(defaultForm)
      await loadData()
      showToast("success", vi ? "Đã tạo tài khoản mới!" : "Account created!")
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setActionLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1.5px solid ${th.inputBorder}`, background: th.inputBg,
    color: th.text1, fontSize: 13, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  }
  const hd: React.CSSProperties = {
    background: th.tableHead,
    borderBottom: `1px solid ${th.tableBorder}`,
  }
  const tdS: React.CSSProperties = { padding: "12px 14px", fontSize: 13, color: th.text1, borderBottom: `1px solid ${th.tableBorder}`, verticalAlign: "middle" }

  const sortName     = [{ label: vi ? "A → Z" : "A → Z", dir: "asc" as SortDir }, { label: vi ? "Z → A" : "Z → A", dir: "desc" as SortDir }]
  const sortUsername = [{ label: vi ? "A → Z" : "A → Z", dir: "asc" as SortDir }, { label: vi ? "Z → A" : "Z → A", dir: "desc" as SortDir }]

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, flexDirection: "column", gap: 14 }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${th.cardBorder}`, borderTopColor: "#D0211C", borderRadius: "50%", animation: "spin .7s linear infinite" }}/>
        <span style={{ color: th.text2, fontSize: 14 }}>{vi ? "Đang tải danh sách tài khoản..." : "Loading accounts..."}</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: isMobile ? "16px 16px 32px" : "28px 28px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start", gap: isMobile ? 12 : 0, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={22} color="#D0211C"/>{vi ? "Quản lý tài khoản" : "User Management"}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: th.text2 }}>
            {vi ? `${users.length} tài khoản · ${users.filter(u => u.isActive).length} đang hoạt động` : `${users.length} accounts · ${users.filter(u => u.isActive).length} active`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadData} disabled={loading}
            style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${th.cardBorder}`, background: th.cardBg, color: th.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
            <RefreshCw size={14}/>{vi ? "Tải lại" : "Refresh"}
          </button>
          <button onClick={() => setShowCreate(true)}
            style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(208,33,28,0.3)" }}>
            <Plus size={14}/>{vi ? "Tạo tài khoản" : "New Account"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} color={th.text2} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}/>
          <input placeholder={vi ? "Tìm kiếm tên hoặc username..." : "Search name or username..."}
            value={search} onChange={e => handleSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}/>
        </div>
        <select value={roleFilter} onChange={e => handleRoleFilter(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 160 }}>
          <option value="all">{vi ? "Tất cả vai trò" : "All Roles"}</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{vi ? r.vi : r.en}</option>)}
        </select>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        {[
          { label: vi?"Tổng":"Total",         value: users.length,                              color: "#D0211C" },
          { label: vi?"Đang hoạt động":"Active", value: users.filter(u => u.isActive).length,   color: "#10B981" },
          { label: vi?"Bị khoá":"Inactive",   value: users.filter(u => !u.isActive).length,     color: "#EF4444" },
          { label: vi?"Admin":"Admin",         value: users.filter(u => u.role === "Admin").length, color: "#7C3AED" },
        ].map(s => (
          <div key={s.label} style={{ background: th.cardBg, borderTop: `1px solid ${th.cardBorder}`, borderRight: `1px solid ${th.cardBorder}`, borderBottom: `1px solid ${th.cardBorder}`, borderLeft: `4px solid ${s.color}`, borderRadius: 12, padding: "12px 18px", flex: 1 }}>
            <div style={{ fontSize: 11.5, color: th.text2 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: th.cardBg, borderRadius: 14, border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="table-scroll">
        <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", tableLayout: "auto" }}>
          <thead><tr>
            <SortTh label={vi?"Tên / Mã NV":"Name / Code"} field="name" sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} options={sortName} style={hd}/>
            <SortTh label={vi?"Tài khoản":"Username"} field="username" sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} options={sortUsername} style={hd}/>
            <SortTh label={vi?"Vai trò":"Role"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
            <SortTh label={vi?"Phòng ban":"Dept"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
            <SortTh label={vi?"Trạng thái":"Status"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
            <SortTh label={vi?"Hành động":"Actions"} field={null} sortField={sortField} sortDir={sortDir}
              onSort={handleSort} onClear={clearSort} th={th} style={hd}/>
          </tr></thead>
          <tbody>
            {paginated.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdS, textAlign: "center", padding: "40px", color: th.text2 }}>
                {vi ? "Không tìm thấy tài khoản nào" : "No accounts found"}
              </td></tr>
            )}
            {paginated.map(u => {
              const ri = roleInfo(u.role)
              const empName = u.employee?.fullName ?? u.username
              const empCode = u.employee?.code ?? "—"
              const dept    = u.employee?.department?.name ?? "—"
              return (
                <tr key={u.id} onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA")} onMouseLeave={e => (e.currentTarget.style.background = "")} style={{ transition: "background .1s" }}>
                  <td style={tdS}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AvatarImg src={u.employee?.avatarPath} alt={empName} size={36}
                        style={{ border:`2px solid ${ri.color}40`, boxShadow:"0 2px 6px rgba(0,0,0,0.15)" }}/>
                      <div>
                        <div style={{ fontWeight: 700, color: th.text1, fontSize: 13 }}>{empName}</div>
                        <div style={{ fontSize: 11.5, color: th.text2 }}>{empCode}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdS}><span style={{ fontFamily: "monospace", fontSize: 12.5, color: th.text1 }}>{u.username}</span></td>
                  <td style={tdS}>
                    <RoleDropdown user={u} vi={vi} onRoleChange={handleRoleChange} actionLoading={actionLoading} th={th}/>
                  </td>
                  <td style={tdS}><span style={{ fontSize: 12.5, color: th.text2 }}>{tDept(dept, vi)}</span></td>
                  <td style={tdS}>
                    <span style={{ background: u.isActive ? "#D1FAE5" : "#FEE2E2", color: u.isActive ? "#065F46" : "#991B1B", borderRadius: 10, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                      {u.isActive ? (vi ? "Hoạt động" : "Active") : (vi ? "Bị khoá" : "Inactive")}
                    </span>
                  </td>
                  <td style={tdS}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleToggleActive(u)} disabled={actionLoading}
                        title={u.isActive ? (vi?"Khoá tài khoản":"Deactivate") : (vi?"Mở khoá":"Activate")}
                        style={{ padding: "5px 8px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: th.cardBg, cursor: "pointer", display: "flex", alignItems: "center", color: u.isActive ? "#EF4444" : "#10B981" }}>
                        {u.isActive ? <UserX size={13}/> : <UserCheck size={13}/>}
                      </button>
                      <button onClick={() => { setShowReset(u); setShowResetPw(""); setShowPw(false) }} disabled={actionLoading}
                        title={vi?"Reset mật khẩu":"Reset password"}
                        style={{ padding: "5px 8px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: th.cardBg, cursor: "pointer", display: "flex", alignItems: "center", color: "#3B82F6" }}>
                        <Key size={13}/>
                      </button>
                      <button onClick={() => handleDelete(u)} disabled={actionLoading}
                        title={vi?"Xoá tài khoản":"Delete account"}
                        style={{ padding: "5px 8px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: th.cardBg, cursor: "pointer", display: "flex", alignItems: "center", color: "#EF4444" }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        {/* ── Pagination bar ── */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${th.tableBorder}`, background: th.tableHead, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: th.text2 }}>
            {vi
              ? `Hiển thị ${filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} / ${filtered.length} tài khoản`
              : `Showing ${filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} accounts`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: safePage === 1 ? th.tableHead : th.cardBg, color: safePage === 1 ? th.text3 : th.text1, cursor: safePage === 1 ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit" }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: safePage === 1 ? th.tableHead : th.cardBg, color: safePage === 1 ? th.text3 : th.text1, cursor: safePage === 1 ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit" }}>{vi ? "Trước" : "Prev"}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
                acc.push(p); return acc
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} style={{ padding: "5px 4px", fontSize: 12, color: th.text2 }}>…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    style={{ padding: "5px 10px", borderRadius: 7, border: `1.5px solid ${p === safePage ? "#D0211C" : th.cardBorder}`, background: p === safePage ? "#D0211C" : th.cardBg, color: p === safePage ? "#fff" : th.text1, cursor: "pointer", fontSize: 12, fontWeight: p === safePage ? 700 : 400, fontFamily: "inherit", minWidth: 32 }}>
                    {p}
                  </button>
                )
              )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: safePage === totalPages ? th.tableHead : th.cardBg, color: safePage === totalPages ? th.text3 : th.text1, cursor: safePage === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit" }}>{vi ? "Sau" : "Next"}</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
              style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${th.cardBorder}`, background: safePage === totalPages ? th.tableHead : th.cardBg, color: safePage === totalPages ? th.text3 : th.text1, cursor: safePage === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit" }}>»</button>
          </div>
        </div>
      </div>

      {/* ── Create modal ── */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: th.cardBg, borderRadius: 20, padding: "28px", width: "min(540px, 92vw)", border: `1px solid ${th.cardBorder}`, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={18} color="#D0211C"/>{vi ? "Tạo tài khoản mới" : "Create New Account"}
              </h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}><X size={20}/></button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {/* Username */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>{vi?"Tên đăng nhập":"Username"} *</label>
                <input style={inputStyle} value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} placeholder="eg: nguyenvana"/>
              </div>
              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>{vi?"Mật khẩu":"Password"} *</label>
                <div style={{ position: "relative" }}>
                  <input type={showCreatePw ? "text" : "password"} style={{ ...inputStyle, paddingRight: 40 }} value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder={vi ? "Tối thiểu 6 ký tự" : "Min 6 characters"}/>
                  <button type="button" onClick={() => setShowCreatePw(!showCreatePw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}>
                    {showCreatePw ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              {/* Full name */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>{vi?"Họ và tên":"Full Name"} *</label>
                <input style={inputStyle} value={createForm.fullName} onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nguyễn Văn A"/>
              </div>
              {/* Email + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>Email</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={13} color={th.text2} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}/>
                    <input type="email" style={{ ...inputStyle, paddingLeft: 30 }} value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="email@gmail.com"/>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>{vi?"Điện thoại":"Phone"}</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={13} color={th.text2} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}/>
                    <input style={{ ...inputStyle, paddingLeft: 30 }} value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="0912 345 678"/>
                  </div>
                </div>
              </div>
              {/* Role + Department */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>{vi?"Vai trò":"Role"}</label>
                  <select style={inputStyle} value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{vi ? r.vi : r.en}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: th.text2, display: "block", marginBottom: 6 }}>{vi?"Phòng ban":"Department"}</label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={13} color={th.text2} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}/>
                    <select style={{ ...inputStyle, paddingLeft: 28 }} value={createForm.departmentId} onChange={e => setCreateForm(f => ({ ...f, departmentId: e.target.value }))}>
                      <option value="">{vi ? "-- Chọn phòng --" : "-- Select dept --"}</option>
                      {departments.map((d: any) => <option key={d.id} value={d.id}>{tDept(d.name, vi)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${th.cardBorder}`, background: "none", color: th.text2, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                {vi ? "Huỷ" : "Cancel"}
              </button>
              <button onClick={handleCreate} disabled={actionLoading}
                style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {actionLoading
                  ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/>{vi?"Đang tạo...":"Creating..."}</>
                  : <><Plus size={14}/>{vi ? "Tạo tài khoản" : "Create Account"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset password modal ── */}
      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: th.cardBg, borderRadius: 18, padding: "26px", width: "min(420px, 92vw)", border: `1px solid ${th.cardBorder}`, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={17} color="#3B82F6"/>{vi ? "Reset mật khẩu" : "Reset Password"}
              </h2>
              <button onClick={() => setShowReset(null)} style={{ background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}><X size={18}/></button>
            </div>
            <p style={{ fontSize: 13, color: th.text2, margin: "0 0 14px" }}>
              {vi ? `Đặt mật khẩu mới cho tài khoản ` : "Set new password for "}<b style={{ color: th.text1 }}>{showReset.username}</b>
            </p>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} style={{ ...inputStyle, paddingRight: 38, marginBottom: 12 }}
                placeholder={vi ? "Mật khẩu mới (tối thiểu 6 ký tự)" : "New password (min 6 chars)"}
                value={showResetPw} onChange={e => setShowResetPw(e.target.value)}/>
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowReset(null)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1px solid ${th.cardBorder}`, background: "none", color: th.text2, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                {vi ? "Huỷ" : "Cancel"}
              </button>
              <button onClick={handleResetPw} disabled={actionLoading}
                style={{ flex: 2, padding: "9px", borderRadius: 9, border: "none", background: "#3B82F6", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {actionLoading ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/></> : <Key size={13}/>}
                {vi ? "Đặt lại mật khẩu" : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "13px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontSize: 14, fontWeight: 600, maxWidth: 340, animation: "fadeDown .2s ease" }}>
          {toast.type === "success" ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
