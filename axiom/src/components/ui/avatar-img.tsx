/**
 * AvatarImg — Component hiển thị avatar an toàn
 * Hỗ trợ: local path, URL, base64 data URI
 * Tự fallback về ảnh mặc định khi lỗi tải
 * Dùng <img> thay <Image> của Next.js vì Next.js Image không hỗ trợ data URI
 */
"use client"

import { useState } from "react"

const DEFAULT_AVATAR = "/images/avatarmacdinh.jpg"

interface AvatarImgProps {
  src?: string | null
  alt: string
  size?: number
  style?: React.CSSProperties
  className?: string
}

export function AvatarImg({ src, alt, size = 36, style, className }: AvatarImgProps) {
  const [errored, setErrored] = useState(false)

  // Nếu src là null/undefined/rỗng hoặc đã lỗi → dùng ảnh mặc định
  const imgSrc = (!src || errored) ? DEFAULT_AVATAR : src

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{
        objectFit: "cover",
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
      className={className}
    />
  )
}
