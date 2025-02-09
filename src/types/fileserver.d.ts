/* File API */

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

export type FileInfoWithSearch = {
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
  isCode: boolean
  isRawName: boolean
}

/* File API */

/* Info API */

export type Package = {
  name: string
  version: string
}

export type Dependencies = {
  [key: string]: string
}

export type License = {
  name: string
  version: string
  author: string | null
  repository: string
  source: string
  license: string
  licenseText: string
}

export type TypeCount = {
  [key: string]: number
}

export type ServerInfoData = {
  host: string
  owner: string
  hostname: string
  runningAs: string
  filesDir: string
  thisVersion: string
  nodeVersion: string
  pnpmVersion: string
  total: number
  none: number
  typeCount: TypeCount
  packageList: Package[]
  devPackageList: Package[]
  licensesList: License[]
}

/* Info API */
