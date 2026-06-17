<script setup>
// Right-side menu drawer (Figma node 15324-5887). A full-screen dim overlay with
// a rounded off-white panel pinned to the right: logo + Close, the page nav
// (current route shown in accent blue), and a footer with the Lisbon local time
// and socials. Teleported to <body> so it sits above the fixed nav; open/close is
// animated with GSAP and degrades to an instant show under reduced-motion.
import { computed, ref, watch, onMounted, onBeforeUnmount, resolveComponent } from 'vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const route = useRoute()
const nuxtApp = useNuxtApp()
const { navigate: smoothNavigate } = useSmoothNav()
const mounted = ref(false)

// Nav + socials from siteSettings (shared, non-blocking; falls back to the
// hardcoded set until the fetch lands). The Contact link carries the icon.
const { settings } = useSiteSettings()
const links = computed(() =>
  settings.value.navItems.map((n) => ({ label: n.label, to: n.href, icon: n.href === '/contact' })),
)
const socials = computed(() => settings.value.socials)

const SOCIAL_ICONS = {
  linkedin: resolveComponent('IconLinkedin'),
  instagram: resolveComponent('IconInstagram'),
}
const socialIcon = (platform) => SOCIAL_ICONS[platform] || null

// Page-level links carry the "current" highlight; in-page anchors (e.g. Contact)
// never do.
function isActive(link) {
  return !link.to.includes('#') && route.path === link.to
}

function navigate(link, e) {
  e.preventDefault()
  emit('close')
  smoothNavigate(link.to)
}

