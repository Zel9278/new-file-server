"use client"

import { useState, useCallback } from "react"
import type { ReactNode, MouseEvent, WheelEvent } from "react"
import Image from "next/image"

type Props = {
  children?: ReactNode
  className?: string
  src: string
  alt: string
  width: number | undefined
  height: number | undefined
}

const ImageViewer = ({ className, src, alt, width, height }: Props) => {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 })
  const [zoomPercentage, setZoomPercentage] = useState(100)

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const delta = e.deltaY

      const scaleFactor = delta > 0 ? 0.9 : 1.1
      const newScale = Math.min(Math.max(scale * scaleFactor, 0.05), 100)

      const newZoomPercentage = Math.round(newScale * 100)
      setZoomPercentage(newZoomPercentage)

      setOffset((prev) => ({
        x:
          mouseX -
          rect.width / 2 -
          (mouseX - rect.width / 2 - prev.x) * (newScale / scale),
        y:
          mouseY -
          rect.height / 2 -
          (mouseY - rect.height / 2 - prev.y) * (newScale / scale),
      }))
      setScale(newScale)
    },
    [scale],
  )

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setInitialPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const deltaX = mouseX - initialPos.x
      const deltaY = mouseY - initialPos.y

      if (
        mouseX < 0 ||
        mouseX > rect.width ||
        mouseY < 0 ||
        mouseY > rect.height
      ) {
        setIsDragging(false)
        return
      }

      setOffset((prevOffset) => ({
        x: prevOffset.x + deltaX,
        y: prevOffset.y + deltaY,
      }))
      setInitialPos({ x: mouseX, y: mouseY })
    },
    [isDragging, initialPos],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setScale(1)
    setZoomPercentage(100)
    setOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <Image
        className="w-full h-full object-contain"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
      <div className="absolute top-0 right-0 p-2 bg-black bg-opacity-50 text-white">
        {zoomPercentage}%
      </div>
    </div>
  )
}

export default ImageViewer
