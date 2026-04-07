"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { savePersonalEmailInDB } from "@/lib/actions/user-admin.actions"
import { Mail, Shield, CheckCircle, XCircle, ArrowRight, LogOut } from "lucide-react"

export default function SetupEmailPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [email, setEmail]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState(false)
  const [dark, setDark]         = useState(true)

  // Nếu đã có personalEmail → về dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.personalEmail) {
      router.replace(session.user.dashboardPath ?? "/dashboard-employee")
    }
  }, [session, status, router])

  // Chưa load session → loading
  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#100505", color: "#fff", fontSize: 16,
      }}>
        Đang tải...
      </div>
    )
  }

  // Chưa login → về login
  if (status === "unauthenticated") {
    router.replace("/login")
    return null
  }

  const bg    = dark ? "#100505" : "#FDF3F4"
  const card  = dark ? "#1c0b0b" : "#ffffff"
  const text1 = dark ? "#f1e9e9" : "#1a202c"
  const text2 = dark ? "#a08080" : "#64748b"
  const border = dark ? "#3d2020" : "#e2e8f0"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) { setError("Vui lòng nhập Gmail cá nhân"); return }
    if (!trimmed.endsWith("@gmail.com")) { setError("Chỉ chấp nhận địa chỉ Gmail (@gmail.com)"); return }

    setLoading(true)
    try {
      const userId = session?.user?.id
      if (!userId) { setError("Không xác định được tài khoản"); setLoading(false); return }

      const res = await savePersonalEmailInDB(userId, trimmed)
      if (!res.success) {
        setError(res.error ?? "Lỗi không xác định")
        setLoading(false)
        return
      }

      // Cập nhật JWT token với personalEmail mới
      await update({ personalEmail: trimmed })
      setSuccess(true)

      // Chuyển hướng sau 1.5s
      setTimeout(() => {
        router.replace(session?.user?.dashboardPath ?? "/dashboard-employee")
      }, 1500)
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "20px",
      position: "relative",
      transition: "background .3s",
    }}>
      {/* Toggle dark/light */}
      <button
        onClick={() => setDark(d => !d)}
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 10,
          background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          border: "none", borderRadius: 10, padding: "8px 12px",
          cursor: "pointer", fontSize: 16, color: dark ? "#fff" : "#333",
        }}
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* Card */}
      <div style={{
        background: card,
        borderRadius: 24,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 460,
        boxShadow: dark
          ? "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(208,33,28,0.15)"
          : "0 24px 80px rgba(208,33,28,0.12), 0 0 0 1px rgba(208,33,28,0.08)",
        border: `1px solid ${border}`,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #D32F2F, #9A0007)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(208,33,28,0.4)",
            }}>
              <Shield size={22} color="#fff" />
            </div>
            <span style={{
              fontSize: 22, fontWeight: 900, letterSpacing: 4,
              background: "linear-gradient(135deg, #D32F2F, #FF6659)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              AXIOM
            </span>
          </div>
          <div style={{ fontSize: 12, color: text2, letterSpacing: 1 }}>HRM & Payroll Management</div>
        </div>

        {/* Icon Gmail */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
          background: "linear-gradient(135deg, rgba(208,33,28,0.15), rgba(208,33,28,0.05))",
          border: "2px solid rgba(208,33,28,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Mail size={32} color="#D32F2F" />
        </div>

        {/* Title */}
        <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: text1, textAlign: "center" }}>
          Thiết lập Gmail cá nhân
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: text2, textAlign: "center", lineHeight: 1.6 }}>
          Xin chào, <strong style={{ color: text1 }}>{session?.user?.name}</strong>!<br />
          Vui lòng nhập Gmail cá nhân để nhận mật khẩu khi cần khôi phục tài khoản.
        </p>

        {/* Badge thông tin */}
        <div style={{
          background: dark ? "rgba(208,33,28,0.08)" : "rgba(208,33,28,0.04)",
          border: "1px solid rgba(208,33,28,0.2)",
          borderRadius: 12, padding: "12px 16px", marginBottom: 24,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Shield size={16} color="#D32F2F" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: text2, lineHeight: 1.6 }}>
            Gmail này <strong style={{ color: text1 }}>không phải email đăng nhập</strong>.
            Hệ thống chỉ dùng để gửi mật khẩu tạm thời khi bạn quên mật khẩu.
          </div>
        </div>

        {/* Form */}
        {!success ? (
          <form onSubmit={handleSubmit}>
            <label style={{
              fontSize: 12, fontWeight: 700, color: text2,
              textTransform: "uppercase", letterSpacing: "0.05em",
              display: "block", marginBottom: 8,
            }}>
              Gmail cá nhân <span style={{ color: "#EF4444" }}>*</span>
            </label>

            <div style={{ position: "relative", marginBottom: error ? 8 : 20 }}>
              <Mail size={16} color={text2} style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError("") }}
                placeholder="example@gmail.com"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px 14px 12px 42px",
                  borderRadius: 12,
                  border: `1.5px solid ${error ? "#EF4444" : (email.toLowerCase().endsWith("@gmail.com") && email.length > 10 ? "#10B981" : border)}`,
                  background: dark ? "#2a1010" : "#f8fafc",
                  color: text1, fontSize: 14, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                  transition: "border-color .2s",
                  cursor: loading ? "not-allowed" : "text",
                  opacity: loading ? 0.7 : 1,
                }}
                onFocus={e => !error && (e.target.style.borderColor = "#D32F2F")}
                onBlur={e => !error && (e.target.style.borderColor = border)}
              />
              {/* Gmail valid indicator */}
              {email.toLowerCase().endsWith("@gmail.com") && email.length > 10 && !error && (
                <CheckCircle size={16} color="#10B981" style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                }} />
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, color: "#EF4444", marginBottom: 16,
              }}>
                <XCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                borderRadius: 12, border: "none",
                background: loading
                  ? "rgba(208,33,28,0.5)"
                  : "linear-gradient(135deg, #D32F2F 0%, #9A0007 100%)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 4px 16px rgba(208,33,28,0.35)",
                transition: "all .2s",
              }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
            >
              {loading ? (
                <>Đang lưu...</>
              ) : (
                <>
                  Xác nhận Gmail
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success state */
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", margin: "0 auto 16px",
              background: "rgba(16,185,129,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: text1, marginBottom: 6 }}>Thiết lập thành công!</div>
            <div style={{ fontSize: 14, color: text2 }}>Đang chuyển hướng về dashboard...</div>
          </div>
        )}

        {/* Logout link */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: text2, fontSize: 13, display: "inline-flex",
              alignItems: "center", gap: 6, fontFamily: "inherit",
            }}
          >
            <LogOut size={13} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
