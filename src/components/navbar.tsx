"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import useSWR from "swr"
import type { FileInfoWithSearch } from "@/types/fileserver"

const fetcher = <T,>(path: string): Promise<T> =>
  fetch(path).then((res) => res.json())

export default function Navbar() {
  const [search, setSearch] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<FileInfoWithSearch[]>([])
  const [isFocused, setIsFocused] = useState(false)

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  const highlightSearch = (text: string) => {
    if (!search) return text
    const parts = text.split(new RegExp(`(${escapeRegExp(search)})`, "gi"))
    return parts.map((part) =>
      part.toLowerCase() === search?.toLowerCase() ? (
        <span
          key={`${part}_${Math.random()}`}
          className="bg-blue-500/65 font-bold"
        >
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const { data, error, isLoading } = useSWR<FileInfoWithSearch[]>(
    `/api/v1/search/${search}`,
    fetcher,
  )

  useEffect(() => {
    if (error) {
      setSearchResults([])
      return
    }

    if (data) {
      setSearchResults(data)
      return
    }
  }, [data, error])

  return (
    <header className="sticky top-0 z-10">
      <div className="navbar bg-base-50 shadow-lg">
        <div className="navbar-start">
          <Link className="btn btn-ghost text-xl text-current" href="/">
            {process.env.NEXT_PUBLIC_NAME}
          </Link>
        </div>
        <div className="navbar-center">
          <input
            type="text"
            placeholder="Search..."
            className="input input-primary"
            value={search || ""}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              e.preventDefault()
              setTimeout(() => setIsFocused(false), 200)
            }}
          />
          {search && (
            <button
              className="btn btn-ghost btn-circle ml-2"
              onClick={() => setSearch(null)}
              type="reset"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Clear search</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          {search && isFocused && (
            <div className="absolute left-0 right-0 mx-auto text-center top-full max-h-96 overflow-y-auto bg-base-300 border-2 border-base-content rounded-2xl">
              {isLoading && (
                <div className="loading loading-infinity loading-xl" />
              )}
              {error && (
                <div className="p-2 text-error">
                  No results found for &quot;{search}&quot;
                </div>
              )}
              {searchResults.length > 0 &&
                !error &&
                search &&
                searchResults.map((result) => (
                  <Link
                    key={result.code}
                    href={`/files/${result.code}`}
                    className="block p-2 hover:text-info"
                  >
                    <p className="flex">
                      {highlightSearch(result.code)} (
                      {highlightSearch(result.rawName)})
                    </p>
                  </Link>
                ))}
            </div>
          )}
        </div>
        <div className="navbar-end">{""}</div>
      </div>
    </header>
  )
}
