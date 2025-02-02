import fs from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Image from "next/image"
import { imageSize } from "image-size"

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
  params: Promise<{
    code: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = headers()
  const userAgent = (await headersList).get("user-agent") || "Unknown"

  if (USER_AGENTS.some((ua) => userAgent.includes(ua))) {
    const detectedUserAgent = USER_AGENTS.find((ua) => userAgent.includes(ua))
    console.log(`User-Agent detected: ${detectedUserAgent}`)
  }

  const fileDir = path.join(process.cwd(), "files", (await params).code)
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
    title: (await params).code,
    description: `Original Filename: ${fileName}`,
    openGraph: {
      siteName: process.env.NAME,
      title: (await params).code,
      description: `Original Filename: ${fileName}`,
      images: `${RAW_URL}${(await params).code}`,
    },
  }

  if ((await params).code.match(/.mp4/)) {
    metadata = {
      ...metadata,
      twitter: {
        card: "player",
        siteId: (await params).code,
        title: (await params).code,
        description: `Original Filename: ${fileName}`,
        site: process.env.NAME,
        creator: process.env.AUTHOR,
        creatorId: process.env.AUTHOR_ID,
        players: [
          {
            playerUrl: `${RAW_URL}${(await params).code}`,
            streamUrl: "",
            width: 320,
            height: 180,
          },
        ],
      },
    }
  } else if ((await params).code.match(/.jpg|.jpeg|.png|.gif/)) {
    metadata = {
      ...metadata,
      twitter: {
        card: "summary_large_image",
        siteId: (await params).code,
        title: (await params).code,
        site: process.env.NAME,
        creator: process.env.AUTHOR,
        creatorId: process.env.AUTHOR_ID,
        description: `Original Filename: ${fileName}`,
        images: `${RAW_URL}${(await params).code}`,
      },
    }
  }

  return metadata
}

export default async function Page({ params }: Props) {
  if (!fs.existsSync(path.join(process.cwd(), "files", (await params).code))) {
    return notFound()
  }

  const downloadURL = `${DOWNLOAD_URL}${(await params).code}`
  const rawURL = `${RAW_URL}${(await params).code}`
  const fileExtension = path.extname((await params).code)
  const cleanedFileExtension = fileExtension.replace(".", "")

  switch (cleanedFileExtension) {
    case "jpg":
    case "jpeg":
    case "webp":
    case "svg":
    case "png":
    case "gif": {
      const fileDir = path.join(process.cwd(), "files", (await params).code)
      const file = fs.readdirSync(fileDir)
      const fileName = file[0]

      const imageSizeData = imageSize(path.join(fileDir, fileName))

      return (
        <>
          <Image
            src={downloadURL}
            alt={(await params).code}
            className="w-full h-full object-contain"
            width={imageSizeData.width}
            height={imageSizeData.height}
          />
        </>
      )
    }
    case "mp4":
    case "mkv":
      return (
        <>
          <video className="w-full h-full object-contain" controls>
            <source src={downloadURL} type="video/mp4" />
            <track
              src={`${downloadURL}.vtt`}
              kind="captions"
              srcLang="en"
              label="English"
              default
            />
          </video>
        </>
      )
    case "wav":
    case "mp3":
    case "ogg":
      return (
        <>
          <audio className="w-full h-full object-contain" controls>
            <source src={downloadURL} />
            <track
              src={`${downloadURL}.vtt`}
              kind="captions"
              srcLang="en"
              label="English"
              default
            />
          </audio>
        </>
      )
    case "txt":
      return (
        <>
          <div className="w-full h-full object-contain">
            <iframe
              src={rawURL}
              className="w-full h-full"
              title="File Content"
            />
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
