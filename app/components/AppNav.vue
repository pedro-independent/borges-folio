<script setup>
// On the home page the logo starts big (filling the nav) and shrinks to its
// default size as the user scrolls past the hero. Every other page keeps the
// default (small) logo. The shrink is a single scrubbed transform: scale()
// between the two Figma sizes (1037px → 148.78px wordmark = 6.97×), large
// screens only. The matching `.nav--home` CSS renders the big size server-side
// so there's no small→big flash before this runs.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const logo = useTemplateRef('logo')
const nuxtApp = useNuxtApp()
let mm = null

// Menu drawer open state; always close it when the route changes.
const menuOpen = ref(false)
watch(() => route.path, () => { menuOpen.value = false })

// Logo links home. When we're already on the home page, smooth-scroll to the
// top through Lenis instead of firing a no-op same-route navigation.
function onLogoClick(e) {
  if (!isHome.value) return
  e.preventDefault()
  const lenis = nuxtApp.$lenis
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo(0, 0)
}

// The "Get in touch" CTA routes to the dedicated /contact page through the
// Lenis-aware smooth navigation (so it gets the SPA page transition). The plain
// href keeps it a real link for SSR / no-JS / open-in-new-tab.
const { navigate: smoothNavigate } = useSmoothNav()
function goContact(e) {
  e.preventDefault()
  smoothNavigate('/contact')
}

function teardown() {
  mm?.revert()
  mm = null
  // Reverting the fromTo+ScrollTrigger inside matchMedia can re-apply its "from"
  // (scale 6.97) to the element. AppNav lives in the layout and never remounts,
  // so on client-side nav that stale transform would leak onto other pages —
  // wipe it. On home, setup() re-creates the tween immediately after this.
  if (logo.value) {
    const { gsap } = useGSAP()
    gsap.set(logo.value, { clearProps: 'transform' })
  }
}

function setup() {
  teardown()
  if (!isHome.value || !logo.value) return
  const { gsap } = useGSAP()
  mm = gsap.matchMedia()
  // Big→small logo on scroll; the starting scale matches the design per tier
  // (desktop 1037/152, tablet 519/152).
  const addScrollScale = (query, startScale) => {
    mm.add(query, () => {
      gsap.set(logo.value, { transformOrigin: 'left top' })
      const tween = gsap.fromTo(
        logo.value,
        { scale: startScale },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            start: 0,
            end: () => window.innerHeight * 0.7,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )
      return () => tween.scrollTrigger?.kill()
    })
  }
  addScrollScale('(min-width: 992px)', 6.97)
  addScrollScale('(min-width: 768px) and (max-width: 991px)', 3.41)
}

onMounted(setup)
watch(isHome, () => nextTick(setup)) // re-arm on client-side navigation
onBeforeUnmount(teardown)
</script>

<template>
  <header class="nav" :class="{ 'nav--home': isHome }" data-nav-bar-height>
    <NuxtLink class="nav__logo" to="/" aria-label="Pedro Borges — home" @click="onLogoClick">
      <img ref="logo" src="/img/logo-pedro-borges.svg" alt="Pedro Borges" />
    </NuxtLink>

    <div class="nav__right">
      <button
        class="nav__menu button-004"
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        :aria-expanded="menuOpen"
        data-button-004
        @click="menuOpen = true"
      >
        <span class="nav__menu-label">
          <span class="button-004__inner">
            <span data-button-004-text class="button-004__text is--default">Menu</span>
            <span aria-hidden="true" data-button-004-text class="button-004__text is--hover">Menu</span>
          </span>
        </span>
        <span class="nav__menu-toggle">
          <span class="icon-dots" aria-hidden="true"><span /><span /><span /></span>
        </span>
      </button>

      <div class="nav__cta">
        <AppButton class="btn btn--light" href="/contact" label="Get in touch" @click="goContact" />
      </div>
    </div>

    <AppMenu :open="menuOpen" @close="menuOpen = false" />
  </header>
</template>
