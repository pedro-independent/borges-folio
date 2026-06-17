<script setup>
useHead({ titleTemplate: (t) => (t ? `${t} — Pedro Borges` : 'Pedro Borges — UX/UI Designer') })

// Grab the Nuxt app once in setup so the transition hooks can reach $lenis
// (provided by the client plugin) without calling useNuxtApp() outside context.
const nuxtApp = useNuxtApp()

// Hides the persistent shell (nav + footer) while a page transition runs. The
// footer is re-keyed per route so it remounts mid-transition; a reactive class
// on the layout (CSS) is the only thing that reliably catches that new node.
// The nav never remounts, so it's driven directly with GSAP for the entrance.
const transitioning = useState('page-transitioning', () => false)

// Scroll position of the outgoing page, captured the instant navigation is
// requested — BEFORE the incoming page mounts and goes position:fixed (which
// collapses the document height and makes the browser clamp window.scrollY).
// A router.beforeEach guard is the earliest, most reliable hook: page:start can
// fire after onLeave when the destination has no async setup, leaving this at 0
// so the frozen page snaps to the top instead of staying where the user was.
let frozenScrollY = 0
if (import.meta.client) {
  useRouter().beforeEach((to, from) => {
    frozenScrollY = window.scrollY
    // Flag the transition NOW — before the outgoing page unmounts — so its
    // sections can skip their own matchMedia teardown. Otherwise a section like
    // HpIndustries reverts on unmount (collapsing its sticky runway height and
    // resetting its scroll-scrubbed list) WHILE this page is still painted and
    // being frozen below, which snapped the industries list into frame. app.vue
    // then tears those triggers down itself (without reverting) once frozen.
    // Guard the initial load (no previous route) and same-path hash navigations,
    // which don't run the page transition, so the shell isn't left hidden.
    if (from.matched.length && to.path !== from.path) transitioning.value = true
  })
}

function hideNav() {
  const { gsap } = useGSAP()
  const nav = document.querySelector('.nav')
  if (nav) gsap.set(nav, { autoAlpha: 0 })
}

function revealNav() {
  const { gsap } = useGSAP()
  const nav = document.querySelector('.nav')
  if (!nav) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(nav, { clearProps: 'opacity,visibility,transform' })
    return
  }
  gsap.fromTo(
    nav,
    { autoAlpha: 0, y: '-1.5em' },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE, onComplete: () => gsap.set(nav, { clearProps: 'transform' }) },
  )
}

const DURATION = 1.2
const EASE = 'osmo' // brand CustomEase, registered in useGSAP()

// Pages are transparent (the cream comes from <body>), so while both float
// detached during the transition they'd show through each other — paint each
// one with the page background so the incoming page fully occludes the outgoing.
const PAGE_BG = 'var(--color-cream)'

// During the transition the leaving page goes position:fixed and scales down,
// so <body> becomes the backdrop behind it. Paint <body> blue for the duration
// so that revealed border reads as the brand blue, then restore it to the cream
// page background (which normally shows through the transparent pages) on finish.
const BACKDROP_BG = 'var(--color-blue)'

