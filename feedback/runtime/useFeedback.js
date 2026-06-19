// Shared client store for the feedback overlay. A plain ESM singleton (NOT a
// Nuxt composable) so it works both inside the Nuxt plugin and inside the
// detached Vue app the plugin mounts — they import the same module instance, so
// the reactive `state` is shared. API calls use the global `$fetch` Nuxt exposes
// on the client, so no Nuxt auto-imports are needed here.

import { reactive, computed } from 'vue'

const LS_AUTHOR = 'feedback-tool:author'
const isClient = typeof window !== 'undefined'

function lsGet(k) { try { return localStorage.getItem(k) || '' } catch { return '' } }
function lsSet(k, v) { try { localStorage.setItem(k, v) } catch {} }

export const state = reactive({
  enabled: false,
  route: isClient ? window.location.pathname : '/',
  transitioning: false,
  items: [],
  loading: false,
  loaded: false,
  error: '',
  author: isClient ? lsGet(LS_AUTHOR) : '',
  // UI
  placing: false,
  showResolved: false,
  selectedId: null,
  collapsed: false,
})

const api = (url, opts) => globalThis.$fetch(url, opts)

export const visibleItems = computed(() =>
  state.items
    .filter((c) => c.route === state.route)
    .filter((c) => state.showResolved || c.status !== 'resolved'),
)

export const routeOpenCount = computed(
  () => state.items.filter((c) => c.route === state.route && c.status !== 'resolved').length,
)

export function setAuthor(name) {
  state.author = (name || '').trim()
  lsSet(LS_AUTHOR, state.author)
}

export async function loadFeedback() {
  if (!state.enabled) return
  state.loading = true
  try {
    state.items = await api('/api/feedback')
    state.loaded = true
    state.error = ''
  } catch (e) {
    state.error = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Failed to load comments'
  } finally {
    state.loading = false
  }
}

export async function createComment(payload) {
  try {
    const doc = await api('/api/feedback', { method: 'POST', body: payload })
    state.items.push(doc)
    state.error = ''
    return doc
  } catch (e) {
    state.error = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Could not save comment'
    throw e
  }
}

export async function replyTo(id, body) {
  const doc = await api(`/api/feedback/${id}`, {
    method: 'PATCH',
    body: { action: 'reply', author: state.author, body },
  })
  patchLocal(doc)
  return doc
}

export async function setStatus(id, status) {
  const doc = await api(`/api/feedback/${id}`, { method: 'PATCH', body: { action: 'status', status } })
  patchLocal(doc)
  return doc
}

export async function removeComment(id) {
  await api(`/api/feedback/${id}`, { method: 'DELETE' })
  state.items = state.items.filter((c) => c._id !== id)
  if (state.selectedId === id) state.selectedId = null
}

function patchLocal(doc) {
  const i = state.items.findIndex((c) => c._id === doc._id)
  if (i >= 0) state.items[i] = doc
}
