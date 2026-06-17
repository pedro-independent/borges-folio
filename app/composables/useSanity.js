import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

let client
let builder

export function useSanityClient() {
  if (!client) {
    const { sanity } = useRuntimeConfig().public
    client = createClient({
      projectId: sanity.projectId,
      dataset: sanity.dataset,
      apiVersion: sanity.apiVersion,
      useCdn: true, // CDN for published content; set false for drafts/preview
    })
  }
  return client
}

// SSR-friendly GROQ fetch keyed by query+params. Goes through the same-origin
// /api/sanity server route (no browser→Sanity CORS). `options` is forwarded to
// useFetch — notably `{ lazy: import.meta.client }` to block on the server (so
// SSR ships real data) but NOT on client-side navigation (so the page
// transition isn't suspended waiting on the fetch).
//
// Returns useFetch's AsyncData directly (NOT async), so callers choose how to
// consume it: pages `await` it to block SSR for real first-paint data, while the
// always-mounted shell (useSiteSettings) uses it without await so it never
// suspends. Same explicit `key` across components dedupes to one request.
export function useSanityQuery(key, query, params = {}, options = {}) {
  return useFetch('/api/sanity', {
    method: 'POST',
    body: { query, params },
    key,
    ...options,
  })
}

// urlFor(img).width(1440).quality(80).url()
export function urlFor(source) {
  if (!builder) builder = imageUrlBuilder(useSanityClient())
  return builder.image(source)
}
