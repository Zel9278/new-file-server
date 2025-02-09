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
  TypeCount,
} from "@/types/fileserver"

export function GET() {
  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")
  const files = fs.readdirSync(filesDir)

  const typeCount: TypeCount = {}
  const total = files.length
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

  const responseData: ServerInfoData = {
    host: "f.c30.life",
    owner: "c30",
    hostname: os.hostname(),
    runningAs: `${os.userInfo().username}@${os.hostname()}`,
    filesDir,
    thisVersion: packages.version,
    nodeVersion: process.version,
    pnpmVersion: packages.packageManager,
    total,
    none,
    typeCount: sortedTypeCount,
    packageList,
    devPackageList,
    licensesList,
  }

  return Response.json(responseData, {
    headers: { "Content-Type": "application/json" },
  })
}
