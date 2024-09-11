export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center flex-col gap-2 w-auto h-full">
        <h1 className="text-4xl">{process.env.NAME}</h1>
        <div className="flex gap-2">
          <a href="/pages/1">
            <button className="btn btn-success">File List</button>
          </a>
          <a href="/api-doc">
            <button className="btn btn-success">API Doc</button>
          </a>
        </div>
      </div>
    </>
  )
}
