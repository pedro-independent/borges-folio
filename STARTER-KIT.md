# Project Starter Kit — Nuxt 4 + Sanity + Figma + Fluid CSS + GSAP

A reusable blueprint distilled from the Teixeira Duarte build. Drop this file at the
root of a fresh Nuxt project, rename it `CLAUDE.md`, and hand it to Claude Code to
scaffold the foundation. It captures the **exact** conventions: the fluid `em`
scaling system, the single global stylesheet, the `useGSAP()` composable, the
client plugins (Lenis, SplitText reveal, button draw, resize-reload), the
Figma→code workflow, and a **Sanity CMS** integration (new — not in the original).

---

## 1. Stack

| Concern              | Choice                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Framework            | **Nuxt 4** (`app/` dir layout, SSR on)                           |
| Language             | Plain JS + plain CSS (no TS, no Tailwind, no UI kit)             |
| Styling              | One global `app/assets/css/main.css` — fluid `em` scaling system |
| CMS                  | **Sanity** (`@sanity/client` + GROQ), Studio in `/studio`        |
| Animation            | **GSAP 3** via a single `useGSAP()` composable                   |
| Smooth scroll        | **Lenis**, client plugin, synced to ScrollTrigger                |
| Design source        | **Figma MCP** — tokens, type styles, screenshots → code          |
| Icons                | Inline `.vue` SVG components (`currentColor`), never `<img>`      |

### Dependencies

```bash
npm install nuxt vue vue-router gsap lenis @sanity/client groq
# Studio (separate, in /studio) — optional, can also use sanity.io hosted:
npm install -D sanity @sanity/vision
```

> The original TD project ships GSAP **bonus/club plugins** (`SplitText`,
> `DrawSVGPlugin`, etc.). Those require a GSAP membership and are installed from
> the private registry. If you don't have club access, drop the `text-reveal`
> and `buttons` plugins below, or swap SplitText for a free alternative.

---

## 2. `nuxt.config.js`

```js
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-29',
  devtools: { enabled: true },

  // Lenis base styles first, then the single project sheet
  // (resets → tokens → scaling → typography → layout → pages).
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  // Leave absolute "/img/..." URLs alone — served straight from public/,
  // so the Vue compiler must not resolve them as Vite imports.
  vite: {
    vue: { template: { transformAssetUrls: { includeAbsolute: false } } },
  },

  // Sanity creds exposed to the client read-only via runtimeConfig.public.
  runtimeConfig: {
    public: {
      sanity: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: '2024-01-01',
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en', 'data-page-theme': 'light' },
      bodyAttrs: { 'data-page-theme': 'light' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [{ name: 'theme-color', content: '#0d0d0d' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
```

`.env`:

```
SANITY_PROJECT_ID=xxxxxxxx
SANITY_DATASET=production
```

---

## 3. Folder structure

```
app/
  app.vue                 # <NuxtLayout><NuxtPage/></NuxtLayout> + titleTemplate
  assets/css/main.css     # THE stylesheet (see §4)
  components/
    AppNav.vue  AppFooter.vue
    IconArrow.vue ...      # inline SVG, currentColor, aria-hidden
    Hp*.vue / Ab*.vue      # page sections, prefixed per page
  composables/
    useGSAP.js             # single GSAP access point (see §5)
    useSanity.js           # GROQ fetch helper (see §7)
  layouts/default.vue      # AppNav + <main><slot/></main> + AppFooter
  pages/
    index.vue
  plugins/
    lenis.client.js
    text-reveal.client.js
    buttons.client.js
    resize-reload.client.js
public/
  img/  videos/  fonts/  favicon.svg
sanity/
  schemas/                 # document + object schemas
studio/                    # optional embedded Sanity Studio
```

---

## 4. Fluid scaling CSS system — the core method

**The rule: size everything in `em`.** A single root font-size scales with the
viewport, so every `em` value tracks the design 1:1. You read pixel values
straight off Figma and divide by 16 to get `em`. No per-element media queries for
sizing — only for *layout* changes.

