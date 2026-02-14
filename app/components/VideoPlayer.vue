<template>
  <div 
    ref="containerRef"
    class="w-full h-full flex flex-col relative overflow-hidden bg-black"
    :class="{ 'cursor-none': isFullscreen && !showControls }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Video Element -->
    <div class="flex-grow relative min-h-0 flex items-center justify-center" @click="togglePlay">
      <video
        ref="videoRef"
        :src="videoURL"
        class="max-w-full max-h-full object-contain"
        :class="{ 'w-full h-full': isFullscreen }"
        @play="handlePlay"
        @pause="handlePause"
        @timeupdate="updateTime"
        @progress="updateBuffer"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @volumechange="onVolumeChange"
      />
      
      <!-- Play overlay when paused -->
      <div 
        v-if="!isPlaying && !isLoading"
        class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
      >
        <div class="btn btn-circle btn-lg btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </div>
      </div>
      
      <!-- Loading spinner -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/30">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    </div>
    
    <!-- Custom Video Controls -->
    <div 
      class="p-4 space-y-3 flex-shrink-0 transition-all duration-300"
      :class="controlsClass"
    >
      <!-- Progress Bar with Buffer -->
      <div class="flex items-center gap-3">
        <span class="text-xs font-mono w-12 text-right">{{ formatTime(currentTime) }}</span>
        <div 
          ref="progressBarRef"
          class="flex-grow relative h-2 cursor-pointer"
          @mousedown="startSeek"
        >
          <!-- Background -->
          <div class="absolute inset-0 bg-base-100 rounded-full" />
          <!-- Buffered -->
          <div 
            class="absolute inset-y-0 left-0 bg-gray-500 rounded-full"
            :style="{ width: `${bufferedPercent}%` }"
          />
          <!-- Progress -->
          <div 
            class="absolute inset-y-0 left-0 bg-primary rounded-full"
            :style="{ width: `${progressPercent}%` }"
          />
          <!-- Thumb -->
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-md"
            :style="{ left: `calc(${progressPercent}% - 6px)` }"
          />
        </div>
        <span class="text-xs font-mono w-12">{{ formatTime(duration) }}</span>
      </div>
      
      <!-- Controls Row -->
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Playback Controls -->
        <div class="flex items-center gap-2">
          <!-- Skip Back 10s -->
          <button class="btn btn-ghost btn-sm btn-circle" @click="skipBackward">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          
          <!-- Play/Pause -->
          <button class="btn btn-primary btn-circle" @click="togglePlay">
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <!-- Skip Forward 10s -->
          <button class="btn btn-ghost btn-sm btn-circle" @click="skipForward">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>
        
        <!-- Center: Speed Control -->
        <div class="flex items-center gap-2">
          <span class="text-xs">Speed:</span>
          <select v-model="playbackRate" class="select select-xs select-bordered" @change="updatePlaybackRate">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        
        <!-- Right: Volume & Fullscreen -->
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost btn-sm btn-circle" @click="toggleMute">
            <svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <svg v-else-if="volume < 0.5" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <input
            type="range"
            v-model="volume"
            min="0"
            max="1"
            step="0.05"
            class="range range-xs w-20"
            @input="updateVolume"
          />
          
          <!-- Fullscreen -->
          <button class="btn btn-ghost btn-sm btn-circle" @click="toggleFullscreen">
            <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  videoURL: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const progressBarRef = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const isLoading = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const buffered = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const playbackRate = ref('1')
const isFullscreen = ref(false)
const showControls = ref(true)
const isSeeking = ref(false)
const seekingPercent = ref(0)
let hideControlsTimeout: NodeJS.Timeout | null = null

// Load saved volume from localStorage
onMounted(() => {
  const savedVolume = localStorage.getItem('videoPlayerVolume')
  const savedMuted = localStorage.getItem('videoPlayerMuted')
  
  if (savedVolume !== null) {
    volume.value = parseFloat(savedVolume)
  }
  if (savedMuted !== null) {
    isMuted.value = savedMuted === 'true'
  }
  
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
})

// Computed class for controls based on fullscreen state
const controlsClass = computed(() => {
  if (isFullscreen.value) {
    return [
      'absolute bottom-0 left-0 right-0 z-10',
      'bg-black/60 backdrop-blur-sm',
      showControls.value ? 'opacity-100' : 'opacity-0 pointer-events-none'
    ]
  }
  return 'bg-base-300'
})

