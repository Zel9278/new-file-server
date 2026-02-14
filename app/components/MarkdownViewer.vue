<template>
  <div class="w-full min-h-[80vh]">
    <div v-if="pending" class="flex items-center justify-center h-full min-h-[60vh]">
      <span class="loading loading-infinity loading-xl" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center h-full min-h-[60vh]">
      <p class="text-error">Failed to load content</p>
    </div>
    
    <div v-else class="container mx-auto">
      <div class="drawer">
        <input id="table-of-contents" type="checkbox" class="drawer-toggle" />
        
        <div class="drawer-content">
          <!-- TOC Toggle Button -->
          <label
            v-if="headings.length > 0"
            for="table-of-contents"
            class="btn bg-base-200 fixed top-20 left-0 z-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Table of Contents</title>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          
          <!-- Markdown Content -->
          <div 
            class="markdown-content prose prose-invert max-w-none p-4 sm:p-8"
            v-html="renderedContent"
          />
        </div>
        
        <!-- TOC Sidebar -->
        <div class="drawer-side z-50">
          <label for="table-of-contents" aria-label="close sidebar" class="drawer-overlay" />
          <ul class="menu relative top-16 bg-base-200 text-base-content min-h-full w-64 p-4 shadow-lg">
            <h2 class="text-lg font-bold mb-4">目次</h2>
            <li v-for="heading in headings" :key="heading.id">
              <a 
                :href="`#${heading.id}`" 
                :class="{ 'pl-4': heading.level === 2, 'pl-8': heading.level === 3, 'pl-12': heading.level >= 4 }"
                @click="closeToc"
              >
                {{ heading.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import hljs from 'highlight.js'

const props = defineProps<{
  code: string
}>()

interface Heading {
  id: string
  text: string
  level: number
}

const headings = ref<Heading[]>([])

const { data: content, pending, error } = await useFetch(`/api/v1/content/${props.code}`)

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
})

// Custom renderer for headings with IDs
const renderer = new marked.Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text.toLowerCase().replace(/[^\w]+/g, '-')
  return `<h${depth} id="${id}">${text}</h${depth}>`
}

// Custom renderer for code blocks with syntax highlighting
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
    } catch {
      // Fall through to default
    }
  }
  const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<pre><code class="hljs">${escaped}</code></pre>`
}

// Custom renderer for links
renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.use({ renderer })

const renderedContent = computed(() => {
  if (!content.value?.content) return ''
  
  const rawContent = content.value.content
  
  // Extract headings for TOC
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const extractedHeadings: Heading[] = []
  let match
  while ((match = headingRegex.exec(rawContent)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = text.toLowerCase().replace(/[^\w]+/g, '-')
    extractedHeadings.push({ id, text, level })
  }
  headings.value = extractedHeadings
  
  // Parse and sanitize markdown
  const html = marked.parse(rawContent) as string
  return DOMPurify.sanitize(html)
})

const closeToc = () => {
  const checkbox = document.getElementById('table-of-contents') as HTMLInputElement
  if (checkbox) checkbox.checked = false
}
</script>

<style>
/* Markdown styling */
.markdown-content h1 { @apply text-3xl font-bold mt-8 mb-4 pb-2 border-b border-base-300; }
.markdown-content h2 { @apply text-2xl font-bold mt-6 mb-3 pb-1 border-b border-base-300; }
.markdown-content h3 { @apply text-xl font-semibold mt-4 mb-2; }
.markdown-content h4 { @apply text-lg font-semibold mt-3 mb-2; }
.markdown-content h5 { @apply text-base font-semibold mt-2 mb-1; }
.markdown-content h6 { @apply text-sm font-semibold mt-2 mb-1; }

.markdown-content p { @apply my-4; }
.markdown-content ul { @apply list-disc list-inside my-4 pl-4; }
.markdown-content ol { @apply list-decimal list-inside my-4 pl-4; }
.markdown-content li { @apply my-1; }

.markdown-content blockquote { 
  @apply border-l-4 border-base-300 pl-4 my-4 italic opacity-70; 
}

.markdown-content pre { 
  @apply bg-base-300 p-4 rounded-lg overflow-x-auto my-4; 
}
.markdown-content code { 
  @apply bg-base-300 px-1 py-0.5 rounded text-sm font-mono; 
}
.markdown-content pre code { 
  @apply bg-transparent p-0; 
}

.markdown-content table { @apply w-full my-4 border-collapse; }
.markdown-content th { @apply border border-base-300 px-4 py-2 bg-base-200 font-semibold text-left; }
.markdown-content td { @apply border border-base-300 px-4 py-2; }

.markdown-content hr { @apply my-8 border-base-300; }

.markdown-content img { @apply max-w-full h-auto rounded-lg my-4; }

/* highlight.js theme overrides */
.hljs { @apply bg-transparent; }
</style>
