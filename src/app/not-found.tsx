"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function NotFound() {
  const pathname = usePathname()
  const [text, setText] = useState("")

  useEffect(() => {
    const texts = [
      "Error: Page load failed",
      "",
      "Description:",
      "The requested page could not be loaded.",
      "",
      "Details:",
      "Error Code: 404",
      "Error Type: Page Not Found",
      "Error Message: The requested page could not be found.",
      "",
      "5 Seconds to Home",
    ]

    async function run() {
      for (const line of texts) {
        setText((text) => `${text + line}\n`)
        await sleep(Math.random() * (200 - 10) + 10)
      }

      await sleep(5000)
      window.location.href = "/"
    }

    run()
  }, [])

  return (
    <div>
      <pre>{`User> curl f.c30.life${pathname}`}</pre>
      <pre>{text}</pre>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
