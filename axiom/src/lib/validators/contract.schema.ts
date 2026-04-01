import { z } from "zod"
import { CONTRACT_TYPES } from "@/lib/constants"

export const contractSchema = z.object({
  employeeId: z.number().int().positive("Vui lòng chọn nhân viên"),
  contractType: z.enum(CONTRACT_TYPES, { message: "Loại hợp đồng không hợp lệ" }),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().optional(),
  baseSalary: z.number().min(0, "Lương cơ bản phải >= 0"),
  salaryGrade: z.number().min(1).default(1.0),
  allowance: z.number().min(0).default(0),
  status: z.enum(["Hiệu lực", "Hết hạn", "Chấm dứt"]).default("Hiệu lực"),
  notes: z.string().max(500).optional(),
})

export type ContractInput = z.infer<typeof contractSchema>

export const contractUpdateSchema = contractSchema.partial().extend({
  id: z.number().int().positive(),
})

export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>
