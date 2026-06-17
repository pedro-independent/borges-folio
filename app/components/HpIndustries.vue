<script setup>
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

// List + side labels come from homePage (industries / industriesLeftLabel /
// industriesRightLabel); the Figma copy is the fallback. The CMS list matches the
// fallback length, so the GSAP runway measurements below stay valid either way.
const props = defineProps({
  industries: { type: Array, default: null },
  leftLabel: { type: String, default: null },
  rightLabel: { type: String, default: null },
})

const FALLBACK_INDUSTRIES = [
  'Architecture', 'Banking', 'Cannabis', 'Crypto', 'Cyber Security',
  'Education', 'Entertainment', 'Fashion', 'Food', 'Furniture',
  'Healthcare', 'Investment funds', 'Law', 'Real Estate', 'Sports', 'SaaS',
]
const industries = computed(() => (props.industries?.length ? props.industries : FALLBACK_INDUSTRIES))
const leftLabel = computed(() => props.leftLabel || 'Experience across multiple industries')
const rightLabel = computed(
  () => props.rightLabel || 'From education platforms to SaaS products, healthcare, media, and hospitality.',
)

// The section "pins" with pure CSS `position: sticky` — NOT a GSAP pin. A GSAP
// pin injects a pin-spacer that inflates the document height; reverting it during
// a page transition collapses that height and shifts every section below it,
// which made the industries list jump mid-transition. Sticky changes nothing
// about document height, so the page-transition freeze in app.vue stays exact.
//
// `.industries` is a tall runway; while its extra height scrolls past, the sticky
// child stays latched and a scrubbed (un-pinned) GSAP tween translates the list
// upward, so items rise through the position-based focus-band mask on
// .industries__list. The runway height is set here to `sticky height + distance`
// so the child stays stuck for exactly the tween's travel — and the contact
// section sits flush below, with no empty gap once the list finishes.
const runway = useTemplateRef('runway')
const sticky = useTemplateRef('sticky')
const track = useTemplateRef('track')
let mm = null

onMounted(() => {
  const { gsap, ScrollTrigger } = useGSAP()
  mm = gsap.matchMedia()
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const list = track.value.parentElement

    // Translate until the LAST item has risen up THROUGH and out of the focus band
    // (+15% of the list height past its offset), based on the last item's real
    // offset (not scrollHeight) so trailing space can't short it. offsetTop is
    // transform-independent, so this is stable to call mid-scrub.
    const distance = () =>
      Math.max(0, track.value.lastElementChild.offsetTop + list.clientHeight * 0.15)

    // Sticky element of height H inside a runway of height H + D stays stuck for
    // exactly D px of scroll (the `top` offset cancels out) — so D = the tween's
    // travel keeps the scrub aligned with the stuck phase.
    const sizeRunway = () => {
      runway.value.style.height = sticky.value.offsetHeight + distance() + 'px'
    }
    sizeRunway()

    // Mirror the CSS `top: 7.5em` so the scrub starts the instant the sticky child
    // latches. 7.5em leaves room for the hand-drawn ellipse that overhangs the
    // list top by ~5em (≈ 5em overhang + 2.5em gap of the fluid body font).
    const topGap = () => parseFloat(getComputedStyle(document.body).fontSize) * 7.5

    const tween = gsap.to(track.value, {
      y: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: runway.value,
        start: () => 'top top+=' + topGap(),
        end: () => '+=' + distance(),
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: sizeRunway, // re-measure before ScrollTrigger reads positions
      },
    })
    // The web font can change list metrics after mount — recompute once it's ready.
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => tween.scrollTrigger?.kill()
  })
})

// During a page transition app.vue freezes this page and then tears its triggers
// down itself — WITHOUT reverting — so the sticky runway and the scroll-scrubbed
// list stay exactly as the user left them in the frozen snapshot. If we reverted
// here (on unmount) instead, the runway would collapse and the list would reset
// to the top while the page is still painted, snapping it into frame mid-leave.
// app.vue sets this flag in router.beforeEach, before we unmount, so we can tell a
// transition apart from an ordinary unmount and defer to it. (Width changes go
// through a full reload, so skipping the matchMedia revert here leaks nothing
// that survives a resize.)
const transitioning = useState('page-transitioning', () => false)
onBeforeUnmount(() => {
  if (!transitioning.value) mm?.revert()
})
</script>

<template>
  <section ref="runway" class="industries" data-theme-section="light">
    <div ref="sticky" class="industries__sticky container">
      <div class="industries__row">
        <p class="industries__aside t-base">{{ leftLabel }}</p>

        <div class="industries__list">
          <ul ref="track" class="industries__track">
            <li v-for="name in industries" :key="name">{{ name }}</li>
          </ul>
        </div>

        <p class="industries__aside t-base">{{ rightLabel }}</p>
      </div>

      <HpIndustriesAnnotations class="anno--industries" />
    </div>
  </section>
</template>
