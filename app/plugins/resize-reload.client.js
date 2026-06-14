// Pinned ScrollTriggers / SplitText bake in pixel measurements at load.
// Reload on width change only (ignore mobile address-bar height jitter).
export default defineNuxtPlugin(() => {
  let lastWidth = window.innerWidth
  let timer = null
  const onResize = () => {
    if (window.innerWidth === lastWidth) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      lastWidth = window.innerWidth
      location.reload()
    }, 250)
  }
  window.addEventListener('resize', onResize)
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
    })
})
