import type { NextFetchEvent, NextRequest, NextResponse } from "next/server"

export type Middleware = (
  req: NextRequest,
  event: NextFetchEvent,
  next: () => Promise<NextResponse>,
) => Promise<NextResponse>

type MiddlewareChain = (
  request: NextRequest,
  event: NextFetchEvent,
  next: () => Promise<NextResponse>,
) => Promise<NextResponse>

export const createMiddlewareChain = (
  ...middlewares: Middleware[]
): MiddlewareChain => {
  return async (req, event, next) => {
    const executeMiddleware = (index: number): Promise<NextResponse> => {
      const middleware = middlewares[index]
      if (middleware) {
        return middleware(req, event, async () => executeMiddleware(index + 1))
      }

      return next()
    }

    return executeMiddleware(0)
  }
}
