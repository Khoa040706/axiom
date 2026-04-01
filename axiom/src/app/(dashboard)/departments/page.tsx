/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import { Search, Plus, Edit, Trash2, Users, Building2, Loader2, X, Save } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getDepartments } from "@/lib/actions/department.actions"
import { prisma } from "@/lib/prisma"

// ── Types ──────────────────────────────────────────────────────
type Dept = {
  id: number
  name: string
  description: string | null
  headcount: number
}

export default function DepartmentsPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"

  const [depts, setDepts]   = useState<Dept[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modal, setModal]   = useState<"add" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<Dept | null>(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [saving, setSaving] = useState(false)

  // ── Load data từ DB ────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    const res = await getDepartments()
    if (res.success && res.data) {
      // getDepartments trả về {id, name} — cần enriched data
      // Gọi riêng với count
      const enriched = await getDepartmentsWithCount()
      setDepts(enriched)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = depts.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Styles ────────────────────────────────────────────────
  const hd: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11.5, fontWeight: 700,
    color: th.tableHeadText, background: th.tableHead,
    borderBottom: `1px solid ${th.tableBorder}`, textAlign: "left",
  }
  const td: React.CSSProperties = {
    padding: "11px 12px", fontSize: 12.5, color: th.text1,
    borderBottom: `1px solid ${th.tableBorder}`,
  }
  const inp: React.CSSProperties = {
    padding: "9px 12px", border: `1px solid ${th.inputBorder}`, borderRadius: 8,
    fontSize: 13, background: th.inputBg, color: th.text1, outline: "none",
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  }

  function openAdd() { setFormName(""); setFormDesc(""); setEditTarget(null); setModal("add") }
  function openEdit(d: Dept) { setFormName(d.name); setFormDesc(d.description ?? ""); setEditTarget(d); setModal("edit") }

  async function handleSave() {
    if (!formName.trim()) return
    setSaving(true)
    if (modal === "add") {
      await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, description: formDesc }),
      })
    } else if (modal === "edit" && editTarget) {
      await fetch(`/api/departments/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, description: formDesc }),
      })
    }
    setSaving(false)
    setModal(null)
    load()
  }

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: th.text1, margin: 0 }}>
            {vi ? "Quản lý phòng ban" : "Department Management"}
          </h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
            {vi ? "Cơ cấu tổ chức công ty" : "Company organization structure"}
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 18px", borderRadius: 10,
          background: "linear-gradient(135deg,#D0211C,#991414)",
          color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <Plus size={14} />{vi ? "Thêm phòng ban" : "Add Department"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        <div style={{ flex: 1, background: th.cardBg, borderRadius: 12, border: `1px solid ${th.cardBorder}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: dark ? "rgba(208,33,28,0.1)" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} color="#D0211C" />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Tổng phòng ban" : "Total Departments"}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: th.text1 }}>{loading ? "—" : depts.length}</div>
          </div>
        </div>
        <div style={{ flex: 1, background: th.cardBg, borderRadius: 12, border: `1px solid ${th.cardBorder}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: dark ? "rgba(5,150,105,0.1)" : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={20} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Tổng nhân sự" : "Total Headcount"}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: th.text1 }}>
              {loading ? "—" : depts.reduce((s, d) => s + d.headcount, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14, position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: th.text2 }} />
        <input
          placeholder={vi ? "Tìm phòng ban..." : "Search departments..."}
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 10px 9px 32px", border: `1.5px solid ${th.inputBorder}`, borderRadius: 9, fontSize: 13, background: th.inputBg, color: th.text1, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: th.cardBg, borderRadius: 14, overflow: "hidden", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {[vi ? "Phòng ban" : "Department", vi ? "Mô tả" : "Description", vi ? "Nhân sự" : "Staff", vi ? "Thao tác" : "Actions"].map(c => <th key={c} style={hd}>{c}</th>)}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ ...td, textAlign: "center", padding: 48 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: th.text2 }}>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  {vi ? "Đang tải..." : "Loading..."}
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ ...td, textAlign: "center", color: th.text3, padding: 40 }}>
                {vi ? "Không tìm thấy phòng ban nào." : "No departments found."}
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <td style={{ ...td, fontWeight: 700 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#D0211C,#991414)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {d.name.charAt(0)}
                    </div>
                    {d.name}
                  </div>
                </td>
                <td style={{ ...td, color: th.text2, fontSize: 12 }}>{d.description || "—"}</td>
                <td style={{ ...td, fontWeight: 700, textAlign: "center" }}>
                  <span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 8, padding: "2px 10px", fontSize: 12 }}>{d.headcount}</span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(d)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "#EFF6FF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Edit size={13} color="#1D4ED8" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", background: th.tableHead, borderTop: `1px solid ${th.tableBorder}`, fontSize: 12, color: th.text2 }}>
          {filtered.length} {vi ? "phòng ban" : "departments"}
        </div>
      </div>

      {/* Modal Add/Edit */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: th.cardBg, borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#D0211C,#F97316)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
                {modal === "add" ? (vi ? "Thêm phòng ban mới" : "Add New Department") : (vi ? "Chỉnh sửa phòng ban" : "Edit Department")}
              </div>
              <button onClick={() => setModal(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#fff" />
              </button>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: th.text2, display: "block", marginBottom: 5 }}>{vi ? "Tên phòng ban *" : "Department Name *"}</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder={vi ? "VD: Phòng Kỹ thuật" : "e.g. Engineering"} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: th.text2, display: "block", marginBottom: 5 }}>{vi ? "Mô tả" : "Description"}</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3}
                  placeholder={vi ? "Mô tả ngắn về phòng ban..." : "Brief description..."} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${th.cardBorder}`, display: "flex", justifyContent: "flex-end", gap: 10, background: th.tableHead }}>
              <button onClick={() => setModal(null)} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${th.inputBorder}`, background: th.cardBg, color: th.text1, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {vi ? "Hủy" : "Cancel"}
              </button>
              <button onClick={handleSave} disabled={saving || !formName.trim()} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#D0211C,#F97316)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                <Save size={14} />{saving ? (vi ? "Đang lưu..." : "Saving...") : (vi ? "Lưu" : "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Server-side enriched fetch (client-side wrapper) ──────────
async function getDepartmentsWithCount(): Promise<Dept[]> {
  try {
    const res = await fetch("/api/departments")
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
