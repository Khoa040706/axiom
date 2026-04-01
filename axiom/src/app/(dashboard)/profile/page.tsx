/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useCurrentUser, useEmployeeId, useUserId } from "@/hooks/use-current-user"
import { changePasswordInDB, updateProfileInDB, getEmployeeAvatar } from "@/lib/actions/user-admin.actions"
import { AvatarImg } from "@/components/ui/avatar-img"
import {
  User, Lock, Camera, Save, Eye, EyeOff, CheckCircle, XCircle,
  Phone, Mail, Building2, Briefcase, Shield, ChevronRight, ArrowLeft,
} from "lucide-react"
import { useBreakpoint } from "@/hooks/use-breakpoint"

type Tab = "info" | "password" | "avatar"

export default function ProfilePage() {
  const router = useRouter()
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const { isMobile } = useBreakpoint()

  const sessionUser = useCurrentUser()
  const employeeId  = useEmployeeId()
  const userId      = useUserId()

  const [tab, setTab]         = useState<Tab>("info")
  const [toast, setToast]     = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const fileRef               = useRef<HTMLInputElement>(null)

  // Info form
  const [infoForm, setInfoForm] = useState({ name: "", email: "", phone: "" })
  const [infoSaving, setInfoSaving] = useState(false)

  // Password form
  const [pwForm, setPwForm] = useState({ old: "", newP: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [showPw, setShowPw] = useState({ old: false, newP: false, confirm: false })

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarSaving, setAvatarSaving]   = useState(false)
  const [avatarChanged, setAvatarChanged] = useState(false)

  useEffect(() => {
    if (!sessionUser) return
    setInfoForm({ name: sessionUser.name, email: sessionUser.email ?? "", phone: (sessionUser as any).phone ?? "" })
    // Load avatar từ DB theo employeeId
    if (employeeId) {
      getEmployeeAvatar(employeeId).then(res => {
        if (res.avatarPath) setAvatarPreview(res.avatarPath)
      })
    }
  // Dùng primitive values thay vì object reference để tránh infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.name, sessionUser?.email, (sessionUser as any)?.phone, employeeId])

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Save info ─────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!employeeId) { showToast("error", lang === "vi" ? "Không xác định được nhân viên" : "Cannot identify employee"); return }
    if (!infoForm.name.trim()) { showToast("error", lang === "vi" ? "Họ tên không được để trống" : "Name is required"); return }
    if (!infoForm.email.trim()) { showToast("error", lang === "vi" ? "Email không được để trống" : "Email is required"); return }
    setInfoSaving(true)
    const res = await updateProfileInDB(employeeId, {
      fullName: infoForm.name.trim(),
      email: infoForm.email.trim(),
      phone: infoForm.phone.trim(),
    })
    if (res.success) {
      showToast("success", lang === "vi" ? "Cập nhật thông tin thành công!" : "Profile updated!")
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setInfoSaving(false)
  }

  // ── Save password ─────────────────────────────────────────
  const handleSavePw = async () => {
    if (!userId) { showToast("error", lang === "vi" ? "Không xác định được tài khoản" : "Cannot identify account"); return }
    if (!pwForm.old) { showToast("error", lang === "vi" ? "Nhập mật khẩu cũ" : "Enter old password"); return }
    const REQS = [
      (v: string) => v.length >= 8,
      (v: string) => /[A-Z]/.test(v),
      (v: string) => /[0-9]/.test(v),
      (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v),
    ]
    if (!REQS.every(r => r(pwForm.newP))) {
      showToast("error", lang === "vi" ? "Mật khẩu chưa đáp ứng đủ 4 yêu cầu bảo mật" : "Password doesn't meet all 4 security requirements")
      return
    }
    if (pwForm.newP !== pwForm.confirm) { showToast("error", lang === "vi" ? "Xác nhận mật khẩu không khớp" : "Passwords don't match"); return }
    setPwSaving(true)
    const result = await changePasswordInDB(userId, pwForm.old, pwForm.newP)
    if (result.success) {
      setPwForm({ old: "", newP: "", confirm: "" })
      showToast("success", lang === "vi" ? "Đổi mật khẩu thành công!" : "Password changed!")
    } else {
      showToast("error", result.error ?? "Lỗi")
    }
    setPwSaving(false)
  }

  // ── Avatar upload ─────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast("error", lang === "vi" ? "Ảnh tối đa 5MB" : "Max 5MB"); return }
    const reader = new FileReader()
    reader.onload = ev => {
      setAvatarPreview(ev.target?.result as string)
      setAvatarChanged(true)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    if (!employeeId || !avatarPreview || !avatarChanged) return
    setAvatarSaving(true)
    // Lưu base64 vào DB
    const res = await updateProfileInDB(employeeId, { avatarPath: avatarPreview })
    if (res.success) {
      showToast("success", lang === "vi" ? "Cập nhật ảnh đại diện thành công!" : "Avatar updated!")
      setAvatarChanged(false)  // reset flag, giữ nguyên preview để hiển thị ảnh mới
      window.dispatchEvent(new Event("axiom-user-updated"))  // cập nhật sidebar + header
    } else {
      showToast("error", res.error ?? "Lỗi lưu ảnh")
    }
    setAvatarSaving(false)
  }

  const user = sessionUser
  if (!user) return null

  const TABS: { id: Tab; icon: React.ReactNode; label: string; labelEn: string }[] = [
    { id: "info",     icon: <User size={16} />,   label: "Thông tin cá nhân", labelEn: "Personal Info" },
    { id: "password", icon: <Lock size={16} />,   label: "Đổi mật khẩu",     labelEn: "Change Password" },
    { id: "avatar",   icon: <Camera size={16} />, label: "Ảnh đại diện",      labelEn: "Profile Photo" },
  ]

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${th.inputBorder}`, background: th.inputBg,
    color: th.text1, fontSize: 14, outline: "none",
    transition: "border-color .2s", fontFamily: "inherit", boxSizing: "border-box",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: th.text2,
    marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em",
  }
  const btnPrimary: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
    borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
    background: "linear-gradient(135deg, #D0211C, #991414)",
    color: "#fff", fontFamily: "inherit", transition: "opacity .15s, transform .1s",
  }

  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, color: th.text2, fontSize: 13 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: th.text2, fontFamily: "inherit", fontSize: 13, padding: 0 }}>
          <ArrowLeft size={14} />
          {lang === "vi" ? "Quay lại" : "Back"}
        </button>
        <ChevronRight size={14} />
        <span style={{ color: th.text1, fontWeight: 600 }}>{lang === "vi" ? "Hồ sơ cá nhân" : "My Profile"}</span>
      </div>

      {/* ── Header card ── */}
      <div style={{
        background: "linear-gradient(135deg, #991414 0%, #D0211C 50%, #b31a1a 100%)",
        borderRadius: 20, padding: isMobile ? "20px" : "28px 32px", marginBottom: 24,
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? 16 : 24, position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(208,33,28,0.3)",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0, zIndex: 1 }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            <AvatarImg
              src={avatarPreview}
              alt={user.name}
              size={88}
            />
          </div>
          <button
            onClick={() => setTab("avatar")}
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Camera size={14} color="#D0211C" />
          </button>
        </div>

        {/* Info */}
        <div style={{ zIndex: 1 }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user.name}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 8 }}>
            {lang === "vi" ? user.roleLabel : user.roleLabelEn} · {user.department}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
              <Mail size={13} /> {user.email}
            </div>
            {user.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
                <Phone size={13} /> {user.phone}
              </div>
            )}
          </div>
        </div>

        {/* Role badge */}
        <div style={{ marginLeft: "auto", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12,
            padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <Shield size={16} color="rgba(255,255,255,0.9)" />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {lang === "vi" ? user.roleLabel : user.roleLabelEn}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid: Tabs + Content ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 20 }}>

        {/* Tab sidebar — vertical on desktop, horizontal pills on mobile */}
        <div style={{
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 16, padding: isMobile ? "8px 12px" : "12px",
          height: isMobile ? "auto" : "fit-content",
          boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
          display: isMobile ? "flex" : "block",
          gap: isMobile ? 8 : undefined,
          overflowX: isMobile ? "auto" : undefined,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: isMobile ? "auto" : "100%",
                flexShrink: isMobile ? 0 : undefined,
                display: "flex", alignItems: "center", gap: 8,
                padding: isMobile ? "8px 14px" : "11px 14px",
                borderRadius: 10, border: "none",
                background: tab === t.id
                  ? "linear-gradient(135deg, rgba(208,33,28,0.12), rgba(153,20,20,0.08))"
                  : "none",
                cursor: "pointer", textAlign: "left",
                marginBottom: isMobile ? 0 : 4,
                color: tab === t.id ? "#D0211C" : th.text2,
                fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                fontFamily: "inherit", transition: "all .15s",
                borderLeft: isMobile ? "none" : (tab === t.id ? "3px solid #D0211C" : "3px solid transparent"),
                borderBottom: isMobile ? (tab === t.id ? "2px solid #D0211C" : "2px solid transparent") : "none",
                whiteSpace: "nowrap",
              }}
            >
              {t.icon}
              {lang === "vi" ? t.label : t.labelEn}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 16, padding: "28px",
          boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
        }}>

          {/* ── TAB: Thông tin ── */}
          {tab === "info" && (
            <div>
              <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 10 }}>
                <User size={20} color="#D0211C" />
                {lang === "vi" ? "Thông tin cá nhân" : "Personal Information"}
              </h2>

              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>
                      {lang === "vi" ? "Họ và tên" : "Full Name"} <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      style={inputStyle}
                      value={infoForm.name}
                      onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={lang === "vi" ? "Nguyễn Văn A" : "Full name"}
                      onFocus={e => (e.target.style.borderColor = "#D0211C")}
                      onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === "vi" ? "Mã nhân viên" : "Employee ID"}</label>
                    <input
                      style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                      value={user.id} readOnly
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>
                      Email <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        style={{ ...inputStyle, paddingLeft: 38 }}
                        value={infoForm.email} type="email"
                        onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="example@axiom.vn"
                        onFocus={e => (e.target.style.borderColor = "#D0211C")}
                        onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === "vi" ? "Số điện thoại" : "Phone"}</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        style={{ ...inputStyle, paddingLeft: 38 }}
                        value={infoForm.phone}
                        onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="0912 345 678"
                        onFocus={e => (e.target.style.borderColor = "#D0211C")}
                        onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>{lang === "vi" ? "Phòng ban" : "Department"}</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        style={{ ...inputStyle, paddingLeft: 38, opacity: 0.6, cursor: "not-allowed" }}
                        value={user.department} readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{lang === "vi" ? "Chức vụ" : "Position"}</label>
                    <div style={{ position: "relative" }}>
                      <Briefcase size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        style={{ ...inputStyle, paddingLeft: 38, opacity: 0.6, cursor: "not-allowed" }}
                        value={lang === "vi" ? user.roleLabel : user.roleLabelEn} readOnly
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
                  <button
                    onClick={handleSaveInfo}
                    disabled={infoSaving}
                    style={{ ...btnPrimary, opacity: infoSaving ? 0.7 : 1 }}
                    onMouseEnter={e => !infoSaving && ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
                  >
                    <Save size={15} />
                    {infoSaving
                      ? (lang === "vi" ? "Đang lưu..." : "Saving...")
                      : (lang === "vi" ? "Lưu thay đổi" : "Save Changes")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Mật khẩu ── */}
          {tab === "password" && (
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 10 }}>
                <Lock size={20} color="#D0211C" />
                {lang === "vi" ? "Đổi mật khẩu" : "Change Password"}
              </h2>
              <p style={{ margin: "0 0 28px", color: th.text2, fontSize: 13 }}>
                {lang === "vi"
                  ? "Mật khẩu mới phải đáp ứng đầy đủ 4 yêu cầu bảo mật bên dưới."
                  : "New password must meet all 4 security requirements below."}
              </p>

              <div style={{ display: "grid", gap: 18, maxWidth: 440 }}>
                {/* Old password */}
                <div>
                  <label style={labelStyle}>{lang === "vi" ? "Mật khẩu hiện tại" : "Current Password"} <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inputStyle, paddingRight: 44 }}
                      type={showPw.old ? "text" : "password"}
                      value={pwForm.old}
                      onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
                      placeholder="••••••••"
                      onFocus={e => (e.target.style.borderColor = "#D0211C")}
                      onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                    />
                    <button onClick={() => setShowPw(s => ({ ...s, old: !s.old }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}>
                      {showPw.old ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label style={labelStyle}>{lang === "vi" ? "Mật khẩu mới" : "New Password"} <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inputStyle, paddingRight: 44 }}
                      type={showPw.newP ? "text" : "password"}
                      value={pwForm.newP}
                      onChange={e => setPwForm(f => ({ ...f, newP: e.target.value }))}
                      placeholder="••••••••"
                      onFocus={e => (e.target.style.borderColor = "#D0211C")}
                      onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                    />
                    <button onClick={() => setShowPw(s => ({ ...s, newP: !s.newP }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}>
                      {showPw.newP ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* 4-requirement strength indicator */}
                  {(() => {
                    const REQS: { label: string; labelEn: string; test: (v: string) => boolean }[] = [
                      { label: "Ít nhất 8 ký tự",             labelEn: "At least 8 characters",    test: v => v.length >= 8 },
                      { label: "Ít nhất 1 chữ hoa",           labelEn: "At least 1 uppercase",      test: v => /[A-Z]/.test(v) },
                      { label: "Ít nhất 1 chữ số",            labelEn: "At least 1 number",         test: v => /[0-9]/.test(v) },
                      { label: "Ít nhất 1 ký tự đặc biệt (!@#...)", labelEn: "At least 1 special char (!@#...)", test: v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v) },
                    ]
                    const COLORS = ["#EF4444", "#F97316", "#EAB308", "#22C55E"]
                    const LABELS = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"]
                    const score  = REQS.filter(r => r.test(pwForm.newP)).length
                    return (
                      <div style={{ marginTop: 10 }}>
                        {/* Bars */}
                        <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                          {[0,1,2,3].map(i => (
                            <div key={i} style={{
                              flex: 1, height: 5, borderRadius: 3,
                              background: i < score ? COLORS[score - 1] : th.tableBorder,
                              transition: "background .3s",
                            }} />
                          ))}
                        </div>
                        {/* Label */}
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: score > 0 ? COLORS[score - 1] : th.text2, marginBottom: 8 }}>
                          {score === 0 ? (lang === "vi" ? "Nhập mật khẩu..." : "Typing...") : (lang === "vi" ? LABELS[score] : LABELS[score])}
                        </div>
                        {/* Requirements list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {REQS.map((req, i) => {
                            const ok = req.test(pwForm.newP)
                            return (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: ok ? "#059669" : th.text2, transition: "color .2s" }}>
                                <div style={{
                                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                                  background: ok ? "#10B981" : th.tableBorder,
                                  transition: "background .2s",
                                  boxShadow: ok ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
                                }} />
                                <span style={{ fontWeight: ok ? 600 : 400 }}>{lang === "vi" ? req.label : req.labelEn}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Confirm */}
                <div>
                  <label style={labelStyle}>{lang === "vi" ? "Xác nhận mật khẩu" : "Confirm Password"} <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{
                        ...inputStyle, paddingRight: 44,
                        borderColor: pwForm.confirm && pwForm.newP !== pwForm.confirm ? "#EF4444" : th.inputBorder,
                      }}
                      type={showPw.confirm ? "text" : "password"}
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="••••••••"
                      onFocus={e => (e.target.style.borderColor = "#D0211C")}
                      onBlur={e => (e.target.style.borderColor = pwForm.confirm && pwForm.newP !== pwForm.confirm ? "#EF4444" : th.inputBorder)}
                    />
                    <button onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: th.text2, display: "flex" }}>
                      {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.confirm && pwForm.newP !== pwForm.confirm && (
                    <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>
                      {lang === "vi" ? "Mật khẩu không khớp" : "Passwords don't match"}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleSavePw}
                    disabled={pwSaving}
                    style={{ ...btnPrimary, opacity: pwSaving ? 0.7 : 1 }}
                    onMouseEnter={e => !pwSaving && ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
                  >
                    <Lock size={15} />
                    {pwSaving
                      ? (lang === "vi" ? "Đang lưu..." : "Saving...")
                      : (lang === "vi" ? "Đổi mật khẩu" : "Change Password")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Avatar ── */}
          {tab === "avatar" && (
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 10 }}>
                <Camera size={20} color="#D0211C" />
                {lang === "vi" ? "Ảnh đại diện" : "Profile Photo"}
              </h2>
              <p style={{ margin: "0 0 28px", color: th.text2, fontSize: 13 }}>
                {lang === "vi"
                  ? "Chọn ảnh JPG, PNG hoặc WebP. Tối đa 5MB."
                  : "Choose JPG, PNG, or WebP. Max 5MB."}
              </p>

              <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Preview */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
                    border: `3px solid ${th.cardBorder}`,
                    boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.12)",
                  }}>
                    <AvatarImg
                      src={avatarPreview}
                      alt="Preview"
                      size={140}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: th.text2, textAlign: "center" }}>
                    {lang === "vi" ? "Xem trước" : "Preview"}
                  </div>
                </div>

                {/* Upload zone */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${th.cardBorder}`, borderRadius: 16,
                      padding: "32px 24px", textAlign: "center", cursor: "pointer",
                      transition: "border-color .2s, background .2s",
                      marginBottom: 20,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#D0211C"
                      ;(e.currentTarget as HTMLElement).style.background = dark ? "rgba(208,33,28,0.05)" : "rgba(208,33,28,0.02)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = th.cardBorder
                      ;(e.currentTarget as HTMLElement).style.background = "transparent"
                    }}
                  >
                    <Camera size={32} color={th.text2} style={{ marginBottom: 12 }} />
                    <div style={{ color: th.text1, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                      {lang === "vi" ? "Nhấn để chọn ảnh" : "Click to choose photo"}
                    </div>
                    <div style={{ color: th.text2, fontSize: 12 }}>
                      JPG, PNG, WebP · {lang === "vi" ? "Tối đa" : "Max"} 5MB
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={handleSaveAvatar}
                      disabled={avatarSaving || !avatarChanged}
                      style={{ ...btnPrimary, opacity: (avatarSaving || !avatarChanged) ? 0.5 : 1, cursor: !avatarChanged ? "not-allowed" : "pointer" }}
                    >
                      <Save size={15} />
                      {avatarSaving
                        ? (lang === "vi" ? "Đang lưu..." : "Saving...")
                        : (lang === "vi" ? "Lưu ảnh" : "Save Photo")}
                    </button>
                    {avatarChanged && (
                      <button
                        onClick={() => { setAvatarPreview(null); setAvatarChanged(false) }}
                        style={{
                          padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${th.cardBorder}`,
                          background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                          color: th.text2, fontFamily: "inherit", transition: "all .15s",
                        }}
                      >
                        {lang === "vi" ? "Huỷ" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 9999,
          background: toast.type === "success" ? "#10B981" : "#EF4444",
          color: "#fff", padding: "14px 20px", borderRadius: 14,
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "fadeDown .2s ease",
          fontSize: 14, fontWeight: 600, maxWidth: 340,
        }}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
