import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

export const metadata: Metadata = {
  title: {
    default: "AXIOM HRM",
    template: "%s | AXIOM HRM",
  },
  description:
    "Hệ thống Quản lý Nhân sự và Tiền lương Doanh nghiệp — chính xác tuyệt đối.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/images/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AXIOM HRM",
  },
}

export const viewport: Viewport = {
  themeColor: "#D0211C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[SW] Registered:', reg.scope) })
                    .catch(function(err) { console.log('[SW] Failed:', err) })
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
