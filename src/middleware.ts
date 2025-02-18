import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { middlewareChain } from "@/middlewares"

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const next = async () => {
    return NextResponse.next()
  }
  return middlewareChain(req, event, next)
}
