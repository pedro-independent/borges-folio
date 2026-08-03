<script setup>
import { computed, onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'

import { ALL_PROJECT_CARDS } from '~/utils/sanityQueries'

// Socials + nav from siteSettings (shared, non-blocking; falls back to the
// hardcoded set until the fetch lands).
const { settings } = useSiteSettings()
const social = computed(() => settings.value.socials.map((s) => ({ label: s.label, href: s.url })))
const nav = computed(() => settings.value.navItems.map((n) => ({ label: n.label, to: n.href })))

// Contextual end-of-page CTA: a fill that runs from 30% → 100% opacity over 8s
// while the footer is in view (pausing when it isn't). On completion or click
// it navigates. Targets by page: a project page advances to the "Next up"
// project, the about page goes back to the work index, everywhere else goes to
// about. Hovering fast-forwards the fill (0.75s) for feedback only; leaving the
// hover rewinds it and restarts the 8s countdown. (The footer is re-keyed per
// route in the layout, so this state resets on navigation.)
const cta = useTemplateRef('cta')
const router = useRouter()
const route = useRoute()
const { navigate } = useSmoothNav()
const isAbout = computed(() => route.path === '/about')

// On a project detail page (/work/[slug]) the footer becomes "Next up".
const projectSlug = computed(() => {
  const m = route.path.match(/^\/work\/([^/]+)\/?$/)
  return m ? m[1] : null
})

// "Next up" resolves against the CMS project list (Studio sortOrder, wrapping,
// coming-soon entries skipped — they have no page to land on). Same shell
// pattern as useSiteSettings: not awaited so the footer never suspends the
// page transition; until the fetch lands (or if the CMS is unreachable / the
// slug isn't published) the static utils/projects order takes over.
const { data: projectCards } = useSanityQuery('projectCards', ALL_PROJECT_CARDS, {}, { lazy: import.meta.client })
const nextProject = computed(() => {
  if (!projectSlug.value) return null
  const cards = (projectCards.value || []).filter((c) => c.slug && !c.comingSoon)
  const i = cards.findIndex((c) => c.slug === projectSlug.value)
  if (i !== -1 && cards.length > 1) return cards[(i + 1) % cards.length]
  return getNextProject(projectSlug.value)
})

const ctaLabel = computed(() => (nextProject.value ? 'Next up' : isAbout.value ? 'See work' : 'About me'))
const ctaTarget = computed(() =>
  nextProject.value ? `/work/${nextProject.value.slug}` : isAbout.value ? '/work' : '/about',
)
// Photo frame on project pages: the next project's cover (CDN-resized — the
// frame paints at ~258px, so 640 covers 2× screens). Static fallback entries
// carry a hex in `cover`, which isn't a URL — those (and coverless CMS cards)
// fall through to the flat tint.
const photoCover = computed(() => {
  const c = nextProject.value?.cover
  return c && !c.startsWith('#') ? `${c}?w=640&fit=max&auto=format` : null
})
const photoTint = computed(() => (photoCover.value ? null : nextProject.value?.tint || null))
// Page-transition state from app.vue — the entrance trigger must not be created
// mid-transition (see the note where it's built below).
const transitioning = useState('page-transitioning', () => false)
let done = false

// Live seconds until the auto-advance fires — shown in the hand-drawn
// "Good things come to those who wait [n]" note (Figma 290:14449). Mirrors
// the CTA timeline: counts down while it plays, freezes when it pauses
// (footer off-screen), races on hover fast-fill and rewinds with the reset.
// Under reduced motion the timeline never runs, so it stays a static [12].
const secondsLeft = ref(12)

function goCta(e) {
  e?.preventDefault?.()
  if (done) return
  done = true
  router.push(ctaTarget.value)
}

// Footer nav links: route through Lenis-aware smooth navigation.
function goLink(to, e) {
  e.preventDefault()
  navigate(to)
}

let mm = null
onMounted(() => {
  const { gsap, ScrollTrigger, lazyLoadPlugin } = useGSAP()
  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const el = cta.value
    if (!el) return
    let inView = false
    let hovering = false
    let hoverTween = null

    // — Entrance (once, when the CTA scrolls into view) —
    // 1. The wordmark letters rise out of the box bottom with a stagger (both
    //    stacked layers split identically so muted + fill stay superimposed;
    //    .footer__wordmark's overflow:hidden is the mask).
    // 2. The arrow starts parked against the wordmark (shifted left by the
    //    photo slot, measured at runtime — the slot narrows on tablet and is
    //    gone on mobile) and slides to its resting place while the photo
    //    clip-reveals in the gap it opens.
    const layers = Array.from(el.querySelectorAll('.footer__wordmark p'))
    const photo = el.querySelector('.footer__photo')
    const arrow = el.querySelector('.footer__arrow')
    const gapPx = parseFloat(getComputedStyle(el).columnGap) || 0
    const slideDx = photo?.offsetWidth ? -(photo.offsetWidth + gapPx) : 0

    // Pre-split initial state, applied before first paint: whole layers sit
    // below the box (clipped), the arrow is hidden (revealed bottom-up with the
    // letters) and parked, the photo hidden.
    gsap.set(layers, { yPercent: 110 })
    gsap.set(arrow, { clipPath: 'inset(100% 0% 0% 0%)' })
    if (slideDx) {
      gsap.set(arrow, { x: slideDx })
      gsap.set(photo, { clipPath: 'inset(0% 100% 0% 0%)' })
    }

    const entrance = gsap.timeline({ paused: true, defaults: { ease: 'osmo' } })
    let split = null
    let entranceSt = null
    let stopWait = null
    let disposed = false

    ;(async () => {
      // Chars need SplitText (club plugin) — degrade to revealing each layer
      // as one block if it can't load.
      let SplitText = null
      try {
        SplitText = await lazyLoadPlugin('SplitText')
      } catch {
        /* block reveal fallback below */
      }
      if (disposed) return

      if (SplitText) {
        split = new SplitText(layers, { type: 'chars' })
        gsap.set(layers, { yPercent: 0 })
        // One tween per layer so the stagger restarts per copy and the two
        // stacks rise in perfect sync.
        layers.forEach((layer) => {
          const chars = split.chars.filter((c) => layer.contains(c))
          entrance.fromTo(
            chars,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.8, stagger: 0.05 },
            0,
          )
        })
      } else {
        entrance.to(layers, { yPercent: 0, duration: 0.8 }, 0)
      }
      // The arrow reveals bottom-to-top alongside the letters (still parked at
      // the wordmark), then slides to its resting place once they've landed.
      const lettersEnd = entrance.duration()
      entrance.to(arrow, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8 }, 0)
      if (slideDx) {
        entrance
          .to(arrow, { x: 0, duration: 0.9 }, lettersEnd - 0.3)
          .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 }, '<')
      }

      // This footer is re-keyed per route, so it mounts MID page transition —
      // while the incoming page is position:fixed (out of flow) the document
      // collapses and the footer sits near the top, inside the trigger window.
      // Creating the once-only trigger now would fire it instantly while the
      // shell is hidden, silently spending the entrance before the user ever
      // scrolls to it. Wait until app.vue flags the transition done (layout
      // settled + ScrollTrigger.refresh() run), then create it — positions are
      // then measured against the real page. On a hard load the flag is
      // already false and this resolves immediately.
      if (transitioning.value) {
        await new Promise((resolve) => {
          stopWait = watch(transitioning, (v) => {
            if (!v) { stopWait(); stopWait = null; resolve() }
          })
        })
      }
      if (disposed) return

      entranceSt = ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => entrance.play(),
      })
    })()

    // 12s total: the label fills first (10.5s), then the arrow (1.5s).
    // Only the auto-fill (not the hover fast-fill) redirects on completion.
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => { if (!hovering) goCta() },
      onUpdate: () => { secondsLeft.value = Math.max(0, Math.ceil(tl.duration() - tl.time())) },
    })
    tl.to(el, { '--wm-fill': 1, duration: 10.5, ease: 'none' }, 0)
      .to(el, { '--ar-fill': 1, duration: 1.5, ease: 'none' }, 10.5)
    secondsLeft.value = Math.ceil(tl.duration())

    const enter = () => {
      hovering = true
      hoverTween?.kill()
      // fast-fill for feedback only — navigation happens on click, not here
      hoverTween = tl.tweenTo(tl.duration(), { duration: 0.75, ease: 'power2.out' })
    }
    const leave = () => {
      hovering = false
      hoverTween?.kill()
      // rewind & reset completely, then restart the auto countdown
      hoverTween = tl.tweenTo(0, {
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          tl.pause(0)
          if (inView) tl.play()
        },
      })
    }

    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', enter)
    el.addEventListener('focusout', leave)

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      end: 'bottom 5%',
      onToggle: (self) => {
        inView = self.isActive
        if (hovering) return
        if (inView) tl.play()
        else tl.pause()
      },
    })
    // honour the initial state (the footer may already be on screen)
    inView = st.isActive
    if (inView) tl.play()

    return () => {
      disposed = true
      stopWait?.()
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', enter)
      el.removeEventListener('focusout', leave)
      hoverTween?.kill()
      tl.kill()
      st.kill()
      entranceSt?.kill()
      entrance.kill()
      split?.revert()
      gsap.set(layers, { clearProps: 'transform' })
      if (photo) gsap.set(photo, { clearProps: 'clipPath' })
      if (arrow) gsap.set(arrow, { clearProps: 'transform,clipPath' })
    }
  })
})
onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <footer id="about" class="footer container" data-theme-section="light">
    <div class="footer__inner">
      <nav class="footer__links t-base">
        <div class="footer__links-col">
          <a v-for="l in social" :key="l.label" data-underline-link :href="l.href" target="_blank" rel="noopener">{{ l.label }}</a>
        </div>
        <div class="footer__links-col">
          <a v-for="l in nav" :key="l.label" data-underline-link :href="l.to" @click="goLink(l.to, $event)">{{ l.label }}</a>
        </div>
      </nav>

      <a ref="cta" :href="ctaTarget" class="footer__bottom" :aria-label="ctaLabel" @click="goCta">
        <div class="footer__wordmark">
          <p class="t-display-l is-muted">{{ ctaLabel }}</p>
          <p class="t-display-l footer__wordmark-fill">{{ ctaLabel }}</p>
        </div>

        <div class="footer__photo">
          <!-- Project pages: next project's cover, else its tint, else the
               frame's own gradient placeholder (a portrait would read wrong
               under "Next up"). Elsewhere: the portrait. -->
          <div class="footer__photo-frame">
            <img v-if="photoCover" :src="photoCover" :alt="`${nextProject.title} — cover`" />
            <div v-else-if="photoTint" class="footer__photo-tint" :style="{ background: photoTint }" aria-hidden="true" />
            <img v-else-if="!nextProject" src="/img/borges_hero.jpg" alt="Pedro Borges" />
          </div>
        </div>

        <div class="footer__arrow">
          <span class="footer__arrow-layer footer__arrow-layer--base"><IconArrowRight /></span>
          <span class="footer__arrow-layer footer__arrow-layer--fill"><IconArrowRight /></span>
        </div>
      </a>
    </div>

    <!-- Hand-drawn note (Figma 290:14449); [n] counts down the auto-advance -->
    <AnnotationLayer class="anno--footer">
      <div class="anno__note anno__note--ft-wait">
        <p>Good things come to<br />those who wait [{{ secondsLeft }}]</p>
      </div>
    </AnnotationLayer>
  </footer>
</template>
