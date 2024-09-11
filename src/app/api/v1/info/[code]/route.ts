import fs from "fs"
import path from "path"
import { NextRequest } from "next/server"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"

type Params = {
  code: string
}

/**
 * @swagger
 * /api/v1/info/{code}:
 *   get:
 *     description: List all files
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: File code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: File code
 *                 url:
 *                   type: string
 *                   description: File URL
 *                 rawName:
 *                   type: string
 *                   description: File name
 *                 type:
 *                   type: string
 *                   description: File type
 *                 size:
 *                   type: string
 *                   description: File size
 *                 date:
 *                   type: string
 *                   description: File date
 *                 unixDate:
 *                   type: number
 *                   description: File date in unix time
 *                 ago:
 *                   type: string
 *                   description: File date in relative time
 *       404:
 *         description: Not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  const code = params.code
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
