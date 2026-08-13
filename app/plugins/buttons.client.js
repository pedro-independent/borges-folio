// Osmo "Button 004" — splits each button label into characters so the CSS
// per-character flip (see main.css) has something to animate. Faithful port of
// the resource's init, wired through the project's useGSAP() composable and
// re-scanned on route change. Degrades gracefully (static label) if SplitText
// (a GSAP club plugin) can't load.
export default defineNuxtPlugin(async (nuxtApp) => {
  const { gsap, lazyLoadPlugin } = useGSAP()

  // --- Hover latch -----------------------------------------------------------
  // The flip/wipe/dots choreographies are staggered CSS transitions; a pointer
  // that crossed a button faster than the stagger window either cancelled the
  // delayed tweens before they started (the animation never visibly played) or
  // re-applied the per-char delays to characters frozen mid-flight on re-entry
  // (torn half-states). So the CSS triggers on `.is-hovered` (alongside :hover)
  // and JS latches it here: added on pointerover, released on pointerout only
  // once the IN choreography has had time to land — a fast pass plays in full,
  // and the reversal always starts from a settled state. Delegated, so labels
  // re-rendered by CMS swaps stay covered. Fine-pointer devices only (the CSS
  // effects are gated the same way), and registered before the SplitText load
  // below so the 029 wipe keeps the latch even when the club plugin is absent.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const SEL = '[data-button-004], [data-button-029]'
    const state = new WeakMap()
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest?.(SEL)
      if (!el || el.contains(e.relatedTarget)) return
      const s = state.get(el) || {}
      clearTimeout(s.timer)
      s.enteredAt = performance.now()
      state.set(el, s)
      el.classList.add('is-hovered')
    })
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest?.(SEL)
      if (!el || el.contains(e.relatedTarget)) return
      const s = state.get(el)
      if (!s) return
      // Hold until the in-choreography lands: max stagger delay + travel ≈
      // 0.55s for the flip/wipe. `data-hover-latch` overrides for longer
      // choreographies (the nav dots' three stages run 0.9s).
      const minPlay = Number(el.dataset.hoverLatch) || 600
      const wait = Math.max(0, minPlay - (performance.now() - s.enteredAt))
      clearTimeout(s.timer)
      s.timer = setTimeout(() => el.classList.remove('is-hovered'), wait)
    })
  }

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
