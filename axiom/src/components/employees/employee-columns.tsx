"use client"

// employee-columns.tsx
// Định nghĩa cột cho DataTable nhân viên (dùng với thư viện table tùy chọn)

export interface EmployeeRow {
  id: string
  code: string
  name: string
  email: string
  phone: string
  dept: string
  pos: string
  type: string
  status: string
  date: string
}

export const EMPLOYEE_COLUMNS_VI = [
  { key: "code",   label: "Mã NV",        width: 80 },
  { key: "name",   label: "Họ tên",        width: 180 },
  { key: "dept",   label: "Phòng ban",     width: 160 },
  { key: "pos",    label: "Chức vụ",       width: 160 },
  { key: "type",   label: "Loại HĐ",       width: 100 },
  { key: "status", label: "Trạng thái",    width: 110 },
  { key: "date",   label: "Ngày vào làm",  width: 120 },
  { key: "actions",label: "Thao tác",      width: 110 },
] as const

export const EMPLOYEE_COLUMNS_EN = [
  { key: "code",   label: "ID",            width: 80 },
  { key: "name",   label: "Full Name",     width: 180 },
  { key: "dept",   label: "Department",    width: 160 },
  { key: "pos",    label: "Position",      width: 160 },
  { key: "type",   label: "Contract",      width: 100 },
  { key: "status", label: "Status",        width: 110 },
  { key: "date",   label: "Join Date",     width: 120 },
  { key: "actions",label: "Actions",       width: 110 },
] as const

export type EmployeeColumnKey = (typeof EMPLOYEE_COLUMNS_VI)[number]["key"]

/** Trả về màu badge theo status */
export function getStatusBadge(status: string) {
  if (status === "Đang làm" || status === "active") {
    return { bg: "#D1FAE5", color: "#065F46", label: "Đang làm" }
  }
  if (status === "Thử việc" || status === "trial") {
    return { bg: "#FEF3C7", color: "#92400E", label: "Thử việc" }
  }
  return { bg: "#F3F4F6", color: "#374151", label: status }
}
