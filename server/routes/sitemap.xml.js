import { createClient } from '@sanity/client'

// Published project slugs — mirrors PROJECT_SLUGS in app/utils/sanityQueries.js
// (inlined to avoid cross-build alias resolution between the app and Nitro).
const PROJECT_SLUGS = '*[_type == "project" && defined(slug.current)].slug.current'

// Dynamic sitemap.xml: the four static routes plus one entry per published
// project (slugs pulled from Sanity at request time). Absolute URLs use the live
// domain (runtimeConfig.public.siteUrl). Degrades gracefully — if Sanity is
// unreachable the static routes still ship.
let client

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/work', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'yearly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
]

const xmlEscape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const { siteUrl, sanity } = useRuntimeConfig().public
  const base = (siteUrl || '').replace(/\/$/, '')

  let slugs = []
  try {
    if (!client) {
      client = createClient({
        projectId: sanity.projectId,
        dataset: sanity.dataset,
        apiVersion: sanity.apiVersion,
        useCdn: true,
      })
    }
    slugs = (await client.fetch(PROJECT_SLUGS)) || []
  } catch {
    // Sanity unreachable — fall back to the static routes only.
    slugs = []
  }

  const urls = [
    ...STATIC_ROUTES.map((r) => ({ loc: base + r.path, priority: r.priority, changefreq: r.changefreq })),
    ...slugs.map((slug) => ({ loc: `${base}/work/${slug}`, priority: '0.8', changefreq: 'monthly' })),
  ]

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n  </url>`,
      )
      .join('\n') +
    '\n</urlset>\n'

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return body
})
