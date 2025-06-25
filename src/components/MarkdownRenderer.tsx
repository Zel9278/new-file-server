"use client"

import "@/styles/markdown.css"
import type { Headings } from "@/utils/markdown"
import type { JSX } from "react"
import DOMPurify from "isomorphic-dompurify"
import parse from "html-react-parser"
import TocLink from "./TocLink"
import { ImageViewerProvider } from "@/contexts/ImageViewerContext"
import { ImageViewerHandler } from "@/components/ImageViewerHandler"
import "highlight.js/styles/github-dark.css"

type MarkdownRendererProps = {
  processedContent: string
  index: Headings
  indexNumbered: Headings
}

export default function MarkdownRenderer({ 
  processedContent, 
  index, 
  indexNumbered 
}: MarkdownRendererProps) {
  return (
    <div className="container mx-auto">
      <div className="drawer">
        <input
          id="table-of-contents"
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-content">
          <label
            htmlFor="table-of-contents"
            className="btn bg-base-200 fixed top-16 left-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Table of Contents</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <div className="blog-content">
            <ImageViewerProvider>
              {parse(DOMPurify.sanitize(processedContent))}
              <ImageViewerHandler />
            </ImageViewerProvider>
          </div>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="table-of-contents"
            aria-label="close sidebar"
            className="drawer-overlay"
          />
          <ul className="menu relative top-16 bg-base-200 text-base-content min-h-full p-4 shadow-lg">
            <h2 className="text-lg font-bold mb-4">目次</h2>
            {makeTocElement(index, indexNumbered)}
          </ul>
        </div>
      </div>
    </div>
  )
}

function makeTocElement(
  headings: Headings,
  headingNumbereds: string | Headings,
): JSX.Element {
  return (
    <ul>
      {headings.map((heading, index) => {
        const headingNumbered = headingNumbereds[index]

        if (typeof heading === "string") {
          const [text, num] = (headingNumbered as string).split(", ")

          const element = (
            <li key={`${headingNumbered}`}>
              <TocLink num={num} text={text} heading={heading} />
            </li>
          )
          return element
        }
        return (
          <li key={`${headingNumbered}`}>
            {makeTocElement(heading, headingNumbered)}
          </li>
        )
      })}
    </ul>
  )
}
