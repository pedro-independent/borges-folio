<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  state,
  visibleItems,
  routeOpenCount,
  loadFeedback,
  createComment,
  replyTo,
  setStatus,
  removeComment,
  setAuthor,
} from './useFeedback.js'

// ── live document size ───────────────────────────────────────────────────────
// Pins are stored as 0..1 fractions of the document, so they re-resolve to px as
// the page reflows, images load, or the viewport changes.
const docW = ref(1)
const docH = ref(1)
function updateDocSize() {
  const d = document.documentElement
  docW.value = Math.max(d.scrollWidth, document.body?.scrollWidth || 0, 1)
  docH.value = Math.max(d.scrollHeight, document.body?.scrollHeight || 0, 1)
}
function posOf(c) {
  return { left: c.xPct * docW.value + 'px', top: c.yPct * docH.value + 'px' }
}
// Hide pins while a page transition runs (the leaving page is frozen/scaled and
// scroll is reset, so document-space coords are momentarily meaningless).
const showPins = computed(() => state.enabled && !state.transitioning && !state.collapsed)
function sideOf(c) {
  return c.xPct > 0.6 ? 'left' : 'right'
}

// ── placing a new comment ────────────────────────────────────────────────────
const draft = ref(null) // { xPct, yPct, selectorHint, elementText }
const draftBody = ref('')
const draftAuthor = ref(state.author)
const draftBox = ref(null)

function startPlacing() {
  state.selectedId = null
  draft.value = null
  state.placing = true
}
function cancelPlacing() {
  state.placing = false
  draft.value = null
  draftBody.value = ''
}
function onCaptureClick(e) {
  e.preventDefault()
  e.stopPropagation()
  const capture = e.currentTarget
  capture.style.pointerEvents = 'none'
  const under = document.elementFromPoint(e.clientX, e.clientY)
  capture.style.pointerEvents = ''
  updateDocSize()
  const pageX = e.clientX + window.scrollX
  const pageY = e.clientY + window.scrollY
  draft.value = {
    xPct: pageX / docW.value,
    yPct: pageY / docH.value,
    ...domHint(under),
  }
  draftAuthor.value = state.author
  nextTick(() => draftBox.value?.querySelector('textarea')?.focus())
}
async function submitDraft() {
  const body = draftBody.value.trim()
  if (!body) return
  if (!state.author) {
    const name = draftAuthor.value.trim()
    if (!name) return
    setAuthor(name)
  }
  try {
    await createComment({
      route: state.route,
      xPct: draft.value.xPct,
      yPct: draft.value.yPct,
      viewportWidth: window.innerWidth,
      selectorHint: draft.value.selectorHint,
      elementText: draft.value.elementText,
      pageTitle: document.title,
      author: state.author,
      body,
    })
    draftBody.value = ''
    draft.value = null
    state.placing = false
  } catch {
    /* error surfaced via state.error */
  }
}

// ── thread ───────────────────────────────────────────────────────────────────
const replyBody = ref('')
const replyAuthor = ref('')
function selectPin(c) {
  state.placing = false
  draft.value = null
  state.selectedId = state.selectedId === c._id ? null : c._id
  replyBody.value = ''
  replyAuthor.value = state.author
}
async function submitReply(id) {
  const body = replyBody.value.trim()
  if (!body) return
  if (!state.author) {
    const name = replyAuthor.value.trim()
    if (!name) return
    setAuthor(name)
  }
  await replyTo(id, body)
  replyBody.value = ''
}
async function toggleResolved(c) {
  await setStatus(c._id, c.status === 'resolved' ? 'open' : 'resolved')
}
async function del(c) {
  if (!window.confirm('Delete this comment?')) return
  await removeComment(c._id)
}

// ── author chip ──────────────────────────────────────────────────────────────
const editingName = ref(false)
const nameDraft = ref(state.author)
function openName() {
  nameDraft.value = state.author
  editingName.value = !editingName.value
}
function saveName() {
  setAuthor(nameDraft.value)
  draftAuthor.value = state.author
  replyAuthor.value = state.author
  editingName.value = false
}

// ── collapse ─────────────────────────────────────────────────────────────────
function collapse() {
  cancelPlacing()
  state.selectedId = null
  state.collapsed = true
}

