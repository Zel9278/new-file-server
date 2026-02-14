<template>
  <div v-if="pending" class="flex items-center justify-center h-full min-h-[60vh]">
    <span class="loading loading-infinity loading-xl" />
  </div>
  
  <div v-else-if="error" class="flex items-center justify-center h-full min-h-[60vh]">
    <p>Failed to load</p>
  </div>
  
  <main v-else-if="data">
    <div class="card w-full bg-base-100 shadow-xl">
      <div class="card-body p-4 sm:p-8">
        <h2 class="card-title">Info</h2>
        <div class="bg-zinc-400 w-full h-0.5 rounded" />
        <ul class="px-2 sm:px-5 text-sm sm:text-base">
          <li class="break-all">ホスト: {{ data.host }}</li>
          <li>オーナー: {{ data.owner }}</li>
          <li class="break-all">実行ユーザー: {{ data.runningAs }}</li>
          <li class="break-all">ファイルを置いてる場所: {{ data.filesDir }}</li>

          <li class="bg-zinc-500 w-full h-0.5 rounded my-1" />

          <li>このサイトバージョン: {{ data.thisVersion }}</li>
          <li>Node.jsのバージョン: {{ data.nodeVersion }}</li>
          <li>pnpmのバージョン: {{ data.pnpmVersion.replace("pnpm@", "") }}</li>

          <li class="bg-zinc-500 w-full h-0.5 rounded my-1" />

          <li>ストレージ: {{ data.storage.formatted }}</li>
          <li>
            <div class="flex items-center">
              <progress 
                class="progress progress-primary w-full" 
                :value="data.storage.usage" 
                max="100"
              />
              <span class="ml-2">{{ data.storage.usage }}%</span>
            </div>
          </li>

          <li class="bg-zinc-500 w-full h-0.5 rounded my-1" />

          <li>
            Sitemap:
            <a
              href="/sitemap.xml"
              class="link link-primary link-hover underline"
              target="_blank"
            >
              sitemap.xml
            </a>
          </li>
          <li>
            Robots:
            <a
              href="/robots.txt"
              class="link link-primary link-hover underline"
              target="_blank"
            >
              robots.txt
            </a>
          </li>
          <!-- <li>
            Repository:
            <a
              href="https://github.com/Zel9278/file-server-nuxt"
              class="link link-primary link-hover underline"
              target="_blank"
            >
              git:zel9278/file-server-nuxt
            </a>
          </li> -->
        </ul>

        <div class="bg-zinc-400 w-full h-0.5 rounded my-2" />

        <details class="collapse collapse-arrow bg-base-200">
          <summary class="collapse-title text-xl font-medium">
            File Types
          </summary>
          <div class="collapse-content max-h-full">
            <p>Files Total: {{ data.total }}</p>
            <p>No Extension: {{ data.none }}</p>

            <div class="bg-zinc-500 w-full h-0.5 rounded my-1" />

            <ul>
              <li v-for="(count, type) in data.typeCount" :key="type">
                {{ type }}: {{ count }}
              </li>
            </ul>
          </div>
        </details>

        <div class="bg-zinc-400 w-full h-0.5 rounded my-2" />

        <details class="collapse collapse-arrow bg-base-200">
          <summary class="collapse-title text-xl font-medium">
            Dependencies
          </summary>
          <div class="collapse-content max-h-full">
            <ul>
              <li v-for="pkg in data.packageList" :key="pkg.name">
                {{ pkg.name }}: {{ pkg.version }}
              </li>
            </ul>
          </div>
        </details>
        <details class="collapse collapse-arrow bg-base-200">
          <summary class="collapse-title text-xl font-medium">
            DevDependencies
          </summary>
          <div class="collapse-content max-h-full">
            <ul>
              <li v-for="pkg in data.devPackageList" :key="pkg.name">
                {{ pkg.name }}: {{ pkg.version }}
              </li>
            </ul>
          </div>
        </details>

        <div class="bg-zinc-400 w-full h-0.5 rounded my-2" />

        <details class="collapse collapse-arrow bg-base-200">
          <summary class="collapse-title text-xl font-medium">
            Licenses
          </summary>
          <div class="collapse-content max-h-full">
            <ul>
              <li v-for="license in data.licensesList" :key="license.name">
                <details class="collapse collapse-arrow bg-base-200">
                  <summary class="collapse-title text-lg font-medium">
                    {{ license.name }}
                  </summary>
                  <div class="collapse-content">
                    <ul>
                      <li>Version: {{ license.version }}</li>
                      <li v-if="license.author">Author: {{ license.author }}</li>
                      <li>
                        Repository:
                        <a
                          :href="license.repository"
                          class="link link-primary link-hover underline break-all"
                          target="_blank"
                        >
                          {{ license.repository }}
                        </a>
                      </li>
                      <li>
                        Source:
                        <a
                          :href="license.source"
                          class="link link-primary link-hover underline break-all"
                          target="_blank"
                        >
                          {{ license.source }}
                        </a>
                      </li>
                      <li>License: {{ license.license }}</li>
                      <li>
                        <details class="collapse collapse-arrow bg-base-200">
                          <summary class="collapse-title text-md font-medium">
                            License Text
                          </summary>
                          <div class="collapse-content">
                            <pre class="whitespace-pre-wrap break-words text-xs">{{ license.licenseText }}</pre>
                          </div>
                        </details>
                      </li>
                    </ul>
                  </div>
                </details>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
interface Package {
  name: string
  version: string
}

interface License {
  name: string
  version: string
  author: string | null
  repository: string
  source: string
  license: string
  licenseText: string
}

interface TypeCount {
  [key: string]: number
}

interface Storage {
  usage: number
  total: number
  used: number
  free: number
  formatted: string
}

interface ServerInfoData {
  host: string
  owner: string
  hostname: string
  runningAs: string
  filesDir: string
  thisVersion: string
  nodeVersion: string
  pnpmVersion: string
  total: number
  none: number
  typeCount: TypeCount
  packageList: Package[]
  devPackageList: Package[]
  licensesList: License[]
  storage: Storage
}

const { data, pending, error } = await useFetch<ServerInfoData>('/api/info')
</script>
