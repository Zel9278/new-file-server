<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <Navbar />
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
