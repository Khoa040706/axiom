/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useCallback } from "react"
import { Plane, Search, Plus, MapPin, Calendar, DollarSign, Check, X, RefreshCw } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getBusinessTrips, createBusinessTrip, approveBusinessTrip } from "@/lib/actions/business-trips.actions"
import { useEmployeeId } from "@/hooks/use-current-user"
import { useSession } from "next-auth/react"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { matchAny } from "@/lib/utils/search"

function EmpAvatar({ name, avatarPath, size = 30 }: { name: string; avatarPath?: string | null; size?: number }) {
  const [imgErr, setImgErr] = useState(false)
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


export default function BusinessTripsPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const employeeId = useEmployeeId()
  const { data: session } = useSession()
  const { isMobile } = useBreakpoint()

  /* ── state ── */
  const [trips,      setTrips]      = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [showForm,   setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)

  /* form */
  const [fDest,  setFDest]  = useState("")
  const [fFrom,  setFFrom]  = useState("")
  const [fTo,    setFTo]    = useState("")
  const [fPurp,  setFPurp]  = useState("")
  const [fAllow, setFAllow] = useState("")

  const today = new Date().toISOString().split("T")[0]

  /* ── load ── */
  const load = useCallback(async () => {
    setLoading(true)
    const res = await getBusinessTrips()
    if (res.success) setTrips(res.data as any[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* ── helpers ── */
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreate = async () => {
    if (!fDest || !fFrom || !fTo || !employeeId) return
    setSubmitting(true)
    const res = await createBusinessTrip({
      employeeId:  employeeId,
      destination: fDest,
      startDate:   fFrom,
      endDate:     fTo,
      purpose:     fPurp || undefined,
      allowance:   fAllow ? Number(fAllow) : undefined,
    })
    setSubmitting(false)
    if (res.success) {
      setShowForm(false)
      setFDest(""); setFFrom(""); setFTo(""); setFPurp(""); setFAllow("")
      showToast(vi ? "✅ Đã tạo đề xuất công tác" : "✅ Trip request created")
      load()
    } else {
      showToast("❌ " + (vi ? "Lỗi tạo đề xuất" : "Failed to create trip"))
    }
  }

  const handleApprove = async (id: number, approved: boolean) => {
    const approverId = (session?.user as any)?.userId
    if (!approverId) return
    const res = await approveBusinessTrip(id, Number(approverId), approved)
    if (res.success) {
      showToast(approved ? "✅ Đã duyệt" : "❌ Đã từ chối")
      load()
    }
  }

  /* computed */
  const filtered = trips.filter(t =>
    matchAny([t.employee?.fullName, t.destination, t.purpose], search)
  )
  const totalApproved = trips.filter(t => t.status === "Đã duyệt").length
  const totalBudget   = trips.reduce((s: number, t: any) => s + Number(t.allowance ?? 0), 0)

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      "Đã duyệt": { bg: "#D1FAE5", color: "#065F46", label: vi ? "Đã duyệt"  : "Approved" },
      "Chờ duyệt":{ bg: "#FEF3C7", color: "#92400E", label: vi ? "Chờ duyệt" : "Pending"  },
      "Từ chối":  { bg: "#FEE2E2", color: "#991B1B", label: vi ? "Từ chối"   : "Rejected" },
    }
    const s = map[status] ?? { bg: "#F3F4F6", color: "#374151", label: status }
    return <span style={{ background: s.bg, color: s.color, borderRadius: 12, padding: "3px 10px", fontSize: 11.5, fontWeight: 700 }}>{s.label}</span>
  }

  const isManager = ["Admin", "HRManager", "Manager", "Director"].includes((session?.user as any)?.role ?? "")

  /* ── styles ── */
  const hd: React.CSSProperties = { padding: "10px 12px", fontSize: 11.5, fontWeight: 700, color: th.tableHeadText, background: th.tableHead, borderBottom: `1px solid ${th.tableBorder}`, textAlign: "left" }
  const td: React.CSSProperties = { padding: "11px 12px", fontSize: 12.5, color: th.text1, borderBottom: `1px solid ${th.tableBorder}` }
  const input: React.CSSProperties = { padding: "8px 10px", border: `1.5px solid ${th.inputBorder}`, borderRadius: 9, fontSize: 12.5, background: th.inputBg, color: th.text1, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }
  const card: React.CSSProperties = { background: th.cardBg, borderRadius: 14, border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: th.text1, margin: 0 }}>
            {vi ? "Quản lý công tác" : "Business Trips"}
          </h1>
          <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>
            {vi ? "Theo dõi các chuyến công tác và phê duyệt (UC-07)" : "Track and approve business trips (UC-07)"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} disabled={loading}
            style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${th.cardBorder}`, background: th.cardBg, color: th.text2, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: "inherit" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }} />
          </button>
          <button onClick={() => setShowForm(p => !p)}
            style={{ padding: "8px 16px", borderRadius: 9, background: "linear-gradient(135deg,#D0211C,#991414)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(208,33,28,0.25)" }}>
            <Plus size={14} />{vi ? "Tạo đề xuất" : "New Trip"}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, padding: 18, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text1, marginBottom: 14 }}>
            ✈️ {vi ? "Tạo đề xuất công tác mới" : "New Business Trip Request"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: isMobile ? "auto" : "span 2" }}>
              <span style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Điểm đến *" : "Destination *"}</span>
              <input value={fDest} onChange={e => setFDest(e.target.value)} style={input} placeholder={vi ? "VD: Hà Nội, Singapore..." : "E.g. Hanoi, Singapore..."} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Kinh phí (đ)" : "Allowance (VND)"}</span>
              <input type="number" value={fAllow} onChange={e => setFAllow(e.target.value)} style={input} placeholder="0" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Từ ngày *" : "Start Date *"}</span>
              <input type="date" min={today} value={fFrom} onChange={e => setFFrom(e.target.value)} style={input} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Đến ngày *" : "End Date *"}</span>
              <input type="date" min={fFrom || today} value={fTo} onChange={e => setFTo(e.target.value)} style={input} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: isMobile ? "auto" : "span 1" }}>
              <span style={{ fontSize: 11.5, color: th.text2 }}>{vi ? "Mục đích" : "Purpose"}</span>
              <input value={fPurp} onChange={e => setFPurp(e.target.value)} style={input} placeholder={vi ? "Mô tả mục đích..." : "Trip purpose..."} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${th.cardBorder}`, background: th.cardBg, color: th.text2, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit" }}>
              {vi ? "Huỷ" : "Cancel"}
            </button>
            <button onClick={handleCreate} disabled={submitting || !fDest || !fFrom || !fTo}
              style={{ padding: "7px 18px", borderRadius: 8, background: "#D0211C", color: "#fff", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: (submitting || !fDest || !fFrom || !fTo) ? 0.6 : 1 }}>
              <Check size={13} />{submitting ? (vi ? "Đang lưu..." : "Saving...") : (vi ? "Gửi đề xuất" : "Submit")}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { icon: <Plane size={20} color="#D0211C" />,      label: vi ? "Tổng chuyến"  : "Total Trips",   value: String(trips.length),    bg: "#FEF2F2" },
          { icon: <Calendar size={20} color="#059669" />,   label: vi ? "Đã duyệt"     : "Approved",      value: String(totalApproved),   bg: "#F0FDF4" },
          { icon: <DollarSign size={20} color="#D97706" />, label: vi ? "Tổng kinh phí": "Total Budget",  value: `${(totalBudget/1_000_000).toFixed(1)}M đ`, bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 120, background: th.cardBg, borderRadius: 12, border: `1px solid ${th.cardBorder}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: dark ? `${s.bg}22` : s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11.5, color: th.text2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: th.text1 }}>{loading ? "…" : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14, position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: th.text2 }} />
        <input placeholder={vi ? "Tìm theo nhân viên hoặc điểm đến..." : "Search by employee or destination..."} value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 10px 9px 32px", border: `1.5px solid ${th.inputBorder}`, borderRadius: 9, fontSize: 13, background: th.inputBg, color: th.text1, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: th.text2 }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${th.cardBorder}`, borderTopColor: "#D0211C", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        </div>
      ) : (
        <div style={{ background: th.cardBg, borderRadius: 14, overflow: "hidden", border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {(isManager
                  ? [vi?"Nhân viên":"Employee", vi?"Điểm đến":"Destination", vi?"Từ":"From", vi?"Đến":"To", vi?"Kinh phí":"Budget", vi?"Mục đích":"Purpose", vi?"Trạng thái":"Status", vi?"Thao tác":"Action"]
                  : [vi?"Nhân viên":"Employee", vi?"Điểm đến":"Destination", vi?"Từ":"From", vi?"Đến":"To", vi?"Kinh phí":"Budget", vi?"Mục đích":"Purpose", vi?"Trạng thái":"Status"]
                ).map(c => <th key={c} style={hd}>{c}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: th.text2, padding: 40 }}>
                    {trips.length === 0 ? (vi ? "Chưa có chuyến công tác nào" : "No business trips yet") : (vi ? "Không tìm thấy kết quả" : "No results found")}
                  </td></tr>
                ) : filtered.map(t => {
                  const fromDate = new Date(t.startDate).toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit" })
                  const toDate   = new Date(t.endDate).toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit" })
                  const days = Math.max(1, Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1)
                  return (
                    <tr key={t.id}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <td style={{ ...td, fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <EmpAvatar name={t.employee?.fullName ?? "?"} avatarPath={t.employee?.avatarPath} size={30} />
                          <span>{t.employee?.fullName ?? "—"}</span>
                        </div>
                      </td>
                      <td style={td}><span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} color={th.text2} />{t.destination}</span></td>
                      <td style={td}>{fromDate}</td>
                      <td style={td}>{toDate} <span style={{ color: th.text2, fontSize: 11 }}>({days}n)</span></td>
                      <td style={{ ...td, fontWeight: 600, color: "#059669" }}>{Number(t.allowance).toLocaleString("vi-VN")}đ</td>
                      <td style={{ ...td, fontSize: 12, color: th.text2 }}>{t.purpose ?? "—"}</td>
                      <td style={td}>{statusBadge(t.status)}</td>
                      {isManager && (
                        <td style={td}>
                          {t.status === "Chờ duyệt" ? (
                            <div style={{ display: "flex", gap: 5 }}>
                              <button onClick={() => handleApprove(t.id, true)}
                                style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 9px", borderRadius: 6, border: "none", background: "#D1FAE5", color: "#065F46", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                                <Check size={11} />{vi ? "Duyệt" : "Approve"}
                              </button>
                              <button onClick={() => handleApprove(t.id, false)}
                                style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 9px", borderRadius: 6, border: "none", background: "#FEE2E2", color: "#991B1B", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                                <X size={11} />{vi ? "Từ chối" : "Reject"}
                              </button>
                            </div>
                          ) : <span style={{ fontSize: 11.5, color: th.text2 }}>—</span>}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 14px", background: th.tableHead, borderTop: `1px solid ${th.tableBorder}`, fontSize: 12, color: th.text2 }}>
            {filtered.length} {vi ? "chuyến công tác" : "trips"}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "#111827", color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontWeight: 600 }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
