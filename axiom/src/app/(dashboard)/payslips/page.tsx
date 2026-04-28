/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import { Eye, RefreshCw, Calendar, Download, FileText } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useEmployeeId } from "@/hooks/use-current-user"
import { getPayslipsByEmployee } from "@/lib/actions/payroll.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"


function fmt(v: number, vi = true){ return Math.round(v).toLocaleString("vi-VN")+(vi ? " đ" : " VND") }

export default function PayslipsPage(){
  const { dark, lang } = useDashboard()
  const th  = getTheme(dark)
  const vi  = lang === "vi"
  const employeeId = useEmployeeId()
  const { isMobile } = useBreakpoint()

  const [slips, setSlips]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number|null>(null)

  async function handleDownload(slipId: number) {
    setDownloading(slipId)
    try {
      const res = await fetch(`/api/export/payslip-pdf/${slipId}?lang=${lang}`)
      if (!res.ok) throw new Error("failed")
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = `PhieuLuong_${slipId}.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 8_000)
    } catch { alert(vi ? "Không thể xuất PDF." : "PDF export failed.") }
    setDownloading(null)
  }

  const loadSlips = useCallback(async () => {
    if (!employeeId) return
    setLoading(true)
    const res = await getPayslipsByEmployee(employeeId)
    if (res.success) setSlips(res.data as any[])
    setLoading(false)
  }, [employeeId])

  useEffect(() => { loadSlips() }, [loadSlips])


  const hd: React.CSSProperties = { padding:"10px 12px", fontSize:11.5, fontWeight:700, color:th.tableHeadText, background:th.tableHead, borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.04em" }
  const tdS: React.CSSProperties = { padding:"11px 12px", fontSize:12.5, color:th.text1, borderBottom:`1px solid ${th.tableBorder}`, verticalAlign:"middle" }

  return (
    <div style={{ padding: isMobile ? "16px" : "28px 28px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0, display:"flex", alignItems:"center", gap:10 }}>
            <FileText size={22} color="#D0211C"/>{vi?"Phiếu lương":"Payslips"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi ? `${slips.length} phiếu lương của bạn` : `Your ${slips.length} payslips`}
          </p>
        </div>
        <button onClick={loadSlips} disabled={loading}
          style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${th.cardBorder}`, background:th.cardBg, color:th.text2, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, fontFamily:"inherit" }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }}/>{vi?"Tải lại":"Refresh"}
        </button>
      </div>


      <div style={{ background:th.cardBg, borderRadius:14, overflow:"hidden", border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", flexDirection:"column", gap:12 }}>
            <div style={{ width:32, height:32, border:`3px solid ${th.cardBorder}`, borderTopColor:"#D0211C", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
            <span style={{ fontSize:13, color:th.text2 }}>{vi?"Đang tải...":"Loading..."}</span>
          </div>
        ) : slips.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:th.text2 }}>
            <div style={{ fontSize:42, marginBottom:10 }}>📄</div>
            <div style={{ fontSize:15, fontWeight:600, color:th.text1 }}>{vi?"Chưa có phiếu lương nào":"No payslips yet"}</div>
            <div style={{ fontSize:12.5, marginTop:4 }}>{vi?"Phiếu lương sẽ xuất hiện sau khi bảng lương được tính":"Payslips appear after payroll is processed"}</div>
          </div>
        ) : isMobile ? (
          <div className="mobile-card-list" style={{ padding: "12px" }}>
            {slips.map((s:any) => {
              const pr = s.payroll
              const period = pr ? `${String(pr.payMonth).padStart(2,"0")}/${pr.payYear}` : "—"
              const gross = Number(pr?.grossSalary ?? 0)
              const net   = Number(pr?.netSalary   ?? 0)
              return (
                <div key={s.id} style={{ background: th.tableHead, borderRadius: 10, padding: "12px", border: `1px solid ${th.tableBorder}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: th.text1 }}>{vi?"Tháng ":"Month "}{period}</div>
                    <span style={{ fontSize: 11, background: "#D1FAE5", color: "#065F46", borderRadius: 8, padding: "2px 8px", fontWeight: 600 }}>✓</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: 12.5, marginBottom: 10 }}>
                    <div><span style={{ color: th.text2 }}>Gross: </span><b>{gross ? fmt(gross, vi) : "—"}</b></div>
                    <div><span style={{ color: th.text2 }}>Net: </span><b style={{ color: "#059669" }}>{net ? fmt(net, vi) : "—"}</b></div>
                  </div>
                  <a href={`/payslips/${s.id}`} style={{ display:"block", width:"100%", padding:"7px", borderRadius:8,
                    background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", fontSize:12.5, fontWeight:700, cursor:"pointer", textDecoration:"none", textAlign:"center" }}>
                    {vi?"Xem chi tiết":"View Details"}
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="table-scroll">
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>
              {[vi?"Kỳ lương":"Period", vi?"Ngày phát":"Issued", vi?"Lương Gross":"Gross", vi?"Lương Net":"Net", vi?"Ngày công":"Work Days", vi?"Thao tác":"Actions"].map(c=><th key={c} style={hd}>{c}</th>)}
            </tr></thead>
            <tbody>
              {slips.map((s:any) => {
                const pr = s.payroll
                const period    = pr ? `${String(pr.payMonth).padStart(2,"0")}/${pr.payYear}` : "—"
                const issued    = new Date(s.issuedDate).toLocaleDateString("vi-VN")
                const gross     = Number(pr?.grossSalary ?? 0)
                const net       = Number(pr?.netSalary   ?? 0)
                const workDays  = Number(pr?.workDays    ?? 0)
                return (
                  <tr key={s.id} style={{ cursor:"pointer", transition:"background .1s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=dark?"rgba(255,255,255,0.03)":"#FAFAFA"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}>
                    <td style={{ ...tdS, fontWeight:700 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <Calendar size={14} color="#D0211C"/>
                        <span style={{ color:th.text1 }}>{vi?`Tháng `:"Month "}{period}</span>
                      </div>
                    </td>
                    <td style={tdS}>{issued}</td>
                    <td style={{ ...tdS, fontWeight:600 }}>{gross ? fmt(gross, vi) : "—"}</td>
                    <td style={{ ...tdS, fontWeight:800, color:"#059669" }}>{net ? fmt(net, vi) : "—"}</td>
                    <td style={tdS}>{workDays} {vi?"ngày":"days"}</td>
                    <td style={tdS} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:"flex", gap:6 }}>
                        <a href={`/payslips/${s.id}`} title={vi?"Xem chi tiết":"View detail"}
                          style={{ width:30, height:30, borderRadius:7, border:"none", background:"#EFF6FF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                          <Eye size={13} color="#1D4ED8"/>
                        </a>
                        <button onClick={() => handleDownload(s.id)} title={vi?"Tải PDF":"Download PDF"}
                          disabled={downloading===s.id}
                          style={{ width:30, height:30, borderRadius:7, border:"none", background:"#D1FAE5", cursor:downloading===s.id?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {downloading===s.id
                            ? <span style={{ width:11, height:11, border:"2px solid rgba(6,95,70,0.3)", borderTopColor:"#065F46", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>
                            : <Download size={13} color="#065F46"/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
        {!loading && slips.length > 0 && (
          <div style={{ padding:"10px 14px", background:th.tableHead, borderTop:`1px solid ${th.tableBorder}`, fontSize:12, color:th.text2 }}>
            {slips.length} {vi?"phiếu lương":"payslips"}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
