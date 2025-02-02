import fs from "node:fs"
import path from "node:path"
import type { NextRequest } from "next/server"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"
import imageSize from "image-size"

type Props = {
  params: Promise<{
    code: string
  }>
}

type Info = {
  code: string
  url: string
  rawName: string
  type: string
  size: string
  date: string
  unixDate: number
  ago: string | null
  width?: number
  height?: number
}

const IMG_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]

export async function GET(request: NextRequest, { params }: Props) {
  const code = (await params).code
  const filesDir = path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File Not found", { status: 404 })
  }

  const fileDir = fs.readdirSync(`${filesDir}/${code}`)[0]
  const fileStat = fs.statSync(`${filesDir}/${code}/${fileDir}`)

  const info: Info = {
    code,
    url: `${process.env.URL}/files/${code}`,
    rawName: fileDir,
    type: path.extname(`${filesDir}/${code}`).replace(".", ""),
    size: byteToData(fileStat.size),
    date: DateTime.fromJSDate(fileStat.mtime)
      .setLocale("en")
      .toFormat("yyyy-MM-dd HH:mm:ss"),
    unixDate: fileStat.mtime.getTime(),
    ago: DateTime.fromJSDate(fileStat.mtime).setLocale("en").toRelative(),
  }

  if (IMG_EXT.includes(path.extname(fileDir))) {
    const imageSizeData = imageSize(path.join(filesDir, code, fileDir))

    info.width = imageSizeData.width
    info.height = imageSizeData.height
  }

  return Response.json(info)
}