// Live local time in Lisbon for the footer.
const time = ref('')
let clock = null
function tick() {
  try {
    time.value = new Intl.DateTimeFormat('en-US', {
      timeZone: settings.value.timezone, hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date())
  } catch { time.value = '' }
}

function onKey(e) { if (e.key === 'Escape' && props.open) emit('close') }

// Freeze the page behind the drawer (Lenis owns the scroll).
watch(() => props.open, (o) => {
  const lenis = nuxtApp.$lenis
  if (o) { tick(); lenis?.stop() } else { lenis?.start() }
})

onMounted(() => {
  mounted.value = true
  tick()
  clock = setInterval(tick, 15000)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  clearInterval(clock)
  window.removeEventListener('keydown', onKey)
  nuxtApp.$lenis?.start()
})

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onEnter(el, done) {
  nuxtApp.$splitButtons?.() // wire the button-004 flip on the freshly-mounted links
  if (reduced()) return done()
  const { gsap } = useGSAP()
  const tl = gsap.timeline({ onComplete: done })
  tl.from(el.querySelector('.menu__overlay'), { autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, 0)
    .from(el.querySelector('.menu__panel'), { xPercent: 110, duration: 0.6, ease: 'power3.out' }, 0)
    .from(el.querySelectorAll('[data-menu-item]'), { autoAlpha: 0, x: 24, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0.18)
}
function onLeave(el, done) {
  if (reduced()) return done()
  const { gsap } = useGSAP()
  const tl = gsap.timeline({ onComplete: done })
  tl.to(el.querySelector('.menu__panel'), { xPercent: 110, duration: 0.45, ease: 'power3.in' }, 0)
    .to(el.querySelector('.menu__overlay'), { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0)
}
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div v-if="open" class="menu" role="dialog" aria-modal="true" aria-label="Site menu">
        <div class="menu__overlay" @click="emit('close')" />

        <aside class="menu__panel" data-lenis-prevent>
          <header class="menu__head">
            <span class="menu__logo">
              <img src="/img/logo-pedro-borges.svg" alt="Pedro Borges" />
            </span>
            <button type="button" class="menu__close button-004" data-button-004 @click="emit('close')">
              <span class="button-004__inner">
                <span data-button-004-text class="button-004__text is--default">Close</span>
                <span aria-hidden="true" data-button-004-text class="button-004__text is--hover">Close</span>
              </span>
            </button>
          </header>

          <div class="menu__body">
            <nav class="menu__nav">
              <a
                v-for="l in links"
                :key="l.label"
                :href="l.to"
                data-menu-item
                data-button-004
                class="menu__link button-004"
                :class="{ 'is-active': isActive(l) }"
                @click="navigate(l, $event)"
              >
                <span class="button-004__inner">
                  <span data-button-004-text class="button-004__text is--default">{{ l.label }}</span>
                  <span aria-hidden="true" data-button-004-text class="button-004__text is--hover">{{ l.label }}</span>
                </span>
                <IconContact v-if="l.icon" class="menu__link-icon" />
              </a>
            </nav>

            <div class="menu__foot">
              <p class="menu__place" data-menu-item>
                <span>{{ settings.locationLabel }}</span>
                <span class="menu__time">{{ time }}</span>
              </p>
              <div class="menu__social" data-menu-item>
                <a
                  v-for="s in socials"
                  :key="s.url"
                  :href="s.url"
                  target="_blank"
                  rel="noopener"
                  data-button-004
                  class="button-004"
                >
                  <span class="button-004__inner">
                    <span data-button-004-text class="button-004__text is--default">{{ s.label }}</span>
                    <span aria-hidden="true" data-button-004-text class="button-004__text is--hover">{{ s.label }}</span>
                  </span>
                  <component :is="socialIcon(s.platform)" v-if="socialIcon(s.platform)" class="menu__social-icon" />
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Figma 1440 frame — px ÷ 16 = em, so the panel rides the global scaling tiers. */
.menu {
  position: fixed;
  inset: 0;
  z-index: 100;                    /* above the fixed nav (z-index 10) */
}
.menu__overlay {
  position: absolute;
  inset: 0;
  background: rgba(6, 6, 6, 0.6);
  cursor: pointer;
}
.menu__panel {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  bottom: 0.5em;                   /* 8px inset on three sides */
  width: 22.5625em;               /* 361px */
  max-width: calc(100vw - 3em);
  display: flex;
  flex-direction: column;
  gap: 5em;                        /* 80px header → body */
  background: var(--color-off-white);
  color: var(--color-ink);
  border-radius: 0.375em;          /* 6px */
  overflow: hidden;
}

.menu__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25em;
  padding: 1em 1.5em;              /* lands the logo ~24px from the viewport top */
}
.menu__logo { display: block; width: 9.3em; } /* 148.785px */
.menu__logo img {
  display: block;
  width: 100%;
  height: auto;
  filter: brightness(0);           /* dark wordmark on the light panel */
}
.menu__close {
  font-family: var(--font-display);
  font-size: 1em;                  /* 16px */
  font-weight: 500;
  color: var(--color-ink);
  background: none;
  border: 0;
  padding: 0.25em;
  cursor: pointer;
}

.menu__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2em;
  padding: 1em;                    /* 16px */
  overflow-y: auto;
}

.menu__nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1em;                        /* 16px */
}
.menu__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;                      /* 8px */
  font-size: 1.5em;                /* 24px */
  line-height: 1.1;
  color: var(--color-ink);
  text-decoration: none;
  transition: color 0.3s ease;
}
.menu__link:hover,
.menu__link.is-active { color: var(--color-blue); }
.menu__link-icon { width: 0.42em; height: 0.42em; color: var(--color-blue); } /* 10px against 24px text */

.menu__foot {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.3125em;                   /* 21px */
}
.menu__place {
  display: flex;
  flex-direction: column;
  gap: 0.125em;                    /* 2px */
  margin: 0;
  font-size: 0.6875em;             /* 11px */
  line-height: 1.2;
}
.menu__time { color: var(--color-blue); }

.menu__social {
  display: flex;
  align-items: center;
  gap: 3em;                        /* 48px */
}
.menu__social a {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1em;                  /* 16px */
  line-height: 1.1;
  color: var(--color-ink);
  text-decoration: none;
  transition: color 0.3s ease;
}
.menu__social a:hover { color: var(--color-blue); }
.menu__social-icon { width: 0.6em; height: 0.6em; } /* ~9.6px */

/* === MOBILE (≤479px) — full-screen panel (Figma node 15324-6975) =====
   The narrow right drawer gives way to an edge-to-edge sheet; everything else
   (type sizes, header → body gap, footer layout) carries over via em. */
@media (max-width: 479px) {
  .menu__panel {
    inset: 0;
    width: auto;
    max-width: none;
    border-radius: 0;
  }
  .menu__head { padding: 1em; }
}
</style>
