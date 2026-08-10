<script setup>
// About reads the aboutPage singleton; each field falls back to its Figma copy.
// Lazy on the client so the fetch never suspends the page transition.
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { ABOUT_PAGE } from '~/utils/sanityQueries'

const { data } = await useSanityQuery('aboutPage', ABOUT_PAGE, {}, { lazy: import.meta.client })
const cms = computed(() => data.value || {})

// CV fallback (title / [role, place — date]). The CMS shape is
// cvGroups[]{ title, entries[]{ label, meta } } — normalised to this below.
const FALLBACK_CV = [
  {
    title: 'Professional experience',
    rows: [
      ['Senior UX/UI Designer', 'duall®studio [2021 — Present]'],
      ['Senior UX/UI Designer', 'BYLD [2024 — Present]'],
      ['UX/UI Designer', 'duall®studio [2020 — 2021]'],
      ['Designer | 3D Designer', 'Opção Global [2019 — 2020]'],
      ['Product Designer', 'Modus Design [2015 — 2019]'],
      ['Researcher', 'Ideas Revolution [2015 — 2019]'],
    ],
  },
  {
    title: 'Education',
    rows: [
      ['UX/UI Design', 'Lisbon School of Design [2020]'],
      ['Masters in Product Design', 'IADE [2014 — 2016]'],
      ['Bachelor’s Degree in Design', 'IADE [2011 — 2015]'],
    ],
  },
  {
    title: 'Certificates',
    rows: [
      ['C1 advanced English | Written and spoken', '[2026]'],
      ['Master Typography & Layout', 'Oliver Gareis [2026]'],
      ['Building Better User Experiences with a Product Thinking Approach', 'Olha Uzhykova [2025]'],
      ['Create a Design System from scratch in Figma', 'Bruno Saez [2023]'],
      ['Make Design Systems People Want to Use', 'Dan Mall [2023]'],
      ['Impress everyone with a 3D particle scene with Blender and Three.js', 'Fabio Ottaviani [2022]'],
      ['Using motion design to animate with purpose and create delightful experiences', 'Louis Paquet [2022]'],
      ['Creating Epic Ecommerce Experiences for Brands: An Advanced Guide', 'Bruno Arizio [2021]'],
      ['Design meaningful experiences through an animation system', 'Louis Ansa [2021]'],
    ],
  },
  {
    title: 'Awards',
    rows: [
      ['Top 2 UX Designer', 'Clube Criativos de Portugal [2023]'],
      ['Top 7 UX Designer', 'Clube Criativos de Portugal [2021]'],
      ['Top 9 UI Designer', 'Clube Criativos de Portugal [2021]'],
      ['Special Kudos | Clickguard', 'CSS Design Awards [5 Oct 2025]'],
      ['Special Kudos | The Land Group', 'CSS Design Awards [23 Apr 2024]'],
      ['Special Kudos | Software Angels', 'CSS Design Awards [18 Apr 2023]'],
      ['Special Kudos | Rocco', 'CSS Design Awards [3 Sep 2022]'],
      ['Special Kudos | PG Arquitetos', 'CSS Design Awards [11 Apr 2022]'],
      ['Honorable Mentions | PG Arquitetos', 'awwwards [08 Mar 2022]'],
      ['Website of the day | Specialist Ceramics', 'CSS Design Awards [18 Nov 2021]'],
      ['UI Design Award | Specialist Ceramics', 'CSS Design Awards [18 Nov 2021]'],
      ['UX Design Award | Specialist Ceramics', 'CSS Design Awards [18 Nov 2021]'],
      ['Innovation Design Award | Specialist Ceramics', 'CSS Design Awards [18 Nov 2021]'],
      ['Honorable Mentions | Specialist Ceramics', 'awwwards [29 Oct 2021]'],
      ['Mobile Excellence | Specialist Ceramics', 'awwwards [29 Oct 2021]'],
      ['FWA of the Day | Amuse Bouche', 'FWA [22 Aug 2021]'],
      ['Site of the day | Amuse Bouche', 'awwwards [15 Aug 2021]'],
      ['Developer Award | Amuse Bouche', 'awwwards [15 Aug 2021]'],
      ['Website of the day | Amuse Bouche', 'CSS Design Awards [13 Jul 2021]'],
      ['UI Design Award | Amuse Bouche', 'CSS Design Awards [13 Jul 2021]'],
      ['UX Design Award | Amuse Bouche', 'CSS Design Awards [13 Jul 2021]'],
      ['Innovation Design Award | Amuse Bouche', 'CSS Design Awards [13 Jul 2021]'],
      ['Mobile Excellence | Amuse Bouche', 'awwwards [12 Jul 2021]'],
      ['Honorable Mentions | Design for investment', 'awwwards [14 Jan 2021]'],
      ['Mobile Excellence | Design for investment', 'awwwards [14 Jan 2021]'],
    ],
  },
]

