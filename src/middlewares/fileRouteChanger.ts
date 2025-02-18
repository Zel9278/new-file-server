import isBrowser from "@/utils/checkBrowserRegex"
import { Middleware } from "./middlewareChain"
import { NextResponse } from "next/server"

const USER_AGENTS = [
  "SummalyBot",
  "Pleroma",
  "Akkoma",
  "Mastodon",
  "Discordbot",
  "Twitterbot",
]

export const fileRouteChangerMiddleware: Middleware = async (
  req,
  _event,
  next,
) => {
  const userAgent = req.headers.get("user-agent") || ""
  const url = new URL(req.url)
  const pathPattern = /^\/files\/([^\/]*)$/

  if (pathPattern.test(url.pathname)) {
    const match = url.pathname.match(pathPattern)
    const code = match ? match[1] : null

    if (USER_AGENTS.some((ua) => userAgent.includes(ua))) {
      const detectedUserAgent = USER_AGENTS.find((ua) => userAgent.includes(ua))
      console.log(`User-Agent detected: ${detectedUserAgent}`)

      return await next()
    }

    if (isBrowser(userAgent)) {
      return await next()
    }

    return NextResponse.rewrite(new URL(`/api/v1/raw/${code}`, req.url))
  }

  return await next()
}
