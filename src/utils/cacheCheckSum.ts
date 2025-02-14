import crypto from "crypto"
import fs from "fs"
import path from "path"

export function cacheCheckSum(filePath: string): string | null {
  const cachePath = path.join(process.cwd(), "src/.cache.json")

  if (!fs.existsSync(filePath)) {
    return null
  }

  const cache = loadCache(cachePath)

  if (cache[filePath]) {
    return cache[filePath]
  }

  const md5 = calculateMD5(filePath)

  saveCache(cachePath, {
    ...cache,
    [filePath]: md5,
  })

  return md5
}

function loadCache(cachePath: string): Record<string, string> {
  if (!fs.existsSync(cachePath)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(cachePath, "utf-8"))
}

function calculateMD5(filePath: string): string {
  const checksum = crypto.createHash("md5")
  checksum.update(fs.readFileSync(filePath))
  return checksum.digest("hex")
}

function saveCache(cachePath: string, cache: Record<string, string>): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
}
