import { fileRouteChangerMiddleware } from "./fileRouteChanger"
import { createMiddlewareChain } from "./middlewareChain"
import { requestLogMiddleware } from "./requestLog"

export const middlewareChain = createMiddlewareChain(
  requestLogMiddleware,
  fileRouteChangerMiddleware,
)
