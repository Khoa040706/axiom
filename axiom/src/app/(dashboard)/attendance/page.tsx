/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Filter, Download, Calendar, Search, X, Loader2 } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getAttendanceByMonth, getTodayAttendance } from "@/lib/actions/attendance.actions"
import { matchAny } from "@/lib/utils/search"
import { useBreakpoint } from "@/hooks/use-breakpoint"

const MONTHS_VI = ["Tháng 1/2026","Tháng 2/2026","Tháng 3/2026"]
const MONTHS_EN = ["January 2026","February 2026","March 2026"]
const MONTH_NUM  = [1, 2, 3]

export default function AttendancePage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()
  const MONTHS = vi ? MONTHS_VI : MONTHS_EN

  const [showFilter, setShowFilter] = useState(false)
  const [monthIdx, setMonthIdx]     = useState(2)
  const [q, setQ]                   = useState("")
  const [muonF, setMuonF]           = useState<"all"|"yes"|"no">("all")
  const [otF, setOtF]               = useState<"all"|"yes"|"no">("all")
  const tableRef = useRef<HTMLDivElement>(null)

  const [staff, setStaff]   = useState<any[]>([])
  const [today, setToday]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const month = MONTH_NUM[monthIdx]
    const [monthRes, todayRes] = await Promise.all([
      getAttendanceByMonth(month, 2026),
      getTodayAttendance(),
    ])

    if (monthRes.success && monthRes.data) {
      const empMap = new Map<number, any>()
      for (const rec of monthRes.data as any[]) {
        const empId = rec.employeeId
        if (!empMap.has(empId)) {
          empMap.set(empId, {
            id: rec.employee?.code ?? `EMP${empId}`,
            name: rec.employee?.fullName ?? "—",
            dept: rec.employee?.department?.name ?? "",
            ngay: 0, muon: 0, ot: 0, phut: 0,
          })
        }
        const e = empMap.get(empId)!
        if (rec.status === "Đi làm") e.ngay++
        if ((rec.lateMinutes ?? 0) > 0) { e.muon++; e.phut += rec.lateMinutes }
        e.ot += Number(rec.otHours ?? 0)
      }
      setStaff(Array.from(empMap.values()))
    }

    if (todayRes.success && todayRes.data) {
      setToday((todayRes.data as any[]).map(rec => ({
        name: rec.employee?.fullName ?? "—",
        vao:  rec.checkIn  ? new Date(rec.checkIn).toLocaleTimeString("vi-VN",  { hour:"2-digit", minute:"2-digit" }) : "—",
        ra:   rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" }) : "—",
        lam:  rec.checkIn && rec.checkOut
          ? `${((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) / 3_600_000).toFixed(1)}h`
          : "—",
        st: (rec.lateMinutes ?? 0) > 0 ? "late" : "ontime",
      })))
    }
    setLoading(false)
  }, [monthIdx])

  useEffect(() => { load() }, [load])

  const rows = staff.filter(s => {
    const matchQ    = matchAny([s.name, s.id, s.dept], q)
    const matchMuon = muonF === "all" || (muonF === "yes" ? s.muon > 0 : s.muon === 0)
    const matchOt   = otF   === "all" || (otF   === "yes" ? s.ot   > 0 : s.ot   === 0)
    return matchQ && matchMuon && matchOt
  })

  const hasFilter = !!(q || muonF !== "all" || otF !== "all")
  function resetFilter() { setQ(""); setMuonF("all"); setOtF("all") }

  async function exportPDF() {
    const now = new Date()
    const dateStr = now.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" })
    const timeStr = now.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" })
    const fileName = `bao-cao-cham-cong-t${MONTH_NUM[monthIdx]}-2026.pdf`

    let logoSrc = ""
    try {
      const resp = await fetch("/images/LogoAXIOM.png")
      const blob = await resp.blob()
      logoSrc = await new Promise<string>(res => {
        const r = new FileReader()
        r.onloadend = () => res(r.result as string)
        r.readAsDataURL(blob)
      })
    } catch { logoSrc = "" }

    const tableRows = rows.map(s => `
      <tr>
        <td>${s.id}</td><td>${s.name}</td><td>${s.dept}</td>
        <td style="color:${s.ngay>=22?"#10B981":"#EF4444"};font-weight:700">${s.ngay}</td>
        <td>${s.muon>0?`<span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:8px">${s.muon}</span>`:"0"}</td>
        <td style="color:${s.ot>0?"#3B82F6":"#9CA3AF"}">${s.ot}h</td>
      </tr>`).join("")

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px}table{width:100%;border-collapse:collapse;font-size:12px}
    th{padding:10px;background:#FEF2F2;border-bottom:2px solid #D0211C;text-align:left}
    td{padding:10px;border-bottom:1px solid #F3F4F6}
    .footer{margin-top:24px;font-size:11px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:12px}
    #status{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:9999}
    #sb{background:#1e293b;color:#fff;padding:24px 40px;border-radius:16px;font-size:16px;font-weight:600}
    </style></head><body>
    <div id="status"><div id="sb">⏳ Đang tạo PDF...</div></div>
    <div id="content">
      ${logoSrc ? `<img src="${logoSrc}" style="height:44px;margin-bottom:16px" alt="AXIOM"/>` : `<h2 style="color:#D0211C">AXIOM HRM</h2>`}
      <h3 style="margin:0 0 4px">📋 BÁO CÁO CHẤM CÔNG — ${MONTHS[monthIdx]}</h3>
      <p style="font-size:12px;color:#6B7280">Xuất lúc: ${dateStr} ${timeStr} | ${rows.length} nhân viên</p>
      <table><thead><tr>
        <th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Ngày công</th><th>Đi muộn</th><th>Giờ OT</th>
      </tr></thead><tbody>${tableRows}</tbody></table>
      <div class="footer">AXIOM HRM System — axiomhrmpayroll@gmail.com</div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
    <script>window.onload=async function(){try{
      document.getElementById('status').style.display='flex';
      await new Promise(r=>setTimeout(r,1000));
      const el=document.getElementById('content');
      const canvas=await html2canvas(el,{scale:2,useCORS:true,backgroundColor:'#fff'});
      const imgData=canvas.toDataURL('image/png');
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      const pw=pdf.internal.pageSize.getWidth();
      const imgH=(canvas.height*pw)/canvas.width;
      pdf.addImage(imgData,'PNG',0,0,pw,imgH);
      pdf.save('${fileName}');
      document.getElementById('sb').textContent='✅ Đã tải xuống!';
      setTimeout(()=>window.close(),1200);
    }catch(e){document.getElementById('sb').textContent='❌ '+e.message}}<\/script>
    </body></html>`

    const blob = new Blob([html], { type:"text/html;charset=utf-8" })
    const url  = URL.createObjectURL(blob)
    const win  = window.open(url, "_blank", "width=960,height=600")
    if (!win) alert(vi ? "Vui lòng cho phép popup để xuất PDF" : "Please allow popups to export PDF")
    setTimeout(() => URL.revokeObjectURL(url), 120_000)
  }

  const hd: React.CSSProperties = {
    padding:"10px 14px", fontSize:12, fontWeight:600,
    color:th.tableHeadText, background:th.tableHead,
    borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left", whiteSpace:"nowrap",
  }
  const td: React.CSSProperties = { padding:"12px 14px", fontSize:13, color:th.text1, borderBottom:`1px solid ${th.tableBorder}` }
  const selStyle: React.CSSProperties = {
    padding:"8px 10px", border:`1px solid ${th.inputBorder}`, borderRadius:8,
    fontSize:13, background:th.inputBg, color:th.text1, outline:"none", fontFamily:"inherit", cursor:"pointer",
  }

  return (
    <div style={{ padding: isMobile ? "16px" : "28px 28px 40px" }}>
      <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "flex-start", marginBottom:20, gap: isMobile ? 16 : 0 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>
            {vi?"Quản lý chấm công":"Attendance Management"}
          </h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {vi?"Theo dõi giờ làm việc và chấm công nhân viên.":"Track employee working hours and attendance."}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, width: isMobile ? "100%" : "auto" }}>
          <button onClick={() => setShowFilter(p=>!p)} style={{
            flex: isMobile ? 1 : "none",
            display:"flex", alignItems:"center", justifyContent: "center", gap:6, padding:"8px 14px", borderRadius:8,
            border:`1px solid ${showFilter?"#D0211C":th.inputBorder}`,
            background: showFilter?(dark?"rgba(208,33,28,0.15)":"#FEF2F2"):th.cardBg,
            color: showFilter?"#D0211C":th.text1, fontSize:13, cursor:"pointer", fontFamily:"inherit",
          }}>
            <Filter size={14}/>{vi?"Lọc":"Filter"}
          </button>
          <button onClick={exportPDF} style={{
            flex: isMobile ? 1 : "none",
            display:"flex", alignItems:"center", justifyContent: "center", gap:6, padding:"8px 14px", borderRadius:8,
            background:"#D0211C", color:"#fff", border:"none",
            fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
            boxShadow:"0 4px 12px rgba(208,33,28,0.3)",
          }}>
            <Download size={14}/>{vi?"Xuất PDF":"Export"}
          </button>
        </div>
      </div>

      {showFilter && (
        <div style={{ background:th.cardBg, border:`1px solid ${th.cardBorder}`, borderRadius:12, padding:"18px 20px", marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:14, color:th.text1 }}>{vi?"🔍 Bộ lọc":"🔍 Filter"}</span>
            <button onClick={() => setShowFilter(false)} style={{ background:"none", border:"none", cursor:"pointer", color:th.text2 }}><X size={16}/></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr", gap:14 }}>
            <div style={{ position:"relative" }}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder={vi?"Tìm kiếm...":"Search..."} style={{ ...selStyle, width:"100%", boxSizing:"border-box" }}/>
            </div>
            <select value={muonF} onChange={e=>setMuonF(e.target.value as any)} style={{ ...selStyle, width:"100%" }}>
              <option value="all">{vi?"Tất cả":"All"}</option>
              <option value="yes">{vi?"Có đi muộn":"Has late"}</option>
              <option value="no">{vi?"Không đi muộn":"On time"}</option>
            </select>
            <select value={otF} onChange={e=>setOtF(e.target.value as any)} style={{ ...selStyle, width:"100%" }}>
              <option value="all">{vi?"Tất cả":"All"}</option>
              <option value="yes">{vi?"Có OT":"Has OT"}</option>
              <option value="no">{vi?"Không OT":"No OT"}</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Calendar size={15} color={th.text2}/>
          <select value={monthIdx} onChange={e=>{setMonthIdx(Number(e.target.value))}} style={{ ...selStyle, fontWeight:600 }}>
            {MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:vi?"Tổng NV":"Total",     value: loading?"—":String(staff.length),        accent:"#10B981" },
          { label:vi?"Tổng OT":"OT",  value: loading?"—":`${staff.reduce((s,e)=>s+e.ot,0)}h`, accent:"#3B82F6" },
          { label:vi?"Đi muộn":"Late",              value: loading?"—":String(staff.filter(e=>e.muon>0).length), accent:"#F59E0B" },
          { label:vi?"Đúng giờ":"On-time",       value: loading||!staff.length?"—":`${Math.round(staff.filter(e=>e.muon===0).length/staff.length*100)}%`, accent:"#10B981" },
        ].map(s=>(
          <div key={s.label} style={{ background:th.cardBg, borderRadius:12, padding:"14px", border:`1px solid ${th.cardBorder}`, borderLeft:`4px solid ${s.accent}` }}>
            <div style={{ fontSize:11, color:th.text2, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800, color:s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div ref={tableRef} style={{ background:th.cardBg, borderRadius:12, overflow:"hidden", border:`1px solid ${th.cardBorder}`, marginBottom:20 }}>
        <div className="table-scroll">
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            {[vi?"Mã NV":"ID",vi?"Họ tên":"Name",vi?"Phòng ban":"Dept",vi?"Ngày công":"Days",vi?"Đi muộn":"Late",vi?"Giờ OT":"OT",vi?"Phút muộn":"Late Min",vi?"Thao tác":"Actions"].map(c=>(
              <th key={c} style={hd}>{c}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ ...td, textAlign:"center", padding:48 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:th.text2 }}>
                  <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }}/>
                  {vi?"Đang tải...":"Loading..."}
                </div>
              </td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ ...td, textAlign:"center", color:th.text3, padding:40 }}>
                {vi?"Không có dữ liệu phù hợp.":"No records match the current filter."}
              </td></tr>
            ) : rows.map(s=> (
              <tr key={s.id}>
                <td style={td}><span style={{ fontWeight:700, color:"#D0211C", fontSize:12 }}>{s.id}</span></td>
                <td style={td}><div style={{ fontWeight:600 }}>{s.name}</div><div style={{ fontSize:11.5, color:th.text3 }}>{s.dept}</div></td>
                <td style={td}>{s.dept || "—"}</td>
                <td style={td}><span style={{ fontWeight:700, color:s.ngay<20?"#EF4444":"#10B981" }}>{s.ngay}</span></td>
                <td style={td}>{s.muon>0?<span style={{ background:"#FEF3C7", color:"#92400E", borderRadius:12, padding:"2px 8px", fontSize:12 }}>{s.muon}</span>:<span style={{ color:th.text3 }}>0</span>}</td>
                <td style={td}><span style={{ color:s.ot===0?th.text3:"#3B82F6", fontWeight:s.ot===0?400:600 }}>{s.ot}h</span></td>
                <td style={td}><span style={{ color:s.phut===0?th.text3:"#F59E0B" }}>{s.phut}p</span></td>
                <td style={td}><button style={{ fontSize:12.5, color:"#3B82F6", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>{vi?"Chi tiết":"Details"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>{/* end table-scroll */}
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${th.tableBorder}`, background:th.tableHead, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:th.text2 }}>
            {vi?`Hiển thị ${rows.length} / ${staff.length} nhân viên`:`Showing ${rows.length} / ${staff.length} employees`}
          </span>
          {hasFilter && <button onClick={resetFilter} style={{ fontSize:12, color:"#D0211C", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>{vi?"Xóa bộ lọc":"Clear filter"}</button>}
        </div>
      </div>

      {/* Today's check-in */}
      <div style={{ background:th.cardBg, borderRadius:12, border:`1px solid ${th.cardBorder}`, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${th.tableBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, color:th.text1, fontSize:14 }}>
            {vi?"Chấm công hôm nay":"Today's Attendance"} ({new Date().toLocaleDateString("vi-VN")})
          </span>
          <span style={{ fontSize:12, color:th.text2 }}>
            {today.filter(r=>r.st==="ontime").length}/{today.length} {vi?"đúng giờ":"on time"}
          </span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            {[vi?"Nhân viên":"Employee",vi?"Giờ vào":"Check-in",vi?"Giờ ra":"Check-out",vi?"Giờ làm":"Hours",vi?"Trạng thái":"Status"].map(c=>(
              <th key={c} style={hd}>{c}</th>
            ))}
          </tr></thead>
          <tbody>
            {today.length === 0 ? (
              <tr><td colSpan={5} style={{ ...td, textAlign:"center", color:th.text3, padding:24 }}>
                {vi?"Chưa có dữ liệu chấm công hôm nay":"No attendance data for today"}
              </td></tr>
            ) : today.map((r,i)=>(
              <tr key={i}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.vao}</td>
                <td style={td}>{r.ra}</td>
                <td style={td}>{r.lam}</td>
                <td style={td}>
                  <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600,
                    background:r.st==="ontime"?"#D1FAE5":"#FEF3C7",
                    color:r.st==="ontime"?"#065F46":"#92400E",
                  }}>{r.st==="ontime"?(vi?"Đúng giờ":"On time"):(vi?"Đi muộn":"Late")}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
