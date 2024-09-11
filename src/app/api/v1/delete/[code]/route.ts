import { NextRequest } from "next/server"
import path from "path"
import fs from "fs"
import discordPreloader from "@/utils/discord-preloader"

type Params = {
  code: string
}

/**
 * @swagger
 * /api/v1/delete/{code}:
 *   delete:
 *     description: Delete file
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: File code
 *         schema:
 *           type: string
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: File deleted
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "done"
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: No file found
 *       500:
 *         description: Internal Server Error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params },
) {
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    return new Response("Unauthorized", { status: 401 })
  }

  const code = params.code

  const filesDir = path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return new Response("File not found", { status: 404 })
  }

  try {
    fs.rmSync(`${filesDir}/${code}`, { recursive: true })

    discordPreloader("delete", code)

    return new Response("done")
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 })
  }
}
