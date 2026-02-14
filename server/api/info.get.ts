import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import { check } from "diskusage"

// Type definitions
interface Dependencies {
  [key: string]: string
}

interface License {
  name: string
  version: string
  author: string | null
  repository: string
  source: string
  license: string
  licenseText: string
}

interface Package {
  name: string
  version: string
}

interface Storage {
  usage: number
  total: number
  used: number
  free: number
  formatted: string
}

interface TypeCount {
  [key: string]: number
}

interface ServerInfoData {
  host: string
  owner: string
  hostname: string
  runningAs: string
  filesDir: string
  thisVersion: string
  nodeVersion: string
  pnpmVersion: string
  total: number
  none: number
  typeCount: TypeCount
  packageList: Package[]
  devPackageList: Package[]
  licensesList: License[]
  storage: Storage
}

async function getStorageUsage(filesDir: string): Promise<{
  usage: number
  total: number
  used: number
  free: number
}> {
  const { free, total } = await check(filesDir)

  const used = total - free
  const usage = Math.round((used / total) * 100)

  return { usage, total, used, free }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const filesDir = config.filesDir || path.join(process.cwd(), "files")
  const { usage, total, used, free } = await getStorageUsage(filesDir)

  const files = fs.readdirSync(filesDir)

  const typeCount: TypeCount = {}
  const fileTotal = files.length
  let none = 0

  for (const file of files) {
    const type = path.extname(file).replace(".", "")
    if (typeCount[type]) {
      if (type === "") {
        none += 1
        continue
      }
      typeCount[type] += 1
    } else {
      if (type === "") {
        none += 1
        continue
      }
      typeCount[type] = 1
    }
  }

  const sortedTypeCount: TypeCount = {}
  for (const key of Object.keys(typeCount).sort()) {
    const count = typeCount[key]
    if (count !== undefined) {
      sortedTypeCount[key] = count
    }
  }

  // Read package.json
  const packageJsonPath = path.join(process.cwd(), "package.json")
  const packages = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

  const deps: Dependencies = packages.dependencies || {}
  const devDeps: Dependencies = packages.devDependencies || {}

  const packageList: Package[] = []
  const devPackageList: Package[] = []

  // Try to read licenses.json if it exists
  let licensesList: License[] = []
  const licensesPath = path.join(process.cwd(), "licenses.json")
  if (fs.existsSync(licensesPath)) {
    licensesList = JSON.parse(fs.readFileSync(licensesPath, "utf-8"))
  }

  for (const [name, version] of Object.entries(deps)) {
    packageList.push({ name, version: version as string })
  }

  for (const [name, version] of Object.entries(devDeps)) {
    devPackageList.push({ name, version: version as string })
  }

  const storage: Storage = {
    usage,
    total,
    used,
    free,
    formatted: `${byteToData(used)} / ${byteToData(total)} | ${byteToData(free)} free`,
  }

  const responseData: ServerInfoData = {
    host: config.public.url?.replace(/^https?:\/\//, "") || "localhost",
    owner: config.author || "Unknown",
    hostname: os.hostname(),
    runningAs: `${os.userInfo().username}@${os.hostname()}`,
    filesDir,
    thisVersion: packages.version || "0.0.0",
    nodeVersion: process.version,
    pnpmVersion: packages.packageManager || "pnpm",
    total: fileTotal,
    none,
    typeCount: sortedTypeCount,
    packageList,
    devPackageList,
    licensesList,
    storage,
  }

  setResponseHeaders(event, {
    "Content-Type": "application/json",
    "Cache-Control": "public, no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  })

  return responseData
})
