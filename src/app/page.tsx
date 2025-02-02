import Link from "next/link"
import Progressbar from "@/components/ProgressBar"
import { check } from "diskusage"
import byteToData from "@/utils/byteToData"

async function getStrageUsage(): Promise<{
  usage: number
  total: number
  used: number
  free: number
}> {
  const { free, total } = await check(process.cwd())

  const used = total - free
  const usage = Math.round((used / total) * 100)

  return { usage, total, used, free }
}

export default async function Home() {
  const { usage, total, used, free } = await getStrageUsage()

  return (
    <>
      <div className="flex justify-center items-center flex-col gap-2 w-auto h-full">
        <h1 className="text-4xl">{process.env.NAME}</h1>
        <p>{process.env.DESCRIPTION}</p>
        <div className="flex gap-2">
          <Link href="/pages/1">
            <button type="button" className="btn btn-success">
              File List
            </button>
          </Link>
          <Link href="/info">
            <button type="button" className="btn btn-success">
              Info
            </button>
          </Link>
          <Link href="/api-doc">
            <button type="button" className="btn btn-success">
              API Doc
            </button>
          </Link>
        </div>
        <div>
          <h2>Storage Usage</h2>
          <div className="flex items-center">
            <Progressbar value={usage} className="w-full mx-2" />
            <p>{usage}%</p>
          </div>
          <p>
            {byteToData(used)} / {byteToData(total)} | {byteToData(free)} free
          </p>
        </div>
      </div>
    </>
  )
}