const introLede = computed(
  () =>
    cms.value.introLede ||
    'I’m a UX/UI designer focused on intentional design decisions rooted in psychology and perception.',
)
const bioTitle = computed(
  () => cms.value.bioTitle || 'I lead digital experiences across platforms, products, and institutional systems.',
)
const bioLead = computed(
  () =>
    cms.value.bioLead ||
    'Senior UX/UI designer recognized among the top designers by Clube da Criatividade de Portugal.',
)
const bioBody = computed(
  () =>
    cms.value.bioBody ||
    'At duall studio I play a central role within the design team, acting as lead designer to shape creative directions and ensure clarity and consistency across projects. I have experience in strategic decision-making, end-to-end project management, and direct communication with national and international clients. I am also responsible for presenting proposals, aligning strategy, and guiding projects from initial concept through to production.',
)
const portrait = computed(() => cms.value.portrait || '/img/about_img.jpg')
const portraitCaption = computed(() => cms.value.portraitCaption || 'If awards are your thing check them out bellow')
const quoteText = computed(
  () =>
    cms.value.quoteText ||
    'Indifference to people and the reality in which they live is actually the only true deadly sin in design.',
)
const quoteAttribution = computed(() => cms.value.quoteAttribution || 'Dieter Rams')
const cv = computed(() => {
  const groups = cms.value.cvGroups
  if (groups?.length) {
    return groups.map((g) => ({ title: g.title, rows: (g.entries || []).map((e) => [e.label, e.meta]) }))
  }
  return FALLBACK_CV
})

// === Awards cursor trail (MWG 020) ==========================
// Moving the cursor over the Awards list leaves a trail of certificates:
// every `resetDist` px of travel one spawns at the cursor, pops in with an
// elastic bounce, drifts along the movement direction and shrinks away.
// Port of mwg_020/assets/script.js; the award→certificate map below is kept
// as documentation of which file belongs to which award — the trail cycles
// through the unique certificates in awards-list order.
const AWARD_IMAGES = {
  'top 2 ux designer': '/img/CCP_2023.jpg',
  'top 7 ux designer': '/img/CCP_2021.jpg',
  'top 9 ui designer': '/img/CCP_2021.jpg',
  'special kudos | clickguard': '/img/CSS_Kudos_ClickGuard.jpg',
  'special kudos | the land group': '/img/CSS_Kudos_TLG.jpg',
  'special kudos | software angels': '/img/CSS_Kudos_Software.jpg',
  'special kudos | rocco': '/img/CSS_Kudos_Rocco.jpg',
  'special kudos | pg arquitetos': '/img/CSS_Kudos_PG.jpg',
  'honorable mentions | pg arquitetos': '/img/Awwwards_honors_PG.jpg',
  'website of the day | specialist ceramics': '/img/CSS_WSOTD_Specialist.jpg',
  'ui design award | specialist ceramics': '/img/CSS_UI_Specialist.jpg',
  'ux design award | specialist ceramics': '/img/CSS_UX_Specialist.jpg',
  'innovation design award | specialist ceramics': '/img/CSS_Inovation_Specialist.jpg',
  'honorable mentions | specialist ceramics': '/img/Awwwards_honors_Specialist.jpg',
  'mobile excellence | specialist ceramics': '/img/Awwwards_Mobile_Specialist.jpg',
  'mobile excelence | specialist ceramics': '/img/Awwwards_Mobile_Specialist.jpg',
  'fwa of the day | amuse bouche': '/img/FWA_FWAOTD_Amuse.jpg',
  'site of the day | amuse bouche': '/img/Awwwards_SOD_Amuse.jpg',
  'developer award | amuse bouche': '/img/Awwwards_DEV_Amuse.jpg',
  'website of the day | amuse bouche': '/img/CSS_WSOTD_Amuse.jpg',
  'ui design award | amuse bouche': '/img/CSS_UI_Amuse.jpg',
  'ux design award | amuse bouche': '/img/CSS_UX_Amuse.jpg',
  'innovation design award | amuse bouche': '/img/CSS_Inovation_Amuse.jpg',
  'mobile excellence | amuse bouche': '/img/Awwwards_Mobile_Amuse.jpg',
  'honorable mentions | design for investment': '/img/Awwwards_honors_D4I.jpg',
  'mobile excellence | design for investment': '/img/Awwwards_Mobile_D4I.jpg',
}
const AWARD_CERTIFICATES = [...new Set(Object.values(AWARD_IMAGES))]

