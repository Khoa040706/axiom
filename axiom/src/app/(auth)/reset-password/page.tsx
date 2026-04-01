"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ShieldCheck, Lock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useSession } from "next-auth/react"
import { changePasswordInDB } from "@/lib/actions/user-admin.actions"

/* ── Password requirements ──────────────────────────────── */
interface Requirement {
  label: string
  test: (v: string) => boolean
}

const REQUIREMENTS: Requirement[] = [
  { label: "Ít nhất 8 ký tự",            test: (v) => v.length >= 8 },
  { label: "Ít nhất 1 chữ hoa",          test: (v) => /[A-Z]/.test(v) },
  { label: "Ít nhất 1 chữ số",           test: (v) => /[0-9]/.test(v) },
  { label: "Ít nhất 1 ký tự đặc biệt (!@#...)", test: (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v) },
]

/* Colour per number of passed requirements: 0→red, 1→orange, 2→yellow, 3→lime, 4→green */
const STRENGTH_COLORS = ["#EF4444", "#F97316", "#EAB308", "#22C55E"]
const STRENGTH_LABELS = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"]

function getStrength(pw: string): number {
  return REQUIREMENTS.filter(r => r.test(pw)).length
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPw, setNewPw]           = useState("")
  const [confirm, setConfirm]       = useState("")
  const [showNew, setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [done, setDone]             = useState(false)
  const [userId, setUserId]         = useState<string | null>(null)
  const [userName, setUserName]     = useState("")

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      router.replace("/login")
      return
    }
    const su = session.user as any
    setUserId(su.id ? String(su.id) : null)
    setUserName(su.name ?? "User")
  }, [session, status, router])

  const strength        = getStrength(newPw)
  const allPassed       = strength === 4
  const confirmMatch    = confirm.length > 0 && newPw === confirm
  const confirmMismatch = confirm.length > 0 && newPw !== confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allPassed) return
    if (!confirmMatch) return
    if (!userId) return

    setSaving(true)
    const result = await changePasswordInDB(
      Number(userId),
      "temp",   // Reset password không cần verify mật khẩu cũ — dùng adminResetPasswordInDB
      newPw,
    )
    // Nếu changePasswordInDB fail vì "temp" không khớp → dùng adminResetPasswordInDB
    if (!result.success) {
      const { adminResetPasswordInDB } = await import("@/lib/actions/user-admin.actions")
      await adminResetPasswordInDB(Number(userId), newPw)
    }
    setDone(true)
    setSaving(false)
    setTimeout(() => router.push("/dashboard"), 2000)
  }

  if (!userId && !done) return null

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "10px 44px 10px 14px",
    border: "1.5px solid #E5E7EB", borderRadius: 9,
    fontSize: 13.5, outline: "none", fontFamily: "inherit",
    background: "#fff", color: "#111827",
    transition: "border-color .15s, box-shadow .15s",
    boxSizing: "border-box",
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#fce9e9", position: "relative", overflow: "hidden",
    }}>
      {/* BG glow */}
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse 70% 60% at 8% 12%, rgba(220,80,80,0.18) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "min(460px, 94vw)",
        background: "#fff", borderRadius: 22,
        padding: "40px 38px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.13)",
        animation: "fadeUp .4s cubic-bezier(.22,1,.36,1) both",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "#D0211C",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image src="/images/LogoAXIOM.png" alt="AXIOM" width={22} height={22}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#D0211C", letterSpacing: 1 }}>AXIOM</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>HRM &amp; Payroll</div>
          </div>
        </div>

        {/* ── Done state ── */}
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#F0FDF4", border: "2px solid #A7F3D0",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
            }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
              Mật khẩu đã được cập nhật!
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
              Đang chuyển hướng đến trang chủ...
            </p>
            <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#F3F4F6", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg, #10B981, #059669)",
                animation: "fillBar 2s linear forwards",
              }} />
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "#FEF2F2", border: "1px solid #FECACA",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <ShieldCheck size={26} color="#D0211C" />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
                Đặt lại mật khẩu
              </h1>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#FFFBEB", border: "1px solid #FDE68A",
                borderRadius: 8, padding: "8px 12px", marginTop: 10,
              }}>
                <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 12.5, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
                  Xin chào <strong>{userName}</strong>! Vui lòng đặt mật khẩu mới để tiếp tục sử dụng hệ thống.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* New password */}
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Mật khẩu mới <span style={{ color: "#D0211C" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#9CA3AF" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    style={{ ...inputBase, paddingLeft: 38, paddingRight: 44 }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#D0211C"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(208,33,28,0.12)" }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none" }}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex",
                  }}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* ── Strength bars ── */}
                {(
                  <div style={{ marginTop: 10 }}>
                    {/* 4 bars */}
                    <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                      {[0, 1, 2, 3].map(i => {
                        const filled = i < strength
                        const color  = filled ? STRENGTH_COLORS[strength - 1] : "#E5E7EB"
                        return (
                          <div key={i} style={{
                            flex: 1, height: 5, borderRadius: 3,
                            background: color,
                            transition: "background .3s",
                          }} />
                        )
                      })}
                    </div>

                    {/* Strength label */}
                    <div style={{
                      fontSize: 11.5, fontWeight: 700, marginBottom: 10,
                      color: strength > 0 ? STRENGTH_COLORS[strength - 1] : "#9CA3AF",
                    }}>
                      {strength === 0 ? "Nhập mật khẩu..." : STRENGTH_LABELS[strength]}
                    </div>

                    {/* 4 requirements list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {REQUIREMENTS.map((req, i) => {
                        const ok = req.test(newPw)
                        return (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            fontSize: 12.5,
                            color: ok ? "#059669" : "#6B7280",
                            transition: "color .2s",
                          }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                              background: ok ? "#10B981" : "#D1D5DB",
                              transition: "background .2s",
                              boxShadow: ok ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
                            }} />
                            <span style={{ fontWeight: ok ? 600 : 400 }}>{req.label}</span>
                            {ok && <CheckCircle size={13} color="#10B981" style={{ marginLeft: "auto" }} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Xác nhận mật khẩu <span style={{ color: "#D0211C" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#9CA3AF" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    style={{
                      ...inputBase, paddingLeft: 38, paddingRight: 44,
                      borderColor: confirmMismatch ? "#EF4444" : confirmMatch ? "#10B981" : "#E5E7EB",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = confirmMismatch ? "#EF4444" : "#D0211C"
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(208,33,28,0.12)"
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = confirmMismatch ? "#EF4444" : confirmMatch ? "#10B981" : "#E5E7EB"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex",
                  }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmMismatch && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, color: "#EF4444" }}>
                    <XCircle size={13} /> Mật khẩu xác nhận không khớp
                  </div>
                )}
                {confirmMatch && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, color: "#10B981" }}>
                    <CheckCircle size={13} /> Mật khẩu khớp
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!allPassed || !confirmMatch || saving}
                style={{
                  width: "100%", padding: "12px",
                  background: allPassed && confirmMatch
                    ? "linear-gradient(135deg, #D0211C, #991414)"
                    : "#D1D5DB",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                  cursor: (!allPassed || !confirmMatch || saving) ? "not-allowed" : "pointer",
                  boxShadow: allPassed && confirmMatch ? "0 4px 14px rgba(208,33,28,0.32)" : "none",
                  transition: "all .2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 4,
                }}
                onMouseEnter={e => {
                  if (allPassed && confirmMatch && !saving)
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
              >
                {saving ? (
                  <>
                    <span style={{
                      display: "inline-block", width: 14, height: 14,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    {allPassed && confirmMatch ? "Xác nhận đặt lại mật khẩu" : "Hoàn thành các yêu cầu bên trên"}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
