import Link from "next/link"
import os from "node:os"
import packages from "../../../package.json"
import licenses from "@/licenses.json"
import path from "node:path"
import fs from "node:fs"

type Package = {
  name: string
  version: string
}

type Dependencies = {
  [key: string]: string
}

type License = {
  name: string
  version: string
  author: string | null
  repository: string
  source: string
  license: string
  licenseText: string
}

type TypeCount = {
  [key: string]: number
}

const getData = async () => {
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

  return {
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
  }
}

export default async function Home() {
  const data = await getData()

  const deps: Dependencies = packages.dependencies
  const devDeps: Dependencies = packages.devDependencies

  const packageList: Package[] = []
  const devPackageList: Package[] = []

  const licensesList: License[] = licenses as License[]

  const typeCount: TypeCount = data.typeCount

  for (const [name, version] of Object.entries(deps)) {
    packageList.push({ name, version })
  }

  for (const [name, version] of Object.entries(devDeps)) {
    devPackageList.push({ name, version })
  }

  return (
    <>
      <main>
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Info</h2>
            <div className="bg-zinc-400 w-full h-0.5 rounded" />
            <ul className="px-5">
              <li>ホスト: {data.host}</li>
              <li>オーナー: {data.owner}</li>
              <li>実行ユーザー: {data.runningAs}</li>
              <li>ファイルを置いてる場所: {data.filesDir}</li>

              <li className="bg-zinc-500 w-full h-0.5 rounded my-1" />

              <li>このサイトバージョン: {data.thisVersion}</li>
              <li>Node.jsのバージョン: {data.nodeVersion}</li>
              <li>pnpmのバージョン: {data.pnpmVersion.replace("pnpm@", "")}</li>

              <li className="bg-zinc-500 w-full h-0.5 rounded my-1" />

              <li>
                Sitemap:{" "}
                <Link
                  href="/sitemap.xml"
                  className="link link-primary"
                  target="_blank"
                >
                  sitemap.xml
                </Link>
              </li>
              <li>
                Robots:{" "}
                <Link
                  href="/robots.txt"
                  className="link link-primary"
                  target="_blank"
                >
                  robots.txt
                </Link>
              </li>
              <li>
                Repository:{" "}
                <Link
                  href="https://github.com/Zel9278/new-file-server"
                  className="link link-primary"
                  target="_blank"
                >
                  git:zel9278/new-file-server
                </Link>
              </li>
            </ul>

            <div className="bg-zinc-400 w-full h-0.5 rounded my-2" />

            <details className="collapse collapse-arrow bg-base-200">
              <summary className="collapse-title text-xl font-medium">
                File Types
              </summary>
              <div className="collapse-content max-h-full">
                <p>Files Total: {data.total}</p>
                <p>No Extension: {data.none}</p>

                <div className="bg-zinc-500 w-full h-0.5 rounded my-1" />

                <ul>
                  {Object.entries(typeCount).map(([type, count]) => (
                    <li key={type}>
                      {type}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </details>

            <div className="bg-zinc-400 w-full h-0.5 rounded my-2" />

            <details className="collapse collapse-arrow bg-base-200">
              <summary className="collapse-title text-xl font-medium">
                Dependencies
              </summary>
              <div className="collapse-content max-h-full">
                <ul>
                  {packageList.map((pkg) => (
                    <li key={pkg.name}>
                      {pkg.name}: {pkg.version}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
            <details className="collapse collapse-arrow bg-base-200">
              <summary className="collapse-title text-xl font-medium">
                DevDependencies
              </summary>
              <div className="collapse-content max-h-full">
                <ul>
                  {devPackageList.map((pkg) => (
                    <li key={pkg.name}>
                      {pkg.name}: {pkg.version}
                    </li>
                  ))}
                </ul>
              </div>
            </details>

            <div className="bg-zinc-400 w-full h-0.5 rounded my-2" />

            <details className="collapse collapse-arrow bg-base-200">
              <summary className="collapse-title text-xl font-medium">
                Licenses
              </summary>
              <div className="collapse-content max-h-full">
                <ul>
                  {licensesList.map((license) => (
                    <li key={license.name}>
                      <details className="collapse collapse-arrow bg-base-200">
                        <summary className="collapse-title text-lg font-medium">
                          {license.name}
                        </summary>
                        <div className="collapse-content">
                          <ul>
                            <li>Version: {license.version}</li>
                            {license.author && (
                              <li>Author: {license.author}</li>
                            )}
                            <li>
                              Repository:{" "}
                              <Link
                                href={license.repository}
                                className="link link-primary"
                                target="_blank"
                              >
                                {license.repository}
                              </Link>
                            </li>
                            <li>
                              Source:{" "}
                              <Link
                                href={license.source}
                                className="link link-primary"
                                target="_blank"
                              >
                                {license.source}
                              </Link>
                            </li>
                            <li>License: {license.license}</li>
                            <li>
                              <details className="collapse collapse-arrow bg-base-200">
                                <summary className="collapse-title text-lg font-medium">
                                  License Text
                                </summary>
                                <div className="collapse-content">
                                  <pre>{license.licenseText}</pre>
                                </div>
                              </details>
                            </li>
                          </ul>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </div>
      </main>
    </>
  )
}
