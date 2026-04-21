/**
 * i18n-maps.ts
 * Central mapping of Vietnamese DB values → English UI labels.
 * Used across all dashboard pages to translate data-layer strings.
 */

// ── Department names ──────────────────────────────────────────────────
export const DEPT_VI_TO_EN: Record<string, string> = {
  "Công nghệ thông tin":   "Information Technology",
  "Kế toán - Tài chính":  "Accounting & Finance",
  "Kinh doanh":            "Sales & Business",
  "Marketing":             "Marketing",
  "Nhân sự":               "Human Resources",
  "Phòng Công nghệ":       "Technology Dept.",
  "Phòng Kế toán":         "Accounting Dept.",
  "Phòng Kinh doanh":      "Business Dept.",
  "Phòng Nhân sự":         "HR Dept.",
  "Ban Giám đốc":          "Executive Board",
  "Hành chính":            "Administration",
  "Pháp lý":               "Legal",
  "Vận hành":              "Operations",
  "Sản xuất":              "Production",
  "Chăm sóc khách hàng":   "Customer Service",
  "Nghiên cứu & Phát triển":"Research & Development",
}

// ── Position names ────────────────────────────────────────────────────
export const POS_VI_TO_EN: Record<string, string> = {
  "Giám đốc":                    "Director",
  "Phó Giám đốc":                "Deputy Director",
  "Trưởng phòng Nhân sự":        "HR Manager",
  "Trưởng phòng IT":             "IT Manager",
  "Trưởng phòng Kinh doanh":     "Sales Manager",
  "Trưởng phòng Marketing":      "Marketing Manager",
  "Trưởng phòng Kế toán":        "Accounting Manager",
  "Trưởng phòng CNTT":           "IT Manager",
  "Trưởng phòng":                "Department Head",
  "Kế toán trưởng":              "Chief Accountant",
  "Lập trình viên":              "Software Developer",
  "Kỹ sư DevOps":                "DevOps Engineer",
  "Tester / QA":                 "Tester / QA",
  "Thực tập sinh":               "Intern",
  "Chuyên viên CSKH":            "Customer Service Specialist",
  "Nhân viên kinh doanh":        "Sales Executive",
  "Nhân viên nhân sự":           "HR Specialist",
  "Chuyên viên nhân sự":         "HR Specialist",
  "Chuyên viên tuyển dụng":      "Recruitment Specialist",
  "Nhân viên kế toán":           "Accountant",
  "Kế toán viên":                "Accountant",
  "Nhân viên Marketing":         "Marketing Staff",
  "Chuyên viên Marketing":       "Marketing Specialist",
  "Chuyên viên thuế":            "Tax Specialist",
  "Chuyên viên chính":           "Senior Specialist",
  "Chuyên viên":                 "Specialist",
  "Nhân viên":                   "Staff",
  "Thiết kế đồ họa":             "Graphic Designer",
  "Phụ trách thuế":              "Tax Manager",
  "TP Nhân sự":                  "HR Manager",
  "TP CNTT":                     "IT Manager",
  "TP Kinh doanh":               "Sales Manager",
  "TP Kế toán":                  "Accounting Manager",
  "TP Marketing":                "Marketing Manager",
}

