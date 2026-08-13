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
// upward, items hard-clipping at the overflow-hidden window edges of
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
  // All widths. The diagonal entry below runs at every tier — it's driven purely
  // by each word's position ON SCREEN, so it doesn't care whether the list is
  // latched or scrolling past with the page. Only the two pieces that depend on
  // the CSS latch are gated: from the tablet tier up the block pins and the
  // track is scrubbed up through a fixed window, while on phones
  // (.industries__sticky is static, the window grows to fit — see main.css) the
  // words simply rise with the page and the runway/scrub would be dead height
  // translating an already-moving list.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const list = track.value.parentElement
    // Width changes force a reload, so this is read once per context.
    const latches = window.innerWidth >= 480

    // Translate until the LAST item's top reaches the TOP of the list window:
    // every other item rises up and out, and the last one comes to rest
    // visible at the top. The mostly-emptied window this leaves at the end is
    // overlapped by the contact section (negative margin, see .contact in
    // main.css) so no dead cream gap scrolls by. offsetTop is
    // transform-independent, so this is stable to call mid-scrub.
    const distance = () => Math.max(0, track.value.lastElementChild.offsetTop)

    // Sticky element of height H inside a runway of height H + D stays stuck for
    // exactly D px of scroll (the `top` offset cancels out) — so D = the tween's
    // travel keeps the scrub aligned with the stuck phase.
    const sizeRunway = () => {
      runway.value.style.height = sticky.value.offsetHeight + distance() + 'px'
    }
    if (latches) sizeRunway()

    // Read the CSS sticky `top` (a 50vh-centering calc) RESOLVED to px, so the
    // scrub starts the instant the sticky child latches — CSS is the single
    // source of truth and the two can't drift.
    const topGap = () => parseFloat(getComputedStyle(sticky.value).top) || 0

    // --- Diagonal entry ------------------------------------------------
    // Each word slides in from the right as it rises, so its path through the
    // window reads as a diagonal. The offset is computed from each word's live
    // position rather than given a per-item ScrollTrigger: the track is
    // transform-scrubbed, and ScrollTrigger bakes trigger positions from
    // getBoundingClientRect at refresh — on a moving element those go stale the
    // moment the scrub starts. Screen position = the list's rect top +
    // offsetTop (layout, transform-independent) + the track's current y, which
    // stays exact at any scroll progress.
    const items = gsap.utils.toArray('li', track.value)
    const setX = items.map((el) => gsap.quickSetter(el, 'x', 'px'))
    // The entry zone is measured against the VIEWPORT, not the list window: the
    // window is ~770px tall but latches at 42vh, so its bottom sits well below
    // the fold. Keying the fan to the window's bottom edge would spend almost
    // all of it off-screen (measured: ~8px of visible travel). Words therefore
    // start their slide as they cross into the bottom ENTRY band of the screen
    // and are aligned by the top of it. The list clips top/bottom only (see the
    // clip-path in main.css), so an offset word stays fully readable while it
    // travels rather than being sliced at the window's right edge.
    const ENTRY = 0.4 // band height, × viewport height
    // Offset at the band's bottom, × list width. The desktop frame parks the
    // window between two 16em captions with ~5.7em of slack either side, and the
    // list no longer clips its sides, so the fan can swing wide — a word starts
    // most of a window-width out to the right and visibly travels in. Below 992
    // the list spans the whole row (see main.css), where that same multiplier
    // would start the words off the side of the screen, so it keeps the original
    // tighter throw. Width changes force a reload, so this is read once here.
    const TRAVEL = () => (window.innerWidth >= 992 ? 0.8 : 0.45)
    // Eased so a word decelerates into alignment instead of arriving linearly.
    const ease = gsap.parseEase('power2.in')

    let tops = []
    let winH = 0
    let vh = 0
    let bandH = 0
    let maxX = 0
    // Per-item layout reads happen ONLY here (on refresh); the per-frame update
    // below reads a single rect, so reads and writes never interleave per item.
    const measure = () => {
      tops = items.map((el) => el.offsetTop)
      winH = list.offsetHeight
      vh = window.innerHeight
      bandH = vh * ENTRY
      maxX = list.offsetWidth * TRAVEL()
    }
    const drawEntry = () => {
      // One rect read for the window's screen position — covers both phases
      // (scrolling in, then latched) without special-casing either. Transform
      // changes don't invalidate layout, so this stays cheap.
      const listTop = list.getBoundingClientRect().top
      const ty = gsap.getProperty(track.value, 'y') // from GSAP's cache, no layout
      // Words enter at the fold — or, where the list latches (and so clips at a
      // fixed window), at the window's own bottom edge once that rises above the
      // fold at the end of the section. Unlatched the list doesn't clip and its
      // bottom edge travels with the page, so keying to it would drag the settle
      // line along with the words themselves: the tail of the list would freeze
      // part-way through its slide and never straighten up. There the fold is
      // the only fixed reference, so every word completes its travel.
      const enterY = latches ? Math.min(listTop + winH, vh) : vh
      const settleY = enterY - bandH
      for (let i = 0; i < items.length; i++) {
        const p = (listTop + tops[i] + ty - settleY) / bandH
        setX[i](ease(gsap.utils.clamp(0, 1, p)) * maxX)
      }
    }

    // Latched tiers only: hold the block still and pull the track up through the
    // window. On phones there's no pin to scroll against — the list rises with
    // the page instead, and the entry trigger below is the whole animation.
    const tween = latches
      ? gsap.to(track.value, {
          y: () => -distance(),
          ease: 'none',
          onUpdate: drawEntry, // tween frames, so scrub LAG stays in sync too
          scrollTrigger: {
            trigger: runway.value,
            start: () => 'top top+=' + topGap(),
            end: () => '+=' + distance(),
            scrub: true,
            invalidateOnRefresh: true,
            onRefreshInit: sizeRunway, // re-measure before ScrollTrigger reads positions
          },
        })
      : null
    // The scrub only runs once latched, but the words are on screen before that
    // — this spans the whole runway so they also slide while the section is
    // still scrolling into view. Unlatched (mobile) it drives the fan outright.
    const entry = ScrollTrigger.create({
      trigger: runway.value,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: drawEntry,
      onRefresh: () => {
        measure() // after ScrollTrigger has settled the layout
        drawEntry()
      },
    })
    measure()
    drawEntry()
    // The web font can change list metrics after mount — recompute once it's ready.
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => {
      tween?.scrollTrigger?.kill()
      entry.kill()
      // quickSetter writes bypass matchMedia's revert bookkeeping, so clear the
      // offsets by hand or they'd survive a context revert (e.g. a width change
      // crossing into the mobile tier, where the list is static).
      gsap.set(items, { x: 0 })
    }
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
