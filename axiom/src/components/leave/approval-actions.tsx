"use client"

import { Check, X } from "lucide-react"
import { useDashboard, getTheme } from "@/lib/dashboard-context"

interface ApprovalActionsProps {
  requestId: number
  status: "pending" | "approved" | "rejected"
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onView?: (id: number) => void
}

export function ApprovalActions({
  requestId, status, onApprove, onReject, onView,
}: ApprovalActionsProps) {
  const { dark, lang } = useDashboard()
  const th = getTheme(dark)
  const vi = lang === "vi"

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {status === "pending" && (
        <>
          <button
            title={vi ? "Duyệt" : "Approve"}
            onClick={() => onApprove?.(requestId)}
            style={{
              width: 30, height: 30, borderRadius: 6, border: "none",
              background: "#D1FAE5", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Check size={14} color="#065F46" />
          </button>
          <button
            title={vi ? "Từ chối" : "Reject"}
            onClick={() => onReject?.(requestId)}
            style={{
              width: 30, height: 30, borderRadius: 6, border: "none",
              background: "#FEE2E2", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} color="#DC2626" />
          </button>
        </>
      )}
      <button
        onClick={() => onView?.(requestId)}
        style={{
          fontSize: 12.5, color: "#3B82F6",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {vi ? "Chi tiết" : "Details"}
      </button>
    </div>
  )
}
