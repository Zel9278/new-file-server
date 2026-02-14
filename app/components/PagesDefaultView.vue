<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
      <div 
        v-for="file in files" 
        :key="file.code" 
        class="card bg-base-200 shadow hover:shadow-lg transition-shadow duration-200"
      >
        <div class="card-body p-3">
          <!-- File type badge -->
          <div class="flex items-start justify-between gap-2">
            <span class="badge badge-xs" :class="getFileTypeBadgeClass(file.rawName)">
              {{ getFileExtension(file.rawName) }}
            </span>
          </div>
          
          <!-- Filename -->
          <h2 class="text-sm font-medium line-clamp-2 mt-1" :title="file.rawName">
            {{ file.rawName }}
          </h2>
          
          <!-- File info -->
          <div class="flex flex-wrap gap-x-3 text-xs opacity-60">
            <span>{{ file.size }}</span>
            <span>{{ file.downloads }} DL</span>
          </div>
          
          <!-- Action buttons -->
          <div class="flex gap-1 mt-2">
            <NuxtLink 
              :to="`/files/${file.code}`"
              class="btn btn-primary btn-xs flex-1"
            >
              View
            </NuxtLink>
            <a
              :href="`/api/v1/download/${file.code}`"
              class="btn btn-ghost btn-xs"
            >
              DL
            </a>
            <a
              :href="`/api/v1/info/${file.code}`"
              class="btn btn-ghost btn-xs"
            >
              Info
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const getFileExtension = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase() || 'FILE'
  return ext.length > 5 ? ext.slice(0, 5) : ext
}

const getFileTypeBadgeClass = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return 'badge-success'
  }
  // Videos
  if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'].includes(ext)) {
    return 'badge-error'
  }
  // Audio
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
    return 'badge-warning'
  }
  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) {
    return 'badge-info'
  }
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'badge-secondary'
  }
  // Code
  if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext)) {
    return 'badge-primary'
  }
  
  return 'badge-neutral'
}
</script>
