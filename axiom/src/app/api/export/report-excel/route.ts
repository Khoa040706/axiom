import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/export/report-excel?month=3&year=2026&type=payroll|attendance
 * Xuất báo cáo Excel hàng tháng — format chuyên nghiệp
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1))
    const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()))
    const type  = searchParams.get("type") ?? "payroll"

    const workbook = new ExcelJS.Workbook()
    workbook.creator   = "AXIOM HRM"
    workbook.company   = "AXIOM Corporation"
    workbook.created   = new Date()
    workbook.modified  = new Date()

    if (type === "payroll") {
      await buildPayrollSheet(workbook, month, year)
    } else if (type === "attendance") {
      await buildAttendanceSheet(workbook, month, year)
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = `AXIOM_${type === "payroll" ? "BangLuong" : "ChamCong"}_T${String(month).padStart(2,"0")}_${year}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("[export-excel]", err)
    return NextResponse.json({ error: "Không thể xuất Excel" }, { status: 500 })
  }
}

/* ═══════════════════════════════════════════
   CONSTANTS & STYLE HELPERS
   ═══════════════════════════════════════════ */

const C = {
  // Brand colors
  RED_DARK:   "FFC41210",   // #C41210 — header bg
  RED_LIGHT:  "FFFCE8E8",   // nhạt — title bg
  RED_TEXT:   "FFB31B1B",   // đỏ đậm — title text
  WHITE:      "FFFFFFFF",
  // Zebra stripes
  ROW_ODD:    "FFFFFFFF",   // trắng
  ROW_EVEN:   "FFFFF5F5",   // hồng nhạt
  // Total row
  TOTAL_BG:   "FFFFE0E0",
  TOTAL_FG:   "FF7F0000",
  // Borders
  BORDER:     "FFD4D4D4",
  BORDER_HD:  "FF9C1B1B",
  // Text
  TEXT_DARK:  "FF1A1A1A",
  TEXT_GRAY:  "FF555555",
  TEXT_PAID:  "FF14532D",   // đã thanh toán
  PAID_BG:    "FFD1FAE5",
  TEXT_PEND:  "FF92400E",
  PEND_BG:    "FFFEF3C7",
}

const VND = "#,##0"
const FONT_MAIN = "Arial"

function thinBorder(color = C.BORDER): Partial<ExcelJS.Borders> {
  const s = { style: "thin" as ExcelJS.BorderStyle, color: { argb: color } }
  return { top: s, left: s, bottom: s, right: s }
}

function medBorder(color = C.BORDER_HD): Partial<ExcelJS.Borders> {
  const m = { style: "medium" as ExcelJS.BorderStyle, color: { argb: color } }
  const t = { style: "thin"   as ExcelJS.BorderStyle, color: { argb: color } }
  return { top: m, left: m, bottom: m, right: t }
}

/* ═══════════════════════════════════════════
   PAYROLL SHEET
   ═══════════════════════════════════════════ */

async function buildPayrollSheet(wb: ExcelJS.Workbook, month: number, year: number) {
  const MONTH_VN = ["Một","Hai","Ba","Bốn","Năm","Sáu","Bảy","Tám","Chín","Mười","Mười Một","Mười Hai"]
  const sheet = wb.addWorksheet(`Bảng lương T${month}.${year}`, {
    pageSetup: {
      paperSize: 9,           // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
    headerFooter: {
      oddFooter: `&C&"Arial,Bold"&9AXIOM HRM — Bảng lương Tháng ${month}/${year}&R&9Trang &P / &N`,
    },
  })

  const COL_DEFS = [
    { key: "stt",       header: "STT",            width: 5  },
    { key: "code",      header: "Mã NV",           width: 10 },
    { key: "name",      header: "Họ và tên",        width: 26 },
    { key: "dept",      header: "Phòng ban",        width: 20 },
    { key: "workDays",  header: "Ngày\ncông",       width: 8  },
    { key: "otHours",   header: "Giờ\nOT",          width: 7  },
    { key: "base",      header: "Lương CB (đ)",     width: 17 },
    { key: "allowance", header: "Phụ cấp (đ)",      width: 15 },
    { key: "otPay",     header: "Lương OT (đ)",     width: 15 },
    { key: "gross",     header: "GROSS (đ)",        width: 18 },
    { key: "bhxh",      header: "BHXH (đ)",         width: 14 },
    { key: "bhyt",      header: "BHYT (đ)",         width: 14 },
    { key: "bhtn",      header: "BHTN (đ)",         width: 14 },
    { key: "tax",       header: "Thuế TNCN (đ)",    width: 16 },
    { key: "net",       header: "NET (đ)",           width: 18 },
    { key: "status",    header: "Trạng thái",        width: 14 },
  ]

  const NUM_COLS = COL_DEFS.length  // 16
  const lastColLetter = colLetter(NUM_COLS)

  // ── Row 1: Logo / Company title ──────────────────────────────
  sheet.mergeCells(`A1:${lastColLetter}1`)
  const titleCell = sheet.getCell("A1")
  titleCell.value = "CÔNG TY CỔ PHẦN AXIOM"
  titleCell.font  = { name: FONT_MAIN, bold: true, size: 14, color: { argb: C.RED_TEXT } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  titleCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_LIGHT } }
  sheet.getRow(1).height = 26

  // ── Row 2: Báo cáo title ─────────────────────────────────────
  sheet.mergeCells(`A2:${lastColLetter}2`)
  const rptCell = sheet.getCell("A2")
  rptCell.value = `BẢNG LƯƠNG THÁNG ${MONTH_VN[month-1].toUpperCase()} NĂM ${year}`
  rptCell.font  = { name: FONT_MAIN, bold: true, size: 13, color: { argb: C.WHITE } }
  rptCell.alignment = { horizontal: "center", vertical: "middle" }
  rptCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_DARK } }
  sheet.getRow(2).height = 28

  // ── Row 3: Ngày xuất ────────────────────────────────────────
  sheet.mergeCells(`A3:${lastColLetter}3`)
  const dateCell = sheet.getCell("A3")
  dateCell.value = `Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
  dateCell.font  = { name: FONT_MAIN, italic: true, size: 9, color: { argb: C.TEXT_GRAY } }
  dateCell.alignment = { horizontal: "right", vertical: "middle" }
  sheet.getRow(3).height = 16

  // ── Row 4: blank ────────────────────────────────────────────
  sheet.getRow(4).height = 6

  // ── Row 5: Header ────────────────────────────────────────────
  const HEADER_ROW = 5
  sheet.columns = COL_DEFS.map(c => ({ key: c.key, width: c.width }))

  const headerRow = sheet.getRow(HEADER_ROW)
  COL_DEFS.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = c.header
    cell.font  = { name: FONT_MAIN, bold: true, color: { argb: C.WHITE }, size: 10 }
    cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_DARK } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    cell.border = medBorder()
  })
  headerRow.height = 36

  // Freeze panes — giữ 5 dòng đầu khi scroll
  sheet.views = [{ state: "frozen", ySplit: HEADER_ROW, xSplit: 0, activeCell: "A6" }]

  // ── Data rows ────────────────────────────────────────────────
  const payrolls = await prisma.payroll.findMany({
    where: { payMonth: month, payYear: year },
    include: { employee: { include: { department: true, position: true } } },
    orderBy: [{ employee: { department: { name: "asc" } } }, { employee: { fullName: "asc" } }],
  })

  if (payrolls.length === 0) {
    const emptyRow = sheet.getRow(HEADER_ROW + 1)
    const cell = emptyRow.getCell(1)
    sheet.mergeCells(HEADER_ROW + 1, 1, HEADER_ROW + 1, NUM_COLS)
    cell.value = `Chưa có dữ liệu lương tháng ${month}/${year}`
    cell.font  = { name: FONT_MAIN, italic: true, color: { argb: C.TEXT_GRAY } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    emptyRow.height = 24
    return
  }

  const DATA_MONEY_KEYS = ["base","allowance","otPay","gross","bhxh","bhyt","bhtn","tax","net"]

  // Totals accumulator
  const totals: Record<string, number> = {
    workDays: 0, otHours: 0, base: 0, allowance: 0, otPay: 0,
    gross: 0, bhxh: 0, bhyt: 0, bhtn: 0, tax: 0, net: 0,
  }

  payrolls.forEach((p, idx) => {
    const rowNum = HEADER_ROW + 1 + idx
    const row    = sheet.getRow(rowNum)
    const isEven = idx % 2 === 1

    const rowData = {
      stt:       idx + 1,
      code:      p.employee.code,
      name:      p.employee.fullName,
      dept:      p.employee.department?.name ?? "—",
      workDays:  p.workDays,
      otHours:   Number(p.otHours),
      base:      Number(p.baseSalary),
      allowance: Number(p.allowance),
      otPay:     Number(p.otPay),
      gross:     Number(p.grossSalary),
      bhxh:      Number(p.bhxh),
      bhyt:      Number(p.bhyt),
      bhtn:      Number(p.bhtn),
      tax:       Number(p.taxAmount),
      net:       Number(p.netSalary),
      status:    p.status,
    }

    // Accumulate totals
    Object.keys(totals).forEach(k => {
      if (k in rowData) totals[k] += (rowData as any)[k] as number
    })

    COL_DEFS.forEach((c, i) => {
      const cell = row.getCell(i + 1)
      cell.value  = (rowData as any)[c.key]
      cell.font   = { name: FONT_MAIN, size: 10, color: { argb: C.TEXT_DARK } }
      cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: isEven ? C.ROW_EVEN : C.ROW_ODD } }
      cell.border = thinBorder()

      // Alignment
      if (c.key === "stt")   cell.alignment = { horizontal: "center", vertical: "middle" }
      else if (c.key === "name") cell.alignment = { horizontal: "left", vertical: "middle" }
      else if (DATA_MONEY_KEYS.includes(c.key)) {
        cell.alignment = { horizontal: "right", vertical: "middle" }
        cell.numFmt    = VND
      } else if (c.key === "workDays" || c.key === "otHours") {
        cell.alignment = { horizontal: "center", vertical: "middle" }
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" }
      }

      // Status badge color
      if (c.key === "status") {
        const isPaid = p.status === "Đã thanh toán"
        cell.font = { name: FONT_MAIN, bold: true, size: 9.5,
          color: { argb: isPaid ? C.TEXT_PAID : C.TEXT_PEND } }
        cell.fill = { type: "pattern", pattern: "solid",
          fgColor: { argb: isPaid ? C.PAID_BG : C.PEND_BG } }
      }
    })

    row.height = 20
  })

  // ── Total row ─────────────────────────────────────────────────
  const totalRowNum = HEADER_ROW + 1 + payrolls.length
  const totalRow    = sheet.getRow(totalRowNum)
  totalRow.height   = 24

  COL_DEFS.forEach((c, i) => {
    const cell = totalRow.getCell(i + 1)
    cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: C.TOTAL_BG } }
    cell.font  = { name: FONT_MAIN, bold: true, size: 10, color: { argb: C.TOTAL_FG } }
    cell.border = { ...thinBorder(C.BORDER_HD), top: { style: "medium", color: { argb: C.BORDER_HD } } }

    if (c.key === "stt") {
      sheet.mergeCells(totalRowNum, 1, totalRowNum, 4)
      cell.value = `TỔNG CỘNG (${payrolls.length} nhân viên)`
      cell.alignment = { horizontal: "center", vertical: "middle" }
    } else if (c.key === "code" || c.key === "name" || c.key === "dept") {
      // merged — skip
    } else if (c.key in totals) {
      cell.value     = totals[c.key]
      cell.alignment = { horizontal: "right", vertical: "middle" }
      if (DATA_MONEY_KEYS.includes(c.key)) cell.numFmt = VND
    }
  })

  // ── Signature block ───────────────────────────────────────────
  const sigRow = totalRowNum + 2
  sheet.mergeCells(sigRow, 1, sigRow, 4)
  sheet.getCell(sigRow, 1).value     = "Người lập bảng"
  sheet.getCell(sigRow, 1).font      = { name: FONT_MAIN, bold: true, size: 10 }
  sheet.getCell(sigRow, 1).alignment = { horizontal: "center" }

  sheet.mergeCells(sigRow, NUM_COLS - 3, sigRow, NUM_COLS)
  sheet.getCell(sigRow, NUM_COLS - 3).value     = "Giám đốc"
  sheet.getCell(sigRow, NUM_COLS - 3).font      = { name: FONT_MAIN, bold: true, size: 10 }
  sheet.getCell(sigRow, NUM_COLS - 3).alignment = { horizontal: "center" }

  sheet.mergeCells(sigRow + 1, 1, sigRow + 1, 4)
  sheet.getCell(sigRow + 1, 1).value     = "(Ký, họ tên)"
  sheet.getCell(sigRow + 1, 1).font      = { name: FONT_MAIN, italic: true, size: 9, color: { argb: C.TEXT_GRAY } }
  sheet.getCell(sigRow + 1, 1).alignment = { horizontal: "center" }

  sheet.mergeCells(sigRow + 1, NUM_COLS - 3, sigRow + 1, NUM_COLS)
  sheet.getCell(sigRow + 1, NUM_COLS - 3).value     = "(Ký, họ tên)"
  sheet.getCell(sigRow + 1, NUM_COLS - 3).font      = { name: FONT_MAIN, italic: true, size: 9, color: { argb: C.TEXT_GRAY } }
  sheet.getCell(sigRow + 1, NUM_COLS - 3).alignment = { horizontal: "center" }
}

