<script setup>
// 404 — an infinite draggable photo canvas (Figma node 15511-295) built on
// Osmo "Infinite Draggable Grid (Masonry)". The engine tiles ITEMS in a
// wrapping grid; here one item IS the whole 1440×770 design frame with its 16
// photos absolutely positioned at the exact Figma coordinates (px ÷ 16 = em),
// so dragging in any direction repeats the design's own scatter 1:1 — same
// spacing, same positioning, forever. Two engine knobs are set for that
// (documented config, not code changes): startOffsetY = 0 and
// columnSpeedPattern = [1], so neighbouring copies of the frame never drift
// out of register (the "masonry" offsets are already baked into the design).
//
// One deliberate adaptation to the resource, flagged per its own docs: cards
// are collected with querySelectorAll instead of querySelector — our item
// holds 16 cards (one per photo), and each must scale individually during a
// drag; scaling the single viewport-sized block would break the collage.
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({ error: Object }) // Nuxt injects it; Nuxt's own dev overlay does the logging

useHead({ title: 'Page not found' })

// The photos, in em (px ÷ 16; image files are @2x, so w/h = px ÷ 32).
// 01–16 are the Figma frame's tiles (15511:296 → :311) at their exact design
// coordinates, shifted down 24.0625em: the tile is now double height (96.25em)
// and the engine centres the middle of it in the viewport, so the design frame
// must sit at y 24.0625–72.1875 for the initial view to be the Figma frame 1:1.
// (One nudge: 16, the left-edge bleeder, moved down 3.625em so the right-edge
// bleeder (14) wrapping around the seam can never overlap it.)
// 17–24 fill the band above the frame, 25–31 the band below — new photos laid
// out in the design's rhythm with ≥1.875em clearance, verified non-overlapping
// including every wrap-around continuation.
const PHOTOS = [
  { src: '/img/404/404-01.jpg', x: 3.3125, y: 61.125, w: 11.46875, h: 7.5 },
  { src: '/img/404/404-02.jpg', x: 23.0625, y: 59.1875, w: 7.5, h: 10 },
  { src: '/img/404/404-03.jpg', x: 3.3125, y: 41.25, w: 7.5, h: 10 },
  { src: '/img/404/404-04.jpg', x: 81, y: 63.5, w: 7.5, h: 10 },
  { src: '/img/404/404-05.jpg', x: 21, y: 41.875, w: 11.625, h: 7.5 },
  { src: '/img/404/404-06.jpg', x: 58.6875, y: 36.75, w: 11.375, h: 7.5 },
  { src: '/img/404/404-07.jpg', x: 61.4375, y: 65.75, w: 7.5, h: 11.375 },
  { src: '/img/404/404-08.jpg', x: 42.125, y: 55.0625, w: 7.5, h: 10.6875 },
  { src: '/img/404/404-09.jpg', x: 12.1875, y: 21.4375, w: 7.5, h: 11.25 },
  { src: '/img/404/404-10.jpg', x: 32.625, y: 26.125, w: 11.25, h: 7.5 },
  { src: '/img/404/404-11.jpg', x: 57.6875, y: 50.4375, w: 11.25, h: 7.5 },
  { src: '/img/404/404-12.jpg', x: 79.125, y: 44.75, w: 11.1875, h: 7.5 },
  { src: '/img/404/404-13.jpg', x: 54.9375, y: 19.0625, w: 7.5, h: 10 },
  { src: '/img/404/404-14.jpg', x: 80.125, y: 21.5625, w: 11.0625, h: 7.5 },
  { src: '/img/404/404-15.jpg', x: 36.375, y: 71.6875, w: 7.5, h: 10 },
  { src: '/img/404/404-16.jpg', x: -6.3125, y: 30.3125, w: 7.5, h: 10 },
  // — band above the design frame —
  { src: '/img/404/404-17.jpg', x: 0.625, y: 2.5, w: 7.5, h: 13.3125 },
  { src: '/img/404/404-18.jpg', x: 11.25, y: 3.125, w: 7.5, h: 13.3125 },
  { src: '/img/404/404-19.jpg', x: 25, y: 5, w: 10, h: 7.5 },
  { src: '/img/404/404-20.jpg', x: 42.5, y: 2.5, w: 7.5, h: 12.3125 },
  { src: '/img/404/404-21.jpg', x: 51.875, y: 3.75, w: 7.5, h: 5.0625 },
  { src: '/img/404/404-22.jpg', x: 61.875, y: 6.25, w: 7.5, h: 5.3125 },
  { src: '/img/404/404-23.jpg', x: 73.125, y: 1.875, w: 7.5, h: 11.4375 },
  { src: '/img/404/404-24.jpg', x: 82.5, y: 3.75, w: 7.5, h: 11.875 },
  // — band below the design frame —
  { src: '/img/404/404-25.jpg', x: 2.5, y: 83.75, w: 7.5, h: 11.1875 },
  { src: '/img/404/404-26.jpg', x: 17.5, y: 86.25, w: 11.6875, h: 7.5 },
  { src: '/img/404/404-27.jpg', x: 31.875, y: 84.6875, w: 7.5, h: 10 },
  { src: '/img/404/404-28.jpg', x: 41.5625, y: 84.375, w: 7.5, h: 9.5 },
  { src: '/img/404/404-29.jpg', x: 55, y: 83.75, w: 7.5, h: 11.1875 },
  { src: '/img/404/404-30.jpg', x: 73.75, y: 83.125, w: 7.5, h: 11.625 },
  { src: '/img/404/404-31.jpg', x: 64.375, y: 80.625, w: 7.5, h: 10.875 },
]
const photoStyle = (p) => ({ left: p.x + 'em', top: p.y + 'em', width: p.w + 'em', height: p.h + 'em' })

