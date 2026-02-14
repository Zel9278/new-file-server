import fs from "node:fs"
import path from "node:path"
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
  
  const counterPath = path.join(process.cwd(), ".counter.json")
  let counter: Record<string, number> = {}
  
  try {
    counter = JSON.parse(fs.readFileSync(counterPath, "utf-8"))
  } catch {
    fs.writeFileSync(counterPath, JSON.stringify({}, null, 4))
  }

  const filesDir = config.filesDir || path.join(process.cwd(), "files")
  const dirs = fs.readdirSync(filesDir)
  const files = dirs.filter((dir: string) => !["favicon.ico"].includes(dir))
  
  const images = await Promise.all(
    files.map(async (dir: string) => {
      const file = fs
        .readdirSync(`${filesDir}/${dir}`)
        .filter((file: string) => file !== "thumbnail.png")[0]
      
      if (!file) return null
      
      const fileStat = fs.statSync(`${filesDir}/${dir}/${file}`)
      const downloadCount = counter[dir] || 0
      const checksum = cacheCheckSum(`${filesDir}/${dir}/${file}`) || ""

      const info: FileInfo = {
        code: dir,
        url: `${config.public.url}/files/${dir}`,
        rawName: file,
        type: path.extname(`${filesDir}/${file}`).replace(".", ""),
        size: byteToData(fileStat.size),
        rawSize: fileStat.size,
        date: DateTime.fromJSDate(fileStat.mtime)
          .setLocale("en")
          .toFormat("yyyy-MM-dd HH:mm:ss"),
        unixDate: fileStat.mtime.getTime(),
        ago: DateTime.fromJSDate(fileStat.mtime).setLocale("en").toRelative(),
        downloadCount,
        checksum,
      }

      if (IMG_EXT.includes(path.extname(file))) {
        const imageSizeData = imageSize(
          fs.readFileSync(`${filesDir}/${dir}/${file}`),
        )

        info.width = imageSizeData.width
        info.height = imageSizeData.height
      }

      if (fs.existsSync(path.join(filesDir, dir, "thumbnail.png"))) {
        info.thumbnail = `${config.public.url}/api/v1/thumbnail/${dir}`
      }

      return info
    }),
  )

  setResponseHeaders(event, {
    "Content-Type": "application/json",
    "Cache-Control": "public, no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  })

  return images.filter(Boolean)
})
