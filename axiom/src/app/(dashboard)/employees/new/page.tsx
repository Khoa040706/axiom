/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Check } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { DateInput } from "@/components/ui/date-input"
import { useBreakpoint } from "@/hooks/use-breakpoint"

const DEPTS = ["Công nghệ thông tin","Nhân sự","Kinh doanh","Kế toán","Marketing"]
const POSITIONS: Record<string,string[]> = {
  "Công nghệ thông tin": ["Lập trình viên","Senior Dev","Team Lead","Trưởng phòng IT","DevOps","QA Tester"],
  "Nhân sự":             ["Nhân viên HR","HR Senior","Trưởng phòng Nhân sự","Giám đốc nhân sự"],
  "Kinh doanh":          ["Nhân viên kinh doanh","Sales Senior","Trưởng nhóm KD","Giám đốc KD"],
  "Kế toán":             ["Nhân viên kế toán","Kế toán Senior","Kế toán trưởng"],
  "Marketing":           ["Nhân viên Marketing","Marketing Senior","Trưởng phòng Marketing"],
}
const CONTRACT_TYPES = ["Chính thức","Thử việc","Thời vụ"]

const STEPS = ["Thông tin cơ bản","Công việc & Hợp đồng","Lương & Ngân hàng","Xác nhận"]

const EMPTY = {
  // Step 1
  name:"", email:"", phone:"", gender:"Nam", dob:"", cccd:"", address:"",
  // Step 2
  dept:DEPTS[0], pos:"", contractType:"Chính thức", joinDate:"", contractEnd:"",
  // Step 3
  salary:"", allowance:"", numDependents:"0", bankAccount:"", bankName:"Vietcombank", taxCode:"",
}

function Field({ label, children, error }: { label:string; children:React.ReactNode; error?:string }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#6B7280" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize:11, color:"#EF4444" }}>{error}</span>}
    </div>
  )
}

