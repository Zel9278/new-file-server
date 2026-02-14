<template>
  <div class="overflow-x-auto">
    <table class="table table-sm">
      <thead>
        <tr class="bg-base-200">
          <th class="w-12"></th>
          <th>Filename</th>
          <th class="hidden sm:table-cell w-24 text-right">Size</th>
          <th class="hidden md:table-cell w-32">Date</th>
          <th class="hidden sm:table-cell w-20 text-right">DL</th>
          <th class="w-32">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="file in files" 
          :key="file.code"
          class="hover:bg-base-200 cursor-pointer transition-colors"
          @click="navigateTo(`/files/${file.code}`)"
        >
          <!-- File type icon -->
          <td class="p-2">
            <div class="w-8 h-8 rounded flex items-center justify-center" :class="getFileIconBg(file.rawName)">
              <component :is="getFileIcon(file.rawName)" class="w-4 h-4" />
            </div>
          </td>
          
          <!-- Filename -->
          <td>
            <div class="flex flex-col">
              <span class="font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]" :title="file.rawName">
                {{ file.rawName }}
              </span>
              <span class="text-xs opacity-50 sm:hidden">{{ file.size }} · {{ file.ago || file.date }}</span>
            </div>
          </td>
          
          <!-- Size -->
          <td class="hidden sm:table-cell text-right font-mono text-xs">{{ file.size }}</td>
          
          <!-- Date -->
          <td class="hidden md:table-cell">
            <span class="text-xs opacity-70">{{ file.ago || file.date }}</span>
          </td>
          
          <!-- Downloads -->
          <td class="hidden sm:table-cell text-right">
            <span class="badge badge-ghost badge-sm">{{ file.downloads }}</span>
          </td>
          
          <!-- Actions -->
          <td>
            <div class="flex gap-1">
              <a
                class="btn btn-ghost btn-xs"
                :href="`/api/v1/info/${file.code}`"
                @click.stop
                title="Info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>
              <a
                class="btn btn-ghost btn-xs"
                :href="`/api/v1/download/${file.code}`"
                @click.stop
                title="Download"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <NuxtLink 
                class="btn btn-primary btn-xs" 
                :to="`/files/${file.code}`"
                @click.stop
              >
                View
              </NuxtLink>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

export interface ShortFileInfoType {
  rawName: string
  code: string
  size: string
  rawSize: number
  date: string
  ago: string | null
  downloads: number
}

defineProps<{
  files: ShortFileInfoType[]
}>()

// Icon components
const ImageIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })
])

const VideoIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })
])

const AudioIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' })
])

const DocumentIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
])

const ArchiveIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' })
])

const CodeIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' })
])

const FileIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' })
])

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return ImageIcon
  if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'].includes(ext)) return VideoIcon
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) return AudioIcon
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return DocumentIcon
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return ArchiveIcon
  if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'vue', 'jsx', 'tsx'].includes(ext)) return CodeIcon
  
  return FileIcon
}

const getFileIconBg = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'bg-success/20 text-success'
  if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'].includes(ext)) return 'bg-error/20 text-error'
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) return 'bg-warning/20 text-warning'
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return 'bg-info/20 text-info'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'bg-secondary/20 text-secondary'
  if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'vue', 'jsx', 'tsx'].includes(ext)) return 'bg-primary/20 text-primary'
  
  return 'bg-base-300 text-base-content'
}
</script>