// Leaving the error page must go through clearError, not plain navigation —
// it resets Nuxt's error state and redirects in one step.
const go = (path) => clearError({ redirect: path })

// --- Osmo "Infinite Draggable Grid (Masonry)" -------------------------------
// Ported verbatim apart from the integration seams: gsap/Observer come from
// useGSAP(), init runs on mount, and everything is torn down on unmount
// (clearError() unmounts this page in place — no reload to clean up for us).
// The resource's scale-while-moving effect is removed on request — photos stay
// at full size while the canvas moves, so the card tracking went with it.
let destroy = null

function initInfiniteCardsGrid(gsap, Observer) {
  const wrappers = document.querySelectorAll('[data-infinite-grid-init]')

  const wheelSpeed = 0.6 // wheel/trackpad speed
  const dragSpeed = 1.2 // drag speed
  const gridOverscan = 1 // extra rows and columns generated outside the viewport
  const startOffsetY = 0 // vertical offset between columns — 0: the frame itself carries the scatter
  const positionLerp = 0.05 // movement smoothing amount
  const xToYInfluence = 0.2 // horizontal movement influence on vertical movement
  const columnSpeedPattern = [1] // no per-column parallax — copies of the frame stay in register

  const disposers = []

  wrappers.forEach((wrapper) => {
    const collection = wrapper.querySelector('[data-infinite-grid-collection]')
    const sourceList = wrapper.querySelector('[data-infinite-grid-list]')
    const originalItems = Array.from(sourceList.querySelectorAll('[data-infinite-grid-item]')).map((item) => item.cloneNode(true))

    if (!collection || !sourceList || !originalItems.length) return

    let observer
    let cards = []
    const timers = {}
    const size = {}
    const pos = {}

    function setStatus(status) {
      wrapper.setAttribute('data-infinite-grid-status', status)
    }

    function wrapValue(value, size) {
      return ((value % size) + size) % size
    }

    function createColumnSpeeds(columns) {
      return Array.from({ length: columns }, (_, i) => columnSpeedPattern[i % columnSpeedPattern.length])
    }

    function createItemIndexes(columns, rows) {
      const total = originalItems.length
      const indexes = Array.from({ length: rows }, () => [])
      const used = Array(total).fill(0)
      const centerColumn = Math.floor(columns / 2)
      const centerRow = Math.floor(rows / 2)
      const cells = []

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          cells.push({
            row,
            column,
            distance: Math.abs(row - centerRow) + Math.abs(column - centerColumn),
          })
        }
      }

      cells.sort((a, b) => a.distance - b.distance)

      cells.forEach(({ row, column }) => {
        const blocked = [
          indexes[row][column - 1],
          indexes[row][column + 1],
          row > 0 ? indexes[row - 1][column] : undefined,
          row < rows - 1 ? indexes[row + 1][column] : undefined,
          row > 0 ? indexes[row - 1][column - 1] : undefined,
          row > 0 ? indexes[row - 1][column + 1] : undefined,
          row < rows - 1 ? indexes[row + 1][column - 1] : undefined,
          row < rows - 1 ? indexes[row + 1][column + 1] : undefined,
        ]

        const seed = (row * 17 + column * 31) % total
        let bestIndex = 0
        let bestScore = Infinity

        for (let i = 0; i < total; i++) {
          const itemIndex = (i + seed) % total
          let score = used[itemIndex] * 10 + Math.abs(itemIndex - seed) * 0.01

          if (total > 1 && blocked.includes(itemIndex)) score += 1000

          if (score < bestScore) {
            bestScore = score
            bestIndex = itemIndex
          }
        }

        indexes[row][column] = bestIndex
        used[bestIndex]++
      })

      return indexes
    }

    function buildGrid() {
      if (observer) observer.kill()
      clearTimeout(timers.resize)
      clearTimeout(timers.scroll)
      gsap.ticker.remove(updateGrid)

      setStatus('loading')
      sourceList.innerHTML = ''

      const measureItem = originalItems[0].cloneNode(true)
      measureItem.style.position = 'absolute'
      measureItem.style.visibility = 'hidden'
      measureItem.style.pointerEvents = 'none'
      wrapper.appendChild(measureItem)

      const rect = measureItem.getBoundingClientRect()
      size.itemW = rect.width
      size.itemH = rect.height
      measureItem.remove()

      if (!size.itemW || !size.itemH) return

      const columns = Math.max(1, Math.ceil(wrapper.clientWidth / size.itemW) + gridOverscan * 2)
      const rows = Math.max(Math.ceil(wrapper.clientHeight / size.itemH) + gridOverscan * 2, Math.ceil(originalItems.length / columns))
      const itemIndexes = createItemIndexes(columns, rows)
      const columnSpeeds = createColumnSpeeds(columns)
      const fragment = document.createDocumentFragment()
      const centerColumn = Math.floor(columns / 2)
      const centerRow = Math.floor(rows / 2)

      size.totalW = columns * size.itemW
      size.totalH = rows * size.itemH
      cards = []

      gsap.set(collection, { x: 0, y: 0, force3D: true })

      collection.style.width = `${size.totalW}px`
      collection.style.height = `${size.totalH}px`

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const item = originalItems[itemIndexes[row][column]].cloneNode(true)

          cards.push({
            baseX: column * size.itemW,
            baseY: row * size.itemH,
            startY: (column - centerColumn) * size.itemH * startOffsetY,
            ySpeed: columnSpeeds[column],
            xSetter: gsap.quickSetter(item, 'x', 'px'),
            ySetter: gsap.quickSetter(item, 'y', 'px'),
          })

          if (cards.length > originalItems.length) item.setAttribute('aria-hidden', 'true')

          fragment.appendChild(item)
        }
      }

      sourceList.appendChild(fragment)

      pos.startX = wrapper.clientWidth * 0.5 - centerColumn * size.itemW - size.itemW * 0.5
      pos.startY = wrapper.clientHeight * 0.5 - centerRow * size.itemH - size.itemH * 0.5
      pos.x = pos.startX
      pos.y = pos.startY
      pos.targetX = pos.x
      pos.targetY = pos.y

      updateGrid()
      gsap.ticker.add(updateGrid)

      requestAnimationFrame(() => {
        setStatus('idle')
      })

      observer = Observer.create({
        target: wrapper,
        type: 'wheel,touch,pointer',
        preventDefault: true,
        dragMinimum: 3,
        onPress() { setStatus('dragging') },
        onRelease() { setStatus('idle') },
        onStop() { setStatus('idle') },
        onChange: handleMovement,
      })
    }

    function updateGrid() {
      pos.x += (pos.targetX - pos.x) * positionLerp
      pos.y += (pos.targetY - pos.y) * positionLerp

      const offsetX = size.itemW * gridOverscan
      const offsetY = size.itemH * gridOverscan
      const scrollY = pos.y - pos.startY

      cards.forEach(({ baseX, baseY, startY, ySpeed, xSetter, ySetter }) => {
        xSetter(wrapValue(baseX + pos.x + offsetX, size.totalW) - offsetX)
        ySetter(wrapValue(baseY + pos.startY + startY + scrollY * ySpeed + offsetY, size.totalH) - offsetY)
      })
    }

    function handleMovement(self) {
      const isWheel = self.event.type === 'wheel'
      const speed = isWheel ? wheelSpeed : dragSpeed
      const deltaX = gsap.utils.clamp(-80, 80, self.deltaX * speed)
      const deltaY = gsap.utils.clamp(-80, 80, self.deltaY * speed)
      const moveX = isWheel ? -deltaX : deltaX
      const moveY = isWheel ? -deltaY : deltaY

      if (isWheel) {
        setStatus('scrolling')

        clearTimeout(timers.scroll)
        timers.scroll = setTimeout(() => {
          setStatus('idle')
        }, 200)
      }

      pos.targetX += moveX
      pos.targetY += moveY + moveX * xToYInfluence
    }

    function handleMouseLeave() {
      setStatus('idle')

      if (observer) {
        observer.disable()
        observer.enable()
      }
    }

    function handleResize() {
      clearTimeout(timers.resize)
      timers.resize = setTimeout(buildGrid, 200)
    }

    window.addEventListener('resize', handleResize)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    buildGrid()

    disposers.push(() => {
      if (observer) observer.kill()
      gsap.ticker.remove(updateGrid)
      clearTimeout(timers.resize)
      clearTimeout(timers.scroll)
      window.removeEventListener('resize', handleResize)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    })
  })

  return () => disposers.forEach((d) => d())
}