// Handle mouse movement to show/hide controls in fullscreen
const handleMouseMove = () => {
  if (!isFullscreen.value) return
  
  showControls.value = true
  
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
  
  hideControlsTimeout = setTimeout(() => {
    if (isPlaying.value && !isSeeking.value) {
      showControls.value = false
    }
  }, 2000)
}

const handleMouseLeave = () => {
  if (!isFullscreen.value) return
  
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
  
  if (isPlaying.value) {
    showControls.value = false
  }
}

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '0:00'
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const progressPercent = computed(() => {
  if (isSeeking.value) return seekingPercent.value
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const bufferedPercent = computed(() => {
  if (!duration.value) return 0
  return (buffered.value / duration.value) * 100
})

const togglePlay = async () => {
  if (!videoRef.value) return
  
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    await videoRef.value.play()
  }
}

const getSeekPercent = (e: MouseEvent) => {
  if (!progressBarRef.value) return 0
  const rect = progressBarRef.value.getBoundingClientRect()
  return Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
}

const seekFromClick = (e: MouseEvent) => {
  if (!videoRef.value || !duration.value) return
  const percent = getSeekPercent(e)
  videoRef.value.currentTime = (percent / 100) * duration.value
}

const startSeek = (e: MouseEvent) => {
  isSeeking.value = true
  seekingPercent.value = getSeekPercent(e)
  document.addEventListener('mousemove', onSeekMove)
  document.addEventListener('mouseup', onSeekEnd)
}

const onSeekMove = (e: MouseEvent) => {
  if (!isSeeking.value) return
  seekingPercent.value = getSeekPercent(e)
}

const onSeekEnd = (e: MouseEvent) => {
  if (isSeeking.value && videoRef.value && duration.value) {
    const percent = getSeekPercent(e)
    videoRef.value.currentTime = (percent / 100) * duration.value
    currentTime.value = videoRef.value.currentTime
  }
  isSeeking.value = false
  document.removeEventListener('mousemove', onSeekMove)
  document.removeEventListener('mouseup', onSeekEnd)
}

const skipForward = () => {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.min(videoRef.value.currentTime + 10, duration.value)
}

const skipBackward = () => {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.max(videoRef.value.currentTime - 10, 0)
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
  localStorage.setItem('videoPlayerMuted', String(isMuted.value))
}

const updateVolume = () => {
  if (!videoRef.value) return
  videoRef.value.volume = volume.value
  localStorage.setItem('videoPlayerVolume', String(volume.value))
  if (volume.value > 0) {
    isMuted.value = false
    videoRef.value.muted = false
    localStorage.setItem('videoPlayerMuted', 'false')
  }
}

const updatePlaybackRate = () => {
  if (!videoRef.value) return
  videoRef.value.playbackRate = parseFloat(playbackRate.value)
}

const updateTime = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  
  if (videoRef.value.buffered.length > 0) {
    buffered.value = videoRef.value.buffered.end(videoRef.value.buffered.length - 1)
  }
}

const updateBuffer = () => {
  if (!videoRef.value) return
  if (videoRef.value.buffered.length > 0) {
    buffered.value = videoRef.value.buffered.end(videoRef.value.buffered.length - 1)
  }
}

const onLoadedMetadata = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
  isLoading.value = false
  
  // Apply saved volume settings
  videoRef.value.volume = volume.value
  videoRef.value.muted = isMuted.value
}

const onEnded = () => {
  isPlaying.value = false
}

const handlePlay = () => {
  isPlaying.value = true
  // Start hide timer when playing in fullscreen
  if (isFullscreen.value) {
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout)
    }
    hideControlsTimeout = setTimeout(() => {
      showControls.value = false
    }, 3000)
  }
}

const handlePause = () => {
  isPlaying.value = false
  // Show controls when paused
  if (isFullscreen.value) {
    showControls.value = true
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout)
    }
  }
}

const onVolumeChange = () => {
  if (!videoRef.value) return
  volume.value = videoRef.value.volume
  isMuted.value = videoRef.value.muted
}

const toggleFullscreen = async () => {
  const container = videoRef.value?.parentElement?.parentElement
  if (!container) return
  
  if (!document.fullscreenElement) {
    await container.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  
  if (isFullscreen.value) {
    // Start hide timer when entering fullscreen
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout)
    }
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying.value) {
        showControls.value = false
      }
    }, 3000)
  } else {
    // Reset controls visibility when exiting fullscreen
    showControls.value = true
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout)
    }
  }
}
</script>
