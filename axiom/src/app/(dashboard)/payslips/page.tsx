/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import { FileText, Eye, Search, RefreshCw, Calendar, X } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useSession } from "next-auth/react"
import { useEmployeeId } from "@/hooks/use-current-user"
import { getPayslipsByEmployee } from "@/lib/actions/payroll.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"

function fmt(v: number){ return Math.round(v).toLocaleString("vi-VN")+" đ" }

export default function PayslipsPage(){
  const { dark, lang } = useDashboard()
  const th  = getTheme(dark)
  const vi  = lang === "vi"
  const { data: session } = useSession()
  const employeeId = useEmployeeId()
  const { isMobile } = useBreakpoint()

  const [slips, setSlips]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<any | null>(null)

  const loadSlips = useCallback(async () => {
    if (!employeeId) return
    setLoading(true)
    const res = await getPayslipsByEmployee(employeeId)
    if (res.success) setSlips(res.data as any[])
    setLoading(false)
  }, [employeeId])

  useEffect(() => { loadSlips() }, [loadSlips])

  const filtered = slips.filter(s => {
    const prName = s.payroll?.employee?.fullName ?? ""
    const period = `${s.payroll?.payMonth ?? ""}/${s.payroll?.payYear ?? ""}`
    const q = search.toLowerCase()
    return !q || prName.toLowerCase().includes(q) || period.includes(q)
  })

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

      <div style={{ position:"relative", maxWidth:360, marginBottom:16 }}>
        <Search size={13} color={th.text2} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
        <input placeholder={vi?"Tìm kiếm kỳ lương...":"Search period..."} value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"100%", padding:"9px 10px 9px 30px", border:`1.5px solid ${th.inputBorder}`, borderRadius:9, fontSize:13, background:th.inputBg, color:th.text1, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
      </div>

      <div style={{ background:th.cardBg, borderRadius:14, overflow:"hidden", border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", flexDirection:"column", gap:12 }}>
            <div style={{ width:32, height:32, border:`3px solid ${th.cardBorder}`, borderTopColor:"#D0211C", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
            <span style={{ fontSize:13, color:th.text2 }}>{vi?"Đang tải...":"Loading..."}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:th.text2 }}>
            <div style={{ fontSize:42, marginBottom:10 }}>📄</div>
            <div style={{ fontSize:15, fontWeight:600, color:th.text1 }}>{vi?"Chưa có phiếu lương nào":"No payslips yet"}</div>
            <div style={{ fontSize:12.5, marginTop:4 }}>{vi?"Phiếu lương sẽ xuất hiện sau khi bảng lương được tính":"Payslips appear after payroll is processed"}</div>
          </div>
        ) : isMobile ? (
          <div className="mobile-card-list" style={{ padding: "12px" }}>
            {filtered.map((s:any) => {
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
                    <div><span style={{ color: th.text2 }}>Gross: </span><b>{gross ? fmt(gross) : "—"}</b></div>
                    <div><span style={{ color: th.text2 }}>Net: </span><b style={{ color: "#059669" }}>{net ? fmt(net) : "—"}</b></div>
                  </div>
                  <button onClick={() => setSelected(s)} style={{ width:"100%", padding:"7px", borderRadius:8, border:"none",
                    background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    {vi?"Xem chi tiết":"View Details"}
                  </button>
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
              {filtered.map((s:any) => {
                const pr = s.payroll
                const period    = pr ? `${String(pr.payMonth).padStart(2,"0")}/${pr.payYear}` : "—"
                const issued    = new Date(s.issuedDate).toLocaleDateString("vi-VN")
                const gross     = Number(pr?.grossSalary ?? 0)
                const net       = Number(pr?.netSalary   ?? 0)
                const workDays  = Number(pr?.workDays    ?? 0)
                return (
                  <tr key={s.id} style={{ cursor:"pointer", transition:"background .1s" }}
                    onClick={() => setSelected(s)}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=dark?"rgba(255,255,255,0.03)":"#FAFAFA"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=""}>
                    <td style={{ ...tdS, fontWeight:700 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <Calendar size={14} color="#D0211C"/>
                        <span style={{ color:th.text1 }}>{vi?`Tháng `:"Month "}{period}</span>
                      </div>
                    </td>
                    <td style={tdS}>{issued}</td>
                    <td style={{ ...tdS, fontWeight:600 }}>{gross ? fmt(gross) : "—"}</td>
                    <td style={{ ...tdS, fontWeight:800, color:"#059669" }}>{net ? fmt(net) : "—"}</td>
                    <td style={tdS}>{workDays} {vi?"ngày":"days"}</td>
                    <td style={tdS} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => setSelected(s)} title={vi?"Xem chi tiết":"View detail"}
                          style={{ width:30, height:30, borderRadius:7, border:"none", background:"#EFF6FF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Eye size={13} color="#1D4ED8"/>
                        </button>
                        <a href={`/payslips/${s.id}`} title={vi?"Mở phiếu lương":"Open payslip"}
                          style={{ width:30, height:30, borderRadius:7, border:"none", background:"#D1FAE5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                          <FileText size={13} color="#065F46"/>
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ padding:"10px 14px", background:th.tableHead, borderTop:`1px solid ${th.tableBorder}`, fontSize:12, color:th.text2 }}>
            {filtered.length} {vi?"phiếu lương":"payslips"}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:9000 }} onClick={() => setSelected(null)}/>
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:9001, padding:16 }}>
            <div style={{ background:th.cardBg, borderRadius:18, width:"min(480px,92vw)", boxShadow:"0 20px 50px rgba(0,0,0,0.3)", padding:"24px", animation:"fadeDown .2s ease" }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:800, color:th.text1, margin:0 }}>
                    {vi?"Phiếu lương":"Payslip"} — {vi?"Tháng":"Month"} {selected.payroll?.payMonth}/{selected.payroll?.payYear}
                  </h2>
                  <p style={{ fontSize:12, color:th.text2, margin:"2px 0 0" }}>
                    {vi?"Ngày phát:":"Issued:"} {new Date(selected.issuedDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${th.cardBorder}`, background:"none", cursor:"pointer", color:th.text2, display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
              </div>
              {[
                { l: vi?"Lương Gross":"Gross Salary",  v: fmt(Number(selected.payroll?.grossSalary ?? 0)), c: th.text1 },
                { l: vi?"BHXH (8%)":"BHXH",            v: `−${fmt(Number(selected.payroll?.bhxh ?? 0))}`,   c: "#EF4444" },
                { l: vi?"BHYT (1.5%)":"BHYT",          v: `−${fmt(Number(selected.payroll?.bhyt ?? 0))}`,   c: "#EF4444" },
                { l: vi?"BHTN (1%)":"BHTN",            v: `−${fmt(Number(selected.payroll?.bhtn ?? 0))}`,   c: "#EF4444" },
                { l: vi?"Thuế TNCN":"Income Tax",      v: `−${fmt(Number(selected.payroll?.taxAmount ?? 0))}`, c: "#D97706" },
                { l: vi?"Lương Net":"Net Salary",      v: fmt(Number(selected.payroll?.netSalary ?? 0)),    c: "#059669" },
              ].map(r => (
                <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${th.tableBorder}` }}>
                  <span style={{ fontSize:13, color:th.text2 }}>{r.l}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:r.c }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <a href={`/payslips/${selected.id}`}
                  style={{ flex:1, padding:"9px", borderRadius:9, background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <FileText size={13}/>{vi?"Xem chi tiết":"View Full"}
                </a>
                <button onClick={() => setSelected(null)} style={{ flex:1, padding:"9px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:"none", color:th.text2, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                  {vi?"Đóng":"Close"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
