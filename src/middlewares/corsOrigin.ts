import type { Middleware } from "./middlewareChain"

export const crossOriginMiddleware: Middleware = async (req, _event, next) => {
  req.headers.set("Access-Control-Allow-Origin", "*")
  req.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  req.headers.set("Access-Control-Allow-Headers", "Content-Type")

  const response = await next()

  return response
}
