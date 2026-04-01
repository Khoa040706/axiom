import { z } from "zod"

export const payrollSchema = z.object({
  employeeId: z.number().int().positive("Vui lòng chọn nhân viên"),
  payMonth: z.number().int().min(1).max(12),
  payYear: z.number().int().min(2020).max(2100),
  workDays: z.number().min(0).default(0),
  otHours: z.number().min(0).default(0),
  baseSalary: z.number().min(0).default(0),
  allowance: z.number().min(0).default(0),
  otPay: z.number().min(0).default(0),
  grossSalary: z.number().min(0).default(0),
  bhxh: z.number().min(0).default(0),
  bhyt: z.number().min(0).default(0),
  bhtn: z.number().min(0).default(0),
  taxIncome: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  netSalary: z.number().min(0).default(0),
  status: z.enum(["Nháp", "Đã tính", "Đã gửi"]).default("Nháp"),
})

export type PayrollInput = z.infer<typeof payrollSchema>

export const salaryConfigSchema = z.object({
  configKey: z.string().min(1),
  configValue: z.number(),
  description: z.string().max(200).optional(),
})

export type SalaryConfigInput = z.infer<typeof salaryConfigSchema>
