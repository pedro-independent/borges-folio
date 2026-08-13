<script setup>
// Home preloader: first paint is the plain cream ground; the hero portrait
// then REVEALS inside a centred portrait frame (a bottom-up clip-mask wipe —
// the clipped region reads as a cover the colour of the background sliding
// off the image), and the frame expands to cover the viewport — at which
// point it IS the hero background (same <picture>, same cover crop), so the
// overlay fades out into the identical .hero__bg underneath and only the
// nav + copy cross-fade in on top.
//
// Runs ONLY on a hard load of the home page: SSR renders the overlay (so it
// covers the very first paint — no flash of the page before the loader), and
// on client-side navigations `isHydrating` is false so it never mounts.
// Reduced motion drops it immediately instead of animating.
import { ref, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

const nuxtApp = useNuxtApp()
// Shared "the overlay covers the viewport" flag: the hero's entrance
// animations (text-reveal plugin, AnnotationLayer's load trigger) hold on it
// and play when it flips — which happens as the overlay STARTS fading, so the
// lines rise and the marks trace while the cream lifts: one entrance.
const preloading = useState('preloading', () => (import.meta.server ? true : nuxtApp.isHydrating))
const active = ref(preloading.value)
const root = useTemplateRef('root')
const frame = useTemplateRef('frame')
let tl = null

function finish() {
  nuxtApp.$lenis?.start()
  preloading.value = false
  active.value = false
}

onMounted(() => {
  if (!active.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish()

  const { gsap } = useGSAP()
  // Freeze the page under the overlay for the duration.
  nuxtApp.$lenis?.stop()

  // The CSS renders the portrait frame fully clipped (inset 100% from the top
  // → first paint is pure cream). Stage 1 wipes the clip away bottom-to-top,
  // revealing the image in place; stage 2 grows the frame to the full viewport
  // (px from the window so svh/URL-bar quirks can't leave a seam), the image
  // re-cropping itself at every size via object-fit: cover.
  tl = gsap
    .timeline({ defaults: { ease: 'osmo' }, onComplete: finish })
    .to(frame.value, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 }, 0.45)
    .to(frame.value, { width: () => window.innerWidth, height: () => window.innerHeight, duration: 1.1 }, '+=0.35')
    // Full-bleed now matches .hero__bg 1:1 — fade the overlay so only the
    // nav + hero copy come in on top of the (identical) image. Releasing the
    // held entrances at fade START overlaps them with the lift.
    .to(root.value, { autoAlpha: 0, duration: 0.5, onStart: () => (preloading.value = false) }, '+=0.15')
})

onBeforeUnmount(() => {
  tl?.kill()
  nuxtApp.$lenis?.start()
})
</script>

<template>
  <div v-if="active" ref="root" class="loader" aria-hidden="true">
    <div ref="frame" class="loader__frame">
      <!-- Same sources as the hero background (HpHero.vue), so the handoff is
           pixel-identical and the browser reuses the cached bytes. -->
      <picture>
        <source media="(max-width: 479px)" srcset="/img/hero_mobile.jpg" />
        <img src="/img/borges_hero.jpg" alt="" fetchpriority="high" />
      </picture>
    </div>
  </div>
</template>