const isAwardsGroup = (group) => /award/i.test(group.title || '')

const cvSection = useTemplateRef('cvSection')
let mm = null

onMounted(() => {
  const { gsap } = useGSAP()
  mm = gsap.matchMedia()

  // Desktop pointer devices only, like the preview this replaces — touch has
  // no cursor to trail, and reduced-motion gets no effect at all.
  mm.add('(min-width: 992px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const root = cvSection.value
    if (!root) return

    // — MWG 020 state (mwg_020/assets/script.js, ported) —
    let incr = 0
    let oldIncrX = 0
    let oldIncrY = 0
    let started = false
    const resetDist = window.innerWidth / 8
    let indexImg = 0
    const live = new Set() // in-flight images, so unmount can clear them

    // Two trigger zones, one rule: certificates never sit on the text.
    // — Over the awards LIST (right-hand column): spawns shift 52em LEFT so
    //   the trail shadows the cursor in the empty half of the section
    //   (list x ≈ 55.8–88.3em → spawns land at ≈ 3.8–36.3em).
    // — Over the OPEN SPACE left of the column: spawns follow the cursor
    //   directly, clamped so a certificate can't reach the column edge.
    const emPx = parseFloat(getComputedStyle(root).fontSize) || 16
    const offsetX = 52 * emPx
    const imgW = 10.625 * emPx
    const imgH = 14.625 * emPx

    function createMedia(x, y, deltaX, deltaY) {
      // We create an image and set its url with the current item of the images array
      const image = document.createElement('img')
      image.setAttribute('src', AWARD_CERTIFICATES[indexImg])
      image.className = 'about__award-trail'
      image.setAttribute('aria-hidden', 'true')

      // We add this image to the DOM
      root.appendChild(image)

      const entry = { image }
      live.add(entry)

      const tl = gsap.timeline({
        onComplete: () => {
          // when our timeline is finished, we remove our image from the DOM
          image.remove()
          live.delete(entry)
          tl && tl.kill()
        },
      })
      entry.tl = tl

      tl.fromTo(image, {
        // Add some randomness
        xPercent: -50 + (Math.random() - 0.5) * 80,
        yPercent: -50 + (Math.random() - 0.5) * 10,
        scaleX: 1.3,
        scaleY: 1.3,
      }, {
        scaleX: 1,
        scaleY: 1,
        ease: 'elastic.out(2, 0.6)', // Easing property responsible of the rebound effect
        duration: 0.6,
      })

      tl.fromTo(image, {
        // The first and second parameters are x and y (cursor position)
        // We set the image at the current cursor position
        x,
        y,
        rotation: (Math.random() - 0.5) * 20,
      }, {
        // We add deltaX and deltaY (the third and fourth parameters of the function)
        x: '+=' + deltaX * 4,
        y: '+=' + deltaY * 4,
        rotation: (Math.random() - 0.5) * 20,
        ease: 'power4.out',
        duration: 1.5,
      }, '<') // Means that the animation starts at the start of the previous tween

      tl.to(image, {
        duration: 0.3,
        scale: 0.5, // Reduce the image later
        delay: 0.1,
        ease: 'back.in(1.5)',
      })

      // Loop back to the first item when we're out of range in our images array
      indexImg = (indexImg + 1) % AWARD_CERTIFICATES.length
    }

    // Integration seams vs the original: coords are tracked across the whole
    // CV section (so deltas stay continuous around the list), but distance only
    // accumulates — and images only spawn — over the Awards list itself. The
    // original's root sat at the viewport origin; ours doesn't, so x also
    // subtracts the section's left edge. Delegated on the section so the rows
    // survive the fallback→CMS re-render.
    const onEnter = (e) => {
      // Re-entering the section: resync so the first in-zone delta isn't a jump.
      oldIncrX = e.clientX
      oldIncrY = e.clientY
      started = true
    }

    const onMove = (e) => {
      const valX = e.clientX
      const valY = e.clientY
      if (!started) {
        started = true
        oldIncrX = valX
        oldIncrY = valY
        return
      }

      // Zones: the awards list, or the open space anywhere left of the CV
      // column (target = the section itself — the column swallows the rest).
      const overList = !!e.target.closest('[data-award-list]')
      const overOpen = !overList && !e.target.closest('.about__cv-col')

      if (overList || overOpen) {
        // Add the distance traveled on x + y
        incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY)

        if (incr > resetDist) {
          incr = 0 // Reset the variable incr
          const bounds = root.getBoundingClientRect()
          const col = root.querySelector('.about__cv-col')
          // Right-most point a certificate may ever reach (spawn OR drift):
          // one image-width short of the column, covering the xPercent scatter.
          const maxEndX = col ? col.getBoundingClientRect().left - bounds.left - imgW : Infinity
          let x = valX - bounds.left
          let dX = valX - oldIncrX
          if (overList) x -= offsetX
          else x = Math.min(x, maxEndX)
          // A hard rightward flick drifts +dX×4 — cap it at the column edge.
          if (x + dX * 4 > maxEndX) dX = (maxEndX - x) / 4
          // Same vertically: the section clips the trail (overflow: hidden),
          // so keep spawn AND drift inside it — 0.7×imgH covers the yPercent
          // scatter and the 1.3 elastic pop, so a certificate is never cut
          // by the section's top or bottom edge.
          const minY = imgH * 0.75
          const maxY = bounds.height - imgH * 0.75
          let y = Math.max(minY, Math.min(valY - bounds.top, maxY))
          let dY = valY - oldIncrY
          if (y + dY * 4 > maxY) dY = (maxY - y) / 4
          if (y + dY * 4 < minY) dY = (minY - y) / 4
          createMedia(x, y, dX, dY)
        }
      }

      // Reset after calculation to add the new delta on the next call
      oldIncrX = valX
      oldIncrY = valY
    }

    root.addEventListener('mouseenter', onEnter)
    root.addEventListener('mousemove', onMove)
    return () => {
      root.removeEventListener('mouseenter', onEnter)
      root.removeEventListener('mousemove', onMove)
      live.forEach(({ tl, image }) => {
        tl?.kill()
        image.remove()
      })
      live.clear()
    }
  })
})
onBeforeUnmount(() => mm?.revert())

