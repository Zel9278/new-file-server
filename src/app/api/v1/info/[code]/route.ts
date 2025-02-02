import fs from "node:fs"
import path from "node:path"
import type { NextRequest } from "next/server"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"

type Props = {
  params: Promise<{
    code: string
  }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const code = (await params).code
  const filesDir = path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File Not found", { status: 404 })
  }

  const fileDir = fs.readdirSync(`${filesDir}/${code}`)[0]
  const fileStat = fs.statSync(`${filesDir}/${code}/${fileDir}`)

  const info = {
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

  return Response.json(info)
}
