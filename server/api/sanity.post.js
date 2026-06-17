import { createClient } from '@sanity/client'

// Server-side proxy for Sanity reads. The browser calls this same-origin route
// (no CORS); the server fetches the public dataset and returns the result. GROQ
// is read-only, so executing the client-supplied query carries no mutation risk.
let client

export default defineEventHandler(async (event) => {
  const { query, params } = await readBody(event)
  if (typeof query !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing query' })
  }
  if (!client) {
    const { sanity } = useRuntimeConfig().public
    client = createClient({
      projectId: sanity.projectId,
      dataset: sanity.dataset,
      apiVersion: sanity.apiVersion,
      useCdn: true,
    })
  }
  return await client.fetch(query, params || {})
})
