/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useCurrentUser, useEmployeeId, useUserId } from "@/hooks/use-current-user"
import { changePasswordInDB, updateProfileInDB, getEmployeeAvatar } from "@/lib/actions/user-admin.actions"
import { AvatarImg } from "@/components/ui/avatar-img"
import {
  User, Lock, Camera, Save, Eye, EyeOff, CheckCircle, XCircle,
  Phone, Mail, Building2, Briefcase, Shield, ChevronRight, ArrowLeft,
  ZoomIn, ZoomOut, Move, RotateCcw, Crop, Trash2,
} from "lucide-react"
import { useBreakpoint } from "@/hooks/use-breakpoint"

type Tab = "info" | "password" | "avatar"

// ─────────────────────────────────────────────────────────────
// Avatar Crop Modal — drag to pan, scroll/buttons to zoom
// ─────────────────────────────────────────────────────────────
function AvatarCropModal({
  imageSrc, onSave, onCancel, dark, vi,
}: {
  imageSrc: string
  onSave: (croppedBase64: string) => void
  onCancel: () => void
  dark: boolean
  vi: boolean
}) {
  const th = getTheme(dark)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pan & zoom state
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const isDragging = useRef(false)          // ref: luôn đúng trong event handler
  const dragStart = useRef({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const CROP_SIZE = 260 // visual cropbox size
  const OUTPUT_SIZE = 400 // output resolution

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imgRef.current = img
      setImgLoaded(true)
      // Auto fit: scale so smaller dimension fills the crop box
      const fitScale = CROP_SIZE / Math.min(img.width, img.height)
      setScale(Math.max(fitScale, 0.1))
      setOffset({ x: 0, y: 0 })
    }
    img.src = imageSrc
  }, [imageSrc])

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !imgLoaded) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE)

    // Clip to circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    const w = img.width * scale
    const h = img.height * scale
    const x = (CROP_SIZE - w) / 2 + offset.x
    const y = (CROP_SIZE - h) / 2 + offset.y

    ctx.drawImage(img, x, y, w, h)
    ctx.restore()

    // Draw circle border
    ctx.beginPath()
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2 - 1.5, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(208,33,28,0.6)"
    ctx.lineWidth = 3
    ctx.stroke()
  }, [scale, offset, imgLoaded])

  // Passive wheel listener — React onWheel is passive by default, cannot preventDefault
  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      setScale(s => Math.max(0.1, Math.min(5, s - e.deltaY * 0.001)))
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  // Mouse/touch drag
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    setDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return   // ← ref không bị stale closure
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }
  const onPointerUp = () => {
    isDragging.current = false
    setDragging(false)
  }

  // Save cropped result
  const handleSave = () => {
    const img = imgRef.current
    if (!img) return
    const out = document.createElement("canvas")
    out.width = OUTPUT_SIZE
    out.height = OUTPUT_SIZE
    const ctx = out.getContext("2d")
    if (!ctx) return

    // Draw circular clip at output resolution
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    const ratio = OUTPUT_SIZE / CROP_SIZE
    const w = img.width * scale * ratio
    const h = img.height * scale * ratio
    const x = (OUTPUT_SIZE - w) / 2 + offset.x * ratio
    const y = (OUTPUT_SIZE - h) / 2 + offset.y * ratio

    ctx.drawImage(img, x, y, w, h)

    onSave(out.toDataURL("image/png"))
  }

  const btnSmall: React.CSSProperties = {
    width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${th.cardBorder}`,
    background: th.cardBg, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", color: th.text1, transition: "all .15s",
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)", zIndex: 9998,
      }} />
      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16, zIndex: 9999,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 22, width: "min(440px, 95vw)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)", overflow: "hidden",
          animation: "fadeDown .25s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 22px", borderBottom: `1px solid ${th.tableBorder}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#D0211C,#991414)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Crop size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: th.text1 }}>
                  {vi ? "Cắt ảnh đại diện" : "Crop Avatar"}
                </div>
                <div style={{ fontSize: 11.5, color: th.text2 }}>
                  {vi ? "Kéo để di chuyển · Cuộn để phóng" : "Drag to pan · Scroll to zoom"}
                </div>
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div style={{
            padding: "24px 0", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 16,
            background: dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
          }}>
            {/* Checkerboard + canvas */}
            <div
              ref={canvasContainerRef}
              style={{
                position: "relative", width: CROP_SIZE, height: CROP_SIZE,
                borderRadius: "50%", overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                cursor: dragging ? "grabbing" : "grab",
                backgroundImage: `repeating-conic-gradient(${dark?"#333":"#ddd"} 0% 25%, ${dark?"#222":"#eee"} 0% 50%)`,
                backgroundSize: "20px 20px",
              }}
            >
              <canvas
                ref={canvasRef}
                width={CROP_SIZE}
                height={CROP_SIZE}
                style={{ display: "block", width: CROP_SIZE, height: CROP_SIZE, touchAction: "none" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            </div>

            {/* Zoom controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setScale(s => Math.max(0.1, s - 0.15))}
                style={btnSmall}
                title={vi ? "Thu nhỏ" : "Zoom out"}
              >
                <ZoomOut size={16} />
              </button>
              <div style={{
                width: 140, height: 6, borderRadius: 3,
                background: th.tableBorder, position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  left: `${Math.min(100, Math.max(0, ((scale - 0.1) / 4.9) * 100))}%`,
                  top: "50%", transform: "translate(-50%, -50%)",
                  width: 16, height: 16, borderRadius: "50%",
                  background: "linear-gradient(135deg,#D0211C,#991414)",
                  boxShadow: "0 2px 6px rgba(208,33,28,0.3)",
                  cursor: "pointer",
                }} />
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${Math.min(100, Math.max(0, ((scale - 0.1) / 4.9) * 100))}%`,
                  background: "#D0211C", borderRadius: 3,
                }} />
              </div>
              <button
                onClick={() => setScale(s => Math.min(5, s + 0.15))}
                style={btnSmall}
                title={vi ? "Phóng to" : "Zoom in"}
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }) }}
                style={btnSmall}
                title={vi ? "Đặt lại" : "Reset"}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Hint */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11.5, color: th.text2,
            }}>
              <Move size={12} />
              {vi ? "Kéo ảnh để điều chỉnh vị trí" : "Drag image to adjust position"}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: "16px 22px", borderTop: `1px solid ${th.tableBorder}`,
            display: "flex", justifyContent: "flex-end", gap: 10,
          }}>
            <button onClick={onCancel} style={{
              padding: "10px 20px", borderRadius: 10,
              border: `1.5px solid ${th.cardBorder}`, background: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              color: th.text2, fontFamily: "inherit",
            }}>
              {vi ? "Huỷ" : "Cancel"}
            </button>
            <button onClick={handleSave} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#D0211C,#991414)",
              color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
              fontFamily: "inherit", boxShadow: "0 4px 14px rgba(208,33,28,0.3)",
              display: "flex", alignItems: "center", gap: 8,
              transition: "transform .15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}
            >
              <Crop size={15} />
              {vi ? "Xác nhận cắt" : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN: Profile Page
// ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
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
  // Crop modal
  const [rawImage, setRawImage]     = useState<string | null>(null)
  const [showCrop, setShowCrop]     = useState(false)

  useEffect(() => {
    if (!sessionUser) return
    setInfoForm({ name: sessionUser.name, email: sessionUser.email ?? "", phone: (sessionUser as any).phone ?? "" })
    if (employeeId) {
      getEmployeeAvatar(employeeId).then(res => {
        if (res.avatarPath) setAvatarPreview(res.avatarPath)
        if (res.email || res.phone) {
          setInfoForm(f => ({
            ...f,
            email: res.email ?? f.email,
            phone: res.phone ?? f.phone,
          }))
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.name, sessionUser?.email, (sessionUser as any)?.phone, employeeId])

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Save info ─────────────────────────────────────────────
  const handleSaveInfo = async () => {
    // Tài khoản Admin hệ thống không có Employee record
    if (!employeeId) {
      showToast("error", vi
        ? "Tài khoản quản trị hệ thống không thể chỉnh sửa hồ sơ nhân viên."
        : "System admin account profile is managed by the system.")
      return
    }
    if (!infoForm.email.trim()) { showToast("error", vi ? "Email không được để trống" : "Email is required"); return }
    setInfoSaving(true)
    const res = await updateProfileInDB(employeeId, {
      email: infoForm.email.trim(),
      phone: infoForm.phone.trim(),
    })
    if (res.success) {
      showToast("success", vi ? "Cập nhật thông tin thành công!" : "Profile updated!")
    } else {
      showToast("error", res.error ?? "Lỗi")
    }
    setInfoSaving(false)
  }

  // ── Save password ─────────────────────────────────────────
  const handleSavePw = async () => {
    if (!userId) { showToast("error", vi ? "Không xác định được tài khoản" : "Cannot identify account"); return }
    if (!pwForm.old) { showToast("error", vi ? "Nhập mật khẩu cũ" : "Enter old password"); return }
    const REQS = [
      (v: string) => v.length >= 8,
      (v: string) => /[A-Z]/.test(v),
      (v: string) => /[0-9]/.test(v),
      (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v),
    ]
    if (!REQS.every(r => r(pwForm.newP))) {
      showToast("error", vi ? "Mật khẩu chưa đáp ứng đủ 4 yêu cầu bảo mật" : "Password doesn't meet all 4 security requirements")
      return
    }
    if (pwForm.newP !== pwForm.confirm) { showToast("error", vi ? "Xác nhận mật khẩu không khớp" : "Passwords don't match"); return }
    setPwSaving(true)
    const result = await changePasswordInDB(userId, pwForm.old, pwForm.newP)
    if (result.success) {
      setPwForm({ old: "", newP: "", confirm: "" })
      showToast("success", vi ? "Đổi mật khẩu thành công!" : "Password changed!")
    } else {
      showToast("error", result.error ?? "Lỗi")
    }
    setPwSaving(false)
  }

  // ── Avatar: pick file → open crop modal ───────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast("error", vi ? "Ảnh tối đa 5MB" : "Max 5MB"); return }
    const reader = new FileReader()
    reader.onload = ev => {
      setRawImage(ev.target?.result as string)
      setShowCrop(true)
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  // ── After crop: set preview ────────────────────────────────
  const handleCropDone = (croppedBase64: string) => {
    setAvatarPreview(croppedBase64)
    setAvatarChanged(true)
    setShowCrop(false)
    setRawImage(null)
  }

  // ── Save avatar via API route ──────────────────────────────
  const handleSaveAvatar = async () => {
    if (!avatarPreview || !avatarChanged) return
    if (!employeeId) {
      showToast("error", vi
        ? "Tài khoản quản trị hệ thống không thể lưu ảnh đại diện qua hồ sơ nhân viên."
        : "System admin avatar cannot be saved via employee profile.")
      return
    }
    setAvatarSaving(true)
    try {
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, imageData: avatarPreview }),
      })
      const json = await res.json()
      if (json.success) {
        setAvatarPreview(json.avatarPath)
        showToast("success", vi ? "Cập nhật ảnh đại diện thành công!" : "Avatar updated!")
        setAvatarChanged(false)
        window.dispatchEvent(new Event("axiom-user-updated"))
      } else {
        showToast("error", json.error ?? "Lỗi lưu ảnh")
      }
    } catch {
      showToast("error", vi ? "Lỗi kết nối server" : "Server error")
    }
    setAvatarSaving(false)
  }

  // ── Delete avatar (revert to default) ──────────────────────
  const handleDeleteAvatar = async () => {
    if (!employeeId) return
    if (!avatarPreview) { showToast("error", vi ? "Chưa có ảnh đại diện để xóa" : "No avatar to delete"); return }
    const confirmed = window.confirm(vi ? "Bạn có chắc muốn xóa ảnh đại diện? Ảnh sẽ trở về mặc định." : "Delete your avatar? It will revert to default.")
    if (!confirmed) return
    setAvatarSaving(true)
    try {
      const res = await fetch("/api/upload-avatar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })
      const json = await res.json()
      if (json.success) {
        setAvatarPreview(null)
        setAvatarChanged(false)
        showToast("success", vi ? "Đã xóa ảnh đại diện!" : "Avatar removed!")
        window.dispatchEvent(new Event("axiom-user-updated"))
      } else {
        showToast("error", json.error ?? "Lỗi xóa ảnh")
      }
    } catch {
      showToast("error", vi ? "Lỗi kết nối server" : "Server error")
    }
    setAvatarSaving(false)
  }

  const user = sessionUser
  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #F1F5F9", borderTopColor: "#D0211C", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, color: "#64748B" }}>Loading...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

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
          {vi ? "Quay lại" : "Back"}
        </button>
        <ChevronRight size={14} />
        <span style={{ color: th.text1, fontWeight: 600 }}>{vi ? "Hồ sơ cá nhân" : "My Profile"}</span>
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
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0, alignSelf: "flex-start", zIndex: 1 }}>
          <AvatarImg src={avatarPreview} alt={user.name} size={88} style={{
            border: "3px solid rgba(255,255,255,0.4)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }} />
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
            {vi ? user.roleLabel : user.roleLabelEn} · {user.department}
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
              {vi ? user.roleLabel : user.roleLabelEn}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid: Tabs + Content ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 20 }}>

        {/* Tab sidebar */}
        <div style={{
          background: th.cardBg, border: `1px solid ${th.cardBorder}`,
          borderRadius: 16, padding: isMobile ? "6px" : "12px",
          height: isMobile ? "auto" : "fit-content",
          boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
          display: isMobile ? "grid" : "block",
          gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : undefined,
          gap: isMobile ? 6 : undefined,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 8,
                padding: isMobile ? "10px 8px" : "11px 14px",
                borderRadius: 10, border: "none",
                background: tab === t.id
                  ? "linear-gradient(135deg, rgba(208,33,28,0.12), rgba(153,20,20,0.08))"
                  : "none",
                cursor: "pointer", textAlign: isMobile ? "center" : "left",
                marginBottom: isMobile ? 0 : 4,
                color: tab === t.id ? "#D0211C" : th.text2,
                fontSize: isMobile ? 11.5 : 13, fontWeight: tab === t.id ? 700 : 400,
                fontFamily: "inherit", transition: "all .15s",
                borderLeft: isMobile ? "none" : (tab === t.id ? "3px solid #D0211C" : "3px solid transparent"),
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              {t.icon}
              <span>{vi ? t.label : t.labelEn}</span>
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
                {vi ? "Thông tin cá nhân" : "Personal Information"}
              </h2>

              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>{vi ? "Họ và tên" : "Full Name"}</label>
                    <input style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} value={infoForm.name} readOnly />
                  </div>
                  <div>
                    <label style={labelStyle}>{vi ? "Mã nhân viên" : "Employee ID"}</label>
                    <input style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} value={user.id} readOnly />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Email <span style={{ color: "#EF4444" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        style={{ ...inputStyle, paddingLeft: 38 }}
                        value={infoForm.email} type="email"
                        onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="example@gmail.com"
                        onFocus={e => (e.target.style.borderColor = "#D0211C")}
                        onBlur={e => (e.target.style.borderColor = th.inputBorder)}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{vi ? "Số điện thoại" : "Phone"}</label>
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
                    <label style={labelStyle}>{vi ? "Phòng ban" : "Department"}</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input style={{ ...inputStyle, paddingLeft: 38, opacity: 0.6, cursor: "not-allowed" }} value={user.department} readOnly />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{vi ? "Chức vụ" : "Position"}</label>
                    <div style={{ position: "relative" }}>
                      <Briefcase size={15} color={th.text2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                      <input style={{ ...inputStyle, paddingLeft: 38, opacity: 0.6, cursor: "not-allowed" }} value={vi ? user.roleLabel : user.roleLabelEn} readOnly />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
                  {!employeeId ? (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                      borderRadius: 10, background: dark ? "rgba(59,130,246,0.12)" : "#EFF6FF",
                      border: "1px solid #BFDBFE", fontSize: 13, color: dark ? "#93C5FD" : "#1D4ED8",
                    }}>
                      <Shield size={15}/>
                      {vi
                        ? "Tài khoản quản trị — hồ sơ được quản lý bởi hệ thống"
                        : "System admin account — profile managed by system"}
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveInfo}
                      disabled={infoSaving}
                      style={{ ...btnPrimary, opacity: infoSaving ? 0.7 : 1 }}
                      onMouseEnter={e => !infoSaving && ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
                    >
                      <Save size={15} />
                      {infoSaving ? (vi ? "Đang lưu..." : "Saving...") : (vi ? "Lưu thay đổi" : "Save Changes")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Mật khẩu ── */}
          {tab === "password" && (
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: th.text1, display: "flex", alignItems: "center", gap: 10 }}>
                <Lock size={20} color="#D0211C" />
                {vi ? "Đổi mật khẩu" : "Change Password"}
              </h2>
              <p style={{ margin: "0 0 28px", color: th.text2, fontSize: 13 }}>
                {vi ? "Mật khẩu mới phải đáp ứng đầy đủ 4 yêu cầu bảo mật bên dưới." : "New password must meet all 4 security requirements below."}
              </p>

              <div style={{ display: "grid", gap: 18, maxWidth: 440 }}>
                <div>
                  <label style={labelStyle}>{vi ? "Mật khẩu hiện tại" : "Current Password"} <span style={{ color: "#EF4444" }}>*</span></label>
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

                <div>
                  <label style={labelStyle}>{vi ? "Mật khẩu mới" : "New Password"} <span style={{ color: "#EF4444" }}>*</span></label>
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
                  {(() => {
                    const REQS: { label: string; labelEn: string; test: (v: string) => boolean }[] = [
                      { label: "Ít nhất 8 ký tự",             labelEn: "At least 8 characters",    test: v => v.length >= 8 },
                      { label: "Ít nhất 1 chữ hoa",           labelEn: "At least 1 uppercase",      test: v => /[A-Z]/.test(v) },
                      { label: "Ít nhất 1 chữ số",            labelEn: "At least 1 number",         test: v => /[0-9]/.test(v) },
                      { label: "Ít nhất 1 ký tự đặc biệt (!@#...)", labelEn: "At least 1 special char (!@#...)", test: v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v) },
                    ]
                    const COLORS = ["#EF4444", "#F97316", "#EAB308", "#22C55E"]
                    const LABELS = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"]
                    const LABELS_EN = ["Very weak", "Weak", "Medium", "Strong", "Very strong"]
                    const score  = REQS.filter(r => r.test(pwForm.newP)).length
                    return (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                          {[0,1,2,3].map(i => (
                            <div key={i} style={{
                              flex: 1, height: 5, borderRadius: 3,
                              background: i < score ? COLORS[score - 1] : th.tableBorder,
                              transition: "background .3s",
                            }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: score > 0 ? COLORS[score - 1] : th.text2, marginBottom: 8 }}>
                          {score === 0 ? (vi ? "Nhập mật khẩu..." : "Typing...") : (vi ? LABELS[score] : LABELS_EN[score])}
                        </div>
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
                                <span style={{ fontWeight: ok ? 600 : 400 }}>{vi ? req.label : req.labelEn}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div>
                  <label style={labelStyle}>{vi ? "Xác nhận mật khẩu" : "Confirm Password"} <span style={{ color: "#EF4444" }}>*</span></label>
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
                      {vi ? "Mật khẩu không khớp" : "Passwords don't match"}
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
                    {pwSaving ? (vi ? "Đang lưu..." : "Saving...") : (vi ? "Đổi mật khẩu" : "Change Password")}
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
                {vi ? "Ảnh đại diện" : "Profile Photo"}
              </h2>
              <p style={{ margin: "0 0 28px", color: th.text2, fontSize: 13 }}>
                {vi
                  ? "Chọn ảnh JPG, PNG hoặc WebP. Tối đa 5MB. Bạn có thể kéo & phóng ảnh để vừa khung tròn."
                  : "Choose JPG, PNG, or WebP. Max 5MB. You can drag & zoom to fit the circular frame."}
              </p>

              <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Preview */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <AvatarImg src={avatarPreview} alt="Preview" size={140} style={{
                    border: `3px solid ${th.cardBorder}`,
                    boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.12)",
                  }} />
                  <div style={{ fontSize: 12, color: th.text2, textAlign: "center" }}>
                    {vi ? "Xem trước" : "Preview"}
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
                      {vi ? "Nhấn để chọn ảnh" : "Click to choose photo"}
                    </div>
                    <div style={{ color: th.text2, fontSize: 12, marginBottom: 8 }}>
                      JPG, PNG, WebP · {vi ? "Tối đa" : "Max"} 5MB
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: dark ? "rgba(208,33,28,0.15)" : "rgba(208,33,28,0.08)",
                      color: "#D0211C", borderRadius: 8, padding: "6px 12px",
                      fontSize: 12, fontWeight: 600,
                    }}>
                      <Crop size={13} />
                      {vi ? "Hỗ trợ cắt & di chuyển ảnh" : "Crop & pan support"}
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      onClick={handleSaveAvatar}
                      disabled={avatarSaving || !avatarChanged}
                      style={{ ...btnPrimary, opacity: (avatarSaving || !avatarChanged) ? 0.5 : 1, cursor: !avatarChanged ? "not-allowed" : "pointer" }}
                    >
                      <Save size={15} />
                      {avatarSaving
                        ? (vi ? "Đang lưu..." : "Saving...")
                        : (vi ? "Lưu ảnh" : "Save Photo")}
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
                        {vi ? "Huỷ" : "Cancel"}
                      </button>
                    )}
                    {/* Nút xóa ảnh đại diện — chỉ hiện khi có ảnh hiện tại (không phải đang chọn mới) */}
                    {avatarPreview && !avatarChanged && (
                      <button
                        onClick={handleDeleteAvatar}
                        disabled={avatarSaving}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 20px", borderRadius: 10,
                          border: `1.5px solid #FECACA`,
                          background: dark ? "rgba(239,68,68,0.1)" : "#FEF2F2",
                          cursor: avatarSaving ? "not-allowed" : "pointer",
                          fontSize: 14, fontWeight: 600,
                          color: "#EF4444", fontFamily: "inherit",
                          transition: "all .15s",
                          opacity: avatarSaving ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { if (!avatarSaving) { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff" } }}
                        onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#FEF2F2"; e.currentTarget.style.color = "#EF4444" }}
                      >
                        <Trash2 size={15} />
                        {vi ? "Xóa ảnh" : "Remove"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Crop Modal ── */}
      {showCrop && rawImage && (
        <AvatarCropModal
          imageSrc={rawImage}
          dark={dark}
          vi={vi}
          onSave={handleCropDone}
          onCancel={() => { setShowCrop(false); setRawImage(null) }}
        />
      )}

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
