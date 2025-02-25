import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import rehypeStringify from "rehype-stringify"
import remarkHTML from "remark-html"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified, type Plugin } from "unified"
import type { Root, Element } from "hast"
import { visit } from "unist-util-visit"
import rehypeHighlight from "rehype-highlight"
import remarkLinkCard from "remark-link-card-plus"

export type Headings = (string | Headings)[]

interface StackItem {
  level: number
  children: Headings
}

const linkProcessor: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (
        node.tagName === "img" &&
        node.properties &&
        typeof node.properties.src === "string"
      ) {
        const src = node.properties.src
        const proxyUrl = `https://f.c30.life/api/image?url=${src}`

        node.properties = {
          ...node.properties,
          src: proxyUrl,
          "data-original-src": src,
          class: "cursor-pointer transition-transform hover:scale-[1.02]",
          "data-viewer": "true",
        }
      }

      if (
        node.tagName === "a" &&
        node.properties &&
        typeof node.properties.href === "string"
      ) {
        node.properties.class = "text-blue-400 hover:underline"
      }
    })
  }
}

const turnMarkdownToHtml = async (markdown: string): Promise<string> => {
  const parsed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(linkProcessor)
    .use(remarkHTML)
    .use(remarkLinkCard, { cache: true, shortenUrl: true })
    .use(headingLinker)
    .use(rehypeHighlight)
    .use(rehypeStringify, {
      allowDangerousHtml: true,
    })
    .process(markdown)

  return parsed.toString()
}

const turnMarkdownToHtmlSync = (markdown: string): string => {
  const parsed = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(remarkHTML)
    .use(rehypeStringify, {
      allowDangerousHtml: true,
    })
    .use(headingLinker)
    .processSync(markdown)

  return parsed.toString()
}

export async function getPostData(code: string) {
  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return null
  }

  const fileDir = fs
    .readdirSync(`${filesDir}/${code}`)
    .filter((file) => file !== "thumbnail.png")[0]

  const fileContents = fs.readFileSync(
    path.join(filesDir, code, fileDir),
    "utf8",
  )
  const matterResult = matter(fileContents)
  const processedContent = await turnMarkdownToHtml(matterResult.content)

  let index: Headings = []
  let indexNumbered: Headings = []
  const headings = matterResult.content.split("\n")

  if (headings) {
    index = makeToc(matterResult.content)
    indexNumbered = makeTocNumbered(matterResult.content)
  }

  const data = {
    code,
    processedContent,
    index,
    indexNumbered,
    ...(matterResult.data as { date: string; title: string }),
  }

  return data
}

export function getPostDataSync(code: string) {
  const filesDir = process.env.FILES_DIR || path.join(process.cwd(), "files")

  if (!fs.existsSync(`${filesDir}/${code}`)) {
    return null
  }

  const fileDir = fs
    .readdirSync(`${filesDir}/${code}`)
    .filter((file) => file !== "thumbnail.png")[0]

  const fileContents = fs.readFileSync(fileDir, "utf8")
  const matterResult = matter(fileContents)
  const processedContent = turnMarkdownToHtmlSync(matterResult.content)

  let index: Headings = []
  let indexNumbered: Headings = []
  const headings = matterResult.content.split("\n")

  if (headings) {
    index = makeToc(matterResult.content)
    indexNumbered = makeTocNumbered(matterResult.content)
  }

  return {
    code,
    processedContent,
    index,
    indexNumbered,
    ...(matterResult.data as { date: string; title: string }),
  }
}

function makeToc(markdown: string): Headings {
  const lines = markdown.split("\n")
  const result: Headings = []
  const stack: StackItem[] = [{ level: 0, children: result }]

  let isCodeBlock = false

  for (const line of lines) {
    if (line.startsWith("```")) {
      isCodeBlock = !isCodeBlock
    }

    if (isCodeBlock) {
      continue
    }

    const match = line.match(/^(#{1,6})\s+(.*)$/)
    if (match) {
      const level = match[1].length
      const text = match[2]

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      const newHeading: Headings = [text]
      stack[stack.length - 1].children.push(newHeading)
      if (level < 6) {
        stack.push({ level, children: newHeading })
      }
    }
  }

  return result
}

function makeTocNumbered(markdown: string): Headings {
  const lines = markdown.split("\n")
  const result: Headings = []
  const stack: StackItem[] = [{ level: 0, children: result }]

  let isCodeBlock = false
  const counter: number[] = [0, 0, 0, 0, 0, 0]
  let num = 0

  for (const line of lines) {
    if (line.startsWith("```")) {
      isCodeBlock = !isCodeBlock
    }

    if (isCodeBlock) {
      continue
    }

    const match = line.match(/^(#{1,6})\s+(.*)$/)
    if (match) {
      num++

      const level = match[1].length

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      counter[level - 1]++
      for (let i = level; i < 6; i++) {
        counter[i] = 0
      }

      const newHeading: Headings = [
        `${counter.slice(0, level).join(".")}, ${num}`,
      ]
      stack[stack.length - 1].children.push(newHeading)
      if (level < 6) {
        stack.push({ level, children: newHeading })
      }
    }
  }

  return result
}

const headingLinker: Plugin<[], Root> = () => {
  let i = 0
  return (tree) => {
    tree.children = tree.children.map((childNode) => {
      const child = childNode as Element
      if (child.type === "element" && child.tagName.match(/^h[1-6]$/)) {
        i++
        const id = `i-${i}`
        child.properties = { ...child.properties, id }
        child.children = [
          {
            type: "element",
            tagName: "a",
            properties: {
              name: id,
              href: `#${id}`,
            },
            children: child.children,
          } as Element,
        ]
      }
      return child
    })
  }
}
