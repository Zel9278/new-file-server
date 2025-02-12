"use client"

import Link from "next/link"
import type {
  ServerInfoData,
  License,
  Package,
  TypeCount,
  Storage,
} from "@/types/fileserver"
import useSWR from "swr"
import { notFound } from "next/navigation"
import Progressbar from "@/components/ProgressBar"

const fetcher = <T,>(path: string): Promise<T> =>
  fetch(path).then((res) => res.json())

export default function Home() {
  const { data, error, isLoading } = useSWR<ServerInfoData>(
    "/api/info",
    fetcher,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-infinity loading-xl" />
      </div>
    )
  }

  if (error) return <div>failed to load</div>
  if (!data) return notFound()

  const packageList: Package[] = data.packageList as Package[]
  const devPackageList: Package[] = data.devPackageList as Package[]
  const licensesList: License[] = data.licensesList as License[]

  const typeCount: TypeCount = data.typeCount

  const storage: Storage = data.storage

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

              <li>ストレージ: {storage.formatted}</li>
              <li>
                <div className="flex items-center">
                  <Progressbar value={storage.usage} className="w-full " />
                  <span className="ml-2">{storage.usage}%</span>
                </div>
              </li>

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
