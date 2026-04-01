import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/export/excel?type=dashboard|employees|payroll|attendance
 * Xuất báo cáo Excel thật từ dữ liệu PostgreSQL — format chuyên nghiệp
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type  = searchParams.get("type")  ?? "dashboard"
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1))
    const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()))

    const wb = new ExcelJS.Workbook()
    wb.creator  = "AXIOM HRM"
    wb.company  = "AXIOM Corporation"
    wb.created  = new Date()
    wb.modified = new Date()

    switch (type) {
      case "dashboard":  await buildDashboard(wb, month, year);  break
      case "employees":  await buildEmployees(wb);               break
      case "payroll":    await buildPayroll(wb, month, year);    break
      case "attendance": await buildAttendance(wb, month, year); break
      default:           await buildDashboard(wb, month, year)
    }

    const buf      = await wb.xlsx.writeBuffer()
    const pad      = (n: number) => String(n).padStart(2, "0")
    const filename = `AXIOM_${type}_${year}-${pad(month)}.xlsx`

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("[export/excel]", err)
    return NextResponse.json({ error: "Không thể xuất Excel" }, { status: 500 })
  }
}

/* ═══════════════════════════════════════════════════════
   STYLE CONSTANTS
   ═══════════════════════════════════════════════════════ */
const C = {
  RED_DARK:  "FFC41210",
  RED_MID:   "FFE04040",
  RED_LIGHT: "FFFCE8E8",
  RED_TEXT:  "FFB31B1B",
  WHITE:     "FFFFFFFF",
  ROW_ODD:   "FFFFFFFF",
  ROW_EVEN:  "FFFFF5F5",
  TOTAL_BG:  "FFFFE0E0",
  TOTAL_FG:  "FF7F0000",
  BORDER:    "FFD4D4D4",
  BORDER_HD: "FF9C1B1B",
  TEXT:      "FF1A1A1A",
  TEXT2:     "FF555555",
  GREEN_FG:  "FF14532D",
  GREEN_BG:  "FFD1FAE5",
  GOLD_FG:   "FF92400E",
  GOLD_BG:   "FFFEF3C7",
  BLUE_FG:   "FF1E40AF",
  BLUE_BG:   "FFDBEAFE",
}
const FONT  = "Arial"
const VND   = "#,##0"

function thin(color = C.BORDER): Partial<ExcelJS.Borders> {
  const s = { style: "thin" as ExcelJS.BorderStyle, color: { argb: color } }
  return { top: s, left: s, bottom: s, right: s }
}

function colLetter(col: number): string {
  let s = ""
  while (col > 0) { col--; s = String.fromCharCode(65 + col % 26) + s; col = Math.floor(col / 26) }
  return s
}

