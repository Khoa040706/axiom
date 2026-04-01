"use client"

import { useState, useEffect } from "react"

export type Breakpoint = "mobile" | "tablet" | "laptop" | "desktop"

interface BreakpointState {
  breakpoint: Breakpoint
  isMobile: boolean   // ≤ 640px
  isTablet: boolean   // 641–1024px
  isLaptop: boolean   // 1025–1280px
  isDesktop: boolean  // ≥ 1281px
  isMobileOrTablet: boolean
  isTabletOrBelow: boolean
}

function getBreakpoint(width: number): Breakpoint {
  if (width <= 640)  return "mobile"
  if (width <= 1024) return "tablet"
  if (width <= 1280) return "laptop"
  return "desktop"
}

function getState(bp: Breakpoint): BreakpointState {
  return {
    breakpoint: bp,
    isMobile:          bp === "mobile",
    isTablet:          bp === "tablet",
    isLaptop:          bp === "laptop",
    isDesktop:         bp === "desktop",
    isMobileOrTablet:  bp === "mobile" || bp === "tablet",
    isTabletOrBelow:   bp === "mobile" || bp === "tablet",
  }
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() =>
    // SSR-safe: default desktop — sẽ flash nhẹ trên mobile khi mount.
    // Chấp nhận vì layout.tsx đã xử lý transition mượt.
    getState("desktop")
  )

  useEffect(() => {
    function update() {
      setState(getState(getBreakpoint(window.innerWidth)))
    }
    update() // init sau khi mount
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return state
}
