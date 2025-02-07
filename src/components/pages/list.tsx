"use client"

import type { ReactNode } from "react"
import type { ShortFileInfo } from "@/types/fileserver"

type Props = {
  children?: ReactNode
  files: ShortFileInfo[]
}

const PagesListView = ({ files }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size</th>
            <th>Date</th>
            <th>Time Ago</th>
            <th>Download Count</th>
            <th>Buttons</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.code}>
              <td>{file.rawName}</td>
              <td>{file.size}</td>
              <td>{file.date}</td>
              <td>{file.ago}</td>
              <td>{file.downloads}</td>
              <td className="flex gap-2">
                <a className="btn btn-primary" href={`/files/${file.code}`}>
                  View
                </a>
                <a
                  className="btn btn-primary"
                  href={`/api/v1/download/${file.code}`}
                >
                  DL
                </a>
                <a
                  className="btn btn-primary"
                  href={`/api/v1/info/${file.code}`}
                >
                  Info
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PagesListView
