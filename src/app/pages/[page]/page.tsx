import fs from "node:fs"
import path from "node:path"
import { notFound } from "next/navigation"
import byteToData from "@/utils/byteToData"
import { DateTime } from "luxon"

type Props = {
  params: Promise<{
    page: string
  }>
}

type PageResult = {
  prev: number | null
  next: number | null
  now: number
  max: number
  pages: number[]
}

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

export default async function Page({ params }: Props) {
  if (Number.isNaN(Number((await params).page))) {
    return notFound()
  }

  const files = fs.readdirSync(path.join(process.cwd(), "files"))
  const chunkedFiles = arrayChunk(files, 10)
  const page = Number((await params).page)

  if (page < 1 || page > chunkedFiles.length) {
    return notFound()
  }

  const max = chunkedFiles.length
  const result = getPage(page, 5, max)
  const filesOnPage = chunkedFiles[page - 1]

  return (
    <>
      <div className="flex items-center flex-col gap-4 w-auto h-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 !items-center !justify-center">
            {filesOnPage.map((file) => {
              const fileDir = fs.readdirSync(
                path.join(process.cwd(), "files", file),
              )
              const fileStat = fs.statSync(
                path.join(process.cwd(), "files", file, fileDir[0]),
              )

              const fileSize = byteToData(fileStat.size)
              const fileDate = DateTime.fromJSDate(fileStat.mtime)
                .setLocale("en")
                .toFormat("yyyy-MM-dd HH:mm:ss")
              const fileAgo = DateTime.fromJSDate(fileStat.mtime)
                .setLocale("en")
                .toRelative()

              return (
                <div key={file} className="card bg-base-200 w-96 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">{file}</h2>
                    <div>
                      <p>Original FileName: {fileDir[0]}</p>
                      <p>Size: {fileSize}</p>
                      <p>Date: {fileDate}</p>
                      <p>Time Ago: {fileAgo}</p>
                    </div>
                    <div className="card-actions justify-end">
                      <a
                        className="btn btn-primary"
                        href={`/api/v1/info/${file}`}
                      >
                        Info
                      </a>
                      <a className="btn btn-primary" href={`/files/${file}`}>
                        View
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="join flex">
          {result.prev ? (
            <a href={`/pages/${result.prev}`} className="join-item btn">
              Prev
            </a>
          ) : (
            <span className="join-item btn btn-disabled">Prev</span>
          )}

          {result.pages.map((p) =>
            result.now === p ? (
              <span key={p} className="join-item btn btn-success">
                {p}
              </span>
            ) : (
              <a key={p} href={`/pages/${p}`} className="join-item btn">
                {p}
              </a>
            ),
          )}

          {result.next ? (
            <a href={`/pages/${result.next}`} className="join-item btn">
              Next
            </a>
          ) : (
            <span className="join-item btn btn-disabled">Next</span>
          )}
        </div>
      </div>
    </>
  )
}
