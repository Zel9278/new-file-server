<template>
  <div class="w-full min-h-[80vh] bg-base-200">
    <div v-if="pending" class="flex items-center justify-center h-full min-h-[60vh]">
      <span class="loading loading-infinity loading-xl" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center h-full min-h-[60vh]">
      <p class="text-error">Failed to load content</p>
    </div>
    
    <div v-else class="p-4 overflow-auto">
      <pre class="whitespace-pre-wrap break-words font-mono text-sm bg-base-300 p-4 rounded-lg">{{ content?.content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  code: string
}>()

const { data: content, pending, error } = await useFetch(`/api/v1/content/${props.code}`)
</script>