```css
/* === SCALING SYSTEM ======================================== */
/* Fluid type via clamp() between min/ideal/max container widths;
   breakpoints switch at 991 / 767 / 479. Size everything in `em`.
   Design ideal widths: 1440 / 834 / 550 / 390. */

:root {
  --size-unit: 16;               /* body font-size in the design (no px) */
  --size-container-ideal: 1440;  /* desktop design width */
  --size-container-min: 992px;   /* fluid floor = tablet breakpoint + 1 */
  --size-container-max: 1920px;
  --size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
}

/* Tablet — Figma 834/1024 frame; fires below 991px. */
@media screen and (max-width: 991px) {
  :root { --size-container-ideal: 834;  --size-container-min: 768px; --size-container-max: 991px; }
}
/* Mobile landscape — Figma 550 frame. */
@media screen and (max-width: 767px) {
  :root { --size-container-ideal: 550;  --size-container-min: 480px; --size-container-max: 767px; }
}
/* Mobile portrait — Figma 360, scaled to a 390 ideal. */
@media screen and (max-width: 479px) {
  :root { --size-container-ideal: 390;  --size-container-min: 320px; --size-container-max: 479px; }
}

body { font-size: var(--size-font); }

.container {
  width: 100%; margin: 0 auto;
  max-width: var(--size-container);
  padding: 0 3.125em; /* 50px @ 1440 (Figma gutter) */
}
```

**How to use it:** Figma says a heading is 90px at the 1440 frame → `90 / 16 =
5.625em`. A 50px gutter → `3.125em`. When you cross a breakpoint, you only
re-declare the values that *change shape* (flex-direction, grid columns, order)
inside the responsive block — never the font sizes, they re-scale automatically
because `--size-container-ideal` switches.

### Stylesheet order (keep this top-to-bottom)

```
resets → design tokens → scaling system → typography → links →
layout primitives → global nav → footer → page styles → responsive overrides
```

### Tokens + type scale (filled from Figma)

```css
:root {
  /* Brand palette — names mirror Figma colour variables */
  --color-white:#fff; --color-dark-gray:#272c2f; --color-gray:#8c979c;
  --color-blue:#7c9fb1; --color-light-gray:#e9e9e9;

  /* Semantic aliases (default light theme) */
  --color-bg: var(--color-white);
  --color-fg: var(--color-dark-gray);
  --color-accent: var(--color-blue);
  --color-line: var(--color-light-gray);

  --font-display: "Overused Grotesk", "Helvetica Neue", Arial, sans-serif;

  /* Type scale — names mirror Figma text styles (size / line / weight) in `em` */
  --text-xl-size:5.625em; --text-xl-line:1;   --text-xl-weight:300; /* 90px */
  --text-l-size:3em;      --text-l-line:1;     --text-l-weight:350;  /* 48px */
  --text-s-size:1.125em;  --text-s-line:1.3;   --text-s-weight:400;  /* 18px */
  --text-xs-size:.875em;  --text-xs-line:1.4;  --text-xs-weight:400; /* 14px */
}
[data-page-theme="dark"] { --color-bg: var(--color-dark-gray); --color-fg: var(--color-white); }

/* Utility classes — names mirror Figma text styles */
.t-xl{font-size:var(--text-xl-size);line-height:var(--text-xl-line);font-weight:var(--text-xl-weight)}
.t-l {font-size:var(--text-l-size); line-height:var(--text-l-line); font-weight:var(--text-l-weight)}
.t-s {font-size:var(--text-s-size); line-height:var(--text-s-line); font-weight:var(--text-s-weight)}
.t-xs{font-size:var(--text-xs-size);line-height:var(--text-xs-line);font-weight:var(--text-xs-weight)}
```

Self-host fonts in `/public/fonts` with `@font-face` (`font-display: swap`).

---

## 5. GSAP — `app/composables/useGSAP.js`

Single access point. Registers always-on plugins once, defines shared named eases,
lazy-loads heavy plugins on demand.

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

const pluginMap = {
  Flip: () => import('gsap/Flip'),
  Observer: () => import('gsap/Observer'),
  ScrollToPlugin: () => import('gsap/ScrollToPlugin'),
  SplitText: () => import('gsap/SplitText'),
  DrawSVGPlugin: () => import('gsap/DrawSVGPlugin'),
  TextPlugin: () => import('gsap/TextPlugin'),
}

let registered = false

