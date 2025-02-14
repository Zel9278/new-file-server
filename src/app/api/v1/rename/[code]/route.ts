import type { NextRequest } from "next/server"
import path from "node:path"
import fs from "node:fs"
import discordPreloader from "@/utils/discord-preloader"

type Props = {
  params: Promise<{
    code: string
  }>
}

export async function PUT(request: NextRequest, { params }: Props) {
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    return new Response("Unauthorized", { status: 401 })
  }

  const queryParams = request.nextUrl.searchParams
  const newName = queryParams.get("name")

  if (!newName) {
    return new Response("Name not provided", { status: 400 })
  }

  const code = (await params).code
  const baseURL = process.env.URL as string

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File not found", { status: 404 })
  }

  try {
    const newExtension = path.extname(newName)
    const codeNoExtension = code.split(".")[0]

    const oldName = fs
      .readdirSync(`${filesDir}/${code}`)
      .filter((file) => file !== "thumbnail.png")[0]

    fs.renameSync(
      `${filesDir}/${code}/${oldName}`,
      `${filesDir}/${code}/${newName}`,
    )
    fs.renameSync(
      `${filesDir}/${code}`,
      `${filesDir}/${codeNoExtension}${newExtension}`,
    )

    discordPreloader(
      "rename",
      `Name: ${oldName} -> ${newName}\nCode: ${code} -> ${codeNoExtension}${newExtension}\nURL: ${baseURL}/files/${codeNoExtension}${newExtension}`,
    )

    return new Response("done")
  } catch {
    return new Response("Internal Server Error", { status: 500 })
  }
}