// ── helpers ──────────────────────────────────────────────────────────────────
function initial(name) {
  return ((name || '?').trim().charAt(0) || '?').toUpperCase()
}
function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h ago'
  const d = Math.floor(h / 24)
  if (d < 7) return d + 'd ago'
  return new Date(iso).toLocaleDateString()
}
// A short, human-readable hint of what was clicked — for context in the thread,
// never used as a selector. Ignores the tool's own (fb-*) classes.
function domHint(el) {
  if (!el || el === document.body || el === document.documentElement) {
    return { selectorHint: '', elementText: '' }
  }
  const parts = []
  let node = el
  let depth = 0
  while (node && node.nodeType === 1 && node !== document.body && depth < 3) {
    let sel = node.tagName.toLowerCase()
    if (node.id) {
      parts.unshift(sel + '#' + node.id)
      break
    }
    const cls = (node.getAttribute('class') || '')
      .split(/\s+/)
      .filter((c) => c && !c.startsWith('fb-'))[0]
    if (cls) sel += '.' + cls
    parts.unshift(sel)
    node = node.parentElement
    depth++
  }
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
  return { selectorHint: parts.join(' > '), elementText: text }
}

// ── lifecycle ────────────────────────────────────────────────────────────────
let ro = null
let poll = null
function onVisibility() {
  if (document.visibilityState === 'visible') loadFeedback()
}
function onKey(e) {
  if (e.key !== 'Escape') return
  if (draft.value || state.placing) cancelPlacing()
  else if (state.selectedId) state.selectedId = null
}
onMounted(() => {
  updateDocSize()
  loadFeedback()
  window.addEventListener('resize', updateDocSize)
  window.addEventListener('focus', loadFeedback)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('keydown', onKey)
  if (window.ResizeObserver) {
    ro = new ResizeObserver(updateDocSize)
    ro.observe(document.documentElement)
    if (document.body) ro.observe(document.body)
  }
  poll = setInterval(() => {
    if (document.visibilityState === 'visible') loadFeedback()
  }, 15000)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDocSize)
  window.removeEventListener('focus', loadFeedback)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('keydown', onKey)
  ro?.disconnect()
  clearInterval(poll)
})
</script>

<template>
  <div v-if="state.enabled" class="fb-root">
    <!-- PIN LAYER (document space, scrolls with the page) -->
    <div v-show="showPins" class="fb-pins">
      <div
        v-for="c in visibleItems"
        :key="c._id"
        class="fb-pin"
        :class="{ 'is-resolved': c.status === 'resolved', 'is-selected': c._id === state.selectedId }"
        :style="posOf(c)"
      >
        <button class="fb-marker" type="button" :title="c.author" @click.stop="selectPin(c)">
          <span v-if="c.status === 'resolved'" class="fb-marker__icon">✓</span>
          <span v-else>{{ initial(c.author) }}</span>
          <span v-if="c.replies && c.replies.length" class="fb-marker__badge">{{ c.replies.length }}</span>
        </button>

        <!-- THREAD -->
        <div v-if="c._id === state.selectedId" class="fb-thread" :class="'fb-thread--' + sideOf(c)" @click.stop>
          <header class="fb-thread__head">
            <span class="fb-avatar">{{ initial(c.author) }}</span>
            <span class="fb-thread__meta">
              <strong>{{ c.author }}</strong>
              <em>{{ timeAgo(c.createdAt) }}</em>
            </span>
            <button class="fb-icon-btn" type="button" title="Close" @click="state.selectedId = null">✕</button>
          </header>

          <p class="fb-thread__body">{{ c.body }}</p>
          <p v-if="c.elementText" class="fb-thread__on">on “{{ c.elementText }}”</p>

          <ul v-if="c.replies && c.replies.length" class="fb-replies">
            <li v-for="r in c.replies" :key="r._key">
              <span class="fb-avatar fb-avatar--sm">{{ initial(r.author) }}</span>
              <span class="fb-reply">
                <span class="fb-reply__meta"><strong>{{ r.author }}</strong> <em>{{ timeAgo(r.at) }}</em></span>
                <span class="fb-reply__body">{{ r.body }}</span>
              </span>
            </li>
          </ul>

          <form class="fb-form" @submit.prevent="submitReply(c._id)">
            <input v-if="!state.author" v-model="replyAuthor" class="fb-input" placeholder="Your name" />
            <textarea
              v-model="replyBody"
              class="fb-textarea"
              rows="2"
              placeholder="Reply…"
              @keydown.meta.enter="submitReply(c._id)"
              @keydown.ctrl.enter="submitReply(c._id)"
            ></textarea>
            <div class="fb-actions">
              <button type="button" class="fb-btn" @click="toggleResolved(c)">
                {{ c.status === 'resolved' ? 'Reopen' : 'Resolve' }}
              </button>
              <button type="button" class="fb-btn fb-btn--danger" @click="del(c)">Delete</button>
              <button type="submit" class="fb-btn fb-btn--primary" :disabled="!replyBody.trim()">Reply</button>
            </div>
          </form>
        </div>
      </div>

      <!-- DRAFT pin + composer -->
      <div v-if="draft" class="fb-pin fb-pin--draft" :style="posOf(draft)">
        <span class="fb-marker fb-marker--draft">{{ initial(state.author || draftAuthor) }}</span>
        <div ref="draftBox" class="fb-thread" :class="'fb-thread--' + sideOf(draft)" @click.stop>
          <form class="fb-form" @submit.prevent="submitDraft">
            <input v-if="!state.author" v-model="draftAuthor" class="fb-input" placeholder="Your name" />
            <textarea
              v-model="draftBody"
              class="fb-textarea"
              rows="3"
              placeholder="Add a comment…"
              @keydown.meta.enter="submitDraft"
              @keydown.ctrl.enter="submitDraft"
              @keydown.esc="cancelPlacing"
            ></textarea>
            <div class="fb-actions">
              <button type="button" class="fb-btn" @click="cancelPlacing">Cancel</button>
              <button
                type="submit"
                class="fb-btn fb-btn--primary"
                :disabled="!draftBody.trim() || (!state.author && !draftAuthor.trim())"
              >
                Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- CLICK-CAPTURE layer (only while choosing a spot) -->
    <div v-if="state.placing && !draft" class="fb-capture" @click="onCaptureClick">
      <span class="fb-capture__hint">Click anywhere to leave a comment · Esc to cancel</span>
    </div>

    <!-- TOOLBAR -->
    <div v-show="!state.collapsed" class="fb-bar">
      <button
        class="fb-tool"
        :class="{ 'is-active': state.placing }"
        type="button"
        @click="state.placing ? cancelPlacing() : startPlacing()"
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{{ state.placing ? 'Cancel' : 'Comment' }}</span>
      </button>

      <span class="fb-sep" />

      <span class="fb-count" :title="routeOpenCount + ' open on this page'">{{ routeOpenCount }}</span>
      <label class="fb-check"><input v-model="state.showResolved" type="checkbox" /> Resolved</label>

      <span class="fb-sep" />

      <button class="fb-author" type="button" :title="state.author || 'Set your name'" @click="openName">
        <span class="fb-avatar fb-avatar--sm">{{ initial(state.author) }}</span>
        <span class="fb-author__name">{{ state.author || 'Set name' }}</span>
      </button>
      <button class="fb-icon-btn" type="button" title="Hide tool" @click="collapse">–</button>

      <div v-if="editingName" class="fb-namepop" @click.stop>
        <input v-model="nameDraft" class="fb-input" placeholder="Your name" @keydown.enter="saveName" />
        <button class="fb-btn fb-btn--primary" type="button" @click="saveName">Save</button>
      </div>

      <p v-if="state.error" class="fb-bar__err">{{ state.error }}</p>
    </div>

    <!-- COLLAPSED launcher -->
    <button v-show="state.collapsed" class="fb-fab" type="button" title="Show feedback tool" @click="state.collapsed = false">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span v-if="routeOpenCount" class="fb-fab__count">{{ routeOpenCount }}</span>
    </button>
  </div>
