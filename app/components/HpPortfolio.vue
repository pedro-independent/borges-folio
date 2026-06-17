<script setup>
import { computed } from 'vue'

// The home portfolio is a bespoke showcase (phone mockups, specific imagery) that
// doesn't map to the generic project-card model, so `projects` stays hardcoded.
// Only the section title + CTA come from the homePage CMS doc.
const props = defineProps({
  title: { type: String, default: null },
  cta: { type: Object, default: null },
  projects: {
    type: Array,
    default: () => [
      {
        title: 'Nova – Executive Education',
        subtitle: 'Executive Education Platform',
        role: 'Lead UX/UI Designer',
        media: { type: 'blank' },
      },
      {
        title: 'MEO Beachcam',
        subtitle: 'Medical cannabis healthcare provider platform',
        role: 'Lead UX/UI Designer',
        media: { type: 'phone', screen: '/img/meo-screen.png', frame: '/img/meo-phone.png' },
      },
      {
        title: 'ClickGuard',
        subtitle: 'B2B SaaS Conversion focused website',
        role: 'Lead UX/UI Designer',
        media: { type: 'image', src: '/img/project-clickguard.png' },
      },
      {
        title: 'Amuse Bouche',
        subtitle: 'Award-winning marketing consultant agency website',
        role: 'UX/UI Designer',
        media: { type: 'image', src: '/img/project-amusebouche.png', bg: 'lavender' },
      },
    ],
  },
})

const title = computed(() => props.title || 'My portfolio')
const cta = computed(() => props.cta || { label: 'View more projects', href: '#work' })

// Even rows: media left of centre, text right. Odd rows: text left, media right.
const textRight = (i) => i % 2 === 0
</script>

<template>
  <section id="work" class="portfolio container" data-theme-section="light">
    <h2 class="portfolio__title"><span class="t-display-xl">{{ title }}</span></h2>

    <div class="portfolio__rows">
      <article v-for="(p, i) in props.projects" :key="p.title" class="project">
        <!-- spacer first when text is on the right -->
        <div v-if="textRight(i)" class="project__spacer" />

        <!-- text on the left -->
        <div v-else class="project__meta">
          <p class="project__name t-base">{{ p.title }}</p>
          <p class="project__desc t-base">{{ p.subtitle }}</p>
          <p class="project__role t-mono">{{ p.role }}</p>
        </div>

        <!-- media card -->
        <div
          class="project__media"
          :class="{
            'project__media--blank': p.media.type === 'blank',
            'project__media--lavender': p.media.bg === 'lavender' || p.media.type === 'phone',
          }"
        >
          <img v-if="p.media.type === 'image'" :src="p.media.src" :alt="p.title" />

          <div v-else-if="p.media.type === 'phone'" class="project__phone">
            <div class="project__phone-inner">
              <div class="project__phone-screen"><img :src="p.media.screen" alt="" /></div>
              <img class="project__phone-frame" :src="p.media.frame" alt="" />
            </div>
          </div>
        </div>

        <!-- text on the right -->
        <div v-if="textRight(i)" class="project__meta">
          <p class="project__name t-base">{{ p.title }}</p>
          <p class="project__desc t-base">{{ p.subtitle }}</p>
          <p class="project__role t-mono">{{ p.role }}</p>
        </div>

        <!-- spacer last when text is on the left -->
        <div v-else class="project__spacer" />
      </article>
    </div>

    <div class="portfolio__cta">
      <AppButton class="btn btn--dark" :href="cta.href" :label="cta.label" />
    </div>

    <HpPortfolioAnnotations class="anno--portfolio" />
  </section>
</template>
