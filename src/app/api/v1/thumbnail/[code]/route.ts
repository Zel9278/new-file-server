import fs from "node:fs"
import path from "node:path"
import type { NextRequest } from "next/server"
import mime from "mime"

type Props = {
  params: Promise<{
    code: string
  }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const code = (await params).code

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File not found", { status: 404 })
  }

  const fileDir = fs
    .readdirSync(`${filesDir}/${code}`)
    .filter((file) => file === "thumbnail.png")[0]
  const file = fs.readFileSync(`${filesDir}/${code}/${fileDir}`)
  const fileType = mime.getType(path.extname(fileDir).replace(".", ""))

  return new Response(file, {
    headers: {
      "Content-Type": fileType || "application/octet-stream",
      "Content-Disposition": "inline",
    },
  })
}