onMounted(async () => {
  const { gsap, lazyLoadPlugin } = useGSAP()
  let Observer
  try {
    Observer = await lazyLoadPlugin('Observer')
  } catch {
    // No engine — reveal the source frame as a static collage instead.
    document.querySelector('[data-infinite-grid-init]')?.setAttribute('data-infinite-grid-status', 'idle')
    return
  }
  destroy = initInfiniteCardsGrid(gsap, Observer)
  // The CTA labels use the Button 004 char-flip; error pages don't always fire
  // page:finish, so ask the buttons plugin to (re)scan explicitly.
  useNuxtApp().$splitButtons?.()
})
onBeforeUnmount(() => destroy?.())
</script>

<template>
  <div class="nf404">
    <section data-infinite-grid-status="loading" data-infinite-grid-init class="infinite-grid">
      <div data-infinite-grid-collection class="infinite-grid__collection">
        <div data-infinite-grid-list class="infinite-grid__list">
          <!-- One item = the Figma frame plus a band of extra photos above and
               below (1440×1540); the engine tiles it. -->
          <div data-infinite-grid-item class="infinite-grid__item">
            <div
              v-for="p in PHOTOS"
              :key="p.src"
              data-infinite-grid-card
              class="infinite-grid__card"
              :style="photoStyle(p)"
            >
              <img :src="p.src" loading="lazy" alt="" class="infinite-grid__card-img" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Centred CTAs float above the canvas and never drag with it. -->
    <div class="nf404__ctas">
      <AppButton label="View work" href="/work" class="btn btn--dark" @click.prevent="go('/work')" />
      <AppButton label="Back Home" href="/" class="btn btn--light" @click.prevent="go('/')" />
    </div>
  </div>
