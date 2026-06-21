// Single SEO entry point for every page. Wraps useSeoMeta so each page declares
// only its title / description / share image, and this fills in the rest:
// Open Graph + Twitter cards, og:url and a <link rel="canonical">, all built
// from the absolute site URL (runtimeConfig.public.siteUrl).
//
// Pass plain values or getters (functions); getters keep the tags reactive when
// the CMS data lands after the initial render. Title is passed RAW (e.g. 'Work')
// — formatTitle adds the brand suffix, matching app.vue's titleTemplate so the
// <title> and og:title never drift.

// Shared title format: "Page — Pedro Borges", or the brand line on the home page.
// Used by both useSeo (og/twitter) and app.vue's <title> titleTemplate.
export const formatTitle = (t) => (t ? `${t} — Pedro Borges` : 'Pedro Borges — UX/UI Designer')

const BRAND = 'Pedro Borges'
const DEFAULT_DESCRIPTION =
  'Pedro Borges — an awarded UX/UI designer specialised in psychology-driven design decisions, with selected work across multiple industries.'
const DEFAULT_OG_IMAGE = '/img/borges_hero.jpg'

const resolve = (v) => (typeof v === 'function' ? v() : v)

export function useSeo(opts = {}) {
  const { siteUrl } = useRuntimeConfig().public
  const base = (siteUrl || '').replace(/\/$/, '')
  const route = useRoute()

  const abs = (path) => (/^https?:\/\//.test(path) ? path : base + path)
  const canonical = () => base + route.path

  const rawTitle = () => resolve(opts.title) || ''
  const fullTitle = () => formatTitle(rawTitle())
  const description = () => resolve(opts.description) || DEFAULT_DESCRIPTION
  const image = () => abs(resolve(opts.image) || DEFAULT_OG_IMAGE)

  useSeoMeta({
    // <title> still flows through app.vue's titleTemplate, so pass the raw title.
    title: rawTitle,
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogType: opts.type || 'website',
    ogUrl: canonical,
    ogImage: image,
    ogSiteName: BRAND,
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })
}
