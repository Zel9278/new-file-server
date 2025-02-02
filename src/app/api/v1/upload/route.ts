import type { NextRequest } from "next/server"
import discordPreloader from "@/utils/discord-preloader"
import path from "node:path"
import fs from "node:fs/promises"
import { DateTime } from "luxon"

export async function POST(request: NextRequest) {
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const form = await request.formData()
    const file = form.get("file") as Blob | null

    const fileData = form.get("file") as {
      name: string
      size: number
      type: string
      lastModified: number
    }

    if (!file || !fileData) {
      return new Response("No file found", { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const bufferStream = new Uint8Array(buffer)
    const fileName =
      fileData.name?.toString() ||
      `${DateTime.now().toFormat("yyyy-MM-dd_HH-mm-ss")}`

    const filesDir = path.join(process.cwd(), "files")

    return tryNewFile(fileName, filesDir, bufferStream)
  } catch (error) {
    console.log(error)
    return new Response("Error", { status: 500 })
  }
}

async function tryNewFile(
  fileName: string,
  filesDir: string,
  bufferStream: Uint8Array,
) {
  try {
    let fileCode: string
    let fileDir: string
    let filePath: string
    let url: string

    while (true) {
      fileCode = Math.random().toString(36).slice(2, 6) + path.extname(fileName)
      fileDir = path.join(filesDir, fileCode)
      filePath = path.join(fileDir, fileName)
      url = `${process.env.URL}/files/${fileCode}`

      try {
        await fs.access(fileDir)
        console.log("File exists, trying again")
      } catch {
        break
      }
    }

    await fs.mkdir(fileDir, { recursive: true })
    await fs.writeFile(filePath, bufferStream)

    discordPreloader("upload", url)

    return new Response(url, { status: 200 })
  } catch (error) {
    console.log(error)
    return new Response("Error", { status: 500 })
  }
}
