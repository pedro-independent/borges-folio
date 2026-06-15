<script setup>
useSeoMeta({
  title: 'Work',
  description:
    'Selected work by Pedro Borges — UX/UI design for SaaS, healthcare, and brand platforms, including award-winning projects.',
})

// Each entry mirrors a future Sanity `project` document so the client can manage
// these from the CMS. `slug` links to the project template page (/work/[slug]);
// covers are CMS-bound, so for now each card uses a placeholder tint. `awards`
// (count) renders the blue badge; `comingSoon` the muted one. Published cards
// (not comingSoon) link to their case study.
const awardLabel = (n) => `${n} award${n > 1 ? 's' : ''}`
// Published cards link to their case study; coming-soon ones stay plain <article>.
// resolveComponent is needed so `<component :is>` renders a real <a>, not a
// literal <nuxtlink> element.
const NuxtLink = resolveComponent('NuxtLink')
const cardIs = (p) => (p.comingSoon ? 'article' : NuxtLink)
const cardTo = (p) => (p.comingSoon ? undefined : `/work/${p.slug}`)

// Highlight reel — the first item gets the large hero treatment.
const featured = [
  { title: 'ClickGuard', desc: 'B2B SaaS conversion-focused website', awards: 1, slug: 'clickguard', tint: '#cdb8f2' },
  { title: 'Leafwell', desc: 'Medical cannabis healthcare provider platform', slug: 'leafwell', tint: '#d8e0ea' },
  { title: 'Amuse Bouche', desc: 'Award-winning marketing consultant agency website', awards: 2, slug: 'amuse-bouche', tint: '#e7ddca' },
]

// Main project grid.
const grid = [
  { title: 'ClickGuard', desc: 'B2B SaaS conversion-focused website', awards: 1, slug: 'clickguard', tint: '#cdb8f2' },
  { title: 'Plen Advogados', desc: 'Law firm brand & website', comingSoon: true, slug: 'plen-advogados', tint: '#d8e0ea' },
  { title: 'Opterion', desc: 'Fintech dashboard product design', comingSoon: true, slug: 'opterion', tint: '#e7ddca' },
  { title: 'Omniscience', desc: 'AI analytics marketing site', comingSoon: true, slug: 'omniscience', tint: '#d3ddd5' },
  { title: 'Nova | Mentorship', desc: 'Executive education platform', comingSoon: true, slug: 'nova-mentorship', tint: '#ecd9c6' },
  { title: 'Aruki', desc: 'E-commerce storefront & product system', comingSoon: true, slug: 'aruki', tint: '#d3d6e8' },
  { title: 'Insider', desc: 'Membership community platform', comingSoon: true, slug: 'insider', tint: '#e3d2d2' },
  { title: 'Woods', desc: 'Outdoor brand editorial website', comingSoon: true, slug: 'woods', tint: '#cdd9cf' },
]

// Older work, grouped by year.
const archive = [
  {
    year: '2024',
    items: [
      { title: 'Nexa', desc: 'B2B SaaS conversion-focused website', awards: 2, slug: 'nexa' },
      { title: 'Rocco', desc: 'Restaurant brand & booking experience', awards: 1, slug: 'rocco' },
      { title: 'Software Angels', desc: 'Software studio portfolio', awards: 1, slug: 'software-angels' },
      { title: 'PG Arquitetos', desc: 'Architecture studio website', awards: 1, slug: 'pg-arquitetos' },
    ],
  },
  {
    year: '2023',
    items: [
      { title: 'The Land Group', desc: 'Real-estate investment platform', awards: 1, slug: 'the-land-group' },
      { title: 'Specialist Ceramics', desc: 'Industrial ceramics e-commerce', awards: 2, slug: 'specialist-ceramics' },
      { title: 'Design for Investment', desc: 'Financial advisory website', awards: 1, slug: 'design-for-investment' },
    ],
  },
]
</script>