/* ═══════════════════════════════════════════
   ATTENDANCE SHEET
   ═══════════════════════════════════════════ */

async function buildAttendanceSheet(wb: ExcelJS.Workbook, month: number, year: number) {
  const MONTH_VN = ["Một","Hai","Ba","Bốn","Năm","Sáu","Bảy","Tám","Chín","Mười","Mười Một","Mười Hai"]
  const sheet = wb.addWorksheet(`Chấm công T${month}.${year}`, {
    pageSetup: {
      paperSize: 9, orientation: "landscape",
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
    headerFooter: {
      oddFooter: `&C&"Arial,Bold"&9AXIOM HRM — Chấm công Tháng ${month}/${year}&R&9Trang &P / &N`,
    },
  })

  const COL_DEFS = [
    { key: "stt",    header: "STT",           width: 5  },
    { key: "code",   header: "Mã NV",          width: 10 },
    { key: "name",   header: "Họ và tên",       width: 26 },
    { key: "dept",   header: "Phòng ban",       width: 20 },
    { key: "date",   header: "Ngày",            width: 13 },
    { key: "in",     header: "Check-in",        width: 11 },
    { key: "out",    header: "Check-out",       width: 11 },
    { key: "ot",     header: "OT (giờ)",        width: 11 },
    { key: "late",   header: "Đi muộn\n(phút)", width: 13 },
    { key: "status", header: "Trạng thái",      width: 15 },
  ]
  const NUM_COLS = COL_DEFS.length
  const lastColLetter = colLetter(NUM_COLS)
  const HEADER_ROW = 5

  // Title rows
  addTitleRows(sheet, lastColLetter,
    `BẢNG CHẤM CÔNG THÁNG ${MONTH_VN[month-1].toUpperCase()} NĂM ${year}`)

  // Header
  sheet.columns = COL_DEFS.map(c => ({ key: c.key, width: c.width }))
  const headerRow = sheet.getRow(HEADER_ROW)
  COL_DEFS.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = c.header
    cell.font  = { name: FONT_MAIN, bold: true, color: { argb: C.WHITE }, size: 10 }
    cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_DARK } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    cell.border = medBorder()
  })
  headerRow.height = 36

  sheet.views = [{ state: "frozen", ySplit: HEADER_ROW, xSplit: 0, activeCell: "A6" }]

  // Status color map
  const STATUS_COLOR: Record<string, { fg: string; bg: string }> = {
    "Đi làm":   { fg: C.TEXT_PAID, bg: C.PAID_BG     },
    "Nghỉ phép":{ fg: "FF1E40AF",  bg: "FFDBEAFE"    },
    "Vắng":     { fg: "FF991B1B",  bg: "FFFEE2E2"    },
    "Đi muộn":  { fg: C.TEXT_PEND, bg: C.PEND_BG     },
  }

  const records = await prisma.attendance.findMany({
    where: {
      workDate: {
        gte: new Date(year, month - 1, 1),
        lt:  new Date(year, month, 1),
      },
    },
    include: { employee: { include: { department: true } } },
    orderBy: [{ employee: { fullName: "asc" } }, { workDate: "asc" }],
  })

  if (records.length === 0) {
    sheet.mergeCells(HEADER_ROW + 1, 1, HEADER_ROW + 1, NUM_COLS)
    const cell = sheet.getCell(HEADER_ROW + 1, 1)
    cell.value = `Chưa có dữ liệu chấm công tháng ${month}/${year}`
    cell.font  = { name: FONT_MAIN, italic: true, color: { argb: C.TEXT_GRAY } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    return
  }

  // Summary counters
  let totalPresent = 0, totalAbsent = 0, totalLate = 0, totalOT = 0

  records.forEach((r, idx) => {
    const rowNum = HEADER_ROW + 1 + idx
    const row    = sheet.getRow(rowNum)
    const isEven = idx % 2 === 1

    const rowData = {
      stt:    idx + 1,
      code:   r.employee.code,
      name:   r.employee.fullName,
      dept:   r.employee.department?.name ?? "—",
      date:   new Date(r.workDate).toLocaleDateString("vi-VN"),
      in:     r.checkIn  ? new Date(r.checkIn).toLocaleTimeString("vi-VN",  { hour: "2-digit", minute: "2-digit" }) : "—",
      out:    r.checkOut ? new Date(r.checkOut).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—",
      ot:     Number(r.otHours ?? 0),
      late:   r.lateMinutes ?? 0,
      status: r.status,
    }

    // Accumulate
    if (r.status === "Đi làm")    totalPresent++
    if (r.status === "Vắng")      totalAbsent++
    if ((r.lateMinutes ?? 0) > 0) totalLate++
    totalOT += rowData.ot

    COL_DEFS.forEach((c, i) => {
      const cell = row.getCell(i + 1)
      cell.value  = (rowData as any)[c.key]
      cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: isEven ? C.ROW_EVEN : C.ROW_ODD } }
      cell.border = thinBorder()

      if (c.key === "stt")   cell.alignment = { horizontal: "center", vertical: "middle" }
      else if (c.key === "name") {
        cell.alignment = { horizontal: "left", vertical: "middle" }
        cell.font = { name: FONT_MAIN, size: 10, color: { argb: C.TEXT_DARK } }
      } else if (c.key === "ot" || c.key === "late") {
        cell.alignment = { horizontal: "center", vertical: "middle" }
        cell.font = { name: FONT_MAIN, size: 10,
          color: { argb: rowData.ot > 0 ? "FF1D4ED8" : C.TEXT_DARK } }
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" }
        cell.font = { name: FONT_MAIN, size: 10, color: { argb: C.TEXT_DARK } }
      }

      // Status badge
      if (c.key === "status") {
        const sc = STATUS_COLOR[r.status] ?? { fg: C.TEXT_DARK, bg: C.ROW_ODD }
        cell.font = { name: FONT_MAIN, bold: true, size: 9.5, color: { argb: sc.fg } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: sc.bg } }
      }
    })

    row.height = 19
  })

  // ── Summary row ───────────────────────────────────────────────
  const sumRowNum = HEADER_ROW + 1 + records.length
  const sumRow    = sheet.getRow(sumRowNum)
  sumRow.height   = 24

  sheet.mergeCells(sumRowNum, 1, sumRowNum, 4)
  const sumCell = sumRow.getCell(1)
  sumCell.value     = `Tổng: ${records.length} bản ghi`
  sumCell.font      = { name: FONT_MAIN, bold: true, size: 10, color: { argb: C.TOTAL_FG } }
  sumCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C.TOTAL_BG } }
  sumCell.alignment = { horizontal: "center", vertical: "middle" }
  sumCell.border    = thinBorder(C.BORDER_HD)

  // Stats next cols
  const statsData = [
    { label: `✓ Đi làm: ${totalPresent}`, col: 5 },
    { label: `✗ Vắng: ${totalAbsent}`,    col: 6 },
    { label: `⚠ Đi muộn: ${totalLate}`,  col: 7 },
    { label: `OT: ${totalOT}h`,            col: 8 },
  ]
  statsData.forEach(s => {
    const cell = sumRow.getCell(s.col)
    cell.value     = s.label
    cell.font      = { name: FONT_MAIN, bold: true, size: 9.5, color: { argb: C.TOTAL_FG } }
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C.TOTAL_BG } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border    = thinBorder(C.BORDER_HD)
  })
  for (let c = 9; c <= NUM_COLS; c++) {
    const cell = sumRow.getCell(c)
    cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: C.TOTAL_BG } }
    cell.border = thinBorder(C.BORDER_HD)
    cell.font   = { name: FONT_MAIN, bold: true, color: { argb: C.TOTAL_FG } }
  }
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

