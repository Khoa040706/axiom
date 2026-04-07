/**
 * search.ts — Tiện ích tìm kiếm tiếng Việt cho AXIOM HRM
 *
 * Hỗ trợ:
 * - Chuẩn hóa dấu tiếng Việt: "Hoa" khớp "Hoàng", "Hoá", "Hóa"...
 * - Gõ không dấu: "hoang" khớp "Hoàng"
 * - Không phân biệt chữ hoa/thường
 * - Tìm đồng thời trên nhiều trường (name, code, dept, ...)
 */

/**
 * Chuẩn hóa chuỗi tiếng Việt:
 * - Bỏ tất cả dấu (Hoàng → Hoang, Thị → Thi)
 * - Chuyển "đ/Đ" → "d/D"
 * - Lowercase
 */
export function normalizeVN(str: string): string {
  if (!str) return ""
  return str
    .normalize("NFD")                         // Tách dấu ra khỏi ký tự gốc
    .replace(/[\u0300-\u036f]/g, "")          // Xóa các combining diacritics
    .replace(/đ/g, "d").replace(/Đ/g, "D")    // Xử lý đ/Đ riêng (không nằm trong NFD)
    .toLowerCase()
    .trim()
}

/**
 * Kiểm tra xem `text` có chứa `query` không (hỗ trợ tiếng Việt có và không dấu)
 * - Nếu query rỗng → luôn true (hiện tất cả)
 * - So sánh dạng normalized
 */
export function matchSearch(text: string, query: string): boolean {
  if (!query || !query.trim()) return true
  const nText  = normalizeVN(text)
  const nQuery = normalizeVN(query)
  return nText.includes(nQuery)
}

/**
 * Kiểm tra xem bất kỳ field nào trong danh sách có khớp query không
 * Dùng khi muốn search trên nhiều trường cùng lúc
 *
 * @example
 * matchAny(["Hoàng Thái Đăng Khoa", "NV009", "CNTT"], "kho") → true
 */
export function matchAny(fields: (string | null | undefined)[], query: string): boolean {
  if (!query || !query.trim()) return true
  const nQuery = normalizeVN(query)
  return fields.some(f => f ? normalizeVN(f).includes(nQuery) : false)
}
