import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"

type Props = {
  params: { page: string }
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
  let endPage = Math.min(max, startPage + count - 1)

  startPage = Math.max(1, Math.min(startPage, max - count + 1))

  for (let i = startPage; i <= endPage; i++) {
    res.pages.push(i)
  }

  return res
}

export default function Page({ params }: Props) {
  if (Number.isNaN(Number(params.page))) {
    return notFound()
  }

  const files = fs.readdirSync(path.join(process.cwd(), "files"))
  const chunkedFiles = arrayChunk(files, 10)
  const page = Number(params.page)

  if (page < 1 || page > chunkedFiles.length) {
    return notFound()
  }

  const max = chunkedFiles.length
  const result = getPage(page, 5, max)
  const filesOnPage = chunkedFiles[page - 1]

  return (
    <>
      <div className="flex justify-center items-center flex-col gap-2 w-auto h-full">
        <div className="flex flex-col gap-2">
          <h1>File List</h1>
          <div className="flex gap-2 flex-wrap">
            {filesOnPage.map((file) => (
              <a key={file} href={`/files/${file}`} className="btn btn-info">
                {file}
              </a>
            ))}
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
