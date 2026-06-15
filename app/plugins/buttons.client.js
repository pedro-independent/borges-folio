// Osmo "Button 004" — splits each button label into characters so the CSS
// per-character flip (see main.css) has something to animate. Faithful port of
// the resource's init, wired through the project's useGSAP() composable and
// re-scanned on route change. Degrades gracefully (static label) if SplitText
// (a GSAP club plugin) can't load.
export default defineNuxtPlugin(async (nuxtApp) => {
  const { gsap, lazyLoadPlugin } = useGSAP()

  let SplitText
  try {
    SplitText = await lazyLoadPlugin('SplitText')
  } catch {
    return
  }

  const splitButton = (textElement) => {
    if (textElement.dataset.split004 === 'done') return
    textElement.dataset.split004 = 'done'

    const splitText = new SplitText(textElement, {
      type: 'chars',
      tag: 'span',
      charsClass: 'button-004__split-char',
    })

    const chars = splitText.chars
    const count = chars.length
    const center = (count - 1) / 2
    const maxIndex = Math.floor(center)

    textElement.style.setProperty('--max-index', maxIndex)

    chars.forEach((char, index) => {
      const distance = Math.floor(Math.abs(index - center))
      let signedIndex = 0
      if (index < center) signedIndex = distance
      else if (index > center) signedIndex = -distance

      char.style.setProperty('--index', distance)
      char.style.setProperty('--signed-index', signedIndex)
    })
  }

  const initButtons = () => {
    document.querySelectorAll('[data-button-004]').forEach((element) => {
      element.querySelectorAll('[data-button-004-text]').forEach(splitButton)
    })
  }

  // Wait for fonts so character widths are measured correctly, then re-scan
  // after each client-side navigation.
  const run = () => (document.fonts?.ready ?? Promise.resolve()).then(initButtons)
  nuxtApp.hook('app:mounted', run)
  nuxtApp.hook('page:finish', () => requestAnimationFrame(run))

  // Exposed so components that mount buttons dynamically (e.g. the menu drawer)
  // can re-scan once their markup is in the DOM. Already-split labels are skipped.
  return { provide: { splitButtons: run } }
})
