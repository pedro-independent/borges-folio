import { defineEventHandler } from 'h3'
import { listComments, feedbackEnabled } from '../../utils/feedbackStore.js'

// List every feedback comment across the site (the client UI filters by route).
// Returns [] when the tool is disabled so the front-end simply renders nothing.
export default defineEventHandler(async () => {
  if (!feedbackEnabled()) return []
  return await listComments()
})
