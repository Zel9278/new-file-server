import fs from "fs"
import path from "path"
import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

const DOWNLOAD_URL = `${process.env.URL}/api/v1/download/`
const RAW_URL = `${process.env.URL}/api/v1/raw/`
const USER_AGENTS = [
  "SummalyBot",
  "Pleroma",
  "Akkoma",
  "Mastodon",
  "Discordbot",
]

type Props = {
  params: { code: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = headers()
  const userAgent = headersList.get("user-agent") || "Unknown"

  if (USER_AGENTS.some((ua) => userAgent.includes(ua))) {
    const detectedUserAgent = USER_AGENTS.find((ua) => userAgent.includes(ua))
    console.log(`User-Agent detected: ${detectedUserAgent}`)
  }

  const fileDir = path.join(process.cwd(), "files", params.code)
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
    title: params.code,
    description: `Original Filename: ${fileName}`,
    openGraph: {
      siteName: process.env.NAME,
      title: params.code,
      description: `Original Filename: ${fileName}`,
      images: `${RAW_URL}${params.code}`,
    },
  }

  if (params.code.match(/.mp4/)) {
    metadata = {
      ...metadata,
      twitter: {
        card: "player",
        siteId: params.code,
        title: params.code,
        description: `Original Filename: ${fileName}`,
        site: process.env.NAME,
        creator: process.env.AUTHOR,
        creatorId: process.env.AUTHOR_ID,
        players: [
          {
            playerUrl: `${RAW_URL}${params.code}`,
            streamUrl: "",
            width: 320,
            height: 180,
          },
        ],
      },
    }
  } else if (params.code.match(/.jpg|.jpeg|.png|.gif/)) {
    metadata = {
      ...metadata,
      twitter: {
        card: "summary_large_image",
        siteId: params.code,
        title: params.code,
        site: process.env.NAME,
        creator: process.env.AUTHOR,
        creatorId: process.env.AUTHOR_ID,
        description: `Original Filename: ${fileName}`,
        images: `${RAW_URL}${params.code}`,
      },
    }
  }

  return metadata
}

export default function Page({ params }: Props) {
  if (!fs.existsSync(path.join(process.cwd(), "files", params.code))) {
    return notFound()
  }

  const downloadURL = `${DOWNLOAD_URL}${params.code}`
  const rawURL = `${RAW_URL}${params.code}`
  const fileExtension = path.extname(params.code)
  const cleanedFileExtension = fileExtension.replace(".", "")

  switch (cleanedFileExtension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return (
        <>
          <img
            src={downloadURL}
            alt={params.code}
            className="w-full h-full object-contain"
          />
        </>
      )
    case "mp4":
    case "mkv":
      return (
        <>
          <video className="w-full h-full object-contain" controls>
            <source src={downloadURL} type="video/mp4" />
          </video>
        </>
      )
    case "wav":
    case "mp3":
      return (
        <>
          <audio className="w-full h-full object-contain" controls>
            <source src={downloadURL} />
          </audio>
        </>
      )
    case "txt":
      return (
        <>
          <div className="w-full h-full object-contain">
            <iframe src={rawURL} className="w-full h-full" />
          </div>
        </>
      )
    default:
      return (
        <>
          <div className="w-full h-full object-contain">
            <a className="btn btn-success " href={downloadURL} download>
              Download
            </a>
          </div>
        </>
      )
  }
}
