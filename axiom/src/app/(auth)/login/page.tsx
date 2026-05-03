"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Sun, Moon, ArrowRight, TrendingUp, Users, Shield, Zap, Clock, Briefcase } from "lucide-react"
import { signIn } from "next-auth/react"

/* ═══════════════════════════════════════
   PALETTE — bangmau.md
   primary  : #D32F2F
   dark     : #9A0007
   light    : #FF6659
   bg       : #FDF3F4
   textMain : #333333
   textMuted: #888888
   border   : #E0E0E0
═══════════════════════════════════════ */

const i18n = {
  vi: {
    online: "Hệ thống trực tuyến",
    badge: "Nền tảng hàng đầu 2026",
    h1a: "Vận hành bằng logic.",
    h1b: "Bứt phá bằng đam mê.",
    sub: "AXIOM kết hợp đội nhóm, công cụ và quy trình của bạn thành một trải nghiệm liền mạch.",
    s1n: "Real-time", s1l: "Chấm công",
    s2n: "Tự động", s2l: "Tính lương",
    s3n: "Excel", s3l: "Xuất báo cáo",
    cardBadge: "Xác thực tài khoản",
    cardTitle: "Đăng nhập AXIOM",
    cardSub: "Chào mừng trở lại — nhập thông tin của bạn",
    idLabel: "Mã nhân viên",
    idPh: "NV000, GD001, KT001…",
    pwLabel: "Mật khẩu",
    pwPh: "Mật khẩu",
    forgot: "Quên mật khẩu?",
    btn: "Đăng nhập",
    loading: "Đang xử lý…",
    noAcc: "Cần hỗ trợ tài khoản?",
    contact: "Liên hệ IT →",
    errCred: "Mã nhân viên hoặc mật khẩu không đúng.",
    errGen: "Có lỗi xảy ra, vui lòng thử lại.",
    chart1: "Quản lý lương", chart1v: "T1-T2/26",
    chart2: "5 Phòng ban", chart2v: "IT • HR • KD • KT • HC", chart2s: "Hoạt động",
    flag: "/images/CoVietNam.png", lang: "VI",
    // Forgot password
    fpTitle: "Quên mật khẩu",
    fpSub: "Nhập Gmail cá nhân của bạn — hệ thống sẽ gửi mật khẩu tạm thời.",
    fpEmailLabel: "Gmail cá nhân",
    fpEmailPh: "tenban@gmail.com",
    fpBtn: "Gửi mật khẩu tạm thời",
    fpLoading: "Đang gửi…",
    fpBack: "← Quay lại đăng nhập",
    fpSuccessTitle: "Email đã được gửi!",
    fpSuccessSub: "Kiểm tra Gmail cá nhân của bạn — mật khẩu tạm thời sẽ đến trong vài giây.",
    fpSuccessBtn: "Đăng nhập ngay",
    fpErrNotFound: "Gmail này chưa được liên kết với tài khoản nào trong hệ thống.",
    fpErrGen: "Không thể gửi email. Vui lòng thử lại.",
    fpReq1: "Định dạng email hợp lệ",
    fpReq2: "Sử dụng Gmail cá nhân (@gmail.com)",
    fpReq3: "Tên người dùng ≥ 3 ký tự",
    fpReq4: "Không chứa khoảng trắng",
  },
  en: {
    online: "System Online",
    badge: "Leading Platform 2026",
    h1a: "Driven by Logic.",
    h1b: "Fueled by Passion.",
    sub: "AXIOM brings your teams, tools and processes together into one seamless experience.",
    s1n: "Real-time", s1l: "Attendance",
    s2n: "Auto", s2l: "Payroll Calc",
    s3n: "Excel", s3l: "Report Export",
    cardBadge: "Account Verification",
    cardTitle: "Sign in to AXIOM",
    cardSub: "Welcome back — enter your credentials",
    idLabel: "Employee ID",
    idPh: "NV000, GD001, KT001…",
    pwLabel: "Password",
    pwPh: "Password",
    forgot: "Forgot password?",
    btn: "Sign In",
    loading: "Processing…",
    noAcc: "Need account support?",
    contact: "Contact IT →",
    errCred: "Invalid employee ID or password.",
    errGen: "An error occurred. Please try again.",
    chart1: "Payroll Management", chart1v: "Jan-Feb",
    chart2: "5 Departments", chart2v: "IT • HR • BD • AC • GA", chart2s: "Active",
    flag: "/images/coanh.png", lang: "EN",
    // Forgot password
    fpTitle: "Forgot Password",
    fpSub: "Enter your personal Gmail — we'll send a temporary password to your inbox.",
    fpEmailLabel: "Personal Gmail",
    fpEmailPh: "yourname@gmail.com",
    fpBtn: "Send Temporary Password",
    fpLoading: "Sending…",
    fpBack: "← Back to Sign In",
    fpSuccessTitle: "Email Sent!",
    fpSuccessSub: "Check your personal Gmail — your temporary password will arrive in seconds.",
    fpSuccessBtn: "Sign In Now",
    fpErrNotFound: "This Gmail is not linked to any account in the system.",
    fpErrGen: "Unable to send email. Please try again.",
    fpReq1: "Valid email format",
    fpReq2: "Must be a personal Gmail address (@gmail.com)",
    fpReq3: "Username ≥ 3 characters",
    fpReq4: "No whitespace allowed",
  },
} as const
type Lang = keyof typeof i18n

