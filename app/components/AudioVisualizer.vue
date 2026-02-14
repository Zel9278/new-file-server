<template>
  <div class="w-full h-full flex flex-col relative overflow-hidden">
    <!-- Visualizer Canvas -->
    <div class="flex-grow relative min-h-0">
      <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
    </div>
    
    <!-- Custom Audio Controls -->
    <div class="bg-base-300 p-4 space-y-3 flex-shrink-0">
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
        
        <!-- Right: Volume Control -->
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
        </div>
      </div>
    </div>
    
    <!-- Hidden Audio Element -->
    <audio
      ref="audioRef"
      :src="audioURL"
      @play="handlePlay"
      @pause="handlePause"
      @timeupdate="updateTime"
      @progress="updateBuffer"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  audioURL: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const progressBarRef = ref<HTMLElement | null>(null)
const audioContextRef = ref<AudioContext | null>(null)
const sourceRef = ref<MediaElementAudioSourceNode | null>(null)
const analyser = ref<AnalyserNode | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const buffered = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const playbackRate = ref('1')
const isSeeking = ref(false)
const seekingPercent = ref(0)
let animationFrameId: number | null = null

// Load saved volume from localStorage
onMounted(() => {
  const savedVolume = localStorage.getItem('audioPlayerVolume')
  const savedMuted = localStorage.getItem('audioPlayerMuted')
  
  if (savedVolume !== null) {
    volume.value = parseFloat(savedVolume)
  }
  if (savedMuted !== null) {
    isMuted.value = savedMuted === 'true'
  }
})

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
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
  if (!audioRef.value) return
  
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    await initAudioContext()
    await audioRef.value.play()
  }
}

const getSeekPercent = (e: MouseEvent) => {
  if (!progressBarRef.value) return 0
  const rect = progressBarRef.value.getBoundingClientRect()
  return Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
}

const seekFromClick = (e: MouseEvent) => {
  if (!audioRef.value || !duration.value) return
  const percent = getSeekPercent(e)
  audioRef.value.currentTime = (percent / 100) * duration.value
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
  if (isSeeking.value && audioRef.value && duration.value) {
    const percent = getSeekPercent(e)
    audioRef.value.currentTime = (percent / 100) * duration.value
    currentTime.value = audioRef.value.currentTime
  }
  isSeeking.value = false
  document.removeEventListener('mousemove', onSeekMove)
  document.removeEventListener('mouseup', onSeekEnd)
}

const seek = (e: Event) => {
  if (!audioRef.value) return
  const target = e.target as HTMLInputElement
  audioRef.value.currentTime = parseFloat(target.value)
}

const skipForward = () => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.min(audioRef.value.currentTime + 10, duration.value)
}

const skipBackward = () => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.max(audioRef.value.currentTime - 10, 0)
}

const toggleMute = () => {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
  localStorage.setItem('audioPlayerMuted', String(isMuted.value))
}

const updateVolume = () => {
  if (!audioRef.value) return
  audioRef.value.volume = volume.value
  localStorage.setItem('audioPlayerVolume', String(volume.value))
  if (volume.value > 0) {
    isMuted.value = false
    audioRef.value.muted = false
    localStorage.setItem('audioPlayerMuted', 'false')
  }
}

const updatePlaybackRate = () => {
  if (!audioRef.value) return
  audioRef.value.playbackRate = parseFloat(playbackRate.value)
}

const updateTime = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  
  // Update buffered amount
  if (audioRef.value.buffered.length > 0) {
    buffered.value = audioRef.value.buffered.end(audioRef.value.buffered.length - 1)
  }
}

const updateBuffer = () => {
  if (!audioRef.value) return
  if (audioRef.value.buffered.length > 0) {
    buffered.value = audioRef.value.buffered.end(audioRef.value.buffered.length - 1)
  }
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
  
  // Apply saved volume settings
  audioRef.value.volume = volume.value
  audioRef.value.muted = isMuted.value
}

const onEnded = () => {
  isPlaying.value = false
}

const initAudioContext = async () => {
  if (!audioRef.value || !canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  try {
    if (!audioContextRef.value) {
      audioContextRef.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioContextRef.value.state === 'suspended') {
      await audioContextRef.value.resume()
    }

    if (!sourceRef.value && audioContextRef.value) {
      const source = audioContextRef.value.createMediaElementSource(audioRef.value)
      const newAnalyser = audioContextRef.value.createAnalyser()
      newAnalyser.fftSize = 2048

      source.connect(newAnalyser)
      newAnalyser.connect(audioContextRef.value.destination)

      sourceRef.value = source
      analyser.value = newAnalyser
    }
  } catch (error) {
    console.error('Audio initialization failed:', error)
  }
}

const handlePlay = async () => {
  await initAudioContext()
  isPlaying.value = true
}

const handlePause = () => {
  isPlaying.value = false
}

const drawWaveform = () => {
  if (!canvasRef.value || !analyser.value || !isPlaying.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  // Use frequency data for bar visualization
  analyser.value.fftSize = 256
  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!isPlaying.value || !analyser.value) {
      return
    }
    
    animationFrameId = requestAnimationFrame(draw)
    analyser.value.getByteFrequencyData(dataArray)

    // Clear background
    ctx.fillStyle = 'rgb(15, 23, 42)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw bars - use only useful frequency range (skip very high frequencies)
    const barCount = 64
    const barWidth = canvas.width / barCount
    const gap = 2
    const usefulBins = Math.floor(bufferLength * 0.75) // Use 75% of frequency bins
    
    for (let i = 0; i < barCount; i++) {
      // Linear mapping across useful frequency range
      const dataIndex = Math.floor((i / barCount) * usefulBins)
      const barHeight = (dataArray[dataIndex] / 255) * canvas.height * 0.9
      
      const x = i * barWidth
      const y = canvas.height - barHeight
      
      ctx.fillStyle = 'rgb(34, 197, 94)'
      ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight)
    }
  }

  draw()
}

watch(isPlaying, (playing) => {
  if (playing) {
    drawWaveform()
  } else if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})

const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.offsetWidth
    canvasRef.value.height = canvasRef.value.offsetHeight
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      canvasRef.value.width = canvasRef.value.offsetWidth
      canvasRef.value.height = canvasRef.value.offsetHeight
      
      // Simple dark background
      ctx.fillStyle = 'rgb(15, 23, 42)'
      ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  if (sourceRef.value) {
    sourceRef.value.disconnect()
    sourceRef.value = null
  }
  
  if (analyser.value) {
    analyser.value.disconnect()
    analyser.value = null
  }
  
  if (audioContextRef.value) {
    audioContextRef.value.close()
    audioContextRef.value = null
  }
})
</script>
