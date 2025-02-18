import isBrowser from "@/utils/checkBrowserRegex"
import { Middleware } from "./middlewareChain"
import { NextResponse } from "next/server"

export const fileRouteChangerMiddleware: Middleware = async (
  req,
  _event,
  next,
) => {
  const userAgent = req.headers.get("user-agent")
  const url = new URL(req.url)
  const pathPattern = /^\/files\/([^\/]*)$/

  if (pathPattern.test(url.pathname)) {
    if (isBrowser(userAgent)) {
      return await next()
    }

    const match = url.pathname.match(pathPattern)
    const code = match ? match[1] : null

    return NextResponse.rewrite(new URL(`/api/v1/raw/${code}`, req.url))
  }

  return await next()
}
