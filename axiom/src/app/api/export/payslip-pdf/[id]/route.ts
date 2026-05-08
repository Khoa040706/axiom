import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer, Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer"
import { createElement as C } from "react"
import { prisma } from "@/lib/prisma"
import { tDept, tPos } from "@/lib/i18n-maps"

Font.register({
  family: "Arial",
  fonts: [
    { src: "C:\\Windows\\Fonts\\arial.ttf",   fontWeight: 400 },
    { src: "C:\\Windows\\Fonts\\arialbd.ttf", fontWeight: 700 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

const RED = "#D0211C"
const GRAY1 = "#1E293B"
const GRAY2 = "#64748B"
const GREEN = "#059669"
const AMBER = "#D97706"
const BLUE  = "#3B82F6"

const s = StyleSheet.create({
  page:    { fontFamily: "Arial", fontSize: 9, color: GRAY1, backgroundColor: "#F8FAFC", padding: 0 },
  header:  { backgroundColor: RED, padding: "18 28", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand:   { fontSize: 20, fontWeight: "bold", color: "#fff", letterSpacing: 3 },
  brandSub:{ fontSize: 7.5, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  metaTitle:{ fontSize: 12, fontWeight: "bold", color: "#fff" },
  metaDate: { fontSize: 7.5, color: "rgba(255,255,255,0.7)", marginTop: 3 },
  badge:   { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 4, padding: "3 8", marginTop: 4 },
  badgeTx: { fontSize: 7, color: "#fff", fontWeight: "bold" },
  content: { padding: "16 28 28" },
  // Employee info card
  infoCard:{ backgroundColor: "#fff", borderRadius: 8, border: "1 solid #E2E8F0", padding: "12 16", marginBottom: 16, flexDirection: "row", gap: 24 },
  infoLabel:{ fontSize: 7.5, color: GRAY2, marginBottom: 2 },
  infoVal:  { fontSize: 9, fontWeight: "bold", color: GRAY1 },
  // Section title
  secTitle: { fontSize: 8.5, fontWeight: "bold", color: RED, marginBottom: 6, marginTop: 12, textTransform: "uppercase", letterSpacing: 1 },
  // Table
  row:      { flexDirection: "row", justifyContent: "space-between", padding: "7 0", borderBottom: "1 solid #F1F5F9", alignItems: "center" },
  rowShade: { flexDirection: "row", justifyContent: "space-between", padding: "7 0", borderBottom: "1 solid #F1F5F9", alignItems: "center", backgroundColor: "#FAFAFA" },
  rowLabel: { fontSize: 9, color: GRAY2, flex: 1 },
  rowVal:   { fontSize: 9, fontWeight: "bold" },
  // Net total row
  totalRow: { flexDirection: "row", justifyContent: "space-between", padding: "10 0", borderTop: "2 solid #E2E8F0", marginTop: 8, alignItems: "center" },
  totalLabel:{ fontSize: 12, fontWeight: "bold", color: GRAY1 },
  totalVal:  { fontSize: 16, fontWeight: "bold", color: GREEN },
  // Footer
  footer:   { marginTop: 24, borderTop: "1 solid #E2E8F0", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footTxt:  { fontSize: 7, color: GRAY2 },
  signCol:  { alignItems: "center", gap: 4 },
  signLine: { width: 100, borderBottom: "1 solid #CBD5E1", marginTop: 20 },
  signLabel:{ fontSize: 7, color: GRAY2 },
})

function fmt(v: number) {
  return Math.round(Math.abs(v)).toLocaleString("vi-VN") + " \u0111"
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lang = req.nextUrl.searchParams.get("lang") ?? "vi"
    const vi = lang !== "en"

    const slip = await prisma.payslip.findUnique({
      where: { id: parseInt(id) },
      include: {
        payroll: {
          include: {
            employee: {
              include: {
                department: true,
                position:   true,
              },
            },
          },
        },
      },
    })

    if (!slip?.payroll) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 })
    }

    const pr       = slip.payroll
    const emp      = pr.employee
    const empName  = emp?.fullName ?? "—"
    const empCode  = emp?.code     ?? "—"
    const deptName = tDept(emp?.department?.name ?? "—", vi)
    const posName  = tPos(emp?.position?.name   ?? "—", vi)
    const month    = pr.payMonth
    const year     = pr.payYear
    const deps     = emp?.numDependents ?? 0

    const gross     = Number(pr.baseSalary   ?? 0)
    const allowance = Number(pr.allowance    ?? 0)
    const otPay     = Number(pr.otPay        ?? 0)
    const bhxh      = Number(pr.bhxh         ?? 0)
    const bhyt      = Number(pr.bhyt         ?? 0)
    const bhtn      = Number(pr.bhtn         ?? 0)
    const pit       = Number(pr.taxAmount    ?? 0)
    const net       = Number(pr.netSalary    ?? 0)
    const selfDed   = 15_500_000
    const depDed    = deps * 6_200_000

    const dateStr = new Date().toLocaleDateString(vi ? "vi-VN" : "en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })

    const incomeRows = [
      { l: vi ? "Lương cơ bản (Gross)" : "Gross Salary",   v: gross,     color: GREEN },
      ...(allowance > 0 ? [{ l: vi ? "Phụ cấp" : "Allowance",          v: allowance, color: GREEN }] : []),
      ...(otPay     > 0 ? [{ l: vi ? "Lương tăng ca" : "Overtime Pay", v: otPay,     color: GREEN }] : []),
    ]
    const deductRows = [
      { l: "BHXH (8%)",   v: bhxh, color: "#EF4444" },
      { l: "BHYT (1.5%)", v: bhyt, color: "#EF4444" },
      { l: "BHTN (1%)",   v: bhtn, color: "#EF4444" },
      { l: vi ? "Thuế TNCN (lũy tiến)" : "Income Tax (progressive)", v: pit, color: AMBER },
    ]
    const infoRows = [
      { l: vi ? "Giảm trừ bản thân" : "Self deduction", v: selfDed, color: BLUE },
      ...(deps > 0 ? [{ l: vi ? `Giảm trừ ${deps} người phụ thuộc` : `${deps} dependent(s)`, v: depDed, color: BLUE }] : []),
    ]

    function mkRow(label: string, value: number, color: string, sign: "+" | "−" | "", shade = false) {
      return C(View, { style: shade ? s.rowShade : s.row },
        C(Text, { style: s.rowLabel }, label),
        C(Text, { style: { ...s.rowVal, color } }, `${sign}${fmt(value)}`),
      )
    }

    const doc = C(Document, { title: `PhieuLuong_${empCode}_T${month}_${year}` },
      C(Page, { size: "A4", style: s.page },
        // Header
        C(View, { style: s.header },
          C(View, {},
            C(Text, { style: s.brand }, "AXIOM"),
            C(Text, { style: s.brandSub }, "HRM & PAYROLL MANAGEMENT SYSTEM"),
          ),
          C(View, { style: { alignItems: "flex-end" } },
            C(Text, { style: s.metaTitle }, vi ? "PHIẾU LƯƠNG" : "PAYSLIP"),
            C(Text, { style: s.metaDate }, dateStr),
            C(View, { style: s.badge },
              C(Text, { style: s.badgeTx }, vi ? `Tháng ${month}/${year}  •  #${slip.id}` : `Month ${month}/${year}  •  #${slip.id}`),
            ),
          ),
        ),
        C(View, { style: s.content },
          // Employee info
          C(View, { style: s.infoCard },
            C(View, {},
              C(Text, { style: s.infoLabel }, vi ? "Nhân viên" : "Employee"),
              C(Text, { style: s.infoVal }, `${empName} (${empCode})`),
            ),
            C(View, {},
              C(Text, { style: s.infoLabel }, vi ? "Phòng ban" : "Department"),
              C(Text, { style: s.infoVal }, deptName),
            ),
            C(View, {},
              C(Text, { style: s.infoLabel }, vi ? "Vị trí" : "Position"),
              C(Text, { style: s.infoVal }, posName),
            ),
            C(View, {},
              C(Text, { style: s.infoLabel }, vi ? "Người phụ thuộc" : "Dependents"),
              C(Text, { style: s.infoVal }, `${deps} ${vi ? "người" : "person(s)"}`),
            ),
          ),

          // Income
          C(Text, { style: s.secTitle }, vi ? "Thu nhập" : "Income"),
          ...incomeRows.map((r, i) => mkRow(r.l, r.v, r.color, "+", i % 2 !== 0)),

          // Deductions
          C(Text, { style: s.secTitle }, vi ? "Khấu trừ" : "Deductions"),
          ...deductRows.map((r, i) => mkRow(r.l, r.v, r.color, "−", i % 2 !== 0)),

          // Tax info
          C(Text, { style: s.secTitle }, vi ? "Thông tin thuế" : "Tax Info"),
          ...infoRows.map((r, i) => mkRow(r.l, r.v, r.color, "", i % 2 !== 0)),

          // Net
          C(View, { style: s.totalRow },
            C(Text, { style: s.totalLabel }, vi ? "LƯƠNG NET" : "NET SALARY"),
            C(Text, { style: s.totalVal }, fmt(net)),
          ),

          // Signatures
          C(View, { style: s.footer },
            C(View, { style: s.signCol },
              C(View, { style: s.signLine }),
              C(Text, { style: s.signLabel }, vi ? "Nhân viên" : "Employee"),
            ),
            C(View, { style: s.signCol },
              C(View, { style: s.signLine }),
              C(Text, { style: s.signLabel }, vi ? "Kế toán" : "Accountant"),
            ),
            C(View, { style: s.signCol },
              C(View, { style: s.signLine }),
              C(Text, { style: s.signLabel }, vi ? "Giám đốc" : "Director"),
            ),
          ),

          C(View, { style: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" } },
            C(Text, { style: s.footTxt }, "AXIOM HRM & Payroll Management System"),
            C(Text, { style: s.footTxt }, vi
              ? `Xuất lúc: ${new Date().toLocaleString("vi-VN")}`
              : `Exported: ${new Date().toLocaleString("en-US")}`),
          ),
        ),
      ),
    )

    const buffer = await renderToBuffer(doc)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PhieuLuong_${empCode}_T${month}_${year}.pdf"`,
      },
    })
  } catch (err) {
    console.error("[payslip-pdf]", err)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }
}
