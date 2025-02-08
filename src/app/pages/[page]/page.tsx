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
import PagesDefaultView from "@/components/pages/default"
import PagesListView from "@/components/pages/list"

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

enum View {
  Default = "Default",
  List = "List",
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
  const viewParam = searchParams.get("view")

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      if (name === "sort" && value === Sort.CodeUp) {
        params.delete("sort")
      }
      if (name === "view" && value === View.Default) {
        params.delete("view")
      }

      const queryString = params.toString()
      return queryString ? `?${queryString}` : ""
    },
    [searchParams],
  )

  const [sort, setSort] = useState<Sort>((sortParam as Sort) || Sort.CodeUp)
  const [view, setView] = useState<View>((viewParam as View) || View.Default)

  const { data, error, isLoading } = useSWR<{
    filesOnPage: ShortFileInfo[]
    result: PageResult
  }>(`/api/pages/${page}/${sort}`, fetcher)

  useEffect(() => {
    if (data) {
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
              `/pages/${page}${createQueryString("sort", e.target.value)}`,
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
      <select
        defaultValue={view}
        className="select select-xs"
        onChange={(e) => {
          setView(e.target.value as View)
          router.push(
            `/pages/${page}${createQueryString("view", e.target.value)}`,
          )
        }}
      >
        <option value="Default">Default View</option>
        <option value="List">List View</option>
      </select>
      <div className="flex flex-col gap-4 w-full h-full">
        {view === "Default" && <PagesDefaultView files={filesOnPage} />}
        {view === "List" && <PagesListView files={filesOnPage} />}
        <div className="join flex flex-wrap justify-center">
          {result.prev ? (
            <a
              href={`/pages/${result.prev}${createQueryString("sort", sort)}`}
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
                href={`/pages/${p}${createQueryString("sort", sort)}`}
                className="join-item btn"
              >
                {p}
              </a>
            ),
          )}

          {result.next ? (
            <a
              href={`/pages/${result.next}${createQueryString("sort", sort)}`}
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
