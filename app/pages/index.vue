<template>
  <div class="flex justify-center items-center flex-col gap-4 w-auto h-full min-h-[60vh] px-4">
    <h1 class="text-2xl sm:text-4xl text-center">{{ config.public.name }}</h1>
    <p class="text-sm sm:text-base text-center">{{ config.public.description }}</p>
    <div class="flex gap-2 sm:gap-4 flex-wrap justify-center">
      <NuxtLink to="/pages/1" class="btn btn-success btn-sm sm:btn-md">
        File List
      </NuxtLink>
      <NuxtLink to="/info" class="btn btn-success btn-sm sm:btn-md">
        Info
      </NuxtLink>
      <NuxtLink to="/api-doc" class="btn btn-success btn-sm sm:btn-md">
        API Docs
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>
