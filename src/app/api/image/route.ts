import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")
    const width = Number.parseInt(searchParams.get("width") || "0")
    const height = Number.parseInt(searchParams.get("height") || "0")
    const quality = Number.parseInt(searchParams.get("quality") || "75")

    if (!imageUrl) {
      return new NextResponse("Missing URL parameter", { status: 400 })
    }

    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    let image = sharp(Buffer.from(imageBuffer))

    if (width || height) {
      image = image.resize(width || null, height || null, {
        fit: "contain",
        withoutEnlargement: true,
      })
    }

    const optimizedImage = await image.webp({ quality }).toBuffer()

    return new NextResponse(optimizedImage, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
