import fs from "node:fs"
import path from "node:path"
import type { NextRequest } from "next/server"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"
import { imageSize } from "image-size"
import type { FileInfo } from "@/types/fileserver"
import crypto from "node:crypto"

type Props = {
  params: Promise<{
    code: string
  }>
}

const IMG_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]

export async function GET(request: NextRequest, { params }: Props) {
  const code = (await params).code
  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File Not found", { status: 404 })
  }

  const counterPath = path.join(process.cwd(), "src/.counter.json")
  const counter = JSON.parse(fs.readFileSync(counterPath, "utf-8"))

  const fileDir = fs
    .readdirSync(`${filesDir}/${code}`)
    .filter((file) => file !== "thumbnail.png")[0]
  const fileStat = fs.statSync(`${filesDir}/${code}/${fileDir}`)

  const checksum = crypto.createHash("md5")
  checksum.update(fs.readFileSync(`${filesDir}/${code}/${fileDir}`))

  const info: FileInfo = {
    code,
    url: `${process.env.URL}/files/${code}`,
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

    info.width = (await imageSizeData).width
    info.height = (await imageSizeData).height
  }

  if (fs.existsSync(path.join(filesDir, code, "thumbnail.png"))) {
    info.thumbnail = `${process.env.URL}/api/v1/thumbnail/${code}`
  }

  return Response.json(info, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
