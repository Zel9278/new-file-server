// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  css: [
    '~/assets/css/globals.css',
    'highlight.js/styles/github-dark.css',
  ],

  runtimeConfig: {
    authToken: process.env.AUTH_TOKEN,
    discordWebhook: process.env.DISCORD_WEBHOOK,
    filesDir: process.env.FILES_DIR,
    author: process.env.AUTHOR,
    authorId: process.env.AUTHOR_ID,
    public: {
      name: process.env.NAME || 'File Server',
      description: process.env.DESCRIPTION || 'A file hosting service',
      url: process.env.URL || 'http://localhost:3000',
    }
  },

  app: {
    head: {
      title: process.env.NAME || 'File Server',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
        { name: 'description', content: process.env.DESCRIPTION || 'A file hosting service' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Fira+Code:wght@300..700&family=Kosugi+Maru&display=swap', as: 'style' }
      ],
      htmlAttrs: {
        lang: 'ja'
      }
    }
  },

  features: {
    inlineStyles: true
  },

  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  },

  typescript: {
    strict: true
  }
})
