"use client"

import { useState, useCallback, useEffect } from "react"
import type { ReactNode, MouseEvent, WheelEvent, TouchEvent } from "react"
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
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null,
  )

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVh()

    window.addEventListener("resize", setVh)

    return () => window.removeEventListener("resize", setVh)
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.currentTarget.addEventListener(
        "wheel",
        (e) => {
          if (e.cancelable) {
            e.preventDefault()
          }
        },
        { passive: false },
      )
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

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      const rect = e.currentTarget.getBoundingClientRect()
      setInitialPos({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      })
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      )
      setLastTouchDistance(distance)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()

      if (e.touches.length === 1 && isDragging) {
        const mouseX = e.touches[0].clientX - rect.left
        const mouseY = e.touches[0].clientY - rect.top

        const deltaX = mouseX - initialPos.x
        const deltaY = mouseY - initialPos.y

        setOffset((prevOffset) => ({
          x: prevOffset.x + deltaX,
          y: prevOffset.y + deltaY,
        }))
        setInitialPos({ x: mouseX, y: mouseY })
      } else if (e.touches.length === 2 && lastTouchDistance !== null) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]

        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top

        const newDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        )

        const scaleFactor = newDistance / lastTouchDistance
        const newScale = Math.min(Math.max(scale * scaleFactor, 0.05), 100)
        const newZoomPercentage = Math.round(newScale * 100)

        setOffset((prev) => ({
          x:
            centerX -
            rect.width / 2 -
            (centerX - rect.width / 2 - prev.x) * (newScale / scale),
          y:
            centerY -
            rect.height / 2 -
            (centerY - rect.height / 2 - prev.y) * (newScale / scale),
        }))

        setZoomPercentage(newZoomPercentage)
        setScale(newScale)
        setLastTouchDistance(newDistance)
      }
    },
    [isDragging, initialPos, lastTouchDistance, scale],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setLastTouchDistance(null)
  }, [])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        height: "calc(var(--vh, 1vh) * 100)",
        touchAction: "none",
        overscrollBehavior: "none",
        WebkitOverflowScrolling: "touch",
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          className="object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            imageRendering: "pixelated",
            width: width ? `${width}px` : "auto",
            height: height ? `${height}px` : "auto",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          src={src}
          alt={alt}
          width={width}
          height={height}
        />
      </div>
      <div className="absolute top-0 right-0 p-2 bg-black bg-opacity-50 text-white">
        {zoomPercentage}%
      </div>
    </div>
  )
}

export default ImageViewer
