<script setup>
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

// The home portfolio is a bespoke showcase (phone mockups, specific imagery) that
// doesn't map to the generic project-card model, so `projects` stays hardcoded.
// Only the section title + CTA come from the homePage CMS doc.
const props = defineProps({
  title: { type: String, default: null },
  cta: { type: Object, default: null },
  projects: {
    type: Array,
    default: () => [
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
    ],
  },
})

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

onMounted(() => {
  const { gsap, ScrollTrigger } = useGSAP()
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
  // Mirrors the ≥768px tier of the industries latch.
  mm.add('(min-width: 768px)', () => {
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

  // `all` always matches — one context for every width; `reduce` only gates the
  // scale (real motion). The opacity crossfade is the reduced-motion-safe cue
  // and keeps stacked metas from overlapping, so it runs regardless.
  mm.add({ all: 'all', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const rows = gsap.utils.toArray('.project', section.value)
    const triggers = []

    rows.slice(0, -1).forEach((row, i) => {
      const next = rows[i + 1]
      const media = row.querySelector('.project__media')
      const meta = row.querySelector('.project__meta')

      // Cards overlap in flow (see main.css), so the next card starts gaining
      // on this one the instant this row latches — the covering window runs
      // from this row's latch to the next row's latch. Positions come from
      // offsetTop (flow layout, unaffected by sticky latching) against the
      // stage — which never leaves flow and shares the section's top edge —
      // so a ScrollTrigger.refresh() while rows are latched (or the section
      // is parked) can't corrupt the start/end values. stickyTop reads the
      // CSS `top` calc resolved to px, following the per-tier values.
      const stickyTop = () => parseFloat(getComputedStyle(row).top) || 0

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: () => `top+=${row.offsetTop - stickyTop()} top`,
          end: () => `+=${next.offsetTop - row.offsetTop}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      // Recede across the whole window; hold the meta readable through the
      // first 40% of the approach, then fade it out before the cover lands.
      // 0.88 keeps the shrink clearly visible while the risen bottom edge
      // (H·(1−s)/2 ≈ 24px desktop) stays hidden behind the −3em card overlap.
      if (!ctx.conditions.reduce) tl.to(media, { scale: 0.88, ease: 'none', duration: 1 }, 0)
      tl.to(meta, { autoAlpha: 0, ease: 'none', duration: 0.6 }, 0.4)
      triggers.push(tl.scrollTrigger)
    })

    return () => triggers.forEach((t) => t?.kill())
  })
})

// Same transition-aware teardown as HpIndustries: during a page transition
// app.vue freezes this page and kills its triggers itself (without reverting),
// so the frozen snapshot keeps the stack exactly as the user left it. Reverting
// here mid-transition would snap the receded/faded cards back while the page is
// still painted.
const transitioning = useState('page-transitioning', () => false)
onBeforeUnmount(() => {
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
      <article v-for="(p, i) in props.projects" :key="p.title" class="project">
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
      </article>
    </div>

    <div class="portfolio__cta">
      <AppButton class="btn btn--dark" :href="cta.href" :label="cta.label" />
    </div>

    <!-- wordmark-anchored marks: plain overlay, scrolls away with the header -->
    <HpPortfolioAnnotationsDramatic class="anno--portfolio" />
  </section>
</template>