/** Thêm 4 dòng tiêu đề đầu (company + report title + date + blank) */
function addTitleRows(sheet: ExcelJS.Worksheet, lastCol: string, rptTitle: string) {
  sheet.mergeCells(`A1:${lastCol}1`)
  const t1 = sheet.getCell("A1")
  t1.value     = "CÔNG TY CỔ PHẦN AXIOM"
  t1.font      = { name: FONT_MAIN, bold: true, size: 14, color: { argb: C.RED_TEXT } }
  t1.alignment = { horizontal: "center", vertical: "middle" }
  t1.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_LIGHT } }
  sheet.getRow(1).height = 26

  sheet.mergeCells(`A2:${lastCol}2`)
  const t2 = sheet.getCell("A2")
  t2.value     = rptTitle
  t2.font      = { name: FONT_MAIN, bold: true, size: 13, color: { argb: C.WHITE } }
  t2.alignment = { horizontal: "center", vertical: "middle" }
  t2.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C.RED_DARK } }
  sheet.getRow(2).height = 28

  sheet.mergeCells(`A3:${lastCol}3`)
  const t3 = sheet.getCell("A3")
  t3.value     = `Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
  t3.font      = { name: FONT_MAIN, italic: true, size: 9, color: { argb: C.TEXT_GRAY } }
  t3.alignment = { horizontal: "right", vertical: "middle" }
  sheet.getRow(3).height = 16

  sheet.getRow(4).height = 6
}

/** Chuyển số cột → chữ cái (1=A, 26=Z, 27=AA,...) */
function colLetter(col: number): string {
  let s = ""
  while (col > 0) {
    col--
    s = String.fromCharCode(65 + (col % 26)) + s
    col = Math.floor(col / 26)
  }
  return s
}
