// robots.txt served dynamically so the Sitemap line always points at the live
// domain (runtimeConfig.public.siteUrl / NUXT_PUBLIC_SITE_URL) without editing a
// static file per environment. Allows all crawlers; everything is public.
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public
  const base = (siteUrl || '').replace(/\/$/, '')

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n')
})
