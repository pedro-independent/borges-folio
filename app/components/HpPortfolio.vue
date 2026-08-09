<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, resolveComponent, useTemplateRef, watch } from 'vue'

// The showcase reads the homePage doc's curated `portfolioProjects` (passed in
// by index.vue as raw CMS cards) — each card links to its case study. The
// Figma copy below is the offline fallback; its rows carry no slug, so they
// render as plain articles.
const props = defineProps({
  title: { type: String, default: null },
  cta: { type: Object, default: null },
  projects: { type: Array, default: null },
})

const FALLBACK_PROJECTS = [
  {
    title: 'Nova – Executive Education',
    subtitle: 'Executive Education Platform',
    role: 'Lead UX/UI Designer',
    media: { type: 'blank' },
  },
  {
    title: 'MEO Beachcam',
    subtitle: 'Medical cannabis healthcare provider platform',
    role: 'Lead UX/UI Designer',
    media: { type: 'phone', screen: '/img/meo-screen.png', frame: '/img/meo-phone.png' },
  },
  {
    title: 'ClickGuard',
    subtitle: 'B2B SaaS Conversion focused website',
    role: 'Lead UX/UI Designer',
    media: { type: 'image', src: '/img/project-clickguard.png' },
  },
  {
    title: 'Amuse Bouche',
    subtitle: 'Award-winning marketing consultant agency website',
    role: 'UX/UI Designer',
    media: { type: 'image', src: '/img/project-amusebouche.png', bg: 'lavender' },
  },
]

// CMS card → showcase row. The third meta line shows the project's category
// (the card projection carries no role field); the cover renders as the media
// (CDN-resized — the card paints at 520px, so 1200 covers 2× screens), with
// the legacy tint as a flat placeholder when no cover is uploaded yet.
const projects = computed(() => {
  if (!props.projects?.length) return FALLBACK_PROJECTS
  return props.projects.map((p) => ({
    title: p.title,
    subtitle: p.subtitle,
    role: p.category || '',
    slug: p.comingSoon ? null : p.slug,
    media: p.cover
      ? { type: 'image', src: `${p.cover}?w=1200&fit=max&auto=format` }
      : { type: 'blank', tint: p.tint },
  }))
})

// Published cards link to their case study; fallback/coming-soon rows stay
// plain <article>s (same convention as the work page grid).
const NuxtLink = resolveComponent('NuxtLink')
const rowIs = (p) => (p.slug ? NuxtLink : 'article')
const rowTo = (p) => (p.slug ? `/work/${p.slug}` : undefined)

const title = computed(() => props.title || 'My portfolio')
const cta = computed(() => props.cta || { label: 'View more projects', href: '#work' })

// Even rows: media left of centre, text right. Odd rows: text left, media right.
const textRight = (i) => i % 2 === 0

// --- Stacking cards (lightshiprv.com reference) ---------------------------
// The stack itself is pure CSS: each `.project` row is `position: sticky`
// (see main.css) so it latches in the viewport and the next row scrolls up over
// it — no GSAP pin, no pin-spacer, so the page-transition freeze stays exact.
// GSAP only adds the depth cues, scrubbed to the covering scroll: the card being
// covered recedes (scale) and its meta text fades out — without the fade, the
// metas of rows 1/3 (and 2/4) would pile up in the same spot once stacked.
const section = useTemplateRef('section')
let mm = null

