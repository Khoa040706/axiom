/**
 * AvatarImg — Component hiển thị avatar an toàn
 * Hỗ trợ: local path, URL, base64 data URI
 * Tự fallback về ảnh mặc định khi không có ảnh hoặc load lỗi
 */
"use client"

import { useState } from "react"

const DEFAULT_AVATAR = "/images/avatarmacdinh.jpg"

interface AvatarImgProps {
  src?: string | null
  name?: string
  alt?: string
  size?: number
  style?: React.CSSProperties
  className?: string
}

export function AvatarImg({ src, name, alt, size = 36, style, className }: AvatarImgProps) {
  const [errored, setErrored] = useState(false)

  // Use provided src if valid, otherwise fallback to default avatar image
  const imgSrc = (src && src.trim() !== "" && !errored) ? src : DEFAULT_AVATAR

  return (
    <div style={{
      width: size, height: size, minWidth: size, minHeight: size,
      borderRadius: "50%", overflow: "hidden",
      flexShrink: 0, display: "block",
      ...style,
    }} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt ?? name ?? "avatar"}
        onError={() => {
          if (!errored) setErrored(true)
        }}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          display: "block",
        }}
      />
    </div>
  )
}
