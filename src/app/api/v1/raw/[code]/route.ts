import fs from "node:fs"
import path from "node:path"
import type { NextRequest } from "next/server"
import mime from "mime"
import { Readable } from "node:stream"

type Props = {
  params: Promise<{
    code: string
  }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const code = (await params).code

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File not found", { status: 404 })
  }

  const fileDir = fs
    .readdirSync(`${filesDir}/${code}`)
    .filter((file) => file !== "thumbnail.png")[0]
  const filePath = `${filesDir}/${code}/${fileDir}`
  const fileType = mime.getType(path.extname(fileDir).replace(".", ""))
  const fileSize = (await fs.promises.stat(filePath)).size

  if (
    fileType === "video/mp4" ||
    fileType === "video/webm" ||
    fileType === "audio/mp3" ||
    fileType === "audio/mpeg" ||
    fileType === "audio/ogg" ||
    fileType === "audio/wav" ||
    fileType === "audio/webm"
  ) {
    const range = request.headers.get("range")

    if (range) {
      const rangePattern = /^bytes=\d*-\d*$/
      if (!rangePattern.test(range)) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        })
      }
      const [rangeStart, rangeEnd] = range.replace(/bytes=/, "").split("-")
      const start: number = Number.parseInt(rangeStart, 10)
      let end: number = rangeEnd ? Number.parseInt(rangeEnd, 10) : fileSize - 1

      if (start < 0 || start >= fileSize) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        })
      }
      if (end >= fileSize || end < start) {
        end = fileSize - 1
      }
      const chunksize = end - start + 1

      const fileStream = fs.createReadStream(filePath, {
        start,
        end,
      })

      const readable: ReadableStream = Readable.toWeb(
        fileStream,
      ) as ReadableStream

      const headers = {
        "Content-Disposition": "inline",
        "Cache-Control": "public, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunksize.toString(),
        "Content-Type": fileType,
      }

      return new Response(readable, {
        headers,
        status: 206,
      })
    }
  }

  const fileStream = fs.createReadStream(filePath, {
    highWaterMark: 1024 * 16,
  })

  const headers = {
    "Content-Type": fileType || "application/octet-stream",
    "Content-Disposition": "inline",
    "Cache-Control": "public, no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Length": fileSize.toString(),
  }

  const readable: ReadableStream = Readable.toWeb(fileStream) as ReadableStream

  return new Response(readable, {
    headers,
  })
}
