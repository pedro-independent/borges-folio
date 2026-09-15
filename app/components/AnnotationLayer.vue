<script setup>
// Reusable hand-drawn annotation overlay. Children supply the marks:
//   - .anno__svg  → inline SVG whose <path>s are traced on with DrawSVG
//   - .anno__note → GFY Palmer text note (faded/slid in after the strokes)
// trigger="load" plays on mount (above-the-fold hero); "scroll" plays when the
// layer scrolls into view. Desktop-only — hidden < 992px in CSS.
import { onMounted, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import useGSAP from '~/composables/useGSAP'

const props = defineProps({
  trigger: { type: String, default: 'scroll' }, // 'scroll' | 'load'
})

// True while the home preloader covers the viewport (HpLoader.vue). A `load`
// trigger firing then would spend its trace invisibly under the overlay — hold
// it and play as the overlay fades. `false` everywhere the loader doesn't run.
const preloading = useState('preloading', () => false)
// True while a page transition runs (app.vue). On client-side navigation the
// layer mounts while the incoming page is still sliding in, and the heading
// lines it annotates only reveal once the transition settles (their
// ScrollTriggers are recomputed then) — so a `load` trigger must hold here
// too, or the scribbles trace over an empty hero.
const transitioning = useState('page-transitioning', () => false)

// Delay after release. After a page transition the heading lines rise first
// (~0.9s + stagger, text-reveal.client.js); the strokes wait for them.
const LOAD_DELAY = 0.35
const AFTER_TRANSITION_DELAY = 1.1

const root = useTemplateRef('root')
let mm = null

onMounted(async () => {
  const { gsap, lazyLoadPlugin } = useGSAP()
  const paths = root.value.querySelectorAll('.anno__svg path')
  const notes = root.value.querySelectorAll('.anno__note')

  // Hide immediately (sync, before paint) so the finished art never flashes.
  gsap.set([...paths, ...notes], { opacity: 0 })

  let canDraw = true
  try {
    await lazyLoadPlugin('DrawSVGPlugin')
  } catch {
    canDraw = false // GSAP club plugin unavailable — fall back to a fade.
  }

  mm = gsap.matchMedia()

  // Large screens, motion allowed → trace the strokes on, then bring the notes in.
  mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
    // A load trigger holds (paused) while the preloader covers the viewport,
    // then restarts — delay included — as the overlay fades.
    const waiting = props.trigger === 'load' && (preloading.value || transitioning.value)
    const opts = props.trigger === 'load'
      ? { delay: LOAD_DELAY, paused: waiting }
      : { scrollTrigger: { trigger: root.value, start: 'top 78%', once: true } }
    const tl = gsap.timeline(opts)

    if (canDraw) {
      // Strokes stay opaque; drawSVG drives the reveal so it reads as a pen.
      gsap.set(paths, { opacity: 1, drawSVG: '0%' })
      tl.to(paths, { drawSVG: '100%', duration: 0.9, stagger: { amount: 1 }, ease: 'power1.inOut' })
    } else {
      tl.to(paths, { opacity: 1, duration: 0.5, stagger: { amount: 0.6 } })
    }
    gsap.set(notes, { y: 10 })
    tl.to(notes, { opacity: 1, y: 0, duration: 0.45, stagger: 0.18, ease: 'osmo' }, '<0.35')

    let stopWait = null
    if (waiting) {
      const afterTransition = transitioning.value
      stopWait = watch([preloading, transitioning], ([p, t]) => {
        if (p || t) return
        stopWait()
        stopWait = null
        tl.delay(afterTransition ? AFTER_TRANSITION_DELAY : LOAD_DELAY)
        tl.restart(true) // true = honour the delay
      })
    }

    return () => { stopWait?.(); tl.scrollTrigger?.kill(); tl.kill() }
  })

  // Reduced motion (or no draw plugin) → just reveal everything in place.
  mm.add('(min-width: 992px) and (prefers-reduced-motion: reduce)', () => {
    if (canDraw) gsap.set(paths, { drawSVG: '100%' })
    gsap.set([...paths, ...notes], { opacity: 1 })
  })

  // Below 992 the layers are hidden in CSS — except the footer note, which the
  // mobile frame keeps. The pre-paint hide above would leave it at opacity 0
  // forever, so reveal in place here (the trace is a desktop flourish, and for
  // the display:none layers this is a no-op either way).
  mm.add('(max-width: 991px)', () => {
    if (canDraw) gsap.set(paths, { drawSVG: '100%' })
    gsap.set([...paths, ...notes], { opacity: 1 })
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <div ref="root" class="anno" aria-hidden="true"><slot /></div>
</template>
