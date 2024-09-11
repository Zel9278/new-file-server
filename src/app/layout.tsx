import type { Metadata } from "next"
import { headers } from "next/headers"
import "@/styles/globals.css"

const siteName = process.env.NAME as string

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s - ${siteName}`,
  },
  description: "Ced's New File Server",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="h-screen w-screen flex flex-col">
        <header className="sticky top-0 z-10">
          <div className="navbar bg-base-50 backdrop-blur-sm shadow-lg">
            <a className="btn btn-ghost text-xl text-[#bebebe]" href="/">
              {process.env.NAME}
            </a>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto">{children}</main>
      </body>
    </html>
  )
}
