import fs from "node:fs"
import path from "node:path"

export default defineEventHandler(() => {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "openapi.json"), "utf-8"),
  )

  return data
})
