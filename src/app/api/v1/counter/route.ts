import { NextResponse } from "next/server"
import Counter from "@/.counter.json"
import fs from "node:fs"
import path from "node:path"

type CountData = {
  [key: string]: number
}

export async function POST(request: Request) {
  const { fileId } = await request.json()
  const counter = Counter as CountData

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
  const dirs = fs.readdirSync(filesDir)
  const files = dirs.filter((dir: string) => !["favicon.ico"].includes(dir))

  const file = files.find((file) => file === fileId)

  if (file) {
    counter[fileId]++
    fs.writeFileSync("./src/.counter.json", JSON.stringify(counter, null, 4))

    return NextResponse.json({
      count: counter[fileId],
    })
  }

  return new Response("Not Found", {
    status: 404,
  })
}
