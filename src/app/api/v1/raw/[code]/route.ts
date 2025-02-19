import fs from "node:fs"
import path from "node:path"
import type { NextRequest } from "next/server"
import mime from "mime"
import { Readable } from "node:stream"
import { stat } from "node:fs/promises"

const STREAMABLE_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
])

type Props = {
  params: Promise<{
    code: string
  }>
}

interface RangeParams {
  start: number
  end: number
  fileSize: number
}

function parseRange(range: string, fileSize: number): RangeParams {
  const [rangeStart, rangeEnd] = range.replace(/bytes=/, "").split("-")
  let start = parseInt(rangeStart, 10)
  let end = rangeEnd ? parseInt(rangeEnd, 10) : fileSize - 1

  if (!isNaN(start) && isNaN(end)) {
    end = fileSize - 1
  }
  if (isNaN(start) && !isNaN(end)) {
    start = fileSize - end
    end = fileSize - 1
  }

  return { start, end, fileSize }
}

async function createStreamResponse(
  filePath: string,
  fileType: string,
  range: RangeParams,
): Promise<Response> {
  const { start, end, fileSize } = range

  if (start >= fileSize || end >= fileSize) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${fileSize}` },
    })
  }

  const chunksize = end - start + 1
  const readable = fs.createReadStream(filePath, { start, end })
  const readableStream = Readable.toWeb(readable) as ReadableStream

  return new Response(readableStream, {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize.toString(),
      "Content-Type": fileType,
    },
  })
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const code = (await params).code

    const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
    const codeDir = path.join(filesDir, code)

    if (!fs.existsSync(codeDir)) {
      return new Response("File not found", { status: 404 })
    }

    const fileDir = fs
      .readdirSync(codeDir)
      .filter((file) => file !== "thumbnail.png")[0]
    const filePath = path.join(codeDir, fileDir)
    const fileType =
      mime.getType(path.extname(fileDir)) || "application/octet-stream"
    const fileSize = (await stat(filePath)).size

    if (STREAMABLE_TYPES.has(fileType)) {
      const range = request.headers.get("range")
      if (range) {
        const rangeParams = parseRange(range, fileSize)
        return createStreamResponse(filePath, fileType, rangeParams)
      }
    }

    const fileStream = fs.createReadStream(filePath)
    const readable = Readable.toWeb(fileStream) as ReadableStream

    return new Response(readable, {
      headers: {
        "Content-Type": fileType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
