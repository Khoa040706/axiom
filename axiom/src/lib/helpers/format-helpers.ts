import { format, differenceInCalendarDays, addDays, isWeekend, parseISO } from "date-fns"

// ═══════════════════════════════════════════════════════════════
//  FORMAT HELPERS — Tập trung TẤT CẢ hàm format vào 1 file duy nhất
//  (Gộp từ: format.ts + date-helpers.ts để tránh trùng lặp)
// ═══════════════════════════════════════════════════════════════

// ── TIỀN TỆ ────────────────────────────────────────────────
/** Format số tiền VND ngắn gọn: "17.500.000 đ" */
export function formatVND(amount: number): string {
  const prefix = amount < 0 ? "-" : ""
  return prefix + Math.abs(amount).toLocaleString("vi-VN") + " đ"
}

/** Format số tiền VND đầy đủ (Intl): "17.500.000 ₫" */
export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

/** Format số triệu (785.6M VND) */
export function formatMillions(amount: number): string {
  return (amount / 1_000_000).toFixed(1) + "M"
}

// ── NGÀY THÁNG ─────────────────────────────────────────────
/** Chuyển string ISO hoặc Date sang Date an toàn */
export function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (typeof value === "string") return parseISO(value)
  return value
}

/** Format ngày dạng dd/MM/yyyy (dùng date-fns, chính xác) */
export function formatDateVN(date: Date | string | null | undefined): string {
  const d = toDate(date)
  if (!d) return "—"
  return format(d, "dd/MM/yyyy")
}

/** Format ngày dạng yyyy-MM-dd (cho input[type=date]) */
export function formatDateISO(date: Date | string | null | undefined): string {
  const d = toDate(date)
  if (!d) return ""
  return format(d, "yyyy-MM-dd")
}

/** Format ngày giờ dạng dd/MM/yyyy HH:mm */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Format giờ HH:mm từ Date */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

/** Label tháng/năm: "Tháng 3/2026" */
export function formatMonthYear(month: number, year: number): string {
  return `Tháng ${month}/${year}`
}

// ── TÍNH TOÁN NGÀY ─────────────────────────────────────────
/** Số ngày làm việc giữa 2 ngày (không tính cuối tuần) */
export function countWorkingDays(start: Date, end: Date): number {
  let count = 0
  let current = new Date(start)
  while (current <= end) {
    if (!isWeekend(current)) count++
    current = addDays(current, 1)
  }
  return count
}

/** Số ngày lịch từ start → end (bao gồm cả 2 đầu) */
export function countCalendarDays(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1
}

/** Kiểm tra hợp đồng sắp hết hạn trong N ngày */
export function isExpiringSoon(endDate: Date | string | null | undefined, withinDays = 30): boolean {
  const d = toDate(endDate)
  if (!d) return false
  const daysLeft = differenceInCalendarDays(d, new Date())
  return daysLeft >= 0 && daysLeft <= withinDays
}

/** Kiểm tra đã hết hạn */
export function isExpired(endDate: Date | string | null | undefined): boolean {
  const d = toDate(endDate)
  if (!d) return false
  return d < new Date()
}

/** Danh sách tháng gần đây (N tháng) */
export function getRecentMonths(count = 6): { month: number; year: number; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `T${d.getMonth() + 1}/${d.getFullYear()}`,
    })
  }
  return result
}
