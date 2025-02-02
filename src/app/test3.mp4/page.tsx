import fs from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import { headers } from "next/headers"

const DOWNLOAD_URL = `${process.env.URL}/api/v1/download/`
const USER_AGENTS = [
  "SummalyBot",
  "Pleroma",
  "Akkoma",
  "Mastodon",
  "Discordbot",
]

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers()
  const userAgent = (await headersList).get("user-agent") || "Unknown"

  if (USER_AGENTS.some((ua) => userAgent.includes(ua))) {
    const detectedUserAgent = USER_AGENTS.find((ua) => userAgent.includes(ua))
    console.log(`User-Agent detected: ${detectedUserAgent}`)
  }

  const fileDir = path.join(process.cwd(), "files", "oi3j.exe")
  const file = fs.readdirSync(fileDir)

  if (!fs.existsSync(fileDir)) {
    return {
      title: "Not Found",
      description: "The requested file is not found.",
      openGraph: {
        siteName: process.env.NAME,
        title: "Not Found",
        description: "The requested file is not found.",
      },
    }
  }

  const fileName = file[0]

  let metadata: Metadata = {
    title: "oi3j.mp4",
    description: `Original Filename: ${fileName}`,
    openGraph: {
      siteName: process.env.NAME,
      title: "oi3j.mp4",
      description: `Original Filename: ${fileName}`,
      images: `${DOWNLOAD_URL}oi3j.exe`,
    },
  }
  metadata = {
    ...metadata,
    twitter: {
      card: "player",
      siteId: "oi3j.mp4",
      title: "oi3j.mp4",
      description: `Original Filename: ${fileName}`,
      site: process.env.NAME,
      creator: process.env.AUTHOR,
      creatorId: process.env.AUTHOR_ID,
      players: [
        {
          playerUrl: `${DOWNLOAD_URL}oi3j.exe`,
          streamUrl: "",
          width: 320,
          height: 180,
        },
      ],
    },
  }
  return metadata
}

export default function Page() {
  return <p>aaa</p>
}
