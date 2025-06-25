import type { NextRequest } from "next/server"
import discordPreloader from "@/utils/discord-preloader"
import path from "node:path"
import fs from "node:fs/promises"
import { DateTime } from "luxon"
import { spawn } from "node:child_process"
import { cacheCheckSum } from "@/utils/cacheCheckSum"

export async function POST(request: NextRequest) {
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const form = await request.formData()
    const file = form.get("file") as Blob | null

    const fileData = form.get("file") as {
      name: string
      size: number
      type: string
      lastModified: number
    }

    if (!file || !fileData) {
      return new Response("No file found", { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const bufferStream = new Uint8Array(buffer)
    const fileName =
      fileData.name?.toString() ||
      `${DateTime.now().toFormat("yyyy-MM-dd_HH-mm-ss")}`

    const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

    return tryNewFile(fileName, filesDir, bufferStream)
  } catch (error) {
    console.log(error)
    return new Response("Error", { status: 500 })
  }
}

async function tryNewFile(
  fileName: string,
  filesDir: string,
  bufferStream: Uint8Array,
) {
  try {
    let fileCode: string
    let fileDir: string
    let filePath: string
    let url: string
    let extName: string

    while (true) {
      extName = path.extname(fileName)
      fileCode = Math.random().toString(36).slice(2, 6) + extName
      fileDir = path.join(filesDir, fileCode)
      filePath = path.join(fileDir, fileName)
      url = `${process.env.URL}/files/${fileCode}`

      try {
        await fs.access(fileDir)
        console.log("File exists, trying again")
      } catch {
        break
      }
    }

    await fs.mkdir(fileDir, { recursive: true })
    await fs.writeFile(filePath, bufferStream)

    if (
      extName === ".mp4" ||
      extName === ".webm" ||
      extName === ".mov" ||
      extName === ".avi" ||
      extName === ".mkv"
    ) {
      await generateThumbnail(filePath, path.join(fileDir, "thumbnail.png"))
    }

    cacheCheckSum(filePath)
    discordPreloader("upload", url)

    return new Response(url, { status: 200 })
  } catch (error) {
    console.log(error)
    return new Response("Error", { status: 500 })
  }
}

/**
 * Generate thumbnail for video file using ffmpeg
 * @param inputPath - Path to the input video file
 * @param outputPath - Path to save the thumbnail
 */
async function generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn('ffmpeg', [
      '-i', inputPath,                    // Input file
      '-ss', '00:00:01',                  // Seek to 1 second (instead of 50%)
      '-vframes', '1',                    // Extract one frame
      '-q:v', '2',                        // High quality
      '-y',                               // Overwrite output file
      outputPath                          // Output file
    ])

    ffmpegProcess.stderr.on('data', (data) => {
      // FFmpeg outputs progress info to stderr, so we don't treat it as error unless process fails
      console.log(`ffmpeg stderr: ${data}`)
    })

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Thumbnail generated successfully: ${outputPath}`)
        resolve()
      } else {
        console.error(`ffmpeg process exited with code ${code}`)
        reject(new Error(`ffmpeg process exited with code ${code}`))
      }
    })

    ffmpegProcess.on('error', (error) => {
      console.error(`ffmpeg spawn error: ${error}`)
      reject(error)
    })
  })
}
