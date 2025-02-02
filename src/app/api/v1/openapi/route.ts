import fs from "node:fs"
import path from "node:path"

export function GET() {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "src/openapi.json"), "utf-8"),
  )

  return Response.json(data)
}
