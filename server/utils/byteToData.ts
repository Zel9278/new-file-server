/**
 * Convert bytes to human readable format
 * @param a - Number of bytes
 * @param b - Decimal places (default: 2)
 * @returns Human readable string like "1.5 MB"
 */
export function byteToData(a: number, b = 2): string {
  if (0 === a) return "0 Bytes"
  const c = 0 > b ? 0 : b
  const d = Math.floor(Math.log(a) / Math.log(1024))
  const datas = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  return `${Number.parseFloat((a / 1024 ** d).toFixed(c))} ${datas[d]}`
}
