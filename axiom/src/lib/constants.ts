// ── INSURANCE RATES (Tỷ lệ bảo hiểm NV đóng) ──────────────────
export const BHXH_RATE = 0.08   // 8%
export const BHYT_RATE = 0.015  // 1.5%
export const BHTN_RATE = 0.01   // 1%

// ── PERSONAL DEDUCTION (Giảm trừ gia cảnh — Nghị quyết 954/2020) ──────────
export const PERSONAL_DEDUCTION = 11_000_000     // 11 triệu/tháng (bản thân NLĐ)
export const DEPENDENT_DEDUCTION = 4_400_000     // 4,4 triệu/người phụ thuộc/tháng

// ── INCOME TAX BRACKETS (Biểu lũy tiến 7 bậc — Luật Thuế TNCN VN) ───────
// Dành cho thu nhập từ tiền lương, tiền công (Điều 22, Luật Thuế TNCN)
export const TAX_BRACKETS = [
  { max: 5_000_000,         rate: 0.05 },   // Bậc 1: ≤ 5 triệu    → 5%
  { max: 10_000_000,        rate: 0.10 },   // Bậc 2: 5–10 triệu   → 10%
  { max: 18_000_000,        rate: 0.15 },   // Bậc 3: 10–18 triệu  → 15%
  { max: 32_000_000,        rate: 0.20 },   // Bậc 4: 18–32 triệu  → 20%
  { max: 52_000_000,        rate: 0.25 },   // Bậc 5: 32–52 triệu  → 25%
  { max: 80_000_000,        rate: 0.30 },   // Bậc 6: 52–80 triệu  → 30%
  { max: Infinity,          rate: 0.35 },   // Bậc 7: > 80 triệu   → 35%
] as const

// ── LEAVE DEFAULTS ─────────────────────────────────────────────
export const DEFAULT_ANNUAL_LEAVE_DAYS = 12

// ── OT RATE ───────────────────────────────────────────────────
export const OT_RATE_WEEKDAY = 1.5    // 150% ngày thường
export const OT_RATE_WEEKEND = 2.0    // 200% cuối tuần
export const OT_RATE_HOLIDAY = 3.0    // 300% ngày lễ

// ── ROLES ─────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:       "Admin",
  HR_MANAGER:  "HRManager",
  ACCOUNTANT:  "Accountant",
  DIRECTOR:    "Director",
  MANAGER:     "Manager",
  EMPLOYEE:    "Employee",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// ── CONTRACT TYPES ────────────────────────────────────────────
export const CONTRACT_TYPES = ["Thử việc", "Chính thức", "Thời vụ"] as const

// ── EMPLOYEE STATUS ───────────────────────────────────────────
export const EMPLOYEE_STATUS = ["Đang làm", "Thử việc", "Nghỉ việc"] as const

// ── LEAVE TYPES ───────────────────────────────────────────────
export const LEAVE_TYPES = ["Nghỉ năm", "Nghỉ ốm", "Việc riêng", "Khác"] as const

// ── CAREER EVENT TYPES (Quá trình công tác) ──────────────────
export const CAREER_EVENT_TYPES = [
  "Bổ nhiệm", "Miễn nhiệm", "Thăng chức", "Giáng chức",
  "Điều chuyển", "Điều chỉnh lương", "Khen thưởng", "Kỷ luật", "Khác",
] as const

export type CareerEventType = (typeof CAREER_EVENT_TYPES)[number]

/** Phân nhóm sự kiện theo category — dùng cho tab filter */
export const CAREER_EVENT_CATEGORIES = {
  position: { label: "Chức vụ",       labelEn: "Position",   types: ["Bổ nhiệm", "Miễn nhiệm", "Thăng chức", "Giáng chức"] },
  transfer: { label: "Luân chuyển",   labelEn: "Transfer",   types: ["Điều chuyển"] },
  salary:   { label: "Lương",         labelEn: "Salary",     types: ["Điều chỉnh lương"] },
  reward:   { label: "Khen thưởng",   labelEn: "Reward",     types: ["Khen thưởng"] },
  penalty:  { label: "Kỷ luật",       labelEn: "Discipline", types: ["Kỷ luật"] },
  other:    { label: "Khác",          labelEn: "Other",      types: ["Khác"] },
} as const

export const REWARD_TYPES = ["Bằng khen", "Giấy khen", "Tiền thưởng", "Thưởng dự án", "Khác"] as const
export const PENALTY_TYPES = ["Khiển trách", "Cảnh cáo", "Hạ bậc lương", "Chuyển công tác", "Sa thải", "Khác"] as const
