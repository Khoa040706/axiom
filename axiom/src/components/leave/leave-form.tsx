"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { LEAVE_TYPES } from "@/lib/constants"

interface LeaveFormData {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

interface LeaveFormProps {
  onSubmit: (data: LeaveFormData) => void
  onCancel: () => void
}

const EMPTY: LeaveFormData = {
  leaveType: LEAVE_TYPES[0], startDate: "", endDate: "", reason: "",
}

export function LeaveForm({ onSubmit, onCancel }: LeaveFormProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const [form, setForm] = useState<LeaveFormData>({ ...EMPTY })
  const [errors, setErrors] = useState<Partial<LeaveFormData>>({})

  const inp: React.CSSProperties = {
    padding: "9px 12px", border: `1px solid ${th.inputBorder}`,
    borderRadius: 8, fontSize: 13, background: th.inputBg,
    color: th.text1, outline: "none", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
  }

  function validate(): boolean {
    const e: Partial<LeaveFormData> = {}
    if (!form.startDate) e.startDate = vi ? "Chọn ngày bắt đầu" : "Select start date"
    if (!form.endDate)   e.endDate   = vi ? "Chọn ngày kết thúc" : "Select end date"
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      e.endDate = vi ? "Ngày kết thúc phải sau ngày bắt đầu" : "End date must be after start date"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const set = (key: keyof LeaveFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#D0211C,#F97316)", padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
          {vi ? "Tạo đơn nghỉ phép" : "Create Leave Request"}
        </div>
        <button type="button" onClick={onCancel} style={{
          background: "rgba(255,255,255,0.2)", border: "none",
          borderRadius: 8, width: 32, height: 32, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={16} color="#fff" />
        </button>
      </div>

      {/* Body */}
      <div style={{
        padding: "24px", display: "flex", flexDirection: "column", gap: 16,
        background: th.cardBg,
      }}>
        {/* Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: th.text2 }}>
            {vi ? "Loại nghỉ phép *" : "Leave Type *"}
          </label>
          <select value={form.leaveType} onChange={set("leaveType")} style={{ ...inp, marginTop: 5 }}>
            {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Date range */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: th.text2 }}>
              {vi ? "Từ ngày *" : "From *"}
            </label>
            <input type="date" value={form.startDate} onChange={set("startDate")}
              style={{ ...inp, marginTop: 5, borderColor: errors.startDate ? "#EF4444" : undefined }} />
            {errors.startDate && <span style={{ fontSize: 11, color: "#EF4444" }}>{errors.startDate}</span>}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: th.text2 }}>
              {vi ? "Đến ngày *" : "To *"}
            </label>
            <input type="date" value={form.endDate} onChange={set("endDate")}
              style={{ ...inp, marginTop: 5, borderColor: errors.endDate ? "#EF4444" : undefined }} />
            {errors.endDate && <span style={{ fontSize: 11, color: "#EF4444" }}>{errors.endDate}</span>}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: th.text2 }}>
            {vi ? "Lý do" : "Reason"}
          </label>
          <textarea value={form.reason} onChange={set("reason")}
            placeholder={vi ? "Nhập lý do xin nghỉ..." : "Enter reason..."}
            rows={3}
            style={{ ...inp, marginTop: 5, resize: "vertical" as const }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 24px", borderTop: `1px solid ${th.cardBorder}`,
        display: "flex", justifyContent: "flex-end", gap: 10, background: th.tableHead,
      }}>
        <button type="button" onClick={onCancel} style={{
          padding: "9px 18px", borderRadius: 8,
          border: `1px solid ${th.inputBorder}`, background: th.cardBg, color: th.text1,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>
          {vi ? "Hủy" : "Cancel"}
        </button>
        <button type="submit" style={{
          padding: "9px 22px", borderRadius: 8,
          border: "none", background: "#D0211C", color: "#fff",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>
          {vi ? "Gửi đơn" : "Submit"}
        </button>
      </div>
    </form>
  )
}
