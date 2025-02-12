import os from "node:os"
import packages from "../../../../package.json"
import licenses from "@/licenses.json"
import path from "node:path"
import fs from "node:fs"
import type {
  Dependencies,
  License,
  Package,
  ServerInfoData,
  Storage,
  TypeCount,
} from "@/types/fileserver"
import { check } from "diskusage"
import byteToData from "@/utils/byteToData"

async function getStrageUsage(): Promise<{
  usage: number
  total: number
  used: number
  free: number
}> {
  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
  const { free, total } = await check(filesDir)

  const used = total - free
  const usage = Math.round((used / total) * 100)

  return { usage, total, used, free }
}

export async function GET() {
  const { usage, total, used, free } = await getStrageUsage()

  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
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
    sortedTypeCount[key] = typeCount[key]
  }

  const deps: Dependencies = packages.dependencies
  const devDeps: Dependencies = packages.devDependencies

  const packageList: Package[] = []
  const devPackageList: Package[] = []

  const licensesList: License[] = licenses as License[]

  for (const [name, version] of Object.entries(deps)) {
    packageList.push({ name, version })
  }

  for (const [name, version] of Object.entries(devDeps)) {
    devPackageList.push({ name, version })
  }

  const storage: Storage = {
    usage,
    total,
    used,
    free,
    formatted: `${byteToData(used)} / ${byteToData(total)} | ${byteToData(free)} free`,
  }

  const responseData: ServerInfoData = {
    host: "f.c30.life",
    owner: "c30",
    hostname: os.hostname(),
    runningAs: `${os.userInfo().username}@${os.hostname()}`,
    filesDir,
    thisVersion: packages.version,
    nodeVersion: process.version,
    pnpmVersion: packages.packageManager,
    total: fileTotal,
    none,
    typeCount: sortedTypeCount,
    packageList,
    devPackageList,
    licensesList,
    storage,
  }

  return Response.json(responseData, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
