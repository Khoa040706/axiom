/**
 * AXIOM HRM — Service Worker
 * Chiến lược: Network-first với cache fallback cho static assets.
 * Không cache API/Server Actions để đảm bảo dữ liệu luôn mới.
 */

const CACHE_NAME = "axiom-v2"

// Static assets cần cache (shell cơ bản — chỉ static files, không cache SSR pages)
const STATIC_ASSETS = [
  "/images/LogoAXIOM.png",
  "/images/avatarmacdinh.jpg",
  "/images/icon-192.png",
  "/images/icon-512.png",
]

// ── Install: cache shell cơ bản ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Bỏ qua lỗi nếu một số asset chưa có
        console.log("[SW] Some static assets not available yet")
      })
    })
  )
  // Kích hoạt ngay, không chờ tab cũ đóng
  self.skipWaiting()
})

// ── Activate: xóa cache cũ ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: Network-first cho navigation, cache-first cho static ──
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Bỏ qua: POST, Server Actions, API routes, NextAuth
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    request.headers.get("next-action")
  ) {
    return
  }

  // Static assets (fonts, images, CSS, JS bundles): cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Navigation (pages): network-first, fallback cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }
})
