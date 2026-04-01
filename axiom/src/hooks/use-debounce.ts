import { useState, useEffect, useRef } from "react"

/**
 * Trì hoãn cập nhật value sau một khoảng thời gian (ms)
 * Dùng cho search input để không query liên tục
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
