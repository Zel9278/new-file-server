<template>
  <header class="sticky top-0 bg-base-100 z-50">
    <div class="navbar shadow-lg">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li><NuxtLink to="/pages/1">Files</NuxtLink></li>
            <li><NuxtLink to="/info">Info</NuxtLink></li>
            <li><NuxtLink to="/api-doc">API</NuxtLink></li>
          </ul>
        </div>
        <NuxtLink to="/" class="btn btn-ghost text-xl">{{ config.public.name }}</NuxtLink>
      </div>
      <div class="navbar-center relative">
        <div class="flex items-center">
          <input
            v-model="search"
            type="text"
            placeholder="Search..."
            class="input input-primary input-sm sm:input-md w-32 sm:w-auto"
            @focus="isFocused = true"
            @blur="handleBlur"
          />
          <button
            v-if="search"
            class="btn btn-ghost btn-circle btn-sm ml-1"
            type="reset"
            @click="search = ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Clear search</title>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Search Results Dropdown -->
        <div
          v-if="search && isFocused"
          class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 sm:w-96 max-h-96 overflow-y-auto bg-base-300 border-2 border-base-content rounded-2xl z-50"
        >
          <div v-if="isLoading" class="p-4 text-center">
            <span class="loading loading-infinity loading-xl"></span>
          </div>
          <div v-else-if="searchError || !searchResults?.length" class="p-2 text-error text-center">
            No results found for "{{ search }}"
          </div>
          <template v-else>
            <NuxtLink
              v-for="result in searchResults"
              :key="result.code"
              :to="`/files/${result.code}`"
              class="block p-2 hover:text-info hover:bg-base-200"
            >
              <p class="flex flex-wrap gap-1">
                <span v-html="highlightSearch(result.code)"></span>
                <span>(</span>
                <span v-html="highlightSearch(result.rawName)"></span>
                <span>)</span>
              </p>
            </NuxtLink>
          </template>
        </div>
      </div>
      <div class="navbar-end hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><NuxtLink to="/pages/1">Files</NuxtLink></li>
          <li><NuxtLink to="/info">Info</NuxtLink></li>
          <li><NuxtLink to="/api-doc">API</NuxtLink></li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { FileInfoWithSearch } from '~/types/fileserver'

const config = useRuntimeConfig()
const search = ref('')
const isFocused = ref(false)
const searchResults = ref<FileInfoWithSearch[]>([])
const isLoading = ref(false)
const searchError = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const doSearch = async (query: string) => {
  if (!query || query.length === 0) {
    searchResults.value = []
    isLoading.value = false
    searchError.value = false
    return
  }
  
  isLoading.value = true
  searchError.value = false
  
  try {
    const results = await $fetch<FileInfoWithSearch[]>(`/api/v1/search`, {
      query: { q: query }
    })
    searchResults.value = results || []
    searchError.value = false
  } catch (e: any) {
    console.error('Search error:', e)
    searchError.value = true
    searchResults.value = []
  }
  
  isLoading.value = false
}

watch(search, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    doSearch(val)
  }, 300)
})

const handleBlur = () => {
  // Delay to allow click on search results
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightSearch = (text: string) => {
  if (!search.value) return text
  const escaped = escapeRegExp(search.value)
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<span class="bg-blue-500/65 font-bold">$1</span>')
}
</script>
