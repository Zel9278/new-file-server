"use client"

import { useEffect } from "react"
import { useImageViewer } from "@/contexts/ImageViewerContext"

export function ImageViewerHandler() {
  const { openViewer } = useImageViewer()

  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLImageElement

      if (target.tagName === "IMG" && target.dataset.viewer === "true") {
        if (e.cancelable) {
          e.preventDefault()
        }

        openViewer({
          src: target.src,
          alt: target.alt,
          width: target.naturalWidth,
          height: target.naturalHeight,
        })
      }
    }

    document.addEventListener("click", handleImageClick, {
      capture: true,
      passive: false,
    })

    return () =>
      document.removeEventListener("click", handleImageClick, {
        capture: true,
      })
  }, [openViewer])

  return null
}
