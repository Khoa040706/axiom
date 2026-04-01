/**
 * serialize.ts — Chuyển đổi dữ liệu từ Prisma thành plain objects
 * an toàn để truyền từ Server Component / Server Action → Client Component.
 *
 * Prisma trả về:
 *   - Decimal objects (từ cột Decimal/Numeric) → toJSON() trả về string
 *   - Date objects (từ cột DateTime/Date/Time) → toJSON() trả về ISO string
 *
 * Cách tiếp cận: JSON roundtrip (JSON.parse(JSON.stringify(...)))
 * + custom replacer để convert Decimal → number thay vì string.
 *
 * Phương pháp này đảm bảo 100% output là plain JSON-serializable objects,
 * không còn class instances, prototype chains, hay non-serializable values.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Deep-serialize dữ liệu Prisma thành plain JSON-safe objects.
 * - Decimal → number
 * - Date → ISO string
 * - BigInt → number
 * - Mọi object → plain object (no class instances)
 */
export function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data

  // JSON.stringify sử dụng .toJSON() method nếu có:
  // - Date.toJSON() → ISO string ✓
  // - Prisma Decimal.toJSON() → string number ✓
  // Sau đó JSON.parse convert string → primitive types
  //
  // Tuy nhiên Decimal.toJSON() trả về string ("12345.67") thay vì number.
  // Dùng custom replacer để convert Decimal → number trực tiếp.
  const json = JSON.stringify(data, (_key, value) => {
    // Handle BigInt
    if (typeof value === "bigint") return Number(value)

    // Handle Prisma Decimal — có toNumber() method
    if (
      value !== null &&
      typeof value === "object" &&
      typeof value.toNumber === "function" &&
      !(value instanceof Date)
    ) {
      return value.toNumber()
    }

    return value
  })

  return JSON.parse(json)
}
