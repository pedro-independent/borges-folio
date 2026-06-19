import { defineEventHandler, readBody, createError } from 'h3'
import { createComment, assertEnabled } from '../../utils/feedbackStore.js'

// Create a comment. The server mints _id/_type/status/createdAt; the client only
// supplies position + content, so this public endpoint can't forge arbitrary docs.
export default defineEventHandler(async (event) => {
  assertEnabled()
  const body = await readBody(event)
  if (!body || !(body.body || '').toString().trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Empty comment' })
  }
  return await createComment(body)
})