export default function useGSAP() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, CustomEase)
    CustomEase.create('osmo', 'M0,0 C0.625,0.05 0,1 1,1')
    CustomEase.create('crisp-corner', '1, 0, 0, 1')
    registered = true
  }
  async function lazyLoadPlugin(name) {
    const loader = pluginMap[name]
    if (!loader) throw new Error(`useGSAP: unknown plugin "${name}"`)
    const plugin = (await loader())[name]
    gsap.registerPlugin(plugin)
    return plugin
  }
  return { gsap, ScrollTrigger, lazyLoadPlugin }
}
```

### Component animation pattern (scoped + cleaned up)

Build tweens inside `gsap.matchMedia()` on mount; revert on unmount. This handles
reduced-motion and kills ScrollTriggers automatically.

```vue
<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
const el = useTemplateRef('el')
let mm = null

onMounted(() => {
  const { gsap } = useGSAP()
  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el.value, start: 'top 80%', scrub: true,
                       invalidateOnRefresh: true },
    })
    tl.from(el.value, { autoAlpha: 0, yPercent: 10 })
    return () => tl.scrollTrigger?.kill()
  })
})
onBeforeUnmount(() => mm?.revert())
</script>
```

> There's a Claude Code **GSAP skill suite** available (`gsap-core`,
> `gsap-scrolltrigger`, `gsap-timeline`, `gsap-frameworks`, `gsap-plugins`,
> `gsap-performance`, `gsap-utils`). Use `gsap-frameworks` for the Nuxt/Vue
> lifecycle + scoping rules, `gsap-scrolltrigger` for pinning/scrub.

---

## 6. Client plugins

### `plugins/lenis.client.js` — smooth scroll synced to ScrollTrigger

```js
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  if (history.scrollRestoration) history.scrollRestoration = 'manual'

  const lenis = new Lenis({
    duration: 1,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // easeOutExpo
    lerp: 0.1, smoothWheel: true,
  })
  lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)

  // Each smooth-scroll frame must re-evaluate triggers.
  lenis.on('scroll', ScrollTrigger.update)
  let rafId
  const raf = (t) => { lenis.raf(t); rafId = requestAnimationFrame(raf) }
  rafId = requestAnimationFrame(raf)

  // Smooth-scroll in-page anchors through Lenis.
  const onAnchorClick = (e) => {
    const link = e.target.closest('a[href^="#"]'); if (!link) return
    const hash = link.getAttribute('href')
    if (!hash || hash === '#' || hash === '#top') { e.preventDefault(); return lenis.scrollTo(0) }
    const target = document.querySelector(hash)
    if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }) }
  }
  document.addEventListener('click', onAnchorClick)

  if (import.meta.hot) import.meta.hot.dispose(() => {
    cancelAnimationFrame(rafId)
    document.removeEventListener('click', onAnchorClick)
    lenis.destroy()
  })
  return { provide: { lenis } } // useNuxtApp().$lenis
})
```

### `plugins/resize-reload.client.js` — width-only reload

Pinned ScrollTriggers / SplitText bake in pixel measurements at load. Reload on
**width** change only (ignore mobile address-bar height jitter).

```js
export default defineNuxtPlugin(() => {
  let lastWidth = window.innerWidth, timer = null
  const onResize = () => {
    if (window.innerWidth === lastWidth) return
    clearTimeout(timer)
    timer = setTimeout(() => { lastWidth = window.innerWidth; location.reload() }, 250)
  }
  window.addEventListener('resize', onResize)
  if (import.meta.hot) import.meta.hot.dispose(() => {
    window.removeEventListener('resize', onResize); clearTimeout(timer)
  })
})
```

### `plugins/text-reveal.client.js` — masked line reveal (requires SplitText)

Tag any heading `data-split="heading"` (optionally `data-split-reveal="words|chars"`).
Add a FOUC guard in CSS: `[data-split="heading"]{visibility:hidden}`. The plugin
lazy-loads SplitText, splits after `document.fonts.ready`, masks each line, slides
it up with stagger via ScrollTrigger, and re-scans on `page:finish`. Falls back to
showing text if the plugin can't load or reduced-motion is set. (Copy the full
implementation from the TD repo — it's ~90 lines.)

---

## 7. Sanity CMS integration *(new — not in the original project)*

### `app/composables/useSanity.js`

```js
import { createClient } from '@sanity/client'

let client
export function useSanityClient() {
  if (!client) {
    const { sanity } = useRuntimeConfig().public
    client = createClient({
      projectId: sanity.projectId,
      dataset: sanity.dataset,
      apiVersion: sanity.apiVersion,
      useCdn: true, // CDN for published content; set false for drafts/preview
    })
  }
  return client
}

