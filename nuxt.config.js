// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-29',
  devtools: { enabled: true },

  // Lenis base styles first, then the single project sheet
  // (resets → tokens → scaling → typography → layout → pages).
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css', '~/assets/css/button-004.css', '~/assets/css/button-029.css', '~/assets/css/underline-link.css'],

  // Leave absolute "/img/..." URLs alone — served straight from public/,
  // so the Vue compiler must not resolve them as Vite imports.
  vite: {
    vue: { template: { transformAssetUrls: { includeAbsolute: false } } },
  },

  // Sanity creds exposed to the client read-only via runtimeConfig.public.
  runtimeConfig: {
    public: {
      // Production base URL — single source of truth for canonical tags, og:url,
      // robots.txt and sitemap.xml. SET THIS before launch via the host env var
      // NUXT_PUBLIC_SITE_URL (e.g. https://pedroborges.com). The placeholder
      // below is only a dev fallback and MUST be overridden in production.
      siteUrl: 'https://example.com',
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
      // data-theme-nav/data-bg-nav are mirrored from the section under the nav
      // by theme-scroll.client.js; the initial value matches the home hero (dark).
      bodyAttrs: { 'data-page-theme': 'light', 'data-theme-nav': 'dark', 'data-bg-nav': 'light' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [{ name: 'theme-color', content: '#e8e4db' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
