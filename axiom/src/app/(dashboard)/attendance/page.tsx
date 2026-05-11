/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Filter, Download, Calendar, Search, X, Loader2, Eye, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"
import { getAttendanceByMonth, getTodayAttendance } from "@/lib/actions/attendance.actions"
import { matchAny } from "@/lib/utils/search"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useSession } from "next-auth/react"
import { DEPT_VI_TO_EN } from "@/lib/i18n-maps"

// Tự động sinh danh sách tháng từ T1 → tháng hiện tại
const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1 // 1-12
const MONTHS_VI = Array.from({ length: CURRENT_MONTH }, (_, i) => `Tháng ${i + 1}/${CURRENT_YEAR}`)
const MONTHS_EN = Array.from({ length: CURRENT_MONTH }, (_, i) => {
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  return `${names[i]} ${CURRENT_YEAR}`
})
const MONTH_NUM = Array.from({ length: CURRENT_MONTH }, (_, i) => i + 1)

export default function AttendancePage() {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"
  const { isMobile } = useBreakpoint()
  const MONTHS = vi ? MONTHS_VI : MONTHS_EN
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role ?? ""
  const userDept = (session?.user as any)?.department ?? ""
  const isManager = userRole === "Manager"
  const exporterName = (session?.user as any)?.name ?? (vi ? "Người dùng" : "User")

  const [showFilter, setShowFilter] = useState(false)
  const [monthIdx, setMonthIdx]     = useState(MONTH_NUM.length - 1)
  const [q, setQ]                   = useState("")
  const [muonF, setMuonF]           = useState<"all"|"yes"|"no">("all")
  const [otF, setOtF]               = useState<"all"|"yes"|"no">("all")
  const [page, setPage]             = useState(0)
  const [todayPage, setTodayPage]   = useState(0)
  const PAGE_SIZE       = 10
  const TODAY_PAGE_SIZE = 8
  const tableRef = useRef<HTMLDivElement>(null)

  const [staff, setStaff]   = useState<any[]>([])
  const [today, setToday]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null)
  const [detailRecords, setDetailRecords] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  // rawMap lưu toàn bộ records theo employeeId để dùng trong modal
  const [rawByEmp, setRawByEmp] = useState<Map<number,any[]>>(new Map())

  const load = useCallback(async () => {
    setLoading(true)
    const month = MONTH_NUM[monthIdx]
    const [monthRes, todayRes] = await Promise.all([
      getAttendanceByMonth(month, 2026),
      getTodayAttendance(),
    ])

    if (monthRes.success && monthRes.data) {
      // Manager chỉ thấy nhân viên thuộc phòng mình
      const allRecs = (monthRes.data as any[]).filter(rec => {
        if (!isManager) return true
        const deptName = rec.employee?.department?.name ?? ""
        return deptName === userDept
      })
      const empMap = new Map<number, any>()
      for (const rec of allRecs) {
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
      // Lưu raw records để dùng trong modal
      const empRaw = new Map<number, any[]>()
      for (const rec of allRecs) {
        const empId = rec.employeeId
        if (!empRaw.has(empId)) empRaw.set(empId, [])
        empRaw.get(empId)!.push(rec)
      }
      setRawByEmp(empRaw)
    }

    if (todayRes.success && todayRes.data) {
      // Manager chỉ thấy nhân viên phòng mình
      const todayRecs = (todayRes.data as any[]).filter(rec => {
        if (!isManager) return true
        const deptName = rec.employee?.department?.name ?? ""
        return deptName === userDept
      })
      setToday(todayRecs.map(rec => {
        const checkIn  = rec.checkIn  ? new Date(rec.checkIn)  : null
        const checkOut = rec.checkOut ? new Date(rec.checkOut) : null

        // Tính giờ làm: trừ 90 phút nghỉ trưa nếu làm qua khung 11:30 → 13:00
        // Cap giờ bắt đầu tại 7:30 — tới sớm không tính thêm giờ
        let lamH = "—"
        if (checkIn && checkOut) {
          const effectiveCI = new Date(checkIn)
          const minStart = new Date(checkIn); minStart.setHours(7, 30, 0, 0)
          if (effectiveCI < minStart) effectiveCI.setTime(minStart.getTime())
          const rawMs = checkOut.getTime() - effectiveCI.getTime()
          const ciH = effectiveCI.getHours() + effectiveCI.getMinutes() / 60
          const coH = checkOut.getHours() + checkOut.getMinutes() / 60
          const lunchMs = (ciH < 11.5 && coH > 13.0) ? 90 * 60 * 1000 : 0
          const netH = Math.max(0, (rawMs - lunchMs) / 3_600_000)
          lamH = `${netH.toFixed(1)}h`
        }

        // Đi muộn nếu checkin sau 7:30 (hoặc theo lateMinutes từ DB)
        const lateByDB   = (rec.lateMinutes ?? 0) > 0
        const lateByTime = checkIn ? (checkIn.getHours() * 60 + checkIn.getMinutes()) > 7 * 60 + 30 : false
        const isLate     = lateByDB || lateByTime
        const noData     = !checkIn // NV không có giờ vào → chưa chấm công

        // Không check-out: đã check-in, qua 17:00, nhưng không có checkOut
        const nowH = new Date().getHours()
        const noCheckout = checkIn && !checkOut && nowH >= 17

        // Xác định trạng thái kết hợp
        let st: string = "ontime"
        if (noData) st = "nodata"
        else if (isLate && noCheckout) st = "late+noco"
        else if (isLate) st = "late"
        else if (noCheckout) st = "noco"

        // Notes: bổ sung "Không check-out" nếu chưa có trong notes
        let notes = rec.notes ?? ""
        if (noCheckout && !notes.includes("check-out")) {
          notes = notes ? notes + " | Không check-out" : "Không check-out"
        }

        return {
          name: rec.employee?.fullName ?? "—",
          vao:  checkIn  ? checkIn.toLocaleTimeString("vi-VN",  { hour:"2-digit", minute:"2-digit" }) : "—",
          ra:   checkOut ? checkOut.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" }) : "—",
          lam:  lamH,
          st,
          notes,
        }
      }))
    }
    setLoading(false)
  }, [monthIdx])

  useEffect(() => { load() }, [load])

  // ── Auto-refresh bảng hôm nay mỗi 5 phút ──
  useEffect(() => {
    const interval = setInterval(() => {
      getTodayAttendance().then(res => {
        if (!res.success || !res.data) return
        const todayRecs = (res.data as any[]).filter(rec => {
          if (!isManager) return true
          const deptName = rec.employee?.department?.name ?? ""
          return deptName === userDept
        })
        setToday(todayRecs.map(rec => {
          const checkIn  = rec.checkIn  ? new Date(rec.checkIn)  : null
          const checkOut = rec.checkOut ? new Date(rec.checkOut) : null
          let lamH = "—"
          if (checkIn && checkOut) {
            const effectiveCI = new Date(checkIn)
            const minStart = new Date(checkIn); minStart.setHours(7, 30, 0, 0)
            if (effectiveCI < minStart) effectiveCI.setTime(minStart.getTime())
            const rawMs = checkOut.getTime() - effectiveCI.getTime()
            const ciH = effectiveCI.getHours() + effectiveCI.getMinutes() / 60
            const coH = checkOut.getHours() + checkOut.getMinutes() / 60
            const lunchMs = (ciH < 11.5 && coH > 13.0) ? 90 * 60 * 1000 : 0
            const netH = Math.max(0, (rawMs - lunchMs) / 3_600_000)
            lamH = `${netH.toFixed(1)}h`
          }
          const lateByDB   = (rec.lateMinutes ?? 0) > 0
          const lateByTime = checkIn ? (checkIn.getHours() * 60 + checkIn.getMinutes()) > 7 * 60 + 30 : false
          const isLate     = lateByDB || lateByTime
          const noData     = !checkIn
          const nowH2 = new Date().getHours()
          const noCheckout2 = checkIn && !checkOut && nowH2 >= 17
          let st2: string = "ontime"
          if (noData) st2 = "nodata"
          else if (isLate && noCheckout2) st2 = "late+noco"
          else if (isLate) st2 = "late"
          else if (noCheckout2) st2 = "noco"
          let notes2 = rec.notes ?? ""
          if (noCheckout2 && !notes2.includes("check-out")) {
            notes2 = notes2 ? notes2 + " | Không check-out" : "Không check-out"
          }
          return {
            name: rec.employee?.fullName ?? "—",
            vao:  checkIn  ? checkIn.toLocaleTimeString("vi-VN",  { hour:"2-digit", minute:"2-digit" }) : "—",
            ra:   checkOut ? checkOut.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" }) : "—",
            lam:  lamH,
            st:   st2,
            notes: notes2,
          }
        }))
      })
    }, 5 * 60 * 1000) // 5 phút
    return () => clearInterval(interval)
  }, [isManager, userDept])

  const rows = staff.filter(s => {
    const matchQ    = matchAny([s.name, s.id, s.dept], q)
    const matchMuon = muonF === "all" || (muonF === "yes" ? s.muon > 0 : s.muon === 0)
    const matchOt   = otF   === "all" || (otF   === "yes" ? s.ot   > 0 : s.ot   === 0)
    return matchQ && matchMuon && matchOt
  })

  const hasFilter = !!(q || muonF !== "all" || otF !== "all")
  function resetFilter() { setQ(""); setMuonF("all"); setOtF("all"); setPage(0) }

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows   = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page khi filter/tháng thay đổi
  useEffect(() => { setPage(0) }, [q, muonF, otF, monthIdx])

  async function exportPDF() {
    const now = new Date()
    const dateStr = now.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" })
    const timeStr = now.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" })
    const monthLabel = MONTHS[monthIdx]
    const fileName = `bao-cao-cham-cong-t${MONTH_NUM[monthIdx]}-2026.pdf`

    // KPI stats
    const totalEmp  = rows.length
    const avgDays   = totalEmp ? (rows.reduce((s, r) => s + r.ngay, 0) / totalEmp).toFixed(1) : "0"
    const totalOT   = rows.reduce((s, r) => s + r.ot, 0)
    const totalLate = rows.filter(r => r.muon > 0).length

    const colHeaders = vi
      ? ["Mã NV", "Họ và tên", "Phòng ban", "Ngày công", "Đi muộn", "Giờ OT"]
      : ["Emp. ID", "Full Name", "Department", "Workdays", "Late", "OT Hours"]

    const tableRows = rows.map((s, i) => {
      const deptLabel = vi ? s.dept : (DEPT_VI_TO_EN[s.dept] ?? s.dept)
      return `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}">
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#6B7280">${s.id}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;font-weight:600;color:#111827">${s.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#374151">${deptLabel}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:${s.ngay >= 22 ? "#059669" : s.ngay >= 18 ? "#D97706" : "#DC2626"};text-align:center">${s.ngay}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center">${s.muon > 0
          ? `<span style="background:#FEF3C7;color:#92400E;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${s.muon} ${vi ? "lần" : "times"}</span>`
          : `<span style="color:#10B981;font-size:12px;font-weight:600">✓</span>`
        }</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;font-weight:600;color:${s.ot > 0 ? "#3B82F6" : "#9CA3AF"};text-align:center">${s.ot > 0 ? s.ot + "h" : "—"}</td>
      </tr>`
    }).join("")

    // Tạo iframe ẩn để render HTML → không mở tab mới
    const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Be Vietnam Pro', Arial, sans-serif; background: #fff; }
  .header { background: #C41210; padding: 22px 40px; display: flex; justify-content: space-between; align-items: center; }
  .brand { color: #fff; font-size: 26px; font-weight: 900; letter-spacing: 4px; }
  .brand-sub { font-size: 9.5px; color: rgba(255,255,255,0.65); margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; }
  .title-right { text-align: right; }
  .title-right h1 { color: #fff; font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .title-right .date { color: rgba(255,255,255,0.75); font-size: 11.5px; margin-bottom: 8px; }
  .period-badge { display: inline-block; background: rgba(0,0,0,0.35); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .kpi-bar { display: flex; background: #fff; border-bottom: 1px solid #f0f0f0; }
  .kpi { flex: 1; padding: 20px 24px; border-right: 1px solid #f0f0f0; }
  .kpi:last-child { border-right: none; }
  .kpi-label { font-size: 10px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .kpi-value { font-size: 26px; font-weight: 800; }
  .kpi-sub   { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
  .section { padding: 24px 40px 32px; }
  .section-title { font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; display: flex; align-items: center; gap: 8px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #D0211C; flex-shrink: 0; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; background: #f9fafb; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
  .legend { display: flex; gap: 20px; margin-top: 16px; font-size: 11px; color: #6B7280; }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .leg-dot { width: 10px; height: 10px; border-radius: 2px; }
  .footer { margin: 0 40px 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 11px; color: #9CA3AF; line-height: 1.6; }
  .footer-right { font-size: 10px; color: #D0211C; font-weight: 600; background: #FEF2F2; padding: 6px 12px; border-radius: 8px; border: 1px solid #FECACA; text-align: center; }
</style>
</head><body>
<div id="content">
  <div class="header">
    <div>
      <div class="brand">AXIOM</div>
      <div class="brand-sub">HRM &amp; Payroll Management System</div>
    </div>
    <div class="title-right">
      <h1>${vi ? "BÁO CÁO CHẤM CÔNG" : "ATTENDANCE REPORT"}</h1>
      <div class="date">${vi ? "Ngày xuất" : "Exported"}: ${dateStr} ${timeStr}</div>
      <span class="period-badge">${monthLabel} • ${totalEmp} ${vi ? "NV" : "emp"}</span>
    </div>
  </div>
  <div class="kpi-bar">
    <div class="kpi"><div class="kpi-label">${vi ? "Nhân viên" : "Employees"}</div><div class="kpi-value" style="color:#D0211C">${totalEmp}</div><div class="kpi-sub">${vi ? "trong danh sách" : "in report"}</div></div>
    <div class="kpi"><div class="kpi-label">${vi ? "TB Ngày công" : "Avg Workdays"}</div><div class="kpi-value" style="color:#059669">${avgDays}</div><div class="kpi-sub">${vi ? "ngày/người" : "days/person"}</div></div>
    <div class="kpi"><div class="kpi-label">${vi ? "Tổng giờ OT" : "Total OT Hours"}</div><div class="kpi-value" style="color:#3B82F6">${totalOT}h</div><div class="kpi-sub">${vi ? "toàn bộ nhân viên" : "across all staff"}</div></div>
    <div class="kpi"><div class="kpi-label">${vi ? "Đi muộn" : "Late Arrivals"}</div><div class="kpi-value" style="color:#D97706">${totalLate}</div><div class="kpi-sub">${vi ? "nhân viên" : "employees"}</div></div>
  </div>
  <div class="section">
    <div class="section-title"><span class="dot"></span>${vi ? "Chi tiết chấm công" : "Attendance Detail"}</div>
    <table>
      <thead><tr>${colHeaders.map((h, i) => `<th style="text-align:${i >= 3 ? "center" : "left"}">${h}</th>`).join("")}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="legend">
      <span style="font-weight:600;color:#374151">${vi ? "Chú thích:" : "Legend:"}</span>
      <div class="legend-item"><div class="leg-dot" style="background:#059669"></div> ${vi ? "≥22 ngày" : "≥22 days"}</div>
      <div class="legend-item"><div class="leg-dot" style="background:#D97706"></div> ${vi ? "18–21 ngày" : "18–21 days"}</div>
      <div class="legend-item"><div class="leg-dot" style="background:#DC2626"></div> ${vi ? "<18 ngày" : "<18 days"}</div>
    </div>
  </div>

  <!-- Signature section -->
  <div style="margin: 28px 40px 0; display: flex; justify-content: space-between; gap: 40px;">
    <!-- Người lập báo cáo -->
    <div style="flex: 1; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
        ${vi ? "Người lập báo cáo" : "Prepared by"}
      </div>
      <div style="font-size: 9.5px; color: #9CA3AF; margin-bottom: 56px; font-style: italic;">
        ${vi ? "(Ký, ghi rõ họ tên)" : "(Signature & full name)"}
      </div>
      <div style="border-top: 1.5px solid #374151; padding-top: 6px;">
        <div style="font-size: 12px; font-weight: 700; color: #111827;">${exporterName}</div>
        <div style="font-size: 9.5px; color: #6B7280; margin-top: 2px;">${dateStr}</div>
      </div>
    </div>

    <!-- Trưởng phòng Nhân sự -->
    <div style="flex: 1; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
        ${vi ? "Trưởng phòng Nhân sự" : "HR Manager"}
      </div>
      <div style="font-size: 9.5px; color: #9CA3AF; margin-bottom: 56px; font-style: italic;">
        ${vi ? "(Ký, ghi rõ họ tên)" : "(Signature & full name)"}
      </div>
      <div style="border-top: 1.5px solid #374151; padding-top: 6px;">
        <div style="font-size: 12px; font-weight: 700; color: #111827;">&nbsp;</div>
        <div style="font-size: 9.5px; color: #6B7280; margin-top: 2px;">&nbsp;</div>
      </div>
    </div>

    <!-- Giám đốc -->
    <div style="flex: 1; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
        ${vi ? "Giám đốc" : "Director"}
      </div>
      <div style="font-size: 9.5px; color: #9CA3AF; margin-bottom: 56px; font-style: italic;">
        ${vi ? "(Ký, đóng dấu)" : "(Signature & stamp)"}
      </div>
      <div style="border-top: 1.5px solid #374151; padding-top: 6px;">
        <div style="font-size: 12px; font-weight: 700; color: #111827;">&nbsp;</div>
        <div style="font-size: 9.5px; color: #6B7280; margin-top: 2px;">&nbsp;</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left"><strong>AXIOM HRM System</strong><br>axiomhrmpayroll@gmail.com &nbsp;|&nbsp; ${vi ? "Tạo bởi" : "Generated by"} AXIOM v1.0</div>
    <div class="footer-right">${vi ? "TÀI LIỆU NỘI BỘ" : "INTERNAL DOCUMENT"}<br><span style="font-size:9px;font-weight:400;color:#9CA3AF">${vi ? "Không phát hành ra ngoài" : "Not for external distribution"}</span></div>
  </div>
</div>
</body></html>`

    // Tải script động rồi render PDF ngay trong trang — không mở tab mới
    function loadScript(src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const s = document.createElement("script")
        s.src = src; s.onload = () => resolve(); s.onerror = reject
        document.head.appendChild(s)
      })
    }

    // Load font hỗ trợ tiếng Việt vào document để html2canvas có thể dùng
    function loadFont(href: string): Promise<void> {
      return new Promise(resolve => {
        if (document.querySelector(`link[href="${href}"]`)) { resolve(); return }
        const link = document.createElement("link")
        link.rel = "stylesheet"; link.href = href
        link.onload = () => resolve()
        link.onerror = () => resolve() // fallback nếu offline
        document.head.appendChild(link)
      })
    }

    try {
      await Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
        loadFont("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap"),
      ])

      // Chờ font load xong — quan trọng để render tiếng Việt đúng
      await document.fonts.ready

      // ── Tạo container ẩn để render toàn bộ nội dung
      // Dùng top:-9999px thay vì left:-9999px để html2canvas capture đúng
      const container = document.createElement("div")
      container.style.cssText = "position:fixed;left:0;top:-9999px;width:794px;background:#fff;font-family:'Be Vietnam Pro',Arial,sans-serif"
      container.innerHTML = html
      document.body.appendChild(container)

      await new Promise(r => setTimeout(r, 700)) // chờ font + CSS apply

      const h2c = (window as any).html2canvas
      const canvas = await h2c(container.querySelector("#content"), {
        scale: 2, useCORS: true, backgroundColor: "#fff", logging: false,
      })
      document.body.removeChild(container)

      const imgData   = canvas.toDataURL("image/png")
      const { jsPDF } = (window as any).jspdf
      const pdf       = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pw        = pdf.internal.pageSize.getWidth()   // 210 mm
      const ph        = pdf.internal.pageSize.getHeight()  // 297 mm
      const imgH      = (canvas.height * pw) / canvas.width
      const miniH     = 14  // mm — chiều cao mini-header

      // ── Hàm vẽ mini-header bằng jsPDF (không dùng html2canvas để tránh lỗi capture)
      function drawMiniHeader() {
        try {
          // Nền đỏ
          pdf.setFillColor(196, 18, 16)
          pdf.rect(0, 0, pw, miniH, "F")
          // Dải cam bên dưới
          pdf.setFillColor(249, 115, 22)
          pdf.rect(0, miniH - 1.2, pw, 1.2, "F")

          // Chữ AXIOM (trắng, to)
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(14)
          pdf.setFont("helvetica", "bold")
          pdf.text("AXIOM", 10, 7.5)

          // Subtitle nhỏ — dùng xám sáng (3 args RGB, KHÔNG dùng 4 args)
          pdf.setFontSize(5.5)
          pdf.setFont("helvetica", "normal")
          pdf.setTextColor(210, 180, 180)
          pdf.text("HRM & PAYROLL MANAGEMENT SYSTEM", 10, 11.5)

          // Tên báo cáo (căn phải)
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(10)
          pdf.setFont("helvetica", "bold")
          const title = vi ? "BAO CAO CHAM CONG" : "ATTENDANCE REPORT"
          pdf.text(title, pw - 10, 7.5, { align: "right" })

          // Tháng / số NV
          pdf.setFontSize(7)
          pdf.setFont("helvetica", "normal")
          pdf.setTextColor(220, 200, 200)
          pdf.text(`${monthLabel} - ${totalEmp} ${vi ? "NV" : "emp"}`, pw - 10, 11.5, { align: "right" })
        } catch (e) {
          console.error("drawMiniHeader failed", e)
        }
      }

      if (imgH <= ph) {
        // Vừa 1 trang — không cần mini-header
        pdf.addImage(imgData, "PNG", 0, 0, pw, imgH)
      } else {
        // Trang 1: full content từ y=0 (đã có header đầy đủ bên trong)
        pdf.addImage(imgData, "PNG", 0, 0, pw, imgH)

        // Trang 2 trở đi: vẽ mini-header rồi đặt nội dung bên dưới
        const contentPerPage = ph - miniH  // diện tích nội dung mỗi trang
        let consumed = ph  // đã hiển thị được bao nhiêu mm nội dung

        while (consumed < imgH) {
          pdf.addPage()
          // 1. Đặt ảnh nội dung trước (offset để tiếp nối đúng chỗ)
          pdf.addImage(imgData, "PNG", 0, miniH - consumed, pw, imgH)
          // 2. Vẽ mini-header ĐÈ LÊN image — phải vẽ sau để không bị image che
          drawMiniHeader()
          consumed += contentPerPage
        }
      }
      pdf.save(fileName) // tự tải xuống, không cần mở tab

    } catch (err) {
      console.error("[exportPDF]", err)
      alert(vi ? "Xuất PDF thất bại. Vui lòng thử lại." : "PDF export failed. Please try again.")
    }
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
          <div key={s.label} style={{ background:th.cardBg, borderRadius:12, padding:"14px", borderTop:`1px solid ${th.cardBorder}`, borderRight:`1px solid ${th.cardBorder}`, borderBottom:`1px solid ${th.cardBorder}`, borderLeft:`4px solid ${s.accent}` }}>
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
            ) : pageRows.map(s=> (
              <tr key={s.id}>
                <td style={td}><span style={{ fontWeight:700, color:"#D0211C", fontSize:12 }}>{s.id}</span></td>
                <td style={td}><div style={{ fontWeight:600 }}>{s.name}</div><div style={{ fontSize:11.5, color:th.text3 }}>{vi ? s.dept : (DEPT_VI_TO_EN[s.dept] ?? s.dept)}</div></td>
                <td style={td}>{vi ? (s.dept || "—") : ((DEPT_VI_TO_EN[s.dept] ?? s.dept) || "—")}</td>
                <td style={td}><span style={{ fontWeight:700, color:s.ngay<20?"#EF4444":"#10B981" }}>{s.ngay}</span></td>
                <td style={td}>{s.muon>0?<span style={{ background:"#FEF3C7", color:"#92400E", borderRadius:12, padding:"2px 8px", fontSize:12 }}>{s.muon}</span>:<span style={{ color:th.text3 }}>0</span>}</td>
                <td style={td}><span style={{ color:s.ot===0?th.text3:"#3B82F6", fontWeight:s.ot===0?400:600 }}>{s.ot}h</span></td>
                <td style={td}><span style={{ color:s.phut===0?th.text3:"#F59E0B" }}>{s.phut}{vi?"p":"m"}</span></td>
                <td style={td}>
                  <button
                    onClick={() => {
                      // Tìm employeeId từ staff id
                      const empId = [...rawByEmp.entries()].find(([,recs]) =>
                        (recs[0]?.employee?.code ?? `EMP${recs[0]?.employeeId}`) === s.id
                      )?.[0]
                      const recs = empId !== undefined ? (rawByEmp.get(empId) ?? []) : []
                      setDetailRecords(recs.sort((a:any,b:any) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime()))
                      setSelectedStaff(s)
                    }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 8, border: "none",
                      background: dark ? "rgba(59,130,246,0.15)" : "#EFF6FF",
                      color: "#3B82F6", cursor: "pointer", fontSize: 12.5,
                      fontWeight: 600, fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#3B82F6"; e.currentTarget.style.color = "#fff" }}
                    onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(59,130,246,0.15)" : "#EFF6FF"; e.currentTarget.style.color = "#3B82F6" }}
                  >
                    <Eye size={13}/>{vi ? "Chi tiết" : "Details"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>{/* end table-scroll */}

        {/* ── Pagination bar ── */}
        <div style={{
          padding:"12px 16px", borderTop:`1px solid ${th.tableBorder}`,
          background:th.tableHead, display:"flex", justifyContent:"space-between",
          alignItems:"center", gap:12, flexWrap:"wrap",
        }}>
          {/* Info text */}
          <span style={{ fontSize:12, color:th.text2, flexShrink:0 }}>
            {vi
              ? `Hiển thị ${page*PAGE_SIZE+1}–${Math.min((page+1)*PAGE_SIZE, rows.length)} / ${rows.length} nhân viên`
              : `Showing ${page*PAGE_SIZE+1}–${Math.min((page+1)*PAGE_SIZE, rows.length)} of ${rows.length} employees`
            }
          </span>

          {/* Page controls */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(0, p-1))}
              disabled={page === 0}
              style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${th.cardBorder}`,
                background: page===0 ? th.tableHead : th.cardBg,
                color: page===0 ? th.text3 : th.text1,
                cursor: page===0 ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, transition:"all .15s",
              }}
            >‹</button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }).map((_, i) => {
              // Hiển thị: first, last, current±1, còn lại dùng "..."
              if (totalPages <= 7 || i === 0 || i === totalPages-1 || Math.abs(i-page) <= 1) {
                return (
                  <button key={i} onClick={() => setPage(i)} style={{
                    minWidth:32, height:32, borderRadius:8, border:"none",
                    background: i===page ? "#D0211C" : th.cardBg,
                    color:      i===page ? "#fff"    : th.text2,
                    cursor:"pointer", fontSize:12.5, fontWeight: i===page ? 700 : 400,
                    fontFamily:"inherit", transition:"all .15s",
                    boxShadow: i===page ? "0 2px 8px rgba(208,33,28,0.3)" : "none",
                  }}>{i+1}</button>
                )
              }
              if (Math.abs(i-page) === 2) {
                return <span key={i} style={{ color:th.text3, fontSize:12 }}>…</span>
              }
              return null
            })}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages-1, p+1))}
              disabled={page === totalPages-1}
              style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${th.cardBorder}`,
                background: page===totalPages-1 ? th.tableHead : th.cardBg,
                color: page===totalPages-1 ? th.text3 : th.text1,
                cursor: page===totalPages-1 ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, transition:"all .15s",
              }}
            >›</button>
          </div>

          {/* Clear filter */}
          {hasFilter && <button onClick={resetFilter} style={{ fontSize:12, color:"#D0211C", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>{vi?"Xóa bộ lọc":"Clear filter"}</button>}
        </div>
      </div>

      {/* Today's check-in */}
      {(() => {
        const todayTotal = Math.max(1, Math.ceil(today.length / TODAY_PAGE_SIZE))
        const todayRows  = today.slice(todayPage * TODAY_PAGE_SIZE, (todayPage + 1) * TODAY_PAGE_SIZE)
        return (
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
              {[vi?"Nhân viên":"Employee",vi?"Giờ vào":"Check-in",vi?"Giờ ra":"Check-out",vi?"Giờ làm":"Hours",vi?"Trạng thái":"Status",vi?"Ghi chú":"Notes"].map(c=>(
                <th key={c} style={hd}>{c}</th>
              ))}
            </tr></thead>
            <tbody>
              {today.length === 0 ? (
                <tr><td colSpan={6} style={{ ...td, textAlign:"center", color:th.text3, padding:24 }}>
                  {vi?"Chưa có dữ liệu chấm công hôm nay":"No attendance data for today"}
                </td></tr>
              ) : todayRows.map((r,i)=>(
                <tr key={i}>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.vao}</td>
                  <td style={td}>{r.ra === "—" ? <span style={{ color: th.text3, fontStyle:"italic" }}>—</span> : r.ra}</td>
                  <td style={td}>{r.lam}</td>
                  <td style={td}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {r.st==="nodata" && (
                        <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:"#F3F4F6", color:"#6B7280" }}>{vi?"Chưa chấm công":"No check-in"}</span>
                      )}
                      {r.st==="ontime" && (
                        <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:"#D1FAE5", color:"#065F46" }}>{vi?"Đúng giờ":"On time"}</span>
                      )}
                      {(r.st==="late" || r.st==="late+noco") && (
                        <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:"#FEF3C7", color:"#92400E" }}>{vi?"Đi muộn":"Late"}</span>
                      )}
                      {(r.st==="noco" || r.st==="late+noco") && (
                        <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:"#FEE2E2", color:"#991B1B" }}>{vi?"Không checkout":"No checkout"}</span>
                      )}
                    </div>
                  </td>
                  <td style={td}>
                    {r.notes ? (
                      <span style={{
                        display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                        background: r.notes.includes("check-out") ? "#FEE2E2" : "#FFF7ED",
                        color: r.notes.includes("check-out") ? "#991B1B" : "#9A3412",
                      }}>{r.notes}</span>
                    ) : (
                      <span style={{ color: th.text3 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {today.length > TODAY_PAGE_SIZE && (
            <div style={{ padding:"10px 16px", borderTop:`1px solid ${th.tableBorder}`, background:th.tableHead, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:th.text2 }}>
                {vi
                  ? `${todayPage*TODAY_PAGE_SIZE+1}–${Math.min((todayPage+1)*TODAY_PAGE_SIZE, today.length)} / ${today.length}`
                  : `${todayPage*TODAY_PAGE_SIZE+1}–${Math.min((todayPage+1)*TODAY_PAGE_SIZE, today.length)} of ${today.length}`
                }
              </span>
              <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                <button onClick={()=>setTodayPage(p=>Math.max(0,p-1))} disabled={todayPage===0} style={{ width:28, height:28, borderRadius:7, border:`1px solid ${th.cardBorder}`, background:todayPage===0?th.tableHead:th.cardBg, color:todayPage===0?th.text3:th.text1, cursor:todayPage===0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>‹</button>
                {Array.from({ length: todayTotal }).map((_,i) => (
                  todayTotal <= 5 || i===0 || i===todayTotal-1 || Math.abs(i-todayPage)<=1
                    ? <button key={i} onClick={()=>setTodayPage(i)} style={{ minWidth:28, height:28, borderRadius:7, border:"none", background:i===todayPage?"#D0211C":th.cardBg, color:i===todayPage?"#fff":th.text2, cursor:"pointer", fontSize:12, fontWeight:i===todayPage?700:400, fontFamily:"inherit" }}>{i+1}</button>
                    : Math.abs(i-todayPage)===2 ? <span key={i} style={{ color:th.text3, fontSize:11 }}>…</span> : null
                ))}
                <button onClick={()=>setTodayPage(p=>Math.min(todayTotal-1,p+1))} disabled={todayPage===todayTotal-1} style={{ width:28, height:28, borderRadius:7, border:`1px solid ${th.cardBorder}`, background:todayPage===todayTotal-1?th.tableHead:th.cardBg, color:todayPage===todayTotal-1?th.text3:th.text1, cursor:todayPage===todayTotal-1?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>›</button>
              </div>
            </div>
          )}
        </div>
        )
      })()}

      {/* ── Detail Modal ── */}
      {selectedStaff && (
        <>
          <div onClick={() => setSelectedStaff(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:9998 }}/>
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:9999 }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: th.cardBg, border:`1px solid ${th.cardBorder}`,
              borderRadius: 18, width:"min(700px,96vw)", maxHeight:"88vh",
              boxShadow:"0 24px 60px rgba(0,0,0,0.35)",
              display:"flex", flexDirection:"column", overflow:"hidden",
              animation:"attModalIn .22s ease",
            }}>
              {/* Header */}
              <div style={{ padding:"20px 24px", background:`linear-gradient(135deg,#1E3A5F,#1a3354)`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginBottom:4 }}>📅 {MONTHS[monthIdx]}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{selectedStaff.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:3 }}>{selectedStaff.id} · {selectedStaff.dept}</div>
                </div>
                <button onClick={() => setSelectedStaff(null)} style={{ background:"rgba(255,255,255,0.12)", border:"none", borderRadius:8, cursor:"pointer", padding:"6px 8px", color:"#fff", display:"flex", alignItems:"center" }}>
                  <X size={16}/>
                </button>
              </div>

              {/* KPI strip */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderBottom:`1px solid ${th.tableBorder}` }}>
                {[
                  { label:vi?"Ngày công":"Days",       val:String(selectedStaff.ngay), accent:"#10B981" },
                  { label:vi?"Đi muộn":"Late Days",    val:String(selectedStaff.muon), accent:"#F59E0B" },
                  { label:vi?"Phút muộn":"Late Min",   val:`${selectedStaff.phut}${vi?"p":"m"}`, accent:"#EF4444" },
                  { label:vi?"Tổng OT":"Total OT",     val:`${selectedStaff.ot}h`, accent:"#3B82F6" },
                ].map(k => (
                  <div key={k.label} style={{ padding:"14px 0", textAlign:"center", borderRight:`1px solid ${th.tableBorder}` }}>
                    <div style={{ fontSize:10, color:th.text2, marginBottom:4 }}>{k.label}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:k.accent }}>{k.val}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div style={{ overflowY:"auto", flex:1 }}>
                {detailLoading ? (
                  <div style={{ padding:48, textAlign:"center", color:th.text2 }}>
                    <Loader2 size={20} style={{ animation:"spin 1s linear infinite" }}/>
                  </div>
                ) : detailRecords.length === 0 ? (
                  <div style={{ padding:40, textAlign:"center", color:th.text2, fontSize:13 }}>
                    {vi?"Không có dữ liệu chấm công tháng này":"No attendance records for this month"}
                  </div>
                ) : (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>
                        {[vi?"Ngày":"Date", vi?"Vào":"Check-in", vi?"Ra":"Check-out", vi?"Giờ làm":"Hours", vi?"Trạng thái":"Status", "OT", vi?"Muộn":"Late"].map(h => (
                          <th key={h} style={{ ...hd, fontSize:11.5, padding:"9px 12px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detailRecords.map((rec:any, i:number) => {
                        const wd = new Date(rec.workDate)
                        const dateStr = wd.toLocaleDateString(vi?"vi-VN":"en-US", { weekday:"short", day:"2-digit", month:"2-digit" })
                        const ci = rec.checkIn  ? new Date(rec.checkIn)  : null
                        const co = rec.checkOut ? new Date(rec.checkOut) : null
                        const ciStr = ci ? `${String(ci.getHours()).padStart(2,"0")}:${String(ci.getMinutes()).padStart(2,"0")}` : "—"
                        const coStr = co ? `${String(co.getHours()).padStart(2,"0")}:${String(co.getMinutes()).padStart(2,"0")}` : "—"
                        const rawMs2 = ci && co ? co.getTime() - ci.getTime() : 0
                        const ls2 = ci ? new Date(ci) : null; if(ls2) ls2.setHours(11,30,0,0)
                        const le2 = ci ? new Date(ci) : null; if(le2) le2.setHours(13,0,0,0)
                        const lunchMs2 = (ci && co && ls2 && le2 && co > le2 && ci < ls2) ? 90*60*1000 : 0
                        const netMs2 = Math.max(0, rawMs2 - lunchMs2)
                        const hours = ci && co ? (netMs2/3_600_000).toFixed(1) : "—"
                        const isLate = (rec.lateMinutes ?? 0) > 0
                        const isOT   = (rec.otHours ?? 0) > 0
                        return (
                          <tr key={i}
                            style={{ background: i%2===0 ? "transparent" : (dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.015)") }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = dark?"rgba(255,255,255,0.05)":"#F8FAFF"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i%2===0 ? "transparent" : (dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.015)")}
                          >
                            <td style={{ ...td, padding:"9px 12px", fontSize:12, fontWeight:600 }}>{dateStr}</td>
                            <td style={{ ...td, padding:"9px 12px", fontSize:12 }}>
                              <span style={{ color: isLate ? "#F59E0B" : th.text1, fontWeight: isLate ? 700 : 400 }}>{ciStr}</span>
                            </td>
                            <td style={{ ...td, padding:"9px 12px", fontSize:12 }}>{coStr}</td>
                            <td style={{ ...td, padding:"9px 12px", fontSize:12, color:th.text2 }}>{hours !== "—" ? `${hours}h` : "—"}</td>
                            <td style={{ ...td, padding:"9px 12px" }}>
                              <span style={{
                                padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700,
                                background: isLate ? "#FEF3C7" : "#D1FAE5",
                                color:      isLate ? "#92400E" : "#065F46",
                              }}>
                                {isLate ? (vi?"Đi muộn":"Late") : (vi?"Đúng giờ":"On time")}
                              </span>
                            </td>
                            <td style={{ ...td, padding:"9px 12px", fontSize:12 }}>
                              {isOT ? <span style={{ color:"#3B82F6", fontWeight:700 }}>{rec.otHours}h</span> : <span style={{ color:th.text3 }}>—</span>}
                            </td>
                            <td style={{ ...td, padding:"9px 12px", fontSize:12 }}>
                              {isLate ? <span style={{ color:"#F59E0B", fontWeight:700 }}>{rec.lateMinutes}{vi?"p":"m"}</span> : <span style={{ color:th.text3 }}>—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding:"12px 24px", borderTop:`1px solid ${th.tableBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:th.text2 }}>{detailRecords.length} {vi?"bản ghi":"records"}</span>
                <button onClick={() => setSelectedStaff(null)} style={{
                  padding:"8px 20px", borderRadius:9, border:"none",
                  background:"linear-gradient(135deg,#D0211C,#a81a17)", color:"#fff",
                  cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit",
                  boxShadow:"0 4px 12px rgba(208,33,28,0.28)",
                }}>{vi?"Đóng":"Close"}</button>
              </div>
            </div>
          </div>
          <style>{`@keyframes attModalIn{from{opacity:0;transform:scale(0.96) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
