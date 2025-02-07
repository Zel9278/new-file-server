"use client"

import type { ReactNode } from "react"
import type { ShortFileInfo } from "@/types/fileserver"

type Props = {
  children?: ReactNode
  files: ShortFileInfo[]
}

const PagesDefaultView = ({ files }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 !items-center !justify-center">
        {files.map((file) => {
          return (
            <div key={file.code} className="card bg-base-200 w-96 shadow-xl">
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
                  <a className="btn btn-primary" href={`/files/${file.code}`}>
                    View
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PagesDefaultView
