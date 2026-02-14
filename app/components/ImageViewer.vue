<template>
  <div
    ref="containerRef"
    class="relative overflow-hidden cursor-move select-none"
    :style="{
      height: 'calc(var(--vh, 1vh) * 100)',
      touchAction: 'none',
      overscrollBehavior: 'none',
    }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @dblclick="handleDoubleClick"
  >
    <div class="absolute inset-0 flex items-center justify-center">
      <img
        :src="src"
        :alt="alt"
        class="object-contain"
        :style="{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          imageRendering: 'pixelated',
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
        }"
        draggable="false"
      />
    </div>
    <div class="absolute top-0 right-0 p-2 bg-black bg-opacity-50 text-white">
      {{ zoomPercentage }}%
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  width?: number
  height?: number
}

defineProps<Props>()

const containerRef = ref<HTMLDivElement | null>(null)
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const initialPos = ref({ x: 0, y: 0 })
const zoomPercentage = ref(100)
const lastTouchDistance = ref<number | null>(null)

// Set viewport height variable
onMounted(() => {
  const setVh = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  setVh()
  window.addEventListener('resize', setVh)
  onUnmounted(() => window.removeEventListener('resize', setVh))
})

function handleWheel(e: WheelEvent) {
  if (e.cancelable) {
    e.preventDefault()
  }
  
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const delta = e.deltaY

  const scaleFactor = delta > 0 ? 0.9 : 1.1
  const newScale = Math.min(Math.max(scale.value * scaleFactor, 0.05), 100)

  const newZoomPercentage = Math.round(newScale * 100)
  zoomPercentage.value = newZoomPercentage

  offset.value = {
    x: mouseX - rect.width / 2 - (mouseX - rect.width / 2 - offset.value.x) * (newScale / scale.value),
    y: mouseY - rect.height / 2 - (mouseY - rect.height / 2 - offset.value.y) * (newScale / scale.value),
  }
  scale.value = newScale
}

function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  e.preventDefault()
  
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  
  isDragging.value = true
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  initialPos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  const deltaX = mouseX - initialPos.value.x
  const deltaY = mouseY - initialPos.value.y
  
  // Stop dragging if mouse leaves container
  if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
    isDragging.value = false
    return
  }
  
  offset.value = {
    x: offset.value.x + deltaX,
    y: offset.value.y + deltaY,
  }
  initialPos.value = { x: mouseX, y: mouseY }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    isDragging.value = true
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    initialPos.value = {
      x: e.touches[0]!.clientX - rect.left,
      y: e.touches[0]!.clientY - rect.top,
    }
  } else if (e.touches.length === 2) {
    const touch1 = e.touches[0]!
    const touch2 = e.touches[1]!
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    lastTouchDistance.value = distance
  }
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  
  if (e.touches.length === 1 && isDragging.value) {
    const mouseX = e.touches[0]!.clientX - rect.left
    const mouseY = e.touches[0]!.clientY - rect.top
    
    const deltaX = mouseX - initialPos.value.x
    const deltaY = mouseY - initialPos.value.y
    
    offset.value = {
      x: offset.value.x + deltaX,
      y: offset.value.y + deltaY,
    }
    initialPos.value = { x: mouseX, y: mouseY }
  } else if (e.touches.length === 2 && lastTouchDistance.value !== null) {
    const touch1 = e.touches[0]!
    const touch2 = e.touches[1]!
    
    const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left
    const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top
    
    const newDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    
    const scaleFactor = newDistance / lastTouchDistance.value
    const newScale = Math.min(Math.max(scale.value * scaleFactor, 0.05), 100)
    const newZoomPercentage = Math.round(newScale * 100)
    
    offset.value = {
      x: centerX - rect.width / 2 - (centerX - rect.width / 2 - offset.value.x) * (newScale / scale.value),
      y: centerY - rect.height / 2 - (centerY - rect.height / 2 - offset.value.y) * (newScale / scale.value),
    }
    
    zoomPercentage.value = newZoomPercentage
    scale.value = newScale
    lastTouchDistance.value = newDistance
  }
}

function handleTouchEnd() {
  isDragging.value = false
  lastTouchDistance.value = null
}

function handleDoubleClick() {
  scale.value = 1
  offset.value = { x: 0, y: 0 }
  zoomPercentage.value = 100
}
</script>