// (Re)build all scroll work against the CURRENT row elements. The home fetch is
// lazy, so on a hard load the component mounts with the fallback rows and the
// CMS cards re-render them as new elements (article → NuxtLink) — tweens built
// at mount would keep pointing at the detached fallback nodes and the metas
// would never fade. The projects watcher below tears down and rebuilds.
function build() {
  const { gsap, ScrollTrigger } = useGSAP()
  mm?.revert()
  mm = gsap.matchMedia()

  // The scrub triggers need a FLOW-STABLE trigger element (one whose rect a
  // mid-scroll refresh can trust). The section itself parks (sticky) while the
  // industries block is latched, so use the .home__stage wrapper instead — it
  // shares the section's top edge, so the same offsets hold. Fall back to the
  // section when unwrapped (the park CSS is scoped to the wrapper, so the
  // section is flow-static in that case anyway).
  const stage = section.value.closest('.home__stage') || section.value

  // Park the portfolio while the industries block (next in the stage) is
  // latched, and release it IN SYNC with that block. Three coupled pieces,
  // all measured from the industries block so main.css stays the source:
  //  - top = latch line − content height → parks the instant the content
  //    bottom meets the latching industries block (they're flow-adjacent).
  //  - padding-bottom += industries block height, industries margin-top −=
  //    the same → net-zero layout, but the sticky BOX now ends exactly where
  //    the industries block's box ends. Sticky containment (.home__stage)
  //    therefore pushes this section at the SAME scroll where the industries
  //    block releases — both ride up in flow-lockstep afterwards, portfolio
  //    bottom kissing the industries top, reading as normal scrolling
  //    instead of one section sliding over the other.
  // All widths — mirrors the industries latch, which runs on every tier. The
  // reveal scrub only runs without reduced motion, but parking is inert when
  // the runway never grows, so the broader gate is safe.
  mm.add('all', () => {
    const el = section.value
    const basePad = parseFloat(getComputedStyle(el).paddingBottom) || 0
    const industries = document.querySelector('.industries')
    const block = document.querySelector('.industries__sticky')
    const park = () => {
      if (!industries || !block) return // no industries section — never park
      const latch = parseFloat(getComputedStyle(block).top)
      if (Number.isNaN(latch)) return
      const blockH = block.offsetHeight
      el.style.paddingBottom = basePad + blockH + 'px'
      industries.style.marginTop = -blockH + 'px'
      // offsetHeight includes the extended padding — subtract it back to park
      // the CONTENT bottom (CTA + original padding) at the latch line.
      el.style.top = latch - (el.offsetHeight - blockH) + 'px'
    }
    park()
    ScrollTrigger.addEventListener('refreshInit', park) // re-measure with every refresh
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', park)
      el.style.top = ''
      el.style.paddingBottom = ''
      if (industries) industries.style.marginTop = ''
    }
  })

  // ≥480 only — on the mobile tier the rows aren't sticky (see main.css), so
  // there's no stack to embellish and the cards scroll as plain content.
  // Reduced motion only gates the scale (real motion): the opacity crossfade is
  // the reduced-motion-safe cue that keeps stacked metas from overlapping, so
  // it runs whenever the stack itself does.
  mm.add('(min-width: 480px)', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rows = gsap.utils.toArray('.project', section.value)
    const last = rows[rows.length - 1]
    const triggers = []

    // Cards overlap in flow (see main.css), so the next card starts gaining on
    // this one the instant this row latches — one covering window runs from
    // each row's latch to the next row's latch. Positions come from offsetTop
    // (flow layout, unaffected by sticky latching) against the stage — which
    // never leaves flow and shares the section's top edge — so a
    // ScrollTrigger.refresh() while rows are latched (or the section is parked)
    // can't corrupt the start/end values. stickyTop reads the CSS `top` calc
    // resolved to px, following the per-tier values.
    const stickyTop = (row) => parseFloat(getComputedStyle(row).top) || 0
    const startAt = (row) => `top+=${row.offsetTop - stickyTop(row)} top`

    // Depth cue: a card recedes one STEP for EVERY card that stacks on top of
    // it, so the pile reads as receding steps (card n−1 smallest) rather than
    // every covered card flattening to one shared size — with a single shrink
    // the second and third cards ended up the same scale and looked aligned.
    // One tween per card spanning latch → last latch does this in a single
    // pass: windows are equal (equal row heights), so linear travel over
    // `covers` windows lands exactly one step per window, and each media has
    // exactly one tween touching it (no fromTo start-value races between
    // overlapping scrubs). The step matches the size difference the reference
    // pile reads at: ~10% between neighbours, small enough to stay a depth cue
    // rather than a shrink.
    const STEP = 0.1
    if (!reduce) {
      rows.slice(0, -1).forEach((row, i) => {
        const covers = rows.length - 1 - i
        const tween = gsap.fromTo(
          row.querySelector('.project__media'),
          { scale: 1 },
          {
            scale: 1 - covers * STEP,
            ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: () => startAt(row),
              end: () => `+=${last.offsetTop - row.offsetTop}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
        triggers.push(tween.scrollTrigger)
      })
    }

    // Meta fade, scrubbed to this card's own covering window only: hold it
    // readable through the first 40% of the approach, then fade out before the
    // cover lands — without it the metas of rows 1/3 (and 2/4) would pile up in
    // the same spot once stacked.
    rows.slice(0, -1).forEach((row, i) => {
      const next = rows[i + 1]
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: () => startAt(row),
          end: () => `+=${next.offsetTop - row.offsetTop}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      tl.to(row.querySelector('.project__meta'), { autoAlpha: 0, ease: 'none', duration: 0.6 }, 0.4)
      triggers.push(tl.scrollTrigger)
    })

    return () => triggers.forEach((t) => t?.kill())
  })
}

onMounted(build)

// Fallback → CMS swap (or any later edit of the curated list): wait for the new
// rows to render, then rebind. Deferred (not skipped) during a page transition:
// on client-side navigation home the payload cache is hydration-only, so the
// fetch re-runs and resolves while the incoming page is still position:fixed —
// rebuilding then would measure the clipped layout, but never rebuilding leaves
// the scrubs bound to the detached fallback rows (metas pile up in the stack).
// Wait for app.vue to settle the page (clearProps + ScrollTrigger.refresh),
// then rebind against the real rows — same pattern as AppFooter's entrance.
let stopWait = null
watch(projects, async () => {
  await nextTick()
  if (!section.value) return
  if (!transitioning.value) return build()
  if (stopWait) return // already waiting; the rebuild reads the latest rows
  stopWait = watch(transitioning, (v) => {
    if (v) return
    stopWait()
    stopWait = null
    if (section.value) build()
  })
})

// Same transition-aware teardown as HpIndustries: during a page transition
// app.vue freezes this page and kills its triggers itself (without reverting),
// so the frozen snapshot keeps the stack exactly as the user left it. Reverting
// here mid-transition would snap the receded/faded cards back while the page is
// still painted.
const transitioning = useState('page-transitioning', () => false)
onBeforeUnmount(() => {
  stopWait?.()
  stopWait = null
  if (!transitioning.value) mm?.revert()
})
</script>

<template>
  <section id="work" ref="section" class="portfolio container" data-theme-section="light">
    <h2 class="portfolio__title"><span class="t-display-xl">{{ title }}</span></h2>

    <div class="portfolio__rows">
      <!-- Card-anchored marks (hatch + "spacing" note). Lives INSIDE the rows
           with the same sticky top and box height as a card row, so it pins
           the instant card 1 latches and UNPINS with the pile when the stack
           animation ends — both synced by construction, not by tuned offsets. -->
      <div class="portfolio__anno-pin">
        <HpPortfolioAnnotations class="anno--portfolio" />
      </div>
      <!-- Whole row is the link (media or text hits both navigate); fallback
           and coming-soon rows render as plain <article>s instead. -->
      <component
        :is="rowIs(p)"
        v-for="(p, i) in projects"
        :key="p.title"
        :to="rowTo(p)"
        class="project"
        :aria-label="p.slug ? `${p.title} — view case study` : undefined"
      >
        <!-- spacer first when text is on the right -->
        <div v-if="textRight(i)" class="project__spacer" />

        <!-- text on the left -->
        <div v-else class="project__meta">
          <p class="project__name t-base">{{ p.title }}</p>
          <p class="project__desc t-base">{{ p.subtitle }}</p>
          <p class="project__role t-mono">{{ p.role }}</p>
        </div>

        <!-- media card -->
        <div
          class="project__media"
          :class="{
            'project__media--blank': p.media.type === 'blank',
            'project__media--lavender': p.media.bg === 'lavender' || p.media.type === 'phone',
          }"
          :style="p.media.type === 'blank' && p.media.tint ? { background: p.media.tint } : undefined"
        >
          <img v-if="p.media.type === 'image'" :src="p.media.src" :alt="p.title" />

          <div v-else-if="p.media.type === 'phone'" class="project__phone">
            <div class="project__phone-inner">
              <div class="project__phone-screen"><img :src="p.media.screen" alt="" /></div>
              <img class="project__phone-frame" :src="p.media.frame" alt="" />
            </div>
          </div>
        </div>

        <!-- text on the right -->
        <div v-if="textRight(i)" class="project__meta">
          <p class="project__name t-base">{{ p.title }}</p>
          <p class="project__desc t-base">{{ p.subtitle }}</p>
          <p class="project__role t-mono">{{ p.role }}</p>
        </div>

        <!-- spacer last when text is on the left -->
        <div v-else class="project__spacer" />
      </component>
    </div>

    <div class="portfolio__cta">
      <AppButton class="btn btn--dark" :href="cta.href" :label="cta.label" />
    </div>

    <!-- wordmark-anchored marks: plain overlay, scrolls away with the header -->
    <HpPortfolioAnnotationsDramatic class="anno--portfolio" />
  </section>
</template>
