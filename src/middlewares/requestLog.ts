import isBrowser from "@/utils/checkBrowserRegex"
import { Middleware } from "./middlewareChain"

export const requestLogMiddleware: Middleware = async (req, _event, next) => {
  const userAgent = req.headers.get("user-agent")

  if (isBrowser(userAgent)) {
    console.log("This is a browser request")
  } else {
    console.log("This is not a browser request")
  }

  console.log(
    `[${new Date().toISOString()}] [Request ]     ${req.method} ${req.url} | ${userAgent}`,
  )

  const response = await next()

  console.log(
    `[${new Date().toISOString()}] [Response] ${
      response.status
    } ${req.method} ${req.url} | ${userAgent}`,
  )

  return response
}
