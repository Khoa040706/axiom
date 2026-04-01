/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { DollarSign, Banknote, Calculator, PiggyBank, ArrowUpRight, RefreshCw, AlertTriangle, Download, ArrowRight, FileText, Settings } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getDashboardStats, getDashboardCharts } from "@/lib/actions/dashboard.actions"
import { useBreakpoint } from "@/hooks/use-breakpoint"

function StatCard({ label, value, sub, accent, icon }: any) {
  return (
    <div style={{ flex:1, background:accent, color:"#fff", borderRadius:14, padding:"16px 18px",
      position:"relative", overflow:"hidden", boxShadow:"0 4px 14px rgba(0,0,0,0.12)", minWidth:0 }}>
      <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", opacity:0.15 }}>{icon}</div>
      <div style={{ fontSize:12, opacity:0.88, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11.5, opacity:0.72, marginTop:5, display:"flex", alignItems:"center", gap:4 }}><ArrowUpRight size={11}/>{sub}</div>
    </div>
  )
}

function fmtM(v: number) { return v >= 1000000 ? (v/1000000).toFixed(1)+"M" : v.toLocaleString("vi-VN") }

function QuickAction({ icon, label, sub, href, accent, dark }: any) {
  const th = getTheme(dark)
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: th.cardBg, borderRadius: 12, padding: "14px 16px",
        border: `1.5px solid ${th.cardBorder}`,
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "all .2s",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}22` }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)" }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${accent}15`, border: `1.5px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text1 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: th.text2 }}>{sub}</div>
        </div>
        <ArrowRight size={14} color={th.text2} style={{ flexShrink: 0 }} />
      </div>
    </Link>
  )
}

export default function AccountantDashboard() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const tk = th.text2, gs = th.tableBorder
  const { isMobile } = useBreakpoint()

  const [trend, setTrend]       = useState<any[]>([])
  const [totalNet, setTotalNet] = useState("—")
  const [totalGross, setTotalGross] = useState("—")
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [chartsRes] = await Promise.all([getDashboardCharts()])
    if (chartsRes.success && chartsRes.data) {
      const raw = (chartsRes.data.payrollTrend ?? []) as any[]
      setTrend(raw)
      if (raw.length > 0) {
        const last = raw[raw.length - 1]
        setTotalNet(fmtM(Math.round((last.salary ?? 0) * 1_000_000)))
        setTotalGross(fmtM(Math.round((last.salary ?? 0) * 1_000_000 / 0.895))) // approx gross = net / (1 - 10.5%)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* Excel export — payroll report */
  async function handleExportExcel() {
    try {
      const res = await fetch("/api/export/excel?type=payroll")
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AXIOM_BangLuong_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("[exportExcel]", err)
      alert(vi ? "Không thể xuất Excel." : "Excel export failed.")
    }
  }

  const card: React.CSSProperties = { background:th.cardBg, borderRadius:14, border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }
  const hd:   React.CSSProperties = { padding:"9px 12px", fontSize:11.5, fontWeight:700, color:th.tableHeadText, background:th.tableHead, borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left" }
  const td:   React.CSSProperties = { padding:"10px 12px", fontSize:12.5, color:th.text1, borderBottom:`1px solid ${th.tableBorder}` }

  const expenseRows = [
    { cat:"BHXH", pct:8,   payTo: vi?"Quỹ BHXH":"Social Fund" },
    { cat:"BHYT", pct:1.5, payTo: vi?"Quỹ BHXH":"Social Fund" },
    { cat:"BHTN", pct:1,   payTo: vi?"Quỹ BHXH":"Social Fund" },
    { cat: vi?"Thuế TNCN":"Income Tax", pct:null, payTo: vi?"Cục thuế":"Tax Dept" },
    { cat: vi?"Phụ cấp":"Allowance",    pct:null, payTo: vi?"Nhân viên":"Employee" },
  ]

  return (
    <div className="page-pad">
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>{vi?"Dashboard — Kế toán":"Accountant Dashboard"}</h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>{vi?"Quản lý quỹ lương, bảo hiểm và thuế TNCN":"Payroll fund, insurance & PIT management"}</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={load} disabled={loading}
            style={{ padding:"7px 14px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:th.cardBg, color:th.text2, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontFamily:"inherit" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }}/>{vi?"Tải lại":"Refresh"}
          </button>
          <button onClick={handleExportExcel}
            style={{ padding:"7px 14px", borderRadius:9, background:"#10B981", color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit", boxShadow:"0 2px 8px rgba(16,185,129,0.3)" }}>
            <Download size={13}/>{vi?"Xuất Excel":"Export Excel"}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="stat-row" style={{ marginBottom: 18 }}>
        <StatCard label={vi?"Tổng Gross tháng này":"Total Gross"} value={loading?"…":totalGross} sub={vi?"Theo hợp đồng":"Contract-based"} accent="linear-gradient(135deg,#D0211C,#991414)" icon={<DollarSign size={52}/>}/>
        <StatCard label={vi?"Tổng Net chi trả":"Total Net Paid"} value={loading?"…":totalNet} sub={vi?"Sau BH & Thuế":"After insurance & tax"} accent="linear-gradient(135deg,#059669,#047857)" icon={<Banknote size={52}/>}/>
        <StatCard label={vi?"BHXH công ty đóng (21.5%)":"Company BHXH (21.5%)"} value="—" sub="21.5% × Gross" accent="linear-gradient(135deg,#D97706,#B45309)" icon={<PiggyBank size={52}/>}/>
        <StatCard label={vi?"Tổng thuế TNCN":"Total PIT"} value="—" sub={vi?"Phải nộp cho nhà nước":"Payable to state"} accent="linear-gradient(135deg,#7C3AED,#6D28D9)" icon={<Calculator size={52}/>}/>
      </div>

      <div className="rg-2" style={{ marginBottom: 16 }}>
        {/* Payroll trend */}
        <div style={{ ...card, padding:"18px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>
            📈 {vi?"Xu hướng quỹ lương Net (triệu đ)":"Net Payroll Trend (million VND)"}
          </div>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
              <LineChart data={trend} margin={{ left:-10, right:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gs} vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:10, fill:tk }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:tk }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip contentStyle={{ background:dark?"#1e293b":"#fff", border:`1px solid ${th.cardBorder}`, borderRadius:8, fontSize:12 }} formatter={(v:any)=>`${v}M`}/>
                <Line type="monotone" dataKey="salary" name="Net" stroke="#D0211C" strokeWidth={2.5} dot={{ r:4 }}/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:th.text2, flexDirection:"column", gap:8 }}>
              {loading ? <div style={{ width:28, height:28, border:`3px solid ${th.cardBorder}`, borderTopColor:"#D0211C", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> : null}
              <span style={{ fontSize:13 }}>{loading ? (vi?"Đang tải...":"Loading...") : (vi?"Chưa có dữ liệu lương":"No payroll data yet")}</span>
              {!loading && <span style={{ fontSize:11.5 }}>{vi?"Chạy generate-payroll.ts để tạo bảng lương":"Run generate-payroll.ts to create payroll data"}</span>}
            </div>
          )}
        </div>

        {/* Deduction breakdown */}
        <div style={{ ...card, padding:"18px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>🧾 {vi?"Các khoản khấu trừ theo quy định":"Statutory Deductions"}</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>
              {[vi?"Khoản mục":"Category", vi?"Tỷ lệ NLĐ":"Employee Rate", vi?"Nộp cho":"Paid To"].map(c=><th key={c} style={hd}>{c}</th>)}
            </tr></thead>
            <tbody>
              {expenseRows.map(r => (
                <tr key={r.cat}>
                  <td style={{ ...td, fontWeight:600 }}>{r.cat}</td>
                  <td style={td}>{r.pct != null ? <span style={{ color:"#EF4444", fontWeight:700 }}>{r.pct}%</span> : <span style={{ color:th.text2, fontSize:11.5 }}>{vi?"Lũy tiến":"Progressive"}</span>}</td>
                  <td style={td}><span style={{ fontSize:11.5, color:th.text2 }}>{r.payTo}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:14, background:dark?"rgba(245,158,11,0.1)":"#FFFBEB", border:`1px solid ${dark?"rgba(245,158,11,0.3)":"#FDE68A"}`, borderRadius:10, padding:"10px 12px", display:"flex", gap:8, alignItems:"flex-start" }}>
            <AlertTriangle size={14} color="#D97706" style={{ marginTop:2, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:dark?"#FCD34D":"#92400E" }}>
              {vi?"BHXH: NLĐ đóng 10.5%, NSDLĐ đóng 21.5% trên mức lương đóng BH.":"BHXH: Employee pays 10.5%, Employer pays 21.5% on insured salary."}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions — UC linked */}
      <div style={{ ...card, padding:"18px", marginTop: 16 }}>
        <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>⚡ {vi?"Chức năng theo Use Case":"Use Case Actions"}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <QuickAction icon={<Settings size={18} color="#D0211C"/>} label={vi?"Thiết lập công thức lương":"Payroll Formula Setup"} sub="UC-08" href="/payroll" accent="#D0211C" dark={dark}/>
          <QuickAction icon={<Calculator size={18} color="#059669"/>} label={vi?"Tính lương tự động (Gross→Net)":"Auto Calculate (Gross→Net)"} sub="UC-09" href="/payroll" accent="#059669" dark={dark}/>
          <QuickAction icon={<FileText size={18} color="#7C3AED"/>} label={vi?"Xuất phiếu lương (Payslip)":"Generate Payslips"} sub="UC-10" href="/payslips" accent="#7C3AED" dark={dark}/>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
