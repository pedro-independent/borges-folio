// Client plugin: gates on runtime config, wires the current route + page-
// transition flag into the shared store, then mounts the overlay in its own Vue
// app appended to <body>. Mounting detached (not in the routed tree) keeps the
// tool above the page-transition card and means the host app needs ZERO edits —
// extending this layer is the only integration step.

import { createApp, watch } from 'vue'
import FeedbackOverlay from './FeedbackOverlay.vue'
import { state, loadFeedback } from './useFeedback.js'

export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig()
  if (!cfg.public.feedback?.enabled) return

  state.enabled = true

  const router = useRouter()
  state.route = router.currentRoute.value.path
  router.afterEach((to) => {
    state.route = to.path
    state.selectedId = null
    state.placing = false
  })

  // Hide pins while the app.vue page transition runs (mirrors its useState flag).
  const transitioning = useState('page-transitioning', () => false)
  watch(transitioning, (v) => { state.transitioning = v }, { immediate: true })

  const host = document.createElement('div')
  host.id = 'feedback-root'
  document.body.appendChild(host)
  const app = createApp(FeedbackOverlay)
  app.mount(host)

  loadFeedback()

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      app.unmount()
      host.remove()
    })
  }
})
