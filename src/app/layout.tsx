import type { Metadata } from "next"
import Link from "next/link"
import "@/styles/globals.css"

const siteName = process.env.NAME as string

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s - ${siteName}`,
  },
  description: process.env.DESCRIPTION as string,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="h-screen w-screen flex flex-col">
        <header className="sticky top-0 z-10">
          <div className="navbar bg-base-50 backdrop-blur-sm shadow-lg">
            <div className="flex-1">
              <Link className="btn btn-ghost text-xl text-[#bebebe]" href="/">
                {process.env.NAME}
              </Link>
            </div>
            <div className="flex-none">
              {process.env.npm_lifecycle_event === "dev" && (
                <p className="text-xl text-red-600 animate-bounce">
                  Debug Build
                </p>
              )}
            </div>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto">{children}</main>
      </body>
    </html>
  )
}
