export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
  experimental: {
    appManifest: false,
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  app: {
    head: {
      title: 'AI 面试工具',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'description',
          content:
            '基于 Nuxt 3、Vue 3、TypeScript 与 Naive UI 的 AI 面试分析与进度追踪工具',
        },
      ],
    },
  },
  compatibilityDate: '2025-01-15',
})
