/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, User, Mail, Phone, Building2, Briefcase, Calendar, Edit, Save, X,
  Clock, DollarSign, CalendarDays, FileText, Loader2 } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getEmployeeById, updateEmployee } from "@/lib/actions/employee.actions"
import { getEmployeePayroll } from "@/lib/actions/payroll.actions"
import { getLeaveBalance } from "@/lib/actions/leave.actions"
import { getAttendanceByMonth } from "@/lib/actions/attendance.actions"

function fmt(v: number) { return v.toLocaleString("vi-VN") + " đ" }
function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—"
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`
}

export default function EmployeeDetailPage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { id } = useParams()
  const router = useRouter()

  const [emp, setEmp]         = useState<any>(null)
  const [payroll, setPayroll] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [activeTab, setActiveTab] = useState<"info"|"payroll"|"attendance"|"leave">("info")

  const numId = Number(id)

  useEffect(() => {
    if (!numId) return
    const now = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()

    Promise.all([
      getEmployeeById(numId),
      getEmployeePayroll(numId, month, year),
      getLeaveBalance(numId, year),
      getAttendanceByMonth(month, year),
    ]).then(([empRes, payRes, balRes, attRes]) => {
      if (empRes.success) setEmp(empRes.data)
      if (payRes.success) setPayroll(payRes.data)
      if (balRes.success) setBalance(balRes.data)
      if (attRes.success) {
        const empAtt = (attRes.data ?? []).filter((a: any) => a.employeeId === numId)
        setAttendance(empAtt)
      }
      setLoading(false)
    })
  }, [numId])

  async function handleSave() {
    if (!emp) return
    setSaving(true)
    await updateEmployee(emp.id, {
      fullName: emp.fullName,
      phone: emp.phone,
      email: emp.email,
      address: emp.address,
    })
    setSaving(false); setEditing(false)
  }

  const card: React.CSSProperties = {
    background:th.cardBg, borderRadius:14,
    border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)"
  }

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", gap:12, color:th.text2 }}>
      <Loader2 size={24} style={{ animation:"spin 1s linear infinite" }} />
      <span style={{ fontSize:15 }}>{vi?"Đang tải thông tin nhân viên...":"Loading employee data..."}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!emp) return (
    <div style={{ padding:40, textAlign:"center", color:th.text2 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
      <h2 style={{ color:th.text1 }}>{vi?"Không tìm thấy nhân viên":"Employee not found"}</h2>
      <button onClick={()=>router.back()} style={{ marginTop:16, padding:"9px 20px", borderRadius:9, border:"none",
        background:"#D0211C", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 }}>
        ← {vi?"Quay lại":"Back"}
      </button>
    </div>
  )

  const latestContract = emp.contracts?.[0] ?? null
  const workDays = attendance.filter((a: any) => a.status === "Đi làm").length
  const lateCount = attendance.filter((a: any) => a.lateMinutes > 0).length
  const otHoursTotal = attendance.reduce((s: number, a: any) => s + Number(a.otHours || 0), 0)

  const tabs = [
    { key:"info",       label: vi?"Thông tin cá nhân":"Personal Info",   icon:<User size={14}/> },
    { key:"payroll",    label: vi?"Lương & Phúc lợi":"Payroll",           icon:<DollarSign size={14}/> },
    { key:"attendance", label: vi?"Chấm công":"Attendance",               icon:<Clock size={14}/> },
    { key:"leave",      label: vi?"Nghỉ phép":"Leave",                    icon:<CalendarDays size={14}/> },
  ]

  const usedDays  = balance ? Number(balance.usedDays)  : 0
  const totalDays = balance ? Number(balance.totalDays) : 12
  const leftDays  = totalDays - usedDays

  return (
    <div style={{ padding:"28px 28px 40px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Back */}
      <button onClick={()=>router.back()} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
        borderRadius:8, border:`1px solid ${th.cardBorder}`, background:"none", cursor:"pointer",
        color:th.text2, fontSize:13, fontFamily:"inherit", marginBottom:20 }}>
        <ArrowLeft size={14}/>{vi?"Quay lại danh sách":"Back to list"}
      </button>

      {/* Profile header */}
      <div style={{ ...card, padding:"22px 24px", marginBottom:16, display:"flex", alignItems:"center", gap:20 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#D0211C,#991414)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 16px rgba(208,33,28,0.35)" }}>
          <span style={{ fontSize:28, fontWeight:800, color:"#fff" }}>{emp.fullName.charAt(0)}</span>
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:th.text1, margin:0 }}>{emp.fullName}</h1>
          <p style={{ fontSize:13, color:th.text2, margin:"4px 0 0" }}>
            {emp.position?.name || "—"} · {emp.department?.name || "—"}
          </p>
          <div style={{ display:"flex", gap:12, marginTop:10 }}>
            <span style={{ background: emp.status==="Đang làm"?"#D1FAE5":"#FEF3C7",
              color: emp.status==="Đang làm"?"#065F46":"#92400E",
              borderRadius:10, padding:"2px 12px", fontSize:12, fontWeight:700 }}>
              {vi ? emp.status : (emp.status==="Đang làm"?"Active":"Probation")}
            </span>
            {latestContract && (
              <span style={{ background:"#EFF6FF", color:"#1D4ED8", borderRadius:10, padding:"2px 12px", fontSize:12, fontWeight:600 }}>
                {latestContract.contractType}
              </span>
            )}
            <span style={{ fontSize:12, color:th.text2 }}>🪪 {emp.code}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {!editing
            ? <button onClick={()=>setEditing(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px",
                borderRadius:9, border:"none", background:"#EFF6FF", color:"#1D4ED8", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
                <Edit size={14}/>{vi?"Chỉnh sửa":"Edit"}
              </button>
            : <>
                <button onClick={handleSave} disabled={saving} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px",
                  borderRadius:9, border:"none", background:"#D1FAE5", color:"#065F46", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
                  {saving ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> : <Save size={14}/>}
                  {vi?"Lưu":"Save"}
                </button>
                <button onClick={()=>setEditing(false)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
                  borderRadius:9, border:`1px solid ${th.cardBorder}`, background:"none", color:th.text2, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                  <X size={14}/>
                </button>
              </>
          }
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16, background:th.tableHead, borderRadius:10, padding:4, width:"fit-content" }}>
        {tabs.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key as any)} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:7, border:"none",
            background: activeTab===tab.key ? "#D0211C" : "transparent",
            color: activeTab===tab.key ? "#fff" : th.text2,
            fontSize:13, fontWeight: activeTab===tab.key ? 700 : 500, cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
          }}>{tab.icon}{tab.label}</button>
        ))}
      </div>

      {/* ── Tab: Thông tin cá nhân ── */}
      {activeTab==="info" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ ...card, padding:"18px 20px" }}>
            <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <User size={15} color="#D0211C"/> {vi?"Thông tin cá nhân":"Personal Details"}
            </div>
            {[
              { icon:<Mail size={13}/>,     label:vi?"Email":"Email",           val:emp.email },
              { icon:<Phone size={13}/>,    label:vi?"Điện thoại":"Phone",      val:emp.phone },
              { icon:<User size={13}/>,     label:vi?"Giới tính":"Gender",      val:emp.gender },
              { icon:<Calendar size={13}/>, label:vi?"Ngày sinh":"Date of Birth", val:fmtDate(emp.dateOfBirth) },
              { icon:<FileText size={13}/>, label:vi?"CCCD/CMND":"ID Card",     val:emp.idNumber },
              { icon:<Building2 size={13}/>,label:vi?"Địa chỉ":"Address",       val:emp.address },
            ].map(r=>(
              <div key={r.label} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:`1px solid ${th.tableBorder}`, alignItems:"flex-start" }}>
                <span style={{ color:th.text3, marginTop:1 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:th.text2 }}>{r.label}</div>
                  {editing && (r.label===(vi?"Email":"Email") || r.label===(vi?"Điện thoại":"Phone") || r.label===(vi?"Địa chỉ":"Address"))
                    ? <input defaultValue={r.val ?? ""} onChange={e=>setEmp((prev: any)=>({...prev,
                        [r.label===(vi?"Email":"Email")?"email": r.label===(vi?"Điện thoại":"Phone")?"phone":"address"]: e.target.value }))}
                        style={{ marginTop:2, width:"100%", padding:"4px 8px", border:`1px solid ${th.inputBorder}`, borderRadius:6,
                          background:th.inputBg, color:th.text1, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
                    : <div style={{ fontSize:13, color:th.text1, fontWeight:500, marginTop:2 }}>{r.val || "—"}</div>
                  }
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding:"18px 20px" }}>
            <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <Briefcase size={15} color="#D0211C"/> {vi?"Thông tin công việc":"Work Details"}
            </div>
            {[
              { label:vi?"Phòng ban":"Department",        val:emp.department?.name },
              { label:vi?"Chức vụ":"Position",            val:emp.position?.name },
              { label:vi?"Mã nhân viên":"Employee Code",  val:emp.code },
              { label:vi?"Ngày vào làm":"Join Date",      val:fmtDate(emp.hireDate) },
              { label:vi?"Loại hợp đồng":"Contract Type", val:latestContract?.contractType },
              { label:vi?"Hết hạn HĐ":"Contract Ends",   val:fmtDate(latestContract?.endDate) },
              { label:vi?"Mã số thuế":"Tax Code",         val:emp.taxCode },
              { label:vi?"Người phụ thuộc":"Dependents",  val:`${emp.numDependents} ${vi?"người":""}` },
            ].map(r=>(
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
                borderBottom:`1px solid ${th.tableBorder}`, fontSize:13 }}>
                <span style={{ color:th.text2 }}>{r.label}</span>
                <span style={{ fontWeight:600, color:th.text1, textAlign:"right" }}>{r.val || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Lương & Phúc lợi ── */}
      {activeTab==="payroll" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ ...card, padding:"18px 20px" }}>
            <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <DollarSign size={15} color="#D0211C"/>{vi?"Cấu hình lương hợp đồng":"Contract Salary"}
            </div>
            {latestContract ? [
              { label:vi?"Lương cơ bản":"Base Salary",  val:fmt(Number(latestContract.baseSalary)), c:th.text1 },
              { label:vi?"Hệ số lương":"Salary Grade",  val:`× ${latestContract.salaryGrade}`,       c:th.text1 },
              { label:vi?"Phụ cấp":"Allowance",          val:fmt(Number(latestContract.allowance)),  c:"#10B981" },
              { label:`BHXH (8%)`,                       val:`−${fmt(Number(latestContract.baseSalary)*0.08)}`, c:"#EF4444" },
              { label:`BHYT (1.5%)`,                     val:`−${fmt(Number(latestContract.baseSalary)*0.015)}`, c:"#EF4444" },
              { label:`BHTN (1%)`,                       val:`−${fmt(Number(latestContract.baseSalary)*0.01)}`,  c:"#EF4444" },
              { label:vi?"Người phụ thuộc":"Dependents", val:`${emp.numDependents} ${vi?"người":"person(s)"}`,  c:th.text1 },
            ].map(r=>(
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
                borderBottom:`1px solid ${th.tableBorder}`, fontSize:13 }}>
                <span style={{ color:th.text2 }}>{r.label}</span>
                <span style={{ fontWeight:700, color:r.c }}>{r.val}</span>
              </div>
            )) : <div style={{ color:th.text2, fontSize:13 }}>{vi?"Chưa có hợp đồng":"No contract found"}</div>}
          </div>

          <div style={{ ...card, padding:"18px 20px" }}>
            <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:14 }}>
              💰 {vi?"Lương tháng này":"This Month's Payroll"}
            </div>
            {payroll ? (
              <>
                <div style={{ background:"linear-gradient(135deg,#059669,#047857)", borderRadius:12, padding:"16px 18px", color:"#fff", marginBottom:14 }}>
                  <div style={{ fontSize:12, opacity:0.85 }}>{vi?"Lương NET thực lĩnh":"Net Take-home"}</div>
                  <div style={{ fontSize:26, fontWeight:900, marginTop:4 }}>{fmt(Number(payroll.netSalary))}</div>
                </div>
                {[
                  { label:vi?"Gross":"Gross",          val:fmt(Number(payroll.grossSalary)) },
                  { label:`BHXH+BHYT+BHTN`,             val:`−${fmt(Number(payroll.bhxh)+Number(payroll.bhyt)+Number(payroll.bhtn))}` },
                  { label:vi?"Thuế TNCN":"Income Tax",  val:`−${fmt(Number(payroll.taxAmount))}` },
                  { label:vi?"Ngày công":"Work Days",   val:`${payroll.workDays} ngày` },
                  { label:vi?"OT":"OT Hours",           val:`${payroll.otHours}h` },
                ].map(r=>(
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
                    borderBottom:`1px solid ${th.tableBorder}`, fontSize:13 }}>
                    <span style={{ color:th.text2 }}>{r.label}</span>
                    <span style={{ fontWeight:600, color:th.text1 }}>{r.val}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"32px 0", color:th.text2, fontSize:13 }}>
                {vi?"Chưa có bảng lương tháng này":"No payroll data for this month"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Chấm công ── */}
      {activeTab==="attendance" && (
        <div style={{ ...card, padding:"18px 20px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <Clock size={15} color="#D0211C"/>
            {vi?"Chấm công tháng hiện tại":"Attendance This Month"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
            {[
              { label:vi?"Ngày công":"Work Days",    value:`${workDays}`, color:"#059669", bg:"#F0FDF4" },
              { label:vi?"Đi muộn":"Late Arrivals",  value:`${lateCount}`, color:"#D97706", bg:"#FFFBEB" },
              { label:vi?"Giờ tăng ca":"OT Hours",   value:`${otHoursTotal}h`, color:"#8B5CF6", bg:"#EDE9FE" },
            ].map(s=>(
              <div key={s.label} style={{ background:dark?`${s.bg}22`:s.bg, borderRadius:12, padding:"16px",
                border:`1px solid ${th.cardBorder}` }}>
                <div style={{ fontSize:11.5, color:th.text2 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:800, color:s.color, marginTop:6 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {attendance.length === 0 && (
            <div style={{ textAlign:"center", padding:"16px 0", color:th.text2, fontSize:13 }}>
              {vi?"Chưa có dữ liệu chấm công":"No attendance records found"}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Nghỉ phép ── */}
      {activeTab==="leave" && (
        <div style={{ ...card, padding:"18px 20px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:th.text1, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <CalendarDays size={15} color="#D0211C"/>
            {vi?`Quỹ nghỉ phép năm ${new Date().getFullYear()}`:`Leave Balance ${new Date().getFullYear()}`}
          </div>
          {balance ? (
            <>
              {[
                { label:vi?"Tổng ngày phép":"Total Days",  pct:100,                     color:"#94A3B8", val:`${totalDays} ngày` },
                { label:vi?"Đã sử dụng":"Used",            pct:(usedDays/totalDays)*100, color:"#EF4444", val:`${usedDays} ngày` },
                { label:vi?"Còn lại":"Remaining",          pct:(leftDays/totalDays)*100, color:"#10B981", val:`${leftDays} ngày` },
              ].map(l=>(
                <div key={l.label} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                    <span style={{ fontWeight:600, color:th.text1 }}>{l.label}</span>
                    <span style={{ color:th.text2 }}><b style={{ color:l.color }}>{l.val}</b></span>
                  </div>
                  <div style={{ background:th.tableBorder, borderRadius:4, height:8 }}>
                    <div style={{ width:`${Math.min(100,l.pct)}%`, background:l.color, height:"100%", borderRadius:4, transition:"width .5s" }}/>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"32px 0", color:th.text2, fontSize:13 }}>
              {vi?"Chưa có dữ liệu quỹ phép":"No leave balance data found"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
