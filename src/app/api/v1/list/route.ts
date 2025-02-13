import fs from "node:fs"
import path from "node:path"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"
import imageSize from "image-size"
import type { FileInfo } from "@/types/fileserver"
import crypto from "node:crypto"

const IMG_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]

export async function GET() {
  const counterPath = path.join(process.cwd(), "src/.counter.json")
  const counter = JSON.parse(fs.readFileSync(counterPath, "utf-8"))

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
  const dirs = fs.readdirSync(filesDir)
  const files = dirs.filter((dir) => !["favicon.ico"].includes(dir))
  const images = files.map((dir) => {
    const file = fs
      .readdirSync(`${filesDir}/${dir}`)
      .filter((file) => file !== "thumbnail.png")[0]
    const fileStat = fs.statSync(`${filesDir}/${dir}/${file}`)
    const downloadCount = counter[dir] || 0

    const checksum = crypto.createHash("md5")
    checksum.update(fs.readFileSync(`${filesDir}/${dir}/${file}`))

    const info: FileInfo = {
      code: dir,
      url: `${process.env.URL}/files/${dir}`,
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
      checksum: checksum.digest("hex"),
    }

    if (IMG_EXT.includes(path.extname(file))) {
      const imageSizeData = imageSize(path.join(filesDir, dir, file))

      info.width = imageSizeData.width
      info.height = imageSizeData.height
    }

    if (fs.existsSync(path.join(filesDir, dir, "thumbnail.png"))) {
      info.thumbnail = `${process.env.URL}/api/v1/thumbnail/${dir}`
    }

    return info
  })

  return Response.json(images, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