function resetScrollTop() {
  const lenis = nuxtApp.$lenis
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

// `mode: 'default'` keeps both pages in the DOM at once so they can overlap:
// the outgoing page shrinks + darkens underneath while the incoming page slides
// up over it from the bottom. GSAP drives it (css: false), resolving via done().
const pageTransition = {
  mode: 'default',
  css: false,

  onLeave(el, done) {
    const { gsap, ScrollTrigger } = useGSAP()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Hide the shell for the whole transition: the nav would otherwise flash the
    // wrong theme / resize its logo, and the re-keyed footer would jump to the
    // top as the outgoing page leaves the flow.
    transitioning.value = true
    hideNav()
    // Reveal the brand blue in the border the shrinking page exposes.
    document.body.style.backgroundColor = BACKDROP_BG

    // Tear down THIS page's ScrollTriggers before we detach it / reset scroll.
    // It's a discarded snapshot — its triggers are rebuilt fresh by each
    // component's onMounted on the next visit, so we kill (not disable) them.
    //
    // WHY kill, not disable(false): disable(false) SKIPS the pin revert and never
    // removes the trigger from GSAP's global list, leaving a disabled-but-
    // unreverted orphan whose pin-spacer is still in the DOM. The incoming page's
    // finish() ScrollTrigger.refresh() then runs _revertAll over EVERY listed
    // trigger (no enabled check) and _swapPinOut's that orphan — collapsing the
    // industries pin-spacer while this frozen snapshot is still painted (the
    // "industries drop to the footer"). kill() reverts the pin HERE, synchronously
    // (one swapPinOut, before any paint, absorbed into the freeze) AND splices the
    // trigger out of the global list, so the later refresh() can never touch it.
    //
    // Pinned triggers are killed WITH revert (remove the spacer); non-pinned
    // reveals are killed WITHOUT revert so they stay revealed on the snapshot.
    // Scoped via el.contains so the incoming page's and the layout's (nav/footer)
    // triggers are untouched.
    const vh = window.innerHeight
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger && el.contains(st.trigger)) st.kill(!!st.pin)
    })

    // Freeze the outgoing page exactly where the user left it (top: -scrollY),
    // detached from flow, then send the document to the top for the incoming
    // page. The transform-origin is the viewport centre so it scales in place.
    //
    // `el` sits at the document top, so its own scroll offset equals
    // frozenScrollY — freeze there to reproduce the viewport 1:1. The layout
    // footer lives BELOW `el` (and is hidden for the transition), so wherever
    // `el`'s content ends we simply show the page background; we must NOT pull
    // the view up to `el`'s bottom (the old `min(frozenScrollY, offsetHeight-vh)`
    // did that, snapping the tall industries section into frame when the user
    // was down in the footer). Clamp ONLY if `el` has been scrolled entirely
    // above the viewport — possible if the footer is taller than the viewport —
    // so the frozen page can never collapse to a blank background.
    const y = frozenScrollY < el.offsetHeight ? frozenScrollY : Math.max(0, el.offsetHeight - vh)
    gsap.set(el, {
      position: 'fixed',
      top: -y,
      left: 0,
      width: '100%',
      overflow: 'hidden',          // clip content to the rounded corners
      borderRadius: '0.5em',         // present from the first frame (not animated in)
      zIndex: 5,
      backgroundColor: PAGE_BG,
      transformOrigin: `50% ${y + vh / 2}px`,
      // Establish the transform up front (identity scale) so this element is the
      // containing block for any fixed/sticky descendants the moment we freeze,
      // and so the scale tween below animates from a set value. `resetScrollTop`
      // sends the document to 0; the live transform keeps in-page sticky sections
      // resolving against the frozen page (off-screen at top:-y) rather than
      // snapping toward the viewport.
      scale: 1,
    })
    resetScrollTop()

    // Black scrim that fades in over the shrinking page (30% at full).
    const scrim = document.createElement('div')
    Object.assign(scrim.style, {
      position: 'absolute',
      inset: '0',
      background: '#000',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '2',
    })
    el.appendChild(scrim)

    if (reduce) return done()

    gsap
      .timeline({ onComplete: done })
      .to(el, { scale: 0.9, duration: DURATION, ease: EASE }, 0)
      .to(scrim, { opacity: 0.5, duration: DURATION, ease: EASE }, 0)
  },

  onEnter(el, done) {
    const { gsap, ScrollTrigger } = useGSAP()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Incoming page pinned to the viewport, above the outgoing one, then slid
    // up from one viewport-height below. Clear all inline styles on finish so it
    // settles back into normal flow at the top (scroll was reset in onLeave).
    gsap.set(el, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      borderRadius: '0.5em',         // held, then flattened late by the timeline below
      zIndex: 6,
      backgroundColor: PAGE_BG,
    })
    const finish = () => {
      // Incoming page now covers the viewport — drop the blue backdrop back to
      // the cream page background before the page returns to normal flow.
      document.body.style.backgroundColor = ''
      gsap.set(el, { clearProps: 'all' })
      // The page's own ScrollTriggers were created while it was fixed/clipped,
      // so their start/end + pin positions are wrong. Now that it's back in
      // normal flow at the top, recompute them all.
      ScrollTrigger.refresh()
      // Re-run section-theme detection against the settled layout so the nav
      // reveals with the correct colour (e.g. white over the dark hero) rather
      // than its stale value, then bring the shell back.
      nuxtApp.callHook('page:transition:done')
      transitioning.value = false
      revealNav()
      done()
    }

    if (reduce) return finish()

    // Slide up from one viewport below while scaling up to 1. The rounded
    // corners (set above) hold for the first part of the slide, then flatten to
    // 0 before it ends — so the card stays rounded a little longer, then settles
    // square. overflow:hidden clips the content to the corners while rounded.
    gsap
      .timeline({ onComplete: finish })
      .fromTo(
        el,
        { y: () => window.innerHeight, scale: 0.95 },
        { y: 0, scale: 1, duration: DURATION, ease: EASE },
        0,
      )
      .to(
        el,
        { borderRadius: 0, duration: DURATION * 0.5, ease: EASE },
        DURATION * 0.4,
      )
  },
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" :page-key="(route) => route.fullPath" />
  </NuxtLayout>
</template>