/* Fake mini bar chart for decoration */
const BARS = [40, 65, 45, 80, 55, 90, 70, 95, 60, 85]

type View = "login" | "forgot" | "sent"

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>("vi")
  const [dark, setDark] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [focusId, setFocusId] = useState<"id" | "pw" | null>(null)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Forgot password state
  const [view, setView] = useState<View>("login")
  const [prevView, setPrevView] = useState<View>("login")
  const [fpEmail, setFpEmail] = useState("")
  const [fpError, setFpError] = useState("")
  const [fpLoading, setFpLoading] = useState(false)
  const [fpFocused, setFpFocused] = useState(false)

  const t = i18n[lang]

  // Email validation — 4 security requirements
  const emailReqs = [
    { label: t.fpReq1, ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fpEmail) },
    { label: t.fpReq2, ok: fpEmail.toLowerCase().endsWith("@gmail.com") },
    { label: t.fpReq3, ok: fpEmail.split("@")[0].length >= 3 },
    { label: t.fpReq4, ok: fpEmail.length > 0 && !fpEmail.includes(" ") },
  ]
  const emailValid = emailReqs.every(r => r.ok)

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

  /* ── Canvas: star particles ── */
  useEffect(() => {
    if (!dark) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }))

    let raf = 0, frame = 0
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const opacity = s.o * (0.6 + 0.4 * Math.sin(frame * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${opacity})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [dark])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      const res = await signIn("credentials", { username: username.trim(), password, redirect: false })
      if (res?.error) { setLoading(false); setError(t.errCred) }
      else if (res?.ok) {
        const { getSession } = await import("next-auth/react")
        const session = await getSession()
        router.push((session?.user as any)?.dashboardPath ?? "/dashboard")
        router.refresh()
      }
    } catch { setLoading(false); setError(t.errGen) }
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValid) return
    setFpError(""); setFpLoading(true)
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim().toLowerCase() }),
      })
      if (res.ok) {
        setView("sent")
      } else {
        const data = await res.json().catch(() => ({}))
        setFpError(data?.error === "not_found" ? t.fpErrNotFound : t.fpErrGen)
      }
    } catch {
      setFpError(t.fpErrGen)
    } finally {
      setFpLoading(false)
    }
  }

  function goForgot() {
    setError("")
    setFpError("")
    setFpEmail("")
    setPrevView("login")
    setView("forgot")
  }

  function goLogin() {
    setFpError("")
    setFpEmail("")
    setPrevView(view)
    setView("login")
  }

  /* ── Theme tokens ── */
  const bg = dark ? "#100505" : "#FDF3F4"
  const surface = dark ? "#1a0808" : "#FFFFFF"
  const cardBg = dark ? "#1f0d0d" : "#FFFFFF"
  const cardBorder = dark ? "#3a1616" : "#F0F0F0"
  const text1 = dark ? "#F8F0EE" : "#333333"
  const text2 = dark ? "rgba(248,240,238,0.55)" : "#888888"
  const inputBg = dark ? "#160a0a" : "#FAFAFA"
  const inputBd = dark ? "#351414" : "#E0E0E0"
  const ctrlBd = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"
  const statBg = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"
  const statBd = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)"
  const miniCardBg = dark ? "#1c0b0b" : "#FFFFFF"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        html, body { height:100%; font-family:'Inter',system-ui,sans-serif; background:${bg}; transition:background .4s; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background: rgba(211,47,47,.2); border-radius:2px; }

        /* ── Input ── */
        .inp {
          width:100%; height:46px;
          padding: 0 44px 0 14px;
          font:14px/1 'Inter',system-ui;
          background: ${inputBg};
          color: ${text1};
          border: 1.5px solid ${inputBd};
          border-radius:10px;
          outline:none;
          transition: border-color .2s, box-shadow .2s, background .4s, color .4s;
          -webkit-appearance:none;
        }
        .inp.nop { padding-right:14px; }
        .inp::placeholder { color: ${dark ? "rgba(255,255,255,0.2)" : "#BBBBBB"}; }
        .inp:focus {
          border-color: #D32F2F;
          box-shadow: 0 0 0 3px rgba(211,47,47,${dark ? ".16" : ".10"});
        }

        /* ── Noise overlay ── */
        .noise {
          position:fixed; inset:0; pointer-events:none; z-index:1;
          opacity:${dark ? ".04" : ".025"};
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
          transition:opacity .4s;
        }

        /* ── Light mode dot grid ── */
        .dotgrid {
          position:fixed; inset:0; pointer-events:none; z-index:1;
          opacity:${dark ? "0" : ".35"};
          background-image: radial-gradient(rgba(211,47,47,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          transition:opacity .4s;
        }

        /* ── Keyframes ── */
        @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes slideR      { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
        @keyframes sweep       { 0%{transform:translateX(-250%)} 40%,100%{transform:translateX(250%)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes floatUp     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(0deg)} }
        @keyframes floatUp2    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(0deg)} }
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes barGrow     { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes tilt1       { 0%,100%{transform:translateY(0px) rotate(-12deg)} 50%{transform:translateY(-12px) rotate(-8deg)} }
        @keyframes tilt2       { 0%,100%{transform:translateY(0px) rotate(5deg)}  50%{transform:translateY(-10px) rotate(7deg)} }
        @keyframes tilt3       { 0%,100%{transform:translateY(0px) rotate(4deg)}  50%{transform:translateY(-8px)  rotate(2deg)} }
        @keyframes tilt4       { 0%,100%{transform:translateY(0px) rotate(-6deg)} 50%{transform:translateY(-14px) rotate(-4deg)} }
        @keyframes gradMove    { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes slideOutUp  { 0%{opacity:1;transform:translateY(0) scale(1)} 50%{opacity:.4} 100%{opacity:0;transform:translateY(-32px) scale(.98)} }
        @keyframes slideInUp   { 0%{opacity:0;transform:translateY(32px) scale(.98)} 50%{opacity:.5} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideOutDn  { 0%{opacity:1;transform:translateY(0) scale(1)} 50%{opacity:.4} 100%{opacity:0;transform:translateY(32px) scale(.98)} }
        @keyframes slideInDn   { 0%{opacity:0;transform:translateY(-32px) scale(.98)} 50%{opacity:.5} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes checkPop    { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }

        /* ── Round Checkbox ── */
        .ax-round-chk {
          appearance:none; -webkit-appearance:none;
          width:18px; height:18px; border-radius:50%;
          border: 1.5px solid ${dark ? "rgba(255,255,255,.3)" : "#BBBBBB"};
          background:transparent;
          cursor:pointer; flex-shrink:0;
          position:relative; transition:all .18s;
        }
        .ax-round-chk:checked {
          background: #D32F2F;
          border-color: #D32F2F;
          box-shadow: 0 0 0 3px rgba(211,47,47,.18);
        }
        .ax-round-chk:checked::after {
          content:'';
          position:absolute; top:3px; left:5.5px;
          width:4px; height:8px;
          border:2px solid #fff;
          border-top:none; border-left:none;
          transform:rotate(45deg);
        }

        ::selection { background:rgba(211,47,47,.22); }

        @media (max-width:900px) {
          .left-col { display:none !important; }
          .right-col { flex:1 !important; display:flex !important; align-items:center !important; justify-content:center !important; padding:80px 24px 32px !important; }
        }
      `}</style>

      {/* ── Canvas particles (dark only) ── */}
      <canvas ref={canvasRef} style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        opacity: dark ? 1 : 0, transition: "opacity .4s",
      }} />
      <div className="noise" />
      <div className="dotgrid" />

      {/* ── Radial glow — dark mode ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: dark
          ? "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(211,47,47,0.08) 0%, transparent 65%)"
          : "radial-gradient(ellipse 60% 55% at 20% 50%, rgba(211,47,47,0.05) 0%, transparent 65%)",
        transition: "background .4s",
      }} />


      {/* ════════════════════════════════════
          BODY
      ════════════════════════════════════ */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        position: "relative", zIndex: 2,
      }}>

        {/* ════ LEFT COLUMN ════ */}
        <div className="left-col" style={{
          flex: "0 1 560px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 24px",
          position: "relative",
          alignSelf: "stretch",
        }}>


          {/* H1 */}
          <h1 style={{
            fontSize: "clamp(26px,3vw,42px)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-.035em",
            color: text1,
            marginBottom: 18,
            transition: "color .4s",
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeUp .6s cubic-bezier(.22,1,.36,1) .18s both" : "none",
          }}>
            {t.h1a}<br />
            {t.h1b}
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 15, color: text2, lineHeight: 1.65, maxWidth: 400,
            marginBottom: 36, fontWeight: 400,
            transition: "color .4s",
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeUp .6s cubic-bezier(.22,1,.36,1) .26s both" : "none",
          }}>
            {t.sub}
          </p>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: 0,
            marginBottom: 40,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fadeUp .6s cubic-bezier(.22,1,.36,1) .34s both" : "none",
          }}>
            {([
              { icon: <Users size={14} />, val: t.s1n, lab: t.s1l },
              { icon: <Zap size={14} />, val: t.s2n, lab: t.s2l },
              { icon: <Shield size={14} />, val: t.s3n, lab: t.s3l },
            ] as const).map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 9,
                paddingRight: i < 2 ? 28 : 0,
                marginRight: i < 2 ? 28 : 0,
                borderRight: i < 2 ? `1px solid ${statBd}` : "none",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: statBg,
                  border: `1px solid ${statBd}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#D32F2F",
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: text1, letterSpacing: "-.02em", lineHeight: 1, transition: "color .4s" }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 11.5, color: text2, fontWeight: 400, marginTop: 2, transition: "color .4s" }}>
                    {s.lab}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── 4 Floating cards at corners ── */}

          {/* TOP-LEFT: Quản lý lương */}
          <div style={{
            position: "absolute", top: "15%", left: -60,
            background: miniCardBg, border: `1.5px solid ${dark ? "#2a1010" : "#F0F0F0"}`,
            borderRadius: 14, padding: "12px 14px", width: 178,
            boxShadow: dark ? "0 8px 28px rgba(0,0,0,.5)" : "0 8px 28px rgba(0,0,0,.1)",
            animation: "tilt1 7s ease-in-out infinite",
            transition: "background .4s, border-color .4s",
            opacity: mounted ? 1 : 0,
          }}>
            {/* Logo + labels cùng hàng */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(211,47,47,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <TrendingUp size={18} style={{ color: "#D32F2F" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#D32F2F", background: "rgba(211,47,47,0.1)", padding: "2px 7px", borderRadius: 99, alignSelf: "flex-start" }}>
                  {t.chart1v}
                </span>
                <div style={{ fontSize: 11, fontWeight: 700, color: text1, transition: "color .4s", whiteSpace: "nowrap" }}>{t.chart1}</div>
              </div>
            </div>
            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 26 }}>
              {BARS.slice(0, 7).map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: 2,
                  background: i === 6 ? "#D32F2F" : dark ? "rgba(211,47,47,0.3)" : "rgba(211,47,47,0.18)",
                  transition: "background .4s"
                }} />
              ))}
            </div>
          </div>

          {/* TOP-RIGHT: 5 Phòng ban */}
          <div style={{
            position: "absolute", top: "16%", right: 0,
            background: miniCardBg, border: `1.5px solid ${dark ? "#2a1010" : "#F0F0F0"}`,
            borderRadius: 14, padding: "12px 14px", width: 158,
            boxShadow: dark ? "0 8px 28px rgba(0,0,0,.5)" : "0 8px 28px rgba(0,0,0,.1)",
            animation: "tilt2 9s ease-in-out 0.6s infinite",
            transition: "background .4s, border-color .4s",
            opacity: mounted ? 1 : 0,
          }}>
            {/* Stacked overlapping avatars */}
            <div style={{ display: "flex", marginBottom: 10 }}>
              {(lang === "vi" ? ["IT", "HR", "KD", "KT", "HC"] : ["IT", "HR", "BD", "AC", "GA"]).map((d, i) => (
                <span key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: ["#FF6659", "#D32F2F", "#9A0007", "#c44040", "rgba(211,47,47,.6)"][i],
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, color: "#fff",
                  marginLeft: i === 0 ? 0 : -9,
                  border: `2px solid ${miniCardBg}`,
                  position: "relative", zIndex: 5 - i,
                  transition: "border-color .4s",
                }}>{d}</span>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: text1, transition: "color .4s" }}>{lang === "vi" ? "5 Phòng ban" : "5 Departments"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 9.5, color: "#16A34A", fontWeight: 600 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#16A34A", animation: "blink 2s infinite" }} />
              {t.chart2s}
            </div>
          </div>

          {/* BOTTOM-LEFT: Chấm công */}
          <div style={{
            position: "absolute", bottom: "23%", left: -55,
            background: miniCardBg, border: `1.5px solid ${dark ? "#2a1010" : "#F0F0F0"}`,
            borderRadius: 14, padding: "12px 14px", width: 148,
            boxShadow: dark ? "0 8px 28px rgba(0,0,0,.5)" : "0 8px 28px rgba(0,0,0,.1)",
            animation: "tilt3 8s ease-in-out 1.2s infinite",
            transition: "background .4s, border-color .4s",
            opacity: mounted ? 1 : 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(211,47,47,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock size={13} style={{ color: "#D32F2F" }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: text1, letterSpacing: "-.02em" }}>98.5%</div>
            </div>
            <div style={{ fontSize: 10, color: text2 }}>{lang === "vi" ? "Tỷ lệ chấm công" : "Attendance Rate"}</div>
            <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
              <div style={{ width: "98.5%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FF6659,#D32F2F)" }} />
            </div>
          </div>

          {/* BOTTOM-RIGHT: Xuất phiếu lương */}
          <div style={{
            position: "absolute", bottom: "24%", right: 0,
            background: miniCardBg, border: `1.5px solid ${dark ? "#2a1010" : "#F0F0F0"}`,
            borderRadius: 14, padding: "12px 14px", width: 158,
            boxShadow: dark ? "0 8px 28px rgba(0,0,0,.5)" : "0 8px 28px rgba(0,0,0,.1)",
            animation: "tilt4 10s ease-in-out 0.3s infinite",
            transition: "background .4s, border-color .4s",
            opacity: mounted ? 1 : 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(211,47,47,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Shield size={13} style={{ color: "#D32F2F" }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: text1 }}>{lang === "vi" ? "Phiếu lương" : "Payslip"}</div>
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
              {["PDF", "XLSX"].map((f, i) => (
                <span key={i} style={{
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  background: i === 0 ? "#D32F2F" : "#9A0007",
                  padding: "3px 8px", borderRadius: 99
                }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN — Single fixed card ════ */}
        <div className="right-col" style={{
          flex: "0 0 360px",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "slideR .7s cubic-bezier(.22,1,.36,1) .2s both" : "none",
        }}>
          <div style={{
            width: "100%",
            position: "relative",
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: dark
              ? "0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)"
              : "0 20px 50px rgba(0,0,0,.08)",
            transition: "background .4s, border-color .4s, box-shadow .4s",
          }}>
            {/* ── Red top accent bar (static) ── */}
            <div style={{
              height: 3,
              backgroundImage: "linear-gradient(90deg,#FF6659,#D32F2F,#9A0007,#FF4444,#FF6659)",
              backgroundSize: "300% 100%",
              animation: "gradMove 2s linear infinite",
            }} />

            {/* ── Controls: lang + theme (static) ── */}
            <div style={{
              position: "absolute", top: 14, right: 16,
              display: "flex", gap: 6, alignItems: "center",
              zIndex: 10,
            }}>
              <button onClick={() => setLang(l => l === "vi" ? "en" : "vi")} style={{
                display: "flex", alignItems: "center", gap: 5,
                height: 26, padding: "0 9px", borderRadius: 99,
                border: `1px solid ${ctrlBd}`,
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                fontSize: 11, fontWeight: 600, color: text2,
                cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(211,47,47,.5)"; e.currentTarget.style.color = "#D32F2F" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ctrlBd; e.currentTarget.style.color = text2 }}
              >
                <Image src={t.flag} alt={t.lang} width={13} height={9} style={{ borderRadius: 2, objectFit: "cover" }} />
                {t.lang}
              </button>
              <button onClick={() => setDark(d => !d)} style={{
                width: 26, height: 26, borderRadius: "50%",
                border: `1px solid ${ctrlBd}`,
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                color: text2, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all .2s", flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(211,47,47,.5)"; e.currentTarget.style.color = "#D32F2F" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ctrlBd; e.currentTarget.style.color = text2 }}
              >
                {dark ? <Sun size={12} /> : <Moon size={12} />}
              </button>
            </div>

            <div style={{ padding: "16px 20px 20px" }}>
              {/* ── Logo + Brand (static) ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingRight: 90 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(140deg,#FF6659,#9A0007)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(154,0,7,0.35)", flexShrink: 0,
                }}>
                  <Image src="/images/LogoAXIOM.png" alt="AXIOM" width={32} height={32}
                    style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 20, fontWeight: 900, letterSpacing: 5,
                    background: "linear-gradient(135deg,#FF6659 0%,#D32F2F 45%,#9A0007 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", lineHeight: 1, fontStyle: "italic",
                  }}>AXIOM</div>
                  <div style={{ fontSize: 10, color: text2, fontWeight: 500, letterSpacing: .4, marginTop: 3, transition: "color .4s" }}>
                    {lang === "vi" ? "Hệ thống quản lý nhân sự" : "Human Resource Management"}
                  </div>
                </div>
              </div>

              {/* ── Divider (static) ── */}
              <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", marginBottom: 0 }} />

              {/* ══ SLIDING CONTENT AREA — only this part moves ══ */}
              <div style={{ position: "relative", overflow: "hidden", minHeight: 310 }}>

                {/* ── LOGIN FORM (slides out up / back in from top) ── */}
                <div style={{
                  paddingTop: 18,
                  pointerEvents: view === "login" ? "auto" : "none",
                  willChange: view !== "login" || prevView !== "login" ? "transform, opacity" : "auto",
                  animation: !mounted
                    ? "none"
                    : view === "login" && prevView !== "login"
                      ? "slideInDn .7s cubic-bezier(.22,.68,0,1) both"
                      : view !== "login" && prevView === "login"
                        ? "slideOutUp .55s cubic-bezier(.4,0,.2,1) both"
                        : "none",
                }}>
                  <p style={{ fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
                    <span style={{ color: text2, transition: "color .4s" }}>
                      {lang === "vi" ? "Chào mừng trở lại, " : "Welcome back, "}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      background: "linear-gradient(90deg,#FF6659,#D32F2F)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {lang === "vi" ? "Cộng sự" : "Partner"}
                    </span>
                    <span style={{ color: text2, transition: "color .4s" }}> !</span>
                  </p>

                  <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: focusId === "id" ? "#D32F2F" : text2, marginBottom: 6, letterSpacing: .3, transition: "color .2s" }}>
                        {t.idLabel}
                      </label>
                      <input id="login-username" className="inp nop" type="text" required autoComplete="username"
                        placeholder={t.idPh} value={username} onChange={e => setUsername(e.target.value)}
                        onFocus={() => setFocusId("id")} onBlur={() => setFocusId(null)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: focusId === "pw" ? "#D32F2F" : text2, marginBottom: 6, letterSpacing: .3, transition: "color .2s" }}>
                        {t.pwLabel}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input id="login-password" className="inp" type={showPw ? "text" : "password"} required autoComplete="current-password"
                          placeholder={t.pwPh} value={password} onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocusId("pw")} onBlur={() => setFocusId(null)} />
                        <button type="button" onClick={() => setShowPw(v => !v)} style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer",
                          color: dark ? "rgba(255,255,255,.25)" : "#AAAAAA", display: "flex", padding: 4, transition: "color .2s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = "#D32F2F"}
                          onMouseLeave={e => e.currentTarget.style.color = dark ? "rgba(255,255,255,.25)" : "#AAAAAA"}
                        >
                          {showPw ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: -4 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: text2, cursor: "pointer", userSelect: "none", transition: "color .4s" }}>
                        <input type="checkbox" className="ax-round-chk" />
                        {lang === "vi" ? "Ghi nhớ đăng nhập" : "Remember me"}
                      </label>
                      <button type="button" onClick={goForgot} style={{
                        fontSize: 12.5, fontWeight: 500, color: text2, background: "none", border: "none",
                        cursor: "pointer", padding: 0, fontFamily: "inherit", transition: "color .2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = "#D32F2F"}
                        onMouseLeave={e => e.currentTarget.style.color = text2}
                      >{t.forgot}</button>
                    </div>
                    {error && (
                      <div style={{
                        padding: "10px 14px", background: dark ? "rgba(211,47,47,0.08)" : "#FFF5F5",
                        borderTop: `1px solid rgba(211,47,47,${dark ? .2 : .15})`, borderRight: `1px solid rgba(211,47,47,${dark ? .2 : .15})`, borderBottom: `1px solid rgba(211,47,47,${dark ? .2 : .15})`, borderLeft: "3px solid #D32F2F",
                        borderRadius: 8, fontSize: 12.5, color: dark ? "#fca5a5" : "#9A0007",
                        display: "flex", gap: 8, alignItems: "center",
                      }}>
                        <span style={{ flexShrink: 0 }}>⚠️</span>{error}
                      </div>
                    )}
                    <button id="login-submit" type="submit" disabled={loading} style={{
                      width: "100%", height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      backgroundImage: "linear-gradient(135deg,#FF6659 0%,#D32F2F 35%,#9A0007 65%,#FF6659 100%)",
                      backgroundSize: "300% 100%", animation: loading ? "none" : "gradMove 2.5s linear infinite",
                      color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                      cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 18px rgba(154,0,7,.3)",
                      transition: "all .25s cubic-bezier(.22,1,.36,1)", position: "relative", overflow: "hidden", marginTop: 4,
                    }}
                      onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(154,0,7,.4)" } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(154,0,7,.3)" }}
                    >
                      {!loading && <span style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(100deg,transparent 35%,rgba(255,255,255,0.15) 50%,transparent 65%)", animation: "sweep 3.5s ease-in-out infinite" }} />}
                      {loading ? <span style={{ width: 17, height: 17, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .65s linear infinite", display: "inline-block" }} /> : <>{t.btn}</>}
                    </button>
                  </form>
                </div>

                {/* ── FORGOT / SENT FORM (slides in from below / out downward) ── */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  paddingTop: 18,
                  pointerEvents: view !== "login" ? "auto" : "none",
                  visibility: (view === "login" && prevView === "login") ? "hidden" : "visible",
                  willChange: view !== "login" || prevView !== "login" ? "transform, opacity" : "auto",
                  animation: !mounted
                    ? "none"
                    : view !== "login" && prevView === "login"
                      ? "slideInUp .7s cubic-bezier(.22,.68,0,1) both"
                      : view === "login" && prevView !== "login"
                        ? "slideOutDn .55s cubic-bezier(.4,0,.2,1) both"
                        : "none",
                }}>
                  {view === "sent" ? (
                    <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: "linear-gradient(135deg,#FF6659,#D32F2F)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(211,47,47,.35)",
                        animation: "checkPop .5s cubic-bezier(.34,1.56,.64,1) both",
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: text1, marginBottom: 8, transition: "color .4s" }}>{t.fpSuccessTitle}</div>
                      <div style={{ fontSize: 12.5, color: text2, lineHeight: 1.6, marginBottom: 20, transition: "color .4s" }}>{t.fpSuccessSub}</div>
                      <button onClick={goLogin} style={{
                        width: "100%", height: 42,
                        backgroundImage: "linear-gradient(135deg,#FF6659,#D32F2F,#9A0007)",
                        backgroundSize: "300% 100%", animation: "gradMove 2.5s linear infinite",
                        color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 18px rgba(154,0,7,.3)",
                      }}>{t.fpSuccessBtn}</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: text1, marginBottom: 4, transition: "color .4s" }}>{t.fpTitle}</div>
                        <div style={{ fontSize: 12, color: text2, lineHeight: 1.55, transition: "color .4s" }}>{t.fpSub}</div>
                      </div>
                      <form onSubmit={submitForgot} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: fpFocused ? "#D32F2F" : text2, marginBottom: 6, letterSpacing: .3, transition: "color .2s" }}>
                            {t.fpEmailLabel}
                          </label>
                          <input id="fp-email" className="inp nop" type="email" required autoComplete="email"
                            placeholder={t.fpEmailPh} value={fpEmail}
                            onChange={e => { setFpEmail(e.target.value); setFpError("") }}
                            onFocus={() => setFpFocused(true)} onBlur={() => setFpFocused(false)} />
                        </div>
                        {(fpEmail.length > 0 || fpFocused) && (
                          <div style={{
                            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                            borderRadius: 10, padding: "8px 12px",
                            display: "flex", flexDirection: "column", gap: 6,
                          }}>
                            {emailReqs.map((req, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                  width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                                  background: req.ok ? "#D32F2F" : (dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"),
                                  border: req.ok ? "none" : `1.5px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all .25s",
                                  animation: req.ok ? "checkPop .3s cubic-bezier(.34,1.56,.64,1)" : "none",
                                }}>
                                  {req.ok && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 500, color: req.ok ? (dark ? "#fca5a5" : "#D32F2F") : text2, transition: "color .25s" }}>{req.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {fpError && (
                          <div style={{
                            padding: "9px 12px", background: dark ? "rgba(211,47,47,0.08)" : "#FFF5F5",
                            borderTop: `1px solid rgba(211,47,47,${dark ? .2 : .15})`, borderRight: `1px solid rgba(211,47,47,${dark ? .2 : .15})`, borderBottom: `1px solid rgba(211,47,47,${dark ? .2 : .15})`, borderLeft: "3px solid #D32F2F",
                            borderRadius: 8, fontSize: 12, color: dark ? "#fca5a5" : "#9A0007",
                            display: "flex", gap: 8, alignItems: "center",
                          }}>
                            <span style={{ flexShrink: 0 }}>⚠️</span>{fpError}
                          </div>
                        )}
                        <button id="fp-submit" type="submit" disabled={fpLoading || !emailValid} style={{
                          width: "100%", height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          backgroundImage: emailValid
                            ? "linear-gradient(135deg,#FF6659 0%,#D32F2F 35%,#9A0007 65%,#FF6659 100%)"
                            : "none",
                          backgroundColor: emailValid ? "transparent" : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                          backgroundSize: "300% 100%", animation: (emailValid && !fpLoading) ? "gradMove 2.5s linear infinite" : "none",
                          color: emailValid ? "#fff" : text2, border: "none", borderRadius: 10,
                          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                          cursor: (fpLoading || !emailValid) ? "not-allowed" : "pointer",
                          boxShadow: emailValid ? "0 4px 18px rgba(154,0,7,.3)" : "none", transition: "all .3s",
                        }}>
                          {fpLoading
                            ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .65s linear infinite", display: "inline-block" }} />
                            : t.fpBtn}
                        </button>
                        <button type="button" onClick={goLogin} style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 12, fontWeight: 500, color: text2,
                          fontFamily: "inherit", textAlign: "center", padding: "2px 0", transition: "color .2s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = "#D32F2F"}
                          onMouseLeave={e => e.currentTarget.style.color = text2}
                        >{t.fpBack}</button>
                      </form>
                    </>
                  )}
                </div>

              </div>{/* end sliding content area */}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
