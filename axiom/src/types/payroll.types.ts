// ── Payroll Types ───────────────────────────────────────────────
export interface PayrollRecord {
  id: number
  employeeId: number
  payMonth: number
  payYear: number
  workDays: number
  otHours: number
  baseSalary: number
  allowance: number
  otPay: number
  grossSalary: number
  bhxh: number
  bhyt: number
  bhtn: number
  taxIncome: number
  taxAmount: number
  deductions: number
  netSalary: number
  status: "Nháp" | "Đã tính" | "Đã gửi"
  createdAt: Date
  employee?: {
    id: number
    code: string
    fullName: string
    department?: { name: string } | null
    position?: { name: string } | null
  }
}

export interface PayslipRecord {
  id: number
  payrollId: number
  employeeId: number
  issuedDate: Date
  pdfPath?: string | null
  isViewed: boolean
  createdAt: Date
  payroll?: PayrollRecord
  employee?: {
    fullName: string
    code: string
  }
}

export interface SalaryConfigItem {
  id: number
  configKey: string
  configValue: number
  description?: string | null
  updatedAt: Date
}

export interface PayrollSummary {
  totalGross: number
  totalNet: number
  totalTax: number
  totalInsurance: number
  employeeCount: number
  month: number
  year: number
}
