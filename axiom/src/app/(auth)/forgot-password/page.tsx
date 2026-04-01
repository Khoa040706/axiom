"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, KeyRound, Mail, CheckCircle2, Send, Copy, Check } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [tempPw, setTempPw]   = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res  = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json() as { success?: boolean; error?: string; tempPw?: string; email?: string }

      if (res.ok && data.success) {
        if (data.tempPw) {
          setTempPw(data.tempPw)
        }
        setSent(true)
      } else {
        setError(data.error ?? "Đã xảy ra lỗi. Vui lòng thử lại.")
      }
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!tempPw) return
    navigator.clipboard.writeText(tempPw).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        width: "min(440px, 94vw)",
        background: "#fff", borderRadius: 20,
        padding: "40px 36px",
        boxShadow: "0 20px 55px rgba(0,0,0,0.11)",
        animation: "fadeUp .4s cubic-bezier(.22,1,.36,1) both",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "#D0211C",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image
              src="/images/LogoAXIOM.png"
              alt="AXIOM" width={22} height={22}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#D0211C", letterSpacing: 1 }}>AXIOM</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>HRM &amp; Payroll</div>
          </div>
        </div>

        {/* Icon + Title */}
        <div style={{ marginBottom: 26 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "#FEF2F2", border: "1px solid #FECACA",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <KeyRound size={24} color="#D0211C" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
            Quên mật khẩu?
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
            Nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi mật khẩu tạm thời về hộp thư của bạn.
          </p>
        </div>

        {/* ── Form ── */}
        {!sent && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{
                display: "block", fontSize: 12.5,
                fontWeight: 600, color: "#374151", marginBottom: 6,
              }}>
                Địa chỉ Email <span style={{ color: "#D0211C" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15} color="#9CA3AF"
                  style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="email" required
                  placeholder="example@axiom.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px 10px 34px",
                    border: "1.5px solid #E5E7EB", borderRadius: 8,
                    fontSize: 13, outline: "none", fontFamily: "inherit",
                    background: "#fff", color: "#111827",
                    boxSizing: "border-box",
                    transition: "border-color .15s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#D0211C" }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB" }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 7, padding: "9px 12px",
                fontSize: 12.5, color: "#991B1B",
              }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px",
              background: loading ? "#e05050" : "#D0211C",
              color: "#fff", border: "none", borderRadius: 9,
              fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(208,33,28,0.32)",
              transition: "background .15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? (
                <>
                  <span style={{
                    display: "inline-block", width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }} />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Gửi mật khẩu tạm thời
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Success state ── */}
        {sent && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "#F0FDF4", border: "1px solid #A7F3D0",
              borderRadius: 12, padding: "16px 18px",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, color: "#065F46", fontSize: 15, marginBottom: 4 }}>
                  Email đã được gửi!
                </div>
                <div style={{ fontSize: 13, color: "#047857", lineHeight: 1.6 }}>
                  Mật khẩu tạm thời đã gửi đến <b>{email}</b>.<br />
                  Kiểm tra hộp thư (kể cả thư mục Spam).
                </div>
              </div>
            </div>

            {/* Demo: hiển thị mật khẩu tạm khi chưa cấu hình SMTP */}
            {tempPw && (
              <div style={{
                background: "#FEF2F2", border: "2px dashed #FECACA",
                borderRadius: 12, padding: "16px 18px",
              }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>
                  🖥️ Chế độ demo — Mật khẩu tạm thời
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontSize: 22, fontWeight: 900, color: "#D0211C",
                    letterSpacing: 5, fontFamily: "monospace", flex: 1,
                  }}>
                    {tempPw}
                  </span>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 7,
                      border: "1.5px solid #FECACA",
                      background: copied ? "#D1FAE5" : "#fff",
                      color: copied ? "#059669" : "#D0211C",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", transition: "all .2s",
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Đã sao chép" : "Sao chép"}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8, lineHeight: 1.5 }}>
                  Dùng mật khẩu này để đăng nhập. Hệ thống sẽ yêu cầu bạn đặt mật khẩu mới ngay lập tức.
                </div>
              </div>
            )}

            <div style={{
              background: "#FFFBEB", borderRadius: 8, padding: "12px 14px",
              fontSize: 12.5, color: "#92400E", lineHeight: 1.6,
              border: "1px solid #FDE68A",
            }}>
              ⚠️ Sau khi đăng nhập bằng mật khẩu tạm, hệ thống sẽ <strong>bắt buộc</strong> bạn đặt lại mật khẩu mới theo tiêu chuẩn bảo mật.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setSent(false); setEmail(""); setTempPw(null) }}
                style={{
                  flex: 1, background: "none", border: "1px solid #E5E7EB",
                  borderRadius: 8, padding: "9px",
                  fontSize: 13, color: "#6B7280",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Gửi lại cho email khác
              </button>
              <Link
                href="/login"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#D0211C", color: "#fff", borderRadius: 8,
                  padding: "9px", fontSize: 13, fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        )}

        {/* Back */}
        <Link href="/login" style={{
          display: "flex", alignItems: "center", gap: 6,
          marginTop: 22, fontSize: 13, color: "#6B7280",
          textDecoration: "none", justifyContent: "center",
        }}>
          <ArrowLeft size={14} />
          Quay lại đăng nhập
        </Link>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
