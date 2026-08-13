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
    // --- PRIVATE (server-only; never shipped to the browser) ---
    // Contact form → Resend (server/api/contact.post.js). Every value below is a
    // LITERAL default that Nuxt auto-overrides from the matching env var —
    // NUXT_RESEND_API_KEY / NUXT_CONTACT_TO / NUXT_CONTACT_FROM. Do NOT write
    // `process.env.NUXT_*` here: a key that reads its own auto-override env var
    // collides with it and resolves to undefined at runtime (same trap as
    // siteUrl above). The key must be set on the host or the route returns 503.
    resendApiKey: '',
    contactTo: 'pedrosmborges@gmail.com',
    // Resend only accepts a `from` on a domain you've verified. The default is
    // Resend's shared sandbox sender, which can ONLY deliver to the address that
    // owns the Resend account — fine for testing, replace via NUXT_CONTACT_FROM
    // once the site's domain is verified (e.g. 'Portfolio <hello@yourdomain.com>').
    contactFrom: 'Portfolio <onboarding@resend.dev>',

    public: {
      // Production base URL — single source of truth for canonical tags, og:url,
      // robots.txt and sitemap.xml. SET THIS before launch via the host env var
      // NUXT_PUBLIC_SITE_URL (e.g. https://pedroborges.com). The placeholder
      // below is only a dev fallback and MUST be overridden in production.
      siteUrl: 'https://www.tortostudio.com/',
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
      // Filenames are case-sensitive on the deploy host (Linux) — match exactly.
      // Web-clip must be PNG (iOS ignores SVG apple-touch-icons); generated from
      // Webclip.svg. Legacy /favicon.svg kept as the guessed-path fallback.
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/img/Favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
