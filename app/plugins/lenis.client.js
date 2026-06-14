import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  if (history.scrollRestoration) history.scrollRestoration = 'manual'

  const lenis = new Lenis({
    duration: 1,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // easeOutExpo
    lerp: 0.1,
    smoothWheel: true,
  })
  lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)

  // Each smooth-scroll frame must re-evaluate triggers.
  lenis.on('scroll', ScrollTrigger.update)
  let rafId
  const raf = (t) => {
    lenis.raf(t)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)

  // Smooth-scroll in-page anchors through Lenis.
  const onAnchorClick = (e) => {
    const link = e.target.closest('a[href^="#"]')
    if (!link) return
    const hash = link.getAttribute('href')
    if (!hash || hash === '#' || hash === '#top') {
      e.preventDefault()
      return lenis.scrollTo(0)
    }
    const target = document.querySelector(hash)
    if (target) {
      e.preventDefault()
      lenis.scrollTo(target, { offset: 0 })
    }
  }
  document.addEventListener('click', onAnchorClick)

  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('click', onAnchorClick)
      lenis.destroy()
    })

  return { provide: { lenis } } // useNuxtApp().$lenis
})
