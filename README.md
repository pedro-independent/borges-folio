# Pedro Borges — Portfolio

Nuxt 4 + plain CSS (fluid `em` scaling) + GSAP/Lenis, built from the Figma
"Independent Website" homepage. Sanity CMS is wired in at the composable level
and ready to switch on.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Stack

- **Nuxt 4** (`app/` layout, SSR) — plain JS, no TS/Tailwind
- One global stylesheet: [app/assets/css/main.css](app/assets/css/main.css)
- **GSAP** via [useGSAP()](app/composables/useGSAP.js) + **Lenis** smooth scroll
- **Sanity** client in [useSanity.js](app/composables/useSanity.js) (GROQ, SSR-safe)

## Fluid scaling — the one rule

Everything is sized in **`em`**; one root font-size scales with the viewport so
every `em` tracks the 1440 Figma frame 1:1 (px ÷ 16 = em).

> ⚠️ **em-trap:** dimensional `em` values (width/height/gap/margin) must live on
> elements that stay at the **base 16px** font-size. Put `t-*` font-size classes
> only on **leaf text** elements — never on a container that also carries `em`
> dimensions, or the `em` resolves against the larger font (e.g. a `37.9375em`
> width on a 40px element becomes 1517px, not 607px).

## Sections

`app/pages/index.vue` composes: `HpHero` → `HpIntro` → `HpPortfolio` →
`HpIndustries` → `HpContact`, with `AppNav` / `AppFooter` in the layout.
Designer annotations from the Figma (blue handwriting, "Good Focal Point", etc.)
are intentionally **not** part of the build.

## Things to finish

### 1. Fonts (licensed — currently falling back)

The design uses **Neue Montreal** + **Aeonik Mono** (Pangram Pangram, commercial).
Drop the licensed files into `public/fonts/` to activate them and clear the
dev 404 warnings:

```
public/fonts/NeueMontreal-Regular.woff2
public/fonts/NeueMontreal-Medium.woff2
public/fonts/AeonikMono-Regular.woff2
```

Until then the fallback stack (`Helvetica Neue`/system mono) renders — which is
why the hero line wraps and "My portfolio" is wider than in Figma; the real
fonts are narrower and resolve both.

### 2. Placeholder images

The hero portrait and the footer photo are **blank image placeholders in the
Figma** (they don't export), so they're CSS gradient placeholders for now —
single swap points:

- Hero: `.hero__bg` in main.css (or uncomment the `<img>` in `HpHero.vue`)
- Footer: `.footer__photo-frame` (or uncomment the `<img>` in `AppFooter.vue`)

Project thumbnails (ClickGuard, Amuse Bouche, MEO phone) are the real exported
assets in `public/img/`.

### 3. Sanity CMS

Portfolio data is hardcoded in `HpPortfolio.vue` but shaped to match the schema
in [sanity/schemas/project.js](sanity/schemas/project.js). To go live:

1. `cp .env.example .env` and fill `SANITY_PROJECT_ID` / `SANITY_DATASET`
2. Init a Studio (e.g. in `/studio`) using `sanity/schemas/`
3. In `index.vue`, run the GROQ query (commented example included) and pass the
   result: `<HpPortfolio :projects="projects" />`

## Build targets

This pass implements the **desktop (1440) breakpoint** only. The scaling system
in main.css already scaffolds the tablet/mobile tiers — add layout-shape
overrides (not font sizes) in the responsive block when those frames are ready.
