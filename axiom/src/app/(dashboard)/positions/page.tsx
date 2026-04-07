"use client"
import { useState } from "react"
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { matchAny } from "@/lib/utils/search"

const POSITIONS_DATA = [
  { id:1, code:"GD",   name:"Giám đốc",           dept:"Ban Giám đốc",  level:"C-Level",   headcount:1, salaryRange:"50–80 triệu" },
  { id:2, code:"PGD",  name:"Phó Giám đốc",       dept:"Ban Giám đốc",  level:"C-Level",   headcount:1, salaryRange:"40–60 triệu" },
  { id:3, code:"TPNS", name:"Trưởng phòng Nhân sự",dept:"Phòng Nhân sự", level:"Manager",   headcount:1, salaryRange:"30–45 triệu" },
  { id:4, code:"TPIT", name:"Trưởng phòng IT",     dept:"Phòng Công nghệ",level:"Manager",  headcount:1, salaryRange:"25–40 triệu" },
  { id:5, code:"TPKT", name:"Kế toán trưởng",      dept:"Phòng Kế toán", level:"Manager",   headcount:1, salaryRange:"25–35 triệu" },
  { id:6, code:"LTV",  name:"Lập trình viên",      dept:"Phòng Công nghệ",level:"Staff",    headcount:8, salaryRange:"12–25 triệu" },
  { id:7, code:"NVKD", name:"Nhân viên kinh doanh",dept:"Phòng Kinh doanh",level:"Staff",   headcount:10,salaryRange:"10–20 triệu" },
  { id:8, code:"NVNS", name:"Nhân viên nhân sự",   dept:"Phòng Nhân sự", level:"Staff",     headcount:4, salaryRange:"8–15 triệu"  },
  { id:9, code:"NVKT", name:"Nhân viên kế toán",   dept:"Phòng Kế toán", level:"Staff",     headcount:3, salaryRange:"10–18 triệu" },
]

export default function PositionsPage(){
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const [search, setSearch] = useState("")

  const filtered = POSITIONS_DATA.filter(p => matchAny([p.name, p.dept, p.code, p.level], search))
  const hd: React.CSSProperties = { padding:"10px 12px", fontSize:11.5, fontWeight:700, color:th.tableHeadText, background:th.tableHead, borderBottom:`1px solid ${th.tableBorder}`, textAlign:"left" }
  const td: React.CSSProperties = { padding:"11px 12px", fontSize:12.5, color:th.text1, borderBottom:`1px solid ${th.tableBorder}` }
  const levelColor = (l:string) => l==="C-Level" ? { bg:"#FEF2F2", c:"#D0211C" } : l==="Manager" ? { bg:"#EFF6FF", c:"#1D4ED8" } : { bg:"#F3F4F6", c:"#374151" }

  return (
    <div style={{ padding:"28px 28px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, margin:0 }}>{vi?"Quản lý chức vụ":"Position Management"}</h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>{vi?"Danh sách các vị trí trong tổ chức":"Organization position catalog"}</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          <Plus size={14}/>{vi?"Thêm chức vụ":"Add Position"}
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom:14, position:"relative" }}>
        <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:th.text2 }}/>
        <input placeholder={vi?"Tìm chức vụ...":"Search positions..."} value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"100%", padding:"9px 10px 9px 32px", border:`1.5px solid ${th.inputBorder}`, borderRadius:9, fontSize:13, background:th.inputBg, color:th.text1, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
      </div>

      {/* Table */}
      <div style={{ background:th.cardBg, borderRadius:14, overflow:"hidden", border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            {[vi?"Mã":"Code",vi?"Chức vụ":"Position",vi?"Phòng ban":"Department",vi?"Cấp bậc":"Level",vi?"Biên chế":"Headcount",vi?"Khung lương":"Salary Range",vi?"Thao tác":"Actions"].map(c=><th key={c} style={hd}>{c}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const lc = levelColor(p.level)
              return (
                <tr key={p.id}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=dark?"rgba(255,255,255,0.03)":"#FAFAFA"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                  <td style={{ ...td, color:"#D0211C", fontWeight:700, fontSize:12 }}>{p.code}</td>
                  <td style={{ ...td, fontWeight:600 }}>{p.name}</td>
                  <td style={td}><span style={{ fontSize:11.5, background:th.tableHead, borderRadius:8, padding:"2px 8px" }}>{p.dept}</span></td>
                  <td style={td}><span style={{ background:lc.bg, color:lc.c, borderRadius:10, padding:"2px 10px", fontSize:11.5, fontWeight:700 }}>{p.level}</span></td>
                  <td style={{ ...td, textAlign:"center", fontWeight:700 }}>{p.headcount}</td>
                  <td style={{ ...td, color:"#059669", fontWeight:600 }}>{p.salaryRange}</td>
                  <td style={td}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={{ width:30, height:30, borderRadius:7, border:"none", background:"#EFF6FF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Edit size={13} color="#1D4ED8"/></button>
                      <button style={{ width:30, height:30, borderRadius:7, border:"none", background:"#FEE2E2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Trash2 size={13} color="#991B1B"/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ padding:"10px 14px", background:th.tableHead, borderTop:`1px solid ${th.tableBorder}`, fontSize:12, color:th.text2 }}>
          {filtered.length} {vi?"chức vụ":"positions"}
        </div>
      </div>
    </div>
  )
}
