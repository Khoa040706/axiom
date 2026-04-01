// ── Employee Types ──────────────────────────────────────────────
export interface EmployeeWithRelations {
  id: number
  code: string
  fullName: string
  gender?: string | null
  dateOfBirth?: Date | null
  idNumber?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  avatarPath?: string | null
  departmentId?: number | null
  positionId?: number | null
  hireDate: Date
  status: string
  taxCode?: string | null
  numDependents: number
  createdAt: Date
  updatedAt: Date
  department?: {
    id: number
    name: string
  } | null
  position?: {
    id: number
    name: string
  } | null
  contracts?: {
    contractType: string
    baseSalary: number
    allowance: number
  }[]
}

export interface DepartmentBasic {
  id: number
  name: string
  description?: string | null
  isActive: boolean
}

export interface PositionBasic {
  id: number
  name: string
  description?: string | null
  isActive: boolean
}

export interface ContractBasic {
  id: number
  employeeId: number
  contractType: string
  startDate: Date
  endDate?: Date | null
  baseSalary: number
  salaryGrade: number
  allowance: number
  status: string
  notes?: string | null
}

export interface CareerHistoryEntry {
  id: number
  employeeId: number
  eventType: string
  eventDate: Date | string
  description?: string | null
  decisionNumber?: string | null
  oldDepartment?: string | null
  newDepartment?: string | null
  oldPosition?: string | null
  newPosition?: string | null
  oldSalary?: number | null
  newSalary?: number | null
  rewardType?: string | null
  rewardAmount?: number | null
  penaltyType?: string | null
  createdAt?: Date | string
  employee?: {
    id: number
    code: string
    fullName: string
    department?: { name: string } | null
    position?: { name: string } | null
  }
}
