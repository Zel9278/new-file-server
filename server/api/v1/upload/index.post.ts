import path from "node:path"
import fs from "node:fs/promises"
import { DateTime } from "luxon"
import { spawn } from "node:child_process"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (getHeader(event, "Authorization") !== config.authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  }

  try {
    const form = await readMultipartFormData(event)
    
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No file found",
      })
    }

    const fileField = form.find(f => f.name === 'file')
    
    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "No file found",
      })
    }

    const fileName =
      fileField.filename ||
      `${DateTime.now().toFormat("yyyy-MM-dd_HH-mm-ss")}`

    const filesDir = config.filesDir || path.join(process.cwd(), "files")

    return await tryNewFile(fileName, filesDir, fileField.data, config.public.url)
  } catch (error: unknown) {
    console.log(error)
    
    // If it's already a H3Error, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: "Error",
    })
  }
})

async function tryNewFile(
  fileName: string,
  filesDir: string,
  bufferStream: Buffer,
  baseUrl: string,
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
      url = `${baseUrl}/files/${fileCode}`

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

    return url
  } catch (error) {
    console.log(error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error",
    })
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
