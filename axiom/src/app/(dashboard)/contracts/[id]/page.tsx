"use client"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export default function ContractDetailPage(){
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { id } = useParams()
  const router = useRouter()
  const { isMobile } = useBreakpoint()

  const contract = {
    id: id as string, empName:"Nguyễn Văn An", empId:"NV001", dept:"Công nghệ thông tin",
    type:"Chính thức", start:"01/01/2024", end:"31/12/2026",
    baseSalary:"25.000.000đ", salaryGrade:"1.0", allowance:"3.000.000đ",
    signDate:"28/12/2023", status:"Hiệu lực",
    note:"Hợp đồng lao động chính thức không xác định thời hạn.",
  }

  return (
    <div style={{ padding: isMobile ? "16px 16px 32px" : "28px 28px 40px" }}>
      <button onClick={() => router.back()} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:`1px solid ${th.cardBorder}`, background:"none", cursor:"pointer", color:th.text2, fontSize:13, fontFamily:"inherit", marginBottom:16 }}>
        <ArrowLeft size={14}/>{vi?"Quay lại":"Back"}
      </button>

      <div style={{ background:th.cardBg, borderRadius:16, border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", maxWidth: isMobile ? "100%" : 560, margin:"0 auto" }}>
        <div style={{ padding:"20px 24px", borderBottom:`2px solid #D0211C`, background:"linear-gradient(135deg,rgba(208,33,28,0.06),rgba(153,20,20,0.02))" }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:th.text1, margin:0 }}>📋 {vi?"HỢP ĐỒNG LAO ĐỘNG":"LABOR CONTRACT"}</h2>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>{contract.id}</p>
        </div>
        <div style={{ padding:"16px 24px" }}>
          {[
            { l:vi?"Nhân viên":"Employee",       v:`${contract.empName} (${contract.empId})` },
            { l:vi?"Phòng ban":"Department",     v:contract.dept },
            { l:vi?"Loại hợp đồng":"Type",      v:contract.type },
            { l:vi?"Ngày ký":"Sign Date",         v:contract.signDate },
            { l:vi?"Ngày bắt đầu":"Start",       v:contract.start },
            { l:vi?"Ngày kết thúc":"End",         v:contract.end },
            { l:vi?"Lương cơ bản":"Base Salary",  v:contract.baseSalary },
            { l:vi?"Hệ số lương":"Grade",         v:contract.salaryGrade },
            { l:vi?"Phụ cấp":"Allowance",         v:contract.allowance },
            { l:vi?"Trạng thái":"Status",         v:contract.status },
            { l:vi?"Ghi chú":"Notes",             v:contract.note },
          ].map(r => (
            <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${th.tableBorder}`, fontSize:13 }}>
              <span style={{ color:th.text2 }}>{r.l}</span>
              <span style={{ fontWeight:600, color:th.text1, textAlign:"right", maxWidth:"60%" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