<template>
  <div class="work">
    <h1 class="work__sr">Work</h1>

    <!-- Featured: one large card + a pair of smaller ones -->
    <section class="work__featured container" data-theme-section="light">
      <div class="work__featured-row">
        <component :is="cardIs(featured[0])" :to="cardTo(featured[0])" class="work__card work__card--hero">
          <span class="work__card-media" :style="{ background: featured[0].tint }" />
          <div class="work__card-info">
            <div class="work__card-head">
              <h2 class="work__card-title">{{ featured[0].title }}</h2>
              <span v-if="featured[0].awards" class="work__badge work__badge--award">{{ awardLabel(featured[0].awards) }}</span>
            </div>
            <p class="work__card-desc">{{ featured[0].desc }}</p>
          </div>
        </component>

        <div class="work__featured-pair">
          <component :is="cardIs(p)" :to="cardTo(p)" v-for="p in featured.slice(1)" :key="p.slug" class="work__card">
            <span class="work__card-media" :style="{ background: p.tint }" />
            <div class="work__card-info">
              <div class="work__card-head">
                <h2 class="work__card-title">{{ p.title }}</h2>
                <span v-if="p.awards" class="work__badge work__badge--award">{{ awardLabel(p.awards) }}</span>
              </div>
              <p class="work__card-desc">{{ p.desc }}</p>
            </div>
          </component>
        </div>
      </div>
    </section>

    <!-- Quote -->
    <section class="work__quote container" data-theme-section="light">
      <blockquote class="work__quote-inner">
        <IconQuote class="work__quote-mark" />
        <p class="work__quote-text">
          Design is a plan for arranging elements in such a way as best to accomplish a particular purpose.
          <br />— Charles Eames
        </p>
      </blockquote>
    </section>

    <!-- Project grid -->
    <section class="work__grid container" data-theme-section="light">
      <div class="work__grid-list">
        <component :is="cardIs(p)" :to="cardTo(p)" v-for="p in grid" :key="p.slug" class="work__card">
          <span class="work__card-media" :style="{ background: p.tint }" />
          <div class="work__card-info">
            <div class="work__card-head">
              <h2 class="work__card-title">{{ p.title }}</h2>
              <span v-if="p.awards" class="work__badge work__badge--award">{{ awardLabel(p.awards) }}</span>
              <span v-else-if="p.comingSoon" class="work__badge work__badge--soon">Coming soon</span>
            </div>
            <p class="work__card-desc">{{ p.desc }}</p>
          </div>
        </component>
      </div>
    </section>

    <!-- Archive list, grouped by year -->
    <section class="work__archive container" data-theme-section="light">
      <div v-for="group in archive" :key="group.year" class="work__archive-group">
        <div class="work__archive-year"><span>{{ group.year }}</span></div>
        <div class="work__archive-rows">
          <div v-for="row in group.items" :key="row.slug" class="work__archive-row">
            <span class="work__archive-name">{{ row.title }}</span>
            <span class="work__archive-desc">{{ row.desc }}</span>
            <span v-if="row.awards" class="work__badge work__badge--award">{{ awardLabel(row.awards) }}</span>
            <span v-else-if="row.comingSoon" class="work__badge work__badge--soon">Coming soon</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* === WORK (Figma 1440 frame; px ÷ 16 = em) ================
   Sized in em so it rides the global scaling tiers; media queries below only
   change layout shape. */
.work__sr {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0);
  white-space: nowrap; border: 0;
}

/* Shared project card */
.work__card { display: flex; flex-direction: column; gap: 1.5em; } /* 24 */
a.work__card:hover .work__card-title { color: var(--color-blue); } /* linked cards */
.work__card-media {
  display: block;
  width: 100%;
  aspect-ratio: 329.25 / 243;       /* same ratio across hero & grid */
  border-radius: 0.25em;            /* 4 */
  background: var(--color-lavender);
}
.work__card-info { display: flex; flex-direction: column; gap: 0.875em; } /* 14 */
.work__card-head { display: flex; align-items: flex-start; gap: 0.6875em; } /* 11 */
.work__card-title { flex: 1 0 0; min-width: 0; font-size: 1.5em; line-height: 1.1; transition: color 0.3s ease; } /* 24 */
.work__card-desc { font-size: 1em; line-height: 1.1; opacity: 0.4; } /* 16 */

/* Badges */
.work__badge {
  flex-shrink: 0;
  font-size: 0.6875em;              /* 11 */
  line-height: 1;
  padding: 0.4em 0.73em 0.5em;      /* ~4/8/5 */
  border-radius: 0.73em;            /* 8 */
  white-space: nowrap;
}
.work__badge--award {
  background: var(--color-blue);
  color: var(--color-off-white);
  text-transform: uppercase;
}
.work__badge--soon {
  background: var(--color-off-white);
  color: rgba(6, 6, 6, 0.4);        /* ink @ 40% — bg stays solid */
}

