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
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const delta = e.deltaY

      const scaleFactor = delta > 0 ? 0.9 : 1.1
      const newScale = Math.min(Math.max(scale * scaleFactor, 0.1), 4)

      setOffset((prev) => ({
        x: mouseX - (mouseX - prev.x) * (newScale / scale),
        y: mouseY - (mouseY - prev.y) * (newScale / scale),
      }))
      setScale(newScale)
    },
    [scale],
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      setIsDragging(true)
      const rect = e.currentTarget.getBoundingClientRect()
      setInitialPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setInitialOffset(offset)
    },
    [offset],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      setOffset({
        x: initialOffset.x + (mouseX - initialPos.x) / scale,
        y: initialOffset.y + (mouseY - initialPos.y) / scale,
      })
    },
    [isDragging, initialOffset, initialPos, scale],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setScale(1)
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
          transition: "transform 0.2s ease-out",
        }}
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
    </div>
  )
}

export default ImageViewer
