import { defineEventHandler, getRouterParam } from 'h3'
import { deleteComment, assertEnabled, assertId } from '../../utils/feedbackStore.js'

export default defineEventHandler(async (event) => {
  assertEnabled()
  const id = assertId(getRouterParam(event, 'id'))
  return await deleteComment(id)
})
