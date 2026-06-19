import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { addReply, setStatus, editBody, assertEnabled, assertId } from '../../utils/feedbackStore.js'

// Mutate a comment: add a reply, resolve/reopen, or edit the body.
export default defineEventHandler(async (event) => {
  assertEnabled()
  const id = assertId(getRouterParam(event, 'id'))
  const b = await readBody(event)

  switch (b?.action) {
    case 'reply':
      if (!(b.body || '').toString().trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Empty reply' })
      }
      return await addReply(id, b)
    case 'status':
      return await setStatus(id, b.status)
    case 'edit':
      if (!(b.body || '').toString().trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Empty comment' })
      }
      return await editBody(id, b.body)
    default:
      throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  }
})
