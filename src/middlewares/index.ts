import { fileRouteChangerMiddleware } from "./fileRouteChanger"
import { createMiddlewareChain } from "./middlewareChain"
import { requestLogMiddleware } from "./requestLog"
import { crossOriginMiddleware } from "./corsOrigin"

export const middlewareChain = createMiddlewareChain(
  requestLogMiddleware,
  fileRouteChangerMiddleware,
  crossOriginMiddleware,
)