</template>

<style scoped>
/* Self-contained: a fixed base font-size so the tool never inherits the host's
   fluid em-scaling, plus its own tokens. Scoped, so nothing leaks into the app. */
.fb-root {
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #14161a;
  --fb-accent: #0d99ff;
  --fb-resolved: #16a34a;
  --fb-surface: #fff;
  --fb-line: #e6e8eb;
  --fb-muted: #6b7280;
  --fb-shadow: 0 8px 30px rgba(15, 23, 42, 0.18);
}
.fb-root * { box-sizing: border-box; }

/* ── pin layer ── */
.fb-pins {
  position: absolute; /* no positioned ancestor → document space, scrolls */
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2147483000;
  pointer-events: none;
}
.fb-pin {
  position: absolute;
  transform: translate(-50%, -50%);
}
.fb-pin.is-selected { z-index: 5; }

.fb-marker {
  pointer-events: auto;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50% 50% 50% 4px;
  background: var(--fb-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--fb-shadow);
  transition: transform 0.12s ease;
  animation: fb-pop 0.18s ease;
}
.fb-marker:hover { transform: scale(1.08); }
.fb-pin.is-resolved .fb-marker { background: var(--fb-resolved); }
.fb-pin.is-selected .fb-marker { transform: scale(1.08); box-shadow: 0 0 0 4px rgba(13, 153, 255, 0.25), var(--fb-shadow); }
.fb-marker--draft {
  background: var(--fb-accent);
  border: 2px dashed #fff;
  animation: none;
}
.fb-marker__icon { font-size: 15px; line-height: 1; }
.fb-marker__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #14161a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
@keyframes fb-pop { from { transform: scale(0.4); opacity: 0; } }