</template>

<style scoped>
/* === 404 (Figma 15511-295; px ÷ 16 = em) ==================================
   Osmo "Infinite Draggable Grid" styles, with the item resized from the
   resource's 13em square card to the full design frame (1440×770 → 90×48.125em)
   and the card radius matched to the site's 4px token. */
.nf404 {
  position: relative;
  height: 100svh;
  overflow: clip;
  background: var(--color-cream);
}

.infinite-grid {
  touch-action: none;
  width: 100%;
  height: 100svh;
  position: relative;
  overflow: clip;
  cursor: grab;
  transition: opacity 0.5s ease;
  opacity: 1;
}

.infinite-grid[data-infinite-grid-status='loading'] {
  opacity: 0;
}

.infinite-grid[data-infinite-grid-status='dragging'] {
  cursor: grabbing;
}

.infinite-grid__collection {
  will-change: transform;
  width: 100%;
  height: 100%;
  position: absolute;
}

.infinite-grid__list {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

/* The repeating tile — the 404 frame in the middle band plus the new photos
   above/below. Edge bleeders continue into the neighbouring copy. */
.infinite-grid__item {
  width: 90em;                      /* 1440 */
  height: 96.25em;                  /* 1540 — frame + extras bands */
  will-change: transform;
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
}

/* Each photo card carries its exact Figma x/y/w/h via inline style. */
.infinite-grid__card {
  -webkit-user-select: none;
  user-select: none;
  will-change: transform;
  backface-visibility: hidden;
  border-radius: 0.25em;            /* 4 — site radius token */
  position: absolute;
}

.infinite-grid__card-img {
  pointer-events: none;
  object-fit: cover;
  border-radius: inherit;
  width: 100%;
  height: 100%;
  position: absolute;
}

/* CTA pair — dead centre, 16px gap (Figma 15511:312). Wrapper ignores the
   pointer so the canvas drags everywhere except the buttons themselves. */
.nf404__ctas {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;                         /* 16 */
  pointer-events: none;
  z-index: 2;
}
.nf404__ctas > * {
  pointer-events: auto;
}
</style>
