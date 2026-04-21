import { BHXH_RATE, BHYT_RATE, BHTN_RATE, PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION } from "@/lib/constants"

// ═══════════════════════════════════════════════════════════════
//  PAYROLL CALCULATOR — Engine tính lương tập trung
//  Dùng bởi: payroll.service.ts (backend Prisma) + payroll/page.tsx (UI preview)
//  Chuẩn: Luật Thuế TNCN VN 2026 — 5 bậc lũy tiến
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────
export interface InsuranceResult {
  bhxh: number
  bhyt: number
  bhtn: number
  total: number
}

export interface SalaryResult {
  grossSalary:    number
  bhxh:           number
  bhyt:           number
  bhtn:           number
  totalInsurance: number
  taxableIncome:  number
  taxAmount:      number
  netSalary:      number
}

export interface SalaryInput {
  baseSalary:       number   // Lương cơ bản (đã × hệ số nếu muốn)
  salaryGrade:      number   // Hệ số lương
  allowance:        number   // Phụ cấp (miễn thuế, không tính BH)
  otPay:            number   // Lương OT (tổng, đã tính hệ số 1.5/2/3×)
  numDependents:    number   // Số người phụ thuộc
  otherDeductions?: number   // Khấu trừ khác (nếu có)
}

// ── Bảo hiểm bắt buộc NLĐ đóng (10.5%) ───────────────────────
// Tính trên lương cơ bản × hệ số (không tính OT/phụ cấp — TT 59/2015)
export function calculateInsurance(salaryForInsurance: number): InsuranceResult {
  const bhxh = Math.round(salaryForInsurance * BHXH_RATE)   // 8%
  const bhyt = Math.round(salaryForInsurance * BHYT_RATE)   // 1.5%
  const bhtn = Math.round(salaryForInsurance * BHTN_RATE)   // 1%
  return { bhxh, bhyt, bhtn, total: bhxh + bhyt + bhtn }
}

// ── Thuế TNCN lũy tiến 5 bậc (VN 2026) ───────────────────────
// Nghị quyết 107/2023/QH15 — áp dụng từ 01/01/2026
// Dùng công thức nhanh thay vì vòng lặp để tránh sai số làm tròn
export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0)             return 0
  if (taxableIncome <= 10_000_000)    return Math.round(taxableIncome * 0.05)
  if (taxableIncome <= 30_000_000)    return Math.round(taxableIncome * 0.10 -    500_000)
  if (taxableIncome <= 60_000_000)    return Math.round(taxableIncome * 0.20  - 3_500_000)
  if (taxableIncome <= 100_000_000)   return Math.round(taxableIncome * 0.30  - 9_500_000)
  return                                     Math.round(taxableIncome * 0.35  - 14_500_000)
}

// ── Tính lương Gross → Net (full pipeline) ──────────────────────
export function calculateSalary(input: SalaryInput): SalaryResult {
  const { baseSalary, salaryGrade, allowance, otPay, numDependents, otherDeductions = 0 } = input

  // 1. Lương cơ bản đã nhân hệ số
  const basePay = baseSalary * salaryGrade

  // 2. Gross = lương cơ bản × hệ số + OT (phụ cấp KHÔNG cộng vào Gross để tính BH)
  const grossSalary = basePay + otPay

  // 3. Bảo hiểm: chỉ tính trên basePay (TT 59/2015 — không tính OT/phụ cấp)
  const { bhxh, bhyt, bhtn, total: totalInsurance } = calculateInsurance(basePay)

  // 4. Thu nhập tính thuế (TNTT)
  //    = Gross + Phụ cấp chịu thuế − BH − Giảm trừ gia cảnh
  //    (Ở đây coi allowance là phụ cấp miễn thuế → không cộng vào TNTT)
  const taxableIncome = Math.max(
    0,
    grossSalary - totalInsurance - PERSONAL_DEDUCTION - numDependents * DEPENDENT_DEDUCTION
  )

  // 5. Thuế TNCN (5 bậc lũy tiến VN 2026)
  const taxAmount = calculateIncomeTax(taxableIncome)

  // 6. Net = Gross + Phụ cấp miễn thuế − BH − Thuế − Khấu trừ khác
  const netSalary = grossSalary + allowance - totalInsurance - taxAmount - otherDeductions

  return {
    grossSalary:    Math.round(grossSalary),
    bhxh, bhyt, bhtn,
    totalInsurance,
    taxableIncome:  Math.round(taxableIncome),
    taxAmount,
    netSalary:      Math.round(netSalary),
  }
}

// ── OT Helper: tính lương OT theo 3 loại ──────────────────────
export function calculateOTPay(params: {
  basePay:          number   // baseSalary × salaryGrade
  standardDays?:    number   // ngày chuẩn (default 26)
  otWeekdayHours?:  number   // giờ OT ngày thường (×1.5)
  otWeekendHours?:  number   // giờ OT cuối tuần (×2.0)
  otHolidayHours?:  number   // giờ OT ngày lễ (×3.0)
}): { otWeekdayPay: number; otWeekendPay: number; otHolidayPay: number; total: number } {
  const { basePay, standardDays = 26, otWeekdayHours = 0, otWeekendHours = 0, otHolidayHours = 0 } = params
  const hourlyRate    = basePay / standardDays / 8
  const otWeekdayPay  = Math.round(hourlyRate * 1.5 * otWeekdayHours)
  const otWeekendPay  = Math.round(hourlyRate * 2.0 * otWeekendHours)
  const otHolidayPay  = Math.round(hourlyRate * 3.0 * otHolidayHours)
  return { otWeekdayPay, otWeekendPay, otHolidayPay, total: otWeekdayPay + otWeekendPay + otHolidayPay }
}
