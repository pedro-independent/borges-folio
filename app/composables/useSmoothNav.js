// Shared menu/footer navigation. Same-page links smooth-scroll through Lenis
// (to a hash target, or to the top); cross-page links route first, then scroll
// once the destination has rendered. `to` is a path that may carry a hash,
// e.g. '/', '/work', '/#contact'. Returns navigate(to) and the lower-level
// smoothTo() used elsewhere.
export function useSmoothNav() {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  function smoothTo(target) {
    const lenis = nuxtApp.$lenis
    if (target === 0) return lenis ? lenis.scrollTo(0) : window.scrollTo(0, 0)
    if (!target) return
    if (lenis) lenis.scrollTo(target)
    else if (typeof target === 'string') document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  async function navigate(to) {
    nuxtApp.$lenis?.start() // a closing drawer may have paused Lenis
    const [pathPart, hash] = to.split('#')
    const path = pathPart || '/'
    if (route.path === path) {
      smoothTo(hash ? '#' + hash : 0)
      return
    }
    await router.push(to)
    if (hash) {
      await nextTick()
      setTimeout(() => smoothTo('#' + hash), 120) // let the destination render first
    }
  }

  return { navigate, smoothTo }
}
