"use client"

import { useRef } from "react"
import { useDashboard } from "@/lib/dashboard-context"

/**
 * DateInput — hiển thị dd/mm/yyyy bất kể OS locale.
 *
 * Dùng <input type="date"> ẩn text gốc (color transparent),
 * overlay <span> hiển thị dd/mm/yyyy lên trên.
 * Click vào vẫn mở native date picker.
 *
 * Value luôn là ISO yyyy-mm-dd (chuẩn HTML).
 *
 * Màu overlay khớp chính xác với globals.css ::placeholder rules:
 *   Dark  placeholder : rgba(203,213,225,0.45)  (class "dark" trên layout wrapper)
 *   Light placeholder : #9CA3AF
 *   Dark  text        : #cbd5e1  (slate-300, rõ ràng trên nền #162032)
 *   Light text        : #111827
 */

function getLeftPad(style?: React.CSSProperties): number {
  if (!style) return 12
  if (style.paddingLeft != null)
    return typeof style.paddingLeft === "number"
      ? style.paddingLeft
      : parseInt(String(style.paddingLeft), 10) || 12
  if (style.padding != null) {
    const p = String(style.padding).trim().split(/\s+/)
    if (p.length === 1) return parseInt(p[0], 10) || 12
    if (p.length === 2 || p.length === 3) return parseInt(p[1], 10) || 12
    if (p.length >= 4) return parseInt(p[3], 10) || 12
  }
  return 12
}

export function DateInput({
  value,
  onChange,
  style,
  min,
  max,
  disabled,
  className,
  onFocus,
  onBlur,
  textColor,
  placeholderColor,
  ...rest
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  style?: React.CSSProperties
  min?: string
  max?: string
  disabled?: boolean
  className?: string
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  /** Override màu chữ khi đã có ngày */
  textColor?: string
  /** Override màu placeholder dd/mm/yyyy */
  placeholderColor?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">) {
  const ref = useRef<HTMLInputElement>(null)
  const { dark } = useDashboard()

  // Khớp chính xác màu native ::placeholder của browser
  // Browser tính placeholder ~ 42% opacity của input color (#f8fafc) trên nền #162032 ≈ #94a3b8
  const autoPlaceholderColor = dark
    ? "#94a3b8"   // ← solid color, giống hệt email@axiom.vn, 0900 000 000
    : "#9CA3AF"

  // Chữ ngày đã chọn cần tương phản cao hơn placeholder
  const autoTextColor = dark ? "#cbd5e1" : "#111827"

  function fmt(iso: string) {
    if (!iso) return ""
    const [y, m, d] = iso.split("-")
    if (!y || !m || !d) return iso
    return `${d}/${m}/${y}`
  }

  const leftPad = getLeftPad(style)
  const resolvedTextColor        = disabled ? "#888" : (textColor ?? autoTextColor)
  const resolvedPlaceholderColor = placeholderColor ?? autoPlaceholderColor

  return (
    <div
      style={{ position: "relative", display: "inline-block", width: style?.width ?? "100%" }}
      onClick={() => ref.current?.showPicker?.()}
    >
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        className={className}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
        style={{
          ...style,
          color: "transparent",
          caretColor: "transparent",
          colorScheme: "light",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
      {/* Overlay dd/mm/yyyy — màu đồng nhất với các placeholder input khác */}
      <span
        style={{
          position: "absolute",
          left: leftPad,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          fontSize: style?.fontSize ?? 13,
          fontFamily: style?.fontFamily ?? "inherit",
          color: value ? resolvedTextColor : resolvedPlaceholderColor,
          whiteSpace: "nowrap",
        }}
      >
        {value ? fmt(value) : "dd/mm/yyyy"}
      </span>
    </div>
  )
}