/* ── thread / composer popover ── */
.fb-thread {
  pointer-events: auto;
  position: absolute;
  top: -6px;
  width: 280px;
  max-height: 60vh;
  overflow: auto;
  padding: 12px;
  background: var(--fb-surface);
  border: 1px solid var(--fb-line);
  border-radius: 12px;
  box-shadow: var(--fb-shadow);
  cursor: default;
}
.fb-thread--right { left: 34px; }
.fb-thread--left { right: 34px; }

.fb-thread__head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.fb-thread__meta { display: flex; flex-direction: column; line-height: 1.2; flex: 1; min-width: 0; }
.fb-thread__meta strong { font-size: 13px; }
.fb-thread__meta em { font-style: normal; font-size: 11px; color: var(--fb-muted); }
.fb-thread__body { margin: 0 0 6px; white-space: pre-wrap; word-break: break-word; }
.fb-thread__on { margin: 0 0 8px; font-size: 11px; color: var(--fb-muted); }

.fb-replies { list-style: none; margin: 0 0 8px; padding: 0 0 4px; border-top: 1px solid var(--fb-line); }
.fb-replies li { display: flex; gap: 8px; padding-top: 8px; }
.fb-reply { display: flex; flex-direction: column; min-width: 0; }
.fb-reply__meta { font-size: 11px; color: var(--fb-muted); }
.fb-reply__meta strong { color: #14161a; }
.fb-reply__body { white-space: pre-wrap; word-break: break-word; }

.fb-avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--fb-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.fb-avatar--sm { width: 20px; height: 20px; font-size: 10px; }

.fb-form { display: flex; flex-direction: column; gap: 6px; }
.fb-input,
.fb-textarea {
  width: 100%;
  font: inherit;
  padding: 7px 9px;
  border: 1px solid var(--fb-line);
  border-radius: 8px;
  background: #fff;
  color: inherit;
  resize: vertical;
}
.fb-input:focus,
.fb-textarea:focus { outline: 2px solid var(--fb-accent); outline-offset: -1px; border-color: transparent; }
.fb-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }

.fb-btn {
  font: inherit;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid var(--fb-line);
  border-radius: 7px;
  background: #fff;
  color: #14161a;
  cursor: pointer;
}
.fb-btn:hover { background: #f3f4f6; }
.fb-btn--primary { background: var(--fb-accent); border-color: var(--fb-accent); color: #fff; }
.fb-btn--primary:hover { filter: brightness(0.95); background: var(--fb-accent); }
.fb-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.fb-btn--danger { color: #dc2626; }
.fb-btn--danger:hover { background: #fef2f2; }

.fb-icon-btn {
  border: none;
  background: transparent;
  color: var(--fb-muted);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
}
.fb-icon-btn:hover { background: #f3f4f6; color: #14161a; }

/* ── capture layer ── */
.fb-capture {
  position: fixed;
  inset: 0;
  z-index: 2147483400;
  cursor: crosshair;
  background: rgba(13, 153, 255, 0.04);
}
.fb-capture__hint {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: #14161a;
  color: #fff;
  font-size: 12px;
  padding: 7px 14px;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: var(--fb-shadow);
}

/* ── toolbar ── */
.fb-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--fb-surface);
  border: 1px solid var(--fb-line);
  border-radius: 999px;
  box-shadow: var(--fb-shadow);
}
.fb-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-weight: 600;
  font-size: 13px;
  padding: 7px 12px;
  border: none;
  border-radius: 999px;
  background: var(--fb-accent);
  color: #fff;
  cursor: pointer;
}
.fb-tool.is-active { background: #14161a; }
.fb-sep { width: 1px; align-self: stretch; background: var(--fb-line); }
.fb-count {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #14161a;
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.fb-check { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--fb-muted); cursor: pointer; user-select: none; }
.fb-check input { accent-color: var(--fb-accent); }
.fb-author { display: inline-flex; align-items: center; gap: 6px; border: none; background: transparent; cursor: pointer; padding: 3px; border-radius: 999px; }
.fb-author:hover { background: #f3f4f6; }
.fb-author__name { font-size: 12px; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fb-namepop {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 8px;
  display: flex;
  gap: 6px;
  padding: 8px;
  background: var(--fb-surface);
  border: 1px solid var(--fb-line);
  border-radius: 10px;
  box-shadow: var(--fb-shadow);
}
.fb-namepop .fb-input { width: 160px; }
.fb-bar__err {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  white-space: nowrap;
  font-size: 12px;
  color: #fff;
  background: #dc2626;
  padding: 6px 12px;
  border-radius: 8px;
}

/* ── collapsed launcher ── */
.fb-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483600;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: var(--fb-accent);
  color: #fff;
  cursor: pointer;
  box-shadow: var(--fb-shadow);
}
.fb-fab__count {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #14161a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}

@media (prefers-reduced-motion: reduce) {
  .fb-marker { animation: none; transition: none; }
}
</style>
