import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { DateTime } from "luxon"
import { imageSize } from "image-size"

// Type definitions
interface FileInfo {
  code: string
  url: string
  rawName: string
  type: string
  size: string
  rawSize: number
  date: string
  unixDate: number
  ago: string | null
  downloadCount: number
  checksum: string
  width?: number
  height?: number
  thumbnail?: string
}

const IMG_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]

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
      statusMessage: "File Not found",
    })
  }

  const counterPath = path.join(process.cwd(), ".counter.json")
  let counter: Record<string, number> = {}
  
  try {
    counter = JSON.parse(fs.readFileSync(counterPath, "utf-8"))
  } catch {
    fs.writeFileSync(counterPath, JSON.stringify({}, null, 4))
  }

  const fileDir = fs
    .readdirSync(`${filesDir}/${code}`)
    .filter((file: string) => file !== "thumbnail.png")[0]
  
  if (!fileDir) {
    throw createError({
      statusCode: 404,
      statusMessage: "File Not found",
    })
  }
  
  const fileStat = fs.statSync(`${filesDir}/${code}/${fileDir}`)

  const checksum = crypto.createHash("md5")
  checksum.update(fs.readFileSync(`${filesDir}/${code}/${fileDir}`))

  const info: FileInfo = {
    code,
    url: `${config.public.url}/files/${code}`,
    rawName: fileDir,
    type: path.extname(`${filesDir}/${code}`).replace(".", ""),
    size: byteToData(fileStat.size),
    rawSize: fileStat.size,
    date: DateTime.fromJSDate(fileStat.mtime)
      .setLocale("en")
      .toFormat("yyyy-MM-dd HH:mm:ss"),
    unixDate: fileStat.mtime.getTime(),
    ago: DateTime.fromJSDate(fileStat.mtime).setLocale("en").toRelative(),
    downloadCount: counter[code] || 0,
    checksum: checksum.digest("hex"),
  }

  if (IMG_EXT.includes(path.extname(fileDir))) {
    const imageSizeData = imageSize(
      fs.readFileSync(`${filesDir}/${code}/${fileDir}`),
    )

    info.width = imageSizeData.width
    info.height = imageSizeData.height
  }

  if (fs.existsSync(path.join(filesDir, code, "thumbnail.png"))) {
    info.thumbnail = `${config.public.url}/api/v1/thumbnail/${code}`
  }

  setResponseHeaders(event, {
    "Content-Type": "application/json",
    "Cache-Control": "public, no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  })

  return info
})
