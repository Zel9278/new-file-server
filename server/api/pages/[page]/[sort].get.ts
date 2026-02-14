import fs from "node:fs"
import path from "node:path"
import { DateTime } from "luxon"
import type { ShortFileInfo, PageResult } from "../../../types/fileserver"
import { byteToData } from "../../../utils/byteToData"

type SortType =
  | "NameUp"
  | "NameDown"
  | "CodeUp"
  | "CodeDown"
  | "SizeUp"
  | "SizeDown"
  | "DownloadUp"
  | "DownloadDown"
  | "DateUp"
  | "DateDown"

function arrayChunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return []

  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }

  return result
}

function getPage(page: number, count: number, max: number): PageResult {
  if (page < 1 || page > max)
    return {
      prev: null,
      next: null,
      now: 0,
      max: 0,
      pages: [1],
    }

  const res: PageResult = {
    prev: page > 1 ? page - 1 : null,
    next: page < max ? page + 1 : null,
    now: page,
    max: max,
    pages: [],
  }

  let startPage = Math.max(1, page - Math.floor(count / 2))
  const endPage = Math.min(max, startPage + count - 1)

  startPage = Math.max(1, Math.min(startPage, max - count + 1))

  for (let i = startPage; i <= endPage; i++) {
    res.pages.push(i)
  }

  return res
}

function sortFiles(files: ShortFileInfo[], sort: string) {
  switch (sort) {
    case "NameUp":
      return files.sort((a, b) => a.rawName.localeCompare(b.rawName))
    case "NameDown":
      return files.sort((a, b) => b.rawName.localeCompare(a.rawName))
    case "CodeUp":
      return files.sort((a, b) => a.code.localeCompare(b.code))
    case "CodeDown":
      return files.sort((a, b) => b.code.localeCompare(a.code))
    case "SizeUp":
      return files.sort((a, b) => b.rawSize - a.rawSize)
    case "SizeDown":
      return files.sort((a, b) => a.rawSize - b.rawSize)
    case "DownloadUp":
      return files.sort((a, b) => b.downloads - a.downloads)
    case "DownloadDown":
      return files.sort((a, b) => a.downloads - b.downloads)
    case "DateUp":
      return files.sort((a, b) => b.date.localeCompare(a.date))
    case "DateDown":
      return files.sort((a, b) => a.date.localeCompare(b.date))
    default:
      return files
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const page = Number(getRouterParam(event, "page"))
  const sort = (getRouterParam(event, "sort") || "CodeUp") as SortType

  if (Number.isNaN(page)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid page number",
    })
  }

  const counterPath = path.join(process.cwd(), ".counter.json")
  let counter: Record<string, number> = {}

  try {
    counter = JSON.parse(fs.readFileSync(counterPath, "utf-8"))
  } catch {
    fs.writeFileSync(counterPath, JSON.stringify({}, null, 2))
  }

  const filesDir = config.filesDir || path.join(process.cwd(), "files")

  const filesRaw = fs.readdirSync(filesDir).map((file: string) => {
    const fileDir = fs
      .readdirSync(path.join(filesDir, file))
      .filter((f: string) => f !== "thumbnail.png")
    
    if (!fileDir[0]) return null
    
    const fileStat = fs.statSync(path.join(filesDir, file, fileDir[0]))

    const rawName = fileDir[0]
    const fileSize = byteToData(fileStat.size)
    const fileDate = DateTime.fromJSDate(fileStat.mtime)
      .setLocale("en")
      .toFormat("yyyy-MM-dd HH:mm:ss")
    const fileAgo = DateTime.fromJSDate(fileStat.mtime)
      .setLocale("en")
      .toRelative()
    const downloadCount = counter[file] || 0

    const fileInfo: ShortFileInfo = {
      rawName,
      code: file,
      size: fileSize,
      rawSize: fileStat.size,
      date: fileDate,
      ago: fileAgo,
      downloads: downloadCount,
    }

    return fileInfo
  })
  
  const files = sortFiles(
    filesRaw.filter((item): item is ShortFileInfo => item !== null),
    sort,
  )

  const chunkedFiles = arrayChunk(files, 10)

  if (page < 1 || page > chunkedFiles.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page not found",
    })
  }

  const max = chunkedFiles.length
  const result = getPage(page, 5, max)
  const filesOnPage = chunkedFiles[page - 1]

  return { result, filesOnPage }
})
