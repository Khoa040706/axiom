"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getPayslipsByEmployee } from "@/lib/actions/payroll.actions"
import { useEmployeeId } from "@/hooks/use-current-user"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { tDept } from "@/lib/i18n-maps"


function fmt(v: number, vi = true) { return Math.round(Math.abs(v)).toLocaleString("vi-VN") + (vi ? " đ" : " VND") }

export default function PayslipDetailPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { id } = useParams()
  const router = useRouter()
  const employeeId = useEmployeeId()
  const { isMobile } = useBreakpoint()

  const [slip, setSlip] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/export/payslip-pdf/${id}?lang=${lang}`)
      if (!res.ok) throw new Error("PDF export failed")
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = `PhieuLuong_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 8_000)
    } catch (e) {
      console.error(e)
      alert(vi ? "Không thể xuất PDF." : "PDF export failed.")
    }
    setDownloading(false)
  }

  useEffect(() => {
    if (!employeeId) return
    setLoading(true)
    getPayslipsByEmployee(employeeId).then(res => {
      if (res.success && res.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (res.data as any[]).find(s => String(s.id) === String(id))
        setSlip(found ?? null)
      }
      setLoading(false)
    })
  }, [employeeId, id])

  if (loading) {
    return (
      <div style={{ padding: "28px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ textAlign: "center", color: th.text2 }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${th.cardBorder}`, borderTopColor: "#D0211C", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 12px" }}/>
          <div style={{ fontSize: 14 }}>{vi ? "Đang tải phiếu lương..." : "Loading payslip..."}</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!slip) {
    return (
      <div style={{ padding: "28px" }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${th.cardBorder}`, background: "none", cursor: "pointer", color: th.text2, fontSize: 13, fontFamily: "inherit", marginBottom: 16 }}>
          <ArrowLeft size={14}/>{vi ? "Quay lại" : "Back"}
        </button>
        <div style={{ textAlign: "center", padding: "60px 0", color: th.text2 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: th.text1, marginBottom: 8 }}>
            {vi ? "Không tìm thấy phiếu lương" : "Payslip not found"}
          </div>
          <div style={{ fontSize: 13 }}>
            {vi ? "Phiếu lương này không tồn tại hoặc không thuộc về bạn." : "This payslip does not exist or does not belong to you."}
          </div>
        </div>
      </div>
    )
  }

  // Map từ DB: Payslip chỉ có payrollId + employeeId — salary data lấy từ payroll relation
  const pr       = slip.payroll   // Payroll record
  const empName  = pr?.employee?.fullName ?? (vi ? "Nhân viên" : "Employee")
  const empCode  = pr?.employee?.code ?? "—"
  const deptRaw  = pr?.employee?.department?.name ?? "—"
  const deptName = tDept(deptRaw, vi)
  const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const month    = pr
    ? vi
      ? `Tháng ${pr.payMonth}/${pr.payYear}`
      : `${MONTHS_EN[(pr.payMonth - 1) % 12]} ${pr.payYear}`
    : "—"

  // Salary fields — tên đúng theo Prisma schema
  const gross     = Number(pr?.baseSalary   ?? 0)  // baseSalary = salary * grade
  const allowance = Number(pr?.allowance    ?? 0)
  const otPay     = Number(pr?.otPay        ?? 0)
  const bhxh      = Number(pr?.bhxh         ?? 0)
  const bhyt      = Number(pr?.bhyt         ?? 0)
  const bhtn      = Number(pr?.bhtn         ?? 0)
  const pit       = Number(pr?.taxAmount    ?? 0)  // taxAmount = thuế TNCN
  const net       = Number(pr?.netSalary    ?? 0)
  const deps      = pr?.employee?.numDependents ?? 0
  const selfDed   = 15_500_000                      // Giảm trừ bản thân 2026
  const depDed    = deps * 6_200_000                // Giảm trừ người phụ thuộc 2026

  const rows = [
    { l: vi?"Lương cơ bản (Gross)":"Gross Salary",          v: gross,     t: "+" },
    { l: vi?"Phụ cấp":"Allowance",                          v: allowance, t: "+" },
    { l: vi?"Lương tăng ca":"Overtime Pay",                  v: otPay,     t: "+" },
    { l: vi?`BHXH (8%)`:`Social Ins. (8%)`,                     v: bhxh,      t: "-" },
    { l: vi?`BHYT (1.5%)`:`Health Ins. (1.5%)`,                 v: bhyt,      t: "-" },
    { l: vi?`BHTN (1%)`:`Unemp. Ins. (1%)`,                     v: bhtn,      t: "-" },
    { l: vi?"Giảm trừ bản thân (15.5M)":"Self deduction",   v: selfDed,   t: "i" },
    ...(deps > 0 ? [{ l: vi?`Giảm trừ ${deps} người phụ thuộc`:`${deps} dependents`, v: depDed, t: "i" as const }] : []),
    { l: vi?"Thuế Thu nhập cá nhân":"Income Tax",           v: pit,       t: "-" },
  ]

  return (
    <div style={{ padding: isMobile ? "16px 16px 32px" : "28px 28px 40px" }}>
      <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${th.cardBorder}`, background: "none", cursor: "pointer", color: th.text2, fontSize: 13, fontFamily: "inherit", marginBottom: 16 }}>
        <ArrowLeft size={14}/>{vi ? "Quay lại" : "Back"}
      </button>

      <div style={{ background: th.cardBg, borderRadius: 16, border: `1px solid ${th.cardBorder}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: isMobile ? "100%" : 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "2px solid #D0211C", background: "linear-gradient(135deg,rgba(208,33,28,0.06),rgba(153,20,20,0.02))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: th.text1, margin: 0 }}>📄 {vi ? "PHIẾU LƯƠNG" : "PAYSLIP"}</h2>
              <p style={{ fontSize: 13, color: th.text2, margin: "4px 0 0" }}>{month} · #{slip.id}</p>
            </div>
              <div style={{ display: "flex", gap: 8 }}>
              <button
                  onClick={handleDownload}
                  disabled={downloading}
                  title={vi ? "Tải phiếu lương PDF" : "Download PDF"}
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: "none",
                    background: downloading ? "#9CA3AF" : "#D0211C",
                    cursor: downloading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background .15s",
                  }}
                >
                  {downloading
                    ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}/>
                    : <Download size={14} color="#fff"/>}
                </button>
              </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 4 : 20, fontSize: 12.5 }}>
            <span style={{ color: th.text2 }}>{vi?"Nhân viên:":"Employee:"} <b style={{ color: th.text1 }}>{empName} ({empCode})</b></span>
            <span style={{ color: th.text2 }}>{vi?"Phòng:":"Dept:"} <b style={{ color: th.text1 }}>{deptName}</b></span>
          </div>
        </div>

        {/* Detail rows */}
        <div style={{ padding: "16px 24px" }}>
          {rows.filter(r => r.v !== 0).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${th.tableBorder}` }}>
              <span style={{ fontSize: 13, color: r.t === "i" ? "#3B82F6" : th.text2 }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: r.t === "+" ? "#10B981" : r.t === "-" ? "#EF4444" : "#3B82F6" }}>
                {r.t === "-" ? `−${fmt(r.v, vi)}` : r.t === "+" ? `+${fmt(r.v, vi)}` : fmt(r.v, vi)}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 8, borderTop: `2px double ${th.tableBorder}` }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: th.text1 }}>💰 {vi ? "LƯƠNG NET" : "NET SALARY"}</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#059669" }}>{fmt(net, vi)}</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
