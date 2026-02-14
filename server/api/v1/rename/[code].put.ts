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

  const query = getQuery(event)
  const newName = query.name as string | undefined

  if (!newName) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name not provided",
    })
  }

  const code = getRouterParam(event, "code")

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code is required",
    })
  }

  const baseURL = config.public.url
  const filesDir = config.filesDir || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    throw createError({
      statusCode: 404,
      statusMessage: "File not found",
    })
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

    return "done"
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    })
  }
})
