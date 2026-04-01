import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

export const metadata: Metadata = {
  title: {
    default: "AXIOM HRM",
    template: "%s | AXIOM HRM",
  },
  description:
    "Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp — chính xác tuyệt đối.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
