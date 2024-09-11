import fs from "fs"
import path from "path"
import { NextRequest } from "next/server"

type Params = {
  code: string
}

/**
 * @swagger
 * /api/v1/download/{code}:
 *   get:
 *     description: Download file
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: File code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File content
 *       404:
 *         description: File not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  const code = params.code

  const filesDir = path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File not found", { status: 404 })
  }

  const fileDir = fs.readdirSync(`${filesDir}/${code}`)[0]
  const file = fs.readFileSync(`${filesDir}/${code}/${fileDir}`)

  return new Response(file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileDir)}`,
    },
  })
}
