"use client"

import { createContext, useContext, useState, type KeyboardEvent } from "react"
import ImageViewer from "@/components/ImageViewer"

type ImageViewerContextType = {
  openViewer: (props: {
    src: string
    alt: string
    width?: number
    height?: number
  }) => void
  closeViewer: () => void
}

const ImageViewerContext = createContext<ImageViewerContextType>({
  openViewer: () => {},
  closeViewer: () => {},
})

export const useImageViewer = () => useContext(ImageViewerContext)

export function ImageViewerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageProps, setImageProps] = useState<{
    src: string
    alt: string
    width?: number
    height?: number
  } | null>(null)

  const openViewer = (props: {
    src: string
    alt: string
    width?: number
    height?: number
  }) => {
    setImageProps(props)
    setIsOpen(true)
  }

  const closeViewer = () => {
    setIsOpen(false)
    setImageProps(null)
  }

  const handleClose = () => {
    closeViewer()
  }

  const handleKeyDown = (
    e: KeyboardEvent<HTMLDialogElement | HTMLDivElement | HTMLButtonElement>,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClose()
    }
  }

  return (
    <ImageViewerContext.Provider value={{ openViewer, closeViewer }}>
      {children}
      {isOpen && imageProps && (
        <dialog
          open
          className="fixed inset-0 z-50 bg-black/80 w-full h-full p-0 m-0"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
        >
          <div
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              onKeyDown={handleKeyDown}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="画像ビューアーを閉じる"
            >
              ✕
            </button>
            <ImageViewer
              src={imageProps.src}
              alt={imageProps.alt}
              width={imageProps.width}
              height={imageProps.height}
            />
          </div>
        </dialog>
      )}
    </ImageViewerContext.Provider>
  )
}
