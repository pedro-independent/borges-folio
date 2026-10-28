// The site is unlisted: reachable by URL only, kept out of search results.
// Crawling stays ALLOWED on purpose — the actual block is the `noindex` meta tag
// + X-Robots-Tag header (nuxt.config.js), and crawlers must be able to fetch a
// page to see them. A `Disallow: /` here would hide the noindex, and Google can
// still index a disallowed URL from external links. No Sitemap line either.
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return ['User-agent: *', 'Allow: /', ''].join('\n')
})
