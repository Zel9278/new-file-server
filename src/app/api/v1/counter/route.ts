import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

type CountData = {
  [key: string]: number
}

const COUNTER_PATH = path.join(process.cwd(), "src/.counter.json")

async function loadCounter(): Promise<CountData> {
  try {
    const data = await fs.readFile(COUNTER_PATH, "utf-8")
    return JSON.parse(data) as CountData
  } catch {
    const emptyCounter: CountData = {}
    await fs.writeFile(COUNTER_PATH, JSON.stringify(emptyCounter, null, 2))
    return emptyCounter
  }
}

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json()

    const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
    const dirs = await fs.readdir(filesDir)
    const files = dirs.filter((dir: string) => dir !== "favicon.ico")

    const file = files.find((file) => file === fileId)
    if (!file) {
      return new Response("File not found", { status: 404 })
    }

    const counter = await loadCounter()
    if (!(fileId in counter)) {
      counter[fileId] = 0
    }

    counter[fileId]++
    await fs.writeFile(COUNTER_PATH, JSON.stringify(counter, null, 4))

    return NextResponse.json({ count: counter[fileId] })
  } catch (error) {
    console.error("Counter update failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
