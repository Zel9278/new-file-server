<template>
  <div class="scalar-wrapper">
    <div class="scalar-header">
      <NuxtLink to="/" class="btn btn-ghost btn-sm">
        ← Back to Home
      </NuxtLink>
    </div>
    <iframe 
      :src="iframeSrc" 
      class="scalar-iframe"
      title="API Documentation"
    />
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

// Use a dedicated HTML file for the Scalar iframe content
const iframeSrc = '/api-doc/iframe.html'

definePageMeta({
  layout: false,
})

useHead({
  title: `API Documentation - ${runtimeConfig.public.name}`,
})
</script>

<style scoped>
.scalar-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.scalar-header {
  padding: 0.5rem 1rem;
  background: oklch(var(--b1));
  border-bottom: 1px solid oklch(var(--b3));
}

.scalar-iframe {
  flex: 1;
  width: 100%;
  border: none;
}
</style>
