import fs from "node:fs"
import path from "node:path"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"

/**
 * @swagger
 * /api/v1/list:
 *   get:
 *     description: List all files
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: File code
 *                   url:
 *                     type: string
 *                     description: File URL
 *                   rawName:
 *                     type: string
 *                     description: File name
 *                   type:
 *                     type: string
 *                     description: File type
 *                   size:
 *                     type: string
 *                     description: File size
 *                   date:
 *                     type: string
 *                     description: File date
 *                   unixDate:
 *                     type: number
 *                     description: File date in unix time
 *                   ago:
 *                     type: string
 *                     description: File date in relative time
 */
export async function GET() {
  const filesDir = path.join(process.cwd(), "files")
  const dirs = fs.readdirSync(filesDir)
  const files = dirs.filter((dir) => !["favicon.ico"].includes(dir))
  const images = files.map((dir) => {
    const file = fs.readdirSync(`${filesDir}/${dir}`)[0]
    const fileStat = fs.statSync(`${filesDir}/${dir}/${file}`)

    return {
      code: dir,
      url: `${process.env.URL}/files/${dir}`,
      rawName: file,
      type: path.extname(`${filesDir}/${file}`).replace(".", ""),
      size: byteToData(fileStat.size),
      date: DateTime.fromJSDate(fileStat.mtime)
        .setLocale("en")
        .toFormat("yyyy-MM-dd HH:mm:ss"),
      unixDate: fileStat.mtime.getTime(),
      ago: DateTime.fromJSDate(fileStat.mtime).setLocale("en").toRelative(),
    }
  })

  return Response.json(images)
}