useSeo({
  title: () => cms.value.seo?.metaTitle || 'About',
  description: () =>
    cms.value.seo?.metaDescription ||
    'Pedro Borges — a UX/UI designer focused on intentional design decisions rooted in psychology and perception.',
  image: () => cms.value.seo?.ogImage,
})
</script>

<template>
  <div class="about">
    <!-- Intro -->
    <section class="about__intro container" data-theme-section="light">
      <h1 class="about__lede">{{ introLede }}</h1>
      <AbAnnotations />
    </section>

    <!-- Lead / bio -->
    <section class="about__lead container" data-theme-section="light">
      <!-- Legend first: it sits in the section's top padding, above the
           portrait and the copy (see .anno__note--ab-legend in main.css). -->
      <AbLegend />

      <figure class="about__aside">
        <div class="about__photo about__photo--portrait">
          <img :src="portrait" alt="Pedro Borges" />
        </div>
        <figcaption class="about__aside-cap">
          <span>{{ portraitCaption }}</span>
          <IconArrowDown class="about__aside-arrow" />
        </figcaption>
      </figure>

      <div class="about__bio">
        <h2 class="about__bio-title">{{ bioTitle }}</h2>
        <div class="about__bio-text">
          <p class="about__bio-lead">{{ bioLead }}</p>
          <p class="about__bio-body">{{ bioBody }}</p>
        </div>
      </div>
      <AbBioAnnotations />
    </section>

    <!-- Quote -->
    <section class="about__quote container" data-theme-section="light">
      <blockquote class="about__quote-inner">
        <IconQuote class="about__quote-mark" />
        <p class="about__quote-text">
          {{ quoteText }}
          <br />— {{ quoteAttribution }}
        </p>
      </blockquote>
    </section>

    <!-- CV -->
    <section ref="cvSection" class="about__cv container" data-theme-section="light">
      <div class="about__cv-col">
        <div v-for="group in cv" :key="group.title" class="about__cv-group">
          <h3 class="about__cv-heading">{{ group.title }}</h3>
          <ul class="about__cv-list" :data-award-list="isAwardsGroup(group) ? '' : undefined">
            <li v-for="(row, i) in group.rows" :key="i" class="about__cv-row">
              <span class="about__cv-role">{{ row[0] }}</span>
              <span class="about__cv-meta">{{ row[1] }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Hidden preload stack (the resource's `.medias` pattern) so a trail
           certificate never pops in half-loaded on its first appearance. -->
      <div class="about__award-medias" aria-hidden="true">
        <img v-for="src in AWARD_CERTIFICATES" :key="src" :src="src" alt="" loading="lazy" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* === ABOUT (Figma 1440 frame; px ÷ 16 = em) ===============
   Sized in em so it re-scales through the global tablet/mobile tiers; the
   media queries below only change layout shape. */

/* Intro — large centred lede */
.about__intro {
  position: relative;               /* positioning context for the annotation layer */
  padding-top: 10.5em;              /* 168 */
  padding-bottom: 7.5em;            /* 120 */
  text-align: center;
}
.about__lede {
  max-width: 74.6875em;             /* 1195 */
  margin: 0 auto;
  font-size: 5em;                   /* 80px */
  line-height: 1.1;
}

/* Lead / bio — portrait aside left, copy right */
.about__lead {
  position: relative;               /* positioning context for the annotation layer */
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 3em;
  padding: 7.5em 1.5em 5em;         /* 120 / 24 / 80 */
}
.about__aside {
  flex-shrink: 0;
  width: 10.6875em;                 /* 171 */
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6875em;                    /* 11 */
}
.about__photo {
  border-radius: 0.25em;
  overflow: hidden;
  background: linear-gradient(135deg, #c9c4ba 0%, #b6b1a6 100%);
}
.about__photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.about__photo--portrait { height: 14.9375em; } /* 239 */
.about__aside-cap {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.6875em;             /* 11 */
  line-height: 1.3;
}
.about__aside-arrow { flex-shrink: 0; width: 3.25em; height: 1.125em; } /* 52 × 18 */

.about__bio {
  width: 32.5em;                    /* 520 */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 5em;                         /* 80 */
}
.about__bio-title { font-size: 2.5em; line-height: 1.1; }   /* 40 */
.about__bio-text { display: flex; flex-direction: column; gap: 1.5em; } /* 24 */
.about__bio-lead { font-size: 1.5em; line-height: 1.2; }    /* 24 */
.about__bio-body { font-size: 1em; line-height: 1.4; opacity: 0.4; } /* 16 */

/* Quote */
.about__quote { padding: 5em 1.5em; }
.about__quote-inner {
  margin: 0;
  max-width: 54.3125em;            /* 869 */
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}
/* Same mark as the work page's blockquote (IconQuote, 29 × 25). */
.about__quote-mark { width: 1.8125em; height: auto; color: var(--color-ink); }
.about__quote-text { font-size: 2.5em; line-height: 1.2; } /* 40 */

/* CV — right-aligned column with the awards preview floating to its left */
.about__cv {
  position: relative;               /* positioning context for the trail */
  overflow: hidden;                 /* clip trail images at the section edge */
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.25em;
  padding: 5em 1.5em 7.5em;         /* 80 / 24 / 120 */
}
/* Awards cursor trail (MWG 020) — certificates spawned at the cursor by JS
   while moving over the Awards list. Same 170 × 234 footprint as the old
   preview; clipped to the section like the resource clips to its root.
   :deep() because the imgs are createElement'd (no scoped attribute). */
.about__cv :deep(.about__award-trail) {
  position: absolute;
  top: 0;
  left: 0;
  width: 10.625em;                  /* 170 */
  height: 14.625em;                 /* 234 */
  object-fit: cover;
  border-radius: 0.25em;
  pointer-events: none;             /* never block the rows or steal the move */
  will-change: transform;
  z-index: 5;
}

/* Hidden preload stack — the resource's `.medias` pattern. */
.about__award-medias img {
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}
.about__cv-col {
  flex-shrink: 0;
  width: 32.4375em;                 /* 519 */
  display: flex;
  flex-direction: column;
  gap: 5em;                         /* 80 */
}
.about__cv-group {
  border-top: 1px solid var(--color-line);
  padding: 1em 0;                   /* 16 */
  display: flex;
  flex-direction: column;
  gap: 2em;                         /* 32 */
}
.about__cv-heading { font-size: 1.5em; line-height: 1.1; } /* 24 */
.about__cv-list { display: flex; flex-direction: column; gap: 1em; } /* 16 */
.about__cv-row { display: flex; align-items: center; gap: 0.25em; }
.about__cv-role { flex: 1 0 0; min-width: 0; line-height: 1.2; }
.about__cv-meta {
  /* Design (15324-4548): the meta is ALWAYS one line — a long ROLE wraps
     instead (meta stays vertically centred via the row's align-items). A fixed
     170px box wrapped the longer Awards metas mid-date at every breakpoint. */
  flex-shrink: 0;
  white-space: nowrap;
  text-align: right;
  font-size: 0.6875em;             /* 11 */
  opacity: 0.6;
}

/* === TABLET (≤991px) — stack the CV image out, keep two columns ===== */
@media (max-width: 991px) {
  .about__lede { font-size: 3.75em; }      /* 60px */
  .about__cv :deep(.about__award-trail) { display: none; }
  .about__bio { width: 32.5em; }
  .about__quote-mark { width: 1.5em; }     /* 24 — matches the work page */
}

/* === MOBILE (≤479px) — single column ============================== */
@media (max-width: 479px) {
  .about__intro { padding-top: 8em; padding-bottom: 5em; }
  .about__lede { font-size: 2.5em; }       /* 40px */
  .about__quote-text { font-size: 1.5em; } /* 24px — matches the work page */

  .about__lead { flex-direction: column; gap: 2.5em; padding: 5em 1em; }
  .about__aside { width: 100%; }
  /* Full-width at the photo's own portrait ratio (342×478 design asset) —
     a fixed landscape-shaped box cover-cropped it into a weird sliver. */
  .about__photo--portrait { height: auto; aspect-ratio: 342 / 478; }
  .about__bio { width: 100%; gap: 2.5em; }

  .about__quote { padding: 3em 1em; }

  .about__cv { padding: 3em 1em 5em; }
  .about__cv-col { width: 100%; }
}
</style>
