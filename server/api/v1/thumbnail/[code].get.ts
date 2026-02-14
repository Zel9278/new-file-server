import fs from "node:fs"
import path from "node:path"
import mime from "mime"

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

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    throw createError({
      statusCode: 404,
      statusMessage: "File not found",
    })
  }

  const thumbnailPath = `${filesDir}/${code}/thumbnail.png`
  
  // If thumbnail doesn't exist, return 204 No Content (so browser won't show error)
  if (!fs.existsSync(thumbnailPath)) {
    setResponseStatus(event, 204)
    return null
  }

  const file = fs.readFileSync(thumbnailPath)

  setResponseHeaders(event, {
    "Content-Type": "image/png",
    "Content-Disposition": "inline",
    "Cache-Control": "public, max-age=86400",
  })

  return file
})
