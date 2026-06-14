// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-29',
  devtools: { enabled: true },

  // Lenis base styles first, then the single project sheet
  // (resets → tokens → scaling → typography → layout → pages).
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  // Leave absolute "/img/..." URLs alone — served straight from public/,
  // so the Vue compiler must not resolve them as Vite imports.
  vite: {
    vue: { template: { transformAssetUrls: { includeAbsolute: false } } },
  },

  // Sanity creds exposed to the client read-only via runtimeConfig.public.
  runtimeConfig: {
    public: {
      sanity: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: '2024-01-01',
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en', 'data-page-theme': 'light' },
      bodyAttrs: { 'data-page-theme': 'light' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [{ name: 'theme-color', content: '#e8e4db' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
