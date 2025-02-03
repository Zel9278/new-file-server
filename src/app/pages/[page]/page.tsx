"use client"

import { useState, useEffect, useCallback } from "react"
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation"
import useSWR from "swr"
import type { PageResult, ShortFileInfo } from "@/types/fileserver"

type Props = {
  page: string
}

enum Sort {
  NameUp = "NameUp",
  NameDown = "NameDown",
  CodeUp = "CodeUp",
  CodeDown = "CodeDown",
  SizeUp = "SizeUp",
  SizeDown = "SizeDown",
  DateUp = "DateUp",
  DateDown = "DateDown",
}

const fetcher = <T,>(path: string): Promise<T> =>
  fetch(path).then((res) => res.json())

export default function Page() {
  const [filesOnPage, setFilesOnPage] = useState<ShortFileInfo[]>([])
  const [result, setResult] = useState<PageResult>({
    prev: null,
    next: null,
    now: 1,
    max: 1,
    pages: [1],
  })

  const router = useRouter()
  const params = useParams<Props>()
  const searchParams = useSearchParams()
  const page = Number(params.page)
  const sortParam = searchParams.get("sort")

  console.log(page, sortParam)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  const [sort, setSort] = useState<Sort>((sortParam as Sort) || Sort.CodeUp)

  const { data, error, isLoading } = useSWR<{
    filesOnPage: ShortFileInfo[]
    result: PageResult
  }>(`/api/pages/${page}/${sort}`, fetcher)

  useEffect(() => {
    if (data) {
      console.log(data)
      setFilesOnPage(data.filesOnPage)
      setResult(data.result)
    }
  }, [data])

  if (error) {
    return notFound()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-infinity loading-xl" />
      </div>
    )
  }

  return (
    <>
      <div className="flex">
        <select
          defaultValue={sort}
          className="select select-xs"
          onChange={(e) => {
            setSort(e.target.value as Sort)
            router.push(
              `/pages/${page}?${createQueryString("sort", e.target.value)}`,
            )
          }}
        >
          <option value="NameUp">Name Up</option>
          <option value="NameDown">Name Down</option>
          <option value="CodeUp">Code Up</option>
          <option value="CodeDown">Code Down</option>
          <option value="SizeUp">Size Up</option>
          <option value="SizeDown">Size Down</option>
          <option value="DateUp">Date Up</option>
          <option value="DateDown">Date Down</option>
        </select>
      </div>
      <div className="flex items-center flex-col gap-4 w-auto h-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 !items-center !justify-center">
            {filesOnPage.map((file) => {
              return (
                <div
                  key={file.code}
                  className="card bg-base-200 w-96 shadow-xl"
                >
                  <div className="card-body p-6">
                    <h2 className="card-title">{file.code}</h2>
                    <div>
                      <p>Original FileName: {file.rawName}</p>
                      <p>Size: {file.size}</p>
                      <p>Date: {file.date}</p>
                      <p>Time Ago: {file.ago}</p>
                      <p>Download Count: {file.downloads}</p>
                    </div>
                    <div className="card-actions justify-end">
                      <a
                        className="btn btn-primary"
                        href={`/api/v1/info/${file.code}`}
                      >
                        Info
                      </a>
                      <a
                        className="btn btn-primary"
                        href={`/api/v1/download/${file.code}`}
                      >
                        DL
                      </a>
                      <a
                        className="btn btn-primary"
                        href={`/files/${file.code}`}
                      >
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
            <a
              href={`/pages/${result.prev}?${createQueryString("sort", sort)}`}
              className="join-item btn"
            >
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
              <a
                key={p}
                href={`/pages/${p}?${createQueryString("sort", sort)}`}
                className="join-item btn"
              >
                {p}
              </a>
            ),
          )}

          {result.next ? (
            <a
              href={`/pages/${result.next}?${createQueryString("sort", sort)}`}
              className="join-item btn"
            >
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
