"use server"

import { contractService } from "@/lib/services/contract.service"
import { contractSchema } from "@/lib/validators/contract.schema"
import { serialize } from "@/lib/helpers/serialize"

export async function getAllContracts(params?: {
  search?: string
  status?: string
}) {
  try {
    const data = await contractService.findAll(params)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getAllContracts]", error)
    return { success: false, error: "Không thể tải danh sách hợp đồng" }
  }
}

export async function getContractsByEmployee(employeeId: number) {
  try {
    const data = await contractService.findByEmployee(employeeId)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getContractsByEmployee]", error)
    return { success: false, error: "Không thể tải hợp đồng" }
  }
}

export async function getExpiringContracts(withinDays = 30) {
  try {
    const data = await contractService.findExpiringSoon(withinDays)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[getExpiringContracts]", error)
    return { success: false, error: "Không thể tải hợp đồng sắp hết hạn" }
  }
}

export async function createContract(formData: unknown) {
  try {
    const parsed = contractSchema.safeParse(formData)
    if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors }

    const { startDate, endDate, ...rest } = parsed.data
    const data = await contractService.create({
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    })
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[createContract]", error)
    return { success: false, error: "Không thể tạo hợp đồng" }
  }
}

export async function terminateContract(id: number) {
  try {
    const data = await contractService.terminate(id)
    return { success: true, data: serialize(data) }
  } catch (error) {
    console.error("[terminateContract]", error)
    return { success: false, error: "Không thể chấm dứt hợp đồng" }
  }
}
