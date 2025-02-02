import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { headers } = request
  const userAgent = headers.get("user-agent")

  console.log(`User-Agent: ${userAgent}`)
  return NextResponse.next()
}

export const config = {}