/* Featured */
.work__featured { padding-block: 7.5em 5em; } /* 120 / 80 — h-gutters from .container */
.work__featured-row { display: flex; align-items: flex-start; gap: 1.5em; }
.work__card--hero { flex: 1 0 0; min-width: 0; }
.work__card--hero .work__card-media { aspect-ratio: 682.5 / 504; }
.work__featured-pair { flex: 1 0 0; min-width: 0; display: flex; gap: 1.5em; }
.work__featured-pair .work__card { flex: 1 0 0; min-width: 0; }

/* Quote — right-shifted block */
.work__quote { padding-block: 5em; }
.work__quote-inner {
  margin: 0 0 0 auto;
  max-width: 54.3125em;             /* 869 */
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}
.work__quote-mark { width: 1.8125em; height: auto; color: var(--color-ink); } /* 29 × 25 */
.work__quote-text { font-size: 2.5em; line-height: 1.1; } /* 40 */

/* Grid */
.work__grid { padding-block: 5em; }
.work__grid-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5em; }

/* Archive */
.work__archive { padding-block: 5em; display: flex; flex-direction: column; gap: 0.625em; } /* 10 between year groups */
.work__archive-group {
  display: flex;
  gap: 4em;
  border-top: 1px solid var(--color-ink);
}
.work__archive-year { flex: 0 0 7em; padding: 1em 0; }
.work__archive-year span { font-size: 1.5em; line-height: 1; } /* 24 */
.work__archive-rows { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; }
.work__archive-row {
  display: grid;
  grid-template-columns: 17.3125em 1fr auto;  /* name / desc / badge */
  grid-template-areas: "name desc badge";
  align-items: center;
  gap: 2em;
  padding: 1em 0;
  border-top: 1px solid var(--color-ink);
}
.work__archive-row:first-child { border-top: 0; } /* group border is the first rule */
.work__archive-name { grid-area: name; font-size: 1.5em; line-height: 1.1; } /* 24 */
.work__archive-desc { grid-area: desc; font-size: 1em; line-height: 1.1; opacity: 0.4; } /* 16 */
.work__archive .work__badge { grid-area: badge; }

/* === TABLET (≤991px; Figma node 15324-4958) ====================== */
@media (max-width: 991px) {
  /* Featured keeps the hero + pair row, just narrower. */
  .work__grid-list { grid-template-columns: repeat(2, 1fr); }

  /* Quote: smaller (32px text, 24px mark) and less indented. */
  .work__quote-inner { max-width: 33.6875em; } /* 539 */
  .work__quote-text { font-size: 2em; }        /* 32 */
  .work__quote-mark { width: 1.5em; }          /* 24 */

  /* Archive: the year stacks above full-width rows (name / desc / badge,
     name & desc now equal width). */
  .work__archive-group { flex-direction: column; gap: 2em; }
  .work__archive-year { flex: none; padding: 1em 0; }
  .work__archive-row { grid-template-columns: 1fr 1fr auto; gap: 2.5em; }
  .work__archive-row:first-child { border-top: 1px solid var(--color-ink); } /* line under the year */
}

/* === MOBILE (≤479px; Figma node 15324-6670) ====================== */
@media (max-width: 479px) {
  /* Featured stacks: hero, then the pair, all full-width (extra top room
     under the fixed nav). */
  .work__featured { padding-block-start: 9em; }
  .work__featured-row { flex-direction: column; }
  .work__card--hero { width: 100%; }
  .work__featured-pair { width: 100%; flex-direction: column; }

  /* Quote: 24px, kept as an indented (right-aligned) block (mark keeps its 24px). */
  .work__quote-inner { max-width: 16.75em; gap: 1em; } /* 268 */
  .work__quote-text { font-size: 1.5em; } /* 24 */

  /* Grid: single column. */
  .work__grid-list { grid-template-columns: 1fr; }

  /* Archive: wider gap between year groups; each row = name + badge over desc.
     (Stacked year + 32px/16px rhythm carry over from the tablet rules.) */
  .work__archive { gap: 3em; }
  .work__archive-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "name badge"
      "desc desc";
    gap: 1em;
  }
}
</style>
