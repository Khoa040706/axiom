"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useDashboard } from "@/lib/dashboard-context"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Max width của modal content, default 760px */
  maxWidth?: number
}

export function Modal({ open, onClose, title, subtitle, children, maxWidth = 880 }: ModalProps) {
  const { dark } = useDashboard()

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Khóa scroll body khi modal mở
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    // Overlay
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        animation: "fadeIn .15s ease",
      }}
    >
      {/* Modal container */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth,
          background: dark ? "#1e293b" : "#ffffff",
          borderRadius: 18,
          border: `1px solid ${dark ? "#334155" : "#E5E7EB"}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.40)",
          animation: "slideUp .2s cubic-bezier(.22,1,.36,1)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          /* overflow: visible ở container để dropdown không bị clip */
          overflow: "visible",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #D0211C, #991414)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
          borderRadius: "18px 18px 0 0",
        }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-.01em" }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12.5, marginTop: 3 }}>
                {subtitle}
              </div>
            )}
          </div>
          {/* X button */}
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.30)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable với custom scrollbar mỏng + overflow visible để dropdown không bị clip */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            overflowX: "visible",
            flex: 1,
            borderRadius: "0 0 18px 18px",
            /* Cho phép dropdown (position:absolute) tràn ra ngoài body */
            isolation: "auto",
          }}
          className="modal-body"
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(.97) } to { opacity: 1; transform: none } }

        /* Custom scrollbar mỏng — dark & light */
        .modal-body::-webkit-scrollbar { width: 5px; }
        .modal-body::-webkit-scrollbar-track { background: transparent; }
        .modal-body::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.35);
          border-radius: 99px;
        }
        .modal-body::-webkit-scrollbar-thumb:hover {
          background: rgba(148,163,184,0.6);
        }
        /* Firefox */
        .modal-body { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.35) transparent; }
      `}</style>
    </div>
  )
}
