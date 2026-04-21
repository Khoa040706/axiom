"use client"

import { useEffect } from "react"

/**
 * Tự động set lang="vi-VN" cho tất cả <input type="date">
 * để Chrome/Edge hiển thị dd/mm/yyyy bất kể OS locale.
 */
export function DateLocalePatcher() {
  useEffect(() => {
    function patch(el: Element) {
      if (el instanceof HTMLInputElement && el.type === "date" && el.lang !== "vi-VN") {
        el.lang = "vi-VN"
      }
    }

    // Patch existing
    document.querySelectorAll('input[type="date"]').forEach(patch)

    // Watch for new ones
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) {
            patch(n as Element)
            ;(n as Element).querySelectorAll?.('input[type="date"]').forEach(patch)
          }
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