// ── Common career description phrases (demo data) ─────────────────────
// Order matters: longer/more specific phrases must come BEFORE shorter ones
export const CAREER_PHRASES_VI_TO_EN: Array<[string, string]> = [
  ["Thăng lên chuyên viên chính",     "Promoted to Senior Specialist"],
  ["Thăng lên",                        "Promoted to"],
  ["Đánh giá xuất sắc Q2/2020",        "Outstanding performance Q2/2020"],
  ["Đánh giá xuất sắc Q",              "Outstanding review Q"],
  ["Đánh giá xuất sắc",               "Outstanding performance review"],
  ["Quyết định bổ nhiệm TP Nhân sự",  "Appointment – HR Manager"],
  ["Quyết định bổ nhiệm",             "Appointment decision"],
  ["Chuyên sang phụ trách thuế",       "Transferred to tax responsibilities"],
  ["Chuyển sang phụ trách thuế",       "Transferred to tax responsibilities"],
  ["Chuyển sang",                       "Transferred to"],
  ["Chuyên sang",                       "Transferred to"],
  ["phụ trách thuế",                   "tax responsibilities"],
  ["Luân chuyển sang",                 "Transferred to"],
  ["Điều chuyển sang",                 "Transferred to"],
  ["Trưởng phòng xuất sắc năm 2024",  "Outstanding Manager 2024"],
  ["Trưởng phòng xuất sắc năm 2023",  "Outstanding Manager 2023"],
  ["Nhân viên xuất sắc năm 2024",     "Employee of the Year 2024"],
  ["Nhân viên xuất sắc năm 2023",     "Employee of the Year 2023"],
  ["Nhân viên xuất sắc năm 2022",     "Employee of the Year 2022"],
  ["Nhân viên xuất sắc",              "Outstanding Employee"],
  ["xuất sắc năm 2024",               "of the Year 2024"],
  ["xuất sắc năm 2023",               "of the Year 2023"],
  ["xuất sắc năm",                    "of the Year"],
  ["Khen thưởng thành tích xuất sắc", "Award for outstanding performance"],
  ["Tăng lương theo lộ trình 2024",   "Salary increase per 2024 roadmap"],
  ["Tăng lương theo lộ trình 2023",   "Salary increase per 2023 roadmap"],
  ["Tăng lương theo lộ trình",        "Salary increase per roadmap"],
  ["Tăng lương",                      "Salary increase"],
  ["Điều chỉnh lương",                "Salary adjustment"],
  ["theo lộ trình",                   "per roadmap"],
  ["Bổ nhiệm chính thức",             "Officially appointed"],
  ["Bổ nhiệm",                        "Appointed"],
  ["Miễn nhiệm",                      "Dismissed"],
  ["Khen thưởng",                     "Rewarded"],
  ["Hoàn thành",                      "Completed"],
  ["Theo yêu cầu",                    "As requested"],
  ["Hội đồng quản trị",               "Board of Directors"],
  ["Căn cứ",                          "Based on"],
  ["Hiệu quả từ",                     "Effective from"],
]

// ── Contract types ────────────────────────────────────────────────────
export const CONTRACT_TYPE_VI_TO_EN: Record<string, string> = {
  "Chính thức":    "Full-time",
  "Thử việc":      "Probation",
  "Thời vụ":       "Contract",
  "Thực tập":      "Internship Agreement",
  "Toàn thời gian":"Full-time",
  "Bán thời gian": "Part-time",
}

// ── Helper: translate a value, fallback to original if not found ──────
export function tDept(name: string, vi: boolean): string {
  if (vi || !name) return name
  return DEPT_VI_TO_EN[name] ?? name
}

export function tPos(name: string, vi: boolean): string {
  if (vi || !name) return name
  return POS_VI_TO_EN[name] ?? name
}

export function tContractType(type: string, vi: boolean): string {
  if (vi || !type) return type
  return CONTRACT_TYPE_VI_TO_EN[type] ?? type
}

/**
 * Translate a free-text career event detail/description string.
 * 1. Applies common career phrases (longest match first, case-insensitive)
 * 2. Applies position name substitutions (case-insensitive, longest first)
 * 3. Applies department name substitutions (case-insensitive, longest first)
 */
export function tCareerDetail(text: string | null | undefined, vi: boolean): string {
  if (vi || !text) return text ?? ""
  let out = text

  // Escape special regex characters in Vietnamese strings
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Step 1: translate known career description phrases (ordered, longest first)
  for (const [vn, en] of CAREER_PHRASES_VI_TO_EN) {
    out = out.replace(new RegExp(esc(vn), "gi"), en)
  }

  // Step 2: translate embedded position names (case-insensitive, longest first)
  const posByLength = Object.entries(POS_VI_TO_EN).sort((a, b) => b[0].length - a[0].length)
  for (const [vn, en] of posByLength) {
    out = out.replace(new RegExp(esc(vn), "gi"), en)
  }

  // Step 3: translate embedded department names (case-insensitive, longest first)
  const deptByLength = Object.entries(DEPT_VI_TO_EN).sort((a, b) => b[0].length - a[0].length)
  for (const [vn, en] of deptByLength) {
    out = out.replace(new RegExp(esc(vn), "gi"), en)
  }

  return out
}
