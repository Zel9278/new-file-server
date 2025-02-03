export type PageResult = {
  prev: number | null
  next: number | null
  now: number
  max: number
  pages: number[]
}

export type ShortFileInfo = {
  rawName: string
  code: string
  size: string
  rawSize: number
  date: string
  ago: string | null
  downloads: number
}

export type FileInfo = {
  code: string
  url: string
  rawName: string
  type: string
  size: string
  rawSize: number
  date: string
  unixDate: number
  ago: string | null
  downloadCount: number
  width?: number
  height?: number
}
