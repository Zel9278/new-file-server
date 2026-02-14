<template>
  <div class="flex justify-center items-center flex-col gap-2 w-auto h-full min-h-[60vh]">
    <h1 class="text-4xl">404</h1>
    <p>{{ error?.statusMessage || 'Page not found' }}</p>
    <NuxtLink to="/" class="btn btn-primary">Go Home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error?: {
    statusCode: number
    statusMessage: string
  }
}>()
</script>
