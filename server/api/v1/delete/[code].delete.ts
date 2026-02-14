import path from "node:path"
import fs from "node:fs"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (getHeader(event, "Authorization") !== config.authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  }

  const code = getRouterParam(event, "code")

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code is required",
    })
  }

  const filesDir = config.filesDir || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    throw createError({
      statusCode: 404,
      statusMessage: "File not found",
    })
  }

  try {
    fs.rmSync(`${filesDir}/${code}`, { recursive: true })

    discordPreloader("delete", code)

    return "done"
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    })
  }
})
