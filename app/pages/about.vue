<script setup>
// About reads the aboutPage singleton; each field falls back to its Figma copy.
// Lazy on the client so the fetch never suspends the page transition.
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
      ['Honorable Mentions | Specialist Ceramics', 'awwwards [8 Mar 2022]'],
      ['Special Kudos | PG Arquitetos', 'CSS Design Awards [11 Apr 2022]'],
      ['Website of the day | Specialist Ceramics', 'CSS Design Awards [18 Nov 2021]'],
      ['Honorable Mentions | PG Arquitetos', 'awwwards [29 Oct 2021]'],
      ['Site of the day | Amouse Bouche', 'awwwards [15 Aug 2021]'],
      ['Website of the day | Amouse Bouche', 'CSS Design Awards [13 Jul 2021]'],
      ['Honorable Mentions | Design for investment', 'awwwards [14 Jan 2021]'],
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
const portrait = computed(() => cms.value.portrait || '/img/about-portrait.png')
const portraitCaption = computed(() => cms.value.portraitCaption || 'If awards are your thing check them out bellow')
const awardsImage = computed(() => cms.value.awardsImage || '/img/about-awards.jpg')
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

useSeoMeta({
  title: () => cms.value.seo?.metaTitle || 'About',
  description: () =>
    cms.value.seo?.metaDescription ||
    'Pedro Borges — a UX/UI designer focused on intentional design decisions rooted in psychology and perception.',
})
</script>

<template>
  <div class="about">
    <!-- Intro -->
    <section class="about__intro container" data-theme-section="light">
      <h1 class="about__lede">{{ introLede }}</h1>
    </section>

    <!-- Lead / bio -->
    <section class="about__lead container" data-theme-section="light">
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
    </section>

    <!-- Quote -->
    <section class="about__quote container" data-theme-section="light">
      <blockquote class="about__quote-inner">
        <span class="about__quote-mark" aria-hidden="true">“</span>
        <p class="about__quote-text">
          {{ quoteText }}
          <br />— {{ quoteAttribution }}
        </p>
      </blockquote>
    </section>

    <!-- CV -->
    <section class="about__cv container" data-theme-section="light">
      <div class="about__cv-media">
        <img :src="awardsImage" alt="" />
      </div>

      <div class="about__cv-col">
        <div v-for="group in cv" :key="group.title" class="about__cv-group">
          <h3 class="about__cv-heading">{{ group.title }}</h3>
          <ul class="about__cv-list">
            <li v-for="(row, i) in group.rows" :key="i" class="about__cv-row">
              <span class="about__cv-role">{{ row[0] }}</span>
              <span class="about__cv-meta">{{ row[1] }}</span>
            </li>
          </ul>
        </div>
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
.about__quote-mark {
  font-size: 2.5em;
  line-height: 0.5;
  color: var(--color-accent);
}
.about__quote-text { font-size: 2.5em; line-height: 1.2; } /* 40 */

/* CV — right-aligned column with a decorative image to its left */
.about__cv {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.25em;
  padding: 5em 1.5em 7.5em;         /* 80 / 24 / 120 */
}
.about__cv-media {
  flex-shrink: 0;
  width: 10.625em;                  /* 170 */
  height: 14.625em;                 /* 234 */
  border-radius: 0.25em;
  overflow: hidden;
  margin-bottom: 7.5em;             /* lift it up beside the Awards block */
}
.about__cv-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
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
  flex-shrink: 0;
  width: 10.625em;                  /* 170 */
  text-align: right;
  font-size: 0.6875em;             /* 11 */
  opacity: 0.6;
}

/* === TABLET (≤991px) — stack the CV image out, keep two columns ===== */
@media (max-width: 991px) {
  .about__lede { font-size: 3.75em; }      /* 60px */
  .about__cv-media { display: none; }
  .about__bio { width: 32.5em; }
}

/* === MOBILE (≤479px) — single column ============================== */
@media (max-width: 479px) {
  .about__intro { padding-top: 8em; padding-bottom: 5em; }
  .about__lede { font-size: 2.5em; }       /* 40px */

  .about__lead { flex-direction: column; gap: 2.5em; padding: 5em 1em; }
  .about__aside { width: 100%; }
  .about__photo--portrait { height: 20em; }
  .about__bio { width: 100%; gap: 2.5em; }

  .about__quote { padding: 3em 1em; }

  .about__cv { padding: 3em 1em 5em; }
  .about__cv-col { width: 100%; }
}
</style>
