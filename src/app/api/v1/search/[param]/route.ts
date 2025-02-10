import fs from "node:fs"
import path from "node:path"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"
import type { NextRequest } from "next/server"
import type { FileInfo, FileInfoWithSearch } from "@/types/fileserver"
import imageSize from "image-size"

type Props = {
  params: Promise<{
    param: string
  }>
}

const IMG_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]

export async function GET(request: NextRequest, { params }: Props) {
  const param = (await params).param

  const counterPath = path.join(process.cwd(), "src/.counter.json")
  const counter = JSON.parse(fs.readFileSync(counterPath, "utf-8"))

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
  const dirs = fs.readdirSync(filesDir)
  const files = dirs.filter((dir) => !["favicon.ico"].includes(dir))
  const images: FileInfo[] = files.map((dir) => {
    const file = fs
      .readdirSync(`${filesDir}/${dir}`)
      .filter((file) => file !== "thumbnail.png")[0]
    const fileStat = fs.statSync(`${filesDir}/${dir}/${file}`)
    const downloadCount = counter[dir] || 0

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

  const imagesFiltered: FileInfoWithSearch[] = []

  for (const image of images) {
    const isCode = image.code.includes(param)
    const isRawName = image.rawName.includes(param)

    if (isCode || isRawName) {
      imagesFiltered.push({ ...image, isCode, isRawName })
    }
  }

  if (!imagesFiltered.length) {
    return new Response("No files found", { status: 404 })
  }

  return Response.json(imagesFiltered, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
