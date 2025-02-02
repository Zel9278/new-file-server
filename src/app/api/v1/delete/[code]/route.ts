import type { NextRequest } from "next/server"
import path from "node:path"
import fs from "node:fs"
import discordPreloader from "@/utils/discord-preloader"

type Props = {
  params: Promise<{
    code: string
  }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    return new Response("Unauthorized", { status: 401 })
  }

  const code = (await params).code

  const filesDir = path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File not found", { status: 404 })
  }

  try {
    fs.rmSync(`${filesDir}/${code}`, { recursive: true })

    discordPreloader("delete", code)

    return new Response("done")
  } catch {
    return new Response("Internal Server Error", { status: 500 })
  }
}
