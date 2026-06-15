<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

const industries = [
  'Architecture', 'Banking', 'Cannabis', 'Crypto', 'Cyber Security',
  'Education', 'Entertainment', 'Fashion', 'Food', 'Furniture',
  'Healthcare', 'Investment funds', 'Law', 'Real Estate', 'Sports', 'SaaS',
]

// Pin the section and scrub the list upward as the user scrolls. The per-item
// opacity is handled by a position-based CSS mask on .industries__list, so
// items brighten as they rise into the focus band and fade as they leave.
const root = useTemplateRef('root')
const track = useTemplateRef('track')
let mm = null

onMounted(() => {
  const { gsap, ScrollTrigger } = useGSAP()
  mm = gsap.matchMedia()
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const list = track.value.parentElement
    // translate until the LAST item has risen up through the focus band, so the
    // whole list is scrolled through before the section unpins. Based on the
    // last item's real offset (not scrollHeight) so trailing space can't short it.
    const distance = () =>
      Math.max(0, track.value.lastElementChild.offsetTop - list.clientHeight * 0.15)

    const tween = gsap.to(track.value, {
      y: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'center center',
        end: () => '+=' + distance(),
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    // The web font can change list metrics after mount — recompute once it's ready.
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => tween.scrollTrigger?.kill()
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="root" class="industries container" data-theme-section="light">
    <div class="industries__row">
      <p class="industries__aside t-base">Experience across multiple industries</p>

      <div class="industries__list">
        <ul ref="track" class="industries__track">
          <li v-for="name in industries" :key="name">{{ name }}</li>
        </ul>
      </div>

      <p class="industries__aside t-base">
        From education platforms to SaaS products, healthcare, media, and hospitality.
      </p>
    </div>

    <HpIndustriesAnnotations class="anno--industries" />
  </section>
</template>
