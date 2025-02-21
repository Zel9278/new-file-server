import type { Metadata, Viewport } from "next"
import "@/styles/globals.css"
import Navbar from "@/components/navbar"

const siteName = process.env.NEXT_PUBLIC_NAME as string

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s - ${siteName}`,
  },
  description: process.env.DESCRIPTION as string,
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="h-screen w-screen flex flex-col">
        {process.env.npm_lifecycle_event === "dev" && (
          <div className="fixed top-0 right-0 z-50 p-2 bg-black">
            <p className="text-xl text-red-600 animate-bounce">Debug Build</p>
          </div>
        )}
        <Navbar />
        <main className="flex-grow overflow-y-auto">{children}</main>
      </body>
    </html>
  )
}