export default function NewEmployeePage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const router = useRouter()
  const { isMobile } = useBreakpoint()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [done, setDone] = useState(false)

  const inp: React.CSSProperties = {
    padding:"9px 12px", border:`1.5px solid ${th.inputBorder}`, borderRadius:9,
    fontSize:13, background:th.inputBg, color:th.text1, outline:"none",
    fontFamily:"inherit", width:"100%", boxSizing:"border-box",
  }
  const inpErr = (f: string): React.CSSProperties => ({
    ...inp, borderColor: errors[f] ? "#EF4444" : th.inputBorder,
  })

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]:v }))
    if (errors[k]) setErrors(p => { const n = {...p}; delete n[k]; return n })
  }

  function validateStep(s: number): boolean {
    const e: Record<string,string> = {}
    if (s === 0) {
      if (!form.name.trim())  e.name  = vi?"Vui lòng nhập họ tên":"Name is required"
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = vi?"Email không hợp lệ":"Invalid email"
      if (!form.dob)          e.dob   = vi?"Vui lòng nhập ngày sinh":"DOB is required"
    }
    if (s === 1) {
      if (!form.pos.trim())   e.pos      = vi?"Vui lòng chọn chức vụ":"Position is required"
      if (!form.joinDate)     e.joinDate = vi?"Vui lòng chọn ngày vào làm":"Join date is required"
    }
    if (s === 2) {
      if (!form.salary || isNaN(Number(form.salary.replace(/\D/g,"")))) e.salary = vi?"Lương không hợp lệ":"Invalid salary"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextStep() { if (validateStep(step)) setStep(s => Math.min(s+1, STEPS.length-1)) }
  function prevStep() { setStep(s => Math.max(s-1, 0)) }

  function handleSubmit() {
    if (!validateStep(step)) return
    setDone(true)
  }

  // ─── Done screen ───
  if (done) return (
    <div style={{ padding:"80px 28px", textAlign:"center" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#059669,#047857)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
        <Check size={32} color="#fff"/>
      </div>
      <h2 style={{ fontSize:22, fontWeight:800, color:th.text1, marginBottom:8 }}>
        {vi?"Thêm nhân viên thành công!":"Employee Created Successfully!"}
      </h2>
      <p style={{ color:th.text2, fontSize:13, marginBottom:24 }}>
        {vi?`${form.name} đã được thêm vào hệ thống.`:`${form.name} has been added to the system.`}
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button onClick={() => router.push("/employees")} style={{ padding:"10px 24px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          {vi?"Về danh sách":"Back to List"}
        </button>
        <button onClick={() => { setDone(false); setStep(0); setForm({...EMPTY}) }} style={{ padding:"10px 24px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:"none", color:th.text2, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          {vi?"Thêm mới":"Add Another"}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "28px 28px 60px" }}>
      {/* Back */}
      <button onClick={() => router.back()} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:`1px solid ${th.cardBorder}`, background:"none", cursor:"pointer", color:th.text2, fontSize:13, fontFamily:"inherit", marginBottom:20 }}>
        <ArrowLeft size={14}/>{vi?"Quay lại":"Back"}
      </button>

      <h1 style={{ fontSize:22, fontWeight:800, color:th.text1, marginBottom:4 }}>{vi?"Thêm nhân viên mới":"Add New Employee"}</h1>
      <p style={{ fontSize:13, color:th.text2, marginBottom:24 }}>{vi?"Điền đầy đủ thông tin theo các bước":"Fill in all information step by step"}</p>

      {/* Step indicators */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:28, gap:0, overflowX: isMobile ? "auto" : "visible" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700,
                background: i < step ? "#059669" : i === step ? "#D0211C" : th.tableHead,
                color: i <= step ? "#fff" : th.text2,
                boxShadow: i === step ? "0 0 0 4px rgba(208,33,28,0.15)" : "none",
              }}>
                {i < step ? <Check size={14}/> : i+1}
              </div>
              <span style={{ fontSize:12, fontWeight: i===step ? 700 : 500, color: i<=step ? th.text1 : th.text2, whiteSpace:"nowrap" }}>
                {s}
              </span>
            </div>
            {i < STEPS.length-1 && <div style={{ flex:1, height:2, background: i < step ? "#059669" : th.tableBorder, margin:"0 10px" }}/>}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div style={{ background:th.cardBg, borderRadius:16, border:`1px solid ${th.cardBorder}`, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", maxWidth:640, margin:"0 auto" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${th.tableBorder}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:"linear-gradient(135deg,#D0211C,#991414)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <User size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:th.text1 }}>{STEPS[step]}</div>
            <div style={{ fontSize:12, color:th.text2 }}>{vi?`Bước ${step+1} / ${STEPS.length}`:`Step ${step+1} of ${STEPS.length}`}</div>
          </div>
        </div>

        <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* Step 0: Thông tin cơ bản */}
          {step === 0 && <>
            <Field label={vi?"Họ và tên *":"Full Name *"} error={errors.name}>
              <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder={vi?"Nguyễn Văn An...":"John Doe..."} style={inpErr("name")}/>
            </Field>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <Field label="Email *" error={errors.email}>
                <input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@gmail.com" style={inpErr("email")}/>
              </Field>
              <Field label={vi?"Điện thoại":"Phone"}>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="0900 000 000" style={inp}/>
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <Field label={vi?"Giới tính":"Gender"}>
                <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={inp}>
                  <option>Nam</option><option>Nữ</option><option>Khác</option>
                </select>
              </Field>
              <Field label={vi?"Ngày sinh *":"Date of Birth *"} error={errors.dob}>
                <DateInput value={form.dob} onChange={e=>set("dob",e.target.value)} style={inpErr("dob")}/>
              </Field>
            </div>
            <Field label={vi?"Số CCCD/CMND":"ID Card Number"}>
              <input value={form.cccd} onChange={e=>set("cccd",e.target.value)} placeholder="079xxxxxxxxx" style={inp}/>
            </Field>
            <Field label={vi?"Địa chỉ thường trú":"Permanent Address"}>
              <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder={vi?"Số nhà, đường, quận, tỉnh/thành phố...":"Address..."} style={inp}/>
            </Field>
          </>}

          {/* Step 1: Công việc & Hợp đồng */}
          {step === 1 && <>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <Field label={vi?"Phòng ban *":"Department *"}>
                <select value={form.dept} onChange={e=>{ set("dept",e.target.value); set("pos","") }} style={inp}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label={vi?"Chức vụ *":"Position *"} error={errors.pos}>
                <select value={form.pos} onChange={e=>set("pos",e.target.value)} style={inpErr("pos")}>
                  <option value="">{vi?"-- Chọn chức vụ --":"-- Select position --"}</option>
                  {(POSITIONS[form.dept]||[]).map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <Field label={vi?"Loại hợp đồng":"Contract Type"}>
                <select value={form.contractType} onChange={e=>set("contractType",e.target.value)} style={inp}>
                  {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={vi?"Ngày vào làm *":"Join Date *"} error={errors.joinDate}>
                <DateInput value={form.joinDate} onChange={e=>set("joinDate",e.target.value)} style={inpErr("joinDate")}/>
              </Field>
            </div>
            <Field label={vi?"Ngày hết hạn hợp đồng":"Contract End Date"}>
              <DateInput value={form.contractEnd} onChange={e=>set("contractEnd",e.target.value)} style={inp}/>
            </Field>
          </>}

          {/* Step 2: Lương & Ngân hàng */}
          {step === 2 && <>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <Field label={vi?"Lương Gross (đồng) *":"Gross Salary (VND) *"} error={errors.salary}>
                <input value={form.salary} onChange={e=>set("salary",e.target.value)} placeholder="15000000" style={inpErr("salary")}/>
              </Field>
              <Field label={vi?"Phụ cấp (đồng)":"Allowance (VND)"}>
                <input value={form.allowance} onChange={e=>set("allowance",e.target.value)} placeholder="2000000" style={inp}/>
              </Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <Field label={vi?"Số người phụ thuộc":"Dependents"}>
                <select value={form.numDependents} onChange={e=>set("numDependents",e.target.value)} style={inp}>
                  {[0,1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
                </select>
              </Field>
              <Field label={vi?"Ngân hàng":"Bank"}>
                <select value={form.bankName} onChange={e=>set("bankName",e.target.value)} style={inp}>
                  {["Vietcombank","Techcombank","BIDV","ACB","MB Bank","VPBank","SHB"].map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>
            <Field label={vi?"Số tài khoản ngân hàng":"Bank Account Number"}>
              <input value={form.bankAccount} onChange={e=>set("bankAccount",e.target.value)} placeholder="1234567890" style={inp}/>
            </Field>
            <Field label={vi?"Mã số thuế cá nhân":"Personal Tax Code"}>
              <input value={form.taxCode} onChange={e=>set("taxCode",e.target.value)} placeholder="0000000000" style={inp}/>
            </Field>
          </>}

          {/* Step 3: Xác nhận */}
          {step === 3 && (
            <div>
              <div style={{ background: dark?"rgba(208,33,28,0.08)":"#FEF2F2", borderRadius:10, padding:"14px 16px", marginBottom:16, border:`1px solid rgba(208,33,28,0.2)` }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#D0211C", marginBottom:8 }}>📋 {vi?"Xác nhận thông tin":"Summary"}</div>
                {[
                  { l:vi?"Tên":"Name",         v:form.name },
                  { l:"Email",                  v:form.email },
                  { l:vi?"Phòng ban":"Dept",    v:form.dept },
                  { l:vi?"Chức vụ":"Position",  v:form.pos },
                  { l:vi?"Loại HĐ":"Contract",  v:form.contractType },
                  { l:vi?"Ngày vào làm":"Join", v:form.joinDate },
                  { l:vi?"Lương Gross":"Gross",  v:Number(form.salary||0).toLocaleString("vi-VN")+(vi ? " đ" : " VND") },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid rgba(208,33,28,0.1)`, fontSize:13 }}>
                    <span style={{ color:"#991414" }}>{r.l}</span>
                    <span style={{ fontWeight:600, color:th.text1 }}>{r.v || "—"}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:12.5, color:th.text2, textAlign:"center" }}>
                {vi?"Vui lòng kiểm tra lại thông tin trước khi lưu.":"Please review all information before saving."}
              </p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${th.tableBorder}`, display:"flex", justifyContent:"space-between", background:th.tableHead, borderRadius:"0 0 16px 16px" }}>
          <button onClick={prevStep} disabled={step===0}
            style={{ padding:"9px 20px", borderRadius:9, border:`1px solid ${th.cardBorder}`, background:`none`, color: step===0 ? th.text3 : th.text1, fontSize:13, fontWeight:600, cursor: step===0?"default":"pointer", fontFamily:"inherit", opacity: step===0?0.4:1 }}>
            ← {vi?"Trước":"Back"}
          </button>
          {step < STEPS.length-1
            ? <button onClick={nextStep} style={{ padding:"9px 24px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#D0211C,#991414)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {vi?"Tiếp theo":"Next"} →
              </button>
            : <button onClick={handleSubmit} style={{ padding:"9px 24px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#059669,#047857)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                ✓ {vi?"Thêm nhân viên":"Create Employee"}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
