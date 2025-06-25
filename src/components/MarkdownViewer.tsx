import { getPostData } from "@/utils/markdown"
import { notFound } from "next/navigation"
import MarkdownRenderer from "./MarkdownRenderer"

type MarkdownProps = {
  id: string
}

export default async function Markdown({ id }: MarkdownProps) {
  const postData = await getPostData(id)

  if (!postData) {
    return notFound()
  }

  return (
    <MarkdownRenderer
      processedContent={postData.processedContent}
      index={postData.index}
      indexNumbered={postData.indexNumbered}
    />
  )
}
