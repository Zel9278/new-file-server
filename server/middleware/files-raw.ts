import fs from "node:fs"
import { createReadStream } from "node:fs"
import path from "node:path"
import { stat } from "node:fs/promises"
import mime from "mime"
import { sendStream } from "h3"

const STREAMABLE_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
])

interface RangeParams {
  start: number
  end: number
  fileSize: number
}

function parseRange(range: string, fileSize: number): RangeParams {
  const [rangeStart, rangeEnd] = range.replace(/bytes=/, "").split("-")
  let start = Number.parseInt(rangeStart ?? "", 10)
  let end = rangeEnd ? Number.parseInt(rangeEnd, 10) : fileSize - 1

  if (!Number.isNaN(start) && Number.isNaN(end)) {
    end = fileSize - 1
  }
  if (Number.isNaN(start) && !Number.isNaN(end)) {
    start = fileSize - end
    end = fileSize - 1
  }

  return { start, end, fileSize }
}

function isBrowserRequest(event: ReturnType<typeof useEvent>): boolean {
  const accept = getHeader(event, "accept") || ""
  // Browser requests typically include text/html in Accept header
  return accept.includes("text/html")
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Match /files/[code] or /[code] at root level (e.g., /xxxx.png)
  // Exclude known routes: /api, /pages, /info, /api-doc, /_nuxt, etc.
  const excludedPaths = /^\/(api|pages|info|api-doc|_nuxt|__nuxt|favicon\.ico|robots\.txt|sitemap\.xml)/
  
  let code: string | undefined
  
  // Try /files/[code] pattern first
  const filesMatch = pathname.match(/^\/files\/([^/]+)$/)
  if (filesMatch) {
    code = filesMatch[1]
  } else {
    // Try /[code] at root level
    const rootFileMatch = pathname.match(/^\/([^/]+\.[a-zA-Z0-9]+)$/)
    if (rootFileMatch && !excludedPaths.test(pathname)) {
      code = rootFileMatch[1]
    }
  }
  
  if (!code) {
    return // Continue to next handler
  }

  // If browser request, let Nuxt handle rendering the page
  if (isBrowserRequest(event)) {
    return // Continue to Nuxt page rendering
  }

  // Non-browser request: serve raw file directly
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code is required",
    })
  }

  const config = useRuntimeConfig()

  try {
    const filesDir = config.filesDir || path.join(process.cwd(), "files")
    const codeDir = path.join(filesDir, code)

    if (!fs.existsSync(codeDir)) {
      throw createError({
        statusCode: 404,
        statusMessage: "File not found",
      })
    }

    const fileDir = fs
      .readdirSync(codeDir)
      .filter((file: string) => file !== "thumbnail.png")[0]

    if (!fileDir) {
      throw createError({
        statusCode: 404,
        statusMessage: "File not found",
      })
    }

    const filePath = path.join(codeDir, fileDir)
    const fileType =
      mime.getType(path.extname(fileDir)) || "application/octet-stream"
    const fileSize = (await stat(filePath)).size

    // Handle range requests for media files
    const range = getHeader(event, "range")

    if (range && STREAMABLE_TYPES.has(fileType)) {
      const rangeParams = parseRange(range, fileSize)
      const { start, end } = rangeParams

      if (start >= fileSize || end >= fileSize) {
        setResponseStatus(event, 416)
        setResponseHeader(event, "Content-Range", `bytes */${fileSize}`)
        return null
      }

      const chunksize = end - start + 1
      const readable = createReadStream(filePath, { start, end })

      setResponseStatus(event, 206)
      setResponseHeaders(event, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": fileType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      })

      return sendStream(event, readable)
    }

    const fileStream = createReadStream(filePath)

    setResponseHeaders(event, {
      "Content-Type": fileType,
      "Content-Length": fileSize.toString(),
      "Accept-Ranges": "bytes",
      "Content-Disposition": "inline",
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    })

    return sendStream(event, fileStream)
  } catch (error: unknown) {
    console.error("Error serving file:", error)

    // If it's already a H3Error, rethrow it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    })
  }
})
