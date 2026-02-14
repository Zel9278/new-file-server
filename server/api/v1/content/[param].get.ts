import { promises as fs } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'param')
  
  if (!param) {
    throw createError({
      statusCode: 400,
      message: 'Missing file code',
    })
  }

  const config = useRuntimeConfig()
  const filesDir = config.filesDir || path.join(process.cwd(), 'files')
  const fileDir = path.join(filesDir, param)

  try {
    const files = await fs.readdir(fileDir)
    const fileName = files.find(f => f !== 'thumbnail.png')
    
    if (!fileName) {
      throw createError({
        statusCode: 404,
        message: 'File not found',
      })
    }

    const filePath = path.join(fileDir, fileName)
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      content,
      fileName,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 404,
      message: 'File not found',
    })
  }
})
