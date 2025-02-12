import Link from "next/link"

export default async function Home() {
  return (
    <>
      <div className="flex justify-center items-center flex-col gap-2 w-auto h-full">
        <h1 className="text-4xl">{process.env.NEXT_PUBLIC_NAME}</h1>
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
      </div>
    </>
  )
}
