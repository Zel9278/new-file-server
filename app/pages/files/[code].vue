<template>
  <div v-if="pending" class="flex items-center justify-center h-full min-h-[60vh]">
    <span class="loading loading-infinity loading-xl" />
  </div>
  
  <div v-else-if="error || !fileInfo" class="flex justify-center items-center flex-col gap-2 w-auto h-full min-h-[60vh]">
    <p>File not found</p>
    <NuxtLink to="/" class="btn btn-primary">Go Home</NuxtLink>
  </div>
  
  <template v-else>
    <!-- Image Viewer -->
    <ImageViewer
      v-if="isImage"
      :src="rawURL"
      :alt="code"
      :width="fileInfo.width"
      :height="fileInfo.height"
    />
    
    <!-- Video Player -->
    <VideoPlayer v-else-if="isVideo" :video-u-r-l="rawURL" />
    
    <!-- Audio Player with Visualizer -->
    <AudioVisualizer v-else-if="isAudio" :audio-u-r-l="rawURL" />
    
    <!-- Markdown Viewer -->
    <MarkdownViewer v-else-if="isMarkdown" :code="code" />
    
    <!-- Text Viewer -->
    <TextViewer v-else-if="isText" :code="code" />
    
    <!-- PDF Viewer -->
    <div v-else-if="isPdf" class="w-full h-full object-contain min-h-[80vh]">
      <iframe
        :src="rawURL"
        class="w-full h-full min-h-[80vh]"
        title="File Content"
      />
    </div>
    
    <!-- Default Download View -->
    <div v-else class="flex justify-center items-center flex-col gap-2 w-auto h-full min-h-[60vh] px-4">
      <p class="text-center break-all">{{ fileInfo.rawName }}</p>
      <div class="flex gap-2 sm:gap-4 flex-wrap justify-center">
        <a class="btn btn-primary btn-sm sm:btn-md" :href="downloadURL" download>
          Download
        </a>
        <a class="btn btn-primary btn-sm sm:btn-md" :href="infoURL">
          Info
        </a>
        <a class="btn btn-primary btn-sm sm:btn-md" :href="rawURL" target="_blank" rel="noopener noreferrer">
          Raw
        </a>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
interface FileInfo {
  code: string
  url: string
  rawName: string
  type: string
  size: string
  rawSize: number
  date: string
  unixDate: number
  ago: string | null
  downloadCount: number
  checksum: string
  width?: number
  height?: number
  thumbnail?: string
}

const route = useRoute()
const config = useRuntimeConfig()

const code = computed(() => route.params.code as string)

const { data: fileInfo, pending, error } = await useFetch<FileInfo>(`/api/v1/info/${code.value}`)

const baseURL = config.public.url
const downloadURL = computed(() => `/api/v1/download/${code.value}`)
const rawURL = computed(() => `/api/v1/raw/${code.value}`)
const infoURL = computed(() => `/api/v1/info/${code.value}`)

const extension = computed(() => {
  if (!code.value) return ''
  const parts = code.value.split('.')
  if (parts.length <= 1) return ''
  const ext = parts[parts.length - 1]
  return ext?.toLowerCase() ?? ''
})

const isImage = computed(() => ['jpg', 'jpeg', 'webp', 'svg', 'png', 'gif'].includes(extension.value))
const isVideo = computed(() => ['mp4', 'mov', 'avi', 'webm'].includes(extension.value))
const isAudio = computed(() => ['wav', 'mp3', 'ogg'].includes(extension.value))
const isMarkdown = computed(() => ['md', 'markdown'].includes(extension.value))
const isText = computed(() => ['txt', 'log', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd', 'js', 'ts', 'jsx', 'tsx', 'vue', 'svelte', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'py', 'rb', 'php', 'java', 'kt', 'swift', 'go', 'rs', 'c', 'cpp', 'h', 'hpp', 'cs', 'fs', 'lua', 'r', 'sql', 'graphql', 'dockerfile', 'makefile', 'cmake', 'gradle', 'env', 'gitignore', 'gitattributes', 'editorconfig'].includes(extension.value))
const isPdf = computed(() => extension.value === 'pdf')

// Meta tags for social media
useHead(() => {
  const file = fileInfo.value
  if (!file) return {}
  
  const meta: any[] = [
    { property: 'og:site_name', content: config.public.name },
    { property: 'og:title', content: code.value },
    { property: 'og:description', content: `Original Filename: ${file.rawName}` },
    { property: 'og:image', content: file.thumbnail || rawURL.value },
  ]
  
  if (isVideo.value) {
    meta.push(
      { name: 'twitter:card', content: 'player' },
      { name: 'twitter:title', content: code.value },
      { name: 'twitter:description', content: `Original Filename: ${file.rawName}` },
      { name: 'twitter:image', content: file.thumbnail || rawURL.value },
    )
  } else if (isImage.value) {
    meta.push(
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: code.value },
      { name: 'twitter:description', content: `Original Filename: ${file.rawName}` },
      { name: 'twitter:image', content: rawURL.value },
    )
  }
  
  return {
    title: code.value,
    meta,
  }
})
</script>
