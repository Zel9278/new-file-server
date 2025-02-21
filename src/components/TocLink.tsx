"use client"

import Link from "next/link"

type TocLinkProps = {
  num: string
  text: string
  heading: string
}

export default function TocLink({ num, text, heading }: TocLinkProps) {
  const closeToc = () => {
    const drawer = document.getElementById(
      "table-of-contents",
    ) as HTMLInputElement
    if (drawer) {
      drawer.checked = false
    }
  }

  return (
    <Link
      href={`#i-${num}`}
      className="hover:underline hover:text-primary transition-colors duration-200 py-1"
      onClick={closeToc}
    >
      <span className="text-base-content/70">{text} </span>
      {heading}
    </Link>
  )
}