/** 4 dòng tiêu đề chuẩn: Company / Report title / Ngày xuất / blank */
function addHeader(ws: ExcelJS.Worksheet, numCols: number, title: string) {
  const L = colLetter(numCols)

  ws.mergeCells(`A1:${L}1`)
  const r1 = ws.getCell("A1")
  r1.value = "CÔNG TY CỔ PHẦN AXIOM"; r1.font = { name: FONT, bold: true, size: 14, color: { argb: C.RED_TEXT } }
  r1.alignment = { horizontal: "center", vertical: "middle" }
  r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_LIGHT } }
  ws.getRow(1).height = 26

  ws.mergeCells(`A2:${L}2`)
  const r2 = ws.getCell("A2")
  r2.value = title; r2.font = { name: FONT, bold: true, size: 13, color: { argb: C.WHITE } }
  r2.alignment = { horizontal: "center", vertical: "middle" }
  r2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_DARK } }
  ws.getRow(2).height = 28

  ws.mergeCells(`A3:${L}3`)
  const r3 = ws.getCell("A3")
  r3.value = `Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
  r3.font = { name: FONT, italic: true, size: 9, color: { argb: C.TEXT2 } }
  r3.alignment = { horizontal: "right", vertical: "middle" }
  ws.getRow(3).height = 16
  ws.getRow(4).height = 6
}

/** Style dòng header bảng (row 5) */
function styleHeaderRow(ws: ExcelJS.Worksheet, headers: string[], rowNum = 5) {
  const row = ws.getRow(rowNum)
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1)
    cell.value = h
    cell.font  = { name: FONT, bold: true, color: { argb: C.WHITE }, size: 10 }
    cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_DARK } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    cell.border = { top: { style:"medium", color:{argb:C.BORDER_HD} }, bottom: { style:"medium", color:{argb:C.BORDER_HD} },
                    left: { style:"thin",   color:{argb:C.BORDER_HD} }, right: { style:"thin",  color:{argb:C.BORDER_HD} } }
  })
  row.height = 34
  ws.views = [{ state: "frozen", ySplit: rowNum, activeCell: `A${rowNum + 1}` }]
}

/* ═══════════════════════════════════════════════════════
   1. DASHBOARD — multi-sheet
   ═══════════════════════════════════════════════════════ */
async function buildDashboard(wb: ExcelJS.Workbook, month: number, year: number) {
  // ── Sheet 1: Nhân sự ──────────────────────────────────
  const employees = await prisma.employee.findMany({
    where: { status: { not: "Nghỉ việc" } },
    include: { department: true, position: true },
    orderBy: { code: "asc" },
  })
  const wsEmp = wb.addWorksheet("Danh sách nhân sự")
  const EMP_COLS = [
    { key:"stt",   width:5  }, { key:"code",  width:10 }, { key:"name",  width:26 },
    { key:"dept",  width:20 }, { key:"pos",   width:20 }, { key:"status",width:15 },
    { key:"hire",  width:15 }, { key:"email", width:25 }, { key:"phone", width:15 },
  ]
  wsEmp.columns = EMP_COLS.map(c => ({ key: c.key, width: c.width }))
  addHeader(wsEmp, EMP_COLS.length, "DANH SÁCH NHÂN SỰ")
  styleHeaderRow(wsEmp, ["STT","Mã NV","Họ và tên","Phòng ban","Chức vụ","Trạng thái","Ngày vào","Email","SĐT"])

  employees.forEach((e, idx) => {
    const r = wsEmp.getRow(6 + idx)
    const isEven = idx % 2 === 1
    const vals = [idx+1, e.code, e.fullName, e.department?.name??"—", e.position?.name??"—",
      e.status, e.hireDate ? new Date(e.hireDate).toLocaleDateString("vi-VN") : "—",
      e.email??"—", e.phone??"—"]
    vals.forEach((v, i) => {
      const cell = r.getCell(i+1)
      cell.value = v; cell.border = thin()
      cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb: isEven?C.ROW_EVEN:C.ROW_ODD} }
      cell.font = { name:FONT, size:10, color:{argb:C.TEXT} }
      cell.alignment = { vertical:"middle", horizontal: i===2?"left":"center" }
    })
    r.height = 19
  })

  // ── Sheet 2: Lương ──────────────────────────────────────
  await addPayrollSheet(wb, month, year)

  // ── Sheet 3: Chấm công ──────────────────────────────────
  await addAttendanceSheet(wb, month, year)

  // ── Sheet 4: Thống kê ───────────────────────────────────
  const pendingLeave = await prisma.leaveRequest.count({ where: { status: "Chờ duyệt" } })
  const deptStats = await prisma.department.findMany({
    where: { isActive: true }, include: { _count: { select: { employees: true } } },
  })
  const wsStat = wb.addWorksheet("Thống kê tổng hợp")
  addHeader(wsStat, 2, "THỐNG KÊ TỔNG HỢP NHÂN SỰ")
  wsStat.columns = [{ key:"k", width:32 }, { key:"v", width:18 }]
  styleHeaderRow(wsStat, ["Chỉ số", "Giá trị"])

  const statRows = [
    ["Tổng nhân viên đang làm", employees.length],
    ["Nhân viên chính thức", employees.filter(e=>e.status==="Đang làm").length],
    ["Nhân viên thử việc",  employees.filter(e=>e.status==="Thử việc").length],
    ["Đơn nghỉ phép chờ duyệt", pendingLeave],
    ["", ""],
    ["─── Phân bổ theo phòng ban ───", ""],
    ...deptStats.map(d => [d.name, d._count.employees]),
  ]
  statRows.forEach((row, idx) => {
    const r = wsStat.getRow(6 + idx)
    const isSep = row[0] === "" || String(row[0]).startsWith("───")
    r.getCell(1).value = row[0]; r.getCell(2).value = row[1]
    if (isSep) {
      r.font = { name:FONT, bold:true, italic:true, color:{argb:C.RED_TEXT}, size:10 }
    } else {
      const isEven = idx % 2 === 1
      ;[1,2].forEach(i => {
        const cell = r.getCell(i)
        cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb:isEven?C.ROW_EVEN:C.ROW_ODD} }
        cell.font = { name:FONT, size:10, color:{argb:C.TEXT} }
        cell.border = thin()
        cell.alignment = { vertical:"middle", horizontal: i===1?"left":"center" }
      })
    }
    r.height = 20
  })
}

/* ═══════════════════════════════════════════════════════
   2. EMPLOYEES
   ═══════════════════════════════════════════════════════ */
async function buildEmployees(wb: ExcelJS.Workbook) {
  const employees = await prisma.employee.findMany({
    include: { department: true, position: true }, orderBy: { code: "asc" },
  })
  const ws = wb.addWorksheet("Nhân viên")
  const COLS = [
    {key:"stt",width:5},{key:"code",width:10},{key:"name",width:26},{key:"gender",width:10},
    {key:"dob",width:14},{key:"id",width:16},{key:"email",width:24},{key:"phone",width:15},
    {key:"addr",width:28},{key:"dept",width:20},{key:"pos",width:18},{key:"status",width:14},{key:"hire",width:14},
  ]
  ws.columns = COLS.map(c=>({key:c.key,width:c.width}))
  addHeader(ws, COLS.length, "DANH SÁCH NHÂN VIÊN CHI TIẾT")
  styleHeaderRow(ws, ["STT","Mã NV","Họ và tên","Giới tính","Ngày sinh","CCCD","Email","SĐT","Địa chỉ","Phòng ban","Chức vụ","Trạng thái","Ngày vào"])

  employees.forEach((e, idx) => {
    const r = ws.getRow(6+idx)
    const isEven = idx%2===1
    const vals = [idx+1, e.code, e.fullName, e.gender??"—",
      e.dateOfBirth?new Date(e.dateOfBirth).toLocaleDateString("vi-VN"):"—",
      e.idNumber??"—", e.email??"—", e.phone??"—", e.address??"—",
      e.department?.name??"—", e.position?.name??"—", e.status,
      e.hireDate?new Date(e.hireDate).toLocaleDateString("vi-VN"):"—",
    ]
    vals.forEach((v,i) => {
      const cell = r.getCell(i+1)
      cell.value = v; cell.border = thin()
      cell.fill = {type:"pattern",pattern:"solid",fgColor:{argb:isEven?C.ROW_EVEN:C.ROW_ODD}}
      cell.font = {name:FONT,size:10,color:{argb:C.TEXT}}
      cell.alignment = {vertical:"middle", horizontal: i===2?"left":"center"}
    })
    r.height = 19
  })
}

/* ═══════════════════════════════════════════════════════
   3. PAYROLL
   ═══════════════════════════════════════════════════════ */
async function buildPayroll(wb: ExcelJS.Workbook, month: number, year: number) {
  await addPayrollSheet(wb, month, year)
}

async function addPayrollSheet(wb: ExcelJS.Workbook, month: number, year: number) {
  const MONTH_VN = ["Một","Hai","Ba","Bốn","Năm","Sáu","Bảy","Tám","Chín","Mười","Mười Một","Mười Hai"]
  const ws = wb.addWorksheet(`Lương T${month}.${year}`, {
    pageSetup: { paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1,
      margins:{left:0.5,right:0.5,top:0.75,bottom:0.75,header:0.3,footer:0.3} },
    headerFooter: { oddFooter:`&C&"Arial,Bold"&9AXIOM HRM — Bảng lương T${month}/${year}&R&9Trang &P / &N` },
  })
  const COLS = [
    {key:"stt",w:5},{key:"code",w:10},{key:"name",w:26},{key:"dept",w:20},
    {key:"days",w:9},{key:"ot",w:8},
    {key:"base",w:16},{key:"allow",w:14},{key:"otPay",w:14},
    {key:"gross",w:18},{key:"bhxh",w:13},{key:"bhyt",w:13},{key:"bhtn",w:13},
    {key:"tax",w:15},{key:"net",w:18},{key:"status",w:14},
  ]
  const MONEY_KEYS = ["base","allow","otPay","gross","bhxh","bhyt","bhtn","tax","net"]
  ws.columns = COLS.map(c=>({key:c.key,width:c.w}))
  addHeader(ws, COLS.length, `BẢNG LƯƠNG THÁNG ${MONTH_VN[month-1].toUpperCase()} NĂM ${year}`)
  styleHeaderRow(ws, ["STT","Mã NV","Họ và tên","Phòng ban","Ngày\ncông","Giờ\nOT",
    "Lương CB (đ)","Phụ cấp (đ)","Lương OT (đ)","GROSS (đ)","BHXH (đ)","BHYT (đ)","BHTN (đ)","Thuế TNCN (đ)","NET (đ)","Trạng thái"])
  ws.views = [{ state:"frozen", ySplit:5, activeCell:"A6" }]

  const payrolls = await prisma.payroll.findMany({
    where: { payMonth:month, payYear:year },
    include: { employee:{ include:{ department:true } } },
    orderBy: [{ employee:{ department:{ name:"asc" } } }, { employee:{fullName:"asc"} }],
  })

  if (payrolls.length === 0) {
    ws.mergeCells(6,1,6,COLS.length);
    const cell = ws.getCell(6,1); cell.value = `Chưa có dữ liệu lương tháng ${month}/${year}`
    cell.font={name:FONT,italic:true,color:{argb:C.TEXT2}}; cell.alignment={horizontal:"center"}
    return
  }

  const totals: Record<string,number> = {days:0,ot:0,base:0,allow:0,otPay:0,gross:0,bhxh:0,bhyt:0,bhtn:0,tax:0,net:0}

  payrolls.forEach((p,idx) => {
    const rowNum = 6+idx; const row = ws.getRow(rowNum); const even = idx%2===1
    const vals: any = {
      stt:idx+1, code:p.employee.code, name:p.employee.fullName,
      dept:p.employee.department?.name??"—",
      days:p.workDays, ot:Number(p.otHours),
      base:Number(p.baseSalary), allow:Number(p.allowance), otPay:Number(p.otPay),
      gross:Number(p.grossSalary), bhxh:Number(p.bhxh), bhyt:Number(p.bhyt), bhtn:Number(p.bhtn),
      tax:Number(p.taxAmount), net:Number(p.netSalary), status:p.status,
    }
    Object.keys(totals).forEach(k => { totals[k] += vals[k]??0 })

    COLS.forEach((c,i) => {
      const cell = row.getCell(i+1)
      cell.value = vals[c.key]; cell.border = thin()
      cell.fill = {type:"pattern",pattern:"solid",fgColor:{argb:even?C.ROW_EVEN:C.ROW_ODD}}
      if (c.key==="name") {
        cell.font={name:FONT,size:10,color:{argb:C.TEXT}}; cell.alignment={horizontal:"left",vertical:"middle"}
      } else if (MONEY_KEYS.includes(c.key)) {
        cell.numFmt=VND; cell.font={name:FONT,size:10,color:{argb:C.TEXT}}; cell.alignment={horizontal:"right",vertical:"middle"}
      } else if (c.key==="status") {
        const paid = p.status==="Đã thanh toán"
        cell.font={name:FONT,bold:true,size:9.5,color:{argb:paid?C.GREEN_FG:C.GOLD_FG}}
        cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:paid?C.GREEN_BG:C.GOLD_BG}}
        cell.alignment={horizontal:"center",vertical:"middle"}
      } else {
        cell.font={name:FONT,size:10,color:{argb:C.TEXT}}; cell.alignment={horizontal:"center",vertical:"middle"}
      }
    })
    row.height = 20
  })

  // Total row
  const tRow = ws.getRow(6+payrolls.length); tRow.height=24
  ws.mergeCells(6+payrolls.length,1,6+payrolls.length,4)
  const tc = tRow.getCell(1)
  tc.value=`TỔNG CỘNG (${payrolls.length} nhân viên)`
  tc.font={name:FONT,bold:true,size:10,color:{argb:C.TOTAL_FG}}
  tc.fill={type:"pattern",pattern:"solid",fgColor:{argb:C.TOTAL_BG}}
  tc.alignment={horizontal:"center",vertical:"middle"}
  tc.border={top:{style:"medium",color:{argb:C.BORDER_HD}},bottom:{style:"medium",color:{argb:C.BORDER_HD}},left:{style:"medium",color:{argb:C.BORDER_HD}},right:{style:"thin",color:{argb:C.BORDER_HD}}}

  COLS.forEach((c,i) => {
    if (i<4) return
    const cell = tRow.getCell(i+1)
    cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:C.TOTAL_BG}}
    cell.font={name:FONT,bold:true,size:10,color:{argb:C.TOTAL_FG}}
    cell.border={top:{style:"medium",color:{argb:C.BORDER_HD}},bottom:{style:"medium",color:{argb:C.BORDER_HD}},left:{style:"thin",color:{argb:C.BORDER_HD}},right:{style:"thin",color:{argb:C.BORDER_HD}}}
    if (c.key in totals) {
      cell.value=totals[c.key]
      if (MONEY_KEYS.includes(c.key)) cell.numFmt=VND
      cell.alignment={horizontal:"right",vertical:"middle"}
    }
  })
}

/* ═══════════════════════════════════════════════════════
   4. ATTENDANCE
   ═══════════════════════════════════════════════════════ */
async function buildAttendance(wb: ExcelJS.Workbook, month: number, year: number) {
  await addAttendanceSheet(wb, month, year)
}

async function addAttendanceSheet(wb: ExcelJS.Workbook, month: number, year: number) {
  const MONTH_VN = ["Một","Hai","Ba","Bốn","Năm","Sáu","Bảy","Tám","Chín","Mười","Mười Một","Mười Hai"]
  const ws = wb.addWorksheet(`Chấm công T${month}.${year}`, {
    pageSetup: { paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1,
      margins:{left:0.5,right:0.5,top:0.75,bottom:0.75,header:0.3,footer:0.3} },
    headerFooter: { oddFooter:`&C&"Arial,Bold"&9AXIOM HRM — Chấm công T${month}/${year}&R&9Trang &P / &N` },
  })
  const COLS = [
    {key:"stt",w:5},{key:"code",w:10},{key:"name",w:26},{key:"dept",w:20},
    {key:"date",w:13},{key:"in",w:11},{key:"out",w:11},{key:"ot",w:11},{key:"late",w:13},{key:"status",w:15},
  ]
  const STATUS_C: Record<string,{fg:string,bg:string}> = {
    "Đi làm":   {fg:C.GREEN_FG,bg:C.GREEN_BG},
    "Nghỉ phép":{fg:C.BLUE_FG,  bg:C.BLUE_BG},
    "Vắng":     {fg:"FF991B1B", bg:"FFFEE2E2"},
    "Đi muộn":  {fg:C.GOLD_FG,  bg:C.GOLD_BG},
  }
  ws.columns = COLS.map(c=>({key:c.key,width:c.w}))
  addHeader(ws, COLS.length, `BẢNG CHẤM CÔNG THÁNG ${MONTH_VN[month-1].toUpperCase()} NĂM ${year}`)
  styleHeaderRow(ws, ["STT","Mã NV","Họ và tên","Phòng ban","Ngày","Check-in","Check-out","OT (giờ)","Đi muộn\n(phút)","Trạng thái"])
  ws.views = [{ state:"frozen", ySplit:5, activeCell:"A6" }]

  const records = await prisma.attendance.findMany({
    where: { workDate:{ gte:new Date(year,month-1,1), lt:new Date(year,month,1) } },
    include: { employee:{ include:{ department:true } } },
    orderBy: [{ employee:{fullName:"asc"} }, { workDate:"asc" }],
  })

  if (records.length === 0) {
    ws.mergeCells(6,1,6,COLS.length)
    const cell = ws.getCell(6,1); cell.value=`Chưa có dữ liệu chấm công tháng ${month}/${year}`
    cell.font={name:FONT,italic:true,color:{argb:C.TEXT2}}; cell.alignment={horizontal:"center"}
    return
  }

  let totalPresent=0, totalAbsent=0, totalLate=0, totalOT=0

  records.forEach((r,idx) => {
    const rowNum=6+idx; const row=ws.getRow(rowNum); const even=idx%2===1
    const ot = Number(r.otHours??0)
    const late = r.lateMinutes??0
    const vals: any = {
      stt:idx+1, code:r.employee.code, name:r.employee.fullName,
      dept:r.employee.department?.name??"—",
      date:new Date(r.workDate).toLocaleDateString("vi-VN"),
      in:  r.checkIn  ? new Date(r.checkIn).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}) : "—",
      out: r.checkOut ? new Date(r.checkOut).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}) : "—",
      ot, late, status:r.status,
    }
    if (r.status==="Đi làm")   totalPresent++
    if (r.status==="Vắng")     totalAbsent++
    if (late>0)                 totalLate++
    totalOT += ot

    COLS.forEach((c,i) => {
      const cell = row.getCell(i+1)
      cell.value = vals[c.key]; cell.border = thin()
      cell.fill = {type:"pattern",pattern:"solid",fgColor:{argb:even?C.ROW_EVEN:C.ROW_ODD}}
      if (c.key==="name") {
        cell.font={name:FONT,size:10,color:{argb:C.TEXT}}; cell.alignment={horizontal:"left",vertical:"middle"}
      } else if (c.key==="status") {
        const sc = STATUS_C[r.status]??{fg:C.TEXT,bg:C.ROW_ODD}
        cell.font={name:FONT,bold:true,size:9.5,color:{argb:sc.fg}}
        cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:sc.bg}}
        cell.alignment={horizontal:"center",vertical:"middle"}
      } else if (c.key==="ot") {
        cell.font={name:FONT,size:10,color:{argb:ot>0?C.BLUE_FG:C.TEXT}}
        cell.alignment={horizontal:"center",vertical:"middle"}
      } else {
        cell.font={name:FONT,size:10,color:{argb:C.TEXT}}; cell.alignment={horizontal:"center",vertical:"middle"}
      }
    })
    row.height = 19
  })

  // Summary row
  const sNum = 6+records.length; const sRow = ws.getRow(sNum); sRow.height=24
  ws.mergeCells(sNum,1,sNum,4)
  const sc = sRow.getCell(1)
  sc.value=`Tổng: ${records.length} bản ghi`
  sc.font={name:FONT,bold:true,size:10,color:{argb:C.TOTAL_FG}}
  sc.fill={type:"pattern",pattern:"solid",fgColor:{argb:C.TOTAL_BG}}
  sc.alignment={horizontal:"center",vertical:"middle"}; sc.border=thin(C.BORDER_HD)
  ;[
    {v:`✓ Đi làm: ${totalPresent}`,col:5},{v:`✗ Vắng: ${totalAbsent}`,col:6},
    {v:`CC: ${totalPresent+records.filter(r=>r.status==="Nghỉ phép").length}`,col:7},
    {v:`OT: ${totalOT}h`,col:8},{v:`Muộn: ${totalLate}`,col:9},
  ].forEach(s => {
    const cell = sRow.getCell(s.col)
    cell.value=s.v; cell.font={name:FONT,bold:true,size:9.5,color:{argb:C.TOTAL_FG}}
    cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:C.TOTAL_BG}}
    cell.alignment={horizontal:"center",vertical:"middle"}; cell.border=thin(C.BORDER_HD)
  })
  const cell10 = sRow.getCell(10)
  cell10.fill={type:"pattern",pattern:"solid",fgColor:{argb:C.TOTAL_BG}}; cell10.border=thin(C.BORDER_HD)
}
