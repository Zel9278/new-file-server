import { promises as fs } from "node:fs"
import { createReadStream } from "node:fs"
import path from "node:path"
import { sendStream } from "h3"

async function updateCounter(code: string) {
  // Note: This file-based counter is not safe from race conditions.
  // For high-traffic applications, use a database for atomic updates.
  try {
    const counterPath = path.join(process.cwd(), ".counter.json")
    const data = await fs.readFile(counterPath, "utf-8")
    const counter = JSON.parse(data)
    counter[code] = (counter[code] || 0) + 1
    await fs.writeFile(counterPath, JSON.stringify(counter, null, 4))
  } catch (error) {
    // Log the error but don't let it block the file download.
    console.error("Failed to update download counter:", error)
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const code = getRouterParam(event, "code")

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code is required",
    })
  }

  const filesDir = config.filesDir || path.join(process.cwd(), "files")
  const fileDir = path.join(filesDir, code)

  try {
    // Asynchronously find the target file, ignoring the thumbnail.
    const allFiles = await fs.readdir(fileDir)
    const fileName = allFiles.find((file) => file !== "thumbnail.png")

    if (!fileName) {
      throw createError({
        statusCode: 404,
        statusMessage: "Downloadable file not found in directory",
      })
    }

    // Immediately start the counter update, but don't wait for it to finish.
    updateCounter(code)

    const filePath = path.join(fileDir, fileName)

    // Get file stats for size (for the Content-Length header).
    const stats = await fs.stat(filePath)

    setResponseHeaders(event, {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Length": stats.size.toString(),
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    })

    const nodeStream = createReadStream(filePath)
    return sendStream(event, nodeStream)
  } catch (error: unknown) {
    // This will catch errors like the directory not existing (from fs.readdir).
    console.error(error)
    
    // If it's already a H3Error, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 404,
      statusMessage: "File not found",
    })
  }
})
