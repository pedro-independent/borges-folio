// Osmo "Check Section Theme on Scroll" — adapted for Nuxt as a client plugin.
// The detection algorithm, rAF batching and every data-* attribute are kept
// verbatim from the resource; only init/teardown is wired into the Nuxt
// lifecycle so it re-scans after client-side navigation. As the page scrolls,
// the section under the nav's mid-line copies its `data-theme-section` /
// `data-bg-section` onto the `[data-theme-nav]` / `[data-bg-nav]` elements
// (here: <body>), and CSS animates the nav from those attributes.
export default defineNuxtPlugin((nuxtApp) => {
  let cleanup = null

  function initCheckSectionThemeScroll() {
    let ticking = false
    let currentTheme = null
    let currentBg = null

    // Get detection offset, in this case the navbar
    const navBarHeight = document.querySelector('[data-nav-bar-height]')
    const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0

    const themeSections = document.querySelectorAll('[data-theme-section]')
    const themeNavElements = document.querySelectorAll('[data-theme-nav]')
    const bgNavElements = document.querySelectorAll('[data-bg-nav]')

    function updateElements(elements, attribute, value) {
      elements.forEach((el) => {
        el.setAttribute(attribute, value)
      })
    }

    function checkThemeSection() {
      for (const themeSection of themeSections) {
        const rect = themeSection.getBoundingClientRect()
        const themeSectionTop = rect.top
        const themeSectionBottom = rect.bottom

        // If the offset is between the top & bottom of the current section
        if (themeSectionTop <= themeObserverOffset && themeSectionBottom >= themeObserverOffset) {
          const themeSectionActive = themeSection.getAttribute('data-theme-section')
          const bgSectionActive = themeSection.getAttribute('data-bg-section')

          if (themeSectionActive !== currentTheme) {
            updateElements(themeNavElements, 'data-theme-nav', themeSectionActive)
            currentTheme = themeSectionActive
          }

          if (bgSectionActive && bgSectionActive !== currentBg) {
            updateElements(bgNavElements, 'data-bg-nav', bgSectionActive)
            currentBg = bgSectionActive
          }

          break
        }
      }

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(checkThemeSection)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    checkThemeSection()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }

  function reinit() {
    cleanup?.()
    // let the new page's sections mount/lay out before the first scan
    requestAnimationFrame(() => {
      cleanup = initCheckSectionThemeScroll()
    })
  }

  // Synchronous re-scan: the page transition fires this once the incoming page
  // is back in normal flow at the top, so section rects are correct. (We can't
  // use page:finish — it fires mid-transition while the page is still
  // position:fixed and translated, which mis-detects the active section.)
  function reinitNow() {
    cleanup?.()
    cleanup = initCheckSectionThemeScroll()
  }

  nuxtApp.hook('app:mounted', reinit)
  nuxtApp.hook('page:transition:done', reinitNow)
})
