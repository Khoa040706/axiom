"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type DashLang = "vi" | "en"

export interface DashTheme {
  pageBg: string; cardBg: string; cardBorder: string
  tableHead: string; tableHeadText: string
  tableBorder: string; text1: string; text2: string; text3: string
  inputBg: string; inputBorder: string; rowHover: string
  statCardBg: string; statCardBorder: string
}

export function getTheme(dark: boolean): DashTheme {
  return dark
    ? {
        pageBg: "#0f172a", cardBg: "#1e293b", cardBorder: "#334155",
        tableHead: "#1a2640", tableHeadText: "#94a3b8",
        tableBorder: "#2d3f5e", text1: "#f8fafc", text2: "#cbd5e1", text3: "#64748b",
        inputBg: "#162032", inputBorder: "#3b5279", rowHover: "#1e3a5f",
        statCardBg: "#1e293b", statCardBorder: "#334155",
      }
    : {
        pageBg: "#FEF2F2", cardBg: "#ffffff", cardBorder: "#E5E7EB",
        tableHead: "#F9FAFB", tableHeadText: "#4B5563",
        tableBorder: "#E5E7EB", text1: "#0f172a", text2: "#4B5563", text3: "#6B7280",
        inputBg: "#ffffff", inputBorder: "#D1D5DB", rowHover: "#FEF2F2",
        statCardBg: "#ffffff", statCardBorder: "#E5E7EB",
      }
}

interface DashboardCtx {
  dark: boolean; toggleDark: () => void
  lang: DashLang; toggleLang: () => void
}
const DashCtx = createContext<DashboardCtx>({
  dark: false, toggleDark: () => {},
  lang: "vi", toggleLang: () => {},
})

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(false)
  const [lang, setLang] = useState<DashLang>("vi")

  // Sync từ localStorage sau khi mount để tránh hydration mismatch
  useEffect(() => {
    const storedDark = localStorage.getItem("axiom_dark")
    const storedLang = localStorage.getItem("axiom_lang") as DashLang | null
    if (storedDark === "1") setDark(true)
    if (storedLang === "en") setLang("en")
  }, [])

  function toggleDark() {
    setDark(v => {
      const next = !v
      localStorage.setItem("axiom_dark", next ? "1" : "0")
      return next
    })
  }

  function toggleLang() {
    setLang(v => {
      const next = v === "vi" ? "en" : "vi"
      localStorage.setItem("axiom_lang", next)
      return next
    })
  }

  return (
    <DashCtx.Provider value={{ dark, toggleDark, lang, toggleLang }}>
      {children}
    </DashCtx.Provider>
  )
}

export function useDashboard() { return useContext(DashCtx) }
