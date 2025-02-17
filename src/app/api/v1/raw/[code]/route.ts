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
  try {
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
        const start: number = Number(rangeStart)
        let end: number = rangeEnd ? Number(rangeEnd) : fileSize - 1

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

        fileStream.on("error", (error) => {
          console.error("Stream error:", error)
          return new Response("Internal Server Error", { status: 500 })
        })

        const readable: ReadableStream = Readable.toWeb(
          fileStream,
        ) as ReadableStream

        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
          fileStream.destroy()
        }, 30000)

        const headers = {
          "Content-Disposition": "inline",
          "Cache-Control": "public, no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Content-Length": chunksize.toString(),
          "Content-Type": fileType,
          Connection: "keep-alive",
        }

        clearTimeout(timeoutId)
        return new Response(readable, {
          headers,
          status: 206,
        })
      }
    }

    const fileStream = fs.createReadStream(filePath)

    fileStream.on("error", (error) => {
      console.error("Stream error:", error)
      return new Response("Internal Server Error", { status: 500 })
    })

    const headers = {
      "Content-Type": fileType || "application/octet-stream",
      "Content-Disposition": "inline",
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Length": fileSize.toString(),
    }

    const readable: ReadableStream = Readable.toWeb(
      fileStream,
    ) as ReadableStream

    return new Response(readable, {
      headers,
    })
  } catch (error) {
    console.error(error)
    return new Response("Internal server error", { status: 500 })
  }
}
