import { BHXH_RATE, BHYT_RATE, BHTN_RATE, PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION, TAX_BRACKETS } from "@/lib/constants"

// ═══════════════════════════════════════════════════════════════
//  PAYROLL CALCULATOR — Engine tính lương tập trung
//  (Gộp từ: salary-calculator.ts, insurance-calculator.ts, tax-calculator.ts)
//  Dùng bởi: payroll.service.ts (backend Prisma)
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────
export interface InsuranceResult {
  bhxh: number
  bhyt: number
  bhtn: number
  total: number
}

export interface SalaryResult {
  grossSalary: number
  bhxh: number
  bhyt: number
  bhtn: number
  totalInsurance: number
  taxableIncome: number
  taxAmount: number
  netSalary: number
}

interface SalaryInput {
  baseSalary: number        // Lương cơ bản
  salaryGrade: number       // Hệ số lương
  allowance: number         // Phụ cấp
  otPay: number             // Tiền OT
  numDependents: number     // Số người phụ thuộc
  otherDeductions?: number  // Khấu trừ khác
}

// ── Bảo hiểm bắt buộc (10.5% NLĐ đóng) ───────────────────
export function calculateInsurance(grossSalary: number): InsuranceResult {
  const bhxh = Math.round(grossSalary * BHXH_RATE)
  const bhyt = Math.round(grossSalary * BHYT_RATE)
  const bhtn = Math.round(grossSalary * BHTN_RATE)
  return { bhxh, bhyt, bhtn, total: bhxh + bhyt + bhtn }
}

// ── Thuế TNCN lũy tiến 7 bậc (Luật Thuế TNCN VN) ─────────────
export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  let remainingIncome = taxableIncome
  let totalTax = 0
  let previousMax = 0

  for (const bracket of TAX_BRACKETS) {
    const bracketSize = bracket.max - previousMax
    const taxableInBracket = Math.min(remainingIncome, bracketSize)
    totalTax += taxableInBracket * bracket.rate
    remainingIncome -= taxableInBracket
    previousMax = bracket.max
    if (remainingIncome <= 0) break
  }

  return Math.round(totalTax)
}

// ── Tính lương tổng hợp Gross → Net ──────────────────────
export function calculateSalary(input: SalaryInput): SalaryResult {
  const { baseSalary, salaryGrade, allowance, otPay, numDependents, otherDeductions = 0 } = input

  // 1. Gross
  const grossSalary = baseSalary * salaryGrade + allowance + otPay

  // 2. Bảo hiểm
  const { bhxh, bhyt, bhtn, total: totalInsurance } = calculateInsurance(grossSalary)

  // 3. Thu nhập chịu thuế
  const taxableIncome = Math.max(
    0,
    grossSalary - totalInsurance - PERSONAL_DEDUCTION - numDependents * DEPENDENT_DEDUCTION
  )

  // 4. Thuế TNCN
  const taxAmount = calculateIncomeTax(taxableIncome)

  // 5. Lương Net
  const netSalary = grossSalary - totalInsurance - taxAmount - otherDeductions

  return {
    grossSalary: Math.round(grossSalary),
    bhxh, bhyt, bhtn,
    totalInsurance,
    taxableIncome: Math.round(taxableIncome),
    taxAmount,
    netSalary: Math.round(netSalary),
  }
}
