type UserAgent = string | null

export default function isBrowser(userAgent: UserAgent): boolean {
  userAgent = userAgent || ""

  const browserRegex =
    /(?:Mozilla\/5\.0|Chrome\/\d+\.\d+|Safari\/\d+(\.\d+)?|Firefox\/\d+\.\d+|Edge\/\d+\.\d+)/i
  return browserRegex.test(userAgent)
}