// SSR-friendly GROQ fetch keyed by query+params.
export async function useSanityQuery(key, query, params = {}) {
  const client = useSanityClient()
  return await useAsyncData(key, () => client.fetch(query, params))
}
```

Usage in a page:

```vue
<script setup>
import groq from 'groq'
const QUERY = groq`*[_type == "project"] | order(date desc){
  _id, title, "slug": slug.current, date,
  "cover": cover.asset->url
}`
const { data: projects } = await useSanityQuery('projects', QUERY)
</script>
```

### Image URLs

```bash
npm install @sanity/image-url
```

```js
import imageUrlBuilder from '@sanity/image-url'
const builder = imageUrlBuilder(useSanityClient())
export const urlFor = (source) => builder.image(source)
// urlFor(img).width(1440).quality(80).url()
```

### Schemas — `sanity/schemas/`

Keep schema fields mirroring the Figma content model. Example document:

```js
export default {
  name: 'project', type: 'document', title: 'Project',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug',  type: 'slug', options: { source: 'title' } },
    { name: 'date',  type: 'datetime' },
    { name: 'cover', type: 'image', options: { hotspot: true } },
    { name: 'body',  type: 'array', of: [{ type: 'block' }] }, // portable text
  ],
}
```

> Studio: run `npx sanity init` in `/studio` (or use the hosted Studio at
> sanity.io). Add the front-end origin under **API → CORS origins**.

---

## 8. Figma → code workflow

The **Figma MCP** server is the source of truth for design. Conventions:

1. **Tokens** — pull colour + type variables with `get_variable_defs` and map them
   1:1 to the CSS custom properties in §4. Variable names → CSS var names.
2. **Type styles** — each Figma text style becomes a `--text-*` token + `.t-*`
   utility. Pixel size ÷ 16 = the `em` value.
3. **Measurements** — read px off the frame, divide by 16, write `em`. The frame
   width (1440 / 834 / 550 / 390) tells you which breakpoint tier you're in.
4. **Screenshots** — use `get_screenshot` to verify layout while building; build
   section-by-section (one component per Figma frame section).
5. **Assets** — export to `/public/img` and `/public/videos`; reference as plain
   absolute URLs (`/img/foo.png`), never Vite imports. SVG icons become inline
   `.vue` components using `currentColor` so they inherit the section theme.

### Icon component convention

```vue
<!-- IconArrow.vue — currentColor so it inherits the section's color -->
<template>
  <svg width="100%" height="100%" viewBox="0 0 16 17" fill="none" aria-hidden="true"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L1 7.9C1 10.1 2.8 11.9 5 11.9H14.2" stroke="currentColor" stroke-width="1.5"/>
  </svg>
</template>
```

---

## 9. App shell

`app/app.vue`:

```vue
<script setup>
useHead({ titleTemplate: (t) => (t ? `${t} — Brand Name` : 'Brand Name') })
</script>
<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
```

`app/layouts/default.vue`:

```vue
<template>
  <div class="page">
    <AppNav />
    <main><slot /></main>
    <AppFooter />
  </div>
</template>
```

Per-page SEO with `useSeoMeta({ description: '…' })` in each page's `<script setup>`.

---

## 10. Conventions checklist

- [ ] Everything sized in `em`; px only via the `÷16` Figma conversion.
- [ ] One global `main.css`, kept in section order; no scoped sizing styles fight it.
- [ ] No media query for *sizing* — only for *layout shape* changes.
- [ ] GSAP only ever imported through `useGSAP()`; tweens inside `matchMedia` +
      reverted on unmount.
- [ ] Heavy GSAP plugins lazy-loaded; degrade gracefully if club plugins absent.
- [ ] Lenis + ScrollTrigger kept in sync; `scrollRestoration = 'manual'`.
- [ ] Reduced-motion respected everywhere (matchMedia / `prefers-reduced-motion`).
- [ ] Icons inline `.vue` + `currentColor`; `public/` assets as plain `/…` URLs.
- [ ] Sanity creds in `runtimeConfig.public`; GROQ via `useSanityQuery` (SSR-safe).
- [ ] Figma tokens mapped 1:1 to CSS vars; component-per-frame-section build.
```
