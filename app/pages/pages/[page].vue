<template>
  <div>
    <div v-if="pending" class="flex items-center justify-center h-full min-h-[60vh]">
      <span class="loading loading-infinity loading-xl" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center h-full min-h-[60vh]">
      <p>Failed to load</p>
    </div>
    
    <div v-else-if="data" class="flex flex-col gap-4">
      <div class="flex gap-2">
        <select
          v-model="sort"
          class="select select-xs"
          @change="updateQuery"
        >
          <option value="NameUp">Name Up</option>
          <option value="NameDown">Name Down</option>
          <option value="CodeUp">Code Up</option>
          <option value="CodeDown">Code Down</option>
          <option value="SizeUp">Size Up</option>
          <option value="SizeDown">Size Down</option>
          <option value="DownloadUp">Download Up</option>
          <option value="DownloadDown">Download Down</option>
          <option value="DateUp">Date Up</option>
          <option value="DateDown">Date Down</option>
        </select>
        
        <select
          v-model="view"
          class="select select-xs"
          @change="updateQuery"
        >
          <option value="Default">Default View</option>
          <option value="List">List View</option>
        </select>
      </div>
      
      <div class="flex flex-col gap-4 w-full h-full">
        <PagesDefaultView v-if="view === 'Default'" :files="data.filesOnPage" />
        <PagesListView v-if="view === 'List'" :files="data.filesOnPage" />
        
        <div class="join flex flex-wrap justify-center gap-1">
          <NuxtLink :to="getPageUrl(1)" class="join-item btn btn-sm sm:btn-md">
            &lt;&lt;
          </NuxtLink>
          
          <NuxtLink
            v-if="data.result.prev"
            :to="getPageUrl(data.result.prev)"
            class="join-item btn btn-sm sm:btn-md"
          >
            &lt;
          </NuxtLink>
          <span v-else class="join-item btn btn-sm sm:btn-md btn-disabled">&lt;</span>
          
          <template v-for="p in data.result.pages" :key="p">
            <span v-if="data.result.now === p" class="join-item btn btn-sm sm:btn-md btn-success">
              {{ p }}
            </span>
            <NuxtLink v-else :to="getPageUrl(p)" class="join-item btn btn-sm sm:btn-md">
              {{ p }}
            </NuxtLink>
          </template>
          
          <NuxtLink
            v-if="data.result.next"
            :to="getPageUrl(data.result.next)"
            class="join-item btn btn-sm sm:btn-md"
          >
            &gt;
          </NuxtLink>
          <span v-else class="join-item btn btn-sm sm:btn-md btn-disabled">&gt;</span>
          
          <NuxtLink :to="getPageUrl(data.result.max)" class="join-item btn btn-sm sm:btn-md">
            &gt;&gt;
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ShortFileInfo {
  rawName: string
  code: string
  size: string
  rawSize: number
  date: string
  ago: string | null
  downloads: number
}

interface PageResult {
  prev: number | null
  next: number | null
  now: number
  max: number
  pages: number[]
}

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.params.page) || 1)
const sort = ref((route.query.sort as string) || 'CodeUp')
const view = ref((route.query.view as string) || 'Default')

const { data, pending, error, refresh } = await useFetch<{
  filesOnPage: ShortFileInfo[]
  result: PageResult
}>(() => `/api/pages/${page.value}/${sort.value}`)

function getPageUrl(pageNum: number) {
  const query: Record<string, string> = {}
  if (sort.value !== 'CodeUp') query.sort = sort.value
  if (view.value !== 'Default') query.view = view.value
  return { path: `/pages/${pageNum}`, query }
}

function updateQuery() {
  router.push(getPageUrl(page.value))
  refresh()
}

watch([sort, view], () => {
  updateQuery()
})
</script>
