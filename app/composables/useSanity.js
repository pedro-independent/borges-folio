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

// SSR-friendly GROQ fetch keyed by query+params.
export async function useSanityQuery(key, query, params = {}) {
  const c = useSanityClient()
  return await useAsyncData(key, () => c.fetch(query, params))
}

// urlFor(img).width(1440).quality(80).url()
export function urlFor(source) {
  if (!builder) builder = imageUrlBuilder(useSanityClient())
  return builder.image(source)
}
