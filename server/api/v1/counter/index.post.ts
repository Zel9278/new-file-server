import fs from "node:fs/promises"
import path from "node:path"

type CountData = {
  [key: string]: number
}

const COUNTER_PATH = path.join(process.cwd(), ".counter.json")

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const body = await readBody(event)
    const { fileId } = body

    const filesDir = config.filesDir || path.join(process.cwd(), "files")
    const dirs = await fs.readdir(filesDir)
    const files = dirs.filter((dir: string) => dir !== "favicon.ico")

    const file = files.find((file: string) => file === fileId)
    if (!file) {
      throw createError({
        statusCode: 404,
        statusMessage: "File not found",
      })
    }

    const counter = await loadCounter()
    if (!(fileId in counter)) {
      counter[fileId] = 0
    }

    counter[fileId] = (counter[fileId] ?? 0) + 1
    await fs.writeFile(COUNTER_PATH, JSON.stringify(counter, null, 4))

    return { count: counter[fileId] }
  } catch (error: unknown) {
    console.error("Counter update failed:", error)
    
    // If it's already a H3Error, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    })
  }
})
