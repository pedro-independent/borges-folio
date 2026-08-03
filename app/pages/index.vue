<script setup>
// Home reads the homePage singleton; each Hp* section falls back to its Figma
// copy when a field is empty. Lazy on the client so the fetch never suspends the
// page transition (see useSanity.js). The portfolio showcase renders the doc's
// curated portfolioProjects (each card links to its case study).
import { HOME_PAGE } from '~/utils/sanityQueries'

const { data } = await useSanityQuery('homePage', HOME_PAGE, {}, { lazy: import.meta.client })
const cms = computed(() => data.value || {})

useSeo({
  title: () => cms.value.seo?.metaTitle || '',
  description: () =>
    cms.value.seo?.metaDescription ||
    'Pedro Borges — an awarded designer specialized in psychology-driven design decisions. A selection of UX/UI projects across multiple industries.',
  image: () => cms.value.seo?.ogImage,
})
</script>

<template>
  <div>
    <HpHero :heading="cms.heroHeading" :paragraph="cms.heroParagraph" />
    <HpIntro :text="cms.introText" />
    <!-- Shared stage: the portfolio parks (sticky) when the industries block
         latches, and this wrapper's containment un-parks it once the
         industries runway ends — see .home__stage rules in main.css. -->
    <div class="home__stage">
      <HpPortfolio :title="cms.portfolioTitle" :cta="cms.portfolioCta" :projects="cms.portfolioProjects" />
      <HpIndustries
        :industries="cms.industries"
        :left-label="cms.industriesLeftLabel"
        :right-label="cms.industriesRightLabel"
      />
    </div>
    <HpContact :label="cms.contactLabel" :heading="cms.contactHeading" :cta="cms.contactCta" />
  </div>
</template>
