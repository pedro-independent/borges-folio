<script setup>
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

const social = [
  { label: 'Instagram', href: 'https://www.instagram.com/pedro.sm.borges/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pedrosmborges/' },
]
const nav = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Work', to: '/work' },
  { label: 'Contact', to: '/#contact' },
]

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
const nextProject = computed(() => (projectSlug.value ? getNextProject(projectSlug.value) : null))

const ctaLabel = computed(() => (nextProject.value ? 'Next up' : isAbout.value ? 'See work' : 'About me'))
const ctaTarget = computed(() =>
  nextProject.value ? `/work/${nextProject.value.slug}` : isAbout.value ? '/work' : '/about',
)
const photoTint = computed(() => nextProject.value?.tint || null)
let done = false

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
  const { gsap, ScrollTrigger } = useGSAP()
  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const el = cta.value
    if (!el) return
    let inView = false
    let hovering = false
    let hoverTween = null

    // 8s total: "About me" fills first (6.5s), then the arrow (1.5s).
    // Only the auto-fill (not the hover fast-fill) redirects on completion.
    const tl = gsap.timeline({ paused: true, onComplete: () => { if (!hovering) goCta() } })
    tl.to(el, { '--wm-fill': 1, duration: 6.5, ease: 'none' }, 0)
      .to(el, { '--ar-fill': 1, duration: 1.5, ease: 'none' }, 6.5)

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
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', enter)
      el.removeEventListener('focusout', leave)
      hoverTween?.kill()
      tl.kill()
      st.kill()
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
          <div class="footer__photo-frame">
            <div v-if="photoTint" class="footer__photo-tint" :style="{ background: photoTint }" aria-hidden="true" />
            <img v-else src="/img/borges_hero.jpg" alt="Pedro Borges" />
          </div>
        </div>

        <div class="footer__arrow">
          <span class="footer__arrow-layer footer__arrow-layer--base"><IconArrowRight /></span>
          <span class="footer__arrow-layer footer__arrow-layer--fill"><IconArrowRight /></span>
        </div>
      </a>
    </div>
  </footer>
</template>
