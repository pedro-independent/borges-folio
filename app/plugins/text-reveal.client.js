// Masked line reveal (CLAUDE.md §6): tag any element `data-split="heading"`
// and its text is split into visual lines (SplitText), each line wrapped in an
// overflow-clipping mask and slid up with a stagger when it enters the
// viewport. Splitting waits for document.fonts.ready so line breaks are
// measured against the real webfont metrics, and re-scans on page:finish so
// client-side navigations pick up freshly mounted headings. Falls back to
// simply showing the text when SplitText can't load or reduced motion is set.
// The FOUC guard lives in main.css: [data-split="heading"] { visibility: hidden }.
export default defineNuxtPlugin((nuxtApp) => {
  const { gsap, lazyLoadPlugin } = useGSAP()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

  const show = (el) => gsap.set(el, { visibility: 'visible' })

  let SplitText = null
  let loading = null
  const loadSplit = () =>
    (loading ||= lazyLoadPlugin('SplitText').then(
      (p) => (SplitText = p),
      () => null, // plugin unavailable — degrade to a plain reveal
    ))

  async function scan() {
    const els = gsap.utils.toArray('[data-split="heading"]:not([data-split-ready])')
    if (!els.length) return
    // Claim before any await so an overlapping scan can't double-split.
    els.forEach((el) => (el.dataset.splitReady = ''))

    await loadSplit()
    if (!SplitText || reduce.matches) return els.forEach(show)
    await document.fonts.ready

    els.forEach((el) => {
      if (!el.isConnected) return // unmounted while awaiting fonts (fast nav)
      // `mask: 'lines'` wraps every line in its own overflow-clipped parent —
      // the clip IS the reveal; the line just slides up inside it.
      const OPTS = { type: 'lines', mask: 'lines', linesClass: 'split-line' }
      let split = new SplitText(el, OPTS)
      if (!split.lines.length && el.children.length) {
        // Element children only, no direct text (e.g. the hero h1's line
        // spans): SplitText won't cross element boundaries, so split each
        // child instead — the line masks nest INSIDE the spans, keeping the
        // container layout (flex column, per-line alignment) intact, and all
        // lines still collect into the one staggered tween below.
        split.revert()
        split = new SplitText(el.children, OPTS)
      }
      show(el)
      gsap.fromTo(
        split.lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'osmo',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          // Restore the authored DOM once revealed (masks removed, clean
          // selection/copy); width changes reload the page, so a fresh split
          // re-measures lines anyway.
          onComplete: () => split.revert(),
        },
      )
    })
  }

  // Initial-load timing: the page component has an async setup (Sanity fetch),
  // so its hydration outlasts app:mounted — and page:finish fires while Vue is
  // still hydrating. Splitting during either rewrites the DOM under Vue's feet
  // and triggers a hydration mismatch. app:suspense:resolve is the moment the
  // whole tree (async page included) is hydrated; after that, page:finish
  // handles client-side navigations (rAF: let the new page's patch settle).
  let ready = false
  nuxtApp.hook('app:suspense:resolve', () => {
    if (ready) return
    ready = true
    requestAnimationFrame(scan)
  })
  nuxtApp.hook('page:finish', () => {
    if (ready) requestAnimationFrame(scan)
  })
})
